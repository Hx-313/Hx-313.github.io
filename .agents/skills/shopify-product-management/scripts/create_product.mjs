#!/usr/bin/env node

import { spawnSync } from "node:child_process"
import { readFileSync, realpathSync, statSync } from "node:fs"
import { basename, extname, isAbsolute, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { compareShopifyHtml } from "./lib/html_verification.mjs"

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

export const PRODUCT_SET_MUTATION = `
mutation CreateProduct($input: ProductSetInput!) {
  productSet(input: $input, synchronous: true) {
    product {
      id
      title
      status
      variants(first: 100) {
        nodes { id title sku price inventoryQuantity }
      }
      media(first: 50) {
        nodes { id status alt }
      }
    }
    userErrors { field message }
  }
}`.trim()

export const PRODUCT_VERIFY_QUERY = `
query VerifyCreatedProduct($id: ID!, $variantsAfter: String, $mediaAfter: String) {
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
    options { id name position values }
    variants(first: 100, after: $variantsAfter) {
      nodes {
        id
        title
        sku
        price
        compareAtPrice
        inventoryQuantity
        inventoryItem { id tracked }
        selectedOptions { name value }
      }
      pageInfo { hasNextPage endCursor }
    }
    media(first: 100, after: $mediaAfter) {
      nodes { id status alt }
      pageInfo { hasNextPage endCursor }
    }
  }
}`.trim()

const INVENTORY_VERIFY_BATCH_SIZE = 50

function buildInventoryStateVerifyQuery(checkCount) {
  const variables = []
  const selections = []
  for (let index = 0; index < checkCount; index += 1) {
    variables.push(`$variant${index}: ID!`, `$location${index}: ID!`)
    selections.push(`
      check${index}: productVariant(id: $variant${index}) {
        id
        inventoryItem {
          inventoryLevel(locationId: $location${index}) {
            location { id }
            quantities(names: ["on_hand"]) { name quantity }
          }
        }
      }
    `)
  }
  return `query VerifyCreatedInventoryStates(${variables.join(", ")}) {${selections.join("")}\n}`
}

export const DUPLICATE_QUERY = `
query FindDuplicateProducts($query: String!) {
  products(first: 50, query: $query) {
    nodes {
      id
      handle
      variants(first: 100) { nodes { sku } }
    }
  }
}`.trim()

const HELP = `create_product.mjs

Create one Shopify product through the connected Shopify store context.

Usage:
  ./scripts/create_product.mjs --store <store.myshopify.com> --input <product.json> [--apply]
  ./scripts/create_product.mjs --store <store.myshopify.com> --json '<product-json>' [--apply]
  ./scripts/create_product.mjs --store <store.myshopify.com> --input - [--apply]

Options:
  --store <domain>   Required full *.myshopify.com domain.
  --input <path>     Product JSON file, or - to read stdin.
  --json <json>      Inline product JSON. Mutually exclusive with --input.
  --apply            Execute the mutation. Without this flag the command is a dry-run.
  --help             Show this help.
  --version          Show the tool version.

Input shape:
  {
    "title": "T-shirt",
    "descriptionHtml": "<p>...</p>",
    "vendor": "Acme",
    "productType": "Shirts",
    "tags": ["summer"],
    "handle": "t-shirt",
    "status": "DRAFT",
    "seo": { "title": "T-shirt", "description": "Shop T-shirts" },
    "options": ["Color"],
    "variants": [{
      "price": "29.00",
      "sku": "TS-RED",
      "optionValues": [{"optionName": "Color", "name": "Red"}],
      "inventoryItem": {"tracked": true},
      "inventoryQuantities": [{
        "locationId": "gid://shopify/Location/123",
        "name": "available",
        "quantity": 10
      }]
    }],
    "images": [{"url": "https://example.com/product.jpg", "altText": "Red T-shirt"}]
  }

Each images[].url may be a public HTTPS URL or an absolute local image path.
Local images are staged to Shopify-compatible storage by this script before productSet runs.
Supplier/source metadata is not required and is not sent to Shopify.
`

const IMAGE_MIME_TYPES = new Map([
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
])

function fail(message, code = "invalid_input", details) {
  const error = new Error(message)
  error.code = code
  if (details !== undefined) error.details = details
  return error
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function optionalString(value, field) {
  if (value === undefined || value === null || value === "") return undefined
  if (typeof value !== "string") throw fail(`${field} must be a string`)
  const trimmed = value.trim()
  return trimmed || undefined
}

function requiredString(value, field) {
  const normalized = optionalString(value, field)
  if (!normalized) throw fail(`${field} is required`)
  return normalized
}

function normalizeMoney(value, field) {
  const normalized = requiredString(value, field)
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    throw fail(`${field} must be a non-negative decimal string`)
  }
  return normalized
}

function compareMoney(left, right) {
  const [leftInteger, leftFraction = ""] = left.split(".")
  const [rightInteger, rightFraction = ""] = right.split(".")
  const scale = Math.max(leftFraction.length, rightFraction.length)
  const leftScaled = BigInt(`${leftInteger}${leftFraction.padEnd(scale, "0")}`)
  const rightScaled = BigInt(`${rightInteger}${rightFraction.padEnd(scale, "0")}`)
  return leftScaled === rightScaled ? 0 : leftScaled > rightScaled ? 1 : -1
}

function normalizeTags(value) {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw fail("tags must be an array of strings")
  return [...new Set(value.map((tag, index) => requiredString(tag, `tags[${index}]`)))]
}

function normalizeOptions(value, variants) {
  if (value === undefined) {
    if (variants.length > 0) throw fail("options is required when variants are provided")
    return []
  }
  if (!Array.isArray(value) || value.length === 0) {
    throw fail("options must be a non-empty array of option names")
  }
  const options = value.map((option, index) => requiredString(option, `options[${index}]`))
  if (new Set(options).size !== options.length) throw fail("options must not contain duplicates")
  return options
}

function normalizeInventoryQuantities(value, variantIndex) {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.length === 0) {
    throw fail(`variants[${variantIndex}].inventoryQuantities must be a non-empty array`)
  }
  const seen = new Set()
  return value.map((entry, index) => {
    if (!isObject(entry)) {
      throw fail(`variants[${variantIndex}].inventoryQuantities[${index}] must be an object`)
    }
    const locationId = requiredString(
      entry.locationId,
      `variants[${variantIndex}].inventoryQuantities[${index}].locationId`,
    )
    if (!/^gid:\/\/shopify\/Location\/\d+$/.test(locationId)) {
      throw fail(
        `variants[${variantIndex}].inventoryQuantities[${index}].locationId must be a Shopify Location GID`,
      )
    }
    const name = entry.name === undefined ? "available" : entry.name
    if (name !== "available" && name !== "on_hand") {
      throw fail(
        `variants[${variantIndex}].inventoryQuantities[${index}].name must be available or on_hand`,
      )
    }
    if (!Number.isInteger(entry.quantity)) {
      throw fail(
        `variants[${variantIndex}].inventoryQuantities[${index}].quantity must be an integer`,
      )
    }
    const identity = `${locationId}:${name}`
    if (seen.has(identity)) {
      throw fail(
        `variants[${variantIndex}].inventoryQuantities contains duplicate ${name} at ${locationId}`,
      )
    }
    seen.add(identity)
    return { locationId, name, quantity: entry.quantity }
  })
}

