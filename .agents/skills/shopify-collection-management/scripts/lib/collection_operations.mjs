import {
  fail,
  isObject,
  optionalString,
  requireGid,
  requiredString,
  runShopifyOperation,
  throwOnUserErrors,
} from "./runtime.mjs"

export const SEARCH_COLLECTIONS_QUERY = `
query SearchCollections(
  $first: Int!
  $after: String
  $query: String
  $sortKey: CollectionSortKeys
  $reverse: Boolean!
) {
  collections(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
    nodes {
      id
      title
      handle
      descriptionHtml
      seo { title description }
      updatedAt
      sortOrder
      image { url altText }
      productsCount { count precision }
      ruleSet {
        appliedDisjunctively
        rules { column relation condition }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}`.trim()

export const GET_COLLECTION_QUERY = `
query GetCollection($id: ID!, $productsFirst: Int!, $productsAfter: String) {
  collection(id: $id) {
    id
    title
    handle
    description
    descriptionHtml
    seo { title description }
    updatedAt
    sortOrder
    image { id url altText }
    productsCount { count precision }
    ruleSet {
      appliedDisjunctively
      rules {
        column
        relation
        condition
        conditionObject {
          ... on CollectionRuleMetafieldCondition {
            metafieldDefinition { id }
          }
        }
      }
    }
    products(first: $productsFirst, after: $productsAfter) {
      nodes { id title handle status }
      pageInfo { hasNextPage endCursor }
    }
    resourcePublicationsV2(first: 100, onlyPublished: false) {
      nodes {
        isPublished
        publishDate
        publication { id name }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
}`.trim()

export const COLLECTIONS_BY_NAME_QUERY = `
query ResolveCollectionsByName($query: String!, $after: String) {
  collections(first: 100, query: $query, after: $after) {
    nodes { id title handle }
    pageInfo { hasNextPage endCursor }
  }
}`.trim()

export const COLLECTION_BY_ID_QUERY = `
query ResolveCollectionById($id: ID!) {
  collection(id: $id) { id title handle }
}`.trim()

export const COLLECTION_CREATE_MUTATION = `
mutation CreateCollection($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection { id title handle }
    userErrors { field message }
  }
}`.trim()

export const COLLECTION_UPDATE_MUTATION = `
mutation UpdateCollection($input: CollectionInput!) {
  collectionUpdate(input: $input) {
    collection { id title handle }
    job { id done }
    userErrors { field message }
  }
}`.trim()

export const COLLECTION_MEMBERSHIP_QUERY = `
query GetCollectionMembership($collectionId: ID!, $productIds: [ID!]!) {
  collection(id: $collectionId) {
    id
    title
    ruleSet { appliedDisjunctively }
  }
  nodes(ids: $productIds) {
    ... on Product {
      id
      title
      inCollection(id: $collectionId)
    }
  }
}`.trim()

export const COLLECTION_ADD_PRODUCTS_MUTATION = `
mutation AddProductsToCollection($collectionId: ID!, $productIds: [ID!]!) {
  collectionAddProducts(id: $collectionId, productIds: $productIds) {
    collection { id title }
    userErrors { field message }
  }
}`.trim()

export const COLLECTION_REMOVE_PRODUCTS_MUTATION = `
mutation RemoveProductsFromCollection($collectionId: ID!, $productIds: [ID!]!) {
  collectionRemoveProducts(id: $collectionId, productIds: $productIds) {
    job { id done }
    userErrors { field message }
  }
}`.trim()

export const JOB_QUERY = `
query GetCollectionJob($id: ID!) {
  job(id: $id) { id done }
}`.trim()

