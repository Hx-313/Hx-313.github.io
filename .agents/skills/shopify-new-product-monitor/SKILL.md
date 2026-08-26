---
name: shopify-new-product-monitor
description: Detect Shopify products that become publicly eligible for social promotion for the first time, with baseline initialization, permanent Product GID deduplication, and deterministic reason codes. Use during a scheduled Shopify social patrol or when the user asks which products are newly published, newly launched, or ready for a social campaign. This skill is read-only and never creates content or publishes anything.
---

# Shopify New Product Monitor

Identify the fact that feeds `shopify-social-campaign`. Do not infer “newness” from copy, `updatedAt` alone, or a model judgment.

## Required dependencies

- Run `aw-shopify-oauth` first; the current Accio Work Connector is the only authority for the active shop.
- Use `shopify-admin` to search and validate the Admin GraphQL operation.
- Use `shopify-use-shopify-cli` to execute it through the connected shop.
- Use the patrol scripts copied from `dtc-monitoring-and-daily-report/templates/scripts/` for memory and trigger evaluation.

Never obtain a store domain from conversational MEMORY, CLI caches, previous runs, or filesystem guessing.

## First-action gate

The first action after this Skill loads is reading `aw-shopify-oauth`. Before `aw-shopify-oauth` returns one connected account in this turn, do not call another Skill, `bash`, `list`, or Shopify CLI. In particular, do not load `dtc-monitoring-and-daily-report`, inspect a prior workspace, or test a domain from MEMORY. If any pre-gate store call has already occurred, stop with `active_shop_gate_bypassed`; its result cannot be repaired by reading the Connector afterward.

## Mandatory evidence-backed execution

Follow this order. Missing evidence is an unknown result, never permission to improvise.

1. Run `aw-shopify-oauth` first. Accept exactly one canonical `*.myshopify.com` domain only when the current Accio Work Connector returns it in this turn, or when the user explicitly named it in this conversation. If the current active shop handle is not explicitly available from either source, stop with `active_shop_unverified` before any `shopify store execute` call.
2. Bind every Shopify read and the patrol state to that one domain. Do not enumerate or probe multiple stored Shopify CLI shops. Do not select a shop based on product count, public URLs, successful CLI auth, or any other store data. Verify the bound domain once with `shop { myshopifyDomain }`; stop with `active_shop_mismatch` if it differs.
3. Resolve a writable task workspace. Copy `patrol_store.py` and `evaluate_growth_triggers.py` directly from the installed plugin template into `project/scripts/`; the template path is not permission to load the parent monitoring Skill before the Connector gate. If the workspace or scripts are unavailable, stop with `patrol_workspace_unavailable`.
4. Only `patrol_store.py` may mutate patrol state. Never use the `write` tool to create patrol state, snapshots, baselines, or persistence receipts. Initialize a missing store with the verified domain. Run `patrol_store.py snapshot` before any product query, using `python3 project/scripts/patrol_store.py --root project/.shopify-social-patrol snapshot`, and retain its JSON receipt. If an existing snapshot has a different `state.shop_domain`, stop with `patrol_shop_mismatch`.
5. Validate the Admin GraphQL operation with `shopify-admin`, paginate every required page, and select `media(first: 1) { nodes { id } }`. Do not query the `mediaCount` field; it is not available on `MediaConnection` for the supported Admin API. Record page count, `pageInfo`, and every Product GID read.
6. Record an anonymous HTTP result for every non-null `onlineStoreUrl`, not a sample. A timeout, password page, empty response, 404, or ambiguous response must stop with `public_check_incomplete`; return `matched=null`, do not run the evaluator or `patrol commit`, and do not advance the cursor. Do not report a public eligible count from a partial URL sample.
7. After all product pages and URLs are complete, write normalized transient input outside the patrol state root. Run `evaluate_growth_triggers.py` with `python3 project/scripts/evaluate_growth_triggers.py --input INPUT.json --store-root project/.shopify-social-patrol`. Consume its `evaluation_status`, `matched`, `reason_code`, `source_ids`, and `proposed_state_changes`; never reproduce the decision in prose.
8. Build the patrol commit input only from the evaluator output. Persist it with `python3 project/scripts/patrol_store.py --root project/.shopify-social-patrol patrol commit --input COMMIT.json` only after every required query and public check succeeds. Require both a successful `patrol commit` receipt and a post-commit `patrol_store.py snapshot` receipt from `python3 project/scripts/patrol_store.py --root project/.shopify-social-patrol snapshot`; its `state.shop_domain`, `last_product_scan_at`, and `known_eligible_product_ids` must match the proposal. Never claim that a baseline or Product GID was persisted without both receipts.

## Workflow

1. Capture one UTC `scan_started_at` before querying.
2. Use the mandatory pre-query patrol snapshot. If `last_product_scan_at` is null, paginate all products once. Otherwise run both time-window queries from the saved cursor through `scan_started_at`:
   - `published_at:>=... AND published_at:<=...`, sorted by `PUBLISHED_AT`;
   - `updated_at:>=... AND updated_at:<=...`, sorted by `UPDATED_AT`.
3. Merge pages by Product GID. For each candidate, retain only `id`, `status`, `publishedAt`, `updatedAt`, `onlineStoreUrl`, and `media.nodes`; derive `media_count` from `media.nodes` (`1` when non-empty, otherwise `0`).
4. Use the recorded anonymous request to set `publicly_accessible=true` only for a non-password, non-404 product page. Never invent `/products/{handle}` when `onlineStoreUrl` is null.
5. Pass the normalized product input to `evaluate_growth_triggers.py`. Consume its structured result; do not treat process exit code as the business decision.
6. On first run, commit the eligible Product GIDs as a baseline and emit no new-product event. On later runs, pass `source_ids` only to `shopify-social-campaign` for optional Campaign recommendations. Never pass a raw new-product event directly to the social publishing track.
7. Commit `last_product_scan_at` and `add_known_product_ids` only after every derived Campaign recommendation or social action candidate is durable. If any required product query, recommendation write, or candidate write fails, do not advance the cursor.

## Eligibility gate

A product is eligible only when all are true:

- `status == ACTIVE`;
- `publishedAt` is non-null and not later than `scan_started_at`;
- `onlineStoreUrl` is non-null;
- at least one media item exists;
- the public page is anonymously accessible;
- Product GID is absent from `known_eligible_product_ids`.

Once a Product GID is committed, unpublishing and republishing it never creates another automatic new-product event. A product published without media may trigger later when an update first makes the complete gate true.

## Output contract

Return the verified shop domain, baseline status, public eligible count, `evaluation_status`, `matched`, `reason_code`, new Product GIDs, dedupe result, read scope, and whether any Shopify write occurred. Derive baseline status and dedupe only from the pre-query and post-commit snapshots. Do not generate captions or social action payloads in this skill. `matched=null` means the feature is unknown and must not trigger downstream work.