function normalizeVariants(rawVariants, options, warnings) {
  if (rawVariants === undefined) return []
  if (!Array.isArray(rawVariants) || rawVariants.length === 0) {
    throw fail("variants must be a non-empty array when provided")
  }

  return rawVariants.map((variant, variantIndex) => {
    if (!isObject(variant)) throw fail(`variants[${variantIndex}] must be an object`)
    const rawOptionValues = variant.optionValues
    if (!Array.isArray(rawOptionValues)) {
      throw fail(`variants[${variantIndex}].optionValues must be an array`)
    }
    const seenOptions = new Set()
    const optionValues = rawOptionValues.map((entry, valueIndex) => {
      if (!isObject(entry)) {
        throw fail(`variants[${variantIndex}].optionValues[${valueIndex}] must be an object`)
      }
      const optionName = requiredString(
        entry.optionName,
        `variants[${variantIndex}].optionValues[${valueIndex}].optionName`,
      )
      const name = requiredString(
        entry.name,
        `variants[${variantIndex}].optionValues[${valueIndex}].name`,
      )
      if (!options.includes(optionName)) {
        throw fail(`variants[${variantIndex}] references undeclared option ${optionName}`)
      }
      if (seenOptions.has(optionName)) {
        throw fail(`variants[${variantIndex}] has duplicate value for option ${optionName}`)
      }
      seenOptions.add(optionName)
      return { optionName, name }
    })
    for (const option of options) {
      if (!seenOptions.has(option)) {
        throw fail(`variants[${variantIndex}] is missing a value for option ${option}`)
      }
    }

    const normalized = {
      price: normalizeMoney(variant.price, `variants[${variantIndex}].price`),
      optionValues,
    }
    const sku = optionalString(variant.sku, `variants[${variantIndex}].sku`)
    if (sku) normalized.sku = sku
    if (variant.compareAtPrice !== undefined && variant.compareAtPrice !== null) {
      const compareAtPrice = normalizeMoney(
        variant.compareAtPrice,
        `variants[${variantIndex}].compareAtPrice`,
      )
      if (compareMoney(compareAtPrice, normalized.price) > 0) {
        normalized.compareAtPrice = compareAtPrice
      } else {
        warnings.push({
          code: "compare_at_price_inverted",
          field: `variants[${variantIndex}].compareAtPrice`,
          price: normalized.price,
          compareAtPrice,
          message: "compareAtPrice must be greater than price and was omitted.",
        })
      }
    }
    if (variant.inventoryItem !== undefined) {
      if (!isObject(variant.inventoryItem) || typeof variant.inventoryItem.tracked !== "boolean") {
        throw fail(`variants[${variantIndex}].inventoryItem.tracked must be a boolean`)
      }
      normalized.inventoryItem = { tracked: variant.inventoryItem.tracked }
    }
    const inventoryQuantities = normalizeInventoryQuantities(
      variant.inventoryQuantities,
      variantIndex,
    )
    if (inventoryQuantities) normalized.inventoryQuantities = inventoryQuantities
    return normalized
  })
}

