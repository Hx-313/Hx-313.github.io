#!/usr/bin/env node

import { getCollection } from "./lib/collection_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `get_collection.mjs

Read one Shopify Collection by exact GID, including SEO, rules, publication state, and products.

Input:
{
  "id": "gid://shopify/Collection/123",
  "products_first": 50,
  "products_after": null,
  "all_products": false
}

Set all_products to true only when a complete membership snapshot is required.
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    handler: ({ store, input }) => getCollection({ store, input }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
