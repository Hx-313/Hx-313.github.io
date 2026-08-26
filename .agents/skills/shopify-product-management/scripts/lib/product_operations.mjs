import { readFileSync, realpathSync, statSync } from "node:fs"
import { basename, extname, isAbsolute } from "node:path"

import {
  fail,
  isObject,
  normalizeMoney,
  optionalString,
  requireGid,
  requiredString,
  runShopifyOperation,
  throwOnUserErrors,
} from "./runtime.mjs"
import { compareShopifyHtml } from "./html_verification.mjs"

export const GET_PRODUCT_QUERY = `
query GetProduct($id: ID!, $variantsAfter: String, $mediaAfter: String) {
  product(id: $id) {
    id
    title
    handle
    descriptionHtml
    status
    vendor
    productType
    tags
    seo { title description }
    totalInventory
    featuredMedia { preview { image { url } } }
    options { id name position values }
    variants(first: 100, after: $variantsAfter) {
      nodes {
        id
        title
        sku
        price
        compareAtPrice
        inventoryQuantity
        inventoryItem { tracked }
        selectedOptions { name value }
      }
      pageInfo { hasNextPage endCursor }
    }
    media(first: 100, after: $mediaAfter) {
      nodes {
        id
        alt
        status
        mediaContentType
        ... on MediaImage { image { url } }
      }
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
  shop { currencyCode }
}`.trim()

export const SEARCH_PRODUCTS_QUERY = `
query SearchProducts(
  $first: Int!
  $after: String
  $query: String
  $sortKey: ProductSortKeys
  $reverse: Boolean!
) {
  products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
    nodes {
      id
      title
      handle
      status
      vendor
      productType
      tags
      totalInventory
      featuredMedia { preview { image { url } } }
      variants(first: 10) {
        nodes { id title sku price inventoryQuantity }
        pageInfo { hasNextPage endCursor }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
  shop { currencyCode }
}`.trim()

export const PRODUCT_UPDATE_MUTATION = `
mutation UpdateProduct($product: ProductUpdateInput!, $media: [CreateMediaInput!]) {
  productUpdate(product: $product, media: $media) {
    product { id title descriptionHtml status seo { title description } }
    userErrors { field message }
  }
}`.trim()

export const PRODUCT_VARIANTS_UPDATE_MUTATION = `
mutation UpdateProductVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkUpdate(
    productId: $productId
    variants: $variants
    allowPartialUpdates: false
  ) {
    productVariants {
      id
      title
      sku
      price
      compareAtPrice
      selectedOptions { name value }
    }
    userErrors { field message }
  }
}`.trim()

export const FILE_REMOVE_PRODUCT_REFERENCES_MUTATION = `
mutation RemoveProductMedia($files: [FileUpdateInput!]!) {
  fileUpdate(files: $files) {
    files { id }
    userErrors { field message }
  }
}`.trim()

export const COLLECTION_PRODUCT_IDS_QUERY = `
query CollectionProductIds($id: ID!) {
  collection(id: $id) {
    id
    title
    products(first: 50) {
      nodes { id }
      pageInfo { hasNextPage endCursor }
    }
  }
}`.trim()

export const PRODUCT_STATUS_UPDATE_MUTATION = `
mutation UpdateProductStatus($product: ProductUpdateInput!) {
  productUpdate(product: $product) {
    product {
      id
      title
      status
      featuredMedia { preview { image { url } } }
    }
    userErrors { field message }
  }
}`.trim()

export const STAGED_UPLOADS_MUTATION = `
mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters { name value }
    }
    userErrors { field message }
  }
}`.trim()

export const FILE_CREATE_MUTATION = `
mutation CreateImageFile($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files {
      id
      alt
      fileStatus
      ... on MediaImage { image { url } }
    }
    userErrors { field message }
  }
}`.trim()

export const GET_IMAGE_FILES_QUERY = `
query GetImageFiles($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on MediaImage {
      id
      alt
      fileStatus
      image { url }
    }
  }
}`.trim()

const PRODUCT_STATUSES = new Set(["ACTIVE", "DRAFT", "ARCHIVED"])
const PRODUCT_SORT_KEYS = new Set([
  "TITLE",
  "PRODUCT_TYPE",
  "VENDOR",
  "INVENTORY_TOTAL",
  "UPDATED_AT",
  "CREATED_AT",
  "PUBLISHED_AT",
  "ID",
  "RELEVANCE",
])
const IMAGE_MIME_TYPES = new Map([
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
])

