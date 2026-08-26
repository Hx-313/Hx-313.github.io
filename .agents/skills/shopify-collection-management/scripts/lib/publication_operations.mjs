import {
  fail,
  isObject,
  requireGid,
  requiredString,
  runShopifyOperation,
  throwOnUserErrors,
} from "./runtime.mjs"

export const PUBLICATION_BY_ID_QUERY = `
query GetPublicationTarget($id: ID!) {
  publication(id: $id) { id name }
}`.trim()

export const PUBLICATIONS_QUERY = `
query ListPublicationTargets($first: Int!, $after: String) {
  publications(first: $first, after: $after) {
    nodes { id name }
    pageInfo { hasNextPage endCursor }
  }
}`.trim()

export const COLLECTION_PUBLICATION_STATE_QUERY = `
query GetCollectionPublicationState($id: ID!, $publicationId: ID!) {
  collection(id: $id) {
    id
    title
    publishedOnPublication(publicationId: $publicationId)
  }
}`.trim()

export const PUBLISH_COLLECTION_MUTATION = `
mutation PublishCollection($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    userErrors { field message }
  }
}`.trim()

export const UNPUBLISH_COLLECTION_MUTATION = `
mutation UnpublishCollection($id: ID!, $input: [PublicationInput!]!) {
  publishableUnpublish(id: $id, input: $input) {
    userErrors { field message }
  }
}`.trim()

const MAX_PAGES = 100

function execute(executor, request) {
  return executor(request)
}

export function normalizeCollectionPublicationInput(raw) {
  if (!isObject(raw)) throw fail("set_collection_publication input must be an object")
  const id = requireGid(raw.id, "Collection", "id")
  const action = requiredString(raw.action, "action").toLowerCase()
  if (!new Set(["publish", "unpublish"]).has(action)) {
    throw fail("action must be publish or unpublish")
  }
  if (!isObject(raw.publication)) throw fail("publication must be an object")
  const hasId = raw.publication.id !== undefined
  const hasName = raw.publication.name !== undefined
  if (hasId === hasName) throw fail("publication must contain exactly one of id or name")
  const publication = hasId
    ? { id: requireGid(raw.publication.id, "Publication", "publication.id") }
    : { name: requiredString(raw.publication.name, "publication.name") }
  return { id, action, publication }
}

function resolvePublication({ store, target, executor }) {
  if (target.id) {
    const result = execute(executor, {
      store,
      query: PUBLICATION_BY_ID_QUERY,
      variables: { id: target.id },
    })
    if (!result?.publication?.id || result.publication.id !== target.id) {
      throw fail("The confirmed Publication GID was not found", "publication_not_found", {
        publicationId: target.id,
      })
    }
    return {
      id: result.publication.id,
      name: result.publication.name || null,
      resolution: "explicit_id",
    }
  }

  const matches = []
  let after
  let page = 0
  do {
    if (page >= MAX_PAGES) {
      throw fail("Publication pagination exceeded the safety limit", "shopify_pagination_limit")
    }
    const result = execute(executor, {
      store,
      query: PUBLICATIONS_QUERY,
      variables: { first: 100, after },
    })
    const connection = result?.publications
    if (!connection) throw fail("Shopify returned no publications payload", "shopify_invalid_response")
    matches.push(...(connection.nodes || []).filter((entry) => entry?.name?.trim() === target.name))
    if (!connection.pageInfo?.hasNextPage) break
    after = connection.pageInfo.endCursor
    if (!after) throw fail("Shopify returned no publication cursor", "shopify_invalid_response")
    page += 1
  } while (after)

  if (matches.length === 0) {
    throw fail("No Publication matches the confirmed exact name", "publication_not_found", {
      publicationName: target.name,
    })
  }
  if (matches.length > 1) {
    throw fail("More than one Publication matches the confirmed exact name", "publication_ambiguous", {
      publicationName: target.name,
      candidates: matches.map(({ id, name }) => ({ id, name })),
    })
  }
  return { id: matches[0].id, name: matches[0].name, resolution: "exact_name" }
}

function readCollectionPublicationState({ store, id, publicationId, executor }) {
  const result = execute(executor, {
    store,
    query: COLLECTION_PUBLICATION_STATE_QUERY,
    variables: { id, publicationId },
  })
  if (!result?.collection) throw fail(`Collection not found: ${id}`, "collection_not_found")
  return {
    id: result.collection.id,
    title: result.collection.title,
    published: result.collection.publishedOnPublication === true,
  }
}

export function setCollectionPublication({ store, input, apply, executor = runShopifyOperation }) {
  const normalized = normalizeCollectionPublicationInput(input)
  const publication = resolvePublication({ store, target: normalized.publication, executor })
  const before = readCollectionPublicationState({
    store,
    id: normalized.id,
    publicationId: publication.id,
    executor,
  })
  const desiredPublished = normalized.action === "publish"
  const willChange = before.published !== desiredPublished

  if (!apply) {
    return {
      ok: true,
      dryRun: true,
      store,
      action: normalized.action,
      resource: before,
      publication,
      before: { published: before.published },
      desired: { published: desiredPublished },
      willChange,
    }
  }

  if (!willChange) {
    return {
      ok: true,
      dryRun: false,
      changed: false,
      action: normalized.action,
      resource: before,
      publication,
      before: { published: before.published },
      after: { published: before.published },
    }
  }

  const query = desiredPublished ? PUBLISH_COLLECTION_MUTATION : UNPUBLISH_COLLECTION_MUTATION
  const payloadName = desiredPublished ? "publishablePublish" : "publishableUnpublish"
  const result = execute(executor, {
    store,
    query,
    variables: { id: normalized.id, input: [{ publicationId: publication.id }] },
    allowMutations: true,
  })
  throwOnUserErrors(result?.[payloadName], payloadName)

  const after = readCollectionPublicationState({
    store,
    id: normalized.id,
    publicationId: publication.id,
    executor,
  })
  if (after.published !== desiredPublished) {
    throw fail("Collection publication verification did not match the requested outcome", "verification_failed", {
      collectionId: normalized.id,
      publication,
      expectedPublished: desiredPublished,
      actualPublished: after.published,
    })
  }
  return {
    ok: true,
    dryRun: false,
    changed: true,
    action: normalized.action,
    resource: after,
    publication,
    before: { published: before.published },
    after: { published: after.published },
  }
}
