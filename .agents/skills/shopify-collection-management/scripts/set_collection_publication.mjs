#!/usr/bin/env node

import { setCollectionPublication } from "./lib/publication_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `set_collection_publication.mjs

Publish or unpublish one Collection on one explicitly confirmed Publication.
Dry-run by default. Add --apply only when the confirmed dry-run reports willChange: true.
Do not invoke --apply when willChange: false; it is already-satisfied read evidence.
No channel is selected implicitly.

Input by exact merchant-facing name:
{
  "id": "gid://shopify/Collection/123",
  "action": "publish",
  "publication": { "name": "Online Store" }
}

Input by known Publication GID:
{
  "id": "gid://shopify/Collection/123",
  "action": "unpublish",
  "publication": { "id": "gid://shopify/Publication/456" }
}
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    allowApply: true,
    handler: ({ store, input, apply }) => setCollectionPublication({ store, input, apply }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
