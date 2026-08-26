#!/usr/bin/env node

import { uploadImage } from "./lib/image_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `upload_image.mjs

Create a reusable Shopify-hosted image from one local file or public HTTPS URL.
The implementation is bundled with this Collection Skill so it remains independently packageable.
Dry-run by default; add --apply only after confirmation.

Local input:
{ "image": "/absolute/path/image.png", "filename": "collection.png", "alt": "Summer" }

Remote input:
{ "sourceUrl": "https://example.com/image.jpg", "alt": "Summer" }
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