function execute(executor, request) {
  return executor(request)
}

function normalizeStatus(value, field = "status") {
  const status = requiredString(value, field).toUpperCase()
  if (!PRODUCT_STATUSES.has(status)) throw fail(`${field} must be ACTIVE, DRAFT, or ARCHIVED`)
  return status
}

function formatProduct(product, currencyCode) {
  const media = product.media?.nodes || []
  return {
    id: product.id,
    title: product.title,
    handle: product.handle || "",
    descriptionHtml: product.descriptionHtml || "",
    status: product.status,
    vendor: product.vendor || "",
    productType: product.productType || "",
    tags: product.tags || [],
    seo: product.seo
      ? { title: product.seo.title ?? null, description: product.seo.description ?? null }
      : null,
    currencyCode: currencyCode || null,
    totalInventory: product.totalInventory ?? null,
    featuredImageUrl: product.featuredMedia?.preview?.image?.url || null,
    options: product.options || [],
    variants: product.variants?.nodes || [],
    variantsPageInfo: product.variants?.pageInfo || null,
    media: media.map((entry) => ({
      mediaId: entry.id,
      mediaContentType: entry.mediaContentType,
      altText: entry.alt ?? null,
      status: entry.status,
      url: entry.image?.url || null,
    })),
    images: media
      .filter((entry) => entry.mediaContentType === "IMAGE" && entry.image?.url)
      .map((entry) => ({
        mediaId: entry.id,
        url: entry.image.url,
        altText: entry.alt ?? null,
        status: entry.status,
      })),
    mediaPageInfo: product.media?.pageInfo || null,
    publications: (product.resourcePublicationsV2?.nodes || []).map((entry) => ({
      publicationId: entry.publication?.id || null,
      publicationName: entry.publication?.name || null,
      isPublished: entry.isPublished === true,
      publishDate: entry.publishDate || null,
    })),
    publicationsComplete: product.resourcePublicationsV2
      ? !product.resourcePublicationsV2.pageInfo?.hasNextPage
      : null,
  }
}

export function normalizeGetProductInput(raw) {
  if (!isObject(raw)) throw fail("get_product input must be an object")
  return { id: requireGid(raw.id, "Product", "id") }
}

export function getProduct({
  store,
  input,
  executor = runShopifyOperation,
  paginateVariants = false,
  paginateMedia = false,
}) {
  const { id } = normalizeGetProductInput(input)
  const result = execute(executor, {
    store,
    query: GET_PRODUCT_QUERY,
    variables: { id, variantsAfter: null, mediaAfter: null },
  })
  if (!result?.product) throw fail(`Product not found: ${id}`, "product_not_found")
  const product = result.product
  let variantsAfter = paginateVariants && product.variants?.pageInfo?.hasNextPage
    ? product.variants.pageInfo.endCursor
    : null
  let mediaAfter = paginateMedia && product.media?.pageInfo?.hasNextPage
    ? product.media.pageInfo.endCursor
    : null
  if (paginateVariants && product.variants?.pageInfo?.hasNextPage && !variantsAfter) {
    throw fail("Shopify returned an invalid Product Variant cursor", "shopify_invalid_response")
  }
  if (paginateMedia && product.media?.pageInfo?.hasNextPage && !mediaAfter) {
    throw fail("Shopify returned an invalid Product Media cursor", "shopify_invalid_response")
  }
  let pageReads = 0
  while (variantsAfter || mediaAfter) {
    if (pageReads >= 100) {
      throw fail("Product pagination exceeded the safety limit", "shopify_invalid_response", { productId: id })
    }
    const page = execute(executor, {
      store,
      query: GET_PRODUCT_QUERY,
      variables: { id, variantsAfter, mediaAfter },
    })
    if (!page?.product) throw fail(`Product not found while paginating: ${id}`, "product_not_found")
    if (variantsAfter) {
      product.variants.nodes.push(...(page.product.variants?.nodes || []))
      const pageInfo = page.product.variants?.pageInfo
      if (pageInfo?.hasNextPage && !pageInfo.endCursor) {
        throw fail("Shopify returned an invalid Product Variant cursor", "shopify_invalid_response")
      }
      product.variants.pageInfo = pageInfo || { hasNextPage: false, endCursor: null }
      variantsAfter = pageInfo?.hasNextPage ? pageInfo.endCursor : null
    }
    if (mediaAfter) {
      product.media.nodes.push(...(page.product.media?.nodes || []))
      const pageInfo = page.product.media?.pageInfo
      if (pageInfo?.hasNextPage && !pageInfo.endCursor) {
        throw fail("Shopify returned an invalid Product Media cursor", "shopify_invalid_response")
      }
      product.media.pageInfo = pageInfo || { hasNextPage: false, endCursor: null }
      mediaAfter = pageInfo?.hasNextPage ? pageInfo.endCursor : null
    }
    pageReads += 1
  }
  return { ok: true, product: formatProduct(result.product, result.shop?.currencyCode) }
}

