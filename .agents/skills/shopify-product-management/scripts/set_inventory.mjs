#!/usr/bin/env node

import { setInventory } from "./lib/inventory_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `set_inventory.mjs

Set one inventory item's absolute available quantity at one location.
Always read current levels first and pass the observed available value as compareQuantity.
Dry-run by default; add --apply only after the write gate passes.

Input:
{
  "inventoryItemId": "gid://shopify/InventoryItem/123",
  "locationId": "gid://shopify/Location/456",
  "quantity": 20,
  "compareQuantity": 12,
  "reason": "correction"
}
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    allowApply: true,
    handler: ({ store, input, apply }) => setInventory({ store, input, apply }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
