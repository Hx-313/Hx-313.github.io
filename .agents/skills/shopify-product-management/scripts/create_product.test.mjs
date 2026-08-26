import assert from "node:assert/strict"
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

import {
  PRODUCT_SET_MUTATION,
  PRODUCT_VERIFY_QUERY,
  STAGED_UPLOADS_MUTATION,
  buildDuplicateSearchQuery,
  createProduct,
  createStagedTargets,
  normalizeProduct,
} from "./create_product.mjs"
import { compareShopifyHtml } from "./lib/html_verification.mjs"

test("HTML verification ignores only formatting whitespace around block elements", () => {
  const compact = "<ul><li><strong>Material:</strong> Cotton</li></ul>"
  const shopifyFormatted = "<ul>\n<li>\n<strong>Material:</strong> Cotton</li>\n</ul>"
  assert.deepEqual(compareShopifyHtml(compact, shopifyFormatted), { equal: true, normalized: true })
  assert.deepEqual(
    compareShopifyHtml("<strong>Hello</strong> <em>world</em>", "<strong>Hello</strong><em>world</em>"),
    { equal: false, normalized: false },
  )
  assert.deepEqual(compareShopifyHtml("<pre>a\n b</pre>", "<pre>a\nb</pre>"), {
    equal: false,
    normalized: false,
  })
  assert.deepEqual(
    compareShopifyHtml(
      '<span>a</span> <p style="display:inline">b</p>',
      '<span>a</span><p style="display:inline">b</p>',
    ),
    { equal: false, normalized: false },
  )
  assert.deepEqual(
    compareShopifyHtml(
      '<span>a</span>\n<p style="display:inline">b</p>',
      '<span>a</span><p style="display:inline">b</p>',
    ),
    { equal: false, normalized: false },
  )
  assert.deepEqual(
    compareShopifyHtml(
      '<p style="display:inline">a</p>\n<span>b</span>',
      '<p style="display:inline">a</p><span>b</span>',
    ),
    { equal: false, normalized: false },
  )
})

test("normalizes product options, variants, inventory, and public images", () => {
  const normalized = normalizeProduct({
    title: "T-shirt",
    status: "active",
    handle: "t-shirt",
    seo: { title: "Red and blue T-shirts", description: "Shop T-shirts" },
    options: ["Color"],
    variants: [
      {
        price: "29.00",
        sku: "TS-RED",
        optionValues: [{ optionName: "Color", name: "Red" }],
        inventoryItem: { tracked: true },
        inventoryQuantities: [
          {
            locationId: "gid://shopify/Location/123",
            quantity: 10,
          },
        ],
      },
      {
        price: "31.00",
        sku: "TS-BLUE",
        optionValues: [{ optionName: "Color", name: "Blue" }],
      },
    ],
    images: [{ url: "https://example.com/product.jpg", altText: "T-shirt" }],
  })

  assert.equal(normalized.input.status, "ACTIVE")
  assert.deepEqual(normalized.input.seo, {
    title: "Red and blue T-shirts",
    description: "Shop T-shirts",
  })
  assert.deepEqual(normalized.input.productOptions, [
    { name: "Color", values: [{ name: "Red" }, { name: "Blue" }] },
  ])
  assert.equal(normalized.input.variants[0].inventoryQuantities[0].name, "available")
  assert.equal(normalized.input.files[0].filename, "product.jpg")
  assert.deepEqual(normalized.identifiers.skus, ["TS-RED", "TS-BLUE"])
})