export function normalizeSearchProductsInput(raw) {
  if (!isObject(raw)) throw fail("search_products input must be an object")
  const first = raw.first === undefined ? 10 : raw.first
  if (!Number.isInteger(first) || first < 1 || first > 50) {
    throw fail("first must be an integer from 1 to 50")
  }
  const searchQuery = optionalString(raw.search_query, "search_query")
  const after = optionalString(raw.after, "after")
  if (raw.reverse !== undefined && typeof raw.reverse !== "boolean") {
    throw fail("reverse must be a boolean")
  }
  const sortKey = raw.sort_key === undefined ? undefined : requiredString(raw.sort_key, "sort_key").toUpperCase()
  if (sortKey && !PRODUCT_SORT_KEYS.has(sortKey)) {
    throw fail(`sort_key must be one of ${[...PRODUCT_SORT_KEYS].join(", ")}`)
  }
  if (sortKey === "RELEVANCE" && !searchQuery) {
    throw fail("sort_key RELEVANCE requires search_query")
  }
  return {
    first,
    after,
    query: searchQuery,
    sortKey,
    reverse: raw.reverse ?? false,
  }
}

export function searchProducts({ store, input, executor = runShopifyOperation }) {
  const variables = normalizeSearchProductsInput(input)
  const result = execute(executor, { store, query: SEARCH_PRODUCTS_QUERY, variables })
  const connection = result?.products
  if (!connection) throw fail("Shopify returned no products payload", "shopify_invalid_response")
  return {
    ok: true,
    currencyCode: result.shop?.currencyCode || null,
    products: (connection.nodes || []).map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      status: product.status,
      vendor: product.vendor || "",
      productType: product.productType || "",
      tags: product.tags || [],
      totalInventory: product.totalInventory ?? null,
      featuredImageUrl: product.featuredMedia?.preview?.image?.url || null,
      variants: product.variants?.nodes || [],
      variantsPageInfo: product.variants?.pageInfo || null,
    })),
    pageInfo: connection.pageInfo,
  }
}

function normalizePublicImages(value) {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length === 0) {
    throw fail("images must be a non-empty array when provided")
  }
  return value.map((image, index) => {
    if (!isObject(image)) throw fail(`images[${index}] must be an object`)
    const url = requiredString(image.url, `images[${index}].url`)
    let parsed
    try {
      parsed = new URL(url)
    } catch {
      throw fail(`images[${index}].url must be a public HTTPS URL; use upload_image for local files`)
    }
    if (parsed.protocol !== "https:") {
      throw fail(`images[${index}].url must be a public HTTPS URL; use upload_image for local files`)
    }
    const media = { originalSource: url, mediaContentType: "IMAGE" }
    const alt = optionalString(image.altText, `images[${index}].altText`)
    if (alt) media.alt = alt
    return media
  })
}

function normalizeVariantUpdates(value) {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length === 0) {
    throw fail("variants must be a non-empty array when provided")
  }
  const seen = new Set()
  return value.map((variant, index) => {
    if (!isObject(variant)) throw fail(`variants[${index}] must be an object`)
    const id = requireGid(variant.id, "ProductVariant", `variants[${index}].id`)
    if (seen.has(id)) throw fail(`variants contains duplicate id ${id}`)
    seen.add(id)
    const normalized = { id }
    if (variant.price !== undefined) normalized.price = normalizeMoney(variant.price, `variants[${index}].price`)
    if (variant.compareAtPrice !== undefined) {
      normalized.compareAtPrice =
        variant.compareAtPrice === null
          ? null
          : normalizeMoney(variant.compareAtPrice, `variants[${index}].compareAtPrice`)
    }
    if (variant.sku !== undefined) {
      if (typeof variant.sku !== "string") throw fail(`variants[${index}].sku must be a string`)
      normalized.inventoryItem = { sku: variant.sku.trim() }
    }
    if (variant.optionValues !== undefined) {
      if (!Array.isArray(variant.optionValues) || variant.optionValues.length === 0) {
        throw fail(`variants[${index}].optionValues must be a non-empty array`)
      }
      normalized.optionValues = variant.optionValues.map((entry, valueIndex) => {
        if (!isObject(entry)) {
          throw fail(`variants[${index}].optionValues[${valueIndex}] must be an object`)
        }
        return {
          optionName: requiredString(
            entry.optionName,
            `variants[${index}].optionValues[${valueIndex}].optionName`,
          ),
          name: requiredString(entry.name, `variants[${index}].optionValues[${valueIndex}].name`),
        }
      })
    }
    if (Object.keys(normalized).length === 1) {
      throw fail(`variants[${index}] contains no changes`)
    }
    return normalized
  })
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

