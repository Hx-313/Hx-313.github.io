#!/usr/bin/env node

import { uploadImage } from "./lib/product_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `upload_image.mjs

Create a reusable Shopify-hosted image from one local file or public HTTPS URL.
Dry-run by default; add --apply only after the write gate passes.

Local input:
{ "image": "/absolute/path/image.png", "filename": "hero.png", "alt": "Hero" }

Remote input:
{ "sourceUrl": "https://example.com/image.jpg", "alt": "Product image" }
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    allowApply: true,
    handler: ({ store, input, apply }) => uploadImage({ store, input, apply }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
