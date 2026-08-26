import assert from "node:assert/strict"
import test from "node:test"

import {
  FILE_CREATE_MUTATION,
  uploadImage,
} from "./lib/image_operations.mjs"

import {
  COLLECTION_ADD_PRODUCTS_MUTATION,
  COLLECTION_BY_ID_QUERY,
  COLLECTION_CREATE_MUTATION,
  COLLECTION_MEMBERSHIP_QUERY,
  COLLECTION_REMOVE_PRODUCTS_MUTATION,
  COLLECTION_UPDATE_MUTATION,
  COLLECTIONS_BY_NAME_QUERY,
  GET_COLLECTION_QUERY,
  JOB_QUERY,
  SEARCH_COLLECTIONS_QUERY,
  addToCollection,
  createCollection,
  getCollection,
  normalizeCreateCollectionInput,
  normalizeSearchCollectionsInput,
  removeFromCollection,
  resolveCollection,
  searchCollections,
  updateCollection,
} from "./lib/collection_operations.mjs"

function collectionFixture(overrides = {}) {
  return {
    id: "gid://shopify/Collection/1",
    title: "Summer",
    handle: "summer",
    description: "Summer essentials",
    descriptionHtml: "<p>Summer essentials</p>",
    seo: { title: "Summer SEO", description: "Shop summer essentials" },
    updatedAt: "2026-08-07T00:00:00Z",
    sortOrder: "BEST_SELLING",
    image: { id: "gid://shopify/CollectionImage/1", url: "https://cdn.example.com/summer.jpg", altText: "Summer" },
    productsCount: { count: 2, precision: "EXACT" },
    ruleSet: null,
    products: {
      nodes: [
        { id: "gid://shopify/Product/1", title: "One", handle: "one", status: "ACTIVE" },
        { id: "gid://shopify/Product/2", title: "Two", handle: "two", status: "DRAFT" },
      ],
      pageInfo: { hasNextPage: false, endCursor: "products-end" },
    },
    resourcePublicationsV2: {
      nodes: [{
        isPublished: true,
        publishDate: "2026-08-07T00:00:00Z",
        publication: { id: "gid://shopify/Publication/1", name: "Online Store" },
      }],
      pageInfo: { hasNextPage: false, endCursor: "publications-end" },
    },
    ...overrides,
  }
}

function smartRuleSet() {
  return {
    appliedDisjunctively: false,
    rules: [{ column: "TAG", relation: "EQUALS", condition: "summer", conditionObject: null }],
  }
}

function membership({ one = false, two = false, smart = false } = {}) {
  return {
    collection: {
      id: "gid://shopify/Collection/1",
      title: "Summer",
      ruleSet: smart ? { appliedDisjunctively: false } : null,
    },
    nodes: [
      { id: "gid://shopify/Product/1", title: "One", inCollection: one },
      { id: "gid://shopify/Product/2", title: "Two", inCollection: two },
    ],
  }
}

