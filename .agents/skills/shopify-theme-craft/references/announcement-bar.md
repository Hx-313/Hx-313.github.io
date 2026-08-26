# Announcement Bar — Theme-Variant Cookbook

> When to use: user wants to add / edit the storefront-top "Free shipping over \$35" announcement bar.
>
> The location of the announcement-bar settings **differs by theme**, and getting the wrong file silently no-ops. Always read the relevant config first to confirm.
> Default write path: targeted `themeFiles` read of the candidate config files,
> merge the chosen file, write it back with `themeFilesUpsert`, then re-read the
> exact filename to verify. Full-tree pull/push is exception-only; see
> [dev-preview-craft.md](dev-preview-craft.md).

---

## Theme location matrix

| Theme family | File to edit | How it stores the announcement |
|---|---|---|
| **Dawn / standard themes** | `config/settings_data.json` → `current` keys | Top-level boolean + text + link keys (see below) |
| **Horizon / newer themes** | `sections/header-group.json` | Announcement is a section block inside the header group |

> ⚠️ Common mistake: Do **NOT** add an `announcement-bar` section to `templates/index.json` — `themeFilesUpsert` will reject it.

---

## Pattern A — Dawn / standard themes

Modify `config/settings_data.json` → `current` block:

```json
{
  "header_announcement_bar_enabled": true,
  "header_announcement_bar_text": "Grand Opening — Free shipping over $35!",
  "header_announcement_bar_link": "/collections/all"
}
```

**Workflow** (always read-then-write — settings_data.json is large; never overwrite):

1. Read current `config/settings_data.json` via `themeFiles(filenames: [...])`.
2. Parse JSON, merge the 3 keys above into `current`.
3. Write back with `themeFilesUpsert` (`filename: "config/settings_data.json"`, `body.type = TEXT`), then re-read that filename to verify.

---

## Pattern B — Horizon / newer themes

Modify `sections/header-group.json`. The announcement is an entry inside the section group's blocks array.

**Workflow**:

1. Read `sections/header-group.json`.
2. Locate the `announcement-bar` block (or the equivalent — block `type` may vary by theme version).
3. Update the block's `settings.text` / `settings.link` / `settings.show_announcement` fields.
4. Write back with `themeFilesUpsert` (`filename: "sections/header-group.json"`, `body.type = TEXT`), then re-read that filename to verify.

---

## Detection heuristic

Before editing, fetch both files and check which one already contains announcement-related keys:

```graphql
{
  theme(id: "gid://shopify/OnlineStoreTheme/{THEME_ID}") {
    files(filenames: ["config/settings_data.json", "sections/header-group.json"], first: 2) {
      nodes {
        filename
        body { ... on OnlineStoreThemeFileBodyText { content } }
      }
    }
  }
}
```

- If `settings_data.json` contains `header_announcement_bar_*` keys → Pattern A.
- If `header-group.json` contains a block with `type: "announcement-bar"` (or similar) → Pattern B.
- If both → Pattern B usually wins (the section-group system overrides legacy global settings on Horizon-family themes). Verify on the live storefront.

---

## Verification

After write, fetch the live storefront HTML and look for the rendered text:

```python
import urllib.request
html = urllib.request.urlopen('https://{STORE}.myshopify.com/').read().decode()
assert "Free shipping over $35" in html, "Announcement bar text not rendered"
```

If the bar still shows the old text after a successful theme-file write, see [theme-write-pitfalls.md → "JSON Template DB Caching"](theme-write-pitfalls.md#json-template-db-caching).
