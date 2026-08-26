#!/usr/bin/env node

import { bulkUpdateProductStatus } from "./lib/product_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `bulk_update_product_status.mjs

Set up to 50 products, or the first 50 products in one collection, to ACTIVE, DRAFT, or ARCHIVED.
Each product reports success or failure independently. Dry-run by default.

Input with product IDs:
{ "productIds": ["gid://shopify/Product/123"], "status": "ARCHIVED" }

Input with a collection:
{ "collectionId": "gid://shopify/Collection/456", "status": "DRAFT" }
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    allowApply: true,
    handler: ({ store, input, apply }) => bulkUpdateProductStatus({ store, input, apply }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
