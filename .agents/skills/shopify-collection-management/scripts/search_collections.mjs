#!/usr/bin/env node

import { searchCollections } from "./lib/collection_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `search_collections.mjs

Search or browse up to 50 Shopify Collections with cursor pagination.

Input:
{
  "search_query": "title:Summer",
  "first": 10,
  "after": null,
  "sort_key": "UPDATED_AT",
  "reverse": true
}
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    handler: ({ store, input }) => searchCollections({ store, input }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
