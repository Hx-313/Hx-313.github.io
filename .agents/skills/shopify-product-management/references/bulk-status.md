# Bulk Product Status

Use `scripts/bulk_update_product_status.mjs` to set up to 50 product IDs, or the first 50 products in one collection, to `ACTIVE`, `DRAFT`, or `ARCHIVED`.

Minimum input is `status` plus exactly one target: one to fifty product GIDs or one collection GID. Location, publication, SKU, and supplier data are not required.

Use exactly one target shape:

```json
{ "productIds": ["gid://shopify/Product/123"], "status": "ARCHIVED" }
```

```json
{ "collectionId": "gid://shopify/Collection/456", "status": "DRAFT" }
```

Run dry-run first and add `--apply` only after the write gate passes. Inspect `failed`, every entry in `results`, and `truncatedToFirst50`; each product succeeds or fails independently.

Treat product status and sales-channel publication as separate business changes. Never use `ACTIVE`, `DRAFT`, or `ARCHIVED` as a substitute for publish or unpublish.
