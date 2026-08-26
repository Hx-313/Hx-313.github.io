# Collection Write Contract

Apply this contract before any Collection mutation.

Load the shared [`shopify-product-collection-write-brief`](../../shopify-product-collection-write-brief/SKILL.md) Skill first. This reference defines Collection-specific validation inside its canonical nested `collection` envelope; it does not define another top-level brief shape.

## Required business brief

At the top level, require a verified `store_handle` and a `resource_scope` that selects Collection. Inside the selected `collection` envelope, require:

- `operation`: `create`, `update`, `delete`, `publish-toggle`, `add-products`, or `remove-products`;
- `items[]`: one or more independently reportable Collection outcomes;
- `user_confirmed_at`: ISO8601 timestamp recorded after confirmation and before the first spawn;
- `user_confirmation_summary`: the user's exact affirmative utterance, not an Agent paraphrase.

For example, if the exact reply is `上架吧`, copy `上架吧` verbatim. Never repair missing confirmation evidence only after a rejected first spawn.

The envelope is homogeneous: its `operation` governs every item. Reject mixed primary Collection operations as `mixed_primary_operations` before store access instead of repartitioning them in the executor. Secondary confirmed surfaces inside one item's `desired` object remain part of that primary operation.

Each item contains business data rather than an API payload:

```json
{
  "intent_id": "collection-1",
  "target": { "id": "gid://shopify/Collection/123" },
  "desired": {
    "title": "Summer",
    "kind": "manual",
    "description": "Seasonal essentials",
    "seo": { "title": "Summer", "description": "Shop seasonal essentials" },
    "image_url": "https://cdn.example.com/summer.jpg",
    "sort": "best-selling",
    "rules": {
      "match": "all",
      "conditions": [
        { "field": "Product tag", "relation": "equals", "value": "summer" }
      ]
    },
    "publication": { "channel": "Online Store", "visible": true },
    "products": [{ "id": "gid://shopify/Product/456" }]
  },
  "backup_path": null
}
```

For creation, `target` may be absent and `desired.title` plus `desired.kind` are required. For an existing Collection, require exactly one target: a Collection GID or exact confirmed title. Do not require irrelevant fields.

When this Collection item consumes Products written by the same combined brief, require the top-level `dependencies` edge defined by the shared Brief Skill. Its `downstream.intent_id` identifies this item and its `upstream.intent_ids` identify the Product items whose verified successful GIDs become membership targets. Omit that edge for independent Collection outcomes; envelope co-presence alone never imposes Product-first order.

Treat `operation` as the primary lifecycle intent, then route every additional confirmed surface present in `desired`. For example, an update that also changes publication and manual membership must apply the update, publication, and membership requirements; it must not ignore secondary surfaces merely because `operation` is `update`.

## Preview and confirmation

Before the main Agent spawns the editor:

1. Read and show the verified current Collection values for every changed surface.
2. Show the proposed merchant-facing outcome and the exact Collection target.
3. Show the blast radius: current product count, products explicitly added/removed, estimated rule-driven membership change when available, publication visibility, and whether shopper-visible text changes.
4. For a batch, show and reconfirm the exact Collection count.
5. Record the user's explicit affirmative reply verbatim.

Silence, a bare emoji, `whatever`, `你决定`, a plan approval, or an earlier unrelated confirmation is not write consent.

After confirmation, a Publication dry-run that reports `willChange: false` is an `already_satisfied` terminal result for that target. Record its current-state evidence and do not invoke `--apply` merely to produce an `after` object.

If title, description, or core SEO text changes, carry `content_language.source`. Carry requested target language, market, or publication outcomes only when the user asked for them. Never infer storefront language from the conversation language.

## Per-operation requirements

- `create`: confirmed title, `manual` or `smart` kind, explicit publication outcome; smart Collections also require match mode and every condition.
- `update`: exact target plus a non-empty field/rule diff. Preserve every unspecified value.
- `add-products` / `remove-products`: exact manual Collection and one or more exact product targets.
- `publish-toggle`: exact Collection, exact channel, and explicit visible/not-visible outcome.
- `delete`: exact Collection, validated `backup_path`, and item-specific delete confirmation obtained after the backup was reported.

Do not combine destructive deletes in a batch. Execute one Collection delete at a time with one confirmation each.

## Stale-state handling

The editor must compare the execution-time baseline to the values shown in the confirmed preview. If a targeted value, rule set, publication, or membership changed after confirmation, abort that item as `stale_collection_state`; return the new current value and request a refreshed preview rather than overwriting it.
