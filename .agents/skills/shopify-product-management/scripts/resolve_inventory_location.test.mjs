import assert from "node:assert/strict"
import test from "node:test"

import {
  LOCATIONS_QUERY,
  normalizeLocationTarget,
  resolveInventoryLocation,
} from "./resolve_inventory_location.mjs"

const locations = [
  { id: "gid://shopify/Location/1", name: "Main Warehouse", isActive: true },
  { id: "gid://shopify/Location/2", name: "Retail Store", isActive: true },
  { id: "gid://shopify/Location/3", name: "Closed", isActive: false },
]

function executorWith(nodes, calls = []) {
  return (request) => {
    calls.push(request)
    return { locations: { nodes } }
  }
}

test("normalizes an optional inventory location target", () => {
  assert.deepEqual(normalizeLocationTarget({}), { id: undefined, name: undefined })
  assert.deepEqual(normalizeLocationTarget({ name: " Main Warehouse " }), {
    id: undefined,
    name: "Main Warehouse",
  })
  assert.throws(() => normalizeLocationTarget({ id: locations[0].id, name: "Main Warehouse" }), /at most one/)
})

test("automatically resolves the only active location", () => {
  const calls = []
  const result = resolveInventoryLocation({
    store: "example.myshopify.com",
    input: {},
    executor: executorWith([locations[0], locations[2]], calls),
  })
  assert.equal(calls[0].query, LOCATIONS_QUERY)
  assert.equal(result.resolution, "single_active_location")
  assert.equal(result.location.id, locations[0].id)
})

test("requires confirmation when multiple active locations exist", () => {
  assert.throws(
    () => resolveInventoryLocation({
      store: "example.myshopify.com",
      input: {},
      executor: executorWith(locations),
    }),
    (error) => {
      assert.equal(error.code, "inventory_location_required")
      assert.equal(error.details.candidates.length, 2)
      return true
    },
  )
})

test("resolves only an active exact ID or name", () => {
  const byName = resolveInventoryLocation({
    store: "example.myshopify.com",
    input: { name: "Retail Store" },
    executor: executorWith(locations),
  })
  assert.equal(byName.location.id, locations[1].id)
  assert.equal(byName.resolution, "explicit_name")

  assert.throws(
    () => resolveInventoryLocation({
      store: "example.myshopify.com",
      input: { id: locations[2].id },
      executor: executorWith(locations),
    }),
    (error) => error.code === "inventory_location_unavailable",
  )
})
