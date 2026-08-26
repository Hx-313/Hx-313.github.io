# Delete Collection

Collection deletion is destructive even though it does not delete the products inside the Collection. It can remove a shopper-visible landing page, rule set, product grouping, publication, and links that depend on the Collection.

## Backup gate

Before requesting item-specific delete confirmation, read a complete snapshot containing:

- Collection GID, title, handle, description, description HTML, image, sort order, timestamps, and type;
- the complete smart rule set or the fact that the Collection is manual;
- every publication/channel state;
- every current product membership, paginated to completion, with Product GID, title, and handle;
- Collection Metafields when readable with the active scopes.

Save valid, immutable, non-empty JSON at:

```text
shopify-backups/<store_handle>/<YYYY-MM-DD>/collection-<id>-<handle>.json
```

Validate that the file exists, parses as JSON, contains the exact target Collection GID, and contains the full membership count. Report the path and explain that it supports reconstructing the Collection, rules, publication, and membership; it does not automatically restore inbound theme or navigation references.

Only after that report may the main Agent obtain the exact Collection-specific delete confirmation and spawn the shared `shopify-product-editor` with `resource_scope: collection` and the verified path.

## Execution and verification

- Re-read the target immediately before deletion and abort on stale state.
- Delete exactly one confirmed Collection.
- Treat user errors or a missing deleted identifier as failure.
- Verify that the original Collection GID no longer resolves.
- Keep the backup even when deletion or verification fails.

This final non-resolution read belongs to the shared editor. Return its evidence to the Main Agent; do not ask the Main Agent to repeat the read. A separately requested independent audit is a different workflow.