export function normalizeUpdateProductInput(raw) {
  if (!isObject(raw)) throw fail("update_product input must be an object")
  const id = requireGid(raw.id, "Product", "id")
  const product = { id }
  if (raw.title !== undefined) product.title = requiredString(raw.title, "title")
  if (raw.descriptionHtml !== undefined) {
    if (typeof raw.descriptionHtml !== "string") throw fail("descriptionHtml must be a string")
    product.descriptionHtml = raw.descriptionHtml
  }
  if (raw.status !== undefined) product.status = normalizeStatus(raw.status)
  if (raw.seo !== undefined) product.seo = normalizeSeo(raw.seo)
  const media = normalizePublicImages(raw.images)
  const variants = normalizeVariantUpdates(raw.variants)
  let removeMediaIds = []
  if (raw.removeMediaIds !== undefined) {
    if (!Array.isArray(raw.removeMediaIds) || raw.removeMediaIds.length === 0) {
      throw fail("removeMediaIds must be a non-empty array when provided")
    }
    removeMediaIds = [...new Set(raw.removeMediaIds.map((entry, index) =>
      requireGid(entry, ["MediaImage", "Video", "Model3d", "ExternalVideo"], `removeMediaIds[${index}]`),
    ))]
  }
  if (Object.keys(product).length === 1 && media.length === 0 && variants.length === 0 && removeMediaIds.length === 0) {
    throw fail("update_product contains no changes")
  }
  return { id, product, media, variants, removeMediaIds }
}

function serializeCause(error) {
  return {
    error: error.code || "unexpected_error",
    message: error.message || String(error),
    ...(error.details === undefined ? {} : { details: error.details }),
  }
}

function normalizeDecimal(value) {
  const [integer, fraction = ""] = String(value ?? "").split(".")
  return `${integer.replace(/^0+(?=\d)/, "") || "0"}.${fraction.replace(/0+$/, "")}`
}

function sameMoney(left, right) {
  const leftMissing = left === undefined || left === null || left === ""
  const rightMissing = right === undefined || right === null || right === ""
  if (leftMissing || rightMissing) return leftMissing && rightMissing
  return normalizeDecimal(left) === normalizeDecimal(right)
}

function sameOptionValues(expected, actual) {
  const expectedPairs = expected
    .map(({ optionName, name }) => [optionName, name])
    .sort(([left], [right]) => left.localeCompare(right))
  const actualPairs = (actual || [])
    .map(({ name, value }) => [name, value])
    .sort(([left], [right]) => left.localeCompare(right))
  return JSON.stringify(expectedPairs) === JSON.stringify(actualPairs)
}

function matchAddedMedia(desiredMedia, observedMedia, baselineMediaIds) {
  const remaining = observedMedia.filter(({ mediaId }) => !baselineMediaIds.has(mediaId))
  return desiredMedia.map((expected) => {
    const matchingIndexes = remaining
      .map((actual, index) => ({ actual, index }))
      .filter(({ actual }) =>
        actual.mediaContentType === "IMAGE" &&
        (expected.alt === undefined || actual.altText === expected.alt),
      )
    const selected = matchingIndexes.find(({ actual }) => actual.status === "READY") || matchingIndexes[0]
    if (!selected) return { expected, actual: null }
    remaining.splice(selected.index, 1)
    return { expected, actual: selected.actual }
  })
}

