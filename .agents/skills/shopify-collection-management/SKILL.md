---
name: shopify-collection-management
description: "Manage Shopify Collections as first-class catalog resources. MUST be used for collection search/detail reads and for any collection write: create, update, delete, publish/unpublish, core SEO, manual or smart rules, title/description/image/sort changes, and adding or removing product membership—even when membership follows product creation. Product, variant, inventory, and product-media fields remain owned by shopify-product-management."
compatibility: Requires a connected Shopify store and the official Shopify CLI execution path
---

# Shopify Collection Management

Treat a Collection as its own Shopify resource, not as a secondary product field. This Skill owns Collection intent routing, baseline reads, write safety, execution selection, and verification. All Collection writes execute through the shared `shopify-product-editor`, which loads this Skill separately from `shopify-product-management`; the main Agent may perform simple read-only discovery after loading this Skill.

## Ownership boundary

This Skill owns:

- searching and reading Collections;
- creating manual or smart Collections;
- changing Collection title, description, core SEO, image, sort order, rules, or publication;
- adding products to or removing products from a manual Collection;
- deleting a Collection after a verified local backup.

It does not own:

- product, variant, inventory, or product-media fields (`shopify-product-management`);
- Collection-page Liquid, layout, or theme assets (`shopify-theme-decorator`);
- Collection Metafield or Metaobject definitions and values (`shopify-custom-data` first, then Main Agent Route C);
- navigation menus that happen to link to a Collection.

Product creation and Collection membership remain separate domain writes even when one shared sub-agent performs both. When a Collection membership item declares that it consumes Product results from the same brief, wait for only its named upstream Product items and pass only their successful Product IDs. Independent combined outcomes have no fixed Product-first order. A dependent membership failure leaves successful Products intact and is reported as partial completion.

## Read before acting

For every write, load the shared [`shopify-product-collection-write-brief`](../shopify-product-collection-write-brief/SKILL.md) Skill, [references/write-contract.md](references/write-contract.md), and [references/tool-routing.md](references/tool-routing.md) completely before store access. For deletion, also read [references/delete-collection.md](references/delete-collection.md).

For read-only requests, use the smallest Collection read that answers the question. A request for one known Collection uses its exact GID or an exact merchant-facing title; a browse/search request may return candidates but never silently selects one.

## Script contract

Resolve scripts relative to this `SKILL.md` and invoke them with the host's available JavaScript runner. Do not hard-code a runner or assume installation preserved executable file mode. Each script accepts `--store <store>.myshopify.com` plus exactly one of `--input <json-file>` or `--json <object>`; mutation scripts are dry-run unless `--apply` is present.

Treat bundled scripts as opaque executables during store operations. This Skill and [references/tool-routing.md](references/tool-routing.md) define their interface. If invocation syntax remains unclear, run that entry script with `--help` once. Never inspect `scripts/`, embedded GraphQL, imports, or tests during a store operation. The scripts own their validation, exact-title resolution, idempotence checks, minimum mutation, asynchronous Collection Job handling for rules and membership, and declared verification read. Do not rediscover or replay those steps. Source inspection is allowed only for explicit plugin development or script repair.

## Intent routing

| Business intent | Required handling |
|---|---|
| Search or browse Collections | Read-only search; expose pagination and ambiguity |
| Get one Collection | Resolve exact target and return core fields, SEO, rules, publication, and requested membership detail |
| Create a manual Collection | Require confirmed title, manual kind, optional initial products, and explicit publication outcome |
| Create a smart Collection | Require confirmed title, smart kind, match mode, every merchant-facing condition, and explicit publication outcome |
| Update Collection content | Pre-read the target, preview a field-level diff, preserve unspecified values |
| Change smart rules | Pre-read rules and affected membership count; show rule diff and membership blast radius |
| Add/remove membership | Require a manual Collection and exact product targets; smart membership changes occur through rules |
| Publish/unpublish | Require exact publication target and explicit visibility outcome |
| Delete | Create and validate the local backup first; delete one Collection per confirmation |

Do not convert a manual Collection to smart, or smart to manual, by deleting and recreating it. If the active Shopify API cannot make the requested transition in place, return `collection_type_transition_unsupported` and preserve the original Collection.

## Workflow

1. **Connection gate** — the main Agent verifies the exact `*.myshopify.com` store and required scopes through `aw-shopify-oauth` before the first write spawn.
2. **Business gate** — validate the confirmed brief, target identity, source content language when shopper-visible text changes, publication outcome, and destructive backup when applicable.
3. **Baseline read** — read the current Collection and every surface that may change. Record rules, publication, and relevant membership before computing the diff.
4. **Route selection** — derive the full route from every confirmed changed surface, not only the primary `operation`. Use bundled Collection scripts for every covered surface, including publication; use the validated Admin fallback only for deletion or another explicitly uncovered surface.
5. **Minimum write** — change only confirmed fields or memberships. Never replace unspecified content, rules, publications, or products.
6. **Verification read** — re-read by returned or confirmed GID and compare every requested outcome. When a dry-run already proves the requested state and explicitly reports no change, stop as `already_satisfied` without `--apply`; never repeat a successful mutation merely to obtain evidence.
7. **Structured report** — report per item: requested outcome, baseline, actual change, verification evidence, status, errors, backup path when applicable, and minimum next step.

## Collection invariants

- Resolve names by trimmed, case-sensitive exact title match. Zero matches returns `collection_not_found`; multiple matches returns `collection_ambiguous` with candidates.
- Never infer a Collection from product tags, handles, prior tasks, or the first search result.
- Manual membership operations require exact Product GIDs or uniquely resolved confirmed product identities.
- Smart Collection membership is rule-derived. Do not call manual add/remove operations against a smart Collection.
- Creating a Collection and publishing it are distinct merchant outcomes even when a dedicated tool combines them. Do not accept implicit publication.
- Treat rule updates, batch membership changes, publication changes, and deletes as high-stakes writes because one Collection may affect many shopper-visible products.
- Keep source storefront language independent from the conversation/report language.

## Execution ownership

`shopify-product-editor` is the single shared write executor for Product and Collection outcomes. Domain ownership remains separate inside that sub-agent: Product work follows `shopify-product-management`; Collection work follows this Skill. This boundary does not include Shopify's distinct Catalog/PriceList/Markets resources. The main Agent owns the user-facing preview, confirmation, delete-backup handoff, and cross-domain orchestration.

Simple Collection reads may remain inline with this Skill loaded. If a read is part of a write, the shared editor performs it so baseline and verification evidence stay in one report.

## Result status

- `success` — every confirmed Collection outcome passed a post-write read.
- `partial` — an independent earlier step succeeded but a later Collection capability failed; completed writes are not replayed or rolled back automatically.
- `failed` — no requested write was verified.
- `aborted` — malformed brief, missing confirmation, ambiguous target, missing delete backup, unsupported type transition, authorization failure, or scope violation prevented execution.