function normalizeImages(value) {
  if (value === undefined) return { files: [], localImages: [], imageEntries: [] }
  if (!Array.isArray(value) || value.length === 0) {
    throw fail("images must be a non-empty array when provided")
  }
  const files = []
  const localImages = []
  const imageEntries = []
  value.forEach((image, index) => {
    if (!isObject(image)) throw fail(`images[${index}] must be an object`)
    const source = requiredString(image.url, `images[${index}].url`)
    const alt = optionalString(image.altText, `images[${index}].altText`)
    const requestedFilename = optionalString(image.filename, `images[${index}].filename`)
    let parsedUrl
    try {
      parsedUrl = new URL(source)
    } catch {
      parsedUrl = undefined
    }

    if (parsedUrl?.protocol === "https:") {
      const file = { originalSource: source, contentType: "IMAGE" }
      if (alt) file.alt = alt
      const inferredFilename = basename(parsedUrl.pathname)
      if (requestedFilename || inferredFilename) {
        file.filename = basename(requestedFilename || inferredFilename)
      }
      files.push(file)
      imageEntries.push({ kind: "public", file })
      return
    }

    if (parsedUrl || !isAbsolute(source)) {
      throw fail(`images[${index}].url must be a public HTTPS URL or an absolute local path`)
    }

    let path
    let stats
    try {
      path = realpathSync(source)
      stats = statSync(path)
    } catch (error) {
      throw fail(`images[${index}].url cannot be read: ${error.message}`, "local_media_unavailable")
    }
    if (!stats.isFile()) {
      throw fail(`images[${index}].url must point to a local file`, "local_media_unavailable")
    }
    if (stats.size === 0) {
      throw fail(`images[${index}].url points to an empty file`, "local_media_unavailable")
    }

    const filename = basename(requestedFilename || path)
    if (!filename) throw fail(`images[${index}].filename must contain a file name`)
    const mimeType =
      optionalString(image.mimeType, `images[${index}].mimeType`) ||
      IMAGE_MIME_TYPES.get(extname(filename).toLowerCase())
    if (!mimeType?.startsWith("image/")) {
      throw fail(
        `images[${index}] has an unsupported image type; provide an image/* mimeType`,
        "unsupported_local_media",
      )
    }
    localImages.push({ path, filename, mimeType, size: stats.size, ...(alt ? { alt } : {}) })
    imageEntries.push({ kind: "local", localIndex: localImages.length - 1 })
  })
  return { files, localImages, imageEntries }
}

