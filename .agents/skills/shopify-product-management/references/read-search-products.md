# Read and Search Products

Use `scripts/get_product.mjs` to read one known product and `scripts/search_products.mjs` to find or browse products. These are read-only operations and do not require the write contract.

Use the exact `install_path` returned when this Skill was loaded as `SKILL_DIR`. The executable paths are `${SKILL_DIR}/scripts/get_product.mjs` and `${SKILL_DIR}/scripts/search_products.mjs`; do not shorten them to `<plugin-root>/scripts/...`. Supply `--store` as a full `*.myshopify.com` domain. For this read-only route, normalize a short handle before the first invocation only after the connection gate verifies the resulting domain is the exact bound store.

## Read one product

- Use `get_product.mjs` only with a full product GID:

```json
{ "id": "gid://shopify/Product/123" }
```

- If the request supplies only a title, handle, SKU, or numeric ID, search first instead of constructing a GID.
- The full product GID is the only product-specific required field for this direct-read path.
- The result includes core Product SEO plus the first 100 Variants, first 100 Media entries, and up to 100 Publication states. Treat a returned `hasNextPage` or `publicationsComplete: false` as incomplete coverage rather than absence. Write scripts selectively paginate the changed Variant/Media surface inside their owned verification instead of making this general read expensive by default.

## Search products

Use this input shape:

```json
{
  "search_query": "status:draft AND tag:sale",
  "first": 10,
  "after": null,
  "sort_key": "UPDATED_AT",
  "reverse": true
}
```

Every search field is optional; `{}` browses the first ten products. Provide `search_query` only when filtering, and provide `after` only when continuing a known cursor.

- Return at most 50 products and expose `pageInfo`.
- Do not auto-paginate. Load the next cursor or refine the query only when the requested scope requires it.
- Use supported Shopify search filters such as `title`, `vendor`, `product_type`, `handle`, `sku`, `barcode`, `variant_title`, `tag`, `tag_not`, `status`, `price`, `inventory_total`, product/date/boolean filters, `collection_id`, and `category_id`.
- Never invent dotted field paths.
