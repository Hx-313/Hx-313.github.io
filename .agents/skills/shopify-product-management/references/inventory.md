# Product Inventory

Use `scripts/get_inventory_levels.mjs` to read one product's variants, inventory-item IDs, tracking state, stocked locations, and current `available` quantities. Use `scripts/set_inventory.mjs` only for a confirmed absolute `available` quantity.

## Read inventory

Resolve a title, handle, numeric ID, or SKU to exactly one Product GID through the product search route first. Then use:

```json
{ "productId": "gid://shopify/Product/123" }
```

The read script follows variant and inventory-level pagination. It returns every variant's `inventoryItemId`, `tracked` state, and stocked locations. This read is also the mandatory source for `compareQuantity`.

## Set an absolute quantity

Minimum business data is one uniquely identified variant or inventory item and a non-negative integer target quantity. A location target remains optional until the inventory read shows more than one active stocked location for that item.

- If an exact location GID or name was confirmed, match it to one active stocked level.
- With no target, accept only one active stocked level.
- With multiple active stocked levels, stop with `inventory_location_required` and return their IDs, names, and quantities.
- With no active stocked level, stop with `inventory_location_unavailable`.
- Never choose the first, primary, or previously used location.

Use the identifiers and observed quantity from the same inventory read:

```json
{
  "inventoryItemId": "gid://shopify/InventoryItem/123",
  "locationId": "gid://shopify/Location/456",
  "quantity": 20,
  "compareQuantity": 12,
  "reason": "correction"
}
```

`reason` defaults to `correction`. An optional `referenceDocumentUri` may preserve an existing merchant audit reference; never invent one from supplier or provenance data.

Run `set_inventory.mjs` dry-run first, then the identical business input once with `--apply`. The script re-reads the selected level, aborts as `stale_inventory` if `compareQuantity` changed, performs a compare-and-set write, and verifies the final `available` quantity. Never retry a stale or successful write blindly.

## Creation and relative adjustments

For an initial quantity on a product that does not exist yet, run `resolve_inventory_location.mjs` before creation. With no confirmed target, accept only `single_active_location`; multiple active store locations return `inventory_location_required`. Pass the resolved GID into the create script's documented `inventoryQuantities`.

Relative adjustments are intentionally not converted into absolute values. The route manifest must select the advanced-catalog Admin fallback for a confirmed delta.