test("omits inverted compare-at prices and reports a structured warning in dry-run", async () => {
  const rawProduct = {
    title: "Test",
    options: ["Title"],
    variants: [{
      price: "10.00",
      compareAtPrice: "5.00",
      optionValues: [{ optionName: "Title", name: "Default Title" }],
    }],
  }
  const normalized = normalizeProduct(rawProduct)
  assert.equal(normalized.input.variants[0].compareAtPrice, undefined)
  assert.deepEqual(normalized.warnings, [{
    code: "compare_at_price_inverted",
    field: "variants[0].compareAtPrice",
    price: "10.00",
    compareAtPrice: "5.00",
    message: "compareAtPrice must be greater than price and was omitted.",
  }])
  const dryRun = await createProduct({
    store: "example.myshopify.com",
    rawProduct,
    apply: false,
    spawn: () => { throw new Error("spawn should not run") },
  })
  assert.equal(dryRun.productSetInput.variants[0].compareAtPrice, undefined)
  assert.deepEqual(dryRun.warnings, normalized.warnings)
})

test("normalizes readable absolute local image paths for internal staging", (context) => {
  const directory = mkdtempSync(join(tmpdir(), "shopify-product-media-"))
  context.after(() => rmSync(directory, { recursive: true }))
  const imagePath = join(directory, "product.png")
  writeFileSync(imagePath, Buffer.from([0x89, 0x50, 0x4e, 0x47]))

  const normalized = normalizeProduct({
    title: "Test",
    images: [{ url: imagePath, altText: "Local product" }],
  })

  assert.equal(normalized.input.files, undefined)
  assert.deepEqual(normalized.localImages, [
    {
      path: realpathSync(imagePath),
      filename: "product.png",
      mimeType: "image/png",
      size: 4,
      alt: "Local product",
    },
  ])
})

test("rejects relative and unreadable local image paths", () => {
  assert.throws(
    () => normalizeProduct({ title: "Test", images: [{ url: "product.png" }] }),
    /public HTTPS URL or an absolute local path/,
  )
  assert.throws(
    () => normalizeProduct({ title: "Test", images: [{ url: "/tmp/not-a-real-product.png" }] }),
    (error) => error.code === "local_media_unavailable",
  )
})

test("requires options and complete option values when variants are present", () => {
  assert.throws(
    () => normalizeProduct({ title: "Test", variants: [{ price: "1.00", optionValues: [] }] }),
    /options is required/,
  )
  assert.throws(
    () =>
      normalizeProduct({
        title: "Test",
        options: ["Size"],
        variants: [{ price: "1.00", optionValues: [] }],
      }),
    /missing a value for option Size/,
  )
})

test("builds one duplicate query from handle and non-blank SKUs", () => {
  assert.equal(
    buildDuplicateSearchQuery({ handle: "t-shirt", skus: ["TS-RED", "TS-BLUE"] }),
    'handle:"t-shirt" OR sku:"TS-RED" OR sku:"TS-BLUE"',
  )
})

test("dry-run never starts Shopify CLI and reports the media plan", async (context) => {
  const directory = mkdtempSync(join(tmpdir(), "shopify-product-media-"))
  context.after(() => rmSync(directory, { recursive: true }))
  const imagePath = join(directory, "product.webp")
  writeFileSync(imagePath, Buffer.from([0x52, 0x49, 0x46, 0x46]))
  const spawn = () => {
    throw new Error("spawn should not run")
  }
  const result = await createProduct({
    store: "example.myshopify.com",
    rawProduct: {
      title: "Draft product",
      images: [
        { url: "https://example.com/public.jpg" },
        { url: imagePath },
      ],
    },
    apply: false,
    spawn,
  })
  assert.equal(result.ok, true)
  assert.equal(result.dryRun, true)
  assert.equal(result.productSetInput.status, "DRAFT")
  assert.equal(result.mediaPlan.publicImages, 1)
  assert.deepEqual(result.mediaPlan.localImages, [
    { path: realpathSync(imagePath), filename: "product.webp", mimeType: "image/webp", size: 4 },
  ])
})

