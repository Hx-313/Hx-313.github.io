# Product Collection Membership

> Domain ownership moved to `shopify-collection-management`. Do not select this reference from `shopify-product-management`; all Collection membership writes now execute through the shared `shopify-product-editor` after it switches to the Collection Skill. The product-local legacy scripts remain only for backward compatibility with existing tests and callers; new execution uses the canonical scripts inside `shopify-collection-management`.

The canonical Collection Skill owns `scripts/resolve_collection.mjs`, `scripts/add_to_collection.mjs`, and `scripts/remove_from_collection.mjs`. Do not invoke the copies under this Product Skill for new work.

## Resolve the collection

Use exactly one target:

```json
{ "id": "gid://shopify/Collection/123" }
```

```json
{ "name": "Summer" }
```

Name resolution requires one trimmed, case-sensitive exact title match. Zero matches return `collection_not_found`; multiple matches return `collection_ambiguous` with candidates. Never infer a collection from tags, handles, prior products, or the first search result.

## Add products

Minimum input is the resolved collection GID and one to 250 product GIDs:

```json
{
  "collectionId": "gid://shopify/Collection/123",
  "productIds": ["gid://shopify/Product/456"]
}
```

Run dry-run first and add `--apply` only after the write gate passes. The script reads current membership, skips products already present, rejects missing products before mutation, adds only missing memberships, and verifies every requested product.

When declared Collection membership depends on Product creation in the shared executor, the downstream Collection item receives only verified successful GIDs from its named upstream Product items and the separately confirmed membership outcome. A later membership failure is partial and never rolls back the created Product. Independent Product and Collection outcomes have no fixed cross-domain order.
