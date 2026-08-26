import { randomUUID } from "node:crypto"

import {
  fail,
  isObject,
  optionalString,
  requireGid,
  runShopifyOperation,
  throwOnUserErrors,
} from "./runtime.mjs"

export const PRODUCT_INVENTORY_LEVELS_QUERY = `
query GetProductInventoryLevels($productId: ID!, $after: String) {
  product(id: $productId) {
    id
    title
    variants(first: 100, after: $after) {
      nodes {
        id
        title
        sku
        inventoryItem {
          id
          tracked
          inventoryLevels(first: 5) {
            nodes {
              id
              location { id name isActive }
              quantities(names: ["available"]) { name quantity }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
}`.trim()

export const INVENTORY_ITEM_LEVELS_QUERY = `
query GetInventoryItemLevels($inventoryItemId: ID!, $after: String) {
  inventoryItem(id: $inventoryItemId) {
    id
    inventoryLevels(first: 100, after: $after) {
      nodes {
        id
        location { id name isActive }
        quantities(names: ["available"]) { name quantity }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
}`.trim()

export const INVENTORY_LEVEL_QUERY = `
query GetInventoryLevel($inventoryItemId: ID!, $locationId: ID!) {
  inventoryItem(id: $inventoryItemId) {
    id
    tracked
    inventoryLevel(locationId: $locationId) {
      id
      location { id name isActive }
      quantities(names: ["available"]) { name quantity }
    }
  }
}`.trim()

export const INVENTORY_SET_MUTATION = `
mutation SetInventoryAvailable(
  $input: InventorySetQuantitiesInput!
  $idempotencyKey: String!
) {
  inventorySetQuantities(input: $input) @idempotent(key: $idempotencyKey) {
    inventoryAdjustmentGroup {
      createdAt
      reason
      referenceDocumentUri
      changes { name delta quantityAfterChange }
    }
    userErrors { code field message }
  }
}`.trim()

const INVENTORY_REASONS = new Set([
  "correction",
  "cycle_count_available",
  "damaged",
  "movement_created",
  "movement_updated",
  "movement_received",
  "movement_canceled",
  "other",
  "promotion",
  "quality_control",
  "received",
  "reservation_created",
  "reservation_deleted",
  "reservation_updated",
  "restock",
  "safety_stock",
  "shrinkage",
])

const MAX_PAGES = 50
const MIN_QUANTITY = -1_000_000_000
const MAX_QUANTITY = 1_000_000_000

function execute(executor, request) {
  return executor(request)
}

function requireInteger(value, field, { minimum = MIN_QUANTITY } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum || value > MAX_QUANTITY) {
    throw fail(`${field} must be an integer from ${minimum} to ${MAX_QUANTITY}`)
  }
  return value
}

function quantityValue(quantities, name = "available") {
  const match = Array.isArray(quantities)
    ? quantities.find((quantity) => quantity?.name === name)
    : undefined
  return Number.isInteger(match?.quantity) ? match.quantity : null
}

function formatLevel(level) {
  return {
    inventoryLevelId: level?.id || null,
    locationId: level?.location?.id || null,
    locationName: level?.location?.name || null,
    locationActive: level?.location?.isActive === true,
    available: quantityValue(level?.quantities),
  }
}

function nextCursor(connection, label) {
  if (!connection?.pageInfo?.hasNextPage) return null
  const cursor = connection.pageInfo.endCursor
  if (typeof cursor !== "string" || !cursor) {
    throw fail(`Shopify returned no ${label} cursor`, "shopify_invalid_response")
  }
  return cursor
}

function appendLevels({ store, inventoryItem, executor }) {
  const levels = (inventoryItem.inventoryLevels?.nodes || []).map(formatLevel)
  let after = nextCursor(inventoryItem.inventoryLevels, "inventory-level")
  let page = 1
  while (after) {
    if (page >= MAX_PAGES) {
      throw fail("Inventory-level pagination exceeded the safety limit", "shopify_pagination_limit")
    }
    const result = execute(executor, {
      store,
      query: INVENTORY_ITEM_LEVELS_QUERY,
      variables: { inventoryItemId: inventoryItem.id, after },
    })
    if (!result?.inventoryItem?.inventoryLevels) {
      throw fail("Shopify returned no inventory levels payload", "shopify_invalid_response")
    }
    levels.push(...(result.inventoryItem.inventoryLevels.nodes || []).map(formatLevel))
    after = nextCursor(result.inventoryItem.inventoryLevels, "inventory-level")
    page += 1
  }
  return levels
}

export function normalizeGetInventoryLevelsInput(raw) {
  if (!isObject(raw)) throw fail("get_inventory_levels input must be an object")
  return { productId: requireGid(raw.productId, "Product", "productId") }
}