export function normalizeProduct(raw) {
  if (!isObject(raw)) throw fail("product input must be a JSON object")
  const title = requiredString(raw.title, "title")
  const status = raw.status === undefined ? "DRAFT" : requiredString(raw.status, "status").toUpperCase()
  if (!new Set(["ACTIVE", "DRAFT", "ARCHIVED"]).has(status)) {
    throw fail("status must be ACTIVE, DRAFT, or ARCHIVED")
  }

  const preliminaryVariants = raw.variants === undefined ? [] : raw.variants
  if (!Array.isArray(preliminaryVariants)) throw fail("variants must be an array")
  const options = normalizeOptions(raw.options, preliminaryVariants)
  const warnings = []
  const variants = normalizeVariants(raw.variants, options, warnings)
  const input = { title, status }

  for (const [source, target] of [
    ["descriptionHtml", "descriptionHtml"],
    ["vendor", "vendor"],
    ["productType", "productType"],
    ["handle", "handle"],
  ]) {
    const value = optionalString(raw[source], source)
    if (value) input[target] = value
  }
  const tags = normalizeTags(raw.tags)
  if (tags) input.tags = tags
  if (raw.seo !== undefined) {
    if (!isObject(raw.seo)) throw fail("seo must be an object")
    const seo = {}
    const seoTitle = optionalString(raw.seo.title, "seo.title")
    const seoDescription = optionalString(raw.seo.description, "seo.description")
    if (seoTitle) seo.title = seoTitle
    if (seoDescription) seo.description = seoDescription
    if (Object.keys(seo).length > 0) input.seo = seo
  }

  if (variants.length > 0) {
    input.productOptions = options.map((optionName) => ({
      name: optionName,
      values: [
        ...new Set(
          variants.map(
            (variant) => variant.optionValues.find((value) => value.optionName === optionName).name,
          ),
        ),
      ].map((name) => ({ name })),
    }))
    input.variants = variants
  }
  const { files, localImages, imageEntries } = normalizeImages(raw.images)
  if (files.length > 0) input.files = files

  const skus = variants.map((variant) => variant.sku).filter(Boolean)
  if (new Set(skus.map((sku) => sku.toLowerCase())).size !== skus.length) {
    throw fail("variants contain duplicate non-blank SKUs")
  }

  return {
    input,
    warnings,
    localImages,
    imageEntries,
    identifiers: {
      handle: input.handle,
      skus,
    },
  }
}

function quoteSearchValue(value) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`
}

export function buildDuplicateSearchQuery(identifiers) {
  const terms = []
  if (identifiers.handle) terms.push(`handle:${quoteSearchValue(identifiers.handle)}`)
  for (const sku of identifiers.skus) terms.push(`sku:${quoteSearchValue(sku)}`)
  return terms.join(" OR ")
}

function sameStringSet(left, right) {
  return JSON.stringify([...(left || [])].sort()) === JSON.stringify([...(right || [])].sort())
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

function optionKey(values) {
  return [...(values || [])]
    .map((entry) => [
      entry.optionName ?? entry.name,
      entry.optionName === undefined ? entry.value : entry.name,
    ])
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name}=${value}`)
    .join("|")
}

