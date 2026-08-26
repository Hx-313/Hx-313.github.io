# Update Product

Use `scripts/update_product.mjs` for confirmed changes to product title, HTML description, core SEO title/description, status, public HTTPS images, media removal, and an existing variant's price, compare-at price, SKU, or option values.

## Minimum required business data

- Require the target product GID and at least one confirmed change. A no-op update is invalid.
- Require the confirmed `from` and `to` business values for every changed existing field so stale state can be detected before writing.
- For a variant change, also require that existing variant's GID. For media removal, require the existing media GID and preserve its current URL/alt as evidence before removal.
- Location, SKU, supplier/provenance, media, and publication are not required unless the requested change specifically involves them.

## Supported input

Send the product `id` plus only confirmed changes:

```json
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
```

Do not send unchanged fields. Upload a local update image with `upload_image.mjs` first, then pass its permanent Shopify CDN URL in `images[]`.

## Workflow

1. Read current state once with `get_product.mjs`.
2. Compare every confirmed `from` value with current state. Abort the item with `stale_diff` on any mismatch; never silently push a different diff.
3. Record the URL and alt text of every image approved for removal in `media_removed_evidence`.
4. When all changes are supported, run the update script dry-run and then once with `--apply` after the gate passes.
5. Let the script own its final verification sequence. For media changes it captures one internal baseline, follows Variant/Media pagination, polls pending additions/removals at most three times, and returns `verification.mediaPolls`. Do not reproduce any of those reads outside the script.
6. Require structured JSON with `ok: true` and `verification.passed: true` before reporting success. Shopify-only block formatting may return a `shopify_html_normalized` warning and still pass; meaningful HTML or field differences fail.
7. On `verification_failed`, use `details.mismatches` and `details.observedProduct` from the script-owned read. Do not invoke `get_product.mjs` or another read to override or reclassify the failure.

The script reports `partial_update` and completed steps when a later mutation fails. Preserve that partial state and do not replay completed mutations. Any nonzero exit or `{ "ok": false }` stops later dependent capabilities for the affected item. A stale or unattached removal target fails before mutation as `stale_media_reference`.

Route additions or deletions of whole variants/options, local-image upload, unsupported product fields, inventory-only changes, and non-image media changes as separate confirmed capabilities through the matching route in `SKILL.md`.