export function getInventoryLevels({
  store,
  input,
  executor = runShopifyOperation,
}) {
  const { productId } = normalizeGetInventoryLevelsInput(input)
  const variants = []
  let productSnapshot
  let after
  let page = 0

  do {
    if (page >= MAX_PAGES) {
      throw fail("Product-variant pagination exceeded the safety limit", "shopify_pagination_limit")
    }
    const result = execute(executor, {
      store,
      query: PRODUCT_INVENTORY_LEVELS_QUERY,
      variables: { productId, after },
    })
    if (!result?.product) throw fail(`Product not found: ${productId}`, "product_not_found")
    const connection = result.product.variants
    if (!connection) {
      throw fail("Shopify returned no product variants payload", "shopify_invalid_response")
    }
    productSnapshot ||= { id: result.product.id, title: result.product.title }
    for (const variant of connection.nodes || []) {
      const item = variant.inventoryItem
      if (!item?.id) {
        throw fail("Shopify returned a variant without an inventory item", "shopify_invalid_response", {
          variantId: variant.id,
        })
      }
      variants.push({
        variantId: variant.id,
        variantTitle: variant.title,
        sku: variant.sku || "",
        inventoryItemId: item.id,
        tracked: item.tracked === true,
        levels: appendLevels({ store, inventoryItem: item, executor }),
      })
    }
    after = nextCursor(connection, "product-variant") || undefined
    page += 1
  } while (after)

  return {
    ok: true,
    product: productSnapshot,
    variants,
  }
}

export function normalizeSetInventoryInput(raw) {
  if (!isObject(raw)) throw fail("set_inventory input must be an object")
  const reason = optionalString(raw.reason, "reason") || "correction"
  if (!INVENTORY_REASONS.has(reason)) {
    throw fail(`reason must be one of ${[...INVENTORY_REASONS].join(", ")}`)
  }
  const referenceDocumentUri = optionalString(raw.referenceDocumentUri, "referenceDocumentUri")
  if (referenceDocumentUri) {
    try {
      new URL(referenceDocumentUri)
    } catch {
      throw fail("referenceDocumentUri must be a valid absolute URI")
    }
  }
  return {
    inventoryItemId: requireGid(raw.inventoryItemId, "InventoryItem", "inventoryItemId"),
    locationId: requireGid(raw.locationId, "Location", "locationId"),
    quantity: requireInteger(raw.quantity, "quantity", { minimum: 0 }),
    compareQuantity: requireInteger(raw.compareQuantity, "compareQuantity"),
    reason,
    referenceDocumentUri,
  }
}

function getInventoryLevel({ store, normalized, executor }) {
  const result = execute(executor, {
    store,
    query: INVENTORY_LEVEL_QUERY,
    variables: {
      inventoryItemId: normalized.inventoryItemId,
      locationId: normalized.locationId,
    },
  })
  const item = result?.inventoryItem
  if (!item) {
    throw fail(`Inventory item not found: ${normalized.inventoryItemId}`, "inventory_item_not_found")
  }
  if (item.tracked !== true) {
    throw fail("Inventory tracking is not enabled for this inventory item", "inventory_not_tracked", {
      inventoryItemId: normalized.inventoryItemId,
    })
  }
  if (!item.inventoryLevel) {
    throw fail("Inventory item is not stocked at the selected location", "inventory_level_not_found", {
      inventoryItemId: normalized.inventoryItemId,
      locationId: normalized.locationId,
    })
  }
  return {
    inventoryItemId: item.id,
    ...formatLevel(item.inventoryLevel),
  }
}

export function setInventory({
  store,
  input,
  apply,
  executor = runShopifyOperation,
  idempotencyKeyFactory = randomUUID,
}) {
  const normalized = normalizeSetInventoryInput(input)
  const plan = {
    inventoryItemId: normalized.inventoryItemId,
    locationId: normalized.locationId,
    name: "available",
    compareQuantity: normalized.compareQuantity,
    quantity: normalized.quantity,
    reason: normalized.reason,
    ...(normalized.referenceDocumentUri
      ? { referenceDocumentUri: normalized.referenceDocumentUri }
      : {}),
  }
  if (!apply) return { ok: true, dryRun: true, store, plan }

  const before = getInventoryLevel({ store, normalized, executor })
  if (before.available !== normalized.compareQuantity) {
    throw fail("Available inventory changed after it was read", "stale_inventory", {
      expected: normalized.compareQuantity,
      actual: before.available,
      inventoryItemId: normalized.inventoryItemId,
      locationId: normalized.locationId,
    })
  }

  if (normalized.quantity === normalized.compareQuantity) {
    return {
      ok: true,
      dryRun: false,
      changed: false,
      before,
      after: before,
    }
  }

  const inputPayload = {
    name: "available",
    reason: normalized.reason,
    quantities: [{
      inventoryItemId: normalized.inventoryItemId,
      locationId: normalized.locationId,
      quantity: normalized.quantity,
      changeFromQuantity: normalized.compareQuantity,
    }],
    ...(normalized.referenceDocumentUri
      ? { referenceDocumentUri: normalized.referenceDocumentUri }
      : {}),
  }
  const mutationResult = execute(executor, {
    store,
    query: INVENTORY_SET_MUTATION,
    variables: {
      input: inputPayload,
      idempotencyKey: idempotencyKeyFactory(),
    },
    allowMutations: true,
  })
  const payload = throwOnUserErrors(mutationResult?.inventorySetQuantities, "inventorySetQuantities")
  const after = getInventoryLevel({ store, normalized, executor })
  if (after.available !== normalized.quantity) {
    throw fail("Inventory verification did not match the requested quantity", "verification_failed", {
      expected: normalized.quantity,
      actual: after.available,
      inventoryItemId: normalized.inventoryItemId,
      locationId: normalized.locationId,
    })
  }
  return {
    ok: true,
    dryRun: false,
    changed: true,
    before,
    after,
    adjustmentGroup: payload.inventoryAdjustmentGroup || null,
  }
}