function verifyCreatedProduct(product, desired) {
  const mismatches = []
  const warnings = []
  for (const field of ["title", "handle", "status", "vendor", "productType"]) {
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
  if (desired.tags !== undefined && !sameStringSet(product.tags, desired.tags)) {
    mismatches.push({ field: "tags", expected: desired.tags, actual: product.tags })
  }
  if (desired.seo !== undefined) {
    for (const field of ["title", "description"]) {
      if (desired.seo[field] !== undefined && product.seo?.[field] !== desired.seo[field]) {
        mismatches.push({ field: `seo.${field}`, expected: desired.seo[field], actual: product.seo?.[field] })
      }
    }
  }
  if (desired.productOptions !== undefined) {
    const expectedOptions = desired.productOptions.map((option) => ({
      name: option.name,
      values: option.values.map(({ name }) => name),
    }))
    const actualOptions = (product.options || []).map((option) => ({ name: option.name, values: option.values }))
    if (JSON.stringify(actualOptions) !== JSON.stringify(expectedOptions)) {
      mismatches.push({ field: "options", expected: expectedOptions, actual: actualOptions })
    }
  }
  if (desired.variants !== undefined) {
    const actualVariants = product.variants?.nodes || []
    if (product.variants?.pageInfo?.hasNextPage) {
      mismatches.push({ field: "variants", expected: "complete verification read", actual: "paginated" })
    } else if (actualVariants.length !== desired.variants.length) {
      mismatches.push({ field: "variants.length", expected: desired.variants.length, actual: actualVariants.length })
    }
    const variantsByOptions = new Map(actualVariants.map((variant) => [optionKey(variant.selectedOptions), variant]))
    desired.variants.forEach((expected, index) => {
      const key = optionKey(expected.optionValues)
      const actual = variantsByOptions.get(key)
      if (!actual) {
        mismatches.push({ field: `variants[${index}]`, expected: key, actual: null })
        return
      }
      if (!sameMoney(expected.price, actual.price)) {
        mismatches.push({ field: `variants[${index}].price`, expected: expected.price, actual: actual.price })
      }
      if ((expected.sku || "") !== (actual.sku || "")) {
        mismatches.push({ field: `variants[${index}].sku`, expected: expected.sku || "", actual: actual.sku || "" })
      }
      if (!sameMoney(expected.compareAtPrice, actual.compareAtPrice)) {
        mismatches.push({
          field: `variants[${index}].compareAtPrice`,
          expected: expected.compareAtPrice ?? null,
          actual: actual.compareAtPrice ?? null,
        })
      }
      if (
        expected.inventoryItem?.tracked !== undefined &&
        actual.inventoryItem?.tracked !== expected.inventoryItem.tracked
      ) {
        mismatches.push({
          field: `variants[${index}].inventoryItem.tracked`,
          expected: expected.inventoryItem.tracked,
          actual: actual.inventoryItem?.tracked ?? null,
        })
      }
      const availableQuantities = expected.inventoryQuantities
        ?.filter(({ name }) => name === "available") || []
      if (availableQuantities.length > 0) {
        const expectedAvailable = availableQuantities.reduce((sum, { quantity }) => sum + quantity, 0)
        if (actual.inventoryQuantity !== expectedAvailable) {
          mismatches.push({
            field: `variants[${index}].inventoryQuantity`,
            expected: expectedAvailable,
            actual: actual.inventoryQuantity,
          })
        }
      }
    })
  }
  if (desired.files !== undefined) {
    const actualMedia = product.media?.nodes || []
    if (product.media?.pageInfo?.hasNextPage) {
      mismatches.push({ field: "media", expected: "complete verification read", actual: "paginated" })
    } else if (actualMedia.length !== desired.files.length) {
      mismatches.push({ field: "media.length", expected: desired.files.length, actual: actualMedia.length })
    }
    desired.files.forEach((expected, index) => {
      const actual = actualMedia[index]
      if (!actual) return
      if ((expected.alt || null) !== (actual.alt || null)) {
        mismatches.push({ field: `media[${index}].alt`, expected: expected.alt || null, actual: actual.alt || null })
      }
      if (actual.status !== "READY") {
        mismatches.push({ field: `media[${index}].status`, expected: "READY", actual: actual.status })
      }
    })
  }
  if (mismatches.length > 0) {
    throw fail("Created product verification did not match the requested outcome", "verification_failed", {
      productId: product.id,
      mismatches,
      observedProduct: product,
    })
  }
  return { passed: true, warnings }
}

function buildInventoryStateChecks(product, desired) {
  const actualVariants = product.variants?.nodes || []
  const variantsByOptions = new Map(actualVariants.map((variant) => [optionKey(variant.selectedOptions), variant]))
  const checks = []
  for (const [variantIndex, expectedVariant] of (desired.variants || []).entries()) {
    const actualVariant = variantsByOptions.get(optionKey(expectedVariant.optionValues))
    if (!actualVariant?.id) continue
    for (const [quantityIndex, expectedQuantity] of (expectedVariant.inventoryQuantities || []).entries()) {
      if (expectedQuantity.name === "available") continue
      checks.push({
        variantIndex,
        quantityIndex,
        variantId: actualVariant.id,
        locationId: expectedQuantity.locationId,
        name: expectedQuantity.name,
        quantity: expectedQuantity.quantity,
      })
    }
  }
  return checks
}

function verifyCreatedInventoryStates({ store, product, desired, spawn }) {
  const checks = buildInventoryStateChecks(product, desired)
  if (checks.length === 0) return null
  const mismatches = []
  const observedInventory = []
  for (let offset = 0; offset < checks.length; offset += INVENTORY_VERIFY_BATCH_SIZE) {
    const batch = checks.slice(offset, offset + INVENTORY_VERIFY_BATCH_SIZE)
    const variables = {}
    batch.forEach((check, index) => {
      variables[`variant${index}`] = check.variantId
      variables[`location${index}`] = check.locationId
    })
    const result = runShopifyOperation({
      store,
      query: buildInventoryStateVerifyQuery(batch.length),
      variables,
      spawn,
    })
    batch.forEach((check, index) => {
      const observedVariant = result?.[`check${index}`]
      const observedLevel = observedVariant?.inventoryItem?.inventoryLevel
      const observedQuantities = observedLevel?.quantities || []
      const actualQuantity = observedQuantities.find(({ name }) => name === check.name)?.quantity
      observedInventory.push({
        variantId: observedVariant?.id || null,
        locationId: observedLevel?.location?.id || null,
        name: check.name,
        quantity: actualQuantity ?? null,
      })
      const field = `variants[${check.variantIndex}].inventoryQuantities[${check.quantityIndex}]`
      if (observedVariant?.id !== check.variantId) {
        mismatches.push({ field: `${field}.variantId`, expected: check.variantId, actual: observedVariant?.id || null })
      }
      if (observedLevel?.location?.id !== check.locationId) {
        mismatches.push({
          field: `${field}.locationId`,
          expected: check.locationId,
          actual: observedLevel?.location?.id || null,
        })
      }
      if (actualQuantity !== check.quantity) {
        mismatches.push({ field: `${field}.${check.name}`, expected: check.quantity, actual: actualQuantity ?? null })
      }
    })
  }
  if (mismatches.length > 0) {
    throw fail("Created product inventory verification did not match the requested outcome", "verification_failed", {
      productId: product.id,
      mismatches,
      observedProduct: product,
      observedInventory,
    })
  }
  return { checked: checks.length, observedInventory }
}

export function parseArguments(argv) {
  const parsed = { apply: false }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--apply") parsed.apply = true
    else if (arg === "--help" || arg === "-h") parsed.help = true
    else if (arg === "--version") parsed.version = true
    else if (["--store", "--input", "--json"].includes(arg)) {
      const value = argv[index + 1]
      if (!value || value.startsWith("--")) throw fail(`${arg} requires a value`, "invalid_arguments")
      parsed[arg.slice(2)] = value
      index += 1
    } else {
      throw fail(`unknown argument: ${arg}`, "invalid_arguments")
    }
  }
  if (parsed.help || parsed.version) return parsed
  if (!parsed.store || !/^[-a-z0-9]+\.myshopify\.com$/i.test(parsed.store)) {
    throw fail("--store must be a full *.myshopify.com domain", "invalid_arguments")
  }
  if (Boolean(parsed.input) === Boolean(parsed.json)) {
    throw fail("provide exactly one of --input or --json", "invalid_arguments")
  }
  return parsed
}