test("Collection jobs use the QueryRoot job field rather than node", () => {
  assert.match(JOB_QUERY, /\bjob\(id: \$id\)/)
  assert.doesNotMatch(JOB_QUERY, /\bnode\(id:/)
})

test("search_collections validates pagination and preserves Collection kind", () => {
  assert.deepEqual(normalizeSearchCollectionsInput({}), {
    first: 10,
    after: undefined,
    query: undefined,
    sortKey: undefined,
    reverse: false,
  })
  assert.throws(() => normalizeSearchCollectionsInput({ first: 51 }), /1 to 50/)
  assert.throws(() => normalizeSearchCollectionsInput({ sort_key: "RELEVANCE" }), /requires search_query/)
  const calls = []
  const result = searchCollections({
    store: "example.myshopify.com",
    input: { search_query: "title:Summer", sort_key: "RELEVANCE" },
    executor: (request) => {
      calls.push(request)
      return {
        collections: {
          nodes: [collectionFixture({ ruleSet: smartRuleSet() })],
          pageInfo: { hasNextPage: false, endCursor: "end" },
        },
      }
    },
  })
  assert.equal(calls[0].query, SEARCH_COLLECTIONS_QUERY)
  assert.equal(result.collections[0].kind, "smart")
  assert.equal(result.collections[0].rules.conditions[0].column, "TAG")
})

test("get_collection returns rules, publication state, and complete membership", () => {
  const calls = []
  const result = getCollection({
    store: "example.myshopify.com",
    input: { id: "gid://shopify/Collection/1", all_products: true },
    executor: (request) => {
      calls.push(request)
      return { collection: collectionFixture() }
    },
  })
  assert.equal(calls[0].query, GET_COLLECTION_QUERY)
  assert.equal(result.collection.kind, "manual")
  assert.equal(result.collection.productsComplete, true)
  assert.equal(result.collection.publications[0].publicationName, "Online Store")
  assert.equal(result.collection.seo.title, "Summer SEO")
})

test("get_collection paginates products only when all_products is true", () => {
  const calls = []
  const result = getCollection({
    store: "example.myshopify.com",
    input: { id: "gid://shopify/Collection/1", products_first: 1, all_products: true },
    executor: (request) => {
      calls.push(request)
      const second = request.variables.productsAfter === "next"
      return {
        collection: collectionFixture({
          products: {
            nodes: [second
              ? { id: "gid://shopify/Product/2", title: "Two", handle: "two", status: "ACTIVE" }
              : { id: "gid://shopify/Product/1", title: "One", handle: "one", status: "ACTIVE" }],
            pageInfo: second
              ? { hasNextPage: false, endCursor: "end" }
              : { hasNextPage: true, endCursor: "next" },
          },
        }),
      }
    },
  })
  assert.equal(calls.length, 2)
  assert.deepEqual(result.collection.products.map(({ id }) => id), [
    "gid://shopify/Product/1",
    "gid://shopify/Product/2",
  ])
  assert.equal(result.collection.productsComplete, true)
})

test("resolve_collection requires one case-sensitive exact title match", () => {
  const result = resolveCollection({
    store: "example.myshopify.com",
    input: { name: "Summer" },
    executor: (request) => {
      assert.equal(request.query, COLLECTIONS_BY_NAME_QUERY)
      assert.equal(request.variables.query, 'title:"Summer"')
      return {
        collections: {
          nodes: [
            { id: "gid://shopify/Collection/1", title: "Summer", handle: "summer" },
            { id: "gid://shopify/Collection/2", title: "summer", handle: "summer-lower" },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      }
    },
  })
  assert.equal(result.collection.id, "gid://shopify/Collection/1")
})

test("resolve_collection uses a minimal read for an explicit GID", () => {
  const result = resolveCollection({
    store: "example.myshopify.com",
    input: { id: "gid://shopify/Collection/1" },
    executor: (request) => {
      assert.equal(request.query, COLLECTION_BY_ID_QUERY)
      return { collection: { id: "gid://shopify/Collection/1", title: "Summer", handle: "summer" } }
    },
  })
  assert.equal(result.resolution, "explicit_id")
})

test("create_collection maps business rule labels and never publishes implicitly", () => {
  const normalized = normalizeCreateCollectionInput({
    title: "Summer",
    kind: "smart",
    rules: {
      match: "all",
      conditions: [{ field: "Product tag", relation: "equals", value: "summer" }],
    },
  })
  assert.deepEqual(normalized.input.ruleSet, {
    appliedDisjunctively: false,
    rules: [{ column: "TAG", relation: "EQUALS", condition: "summer" }],
  })
  const dryRun = createCollection({
    store: "example.myshopify.com",
    input: { title: "Summer", kind: "manual" },
    apply: false,
    executor: () => { throw new Error("executor should not run") },
  })
  assert.match(dryRun.plan.publication, /unpublished/)
})

test("create_collection applies one mutation then verifies the returned GID", () => {
  const calls = []
  const result = createCollection({
    store: "example.myshopify.com",
    input: {
      title: "Summer",
      kind: "manual",
      descriptionHtml: "<p>Summer essentials</p>",
      seo: { title: "Summer SEO", description: "Shop summer essentials" },
      sort: "best-selling",
      productIds: ["gid://shopify/Product/1"],
    },
    apply: true,
    executor: (request) => {
      calls.push(request)
      if (request.query === COLLECTION_CREATE_MUTATION) {
        return { collectionCreate: { collection: { id: "gid://shopify/Collection/1" }, userErrors: [] } }
      }
      if (request.query === GET_COLLECTION_QUERY) return { collection: collectionFixture() }
      throw new Error("unexpected query")
    },
  })
  assert.deepEqual(calls.map(({ query }) => query), [COLLECTION_CREATE_MUTATION, GET_COLLECTION_QUERY])
  assert.equal(calls[0].allowMutations, true)
  assert.deepEqual(calls[0].variables.input.products, ["gid://shopify/Product/1"])
  assert.deepEqual(calls[0].variables.input.seo, {
    title: "Summer SEO",
    description: "Shop summer essentials",
  })
  assert.equal(result.collection.id, "gid://shopify/Collection/1")
})

test("update_collection includes SEO in the pre-read diff and verifies it", async () => {
  const calls = []
  let reads = 0
  const desiredSeo = { title: "Summer 2026 SEO", description: "New summer arrivals" }
  const result = await updateCollection({
    store: "example.myshopify.com",
    input: { id: "gid://shopify/Collection/1", seo: desiredSeo },
    apply: true,
    executor: (request) => {
      calls.push(request)
      if (request.query === GET_COLLECTION_QUERY) {
        reads += 1
        return { collection: collectionFixture(reads === 1 ? {} : { seo: desiredSeo }) }
      }
      if (request.query === COLLECTION_UPDATE_MUTATION) {
        return {
          collectionUpdate: {
            collection: { id: "gid://shopify/Collection/1", title: "Summer" },
            job: null,
            userErrors: [],
          },
        }
      }
      throw new Error("unexpected query")
    },
  })
  assert.deepEqual(calls[1].variables.input, {
    id: "gid://shopify/Collection/1",
    seo: desiredSeo,
  })
  assert.deepEqual(result.changes[0], {
    field: "seo",
    before: { title: "Summer SEO", description: "Shop summer essentials" },
    after: desiredSeo,
  })
  assert.deepEqual(result.collection.seo, desiredSeo)
})

test("update_collection pre-reads, emits a field diff, and preserves unspecified fields", async () => {
  const calls = []
  const result = await updateCollection({
    store: "example.myshopify.com",
    input: { id: "gid://shopify/Collection/1", title: "Summer 2026" },
    apply: false,
    executor: (request) => {
      calls.push(request)
      return { collection: collectionFixture() }
    },
  })
  assert.deepEqual(calls.map(({ query }) => query), [GET_COLLECTION_QUERY])
  assert.deepEqual(result.mutationInput, {
    id: "gid://shopify/Collection/1",
    title: "Summer 2026",
  })
  assert.deepEqual(result.changes[0], { field: "title", before: "Summer", after: "Summer 2026" })
})

test("update_collection rejects manual-to-smart conversion before mutation", async () => {
  await assert.rejects(
    updateCollection({
      store: "example.myshopify.com",
      input: {
        id: "gid://shopify/Collection/1",
        rules: { match: "all", conditions: [{ field: "tag", relation: "equals", value: "summer" }] },
      },
      apply: true,
      executor: (request) => {
        assert.equal(request.query, GET_COLLECTION_QUERY)
        return { collection: collectionFixture() }
      },
    }),
    (error) => error.code === "collection_type_transition_unsupported",
  )
})

test("update_collection executes only the confirmed patch and verifies", async () => {
  const calls = []
  let readCount = 0
  const result = await updateCollection({
    store: "example.myshopify.com",
    input: { id: "gid://shopify/Collection/1", title: "Summer 2026" },
    apply: true,
    executor: (request) => {
      calls.push(request)
      if (request.query === GET_COLLECTION_QUERY) {
        readCount += 1
        return { collection: collectionFixture(readCount === 1 ? {} : { title: "Summer 2026" }) }
      }
      if (request.query === COLLECTION_UPDATE_MUTATION) {
        return {
          collectionUpdate: {
            collection: { id: "gid://shopify/Collection/1", title: "Summer 2026" },
            job: null,
            userErrors: [],
          },
        }
      }
      throw new Error("unexpected query")
    },
  })
  assert.deepEqual(calls.map(({ query }) => query), [
    GET_COLLECTION_QUERY,
    COLLECTION_UPDATE_MUTATION,
    GET_COLLECTION_QUERY,
  ])
  assert.deepEqual(calls[1].variables.input, {
    id: "gid://shopify/Collection/1",
    title: "Summer 2026",
  })
  assert.equal(result.collection.title, "Summer 2026")
})

test("update_collection waits for an asynchronous rule-membership job before verification", async () => {
  const calls = []
  let reads = 0
  let jobReads = 0
  const desiredRuleSet = {
    appliedDisjunctively: true,
    rules: [{ column: "TAG", relation: "EQUALS", condition: "winter", conditionObject: null }],
  }
  const result = await updateCollection({
    store: "example.myshopify.com",
    input: {
      id: "gid://shopify/Collection/1",
      rules: { match: "any", conditions: [{ field: "tag", relation: "equals", value: "winter" }] },
    },
    apply: true,
    wait: async () => {},
    executor: (request) => {
      calls.push(request)
      if (request.query === GET_COLLECTION_QUERY) {
        reads += 1
        return { collection: collectionFixture({ ruleSet: reads === 1 ? smartRuleSet() : desiredRuleSet }) }
      }
      if (request.query === COLLECTION_UPDATE_MUTATION) {
        return {
          collectionUpdate: {
            collection: null,
            job: { id: "gid://shopify/Job/rules", done: false },
            userErrors: [],
          },
        }
      }
      if (request.query === JOB_QUERY) {
        jobReads += 1
        return { job: { id: "gid://shopify/Job/rules", done: jobReads === 2 } }
      }
      throw new Error("unexpected query")
    },
  })
  assert.deepEqual(calls.map(({ query }) => query), [
    GET_COLLECTION_QUERY,
    COLLECTION_UPDATE_MUTATION,
    JOB_QUERY,
    JOB_QUERY,
    GET_COLLECTION_QUERY,
  ])
  assert.equal(result.job.done, true)
  assert.equal(result.collection.rules.match, "any")
})

test("add_to_collection skips existing products and verifies missing membership", () => {
  const calls = []
  let reads = 0
  const result = addToCollection({
    store: "example.myshopify.com",
    input: {
      collectionId: "gid://shopify/Collection/1",
      productIds: ["gid://shopify/Product/1", "gid://shopify/Product/2"],
    },
    apply: true,
    executor: (request) => {
      calls.push(request)
      if (request.query === COLLECTION_MEMBERSHIP_QUERY) {
        reads += 1
        return reads === 1 ? membership({ one: true }) : membership({ one: true, two: true })
      }
      if (request.query === COLLECTION_ADD_PRODUCTS_MUTATION) {
        return { collectionAddProducts: { collection: { id: "gid://shopify/Collection/1" }, userErrors: [] } }
      }
      throw new Error("unexpected query")
    },
  })
  assert.deepEqual(calls[1].variables.productIds, ["gid://shopify/Product/2"])
  assert.deepEqual(result.addedProductIds, ["gid://shopify/Product/2"])
})

test("membership scripts reject smart Collections before mutation", () => {
  assert.throws(
    () => addToCollection({
      store: "example.myshopify.com",
      input: {
        collectionId: "gid://shopify/Collection/1",
        productIds: ["gid://shopify/Product/1", "gid://shopify/Product/2"],
      },
      apply: true,
      executor: (request) => {
        assert.equal(request.query, COLLECTION_MEMBERSHIP_QUERY)
        return membership({ smart: true })
      },
    }),
    (error) => error.code === "smart_collection_membership_unsupported",
  )
})

test("remove_from_collection waits for Shopify job and verifies absence", async () => {
  const calls = []
  let reads = 0
  const result = await removeFromCollection({
    store: "example.myshopify.com",
    input: {
      collectionId: "gid://shopify/Collection/1",
      productIds: ["gid://shopify/Product/1", "gid://shopify/Product/2"],
    },
    apply: true,
    wait: async () => {},
    executor: (request) => {
      calls.push(request)
      if (request.query === COLLECTION_MEMBERSHIP_QUERY) {
        reads += 1
        return reads === 1 ? membership({ one: true }) : membership()
      }
      if (request.query === COLLECTION_REMOVE_PRODUCTS_MUTATION) {
        return { collectionRemoveProducts: { job: { id: "gid://shopify/Job/1", done: false }, userErrors: [] } }
      }
      if (request.query === JOB_QUERY) return { job: { id: "gid://shopify/Job/1", done: true } }
      throw new Error("unexpected query")
    },
  })
  assert.deepEqual(calls.map(({ query }) => query), [
    COLLECTION_MEMBERSHIP_QUERY,
    COLLECTION_REMOVE_PRODUCTS_MUTATION,
    JOB_QUERY,
    COLLECTION_MEMBERSHIP_QUERY,
  ])
  assert.deepEqual(result.removedProductIds, ["gid://shopify/Product/1"])
  assert.deepEqual(result.alreadyAbsentProductIds, ["gid://shopify/Product/2"])
})

test("upload_image is self-contained, dry-runs safely, and creates a reusable remote image", async () => {
  const dryRun = await uploadImage({
    store: "example.myshopify.com",
    input: { sourceUrl: "https://example.com/summer.jpg", alt: "Summer" },
    apply: false,
    executor: () => { throw new Error("executor should not run") },
  })
  assert.equal(dryRun.plan.sourceType, "remote")

  const calls = []
  const result = await uploadImage({
    store: "example.myshopify.com",
    input: { sourceUrl: "https://example.com/summer.jpg", alt: "Summer" },
    apply: true,
    executor: (request) => {
      calls.push(request)
      assert.equal(request.query, FILE_CREATE_MUTATION)
      return {
        fileCreate: {
          files: [{
            id: "gid://shopify/MediaImage/1",
            alt: "Summer",
            fileStatus: "READY",
            image: { url: "https://cdn.shopify.com/summer.jpg" },
          }],
          userErrors: [],
        },
      }
    },
  })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].allowMutations, true)
  assert.equal(result.file.url, "https://cdn.shopify.com/summer.jpg")
})
