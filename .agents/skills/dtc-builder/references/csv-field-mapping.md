# Product-selection deliverables → product business brief

If `project/.workspace/` contains the following files, **read them first** before starting the listing.

## Required input files

| File | Purpose |
|---|---|
| `_discovery-brief.md` | Identify `buyer_level` (novice / pro) — drives all subsequent tone |
| `_product-marketing-ops.csv` | 26 columns total: cols 1-13 provide merchant-facing catalog data for the product-create intent (interpreted below); cols 14-26 are optional selection/operations context |
| `_unit-economics.csv` | Pricing, markup, landed cost — used to validate that the user-given price is consistent |

`supplier_url` is optional supplemental metadata for every product, including products or images found through supplier/search tools. It may be blank or absent and is never externally verified. Its absence or incompleteness must not block product creation, media upload, publication, or launch readiness.

## CSV column → business meaning (cols 1-13 only)

This table normalizes the user's data into a business brief. It is **not** an Admin API/GraphQL mapping. The `shopify-product-editor` sub-agent chooses the API operation and maps these concepts into the correct current API fields after loading its skills.

| CSV column | Business meaning passed to the executor |
|---|---|
| product_title | Shopper-facing product title |
| handle | Desired storefront handle |
| product_type | Merchant-facing product type/category label |
| tags | Product tags; split the CSV value on commas |
| description_html | Approved rich-text product description |
| seo_title | Desired SEO title |
| seo_description | Desired SEO description |
| price | Selling price for the applicable variant; currency follows the store's primary currency and must not be encoded in the column header |
| compare_at_price | Optional reference/compare-at price for the applicable variant |
| sku_code | Merchant SKU |
| inventory_qty | Desired inventory quantity |
| supplier_image_urls | Ordered approved product-media URLs, split on `\|`. This is a legacy column name and may contain merchant-provided exact-SKU images; it does not imply that a supplier URL exists. |
| google_product_category | Desired standard product category |

**Cols 14-26 (price_tier, primary_holiday, … selection_criteria)** are optional business context, not implied store fields. Pass only user-approved effects (for example, adding a holiday tag) as business intent; never invent a store field or tell the executor where an API value belongs.

## Conditional business targets outside the CSV

- If any product has `inventory_qty`, location may be omitted. The executor automatically uses the only active store location; when several active locations exist it must return `inventory_location_required` before writing so the Main Agent can show the choices and obtain confirmation.
- If the user already specified an inventory location, pass its exact merchant-facing name or an already-known GID. Never silently choose the first, primary, or previously used location.
- If any product should be shopper-visible, confirm every sales channel by exact merchant-facing name or reuse an already-known publication GID returned by an executor in this task. “Published” without a named target is incomplete.
- Put these identities in the business brief as targets, not as GraphQL fields. `shopify-product-editor` resolves exact names and owns their API placement.
- When multiple inventory locations or an unresolved publication target requires confirmation, do not create a partial product and improvise the target later.

## Fallback strategy

If `_product-marketing-ops.csv` is missing → fall back to "ask the user per field" mode. **Never silently fabricate fields** (violates R2).
