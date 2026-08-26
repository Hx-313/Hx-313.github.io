# Create Product

Use `scripts/create_product.mjs` only to create a new product. Never use its `productSet` replacement semantics to update an existing product.

## Confirmation and input gates

- Minimum product data is `title`. Omitted `status` safely defaults to `DRAFT`, and omitted publication means not published.
- Require the confirmation summary to show every value that will be written. When media is included, show its actual URLs/previews; an explicitly confirmed no-media draft is valid.
- Before immediate shopper-visible publication, use one confirmation preview that separately shows `status: ACTIVE` and every exact Publication target. One reply may confirm both displayed outcomes, but status remains a Product field and publication remains a later routed channel operation. If the merchant explicitly keeps `DRAFT`, do not activate it; explain that Publication membership alone is not storefront visibility.
- Reject duplicate non-blank SKUs and intended handles inside the brief after trimmed, case-folded comparison. Never manufacture or repair a SKU.
- Preserve approved media sources and alt text exactly. Map approved `media[].src` to `images[].url` and `media[].alt` to `images[].altText` without changing either value.
- When variants are supplied, require `options`, a non-negative decimal-string `price` for every variant, and one value for every declared option. For a single supplied variant, use the documented default Title graph when no merchant option exists. SKU and compare-at price remain optional.
- When an inventory quantity is supplied, require an integer quantity and route location resolution through `resolve_inventory_location.mjs`. The caller need not provide a location when the store has exactly one active location; multiple active locations abort before product creation until the user chooses one. Verification uses `inventoryQuantity` only for explicitly supplied `available` totals; each supplied `on_hand` value is verified against its exact Variant and Location inventory state.
- When an image is supplied, require its source URL/path; alt text, filename, and MIME override are optional.
- `images[]` creates Product Media only. Alt text that names a color or SKU does not bind that image to a Product Variant. Route an explicitly confirmed variant-media binding through `catalog-advanced.md`; never report a binding from this script.
- To claim that a created variant is not inventory-tracked, send `inventoryItem: { "tracked": false }` explicitly. Omission is not evidence of that business outcome.
- Omit optional fields instead of inventing values.

## Supported input

```json
{
  "title": "T-shirt",
  "descriptionHtml": "<p>...</p>",
  "vendor": "Acme",
  "productType": "Shirts",
  "tags": ["summer"],
  "handle": "t-shirt",
  "status": "DRAFT",
  "seo": { "title": "T-shirt", "description": "..." },
  "options": ["Color"],
  "variants": [{
    "price": "29.00",
    "compareAtPrice": "39.00",
    "sku": "TS-RED",
    "optionValues": [{ "optionName": "Color", "name": "Red" }],
    "inventoryItem": { "tracked": true },
    "inventoryQuantities": [{
      "locationId": "gid://shopify/Location/123",
      "name": "available",
      "quantity": 10
    }]
  }],
  "images": [
    { "url": "https://example.com/product.jpg", "altText": "Front" },
    { "url": "/absolute/path/to/detail.png", "altText": "Detail" }
  ]
}
```

Each `images[].url` must be a public HTTPS URL or a readable absolute local image path. A local `file://` URI may be decoded to the same absolute path as transport normalization; this does not authorize changing the file or substituting another image. Optional `filename` and `mimeType` can override inference; require `mimeType` to be `image/*`.

For a single variant, provide `options: ["Title"]` and one `optionValues` entry whose `optionName` is `Title` and whose `name` is `Default Title`. Keep SKU optional. If `compareAtPrice <= price`, the script omits it from `productSetInput` and reports `compare_at_price_inverted` rather than manufacturing a discount; both dry-run and apply results preserve that warning.

## Workflow

1. Map the confirmed business fields to one script input without adding unconfirmed values. When inventory is confirmed, run the location resolver first and include quantities only after it returns one active location GID.
2. Invoke `scripts/create_product.mjs` through the shared script contract with `--store` and exactly one of `--input` or `--json`; do not add `--apply` for the dry-run.
3. Inspect dry-run `{ "ok": true, "dryRun": true, "productSetInput": ..., "warnings": [...], "mediaPlan": ... }` and require it to match the confirmed item after any explicitly reported safe omission.
4. Run the same script and identical input once with `--apply` after all gates pass. Require `{ "ok": true, "dryRun": false, "product": { "id": ... }, "verification": { "passed": true, "warnings": [...] } }`; the returned Product is the script's owned post-create verification read, including confirmed core SEO, options, variants, explicit inventory tracking, explicitly supplied `available` totals, location-specific `on_hand` states, and Product Media. Successful exact inventory-state checks are returned under `verification.inventoryStates`. The script owns Variant/Media pagination and internally polls media still processing at most three times about five seconds apart.
5. Treat a nonzero exit or `{ "ok": false }` as terminal for this item. When `details.productId` is present, the Product exists and the item is `partial`; otherwise it is `failed` unless the structured error explicitly proves another partial state. Stop later publication, Collection membership, and other dependent capabilities for that item.
6. Compare only from the script's structured JSON. Do not issue a duplicate verification read. In particular, do not invoke `get_product.mjs` or another read to override, repair, or reclassify an `ok: false` result. On `verification_failed`, use `details.mismatches` and `details.observedProduct` as the final owned read evidence.
7. Shopify may reformat whitespace around block HTML elements. `{ "code": "shopify_html_normalized", "field": "descriptionHtml" }` is a successful formatting-only warning; a meaningful text, inline-space, tag, or attribute difference remains `verification_failed`.

The script defaults status to `DRAFT`, checks supplied SKUs and handle against the store, requests all local-image staged targets in one call, uploads local files concurrently, passes only returned `resourceUrl` values into `productSet`, and owns the complete Product verification sequence. Its dry-run reports `mediaPlan` without uploading or exposing signed staging parameters.
