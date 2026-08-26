# Product Publication

Treat product status and sales-channel publication membership as separate business changes. Never substitute `ACTIVE`, `DRAFT`, or `ARCHIVED` for publish or unpublish.

Minimum item data is the target product GID, an explicit `publish` or `unpublish` action, and at least one confirmed publication business target. Accept either an already-known publication GID or the exact merchant-facing sales-channel name. Supplier provenance, location, product status, and inventory are never prerequisites for changing Publication membership itself; `ACTIVE` is a separately confirmed Product outcome when the merchant requires immediate shopper visibility.

Use `scripts/set_product_publication.mjs`. It accepts one Publication per invocation as either `{ "name": "<exact merchant-facing name>" }` or `{ "id": "gid://shopify/Publication/..." }`. When supplied by name, the script requires exactly one trimmed, case-sensitive exact match; zero matches return `publication_not_found` and multiple matches return `publication_ambiguous`. Never infer `Online Store`, choose the first publication, reuse a previous product's target, or require the Main Agent to discover a GID.

For each item:

1. Run the script without `--apply`. Its read-only dry-run resolves the target, reads current membership, and reports `before`, `desired`, and `willChange`.
2. Compare the plan with the confirmed action and target. Do not apply if they differ.
3. If `willChange` is `false`, record `already_satisfied` with `changed: false` and use the dry-run's current-state read as evidence. Stop this Publication target without invoking `--apply` or issuing another read merely to manufacture `after` evidence.
4. If `willChange` is `true`, run the identical input once with `--apply`. The script performs one publish/unpublish mutation and owns the verification read.
5. Record the confirmed business target, resolved GID, action, `changed`, and the available current-state or before/after evidence.

If one Product has multiple confirmed Publication targets, invoke the script independently for each target and report per-target results. A later failure is partial and must not replay or roll back an earlier verified target.

When publication follows product creation, require explicit pre-execution publication confirmation. Create and verify first, then invoke this script with the returned Product GID. If publication fails, preserve the created Product and report partial completion. Do not infer channel targets from the product status, store defaults, or previous products.

For an immediate shopper-visible create-and-publish outcome, the Main Agent's single merchant-facing confirmation preview must enumerate both `status: ACTIVE` and every exact Publication target. These remain separate changes: create or update owns status, and this publication script owns channel membership. A request that explicitly preserves `DRAFT` must not be converted to `ACTIVE`; report that channel membership alone does not make the Product shopper-visible.

## Lightweight storefront reachability

Run a public PDP reachability probe only after Admin publication verification, and only when the confirmed success criteria include storefront URL reachability. Do not perform a pre-write 404 probe unless the merchant explicitly requested a before/after comparison.

Use `scripts/probe_product_storefront.mjs` with the verified Product handle. It starts from the confirmed `*.myshopify.com` store, follows redirects, and performs one lightweight `HEAD` request. Only when the origin rejects or blocks `HEAD` does it make one bounded `GET` fallback and cancel the response body after headers. Record the final URL, HTTP status, method, and whether content was actually inspected. Do not separately fetch the alias and primary domains, download the full page merely to prove HTTP 200, or claim a content/visual pass from reachability alone.