export function readProductArgument(args) {
  const source = args.json ?? (args.input === "-" ? readFileSync(0, "utf8") : readFileSync(args.input, "utf8"))
  try {
    return JSON.parse(source)
  } catch (error) {
    throw fail(`product input is not valid JSON: ${error.message}`)
  }
}

function parseShopifyJson(stdout, { redactInvalidOutput = false } = {}) {
  const content = stdout.trim()
  if (!content) throw fail("Shopify CLI returned no JSON", "shopify_cli_invalid_output")
  try {
    return JSON.parse(content)
  } catch (error) {
    throw fail(`Shopify CLI returned invalid JSON: ${error.message}`, "shopify_cli_invalid_output", {
      stdout: redactInvalidOutput ? "[redacted staged-upload output]" : content.slice(0, 2000),
    })
  }
}

export function runShopifyOperation({
  store,
  query,
  variables,
  allowMutations = false,
  redactStdout = false,
  spawn = spawnSync,
}) {
  const cliArgs = ["store", "execute", "--store", store, "--query", query]
  if (allowMutations) cliArgs.push("--allow-mutations")
  if (variables) cliArgs.push("--variables", JSON.stringify(variables))
  const result = spawn("shopify", cliArgs, {
    encoding: "utf8",
    env: {
      ...process.env,
      SHOPIFY_CLI_AGENT_INFO:
        process.env.SHOPIFY_CLI_AGENT_INFO || "n:shopify-product-management|v:0.4.0|p:none|m:none",
    },
    maxBuffer: 10 * 1024 * 1024,
  })
  if (result.error) {
    throw fail(`Shopify CLI could not start: ${result.error.message}`, "shopify_cli_unavailable")
  }
  if (result.status !== 0) {
    throw fail("Shopify CLI operation failed", "shopify_cli_failed", {
      exitCode: result.status,
      stderr: String(result.stderr || "").trim().slice(0, 4000),
      stdout: redactStdout
        ? "[redacted staged-upload output]"
        : String(result.stdout || "").trim().slice(0, 4000),
    })
  }
  return parseShopifyJson(String(result.stdout || ""), { redactInvalidOutput: redactStdout })
}

function assertStagedTarget(target, index) {
  if (!isObject(target)) {
    throw fail(`Shopify returned an invalid staged target at index ${index}`, "shopify_invalid_response")
  }
  let uploadUrl
  try {
    uploadUrl = new URL(target.url)
  } catch {
    throw fail(`Shopify returned an invalid staged upload URL at index ${index}`, "shopify_invalid_response")
  }
  if (uploadUrl.protocol !== "https:" || typeof target.resourceUrl !== "string") {
    throw fail(`Shopify returned an incomplete staged target at index ${index}`, "shopify_invalid_response")
  }
  if (!Array.isArray(target.parameters)) {
    throw fail(`Shopify returned no staged parameters at index ${index}`, "shopify_invalid_response")
  }
}