const MAX_PAGES = 100
const JOB_MAX_POLL_ATTEMPTS = 60
const JOB_POLL_INTERVAL_MS = 1000
const COLLECTION_SORT_KEYS = new Set(["ID", "RELEVANCE", "TITLE", "UPDATED_AT"])
const COLLECTION_SORT_ORDERS = new Set([
  "ALPHA_ASC",
  "ALPHA_DESC",
  "BEST_SELLING",
  "CREATED",
  "CREATED_DESC",
  "MANUAL",
  "PRICE_ASC",
  "PRICE_DESC",
])
const SORT_ORDER_ALIASES = new Map([
  ["alphabetical-a-z", "ALPHA_ASC"],
  ["alphabetical-z-a", "ALPHA_DESC"],
  ["best-selling", "BEST_SELLING"],
  ["created-oldest", "CREATED"],
  ["created-newest", "CREATED_DESC"],
  ["manual", "MANUAL"],
  ["price-low-high", "PRICE_ASC"],
  ["price-high-low", "PRICE_DESC"],
])
const RULE_COLUMN_ALIASES = new Map([
  ["product tag", "TAG"],
  ["tag", "TAG"],
  ["product title", "TITLE"],
  ["title", "TITLE"],
  ["product type", "TYPE"],
  ["type", "TYPE"],
  ["product vendor", "VENDOR"],
  ["vendor", "VENDOR"],
  ["variant price", "VARIANT_PRICE"],
  ["price", "VARIANT_PRICE"],
  ["variant compare at price", "VARIANT_COMPARE_AT_PRICE"],
  ["variant inventory", "VARIANT_INVENTORY"],
  ["variant weight", "VARIANT_WEIGHT"],
])
const RULE_RELATION_ALIASES = new Map([
  ["equals", "EQUALS"],
  ["not equals", "NOT_EQUALS"],
  ["contains", "CONTAINS"],
  ["not contains", "NOT_CONTAINS"],
  ["starts with", "STARTS_WITH"],
  ["ends with", "ENDS_WITH"],
  ["greater than", "GREATER_THAN"],
  ["less than", "LESS_THAN"],
  ["is set", "IS_SET"],
  ["is not set", "IS_NOT_SET"],
])

function execute(executor, request) {
  return executor(request)
}