function mediaVerificationPending(product, desiredMedia, baselineMediaIds, removeMediaIds) {
  const observedMedia = product.media || []
  const observedIds = new Set(observedMedia.map(({ mediaId }) => mediaId))
  if (removeMediaIds.some((mediaId) => observedIds.has(mediaId))) return true
  return matchAddedMedia(desiredMedia, observedMedia, baselineMediaIds)
    .some(({ actual }) =>
      !actual || actual.status === "PROCESSING" || actual.status === "UPLOADED",
    )
}

function verifyDesiredProduct(
  product,
  desired,
  desiredVariants = [],
  desiredMedia = [],
  baselineMediaIds = new Set(),
  removeMediaIds = [],
) {
  const mismatches = []
  const warnings = []
  for (const field of ["title", "status"]) {
    if (desired[field] !== undefined && product[field] !== desired[field]) {
      mismatches.push({ field, expected: desired[field], actual: product[field] })
    }
  }
  if (desired.descriptionHtml !== undefined) {
    const comparison = compareShopifyHtml(desired.descriptionHtml, product.descriptionHtml)
    if (!comparison.equal) {
      mismatches.push({
        field: "descriptionHtml",
        expected: desired.descriptionHtml,
        actual: product.descriptionHtml,
      })
    } else if (comparison.normalized) {
      warnings.push({
        code: "shopify_html_normalized",
        field: "descriptionHtml",
        message: "Shopify changed formatting-only whitespace around block HTML elements.",
      })
    }
  }
  if (desired.seo !== undefined) {
    for (const field of ["title", "description"]) {
      if (desired.seo[field] !== undefined && product.seo?.[field] !== desired.seo[field]) {
        mismatches.push({ field: `seo.${field}`, expected: desired.seo[field], actual: product.seo?.[field] })
      }
    }
  }
  for (const [index, expected] of desiredVariants.entries()) {
    const actual = product.variants?.find(({ id }) => id === expected.id)
    if (!actual) {
      mismatches.push({ field: `variants[${index}].id`, expected: expected.id, actual: null })
      continue
    }
    if (expected.price !== undefined && !sameMoney(expected.price, actual.price)) {
      mismatches.push({ field: `variants[${index}].price`, expected: expected.price, actual: actual.price })
    }
    if (expected.compareAtPrice !== undefined && !sameMoney(expected.compareAtPrice, actual.compareAtPrice)) {
      mismatches.push({
        field: `variants[${index}].compareAtPrice`,
        expected: expected.compareAtPrice,
        actual: actual.compareAtPrice,
      })
    }
    if (expected.inventoryItem?.sku !== undefined && expected.inventoryItem.sku !== (actual.sku || "")) {
      mismatches.push({
        field: `variants[${index}].sku`,
        expected: expected.inventoryItem.sku,
        actual: actual.sku || "",
      })
    }
    if (expected.optionValues !== undefined && !sameOptionValues(expected.optionValues, actual.selectedOptions)) {
      mismatches.push({
        field: `variants[${index}].optionValues`,
        expected: expected.optionValues,
        actual: actual.selectedOptions || [],
      })
    }
  }
  for (const mediaId of removeMediaIds) {
    if (product.media?.some(({ mediaId: observedId }) => observedId === mediaId)) {
      mismatches.push({ field: "removeMediaIds", expected: `without ${mediaId}`, actual: mediaId })
    }
  }
  for (const [index, { expected, actual }] of matchAddedMedia(
    desiredMedia,
    product.media || [],
    baselineMediaIds,
  ).entries()) {
    if (!actual) {
      mismatches.push({
        field: `images[${index}]`,
        expected: { mediaContentType: "IMAGE", altText: expected.alt ?? null },
        actual: null,
      })
    } else if (actual.status !== "READY") {
      mismatches.push({ field: `images[${index}].status`, expected: "READY", actual: actual.status })
    }
  }
  if (mismatches.length > 0) {
    throw fail("Product verification did not match the requested outcome", "verification_failed", {
      productId: product.id,
      mismatches,
      observedProduct: product,
    })
  }
  return { passed: true, warnings }
}

