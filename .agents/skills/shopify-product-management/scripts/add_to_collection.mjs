#!/usr/bin/env node

import { addToCollection } from "../../shopify-collection-management/scripts/lib/collection_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `add_to_collection.mjs

Add up to 250 existing products to one existing collection.
Already-present products are skipped. Dry-run by default; add --apply only after the write gate passes.

Input:
{
  "collectionId": "gid://shopify/Collection/123",
  "productIds": ["gid://shopify/Product/456"]
}
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    allowApply: true,
    handler: ({ store, input, apply }) => addToCollection({ store, input, apply }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
