#!/usr/bin/env node

import { setProductPublication } from "./lib/publication_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `set_product_publication.mjs

Publish or unpublish one Product on one explicitly confirmed Publication.
Dry-run by default. Add --apply only when the confirmed dry-run reports willChange: true.
willChange: false is already-satisfied read evidence and must not be followed by apply.
ACTIVE status does not imply publication.

Input by exact merchant-facing name:
{
  "id": "gid://shopify/Product/123",
  "action": "publish",
  "publication": { "name": "Online Store" }
}

Input by known Publication GID:
{
  "id": "gid://shopify/Product/123",
  "action": "unpublish",
  "publication": { "id": "gid://shopify/Publication/456" }
}
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    allowApply: true,
    handler: ({ store, input, apply }) => setProductPublication({ store, input, apply }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
