#!/usr/bin/env node

import { updateCollection } from "./lib/collection_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `update_collection.mjs

Pre-read and update confirmed Collection fields, SEO, or smart rules while preserving unspecified values.
Dry-run by default; add --apply only after confirmation.

Input:
{
  "id": "gid://shopify/Collection/123",
  "title": "Updated Summer",
  "descriptionHtml": "<p>Updated copy</p>",
  "seo": { "title": "Updated Summer", "description": "Updated search description" },
  "sort": "best-selling",
  "image": { "src": "https://cdn.example.com/summer.jpg", "altText": "Summer" },
  "rules": {
    "match": "all",
    "conditions": [
      { "field": "Product tag", "relation": "equals", "value": "summer" }
    ]
  }
}

Set image to null to remove it. Rules are accepted only for an existing smart Collection.
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    allowApply: true,
    handler: ({ store, input, apply }) => updateCollection({ store, input, apply }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
