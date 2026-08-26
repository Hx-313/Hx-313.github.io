# Reference 02: Unified Analytics Snippet Pattern

> 🚨 **Analytics snippet writes are narrow fallback writes.** Prefer local theme
> pull/check/push when available. If this automation uses Admin GraphQL, it must
> still go through `shopify-admin` + `shopify-use-shopify-cli`; never use curl
> against `/admin/api/.../themes/{id}/assets.json`.

## The problem this solves

Naive approach: every time you add a tracking tool (Clarity, FB Pixel, TikTok Pixel...), you edit `theme.liquid` directly. Result:
- `theme.liquid` becomes a mess
- Conflicts when themes update
- Hard to disable one tool without editing core theme
- New agents working on the store have no idea what's in the head

## The fix

**Single snippet** at `snippets/analytics-snippet.liquid` that holds all tracking code, controlled by Liquid variables. `theme.liquid` only renders the snippet — never edited again.

## Implementation

### Step 1: Identify the active theme ID

Validate via `shopify-admin` (`scripts/search_docs.mjs themes`), then run:

```bash
shopify store execute --store {DOMAIN} \
  --scopes read_themes \
  --query 'query { themes(first: 10, roles: [MAIN]) { nodes { id name role } } }'
```

Persist the returned `id` (e.g. `gid://shopify/OnlineStoreTheme/12345`) to `project/store-config.json` under `theme_id`.

### Step 2: Upload the snippet

Preferred path: pull/download the dev theme locally, add the snippet file, run
`theme check`, and push the changed snippet/theme.liquid files.

Fallback path: use `themeFilesUpsert` only after reading the current target
files and confirming this is still a narrow analytics-snippet edit, not a
banner/section/template decoration task.

Read the template from `templates/analytics_snippet_template.liquid` into a variable, then validate + execute the mutation. Validate via `shopify-admin` first to confirm the current input shape:

```bash
shopify store execute --store {DOMAIN} --allow-mutations \
  --scopes write_themes \
  --query 'mutation upsertSnippet($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
    themeFilesUpsert(themeId: $themeId, files: $files) {
      upsertedThemeFiles { filename }
      userErrors { field message code }
    }
  }' \
  --variables "{
    \"themeId\": \"$THEME_ID\",
    \"files\": [{
      \"filename\": \"snippets/analytics-snippet.liquid\",
      \"body\": { \"type\": \"TEXT\", \"value\": \"$SNIPPET_CONTENTS\" }
    }]
  }"
```

`shopify-admin` is responsible for confirming the current mutation name + input type — **always re-validate before running**, the schema for theme file mutations changed in 2024 and may change again.

### Step 3: Inject one render line into theme.liquid

Read the current `theme.liquid`, find `{{ content_for_header }}`, insert one line above it:

```liquid
{%- render 'analytics-snippet' -%}
{{ content_for_header }}
```

Then write the modified `theme.liquid` through the same chosen write channel. This is the only edit ever needed in `theme.liquid` for analytics.

> ⚠️ **Theme JSON files do NOT support comments.** Strip all `//` and `/* */` from any JSON file before pushing — Shopify will reject the upload otherwise. (See plugin AGENTS.md "Known pitfalls".)

### Step 4: Configure tools by editing snippet variables

In `analytics-snippet.liquid`, the top defines empty variables:

```liquid
{%- assign clarity_id = '' -%}
{%- assign fb_pixel_id = '' -%}
{%- assign tiktok_pixel_id = '' -%}
```

To activate Clarity: set `clarity_id = 'xxxxxxxxxx'` (10 alphanumeric chars from your Clarity project).

Each tool's actual `<script>` is wrapped in `{%- if xxx_id != '' -%}`, so empty = no script output, no errors.

### Step 5: Update via the same mutation

To enable Clarity later, the agent re-renders the snippet with the populated variable, then writes `snippets/analytics-snippet.liquid` through the same narrow snippet channel. No theme rewrite, no risk to other code.

## Why this matters

- **Token efficiency**: agent edits 1 file (snippet) not theme.liquid (often 500+ lines)
- **Safety**: bugs in the snippet only break tracking, not the storefront render
- **Auditability**: one file = clear list of all tracking
- **Future-proof**: adding a new tool (FB Pixel, TikTok Pixel) = add one `if` block

## Common pitfalls

1. **Theme update overwrites `theme.liquid`**: the `{%- render 'analytics-snippet' -%}` line is removed. Re-add it after every theme update; remind the user when they swap themes.
2. **`bundled` Horizon-style sections**: cannot be referenced from custom `templates/index.json` — write a `custom-liquid` section manually (see plugin AGENTS.md).
3. **`image_picker` fields**: cannot be set via API. Use `asset_url` Liquid workaround.
4. **Schema rot**: re-validate the `themeFilesUpsert` mutation via `shopify-admin` every quarter — Shopify renames theme mutations roughly every 12-18 months.