test("apply performs duplicate lookup before productSet", async () => {
  const calls = []
  const spawn = (_command, args) => {
    calls.push(args)
    const query = args[args.indexOf("--query") + 1]
    if (query === PRODUCT_VERIFY_QUERY) {
      return {
        status: 0,
        stdout: JSON.stringify({
          product: {
            id: "gid://shopify/Product/1",
            title: "Test",
            status: "DRAFT",
            seo: { title: "Test SEO", description: "Test description" },
            options: [{ name: "Title", values: ["Default Title"] }],
            variants: {
              nodes: [{
                id: "gid://shopify/ProductVariant/1",
                title: "Default Title",
                sku: "TEST-1",
                price: "1.00",
                compareAtPrice: null,
                inventoryQuantity: 0,
                inventoryItem: { tracked: false },
                selectedOptions: [{ name: "Title", value: "Default Title" }],
              }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }),
        stderr: "",
      }
    }
    return {
      status: 0,
      stdout: JSON.stringify(
        query === PRODUCT_SET_MUTATION
          ? {
              productSet: {
                product: { id: "gid://shopify/Product/1", title: "Test", status: "DRAFT" },
                userErrors: [],
              },
            }
          : { products: { nodes: [] } },
      ),
      stderr: "",
    }
  }
  const result = await createProduct({
    store: "example.myshopify.com",
    rawProduct: {
      title: "Test",
      seo: { title: "Test SEO", description: "Test description" },
      options: ["Title"],
      variants: [
        {
          price: "1.00",
          compareAtPrice: "0.50",
          sku: "TEST-1",
          optionValues: [{ optionName: "Title", name: "Default Title" }],
        },
      ],
    },
    apply: true,
    spawn,
  })
  assert.equal(calls.length, 3)
  assert.equal(calls[0].includes("--allow-mutations"), false)
  assert.equal(calls[1].includes("--allow-mutations"), true)
  assert.equal(calls[2].includes("--allow-mutations"), false)
  assert.equal(result.product.id, "gid://shopify/Product/1")
  assert.equal(result.product.seo.title, "Test SEO")
  const mutationVariables = JSON.parse(calls[1][calls[1].indexOf("--variables") + 1])
  assert.equal(mutationVariables.input.variants[0].compareAtPrice, undefined)
  assert.deepEqual(result.verification, {
    passed: true,
    warnings: [{
      code: "compare_at_price_inverted",
      field: "variants[0].compareAtPrice",
      price: "1.00",
      compareAtPrice: "0.50",
      message: "compareAtPrice must be greater than price and was omitted.",
    }],
    mediaPolls: 0,
  })
})

test("create_product verifies on_hand at the requested variant and location", async () => {
  const calls = []
  const spawn = (_command, args) => {
    calls.push(args)
    const query = args[args.indexOf("--query") + 1]
    if (query === PRODUCT_SET_MUTATION) {
      return {
        status: 0,
        stdout: JSON.stringify({
          productSet: { product: { id: "gid://shopify/Product/1" }, userErrors: [] },
        }),
        stderr: "",
      }
    }
    if (query === PRODUCT_VERIFY_QUERY) {
      return {
        status: 0,
        stdout: JSON.stringify({
          product: {
            id: "gid://shopify/Product/1",
            title: "Inventory Test",
            status: "DRAFT",
            options: [{ name: "Title", values: ["Default Title"] }],
            variants: {
              nodes: [{
                id: "gid://shopify/ProductVariant/1",
                title: "Default Title",
                sku: "",
                price: "10.00",
                compareAtPrice: null,
                inventoryQuantity: 10,
                inventoryItem: { id: "gid://shopify/InventoryItem/1", tracked: true },
                selectedOptions: [{ name: "Title", value: "Default Title" }],
              }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
            media: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
          },
        }),
        stderr: "",
      }
    }
    if (query.startsWith("query VerifyCreatedInventoryStates")) {
      return {
        status: 0,
        stdout: JSON.stringify({
          check0: {
            id: "gid://shopify/ProductVariant/1",
            inventoryItem: {
              inventoryLevel: {
                location: { id: "gid://shopify/Location/1" },
                quantities: [{ name: "on_hand", quantity: 10 }],
              },
            },
          },
        }),
        stderr: "",
      }
    }
    throw new Error("unexpected query")
  }
  const result = await createProduct({
    store: "example.myshopify.com",
    rawProduct: {
      title: "Inventory Test",
      options: ["Title"],
      variants: [{
        price: "10.00",
        optionValues: [{ optionName: "Title", name: "Default Title" }],
        inventoryItem: { tracked: true },
        inventoryQuantities: [{
          locationId: "gid://shopify/Location/1",
          name: "on_hand",
          quantity: 10,
        }],
      }],
    },
    apply: true,
    spawn,
  })
  assert.equal(calls.length, 3)
  assert.equal(result.verification.inventoryStateChecks, 1)
  assert.deepEqual(result.verification.inventoryStates, [{
    variantId: "gid://shopify/ProductVariant/1",
    locationId: "gid://shopify/Location/1",
    name: "on_hand",
    quantity: 10,
  }])
  assert.equal(result.verification.passed, true)
})

test("create_product accepts Shopify block formatting and verifies variants, tracking, and media", async () => {
  let verifyReads = 0
  const spawn = (_command, args) => {
    const query = args[args.indexOf("--query") + 1]
    if (query === PRODUCT_SET_MUTATION) {
      return {
        status: 0,
        stdout: JSON.stringify({
          productSet: {
            product: { id: "gid://shopify/Product/1", title: "Test", status: "ACTIVE" },
            userErrors: [],
          },
        }),
        stderr: "",
      }
    }
    verifyReads += 1
    return {
      status: 0,
      stdout: JSON.stringify({
        product: {
          id: "gid://shopify/Product/1",
          title: "Test",
          descriptionHtml: "<ul>\n<li>\n<strong>Material:</strong> Cotton</li>\n</ul>",
          status: "ACTIVE",
          options: [{ name: "Color", values: ["Red"] }],
          variants: {
            nodes: [{
              id: "gid://shopify/ProductVariant/1",
              title: "Red",
              sku: "",
              price: "29.00",
              compareAtPrice: null,
              inventoryQuantity: 3,
              inventoryItem: { tracked: false },
              selectedOptions: [{ name: "Color", value: "Red" }],
            }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
          media: {
            nodes: [{ id: "gid://shopify/MediaImage/1", status: "READY", alt: "Red front" }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      }),
      stderr: "",
    }
  }

  const result = await createProduct({
    store: "example.myshopify.com",
    rawProduct: {
      title: "Test",
      descriptionHtml: "<ul><li><strong>Material:</strong> Cotton</li></ul>",
      status: "ACTIVE",
      options: ["Color"],
      variants: [{
        price: "29.0",
        optionValues: [{ optionName: "Color", name: "Red" }],
        inventoryItem: { tracked: false },
        inventoryQuantities: [{ locationId: "gid://shopify/Location/1", quantity: 3 }],
      }],
      images: [{ url: "https://example.com/red.jpg", altText: "Red front" }],
    },
    apply: true,
    spawn,
  })

  assert.equal(verifyReads, 1)
  assert.equal(result.verification.passed, true)
  assert.deepEqual(result.verification.warnings, [{
    code: "shopify_html_normalized",
    field: "descriptionHtml",
    message: "Shopify changed formatting-only whitespace around block HTML elements.",
  }])
})

test("create_product polls processing media internally and returns the final owned read", async () => {
  let verifyReads = 0
  let waits = 0
  const spawn = (_command, args) => {
    const query = args[args.indexOf("--query") + 1]
    if (query === PRODUCT_SET_MUTATION) {
      return {
        status: 0,
        stdout: JSON.stringify({
          productSet: { product: { id: "gid://shopify/Product/1" }, userErrors: [] },
        }),
        stderr: "",
      }
    }
    verifyReads += 1
    return {
      status: 0,
      stdout: JSON.stringify({
        product: {
          id: "gid://shopify/Product/1",
          title: "Test",
          status: "DRAFT",
          media: {
            nodes: [{
              id: "gid://shopify/MediaImage/1",
              status: verifyReads === 1 ? "PROCESSING" : "READY",
              alt: "Front",
            }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      }),
      stderr: "",
    }
  }
  const result = await createProduct({
    store: "example.myshopify.com",
    rawProduct: { title: "Test", images: [{ url: "https://example.com/front.jpg", altText: "Front" }] },
    apply: true,
    spawn,
    wait: async () => { waits += 1 },
  })
  assert.equal(verifyReads, 2)
  assert.equal(waits, 1)
  assert.equal(result.verification.mediaPolls, 1)
})

test("create_product paginates more than 100 variants and media inside its owned verification", async () => {
  const desiredVariants = Array.from({ length: 101 }, (_, index) => ({
    price: "1.00",
    optionValues: [{ optionName: "Number", name: String(index + 1) }],
  }))
  const desiredImages = Array.from({ length: 101 }, (_, index) => ({
    url: `https://example.com/image-${index + 1}.jpg`,
    altText: `Image ${index + 1}`,
  }))
  const observedVariants = desiredVariants.map((variant, index) => ({
    id: `gid://shopify/ProductVariant/${index + 1}`,
    title: variant.optionValues[0].name,
    sku: "",
    price: "1.00",
    compareAtPrice: null,
    inventoryQuantity: 0,
    inventoryItem: { tracked: false },
    selectedOptions: [{ name: "Number", value: variant.optionValues[0].name }],
  }))
  const observedMedia = desiredImages.map((image, index) => ({
    id: `gid://shopify/MediaImage/${index + 1}`,
    status: "READY",
    alt: image.altText,
  }))
  const calls = []
  const spawn = (_command, args) => {
    calls.push(args)
    const query = args[args.indexOf("--query") + 1]
    if (query === PRODUCT_SET_MUTATION) {
      return {
        status: 0,
        stdout: JSON.stringify({
          productSet: { product: { id: "gid://shopify/Product/1" }, userErrors: [] },
        }),
        stderr: "",
      }
    }
    const variables = JSON.parse(args[args.indexOf("--variables") + 1])
    const firstPage = variables.variantsAfter === null
    return {
      status: 0,
      stdout: JSON.stringify({
        product: firstPage
          ? {
              id: "gid://shopify/Product/1",
              title: "Large product",
              status: "DRAFT",
              options: [{ name: "Number", values: desiredVariants.map(({ optionValues }) => optionValues[0].name) }],
              variants: {
                nodes: observedVariants.slice(0, 100),
                pageInfo: { hasNextPage: true, endCursor: "variant-100" },
              },
              media: {
                nodes: observedMedia.slice(0, 100),
                pageInfo: { hasNextPage: true, endCursor: "media-100" },
              },
            }
          : {
              id: "gid://shopify/Product/1",
              variants: {
                nodes: observedVariants.slice(100),
                pageInfo: { hasNextPage: false, endCursor: null },
              },
              media: {
                nodes: observedMedia.slice(100),
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
      }),
      stderr: "",
    }
  }

  const result = await createProduct({
    store: "example.myshopify.com",
    rawProduct: {
      title: "Large product",
      options: ["Number"],
      variants: desiredVariants,
      images: desiredImages,
    },
    apply: true,
    spawn,
  })
  assert.equal(calls.length, 3)
  assert.equal(result.product.variants.nodes.length, 101)
  assert.equal(result.product.media.nodes.length, 101)
  assert.equal(result.verification.passed, true)
})

test("create_product rejects a mismatched SEO verification read", async () => {
  const spawn = (_command, args) => {
    const query = args[args.indexOf("--query") + 1]
    if (query === PRODUCT_SET_MUTATION) {
      return {
        status: 0,
        stdout: JSON.stringify({
          productSet: {
            product: { id: "gid://shopify/Product/1", title: "Test", status: "DRAFT" },
            userErrors: [],
          },
        }),
        stderr: "",
      }
    }
    return {
      status: 0,
      stdout: JSON.stringify({
        product: {
          id: "gid://shopify/Product/1",
          title: "Test",
          status: "DRAFT",
          seo: { title: "Wrong SEO", description: "Wrong description" },
        },
      }),
      stderr: "",
    }
  }
  await assert.rejects(
    () => createProduct({
      store: "example.myshopify.com",
      rawProduct: { title: "Test", seo: { title: "Expected SEO", description: "Expected description" } },
      apply: true,
      spawn,
    }),
    (error) => error.code === "verification_failed" && error.details.mismatches[0].field === "seo.title",
  )
})

test("duplicate lookup aborts before mutation", async () => {
  const calls = []
  const spawn = (_command, args) => {
    calls.push(args)
    return {
      status: 0,
      stdout: JSON.stringify({
        products: {
          nodes: [
            {
              id: "gid://shopify/Product/9",
              handle: "existing",
              variants: { nodes: [{ sku: "TEST-1" }] },
            },
          ],
        },
      }),
      stderr: "",
    }
  }
  await assert.rejects(
    async () =>
      createProduct({
        store: "example.myshopify.com",
        rawProduct: {
          title: "Test",
          options: ["Title"],
          variants: [
            {
              price: "1.00",
              sku: "TEST-1",
              optionValues: [{ optionName: "Title", name: "Default Title" }],
            },
          ],
        },
        apply: true,
        spawn,
      }),
    (error) => error.code === "duplicate_exists",
  )
  assert.equal(calls.length, 1)
  assert.equal(calls[0].includes("--allow-mutations"), false)
})

test("productSet userErrors are returned as a structured failure", async () => {
  const spawn = () => ({
    status: 0,
    stdout: JSON.stringify({
      productSet: {
        product: null,
        userErrors: [{ field: ["title"], message: "Title is invalid" }],
      },
    }),
    stderr: "",
  })
  await assert.rejects(
    async () =>
      createProduct({
        store: "example.myshopify.com",
        rawProduct: { title: "Test" },
        apply: true,
        spawn,
      }),
    (error) =>
      error.code === "shopify_user_errors" &&
      error.details.userErrors[0].message === "Title is invalid",
  )
})

test("redacts staged-upload stdout when the Shopify operation fails", () => {
  const spawn = () => ({
    status: 1,
    stdout: '{"parameters":[{"name":"policy","value":"signed-secret"}]}',
    stderr: "Staging failed",
  })
  assert.throws(
    () =>
      createStagedTargets({
        store: "example.myshopify.com",
        localImages: [{ filename: "front.png", mimeType: "image/png" }],
        spawn,
      }),
    (error) =>
      error.code === "shopify_cli_failed" &&
      error.details.stdout === "[redacted staged-upload output]" &&
      !JSON.stringify(error).includes("signed-secret"),
  )
})

test("stages local images once, uploads them in parallel, and passes resourceUrls to productSet", async (context) => {
  const directory = mkdtempSync(join(tmpdir(), "shopify-product-media-"))
  context.after(() => rmSync(directory, { recursive: true }))
  const firstPath = join(directory, "front.png")
  const secondPath = join(directory, "back.jpg")
  writeFileSync(firstPath, Buffer.from([1, 2, 3]))
  writeFileSync(secondPath, Buffer.from([4, 5, 6]))

  const calls = []
  const spawn = (_command, args) => {
    calls.push(args)
    const query = args[args.indexOf("--query") + 1]
    if (query === STAGED_UPLOADS_MUTATION) {
      return {
        status: 0,
        stdout: JSON.stringify({
          stagedUploadsCreate: {
            stagedTargets: [
              {
                url: "https://storage.example.com/upload-1",
                resourceUrl: "https://storage.example.com/resource-1",
                parameters: [{ name: "key", value: "signed-1" }],
              },
              {
                url: "https://storage.example.com/upload-2",
                resourceUrl: "https://storage.example.com/resource-2",
                parameters: [{ name: "key", value: "signed-2" }],
              },
            ],
            userErrors: [],
          },
        }),
        stderr: "",
      }
    }
    if (query === PRODUCT_VERIFY_QUERY) {
      return {
        status: 0,
        stdout: JSON.stringify({
          product: {
            id: "gid://shopify/Product/1",
            title: "Test",
            handle: "test",
            status: "DRAFT",
            media: {
              nodes: [
                { id: "gid://shopify/MediaImage/1", status: "READY", alt: "Front" },
                { id: "gid://shopify/MediaImage/2", status: "READY", alt: "Side" },
                { id: "gid://shopify/MediaImage/3", status: "READY", alt: "Back" },
              ],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }),
        stderr: "",
      }
    }
    if (!args.includes("--allow-mutations")) {
      return { status: 0, stdout: JSON.stringify({ products: { nodes: [] } }), stderr: "" }
    }
    return {
      status: 0,
      stdout: JSON.stringify({
        productSet: {
          product: { id: "gid://shopify/Product/1", title: "Test", status: "DRAFT" },
          userErrors: [],
        },
      }),
      stderr: "",
    }
  }

  const uploads = []
  let releaseUploads
  const bothUploadsStarted = new Promise((resolve) => {
    releaseUploads = resolve
  })
  const fetchImpl = async (url, options) => {
    uploads.push({ url, options })
    if (uploads.length === 2) releaseUploads()
    await bothUploadsStarted
    return { ok: true, status: 201, text: async () => "" }
  }

  const result = await createProduct({
    store: "example.myshopify.com",
    rawProduct: {
      title: "Test",
      handle: "test",
      images: [
        { url: firstPath, altText: "Front" },
        { url: "https://example.com/side.webp", altText: "Side" },
        { url: secondPath, altText: "Back" },
      ],
    },
    apply: true,
    spawn,
    fetchImpl,
  })

  assert.equal(calls.length, 4)
  const stagedCall = calls.find((args) => args.includes(STAGED_UPLOADS_MUTATION))
  const stagedVariables = JSON.parse(stagedCall[stagedCall.indexOf("--variables") + 1])
  assert.deepEqual(stagedVariables.input, [
    { resource: "PRODUCT_IMAGE", filename: "front.png", mimeType: "image/png", httpMethod: "POST" },
    { resource: "PRODUCT_IMAGE", filename: "back.jpg", mimeType: "image/jpeg", httpMethod: "POST" },
  ])
  assert.equal("fileSize" in stagedVariables.input[0], false)
  assert.equal(uploads.length, 2)
  assert.equal(uploads[0].options.body.get("key"), "signed-1")
  assert.equal(uploads[0].options.body.get("file").name, "front.png")

  const productSetCall = calls.find((args) => args.includes(PRODUCT_SET_MUTATION))
  const productSetVariables = JSON.parse(productSetCall[productSetCall.indexOf("--variables") + 1])
  assert.deepEqual(productSetVariables.input.files, [
    {
      originalSource: "https://storage.example.com/resource-1",
      contentType: "IMAGE",
      filename: "front.png",
      alt: "Front",
    },
    {
      originalSource: "https://example.com/side.webp",
      contentType: "IMAGE",
      filename: "side.webp",
      alt: "Side",
    },
    {
      originalSource: "https://storage.example.com/resource-2",
      contentType: "IMAGE",
      filename: "back.jpg",
      alt: "Back",
    },
  ])
  assert.deepEqual(result.mediaUpload, { localImagesStaged: 2 })
})
