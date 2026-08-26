#!/usr/bin/env node

import { getProduct } from "./lib/product_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `get_product.mjs

Read one Shopify product by full product GID, including SEO and publication state.

Input: { "id": "gid://shopify/Product/123" }
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    handler: ({ store, input }) => getProduct({ store, input }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