export async function updateProduct({
  store,
  input,
  apply,
  executor = runShopifyOperation,
  wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds)),
}) {
  const normalized = normalizeUpdateProductInput(input)
  const plan = {
    product: Object.keys(normalized.product).length > 1 ? normalized.product : null,
    imagesToAdd: normalized.media,
    variants: normalized.variants,
    mediaIdsToRemove: normalized.removeMediaIds,
  }
  if (!apply) return { ok: true, dryRun: true, store, productId: normalized.id, plan }

  let baselineMediaIds = new Set()
  if (normalized.media.length > 0 || normalized.removeMediaIds.length > 0) {
    const before = getProduct({
      store,
      input: { id: normalized.id },
      executor,
      paginateMedia: true,
    }).product
    baselineMediaIds = new Set((before.media || []).map(({ mediaId }) => mediaId))
    const missingRemovalIds = normalized.removeMediaIds.filter((mediaId) => !baselineMediaIds.has(mediaId))
    if (missingRemovalIds.length > 0) {
      throw fail("Product media removal target is stale or not attached", "stale_media_reference", {
        productId: normalized.id,
        mediaIds: missingRemovalIds,
      })
    }
  }

  const completedSteps = []
  try {
    if (Object.keys(normalized.product).length > 1 || normalized.media.length > 0) {
      const result = execute(executor, {
        store,
        query: PRODUCT_UPDATE_MUTATION,
        variables: {
          product: normalized.product,
          ...(normalized.media.length > 0 ? { media: normalized.media } : {}),
        },
        allowMutations: true,
      })
      throwOnUserErrors(result?.productUpdate, "productUpdate")
      completedSteps.push("product_fields_and_images")
    }
    if (normalized.variants.length > 0) {
      const result = execute(executor, {
        store,
        query: PRODUCT_VARIANTS_UPDATE_MUTATION,
        variables: { productId: normalized.id, variants: normalized.variants },
        allowMutations: true,
      })
      throwOnUserErrors(result?.productVariantsBulkUpdate, "productVariantsBulkUpdate")
      completedSteps.push("variants")
    }
    if (normalized.removeMediaIds.length > 0) {
      const result = execute(executor, {
        store,
        query: FILE_REMOVE_PRODUCT_REFERENCES_MUTATION,
        variables: {
          files: normalized.removeMediaIds.map((id) => ({
            id,
            referencesToRemove: [normalized.id],
          })),
        },
        allowMutations: true,
      })
      throwOnUserErrors(result?.fileUpdate, "fileUpdate")
      completedSteps.push("remove_media")
    }
  } catch (error) {
    if (completedSteps.length === 0) throw error
    throw fail("Product update partially completed", "partial_update", {
      productId: normalized.id,
      completedSteps,
      cause: serializeCause(error),
    })
  }

  let mediaPolls = 0
  const verificationRead = () => getProduct({
    store,
    input: { id: normalized.id },
    executor,
    paginateVariants: normalized.variants.length > 0,
    paginateMedia: normalized.media.length > 0 || normalized.removeMediaIds.length > 0,
  })
  let verification = verificationRead()
  while (
    mediaVerificationPending(
      verification.product,
      normalized.media,
      baselineMediaIds,
      normalized.removeMediaIds,
    ) &&
    mediaPolls < 3
  ) {
    mediaPolls += 1
    await wait(5000)
    verification = verificationRead()
  }
  const verificationSummary = verifyDesiredProduct(
    verification.product,
    normalized.product,
    normalized.variants,
    normalized.media,
    baselineMediaIds,
    normalized.removeMediaIds,
  )
  return {
    ok: true,
    dryRun: false,
    productId: normalized.id,
    completedSteps,
    product: verification.product,
    verification: { ...verificationSummary, mediaPolls },
  }
}

export function normalizeBulkStatusInput(raw) {
  if (!isObject(raw)) throw fail("bulk_update_product_status input must be an object")
  const status = normalizeStatus(raw.status)
  const hasIds = raw.productIds !== undefined
  const hasCollection = raw.collectionId !== undefined
  if (hasIds === hasCollection) throw fail("provide exactly one of productIds or collectionId")
  if (hasIds) {
    if (!Array.isArray(raw.productIds) || raw.productIds.length === 0 || raw.productIds.length > 50) {
      throw fail("productIds must contain 1 to 50 product GIDs")
    }
    const productIds = [...new Set(raw.productIds.map((id, index) => requireGid(id, "Product", `productIds[${index}]`)))]
    return { status, productIds, collectionId: undefined }
  }
  return { status, productIds: undefined, collectionId: requireGid(raw.collectionId, "Collection", "collectionId") }
}

