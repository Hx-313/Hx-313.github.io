#!/usr/bin/env node

import { removeFromCollection } from "./lib/collection_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `remove_from_collection.mjs

Remove up to 250 existing products from one manual Collection.
Already-absent products are skipped. Dry-run by default; add --apply after confirmation.

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
    handler: ({ store, input, apply }) => removeFromCollection({ store, input, apply }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