function quoteSearchValue(value) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`
}

function normalizeEnum(value, field, aliases) {
  const raw = requiredString(value, field)
  const aliased = aliases.get(raw.toLowerCase())
  const normalized = aliased || raw.toUpperCase().replaceAll(/[ -]+/g, "_")
  if (!/^[A-Z][A-Z0-9_]*$/.test(normalized)) throw fail(`${field} is not a valid enum value`)
  return normalized
}

function normalizeDescription(raw) {
  const hasHtml = raw.descriptionHtml !== undefined
  const hasPlain = raw.description !== undefined
  if (hasHtml && hasPlain) throw fail("provide at most one of description or descriptionHtml")
  if (!hasHtml && !hasPlain) return undefined
  const value = hasHtml ? raw.descriptionHtml : raw.description
  if (typeof value !== "string") throw fail(`${hasHtml ? "descriptionHtml" : "description"} must be a string`)
  return value
}

function normalizeSeo(value) {
  if (!isObject(value)) throw fail("seo must be an object")
  const seo = {}
  if (value.title !== undefined) seo.title = requiredString(value.title, "seo.title")
  if (value.description !== undefined) {
    seo.description = requiredString(value.description, "seo.description")
  }
  if (Object.keys(seo).length === 0) throw fail("seo must contain title or description")
  return seo
}

function normalizeSortOrder(value) {
  const raw = requiredString(value, "sortOrder")
  const normalized = SORT_ORDER_ALIASES.get(raw.toLowerCase()) || raw.toUpperCase().replaceAll("-", "_")
  if (!COLLECTION_SORT_ORDERS.has(normalized)) {
    throw fail(`sortOrder must be one of ${[...COLLECTION_SORT_ORDERS].join(", ")}`)
  }
  return normalized
}

function normalizeImage(value, { allowNull = false } = {}) {
  if (value === null && allowNull) return null
  if (!isObject(value)) throw fail("image must be an object")
  const src = requiredString(value.src ?? value.url, "image.src")
  let parsed
  try {
    parsed = new URL(src)
  } catch {
    throw fail("image.src must be a public HTTPS URL; use upload_image for local files")
  }
  if (parsed.protocol !== "https:") {
    throw fail("image.src must be a public HTTPS URL; use upload_image for local files")
  }
  const image = { src }
  if (value.altText !== undefined || value.alt !== undefined) {
    const altText = value.altText ?? value.alt
    if (typeof altText !== "string") throw fail("image.altText must be a string")
    image.altText = altText
  }
  return image
}

function normalizeRuleSet(value) {
  if (!isObject(value)) throw fail("rules must be an object")
  const match = requiredString(value.match, "rules.match").toLowerCase()
  if (!new Set(["all", "any"]).has(match)) throw fail("rules.match must be all or any")
  if (!Array.isArray(value.conditions) || value.conditions.length === 0 || value.conditions.length > 50) {
    throw fail("rules.conditions must contain 1 to 50 conditions")
  }
  const rules = value.conditions.map((condition, index) => {
    if (!isObject(condition)) throw fail(`rules.conditions[${index}] must be an object`)
    const normalized = {
      column: normalizeEnum(condition.column ?? condition.field, `rules.conditions[${index}].field`, RULE_COLUMN_ALIASES),
      relation: normalizeEnum(condition.relation, `rules.conditions[${index}].relation`, RULE_RELATION_ALIASES),
    }
    if (typeof condition.condition !== "string" && typeof condition.value !== "string") {
      throw fail(`rules.conditions[${index}].value must be a string`)
    }
    normalized.condition = condition.condition ?? condition.value
    if (condition.conditionObjectId !== undefined) {
      normalized.conditionObjectId = requireGid(
        condition.conditionObjectId,
        "MetafieldDefinition",
        `rules.conditions[${index}].conditionObjectId`,
      )
    }
    return normalized
  })
  return { appliedDisjunctively: match === "any", rules }
}

function formatRuleSet(ruleSet) {
  if (!ruleSet) return null
  return {
    match: ruleSet.appliedDisjunctively ? "any" : "all",
    conditions: (ruleSet.rules || []).map((rule) => ({
      column: rule.column,
      relation: rule.relation,
      condition: rule.condition,
      ...(rule.conditionObject?.metafieldDefinition?.id
        ? { conditionObjectId: rule.conditionObject.metafieldDefinition.id }
        : {}),
    })),
  }
}

function formatCollection(collection, { products = [], productsPageInfo = null } = {}) {
  const ruleSet = formatRuleSet(collection.ruleSet)
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    description: collection.description || "",
    descriptionHtml: collection.descriptionHtml || "",
    seo: collection.seo
      ? { title: collection.seo.title ?? null, description: collection.seo.description ?? null }
      : null,
    updatedAt: collection.updatedAt || null,
    kind: ruleSet ? "smart" : "manual",
    sortOrder: collection.sortOrder || null,
    image: collection.image
      ? {
          id: collection.image.id || null,
          url: collection.image.url,
          altText: collection.image.altText || "",
        }
      : null,
    productsCount: collection.productsCount || null,
    rules: ruleSet,
    products,
    productsPageInfo,
    productsComplete: productsPageInfo ? !productsPageInfo.hasNextPage : null,
    publications: (collection.resourcePublicationsV2?.nodes || []).map((entry) => ({
      publicationId: entry.publication?.id || null,
      publicationName: entry.publication?.name || null,
      isPublished: entry.isPublished === true,
      publishDate: entry.publishDate || null,
    })),
    publicationsComplete: collection.resourcePublicationsV2
      ? !collection.resourcePublicationsV2.pageInfo?.hasNextPage
      : null,
  }
}

export function normalizeSearchCollectionsInput(raw) {
  if (!isObject(raw)) throw fail("search_collections input must be an object")
  const first = raw.first === undefined ? 10 : raw.first
  if (!Number.isInteger(first) || first < 1 || first > 50) {
    throw fail("first must be an integer from 1 to 50")
  }
  const query = optionalString(raw.search_query, "search_query")
  const after = optionalString(raw.after, "after")
  if (raw.reverse !== undefined && typeof raw.reverse !== "boolean") throw fail("reverse must be a boolean")
  const sortKey = raw.sort_key === undefined
    ? undefined
    : requiredString(raw.sort_key, "sort_key").toUpperCase()
  if (sortKey && !COLLECTION_SORT_KEYS.has(sortKey)) {
    throw fail(`sort_key must be one of ${[...COLLECTION_SORT_KEYS].join(", ")}`)
  }
  if (sortKey === "RELEVANCE" && !query) throw fail("sort_key RELEVANCE requires search_query")
  return { first, after, query, sortKey, reverse: raw.reverse ?? false }
}

export function searchCollections({ store, input, executor = runShopifyOperation }) {
  const variables = normalizeSearchCollectionsInput(input)
  const result = execute(executor, { store, query: SEARCH_COLLECTIONS_QUERY, variables })
  const connection = result?.collections
  if (!connection) throw fail("Shopify returned no collections payload", "shopify_invalid_response")
  return {
    ok: true,
    collections: (connection.nodes || []).map((collection) => formatCollection(collection)),
    pageInfo: connection.pageInfo,
  }
}

export function normalizeGetCollectionInput(raw) {
  if (!isObject(raw)) throw fail("get_collection input must be an object")
  const id = requireGid(raw.id, "Collection", "id")
  const productsFirst = raw.products_first === undefined ? 50 : raw.products_first
  if (!Number.isInteger(productsFirst) || productsFirst < 1 || productsFirst > 100) {
    throw fail("products_first must be an integer from 1 to 100")
  }
  if (raw.all_products !== undefined && typeof raw.all_products !== "boolean") {
    throw fail("all_products must be a boolean")
  }
  return {
    id,
    productsFirst,
    productsAfter: optionalString(raw.products_after, "products_after"),
    allProducts: raw.all_products === true,
  }
}

export function getCollection({ store, input, executor = runShopifyOperation }) {
  const normalized = normalizeGetCollectionInput(input)
  const products = []
  let productsAfter = normalized.productsAfter
  let collection
  let pageInfo
  let page = 0
  do {
    if (page >= MAX_PAGES) {
      throw fail("Collection product pagination exceeded the safety limit", "shopify_pagination_limit")
    }
    const result = execute(executor, {
      store,
      query: GET_COLLECTION_QUERY,
      variables: {
        id: normalized.id,
        productsFirst: normalized.productsFirst,
        productsAfter,
      },
    })
    if (!result?.collection) throw fail(`Collection not found: ${normalized.id}`, "collection_not_found")
    if (collection && result.collection.id !== collection.id) {
      throw fail("Shopify returned a different Collection during pagination", "shopify_invalid_response")
    }
    collection = result.collection
    products.push(...(collection.products?.nodes || []))
    pageInfo = collection.products?.pageInfo || { hasNextPage: false, endCursor: null }
    if (!normalized.allProducts || !pageInfo.hasNextPage) break
    productsAfter = pageInfo.endCursor
    if (!productsAfter) throw fail("Shopify returned no product cursor", "shopify_invalid_response")
    page += 1
  } while (productsAfter)
  return { ok: true, collection: formatCollection(collection, { products, productsPageInfo: pageInfo }) }
}

export function normalizeCollectionTarget(raw) {
  if (!isObject(raw)) throw fail("collection target must be an object")
  const hasId = raw.id !== undefined
  const hasName = raw.name !== undefined
  if (hasId === hasName) throw fail("provide exactly one of id or name")
  return {
    id: hasId ? requireGid(raw.id, "Collection", "id") : undefined,
    name: hasName ? requiredString(raw.name, "name") : undefined,
  }
}

export function resolveCollection({ store, input, executor = runShopifyOperation }) {
  const target = normalizeCollectionTarget(input)
  if (target.id) {
    const result = execute(executor, {
      store,
      query: COLLECTION_BY_ID_QUERY,
      variables: { id: target.id },
    })
    if (!result?.collection) throw fail(`Collection not found: ${target.id}`, "collection_not_found")
    return {
      ok: true,
      resolution: "explicit_id",
      collection: result.collection,
    }
  }

  const matches = []
  let after
  let page = 0
  do {
    if (page >= MAX_PAGES) {
      throw fail("Collection pagination exceeded the safety limit", "shopify_pagination_limit")
    }
    const result = execute(executor, {
      store,
      query: COLLECTIONS_BY_NAME_QUERY,
      variables: { query: `title:${quoteSearchValue(target.name)}`, after },
    })
    const connection = result?.collections
    if (!connection) throw fail("Shopify returned no collections payload", "shopify_invalid_response")
    matches.push(...(connection.nodes || []).filter((entry) => entry?.title?.trim() === target.name))
    if (!connection.pageInfo?.hasNextPage) break
    after = connection.pageInfo.endCursor
    if (!after) throw fail("Shopify returned no collection cursor", "shopify_invalid_response")
    page += 1
  } while (after)
  if (matches.length === 0) throw fail("No Collection matches the confirmed name", "collection_not_found")
  if (matches.length > 1) {
    throw fail("More than one Collection matches the confirmed name", "collection_ambiguous", {
      candidates: matches,
    })
  }
  return { ok: true, resolution: "explicit_name", collection: matches[0] }
}

function normalizeProductIds(value, { required = false } = {}) {
  if (value === undefined && !required) return []
  if (!Array.isArray(value) || value.length === 0 || value.length > 250) {
    throw fail("productIds must contain 1 to 250 product GIDs")
  }
  return [...new Set(value.map((id, index) => requireGid(id, "Product", `productIds[${index}]`)))]
}

export function normalizeCreateCollectionInput(raw) {
  if (!isObject(raw)) throw fail("create_collection input must be an object")
  const kind = requiredString(raw.kind, "kind").toLowerCase()
  if (!new Set(["manual", "smart"]).has(kind)) throw fail("kind must be manual or smart")
  const input = { title: requiredString(raw.title, "title") }
  const descriptionHtml = normalizeDescription(raw)
  if (descriptionHtml !== undefined) input.descriptionHtml = descriptionHtml
  if (raw.seo !== undefined) input.seo = normalizeSeo(raw.seo)
  if (raw.handle !== undefined) input.handle = requiredString(raw.handle, "handle")
  if (raw.sortOrder !== undefined || raw.sort !== undefined) {
    input.sortOrder = normalizeSortOrder(raw.sortOrder ?? raw.sort)
  }
  if (raw.image !== undefined) input.image = normalizeImage(raw.image)
  const productIds = normalizeProductIds(raw.productIds)
  if (kind === "manual") {
    if (raw.rules !== undefined) throw fail("manual Collections must not include rules")
    if (productIds.length > 0) input.products = productIds
  } else {
    if (productIds.length > 0) throw fail("smart Collections must not include productIds")
    if (raw.rules === undefined) throw fail("smart Collections require rules")
    input.ruleSet = normalizeRuleSet(raw.rules)
  }
  return { kind, input, productIds }
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function verifyDesiredCollection(collection, desired, { expectedKind, productIds = [] } = {}) {
  const mismatches = []
  if (expectedKind && collection.kind !== expectedKind) mismatches.push({ field: "kind", expected: expectedKind, actual: collection.kind })
  for (const field of ["title", "handle", "descriptionHtml", "sortOrder"]) {
    if (desired[field] !== undefined && collection[field] !== desired[field]) {
      mismatches.push({ field, expected: desired[field], actual: collection[field] })
    }
  }
  if (desired.seo !== undefined) {
    for (const field of ["title", "description"]) {
      if (desired.seo[field] !== undefined && collection.seo?.[field] !== desired.seo[field]) {
        mismatches.push({ field: `seo.${field}`, expected: desired.seo[field], actual: collection.seo?.[field] })
      }
    }
  }
  if (desired.image === null && collection.image !== null) {
    mismatches.push({ field: "image", expected: null, actual: collection.image })
  } else if (desired.image && !collection.image?.url) {
    mismatches.push({ field: "image", expected: "created image", actual: collection.image })
  } else if (desired.image?.altText !== undefined && collection.image?.altText !== desired.image.altText) {
    mismatches.push({ field: "image.altText", expected: desired.image.altText, actual: collection.image?.altText })
  }
  if (desired.ruleSet !== undefined) {
    const expectedRules = {
      match: desired.ruleSet.appliedDisjunctively ? "any" : "all",
      conditions: desired.ruleSet.rules,
    }
    if (!sameJson(collection.rules, expectedRules)) {
      mismatches.push({ field: "rules", expected: expectedRules, actual: collection.rules })
    }
  }
  if (productIds.length > 0) {
    const actualIds = new Set(collection.products.map((product) => product.id))
    const missing = productIds.filter((id) => !actualIds.has(id))
    if (missing.length > 0) mismatches.push({ field: "productIds", missing })
  }
  if (mismatches.length > 0) {
    throw fail("Collection verification did not match the requested outcome", "verification_failed", { mismatches })
  }
}

export function createCollection({ store, input, apply, executor = runShopifyOperation }) {
  const normalized = normalizeCreateCollectionInput(input)
  if (!apply) {
    return {
      ok: true,
      dryRun: true,
      store,
      plan: {
        kind: normalized.kind,
        collection: normalized.input,
        publication: "unchanged; new Collection remains unpublished unless separately published",
      },
    }
  }
  const result = execute(executor, {
    store,
    query: COLLECTION_CREATE_MUTATION,
    variables: { input: normalized.input },
    allowMutations: true,
  })
  const payload = throwOnUserErrors(result?.collectionCreate, "collectionCreate")
  if (!payload.collection?.id) throw fail("Shopify returned no created Collection", "shopify_invalid_response")
  const verification = getCollection({
    store,
    input: { id: payload.collection.id, products_first: 100, all_products: normalized.productIds.length > 0 },
    executor,
  })
  verifyDesiredCollection(verification.collection, normalized.input, {
    expectedKind: normalized.kind,
    productIds: normalized.productIds,
  })
  return { ok: true, dryRun: false, changed: true, collection: verification.collection }
}

export function normalizeUpdateCollectionInput(raw) {
  if (!isObject(raw)) throw fail("update_collection input must be an object")
  const id = requireGid(raw.id, "Collection", "id")
  const patch = {}
  if (raw.title !== undefined) patch.title = requiredString(raw.title, "title")
  const descriptionHtml = normalizeDescription(raw)
  if (descriptionHtml !== undefined) patch.descriptionHtml = descriptionHtml
  if (raw.seo !== undefined) patch.seo = normalizeSeo(raw.seo)
  if (raw.handle !== undefined) patch.handle = requiredString(raw.handle, "handle")
  if (raw.sortOrder !== undefined || raw.sort !== undefined) {
    patch.sortOrder = normalizeSortOrder(raw.sortOrder ?? raw.sort)
  }
  if (raw.image !== undefined) patch.image = normalizeImage(raw.image, { allowNull: true })
  if (raw.rules !== undefined) patch.ruleSet = normalizeRuleSet(raw.rules)
  if (Object.keys(patch).length === 0) throw fail("update_collection contains no changes")
  return { id, patch }
}

function baselineValue(collection, field) {
  if (field === "ruleSet") {
    if (!collection.rules) return null
    return {
      appliedDisjunctively: collection.rules.match === "any",
      rules: collection.rules.conditions,
    }
  }
  if (field === "image") {
    return collection.image
      ? { src: collection.image.url, altText: collection.image.altText }
      : null
  }
  return collection[field]
}

function buildCollectionDiff(collection, patch) {
  const mutationInput = { id: collection.id }
  const changes = []
  for (const [field, desired] of Object.entries(patch)) {
    const before = baselineValue(collection, field)
    let changed = !sameJson(before, desired)
    if (field === "image" && desired && before) {
      changed = before.src !== desired.src || before.altText !== (desired.altText ?? before.altText)
    }
    if (!changed) continue
    mutationInput[field] = desired
    changes.push({ field, before, after: desired })
  }
  return { mutationInput, changes }
}

export async function updateCollection({
  store,
  input,
  apply,
  executor = runShopifyOperation,
  wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
}) {
  const normalized = normalizeUpdateCollectionInput(input)
  const baseline = getCollection({
    store,
    input: { id: normalized.id, products_first: 1 },
    executor,
  }).collection
  if (normalized.patch.ruleSet && baseline.kind !== "smart") {
    throw fail(
      "A manual Collection cannot be converted to smart through update_collection",
      "collection_type_transition_unsupported",
    )
  }
  const { mutationInput, changes } = buildCollectionDiff(baseline, normalized.patch)
  if (!apply) {
    return { ok: true, dryRun: true, store, collectionId: normalized.id, baseline, changes, mutationInput }
  }
  if (changes.length === 0) {
    return { ok: true, dryRun: false, changed: false, collection: baseline, changes: [] }
  }
  const result = execute(executor, {
    store,
    query: COLLECTION_UPDATE_MUTATION,
    variables: { input: mutationInput },
    allowMutations: true,
  })
  const payload = throwOnUserErrors(result?.collectionUpdate, "collectionUpdate")
  if (!payload.collection?.id && !payload.job?.id) {
    throw fail("Shopify returned neither an updated Collection nor a Collection job", "shopify_invalid_response")
  }
  if (payload.collection?.id && payload.collection.id !== normalized.id) {
    throw fail("Shopify returned a different updated Collection", "shopify_invalid_response", {
      expectedCollectionId: normalized.id,
      actualCollectionId: payload.collection.id,
    })
  }
  const job = await waitForJob({ store, job: payload.job, executor, wait })
  const verification = getCollection({
    store,
    input: { id: normalized.id, products_first: 1 },
    executor,
  }).collection
  verifyDesiredCollection(verification, mutationInput)
  return {
    ok: true,
    dryRun: false,
    changed: true,
    changes,
    job,
    collection: verification,
  }
}

export function normalizeMembershipInput(raw) {
  if (!isObject(raw)) throw fail("Collection membership input must be an object")
  return {
    collectionId: requireGid(raw.collectionId, "Collection", "collectionId"),
    productIds: normalizeProductIds(raw.productIds, { required: true }),
  }
}

function readMembership({ store, normalized, executor }) {
  const result = execute(executor, {
    store,
    query: COLLECTION_MEMBERSHIP_QUERY,
    variables: normalized,
  })
  if (!result?.collection) throw fail(`Collection not found: ${normalized.collectionId}`, "collection_not_found")
  if (result.collection.ruleSet) {
    throw fail("Manual membership cannot be changed on a smart Collection", "smart_collection_membership_unsupported")
  }
  if (!Array.isArray(result.nodes) || result.nodes.length !== normalized.productIds.length) {
    throw fail("Shopify returned an invalid product membership payload", "shopify_invalid_response")
  }
  const byId = new Map(result.nodes.filter((node) => node?.id).map((node) => [node.id, node]))
  const missingProductIds = normalized.productIds.filter((id) => !byId.has(id))
  if (missingProductIds.length > 0) {
    throw fail("One or more products were not found", "product_not_found", { productIds: missingProductIds })
  }
  return {
    collection: { id: result.collection.id, title: result.collection.title, kind: "manual" },
    products: normalized.productIds.map((id) => {
      const node = byId.get(id)
      return { id: node.id, title: node.title, inCollection: node.inCollection === true }
    }),
  }
}

export function addToCollection({ store, input, apply, executor = runShopifyOperation }) {
  const normalized = normalizeMembershipInput(input)
  const before = readMembership({ store, normalized, executor })
  const productIdsToAdd = before.products.filter((product) => !product.inCollection).map((product) => product.id)
  const alreadyPresentProductIds = before.products.filter((product) => product.inCollection).map((product) => product.id)
  if (!apply) {
    return { ok: true, dryRun: true, store, collection: before.collection, productIdsToAdd, alreadyPresentProductIds }
  }
  if (productIdsToAdd.length === 0) {
    return {
      ok: true,
      dryRun: false,
      changed: false,
      collection: before.collection,
      addedProductIds: [],
      alreadyPresentProductIds,
      products: before.products,
    }
  }
  const result = execute(executor, {
    store,
    query: COLLECTION_ADD_PRODUCTS_MUTATION,
    variables: { collectionId: normalized.collectionId, productIds: productIdsToAdd },
    allowMutations: true,
  })
  throwOnUserErrors(result?.collectionAddProducts, "collectionAddProducts")
  const after = readMembership({ store, normalized, executor })
  const notAddedProductIds = after.products.filter((product) => !product.inCollection).map((product) => product.id)
  if (notAddedProductIds.length > 0) {
    throw fail("Collection verification did not include every requested product", "verification_failed", {
      productIds: notAddedProductIds,
    })
  }
  return {
    ok: true,
    dryRun: false,
    changed: true,
    collection: after.collection,
    addedProductIds: productIdsToAdd,
    alreadyPresentProductIds,
    products: after.products,
  }
}

async function waitForJob({ store, job, executor, wait }) {
  if (!job?.id || job.done === true) return job || null
  let current = job
  for (let attempt = 0; attempt < JOB_MAX_POLL_ATTEMPTS && current.done !== true; attempt += 1) {
    await wait(JOB_POLL_INTERVAL_MS)
    const result = execute(executor, { store, query: JOB_QUERY, variables: { id: current.id } })
    current = result?.job
    if (!current?.id || current.id !== job.id) {
      throw fail("Shopify returned no matching Collection job", "shopify_invalid_response", {
        expectedJobId: job.id,
        actualJobId: current?.id || null,
      })
    }
  }
  if (current.done !== true) {
    throw fail("Shopify Collection job did not finish in time", "shopify_job_incomplete", {
      job: current,
      pollAttempts: JOB_MAX_POLL_ATTEMPTS,
    })
  }
  return current
}

export async function removeFromCollection({
  store,
  input,
  apply,
  executor = runShopifyOperation,
  wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
}) {
  const normalized = normalizeMembershipInput(input)
  const before = readMembership({ store, normalized, executor })
  const productIdsToRemove = before.products.filter((product) => product.inCollection).map((product) => product.id)
  const alreadyAbsentProductIds = before.products.filter((product) => !product.inCollection).map((product) => product.id)
  if (!apply) {
    return { ok: true, dryRun: true, store, collection: before.collection, productIdsToRemove, alreadyAbsentProductIds }
  }
  if (productIdsToRemove.length === 0) {
    return {
      ok: true,
      dryRun: false,
      changed: false,
      collection: before.collection,
      removedProductIds: [],
      alreadyAbsentProductIds,
      products: before.products,
    }
  }
  const result = execute(executor, {
    store,
    query: COLLECTION_REMOVE_PRODUCTS_MUTATION,
    variables: { collectionId: normalized.collectionId, productIds: productIdsToRemove },
    allowMutations: true,
  })
  const payload = throwOnUserErrors(result?.collectionRemoveProducts, "collectionRemoveProducts")
  const job = await waitForJob({ store, job: payload.job, executor, wait })
  const after = readMembership({ store, normalized, executor })
  const stillPresentProductIds = after.products.filter((product) => product.inCollection).map((product) => product.id)
  if (stillPresentProductIds.length > 0) {
    throw fail("Collection verification still included one or more removed products", "verification_failed", {
      productIds: stillPresentProductIds,
    })
  }
  return {
    ok: true,
    dryRun: false,
    changed: true,
    collection: after.collection,
    removedProductIds: productIdsToRemove,
    alreadyAbsentProductIds,
    job,
    products: after.products,
  }
}
