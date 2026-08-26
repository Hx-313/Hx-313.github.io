import assert from "node:assert/strict"
import test from "node:test"

import {
  COLLECTION_PUBLICATION_STATE_QUERY,
  PUBLICATION_BY_ID_QUERY,
  PUBLICATIONS_QUERY,
  PUBLISH_COLLECTION_MUTATION,
  UNPUBLISH_COLLECTION_MUTATION,
  normalizeCollectionPublicationInput,
  setCollectionPublication,
} from "./lib/publication_operations.mjs"

test("set_collection_publication requires one exact Publication target", () => {
  assert.deepEqual(normalizeCollectionPublicationInput({
    id: "gid://shopify/Collection/1",
    action: "UNPUBLISH",
    publication: { name: " Online Store " },
  }), {
    id: "gid://shopify/Collection/1",
    action: "unpublish",
    publication: { name: "Online Store" },
  })
  assert.throws(
    () => normalizeCollectionPublicationInput({
      id: "gid://shopify/Collection/1",
      action: "publish",
      publication: {},
    }),
    /exactly one/,
  )
})

test("collection publication dry-run resolves an exact case-sensitive name and reads state", () => {
  const calls = []
  const result = setCollectionPublication({
    store: "example.myshopify.com",
    input: {
      id: "gid://shopify/Collection/1",
      action: "publish",
      publication: { name: "Online Store" },
    },
    apply: false,
    executor: (request) => {
      calls.push(request)
      if (request.query === PUBLICATIONS_QUERY) {
        return {
          publications: {
            nodes: [
              { id: "gid://shopify/Publication/1", name: "Online Store" },
              { id: "gid://shopify/Publication/2", name: "online store" },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        }
      }
      if (request.query === COLLECTION_PUBLICATION_STATE_QUERY) {
        return {
          collection: {
            id: "gid://shopify/Collection/1",
            title: "Summer",
            publishedOnPublication: false,
          },
        }
      }
      throw new Error("unexpected query")
    },
  })
  assert.deepEqual(calls.map(({ query }) => query), [PUBLICATIONS_QUERY, COLLECTION_PUBLICATION_STATE_QUERY])
  assert.equal(result.publication.id, "gid://shopify/Publication/1")
  assert.equal(result.willChange, true)
})

test("collection publication rejects ambiguous exact Publication names", () => {
  assert.throws(
    () => setCollectionPublication({
      store: "example.myshopify.com",
      input: {
        id: "gid://shopify/Collection/1",
        action: "publish",
        publication: { name: "Online Store" },
      },
      apply: false,
      executor: () => ({
        publications: {
          nodes: [
            { id: "gid://shopify/Publication/1", name: "Online Store" },
            { id: "gid://shopify/Publication/2", name: "Online Store" },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      }),
    }),
    (error) => error.code === "publication_ambiguous",
  )
})

test("collection publication apply mutates once and verifies the requested state", () => {
  const calls = []
  let reads = 0
  const result = setCollectionPublication({
    store: "example.myshopify.com",
    input: {
      id: "gid://shopify/Collection/1",
      action: "unpublish",
      publication: { id: "gid://shopify/Publication/1" },
    },
    apply: true,
    executor: (request) => {
      calls.push(request)
      if (request.query === PUBLICATION_BY_ID_QUERY) {
        return { publication: { id: "gid://shopify/Publication/1", name: "Online Store" } }
      }
      if (request.query === COLLECTION_PUBLICATION_STATE_QUERY) {
        reads += 1
        return {
          collection: {
            id: "gid://shopify/Collection/1",
            title: "Summer",
            publishedOnPublication: reads === 1,
          },
        }
      }
      if (request.query === UNPUBLISH_COLLECTION_MUTATION) {
        return { publishableUnpublish: { userErrors: [] } }
      }
      throw new Error("unexpected query")
    },
  })
  assert.deepEqual(calls.map(({ query }) => query), [
    PUBLICATION_BY_ID_QUERY,
    COLLECTION_PUBLICATION_STATE_QUERY,
    UNPUBLISH_COLLECTION_MUTATION,
    COLLECTION_PUBLICATION_STATE_QUERY,
  ])
  assert.equal(calls[2].allowMutations, true)
  assert.equal(result.changed, true)
  assert.deepEqual(result.after, { published: false })
})

test("collection publish apply is a no-op when already published", () => {
  const calls = []
  const result = setCollectionPublication({
    store: "example.myshopify.com",
    input: {
      id: "gid://shopify/Collection/1",
      action: "publish",
      publication: { id: "gid://shopify/Publication/1" },
    },
    apply: true,
    executor: (request) => {
      calls.push(request)
      assert.notEqual(request.query, PUBLISH_COLLECTION_MUTATION)
      if (request.query === PUBLICATION_BY_ID_QUERY) {
        return { publication: { id: "gid://shopify/Publication/1", name: "Online Store" } }
      }
      return {
        collection: {
          id: "gid://shopify/Collection/1",
          title: "Summer",
          publishedOnPublication: true,
        },
      }
    },
  })
  assert.equal(calls.length, 2)
  assert.equal(result.changed, false)
})