function resolveBulkProductIds({ store, normalized, executor }) {
  if (normalized.productIds) return { ids: normalized.productIds, collection: null, truncated: false }
  const result = execute(executor, {
    store,
    query: COLLECTION_PRODUCT_IDS_QUERY,
    variables: { id: normalized.collectionId },
  })
  if (!result?.collection) {
    throw fail(`Collection not found: ${normalized.collectionId}`, "collection_not_found")
  }
  return {
    ids: (result.collection.products?.nodes || []).map((entry) => entry.id),
    collection: { id: result.collection.id, title: result.collection.title },
    truncated: Boolean(result.collection.products?.pageInfo?.hasNextPage),
  }
}

export function bulkUpdateProductStatus({ store, input, apply, executor = runShopifyOperation }) {
  const normalized = normalizeBulkStatusInput(input)
  const resolved = resolveBulkProductIds({ store, normalized, executor })
  if (!apply) {
    return {
      ok: true,
      dryRun: true,
      store,
      targetStatus: normalized.status,
      productIds: resolved.ids,
      collection: resolved.collection,
      truncatedToFirst50: resolved.truncated,
    }
  }
  const results = []
  for (const id of resolved.ids) {
    try {
      const result = execute(executor, {
        store,
        query: PRODUCT_STATUS_UPDATE_MUTATION,
        variables: { product: { id, status: normalized.status } },
        allowMutations: true,
      })
      const payload = throwOnUserErrors(result?.productUpdate, "productUpdate")
      results.push({
        id,
        success: true,
        title: payload.product?.title || null,
        status: payload.product?.status || null,
        imageUrl: payload.product?.featuredMedia?.preview?.image?.url || null,
        error: null,
      })
    } catch (error) {
      results.push({ id, success: false, title: null, status: null, imageUrl: null, error: serializeCause(error) })
    }
  }
  const succeeded = results.filter((entry) => entry.success).length
  return {
    ok: succeeded === results.length,
    dryRun: false,
    targetStatus: normalized.status,
    totalRequested: results.length,
    succeeded,
    failed: results.length - succeeded,
    collection: resolved.collection,
    truncatedToFirst50: resolved.truncated,
    results,
  }
}

function normalizeUploadImageInput(raw) {
  if (!isObject(raw)) throw fail("upload_image input must be an object")
  const hasImage = raw.image !== undefined
  const hasSourceUrl = raw.sourceUrl !== undefined
  if (hasImage === hasSourceUrl) throw fail("provide exactly one of image or sourceUrl")
  const alt = raw.alt === undefined ? undefined : requiredString(raw.alt, "alt")
  const requestedFilename = optionalString(raw.filename, "filename")
  if (hasSourceUrl) {
    const sourceUrl = requiredString(raw.sourceUrl, "sourceUrl")
    let parsed
    try {
      parsed = new URL(sourceUrl)
    } catch {
      throw fail("sourceUrl must be a public HTTPS URL")
    }
    if (parsed.protocol !== "https:") throw fail("sourceUrl must be a public HTTPS URL")
    const filename = basename(requestedFilename || parsed.pathname)
    if (!filename) throw fail("filename is required when sourceUrl has no file name")
    return { kind: "remote", source: sourceUrl, filename, alt }
  }

  const source = requiredString(raw.image, "image")
  if (!isAbsolute(source)) throw fail("image must be an absolute local file path")
  let path
  let stats
  try {
    path = realpathSync(source)
    stats = statSync(path)
  } catch (error) {
    throw fail(`image cannot be read: ${error.message}`, "local_media_unavailable")
  }
  if (!stats.isFile() || stats.size === 0) {
    throw fail("image must point to a non-empty local file", "local_media_unavailable")
  }
  const filename = basename(requestedFilename || path)
  const mimeType = optionalString(raw.mimeType, "mimeType") || IMAGE_MIME_TYPES.get(extname(filename).toLowerCase())
  if (!mimeType?.startsWith("image/")) {
    throw fail("unsupported image type; provide an image/* mimeType", "unsupported_local_media")
  }
  return { kind: "local", source: path, filename, mimeType, size: stats.size, alt }
}

function assertStagedTarget(target) {
  if (!isObject(target) || !Array.isArray(target.parameters)) {
    throw fail("Shopify returned an invalid staged target", "shopify_invalid_response")
  }
  let uploadUrl
  try {
    uploadUrl = new URL(target.url)
  } catch {
    throw fail("Shopify returned an invalid staged upload URL", "shopify_invalid_response")
  }
  if (uploadUrl.protocol !== "https:" || typeof target.resourceUrl !== "string" || !target.resourceUrl) {
    throw fail("Shopify returned an incomplete staged target", "shopify_invalid_response")
  }
  return target
}

