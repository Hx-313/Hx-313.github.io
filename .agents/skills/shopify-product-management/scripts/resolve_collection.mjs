#!/usr/bin/env node

import { resolveCollection } from "../../shopify-collection-management/scripts/lib/collection_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `resolve_collection.mjs

Resolve one existing collection from a confirmed GID or exact merchant-facing name.

Input with a GID:
{ "id": "gid://shopify/Collection/123" }

Input with an exact name:
{ "name": "Summer" }
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    handler: ({ store, input }) => resolveCollection({ store, input }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
