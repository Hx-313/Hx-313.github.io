# Delete Product

Use a targeted Shopify Admin delete operation only after every delete precondition passes.

Minimum item data is `target_product_id`, `backup_path`, and `deletion_reason`, in addition to the shared confirmation fields. Before any store mutation, require the backup file to:

- exist and have nonzero size;
- parse as JSON;
- declare `operation: "productDelete"`;
- identify the same `store_handle` and `target_product_id`.

Abort the item with `backup_precondition_failed` when any check fails. Never create, edit, replace, or repair the backup in the executor.

After the gate passes:

1. Read the product once.
2. If it is already absent, return success with `already_deleted: true`.
3. Discover and validate the current product-delete operation under the shared write contract, then execute it once.
4. Read once more and require the product result to be null.
5. Report `deleted_at`, `backup_path`, and `deletion_reason`.

The final non-resolution read belongs to the shared editor. Return its evidence to the Main Agent; do not ask the Main Agent to repeat the read. A separately requested independent audit is a different workflow.
