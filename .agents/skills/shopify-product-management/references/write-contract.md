# Product Write Contract

Apply this contract to every product write. Keep business confirmation, routing, execution, fallback, and verification as separate phases.

Load the shared [`shopify-product-collection-write-brief`](../../shopify-product-collection-write-brief/SKILL.md) Skill first. This reference defines Product-specific validation inside its canonical nested `product` envelope; it does not define another top-level brief shape.

## 1. Business confirmation

Complete this phase without store access:

1. Require top-level `store_handle` as a full `*.myshopify.com` domain and a `resource_scope` that selects Product. Never infer or discover another store.
2. Before the first product-writer spawn, require caller-provided `user_confirmed_at`, `user_confirmation_summary`, a supported business `operation`, and a non-empty `items[]` inside the selected `product` envelope. These are the only common mandatory Product-envelope fields. The envelope is homogeneous: every item must satisfy that one primary operation; reject mixed primary operations as `mixed_primary_operations` before store access rather than repartitioning them here. Record `user_confirmed_at` after the user's affirmative message and before spawning. Despite its historical name, `user_confirmation_summary` must equal that exact user utterance, such as `上架吧`; never replace it with a Main-Agent narrative such as “用户已确认……”. A prose “confirmation evidence” section does not satisfy either field, and evidence must never be added only after a failed spawn. Require every value in `items[]` to match the preview the user confirmed.
3. Validate the operation-specific item requirements from the selected references.
4. Require every publication target as either an exact confirmed merchant-facing name or an already-known Shopify GID. An inventory location target is optional: creation may use the only active store location, and an existing item may use its only active stocked location. Multiple candidates require confirmation before any affected write. Apply a top-level target to all items only when the verbatim confirmation says it is batch-wide. Within the shared executor, route every Collection outcome, including membership, to `shopify-collection-management`. Wait for Product results only when the shared Brief declares that the Collection item consumes named Product results; independent outcomes have no fixed cross-domain order.
5. Require the verified backup contract before a destructive delete.

When the merchant asks for a Product to be immediately published, live, available on the storefront, or otherwise shopper-visible, the Main Agent must make the required status and channel outcomes explicit in one preview before confirmation. Show Product status as `ACTIVE` and show each exact Publication target as a separate line; one affirmative reply may authorize both only because that immediately preceding preview enumerated both. Preserve their separate business meanings and execution routes. If the merchant explicitly asks to keep `DRAFT`, preview the Publication membership separately and warn that the Product will not be shopper-visible until a later confirmed activation; never add `ACTIVE` against that instruction.

Treat `language`, `content_language`, `business_targets`, `verify`, and caller-provided `intent_id` values as optional. `language` controls report prose only and defaults from the conversation. `content_language` is separate business context containing a source content language and, only when requested, target language/market/publish outcomes. It becomes conditionally required when a shopper-visible text write would otherwise have ambiguous language intent. Derive baseline verification from every confirmed desired value and assign a stable report-only item ID when absent. A caller-provided stable `intent_id` becomes required only when top-level `dependencies` references that item. Supplier/provenance, SKU, handle, vendor, product type, tags, SEO, media, inventory, and publication are never common mandatory fields; each becomes required only when the selected operation reference says the requested outcome depends on it.

Never infer source content, translation, or market language from `language` or from the language of the user's message. Before the Main Agent asks for the normal write confirmation, it should use verified current store locale/market configuration when available and place any unresolved language choice in the same merchant-facing preview. Require confirmation of the source content language and any requested target language, market, and publish outcome; use merchant-facing names rather than locale or market GIDs. Do not introduce this gate for SKU, price, inventory, status, publication, media-only, deletion, or other writes that do not change shopper-visible text.

Abort the whole brief before store access when its envelope or confirmation evidence is malformed. Abort only the affected item for missing item data, duplicates, stale state, unresolved business targets, or an item-specific precondition.

## 2. Skill routing

Build one internal route manifest before store access:

- include the primary intent and every confirmed secondary capability across all items;
- select `bundled_script` when a routed script covers the changed surface;
- select `admin_fallback` only when the routed reference says the surface is uncovered;
- read `write-contract.md` and every selected operation reference completely;
- never accept mutation names, field placement, payload shapes, commands, or fallback sequences from the caller.

Do not route only from the envelope's `operation`. For example, create plus inventory and publication requires the create, inventory, and publication references. A Collection outcome is not a product capability; the shared sub-agent handles it under `shopify-collection-management`, ordered after Product only when a declared dependency requires Product results.

## 3. Bundled script execution

