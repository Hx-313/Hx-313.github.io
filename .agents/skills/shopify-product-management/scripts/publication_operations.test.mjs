import assert from "node:assert/strict"
import test from "node:test"

import {
  PRODUCT_PUBLICATION_STATE_QUERY,
  PUBLICATION_BY_ID_QUERY,
  PUBLICATIONS_QUERY,
  PUBLISH_PRODUCT_MUTATION,
  UNPUBLISH_PRODUCT_MUTATION,
  normalizeProductPublicationInput,
  setProductPublication,
} from "./lib/publication_operations.mjs"

test("set_product_publication requires one exact Publication target", () => {
  assert.deepEqual(normalizeProductPublicationInput({
    id: "gid://shopify/Product/1",
    action: "PUBLISH",
    publication: { name: " Online Store " },
  }), {
    id: "gid://shopify/Product/1",
    action: "publish",
    publication: { name: "Online Store" },
  })
  assert.throws(
    () => normalizeProductPublicationInput({
      id: "gid://shopify/Product/1",
      action: "publish",
      publication: { id: "gid://shopify/Publication/1", name: "Online Store" },
    }),
    /exactly one/,
  )
})

test("product publication dry-run resolves an exact case-sensitive name and reads state", () => {
  const calls = []
  const result = setProductPublication({
    store: "example.myshopify.com",
    input: {
      id: "gid://shopify/Product/1",
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
      if (request.query === PRODUCT_PUBLICATION_STATE_QUERY) {
        return {
          product: {
            id: "gid://shopify/Product/1",
            title: "Test",
            status: "ACTIVE",
            publishedOnPublication: false,
          },
        }
      }
      throw new Error("unexpected query")
    },
  })
  assert.deepEqual(calls.map(({ query }) => query), [PUBLICATIONS_QUERY, PRODUCT_PUBLICATION_STATE_QUERY])
  assert.equal(result.publication.id, "gid://shopify/Publication/1")
  assert.equal(result.willChange, true)
  assert.deepEqual(result.desired, { published: true })
})

test("product publication rejects ambiguous exact Publication names", () => {
  assert.throws(
    () => setProductPublication({
      store: "example.myshopify.com",
      input: {
        id: "gid://shopify/Product/1",
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
    (error) => error.code === "publication_ambiguous" && error.details.candidates.length === 2,
  )
})

test("product publication apply mutates once and verifies the requested state", () => {
  const calls = []
  let reads = 0
  const result = setProductPublication({
    store: "example.myshopify.com",
    input: {
      id: "gid://shopify/Product/1",
      action: "publish",
      publication: { id: "gid://shopify/Publication/1" },
    },
    apply: true,
    executor: (request) => {
      calls.push(request)
      if (request.query === PUBLICATION_BY_ID_QUERY) {
        return { publication: { id: "gid://shopify/Publication/1", name: "Online Store" } }
      }
      if (request.query === PRODUCT_PUBLICATION_STATE_QUERY) {
        reads += 1
        return {
          product: {
            id: "gid://shopify/Product/1",
            title: "Test",
            status: "ACTIVE",
            publishedOnPublication: reads > 1,
          },
        }
      }
      if (request.query === PUBLISH_PRODUCT_MUTATION) {
        return { publishablePublish: { userErrors: [] } }
      }
      throw new Error("unexpected query")
    },
  })
  assert.deepEqual(calls.map(({ query }) => query), [
    PUBLICATION_BY_ID_QUERY,
    PRODUCT_PUBLICATION_STATE_QUERY,
    PUBLISH_PRODUCT_MUTATION,
    PRODUCT_PUBLICATION_STATE_QUERY,
  ])
  assert.equal(calls[2].allowMutations, true)
  assert.deepEqual(calls[2].variables.input, [{ publicationId: "gid://shopify/Publication/1" }])
  assert.equal(result.changed, true)
  assert.deepEqual(result.after, { published: true })
})

test("product unpublish apply is a no-op when already unpublished", () => {
  const calls = []
  const result = setProductPublication({
    store: "example.myshopify.com",
    input: {
      id: "gid://shopify/Product/1",
      action: "unpublish",
      publication: { id: "gid://shopify/Publication/1" },
    },
    apply: true,
    executor: (request) => {
      calls.push(request)
      assert.notEqual(request.query, UNPUBLISH_PRODUCT_MUTATION)
      if (request.query === PUBLICATION_BY_ID_QUERY) {
        return { publication: { id: "gid://shopify/Publication/1", name: "Online Store" } }
      }
      return {
        product: {
          id: "gid://shopify/Product/1",
          title: "Test",
          status: "DRAFT",
          publishedOnPublication: false,
        },
      }
    },
  })
  assert.equal(calls.length, 2)
  assert.equal(result.changed, false)
})
