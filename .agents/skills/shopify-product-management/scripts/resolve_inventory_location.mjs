#!/usr/bin/env node

import {
  fail,
  isEntryPoint,
  isObject,
  optionalString,
  requireGid,
  runJsonScript,
  runShopifyOperation,
} from "./lib/runtime.mjs"

export const LOCATIONS_QUERY = `
query ResolveInventoryLocation {
  locations(first: 250) {
    nodes { id name isActive }
  }
}
`.trim()

const HELP = `resolve_inventory_location.mjs

Resolve the location for a confirmed inventory quantity.

Input with an existing GID:
{ "id": "gid://shopify/Location/123" }

Input with an exact merchant-facing name:
{ "name": "Main Warehouse" }

Input with no target:
{}

With no target, the script succeeds only when exactly one active location exists.
Multiple active locations return inventory_location_required without choosing one.
`

export function normalizeLocationTarget(raw) {
  if (!isObject(raw)) throw fail("location target must be an object")
  const hasId = raw.id !== undefined
  const hasName = raw.name !== undefined
  if (hasId && hasName) throw fail("provide at most one of id or name")
  return {
    id: hasId ? requireGid(raw.id, "Location", "id") : undefined,
    name: hasName ? optionalString(raw.name, "name") : undefined,
  }
}

function snapshot(location) {
  return { id: location.id, name: location.name, isActive: location.isActive }
}

export function resolveInventoryLocation({
  store,
  input,
  executor = runShopifyOperation,
}) {
  const target = normalizeLocationTarget(input)
  const result = executor({ store, query: LOCATIONS_QUERY })
  const locations = result?.locations?.nodes
  if (!Array.isArray(locations)) {
    throw fail("Shopify returned no locations payload", "shopify_invalid_response")
  }
  const active = locations.filter((location) => location?.isActive === true)

  if (target.id) {
    const match = active.find((location) => location.id === target.id)
    if (!match) {
      throw fail("The confirmed inventory location is not active in this store", "inventory_location_unavailable", {
        target,
      })
    }
    return { ok: true, resolution: "explicit_id", location: snapshot(match) }
  }

  if (target.name) {
    const matches = active.filter((location) => location.name?.trim() === target.name)
    if (matches.length === 0) {
      throw fail("No active inventory location matches the confirmed name", "inventory_location_unavailable", {
        target,
      })
    }
    if (matches.length > 1) {
      throw fail("More than one active inventory location matches the confirmed name", "inventory_location_ambiguous", {
        target,
        candidates: matches.map(snapshot),
      })
    }
    return { ok: true, resolution: "explicit_name", location: snapshot(matches[0]) }
  }

  if (active.length === 1) {
    return { ok: true, resolution: "single_active_location", location: snapshot(active[0]) }
  }
  if (active.length === 0) {
    throw fail("The store has no active inventory location", "inventory_location_unavailable")
  }
  throw fail("Inventory location must be confirmed because the store has multiple active locations", "inventory_location_required", {
    candidates: active.map(snapshot),
  })
}

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    handler: ({ store, input }) => resolveInventoryLocation({ store, input }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
