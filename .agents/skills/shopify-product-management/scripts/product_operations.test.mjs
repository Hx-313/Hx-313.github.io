import assert from "node:assert/strict"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

import {
  COLLECTION_PRODUCT_IDS_QUERY,
  FILE_CREATE_MUTATION,
  FILE_REMOVE_PRODUCT_REFERENCES_MUTATION,
  GET_IMAGE_FILES_QUERY,
  GET_PRODUCT_QUERY,
  PRODUCT_STATUS_UPDATE_MUTATION,
  PRODUCT_UPDATE_MUTATION,
  PRODUCT_VARIANTS_UPDATE_MUTATION,
  SEARCH_PRODUCTS_QUERY,
  STAGED_UPLOADS_MUTATION,
  bulkUpdateProductStatus,
  getProduct,
  normalizeSearchProductsInput,
  normalizeUpdateProductInput,
  searchProducts,
  updateProduct,
  uploadImage,
} from "./lib/product_operations.mjs"

function productFixture(overrides = {}) {
  return {
    id: "gid://shopify/Product/1",
    title: "Test",
    handle: "test",
    descriptionHtml: "<p>Test</p>",
    status: "DRAFT",
    vendor: "Acme",
    productType: "Shirt",
    tags: ["sale"],
    seo: { title: "Test SEO", description: "Test search description" },
    totalInventory: 5,
    featuredMedia: { preview: { image: { url: "https://cdn.example.com/front.jpg" } } },
    options: [{ id: "gid://shopify/ProductOption/1", name: "Title", position: 1, values: ["Default Title"] }],
    variants: {
      nodes: [{
        id: "gid://shopify/ProductVariant/1",
        title: "Default Title",
        sku: "SKU-1",
        price: "10.00",
        compareAtPrice: null,
        inventoryQuantity: 5,
        inventoryItem: { tracked: true },
      }],
      pageInfo: { hasNextPage: false, endCursor: "variant-cursor" },
    },
    media: {
      nodes: [{ id: "gid://shopify/MediaImage/1", alt: "Front", status: "READY", mediaContentType: "IMAGE", image: { url: "https://cdn.example.com/front.jpg" } }],
      pageInfo: { hasNextPage: false, endCursor: "media-cursor" },
    },
    resourcePublicationsV2: {
      nodes: [{
        isPublished: true,
        publishDate: "2026-08-07T00:00:00Z",
        publication: { id: "gid://shopify/Publication/1", name: "Online Store" },
      }],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
    ...overrides,
  }
}

test("get_product requires a full product GID and returns structured product data", () => {
  assert.throws(
    () => getProduct({ store: "example.myshopify.com", input: { id: "123" }, executor: () => ({}) }),
    /Product GID/,
  )
  const calls = []
  const result = getProduct({
    store: "example.myshopify.com",
    input: { id: "gid://shopify/Product/1" },
    executor: (request) => {
      calls.push(request)
      return { product: productFixture(), shop: { currencyCode: "USD" } }
    },
  })
  assert.equal(calls[0].query, GET_PRODUCT_QUERY)
  assert.equal(result.product.currencyCode, "USD")
  assert.equal(result.product.images[0].mediaId, "gid://shopify/MediaImage/1")
  assert.equal(result.product.variants[0].sku, "SKU-1")
  assert.equal(result.product.variants[0].inventoryItem.tracked, true)
  assert.equal(result.product.seo.title, "Test SEO")
  assert.equal(result.product.publications[0].publicationName, "Online Store")
  assert.equal(result.product.publicationsComplete, true)
})

test("get_product leaves unrelated connections paginated by default", () => {
  const calls = []
  const result = getProduct({
    store: "example.myshopify.com",
    input: { id: "gid://shopify/Product/1" },
    executor: (request) => {
      calls.push(request)
      return {
        product: productFixture({
          variants: { nodes: [], pageInfo: { hasNextPage: true, endCursor: "variant-next" } },
          media: { nodes: [], pageInfo: { hasNextPage: true, endCursor: "media-next" } },
        }),
        shop: { currencyCode: "USD" },
      }
    },
  })
  assert.equal(calls.length, 1)
  assert.equal(result.product.variantsPageInfo.hasNextPage, true)
  assert.equal(result.product.mediaPageInfo.hasNextPage, true)
})

test("get_product paginates complete variant and media verification state", () => {
  const calls = []
  const result = getProduct({
    store: "example.myshopify.com",
    input: { id: "gid://shopify/Product/1" },
    paginateVariants: true,
    paginateMedia: true,
    executor: (request) => {
      calls.push(request)
      if (calls.length === 1) {
        return {
          product: productFixture({
            variants: {
              nodes: [{
                id: "gid://shopify/ProductVariant/1",
                title: "One",
                sku: "ONE",
                price: "10.00",
                compareAtPrice: null,
                inventoryQuantity: 1,
                inventoryItem: { tracked: true },
                selectedOptions: [{ name: "Title", value: "One" }],
              }],
              pageInfo: { hasNextPage: true, endCursor: "variant-1" },
            },
            media: {
              nodes: [{
                id: "gid://shopify/MediaImage/1",
                alt: "One",
                status: "READY",
                mediaContentType: "IMAGE",
                image: { url: "https://cdn.example.com/one.jpg" },
              }],
              pageInfo: { hasNextPage: true, endCursor: "media-1" },
            },
          }),
          shop: { currencyCode: "USD" },
        }
      }
      return {
        product: {
          id: "gid://shopify/Product/1",
          variants: {
            nodes: [{
              id: "gid://shopify/ProductVariant/2",
              title: "Two",
              sku: "TWO",
              price: "12.00",
              compareAtPrice: null,
              inventoryQuantity: 2,
              inventoryItem: { tracked: true },
              selectedOptions: [{ name: "Title", value: "Two" }],
            }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
          media: {
            nodes: [{
              id: "gid://shopify/Video/2",
              alt: "Two",
              status: "READY",
              mediaContentType: "VIDEO",
            }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      }
    },
  })
  assert.equal(calls.length, 2)
  assert.deepEqual(calls[1].variables, {
    id: "gid://shopify/Product/1",
    variantsAfter: "variant-1",
    mediaAfter: "media-1",
  })
  assert.equal(result.product.variants.length, 2)
  assert.equal(result.product.media.length, 2)
  assert.equal(result.product.images.length, 1)
  assert.equal(result.product.variantsPageInfo.hasNextPage, false)
  assert.equal(result.product.mediaPageInfo.hasNextPage, false)
})

test("search_products validates pagination and preserves Shopify pageInfo", () => {
  assert.deepEqual(normalizeSearchProductsInput({}), {
    first: 10,
    after: undefined,
    query: undefined,
    sortKey: undefined,
    reverse: false,
  })
  assert.throws(() => normalizeSearchProductsInput({ first: 51 }), /1 to 50/)
  assert.throws(() => normalizeSearchProductsInput({ sort_key: "RELEVANCE" }), /requires search_query/)
  const calls = []
  const result = searchProducts({
    store: "example.myshopify.com",
    input: { search_query: "sku:SKU-1", first: 5, sort_key: "RELEVANCE" },
    executor: (request) => {
      calls.push(request)
      return {
        products: {
          nodes: [productFixture({ handle: "test" })],
          pageInfo: { hasNextPage: true, endCursor: "next" },
        },
        shop: { currencyCode: "USD" },
      }
    },
  })
  assert.equal(calls[0].query, SEARCH_PRODUCTS_QUERY)
  assert.equal(calls[0].variables.sortKey, "RELEVANCE")
  assert.equal(result.products[0].handle, "test")
  assert.deepEqual(result.pageInfo, { hasNextPage: true, endCursor: "next" })
})

test("update_product dry-run maps SKU into inventoryItem and rejects local images", async () => {
  const normalized = normalizeUpdateProductInput({
    id: "gid://shopify/Product/1",
    variants: [{
      id: "gid://shopify/ProductVariant/1",
      price: "12.00",
      sku: " NEW-SKU ",
      optionValues: [{ optionName: "Color", name: "Red" }],
    }],
  })
  assert.deepEqual(normalized.variants[0], {
    id: "gid://shopify/ProductVariant/1",
    price: "12.00",
    inventoryItem: { sku: "NEW-SKU" },
    optionValues: [{ optionName: "Color", name: "Red" }],
  })
  assert.throws(
    () => normalizeUpdateProductInput({ id: "gid://shopify/Product/1", images: [{ url: "/tmp/a.png" }] }),
    /use upload_image/,
  )
  const dryRun = await updateProduct({
    store: "example.myshopify.com",
    input: { id: "gid://shopify/Product/1", status: "ACTIVE" },
    apply: false,
    executor: () => { throw new Error("executor should not run") },
  })
  assert.equal(dryRun.plan.product.status, "ACTIVE")
  const seoDryRun = await updateProduct({
    store: "example.myshopify.com",
    input: {
      id: "gid://shopify/Product/1",
      seo: { title: "Updated SEO", description: "Updated search description" },
    },
    apply: false,
    executor: () => { throw new Error("executor should not run") },
  })
  assert.deepEqual(seoDryRun.plan.product.seo, {
    title: "Updated SEO",
    description: "Updated search description",
  })
})

test("update_product owns the media baseline and final verification reads", async () => {
  const calls = []
  let productReads = 0
  const executor = (request) => {
    calls.push(request)
    if (request.query === PRODUCT_UPDATE_MUTATION) {
      return { productUpdate: { product: { id: "gid://shopify/Product/1" }, userErrors: [] } }
    }
    if (request.query === PRODUCT_VARIANTS_UPDATE_MUTATION) {
      return { productVariantsBulkUpdate: { productVariants: [], userErrors: [] } }
    }
    if (request.query === FILE_REMOVE_PRODUCT_REFERENCES_MUTATION) {
      return { fileUpdate: { files: [{ id: "gid://shopify/MediaImage/9" }], userErrors: [] } }
    }
    if (request.query === GET_PRODUCT_QUERY) {
      productReads += 1
      if (productReads === 1) {
        return {
          product: productFixture({
            media: {
              nodes: [
                {
                  id: "gid://shopify/MediaImage/1",
                  alt: "Front",
                  status: "READY",
                  mediaContentType: "IMAGE",
                  image: { url: "https://cdn.example.com/front.jpg" },
                },
                {
                  id: "gid://shopify/MediaImage/9",
                  alt: "Old",
                  status: "READY",
                  mediaContentType: "IMAGE",
                  image: { url: "https://cdn.example.com/old.jpg" },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          }),
          shop: { currencyCode: "USD" },
        }
      }
      return {
        product: productFixture({
          title: "Updated",
          seo: { title: "Updated SEO", description: "Updated search description" },
          variants: {
            nodes: [{
              id: "gid://shopify/ProductVariant/1",
              title: "Default Title",
              sku: "SKU-2",
              price: "10.00",
              compareAtPrice: null,
              inventoryQuantity: 5,
              inventoryItem: { tracked: true },
            }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
          media: {
            nodes: [
              {
                id: "gid://shopify/MediaImage/1",
                alt: "Front",
                status: "READY",
                mediaContentType: "IMAGE",
                image: { url: "https://cdn.example.com/front.jpg" },
              },
              {
                id: "gid://shopify/MediaImage/10",
                alt: "New",
                status: "READY",
                mediaContentType: "IMAGE",
                image: { url: "https://cdn.example.com/new.jpg" },
              },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        }),
        shop: { currencyCode: "USD" },
      }
    }
    throw new Error("unexpected query")
  }
  const result = await updateProduct({
    store: "example.myshopify.com",
    input: {
      id: "gid://shopify/Product/1",
      title: "Updated",
      seo: { title: "Updated SEO", description: "Updated search description" },
      images: [{ url: "https://example.com/new.jpg", altText: "New" }],
      variants: [{ id: "gid://shopify/ProductVariant/1", sku: "SKU-2" }],
      removeMediaIds: ["gid://shopify/MediaImage/9"],
    },
    apply: true,
    executor,
  })
  assert.deepEqual(calls.map((entry) => entry.query), [
    GET_PRODUCT_QUERY,
    PRODUCT_UPDATE_MUTATION,
    PRODUCT_VARIANTS_UPDATE_MUTATION,
    FILE_REMOVE_PRODUCT_REFERENCES_MUTATION,
    GET_PRODUCT_QUERY,
  ])
  assert.deepEqual(calls[2].variables.variants[0].inventoryItem, { sku: "SKU-2" })
  assert.deepEqual(calls[3].variables.files, [{
    id: "gid://shopify/MediaImage/9",
    referencesToRemove: ["gid://shopify/Product/1"],
  }])
  assert.equal(result.product.title, "Updated")
  assert.equal(result.product.seo.title, "Updated SEO")
  assert.deepEqual(result.completedSteps, ["product_fields_and_images", "variants", "remove_media"])
  assert.equal(result.verification.passed, true)
  assert.equal(result.verification.mediaPolls, 0)
})

test("update_product rejects a missing added image after bounded internal polling", async () => {
  let productReads = 0
  let waits = 0
  await assert.rejects(
    () => updateProduct({
      store: "example.myshopify.com",
      input: {
        id: "gid://shopify/Product/1",
        images: [{ url: "https://example.com/new.jpg", altText: "New" }],
      },
      apply: true,
      wait: async () => { waits += 1 },
      executor: ({ query }) => {
        if (query === PRODUCT_UPDATE_MUTATION) {
          return { productUpdate: { product: { id: "gid://shopify/Product/1" }, userErrors: [] } }
        }
        productReads += 1
        return { product: productFixture(), shop: { currencyCode: "USD" } }
      },
    }),
    (error) =>
      error.code === "verification_failed" &&
      error.details.mismatches[0].field === "images[0]" &&
      error.details.observedProduct.media.length === 1,
  )
  assert.equal(productReads, 5)
  assert.equal(waits, 3)
})

test("update_product does not treat an attached non-image medium as removed", async () => {
  let productReads = 0
  let waits = 0
  const videoMedia = {
    nodes: [{
      id: "gid://shopify/Video/9",
      alt: "Still attached",
      status: "READY",
      mediaContentType: "VIDEO",
    }],
    pageInfo: { hasNextPage: false, endCursor: null },
  }
  await assert.rejects(
    () => updateProduct({
      store: "example.myshopify.com",
      input: {
        id: "gid://shopify/Product/1",
        removeMediaIds: ["gid://shopify/Video/9"],
      },
      apply: true,
      wait: async () => { waits += 1 },
      executor: ({ query }) => {
        if (query === FILE_REMOVE_PRODUCT_REFERENCES_MUTATION) {
          return { fileUpdate: { files: [{ id: "gid://shopify/Video/9" }], userErrors: [] } }
        }
        productReads += 1
        return {
          product: productFixture({ media: videoMedia }),
          shop: { currencyCode: "USD" },
        }
      },
    }),
    (error) =>
      error.code === "verification_failed" &&
      error.details.mismatches[0].field === "removeMediaIds" &&
      error.details.observedProduct.media[0].mediaContentType === "VIDEO",
  )
  assert.equal(productReads, 5)
  assert.equal(waits, 3)
})

test("update_product rejects a variant mismatch using its owned read", async () => {
  await assert.rejects(
    () => updateProduct({
      store: "example.myshopify.com",
      input: {
        id: "gid://shopify/Product/1",
        variants: [{ id: "gid://shopify/ProductVariant/1", price: "12.00" }],
      },
      apply: true,
      executor: ({ query }) => {
        if (query === PRODUCT_VARIANTS_UPDATE_MUTATION) {
          return { productVariantsBulkUpdate: { productVariants: [], userErrors: [] } }
        }
        return { product: productFixture(), shop: { currencyCode: "USD" } }
      },
    }),
    (error) =>
      error.code === "verification_failed" &&
      error.details.mismatches[0].field === "variants[0].price" &&
      error.details.observedProduct.variants[0].price === "10.00",
  )
})

test("update_product reports partial completion when a later mutation fails", async () => {
  const executor = ({ query }) => {
    if (query === PRODUCT_UPDATE_MUTATION) {
      return { productUpdate: { product: { id: "gid://shopify/Product/1" }, userErrors: [] } }
    }
    return {
      productVariantsBulkUpdate: {
        productVariants: [],
        userErrors: [{ field: ["variants", "0", "price"], message: "Invalid price" }],
      },
    }
  }
  await assert.rejects(
    () => updateProduct({
      store: "example.myshopify.com",
      input: {
        id: "gid://shopify/Product/1",
        title: "Updated",
        variants: [{ id: "gid://shopify/ProductVariant/1", price: "12.00" }],
      },
      apply: true,
      executor,
    }),
    (error) => error.code === "partial_update" && error.details.completedSteps[0] === "product_fields_and_images",
  )
})

test("update_product rejects a mismatched SEO verification read", async () => {
  await assert.rejects(
    () => updateProduct({
      store: "example.myshopify.com",
      input: { id: "gid://shopify/Product/1", seo: { title: "Expected SEO" } },
      apply: true,
      executor: ({ query }) => {
        if (query === PRODUCT_UPDATE_MUTATION) {
          return { productUpdate: { product: { id: "gid://shopify/Product/1" }, userErrors: [] } }
        }
        return { product: productFixture(), shop: { currencyCode: "USD" } }
      },
    }),
    (error) =>
      error.code === "verification_failed" &&
      error.details.mismatches[0].field === "seo.title" &&
      error.details.productId === "gid://shopify/Product/1" &&
      error.details.observedProduct.seo.title === "Test SEO",
  )
})

test("update_product returns a warning for Shopify-only block HTML formatting", async () => {
  const result = await updateProduct({
    store: "example.myshopify.com",
    input: {
      id: "gid://shopify/Product/1",
      descriptionHtml: "<ul><li><strong>Material:</strong> Cotton</li></ul>",
    },
    apply: true,
    executor: ({ query }) => {
      if (query === PRODUCT_UPDATE_MUTATION) {
        return { productUpdate: { product: { id: "gid://shopify/Product/1" }, userErrors: [] } }
      }
      return {
        product: productFixture({
          descriptionHtml: "<ul>\n<li>\n<strong>Material:</strong> Cotton</li>\n</ul>",
        }),
        shop: { currencyCode: "USD" },
      }
    },
  })
  assert.deepEqual(result.verification, {
    passed: true,
    mediaPolls: 0,
    warnings: [{
      code: "shopify_html_normalized",
      field: "descriptionHtml",
      message: "Shopify changed formatting-only whitespace around block HTML elements.",
    }],
  })
})

test("update_product still rejects meaningful inline HTML whitespace changes", async () => {
  await assert.rejects(
    () => updateProduct({
      store: "example.myshopify.com",
      input: {
        id: "gid://shopify/Product/1",
        descriptionHtml: "<strong>Hello</strong> <em>world</em>",
      },
      apply: true,
      executor: ({ query }) => {
        if (query === PRODUCT_UPDATE_MUTATION) {
          return { productUpdate: { product: { id: "gid://shopify/Product/1" }, userErrors: [] } }
        }
        return {
          product: productFixture({ descriptionHtml: "<strong>Hello</strong><em>world</em>" }),
          shop: { currencyCode: "USD" },
        }
      },
    }),
    (error) =>
      error.code === "verification_failed" &&
      error.details.mismatches[0].field === "descriptionHtml" &&
      error.details.observedProduct.descriptionHtml === "<strong>Hello</strong><em>world</em>",
  )
})

test("bulk status updates preserve per-product partial failures", () => {
  const calls = []
  const result = bulkUpdateProductStatus({
    store: "example.myshopify.com",
    input: {
      productIds: ["gid://shopify/Product/1", "gid://shopify/Product/2"],
      status: "ARCHIVED",
    },
    apply: true,
    executor: (request) => {
      calls.push(request)
      const id = request.variables.product.id
      return {
        productUpdate: id.endsWith("/1")
          ? { product: { id, title: "One", status: "ARCHIVED", featuredMedia: null }, userErrors: [] }
          : { product: null, userErrors: [{ field: ["status"], message: "Denied" }] },
      }
    },
  })
  assert.equal(calls.every((entry) => entry.query === PRODUCT_STATUS_UPDATE_MUTATION), true)
  assert.equal(result.succeeded, 1)
  assert.equal(result.failed, 1)
  assert.equal(result.results[1].error.error, "shopify_user_errors")
})

test("bulk status resolves a collection once and reports the 50-product truncation", () => {
  const calls = []
  const result = bulkUpdateProductStatus({
    store: "example.myshopify.com",
    input: { collectionId: "gid://shopify/Collection/1", status: "DRAFT" },
    apply: false,
    executor: (request) => {
      calls.push(request)
      return {
        collection: {
          id: "gid://shopify/Collection/1",
          title: "Collection",
          products: {
            nodes: [{ id: "gid://shopify/Product/1" }],
            pageInfo: { hasNextPage: true, endCursor: "next" },
          },
        },
      }
    },
  })
  assert.equal(calls[0].query, COLLECTION_PRODUCT_IDS_QUERY)
  assert.equal(result.truncatedToFirst50, true)
  assert.deepEqual(result.productIds, ["gid://shopify/Product/1"])
})

test("upload_image creates a reusable file from a remote HTTPS URL and polls until ready", async () => {
  const calls = []
  const result = await uploadImage({
    store: "example.myshopify.com",
    input: { sourceUrl: "https://example.com/image.jpg", alt: "Image" },
    apply: true,
    wait: async () => {},
    executor: (request) => {
      calls.push(request)
      if (request.query === FILE_CREATE_MUTATION) {
        return {
          fileCreate: {
            files: [{ id: "gid://shopify/MediaImage/1", alt: "Image", fileStatus: "UPLOADED", image: null }],
            userErrors: [],
          },
        }
      }
      return {
        nodes: [{ id: "gid://shopify/MediaImage/1", alt: "Image", fileStatus: "READY", image: { url: "https://cdn.shopify.com/image.jpg" } }],
      }
    },
  })
  assert.deepEqual(calls.map((entry) => entry.query), [FILE_CREATE_MUTATION, GET_IMAGE_FILES_QUERY])
  assert.equal(calls[0].variables.files[0].originalSource, "https://example.com/image.jpg")
  assert.equal(result.file.url, "https://cdn.shopify.com/image.jpg")
})

test("upload_image stages a local image without exposing fileSize or signed parameters", async (context) => {
  const directory = mkdtempSync(join(tmpdir(), "shopify-upload-image-"))
  context.after(() => rmSync(directory, { recursive: true }))
  const imagePath = join(directory, "image.png")
  writeFileSync(imagePath, Buffer.from([1, 2, 3]))
  const calls = []
  const uploads = []
  const result = await uploadImage({
    store: "example.myshopify.com",
    input: { image: imagePath, alt: "Local" },
    apply: true,
    fetchImpl: async (url, options) => {
      uploads.push({ url, options })
      return { ok: true, status: 201 }
    },
    executor: (request) => {
      calls.push(request)
      if (request.query === STAGED_UPLOADS_MUTATION) {
        return {
          stagedUploadsCreate: {
            stagedTargets: [{
              url: "https://storage.example.com/upload",
              resourceUrl: "https://storage.example.com/resource",
              parameters: [{ name: "policy", value: "signed-secret" }],
            }],
            userErrors: [],
          },
        }
      }
      return {
        fileCreate: {
          files: [{ id: "gid://shopify/MediaImage/1", alt: "Local", fileStatus: "READY", image: { url: "https://cdn.shopify.com/local.png" } }],
          userErrors: [],
        },
      }
    },
  })
  assert.equal(result.ok, true)
  assert.deepEqual(calls[0].variables.input, [{
    resource: "IMAGE",
    filename: "image.png",
    mimeType: "image/png",
    httpMethod: "POST",
  }])
  assert.equal("fileSize" in calls[0].variables.input[0], false)
  assert.equal(calls[0].redactStdout, true)
  assert.equal(uploads[0].options.body.get("policy"), "signed-secret")
  assert.equal(calls[1].variables.files[0].originalSource, "https://storage.example.com/resource")
  assert.equal(result.file.url, "https://cdn.shopify.com/local.png")
})
