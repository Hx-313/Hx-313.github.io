# Collection Tool Routing

Use bundled scripts as the primary execution layer. They replace the external Shopify Collection MCP operations that this plugin does not provide. Choose the smallest script whose contract exactly matches the confirmed outcome; use the Admin fallback only for uncovered surfaces.

## Bundled scripts

All paths are relative to the parent `SKILL.md`. Read scripts execute immediately. Write scripts are dry-run by default and require `--apply` only after the business gate passes.

| Capability | Script | Input contract |
|---|---|---|
| Browse/search Collections | `scripts/search_collections.mjs` | `search_query?`, `first?`, `after?`, `sort_key?`, `reverse?` |
| Resolve one exact Collection | `scripts/resolve_collection.mjs` | exactly one of Collection `id` or case-sensitive exact `name` |
| Read one Collection | `scripts/get_collection.mjs` | Collection `id`; optional product cursor, page size, or `all_products` |
| Create manual or smart Collection | `scripts/create_collection.mjs` | `title`, `kind`, optional confirmed fields including core `seo`; smart rules or manual `productIds` |
| Update fields, core SEO, or smart rules | `scripts/update_collection.mjs` | Collection `id` plus only confirmed changed fields |
| Add manual membership | `scripts/add_to_collection.mjs` | Collection GID plus 1–250 Product GIDs |
| Remove manual membership | `scripts/remove_from_collection.mjs` | Collection GID plus 1–250 Product GIDs |
| Publish/unpublish on one Publication | `scripts/set_collection_publication.mjs` | Collection GID, `publish`/`unpublish`, and exactly one Publication exact name or GID |
| Create a permanent Shopify-hosted image | `scripts/upload_image.mjs` | one local absolute path or public HTTPS source |

Run `resolve_collection.mjs` before another script when the brief names a Collection instead of carrying its GID. Zero exact matches returns `collection_not_found`; multiple exact matches returns `collection_ambiguous` with candidates. Search candidates never authorize a write.

`create_collection.mjs` never publishes implicitly. Creation and publication remain separate merchant outcomes. For a confirmed create-and-publish request, create and verify first, then run `set_collection_publication.mjs` with the returned Collection GID and the independently confirmed target. If creation succeeds but publication fails, preserve the Collection and report partial completion.

`set_collection_publication.mjs` resolves one exact Publication target and reads current state on dry-run. When dry-run reports `willChange: false`, record `already_satisfied` and do not invoke `--apply`; when it reports `willChange: true`, apply once and let the script own its mutation plus verification read. It never defaults to Online Store. Invoke it independently for each confirmed target so partial results remain attributable.

`update_collection.mjs` pre-reads the target, computes a minimum field-level diff, preserves unspecified fields, rejects manual-to-smart transitions, accepts a valid job-only asynchronous response, waits for any rule-membership Job returned by Shopify, and only then reads the known Collection GID to verify the changed fields. A local image path is not a Collection image URL; invoke `upload_image.mjs` first and pass only the returned permanent HTTPS URL to create or update.

The membership scripts pre-read exact Product membership, reject smart Collections, skip already-satisfied products, mutate only the remainder, and verify every requested Product GID. Removal waits for Shopify's asynchronous Job through the Admin API `job(id:)` query before verification.

## Admin fallback for uncovered surfaces

Deletion and any genuinely uncovered Collection field use the plugin's validated Shopify Admin CLI path:

1. Load `shopify-admin` and search the current official documentation for the exact operation and complete input shape.
2. Compose the smallest GraphQL document for the confirmed outcome and validate it before execution.
3. Load `shopify-use-shopify-cli`; execute against the confirmed store and pass its mutation gate for writes.
4. Run a separate validated verification read.

Deletion additionally requires the complete backup and item-specific confirmation in [delete-collection.md](delete-collection.md). Do not use generic Admin execution merely because a bundled script's source is opaque or because its first call returned a structured business error. Use the error as the result; never reconstruct or retry a script-owned mutation.

## API compatibility boundary

The bundled rule and membership scripts intentionally retain the Collection contracts verified for this plugin's target runtime (`CollectionInput.ruleSet`, `collectionAddProducts`, and `collectionRemoveProducts`). These surfaces are version-sensitive. Do not silently translate them to a newer source-based Collection model, generic Admin fallback, or a different mutation after a schema rejection. Report `api_compatibility_blocker`, preserve any earlier verified phase, and migrate only after the target CLI/API version validates equivalent manual/smart semantics, membership behavior, dry-run evidence, and post-write verification.

## Verification targets

- Create: returned GID resolves; title, kind, rules, image, sort, and initial membership equal the confirmed outcome; publication remains unchanged until the separate publication step.
- Update: every changed field equals the desired value and unspecified fields remain untouched.
- Membership: each requested Product GID has the requested state.
- Publication: the exact confirmed Publication GID reflects the requested visibility.
- Delete: the Collection GID no longer resolves and the validated local backup remains present and non-empty.

Do not switch execution paths after a successful write. If a later verification step fails, report the verified mutation result and verification blocker rather than replaying the write.
