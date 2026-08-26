---
name: shopify-product-collection-write-brief
description: Canonical producer/consumer contract for every Product or Collection write delegated to shopify-product-editor. The Main Agent MUST load this Skill completely before preparing the first merchant-facing Product/Collection write preview, requesting confirmation, or spawning the editor. Defines the nested brief shape, homogeneous operation grouping, verbatim confirmation evidence, immediate ACTIVE plus Publication previews, and dependency-aware cross-domain sequencing.
---

# Shopify Product/Collection Write Brief

This Skill is the single producer/consumer contract for every new `shopify-product-editor` spawn. Its envelope contains confirmed business intent; it is not a Shopify API payload and does not represent Shopify's distinct `Catalog`, `PriceList`, `MarketCatalog`, or `CompanyLocationCatalog` resources.

## Who loads this Skill

- The **Main Agent MUST load this Skill completely before it prepares the first merchant-facing Product/Collection write preview or asks for confirmation**. It uses this contract to present the preview, capture valid confirmation evidence, and construct the canonical nested brief before the first spawn.
- `shopify-product-editor` loads this Skill completely before preflight and rejects a producer brief that violates it.
- `shopify-product-management` and `shopify-collection-management` load this Skill before their domain-specific write contracts.
- A purely read-only Product or Collection request that will not lead to a write does not need this Skill.

Do not wait for a rejected sub-agent call to discover missing confirmation evidence. The Main Agent owns producing a valid first brief; the editor owns consuming and validating it.

## Canonical shape

```json
{
  "store_handle": "<store>.myshopify.com",
  "resource_scope": "product | collection | product-and-collection",
  "language": "<optional report language>",
  "product": {
    "operation": "create | update | delete | publish-toggle",
    "user_confirmed_at": "<ISO8601>",
    "user_confirmation_summary": "<exact user utterance>",
    "content_language": { "source": "<conditionally required merchant-facing language name>" },
    "items": [],
    "business_targets": {
      "inventory_location": { "name": "<exact merchant-facing name>" },
      "publications": [{ "name": "<exact sales-channel name>" }]
    }
  },
  "collection": {
    "operation": "create | update | delete | publish-toggle | add-products | remove-products",
    "user_confirmed_at": "<ISO8601>",
    "user_confirmation_summary": "<exact user utterance>",
    "content_language": { "source": "<conditionally required merchant-facing language name>" },
    "items": []
  },
  "dependencies": [
    {
      "upstream": { "domain": "product", "intent_ids": ["product-1"] },
      "downstream": { "domain": "collection", "intent_id": "collection-1" },
      "requires": "verified_successful_product_gids"
    }
  ],
  "verify": { "optional_additional_checks": [] }
}
```

`store_handle` and `resource_scope` are always required. Include exactly the domain envelopes selected by `resource_scope` and omit the others. `language` and `verify` are optional shared metadata. Product `business_targets` and each domain's `content_language` are conditional, not common mandatory fields.

`dependencies` is conditionally required only when a downstream Collection item consumes Product results produced by the same brief. In that case, give every referenced item a unique stable `intent_id` and declare the exact Product-to-Collection edge shown above. The only supported dependency meaning is `verified_successful_product_gids`: the downstream item receives GIDs only from the named Product items that finish successfully. Omit `dependencies` for independent Product and Collection outcomes; co-presence in one brief never creates an implicit ordering edge.

## Homogeneous operation groups

Each selected Product or Collection envelope represents exactly one primary lifecycle `operation`. Every item in that envelope must satisfy the requirements of that one operation. Do not add item-level `operation` fields or place heterogeneous primary operations in one envelope.

When one confirmed request contains different primary operations in the same domain, the Main Agent partitions it into homogeneous operation groups and invokes the same `shopify-product-editor` once per group, sequentially. Each invocation is a complete canonical brief with only that group's items. One affirmative reply may be reused across those briefs only when the immediately preceding preview explicitly enumerated every operation group, affected entity, and group count; each brief carries the same verbatim reply and recorded confirmation time. Do not ask for another confirmation between groups unless the business outcome, affected entities, or blast radius changed.

Secondary capabilities do not create another primary-operation group. For example, Product create plus inventory, `ACTIVE` status, media, and Publication outcomes remains one Product `create` envelope; a Collection update that also changes confirmed publication or manual membership remains one Collection `update` envelope. A dependent Product-create plus Collection-membership workflow remains one `product-and-collection` brief and declares its dependency so verified successful Product GIDs can flow into the Collection item.

Destructive deletes are never grouped with another primary operation and still require one item-specific confirmation per deleted entity. The editor rejects a heterogeneous envelope as `mixed_primary_operations` before store access; it does not repartition an invalid producer brief itself.

## Main-Agent preview and first-spawn preflight

Before asking for confirmation or making the first spawn:

1. Require a verified full `*.myshopify.com` `store_handle` and one allowed `resource_scope`.
2. Build the merchant-facing preview from verified current values, exact proposed outcomes, affected entities, and blast radius. Every item and business target later placed in the brief must match this immediately preceding preview.
3. For every selected envelope, require one supported `operation`, a non-empty `items[]`, and operation-homogeneous items. Partition heterogeneous same-domain operations into separate sequential briefs before the first spawn.
4. Wait for an explicit affirmative reply to that preview. Record `user_confirmed_at` after the reply and before spawning. Copy the reply verbatim into `user_confirmation_summary`, for example `上架吧`. Never replace it with Agent-authored prose or add it only after a rejected spawn.
5. One reply may populate both envelopes only when the immediately preceding preview explicitly covered both Product and Collection outcomes. Product consent never implies Collection consent.
6. For combined work, declare a dependency only when a Collection outcome consumes Product results produced by this brief. Require stable referenced `intent_id` values for that edge. Do not invent a dependency or fixed cross-domain order for independent outcomes.
7. Apply each selected domain Skill's operation-specific requirements. A Product delete backup never satisfies a Collection delete backup.
8. Require `content_language.source` only when shopper-visible text would otherwise have ambiguous source-language intent. Conversation/report language is never evidence of storefront language.

For an immediate Product launch or any request whose stated outcome is shopper-visible storefront availability, normalize the preview before confirmation into two separately displayed Product outcomes:

- Product `status: ACTIVE`;
- publication to every exact merchant-facing Publication target.

Carry both confirmed values in the Product envelope. A single affirmative reply may authorize both because the preview enumerated both; the executor must still route status and Publication membership separately. If the merchant explicitly requests `DRAFT`, preserve it and state that Publication membership alone does not make the Product shopper-visible.

Missing shared preflight data aborts the whole brief before store access. Missing or stale domain-item data aborts only the affected item as its domain contract specifies.

## Execution and compatibility

Product-only, Collection-only, and combined producers all emit the canonical nested shape. Validate every declared dependency before store access. Product-first is mandatory only for a Collection item that consumes Product results from the same brief: wait for its named upstream Product items to reach terminal status and pass only their verified successful GIDs. Product and Collection items without such an edge have no global cross-domain order; the editor may schedule ready work in any deterministic safe order while preserving per-item evidence. A downstream failure is `partial`, never rolls back an upstream success, and never causes a successful independent item to be replayed.

The executor may accept the historical flat Product-only brief as an input compatibility adapter. It normalizes that shape to `resource_scope: product` before validation. No prompt, orchestrator, Skill, eval, or new caller may emit the historical flat form.