async function postStagedFile({ file, target, fetchImpl }) {
  if (
    typeof fetchImpl !== "function" ||
    typeof globalThis.FormData !== "function" ||
    typeof globalThis.Blob !== "function"
  ) {
    throw fail("This runtime cannot upload local media", "local_media_upload_unavailable")
  }
  const form = new globalThis.FormData()
  for (const [index, parameter] of target.parameters.entries()) {
    if (!isObject(parameter) || typeof parameter.name !== "string" || typeof parameter.value !== "string") {
      throw fail(`Shopify returned an invalid staged parameter at index ${index}`, "shopify_invalid_response")
    }
    form.append(parameter.name, parameter.value)
  }
  let content
  try {
    content = readFileSync(file.source)
  } catch (error) {
    throw fail(`Local image became unreadable: ${error.message}`, "local_media_unavailable", {
      filename: file.filename,
    })
  }
  form.append("file", new globalThis.Blob([content], { type: file.mimeType }), file.filename)
  let response
  try {
    response = await fetchImpl(target.url, { method: "POST", body: form })
  } catch (error) {
    throw fail(`Uploading the local image failed: ${error.message}`, "staged_upload_failed", {
      filename: file.filename,
    })
  }
  if (!response?.ok) {
    throw fail("Uploading the local image failed", "staged_upload_failed", {
      filename: file.filename,
      status: response?.status,
    })
  }
}

function fileSnapshot(file) {
  return {
    fileId: file?.id || null,
    filename: null,
    alt: file?.alt || "",
    status: file?.fileStatus || null,
    url: file?.image?.url || null,
  }
}

export async function uploadImage({
  store,
  input,
  apply,
  executor = runShopifyOperation,
  fetchImpl = globalThis.fetch,
  wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
}) {
  const normalized = normalizeUploadImageInput(input)
  if (!apply) {
    return {
      ok: true,
      dryRun: true,
      store,
      plan: {
        sourceType: normalized.kind,
        source: normalized.source,
        filename: normalized.filename,
        ...(normalized.mimeType ? { mimeType: normalized.mimeType, size: normalized.size } : {}),
        ...(normalized.alt ? { alt: normalized.alt } : {}),
      },
    }
  }

  let originalSource = normalized.source
  if (normalized.kind === "local") {
    const stagedResult = execute(executor, {
      store,
      query: STAGED_UPLOADS_MUTATION,
      variables: {
        input: [{
          resource: "IMAGE",
          filename: normalized.filename,
          mimeType: normalized.mimeType,
          httpMethod: "POST",
        }],
      },
      allowMutations: true,
      redactStdout: true,
    })
    const stagedPayload = throwOnUserErrors(stagedResult?.stagedUploadsCreate, "stagedUploadsCreate")
    const target = assertStagedTarget(stagedPayload.stagedTargets?.[0])
    await postStagedFile({ file: normalized, target, fetchImpl })
    originalSource = target.resourceUrl
  }

  const createResult = execute(executor, {
    store,
    query: FILE_CREATE_MUTATION,
    variables: {
      files: [{
        originalSource,
        contentType: "IMAGE",
        filename: normalized.filename,
        ...(normalized.alt ? { alt: normalized.alt } : {}),
      }],
    },
    allowMutations: true,
  })
  const createPayload = throwOnUserErrors(createResult?.fileCreate, "fileCreate")
  let file = createPayload.files?.[0]
  if (!file?.id) throw fail("Shopify returned no created file", "shopify_invalid_response")

  for (let attempt = 0; attempt < 5 && !file?.image?.url; attempt += 1) {
    if (file.fileStatus === "FAILED") {
      throw fail("Shopify failed to process the uploaded image", "file_processing_failed", {
        file: fileSnapshot(file),
      })
    }
    await wait(1000)
    const pollResult = execute(executor, {
      store,
      query: GET_IMAGE_FILES_QUERY,
      variables: { ids: [file.id] },
    })
    file = pollResult?.nodes?.[0]
  }
  if (!file?.image?.url) {
    throw fail("Shopify image processing did not finish in time", "file_processing_incomplete", {
      file: fileSnapshot(file),
    })
  }
  return {
    ok: true,
    dryRun: false,
    file: {
      fileId: file.id,
      filename: normalized.filename,
      alt: file.alt || normalized.alt || "",
      status: file.fileStatus,
      url: file.image.url,
    },
  }
}
