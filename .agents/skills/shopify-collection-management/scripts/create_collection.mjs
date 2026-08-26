#!/usr/bin/env node

import { createCollection } from "./lib/collection_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `create_collection.mjs

Create one manual or smart Collection. Dry-run by default; add --apply only after confirmation.
Creation never publishes implicitly. Use a separately confirmed publication operation afterward.

Manual input:
{
  "title": "Summer",
  "kind": "manual",
  "descriptionHtml": "<p>Summer essentials</p>",
  "seo": { "title": "Summer", "description": "Shop summer essentials" },
  "sort": "best-selling",
  "image": { "src": "https://cdn.example.com/summer.jpg", "altText": "Summer" },
  "productIds": ["gid://shopify/Product/456"]
}

Smart input:
{
  "title": "Summer",
  "kind": "smart",
  "seo": { "title": "Summer", "description": "Shop summer essentials" },
  "rules": {
    "match": "all",
    "conditions": [
      { "field": "Product tag", "relation": "equals", "value": "summer" }
    ]
  }
}
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    allowApply: true,
    handler: ({ store, input, apply }) => createCollection({ store, input, apply }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
