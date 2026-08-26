#!/usr/bin/env node

import { updateProduct } from "./lib/product_operations.mjs"
import { isEntryPoint, runJsonScript } from "./lib/runtime.mjs"

const HELP = `update_product.mjs

Update confirmed product fields, SEO, public images, existing variants, or remove media.
Dry-run by default; add --apply only after the write gate passes.

Input:
{
  "id": "gid://shopify/Product/123",
  "title": "Updated title",
  "descriptionHtml": "<p>Updated description</p>",
  "seo": { "title": "Updated SEO title", "description": "Updated search description" },
  "status": "DRAFT",
  "images": [{ "url": "https://example.com/image.jpg", "altText": "Front" }],
  "removeMediaIds": ["gid://shopify/MediaImage/456"],
  "variants": [{
    "id": "gid://shopify/ProductVariant/789",
    "price": "29.00",
    "compareAtPrice": "39.00",
    "sku": "SKU-1",
    "optionValues": [{ "optionName": "Color", "name": "Red" }]
  }]
}
`

export function main(argv = process.argv.slice(2)) {
  return runJsonScript({
    argv,
    help: HELP,
    allowApply: true,
    handler: ({ store, input, apply }) => updateProduct({ store, input, apply }),
  })
}

if (isEntryPoint(import.meta.url)) await main()
