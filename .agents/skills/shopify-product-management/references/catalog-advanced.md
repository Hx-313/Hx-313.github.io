# Advanced Catalog Changes

Use targeted Shopify Admin operations for confirmed product changes not covered by bundled scripts: unsupported product-level fields, whole variant or option additions/deletions, relative inventory adjustments, videos, and post-create media changes.

Select the minimum current operation from the changed business surface. Before every dynamically authored read or write, follow the shared contract's `shopify-admin` load → `search_docs` → compose → `validate` → execute gate. Never inspect bundled script source as a substitute for this fallback.

## Product fields

- Use the current product update operation and send only confirmed changes.
- Use the current `product:` argument shape when required by the active API version.

## Variants and options

- Use only the current bulk variant operation required by the diff. Do not use removed singular variant-update mutations.
- Never use `productSet` replacement semantics for a partial update.
- Put SKU and barcode inside `inventoryItem` for bulk-variant fallback inputs. Do not reuse the create-script variant shape.

## Relative inventory adjustments

- Use the dedicated inventory route for reads, absolute sets, location selection, and initial create quantities.
- For a confirmed delta, require one uniquely identified inventory item, one selected stocked location, an integer delta, and a merchant-approved reason.
- Never convert a delta into an absolute value or reuse the absolute-set script.
- Discover and validate the current relative-adjustment operation, including any required idempotency directive.

## Media

- Preserve every approved source and alt text exactly. Never generate, edit, replace, or improve media without separate confirmation.
- Treat Product Media upload and Variant media binding as separate outcomes. A filename or alt text that mentions an option value or SKU is not a binding; require the exact Product Variant and Product Media identities before composing a binding operation.
- Use a targeted current operation for videos and post-create media changes. Do not manually rebuild staging pipelines already owned by bundled scripts.
