#!/usr/bin/env node

import { getInventoryLevels } from "./lib/inventory_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `get_inventory_levels.mjs

Read available inventory for every variant of one product across stocked locations.

Input:
{ "productId": "gid://shopify/Product/123" }
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    handler: ({ store, input }) => getInventoryLevels({ store, input }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
