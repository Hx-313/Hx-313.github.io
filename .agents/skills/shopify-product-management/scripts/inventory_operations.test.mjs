import assert from "node:assert/strict"
import test from "node:test"

import {
  INVENTORY_ITEM_LEVELS_QUERY,
  INVENTORY_LEVEL_QUERY,
  INVENTORY_SET_MUTATION,
  PRODUCT_INVENTORY_LEVELS_QUERY,
  getInventoryLevels,
  normalizeSetInventoryInput,
  setInventory,
} from "./lib/inventory_operations.mjs"

function levelFixture({
  id = "gid://shopify/InventoryLevel/1?inventory_item_id=1",
  locationId = "gid://shopify/Location/1",
  locationName = "Main",
  available = 5,
} = {}) {
  return {
    id,
    location: { id: locationId, name: locationName, isActive: true },
    quantities: [{ name: "available", quantity: available }],
  }
}

test("get_inventory_levels reads every variant and paginates nested levels", () => {
  const calls = []
  const result = getInventoryLevels({
    store: "example.myshopify.com",
    input: { productId: "gid://shopify/Product/1" },
    executor: (request) => {
      calls.push(request)
      if (request.query === PRODUCT_INVENTORY_LEVELS_QUERY) {
        if (!request.variables.after) {
          return {
            product: {
              id: "gid://shopify/Product/1",
              title: "Product",
              variants: {
                nodes: [{
                  id: "gid://shopify/ProductVariant/1",
                  title: "Red",
                  sku: "RED",
                  inventoryItem: {
                    id: "gid://shopify/InventoryItem/1",
                    tracked: true,
                    inventoryLevels: {
                      nodes: [levelFixture()],
                      pageInfo: { hasNextPage: true, endCursor: "level-next" },
                    },
                  },
                }],
                pageInfo: { hasNextPage: true, endCursor: "variant-next" },
              },
            },
          }
        }
        return {
          product: {
            id: "gid://shopify/Product/1",
            title: "Product",
            variants: {
              nodes: [{
                id: "gid://shopify/ProductVariant/2",
                title: "Blue",
                sku: "BLUE",
                inventoryItem: {
                  id: "gid://shopify/InventoryItem/2",
                  tracked: false,
                  inventoryLevels: {
                    nodes: [],
                    pageInfo: { hasNextPage: false, endCursor: null },
                  },
                },
              }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }
      }
      if (request.query === INVENTORY_ITEM_LEVELS_QUERY) {
        return {
          inventoryItem: {
            id: "gid://shopify/InventoryItem/1",
            inventoryLevels: {
              nodes: [levelFixture({
                id: "gid://shopify/InventoryLevel/2?inventory_item_id=1",
                locationId: "gid://shopify/Location/2",
                locationName: "Overflow",
                available: 7,
              })],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }
      }
      throw new Error("unexpected query")
    },
  })

  assert.deepEqual(calls.map(({ query }) => query), [
    PRODUCT_INVENTORY_LEVELS_QUERY,
    INVENTORY_ITEM_LEVELS_QUERY,
    PRODUCT_INVENTORY_LEVELS_QUERY,
  ])
  assert.equal(result.variants.length, 2)
  assert.equal(result.variants[0].inventoryItemId, "gid://shopify/InventoryItem/1")
  assert.deepEqual(result.variants[0].levels.map(({ available }) => available), [5, 7])
  assert.equal(result.variants[1].tracked, false)
})

test("set_inventory requires a safe comparison quantity and validates reasons", () => {
  assert.throws(
    () => normalizeSetInventoryInput({
      inventoryItemId: "gid://shopify/InventoryItem/1",
      locationId: "gid://shopify/Location/1",
      quantity: 5,
    }),
    /compareQuantity/,
  )
  assert.throws(
    () => normalizeSetInventoryInput({
      inventoryItemId: "gid://shopify/InventoryItem/1",
      locationId: "gid://shopify/Location/1",
      quantity: 5,
      compareQuantity: 4,
      reason: "invented_reason",
    }),
    /reason must be one of/,
  )
})

test("set_inventory dry-run never reads or writes the store", () => {
  const result = setInventory({
    store: "example.myshopify.com",
    input: {
      inventoryItemId: "gid://shopify/InventoryItem/1",
      locationId: "gid://shopify/Location/1",
      quantity: 8,
      compareQuantity: 5,
      reason: "received",
    },
    apply: false,
    executor: () => {
      throw new Error("executor should not run")
    },
  })
  assert.equal(result.dryRun, true)
  assert.equal(result.plan.compareQuantity, 5)
  assert.equal(result.plan.quantity, 8)
})

test("set_inventory maps compareQuantity to changeFromQuantity and verifies the result", () => {
  const calls = []
  let readCount = 0
  const result = setInventory({
    store: "example.myshopify.com",
    input: {
      inventoryItemId: "gid://shopify/InventoryItem/1",
      locationId: "gid://shopify/Location/1",
      quantity: 8,
      compareQuantity: 5,
      reason: "received",
    },
    apply: true,
    idempotencyKeyFactory: () => "test-idempotency-key",
    executor: (request) => {
      calls.push(request)
      if (request.query === INVENTORY_LEVEL_QUERY) {
        readCount += 1
        return {
          inventoryItem: {
            id: "gid://shopify/InventoryItem/1",
            tracked: true,
            inventoryLevel: levelFixture({ available: readCount === 1 ? 5 : 8 }),
          },
        }
      }
      if (request.query === INVENTORY_SET_MUTATION) {
        return {
          inventorySetQuantities: {
            inventoryAdjustmentGroup: {
              reason: "received",
              changes: [{ name: "available", delta: 3, quantityAfterChange: 8 }],
            },
            userErrors: [],
          },
        }
      }
      throw new Error("unexpected query")
    },
  })

  assert.deepEqual(calls.map(({ query }) => query), [
    INVENTORY_LEVEL_QUERY,
    INVENTORY_SET_MUTATION,
    INVENTORY_LEVEL_QUERY,
  ])
  assert.deepEqual(calls[1].variables.input.quantities, [{
    inventoryItemId: "gid://shopify/InventoryItem/1",
    locationId: "gid://shopify/Location/1",
    quantity: 8,
    changeFromQuantity: 5,
  }])
  assert.equal(calls[1].variables.idempotencyKey, "test-idempotency-key")
  assert.equal(calls[1].allowMutations, true)
  assert.equal(result.before.available, 5)
  assert.equal(result.after.available, 8)
})

test("set_inventory aborts before mutation when the observed quantity is stale", () => {
  const calls = []
  assert.throws(
    () => setInventory({
      store: "example.myshopify.com",
      input: {
        inventoryItemId: "gid://shopify/InventoryItem/1",
        locationId: "gid://shopify/Location/1",
        quantity: 8,
        compareQuantity: 5,
      },
      apply: true,
      executor: (request) => {
        calls.push(request)
        return {
          inventoryItem: {
            id: "gid://shopify/InventoryItem/1",
            tracked: true,
            inventoryLevel: levelFixture({ available: 6 }),
          },
        }
      },
    }),
    (error) => error.code === "stale_inventory" && error.details.actual === 6,
  )
  assert.deepEqual(calls.map(({ query }) => query), [INVENTORY_LEVEL_QUERY])
})