export function createStagedTargets({ store, localImages, spawn = spawnSync }) {
  if (localImages.length === 0) return []
  const result = runShopifyOperation({
    store,
    query: STAGED_UPLOADS_MUTATION,
    variables: {
      input: localImages.map((image) => ({
        resource: "PRODUCT_IMAGE",
        filename: image.filename,
        mimeType: image.mimeType,
        httpMethod: "POST",
      })),
    },
    allowMutations: true,
    redactStdout: true,
    spawn,
  })
  const payload = result?.stagedUploadsCreate
  if (!payload) {
    throw fail("Shopify returned no stagedUploadsCreate payload", "shopify_invalid_response")
  }
  if (payload.userErrors?.length) {
    throw fail("Shopify rejected the local media staging request", "shopify_user_errors", {
      userErrors: payload.userErrors,
    })
  }
  const targets = payload.stagedTargets
  if (!Array.isArray(targets) || targets.length !== localImages.length) {
    throw fail("Shopify returned an unexpected number of staged targets", "shopify_invalid_response")
  }
  targets.forEach(assertStagedTarget)
  return targets
}

export async function uploadStagedImage({ image, target, fetchImpl = globalThis.fetch }) {
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
      throw fail(
        `Shopify returned an invalid staged parameter at index ${index}`,
        "shopify_invalid_response",
      )
    }
    form.append(parameter.name, parameter.value)
  }
  let content
  try {
    content = readFileSync(image.path)
  } catch (error) {
    throw fail(`Local image became unreadable: ${error.message}`, "local_media_unavailable", {
      filename: image.filename,
    })
  }
  form.append(
    "file",
    new globalThis.Blob([content], { type: image.mimeType }),
    image.filename,
  )
  let response
  try {
    response = await fetchImpl(target.url, { method: "POST", body: form })
  } catch (error) {
    throw fail(`Uploading a local image to Shopify staging failed: ${error.message}`, "staged_upload_failed", {
      filename: image.filename,
    })
  }
  if (!response?.ok) {
    throw fail("Uploading a local image to Shopify staging failed", "staged_upload_failed", {
      filename: image.filename,
      status: response?.status,
    })
  }
  return {
    originalSource: target.resourceUrl,
    contentType: "IMAGE",
    filename: image.filename,
    ...(image.alt ? { alt: image.alt } : {}),
  }
}

function readCreatedProductVerification({ store, productId, spawn }) {
  const result = runShopifyOperation({
    store,
    query: PRODUCT_VERIFY_QUERY,
    variables: { id: productId, variantsAfter: null, mediaAfter: null },
    spawn,
  })
  const product = result?.product
  if (!product) return result
  let variantsAfter = product.variants?.pageInfo?.hasNextPage
    ? product.variants.pageInfo.endCursor
    : null
  let mediaAfter = product.media?.pageInfo?.hasNextPage
    ? product.media.pageInfo.endCursor
    : null
  if (product.variants?.pageInfo?.hasNextPage && !variantsAfter) {
    throw fail("Shopify returned an invalid Product Variant cursor", "shopify_invalid_response", { productId })
  }
  if (product.media?.pageInfo?.hasNextPage && !mediaAfter) {
    throw fail("Shopify returned an invalid Product Media cursor", "shopify_invalid_response", { productId })
  }
  let pageReads = 0
  while (variantsAfter || mediaAfter) {
    if (pageReads >= 100) {
      throw fail("Created Product pagination exceeded the safety limit", "shopify_invalid_response", {
        productId,
      })
    }
    const page = runShopifyOperation({
      store,
      query: PRODUCT_VERIFY_QUERY,
      variables: { id: productId, variantsAfter, mediaAfter },
      spawn,
    })
    if (!page?.product) {
      throw fail("The created Product disappeared while paginating", "verification_failed", { productId })
    }
    if (variantsAfter) {
      product.variants.nodes.push(...(page.product.variants?.nodes || []))
      const pageInfo = page.product.variants?.pageInfo
      if (pageInfo?.hasNextPage && !pageInfo.endCursor) {
        throw fail("Shopify returned an invalid Product Variant cursor", "shopify_invalid_response", {
          productId,
        })
      }
      product.variants.pageInfo = pageInfo || { hasNextPage: false, endCursor: null }
      variantsAfter = pageInfo?.hasNextPage ? pageInfo.endCursor : null
    }
    if (mediaAfter) {
      product.media.nodes.push(...(page.product.media?.nodes || []))
      const pageInfo = page.product.media?.pageInfo
      if (pageInfo?.hasNextPage && !pageInfo.endCursor) {
        throw fail("Shopify returned an invalid Product Media cursor", "shopify_invalid_response", {
          productId,
        })
      }
      product.media.pageInfo = pageInfo || { hasNextPage: false, endCursor: null }
      mediaAfter = pageInfo?.hasNextPage ? pageInfo.endCursor : null
    }
    pageReads += 1
  }
  return result
}