- Treat scripts as opaque executables. Use only the Skill, selected reference, and structured output. The selected reference is expected to specify the invocation; do not run `--help` routinely. Use one `--help` call only if invocation syntax genuinely remains unclear after the reference is loaded. Never read, list, grep, import, or inspect script or library source during a store operation.
- If the documented interface plus `--help` is insufficient, abort with `script_contract_incomplete`.
- Run a selected write script without `--apply` first. Inspect its normalized plan and errors. If the dry-run explicitly reports `willChange: false`, `changed: false`, or an equivalent empty diff while the observed state already equals the confirmed outcome, record `already_satisfied` from that read evidence and do not invoke `--apply`; an apply call is not a verification mechanism. Otherwise rerun the same script with the same input plus `--apply` only after every gate passes.
- Let scripts own their embedded GraphQL, duplicate lookup, media staging, pagination, media baselines/polling, and declared verification reads. Do not rediscover, revalidate, reconstruct, or repeat those operations.
- Parse the script's JSON as the capability contract. Only `{ "ok": true }` is eligible for `success`; preserve `verification.warnings` as non-fatal evidence. A nonzero exit or `{ "ok": false }` is terminal for the affected item. When its structured details contain a created `productId` or completed steps, report `partial`; otherwise report `failed` unless the error explicitly proves another partial state.
- Never issue a duplicate read to override, repair, or reclassify `{ "ok": false }`. Use any `details.observedProduct`, `details.mismatches`, `completedSteps`, and Product GID already returned by the owning script. Stop later publication, Collection membership, and other dependent capabilities for the affected item while continuing independent items.
- Before an initial inventory quantity on a new product, run `resolve_inventory_location.mjs`. Before an existing product's absolute inventory write, run `get_inventory_levels.mjs`, identify one active stocked level, and pass its observed `available` value as `compareQuantity` to `set_inventory.mjs`. Multiple candidates return `inventory_location_required`; perform no affected item write.

## 4. Admin fallback

Apply this gate separately to every distinct dynamically authored Admin operation, including reads:

1. Explicitly load `shopify-admin`.
2. Run one targeted `search_docs` for the current operation.
3. Compose the smallest query or mutation required by the business outcome.
4. Pass the exact composed document through `validate`.
5. Only after validation succeeds, use `shopify-use-shopify-cli` to execute it.

Reuse one validated document across items. A target-resolution read, mutation, and verification read are separate operation documents unless one validated document intentionally covers them. Never execute first and search after failure. Search again only after a named schema or runtime mismatch; then allow one targeted correction, one validation, and one retry. Limit each item to three write attempts total and never replay a successful mutation because a later step failed.

Resolve Publication targets through `set_product_publication.mjs`, which owns exact-name resolution and returns `publication_not_found` or `publication_ambiguous` without falling back to a generic Admin operation. Resolve other non-script Product target names through this fallback gate with one trimmed, case-sensitive exact match; zero or multiple matches abort the affected capability as `business_target_unresolved`. Resolve initial-create locations and existing inventory levels through their routed bundled scripts. A caller-provided GID remains subject to applicable pre-read or verification rules.

## 5. Result verification

- Derive the checklist from the brief's `verify` block and every confirmed business outcome.
- Verify with a script-owned result/read when the script declares ownership; otherwise use a separately validated Admin read.
- Treat `shopify_html_normalized` as a successful formatting-only warning only when the script returns `{ "ok": true, "verification": { "passed": true } }`; never infer equivalence in Agent prose after a script failure.
- Never replay or broaden a write to obtain evidence.
- Give every item `success`, `partial`, `failed`, or `aborted`; every success claim needs response or readback evidence.
- Record timestamps from the runtime when available. Never estimate them; use `null` when the host exposes no reliable clock.
- Count actual visible tool calls. `schema_calls_made` counts only direct Admin-fallback calls and excludes GraphQL hidden inside opaque scripts. Record script invocations separately.

## Runtime failure handling

- Never probe connector files, credential stores, keychains, environment tokens, or alternative stores.
- Treat `No stored app authentication found for <store>` as terminal. Abort the brief with `store_auth_missing` and return the bounded Main-Agent repair request.
- Treat other authorization or missing-scope errors as terminal for this run. Preserve the exact Shopify error and return `authorization_failed`.
- For connection timeouts, DNS/TLS errors, or `Unknown error connecting to your store`, retry once with a minimal validated read and run one unauthenticated reachability probe to the same store domain. If unreachable, abort as `SHOPIFY_STORE_DOMAIN_UNREACHABLE`.

## Structured report

```json
{
  "operation": "...",
  "store_handle": "...",
  "started_at": "actual timestamp or null",
  "finished_at": "actual timestamp or null",
  "route_manifest": [{ "capability": "...", "mode": "bundled_script | admin_fallback", "reference": "..." }],
  "items": [{
    "intent_id": "...",
    "status": "success | partial | failed | aborted",
    "target_product_id": "...",
    "verify_checks": [{ "criterion": "...", "pass": true, "evidence": "..." }],
    "evidence_snippets": {},
    "error": "...",
    "partial_media": [],
    "media_removed_evidence": []
  }],
  "summary": { "total": 0, "success": 0, "partial": 0, "failed": 0, "aborted": 0 },
  "execution_counts": {
    "script_invocations": { "dry_run": 0, "apply": 0, "read": 0, "help": 0 },
    "schema_calls_made": { "shopify_admin_load": 0, "search_docs": 0, "validate": 0, "direct_store_execute": 0 }
  },
  "lessons_learned": { "runtime_errors_encountered": [], "api_version_in_use": null },
  "next_steps_for_main_agent": "..."
}
```

Keep Shopify errors verbatim in evidence and localize only explanatory prose. Put only minimum remaining work in `next_steps_for_main_agent` and actual runtime-error facts in `lessons_learned`.