export async function createProduct({
  store,
  rawProduct,
  apply,
  spawn = spawnSync,
  fetchImpl = globalThis.fetch,
  wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds)),
}) {
  const normalized = normalizeProduct(rawProduct)
  const duplicateQuery = buildDuplicateSearchQuery(normalized.identifiers)
  if (!apply) {
    return {
      ok: true,
      dryRun: true,
      store,
      duplicateQuery: duplicateQuery || null,
      productSetInput: normalized.input,
      warnings: normalized.warnings,
      mediaPlan: {
        publicImages: normalized.input.files?.length || 0,
        localImages: normalized.localImages.map(({ path, filename, mimeType, size }) => ({
          path,
          filename,
          mimeType,
          size,
        })),
      },
    }
  }

  if (duplicateQuery) {
    const duplicateResult = runShopifyOperation({
      store,
      query: DUPLICATE_QUERY,
      variables: { query: duplicateQuery },
      spawn,
    })
    const duplicateProducts = duplicateResult?.products?.nodes ?? []
    if (duplicateProducts.length > 0) {
      throw fail("A product with the supplied handle or SKU already exists", "duplicate_exists", {
        products: duplicateProducts,
      })
    }
  }

  if (normalized.localImages.length > 0) {
    const targets = createStagedTargets({ store, localImages: normalized.localImages, spawn })
    const stagedFiles = await Promise.all(
      normalized.localImages.map((image, index) =>
        uploadStagedImage({ image, target: targets[index], fetchImpl }),
      ),
    )
    normalized.input.files = normalized.imageEntries.map((entry) =>
      entry.kind === "public" ? entry.file : stagedFiles[entry.localIndex],
    )
  }

  const mutationResult = runShopifyOperation({
    store,
    query: PRODUCT_SET_MUTATION,
    variables: { input: normalized.input },
    allowMutations: true,
    spawn,
  })
  const payload = mutationResult?.productSet
  if (!payload) throw fail("Shopify returned no productSet payload", "shopify_invalid_response")
  if (payload.userErrors?.length) {
    throw fail("Shopify rejected the product", "shopify_user_errors", {
      userErrors: payload.userErrors,
    })
  }
  if (!payload.product?.id) {
    throw fail("Shopify returned no created product", "shopify_invalid_response")
  }
  let mediaPolls = 0
  let verificationResult
  while (true) {
    verificationResult = readCreatedProductVerification({
      store,
      productId: payload.product.id,
      spawn,
    })
    const observedMedia = verificationResult?.product?.media?.nodes || []
    const hasPendingMedia =
      normalized.input.files?.length > 0 &&
      (observedMedia.length < normalized.input.files.length ||
        observedMedia.some(({ status }) => status === "PROCESSING" || status === "UPLOADED"))
    if (!hasPendingMedia || mediaPolls >= 3) break
    mediaPolls += 1
    await wait(5000)
  }
  if (!verificationResult?.product?.id) {
    throw fail("The created product could not be read for verification", "verification_failed", {
      productId: payload.product.id,
    })
  }
  const productVerification = verifyCreatedProduct(verificationResult.product, normalized.input)
  const inventoryStateVerification = verifyCreatedInventoryStates({
    store,
    product: verificationResult.product,
    desired: normalized.input,
    spawn,
  })
  const verification = {
    ...productVerification,
    warnings: [...normalized.warnings, ...productVerification.warnings],
    mediaPolls,
    ...(inventoryStateVerification
      ? {
          inventoryStateChecks: inventoryStateVerification.checked,
          inventoryStates: inventoryStateVerification.observedInventory,
        }
      : {}),
  }
  return {
    ok: true,
    dryRun: false,
    product: verificationResult.product,
    verification,
    mediaUpload: { localImagesStaged: normalized.localImages.length },
  }
}

function printJson(value, stream = process.stdout) {
  stream.write(`${JSON.stringify(value, null, 2)}\n`)
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArguments(argv)
    if (args.help) {
      process.stdout.write(HELP)
      return
    }
    if (args.version) {
      process.stdout.write("0.4.0\n")
      return
    }
    const result = await createProduct({
      store: args.store,
      rawProduct: readProductArgument(args),
      apply: args.apply,
    })
    printJson(result)
  } catch (error) {
    printJson(
      {
        ok: false,
        error: error.code || "unexpected_error",
        message: error.message || String(error),
        ...(error.details === undefined ? {} : { details: error.details }),
      },
      process.stderr,
    )
    process.exitCode = 1
  }
}

function isSameFile(left, right) {
  try {
    return realpathSync(left) === realpathSync(right)
  } catch {
    return resolve(left) === resolve(right)
  }
}

const isEntryPoint = process.argv[1] && isSameFile(process.argv[1], fileURLToPath(import.meta.url))
if (isEntryPoint) await main()
