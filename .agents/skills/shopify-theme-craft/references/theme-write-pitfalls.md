# Theme-write pitfalls & workarounds

> When to use: read before an ordinary targeted `themeFilesUpsert` write and
> before any rare full-tree `theme pull/push` exception. Each entry is a real failure mode that has cost
> prior runs. Scope = theme-surface writes (the `shopify-theme-decorator`
> sub-agent's territory). Product / CLI-general pitfalls live with
> `shopify-product-editor` and the official `shopify-use-shopify-cli` SKILL.

---

## Default: Surface Discovery First, Then Precise Theme File Writes

Theme decoration is usually a multi-file graph:

- `sections/*.liquid` defines section behavior
- `templates/*.json` decides which section instances render and in what order
- `snippets/*` and `assets/*` are dependencies
- `layout/theme.liquid`, `sections/*-group.json`, and `config/settings_data.json`
  can change whether the surface appears at all

Default workflow:

1. Use targeted `themeFiles` queries to read the files that define the surface:
   owning template / section group, relevant section files, snippets, CSS/assets,
   layout, and config.
2. Build a surface map: section instance ids, `type`, `settings`, and `order`
   before/after.
3. Create an explicit change plan with the complete file set to add / update /
   remove.
4. Write the planned files with `themeFilesUpsert`.
5. Re-read the exact remote filenames/checksums/content and validate the rendered
   admin preview.

The mistake to avoid is not "using `themeFilesUpsert`"; the mistake is **writing
before you understand the surface graph**. Point writes without discovery make
you patch `sections/<x>.liquid` while missing the real page composition in
`templates/*.json`. In Shopify, the page is controlled by section instances in
template JSON, not only by section files.

`theme pull` / `theme push` are full-tree developer workflows, not the default
Agent path. Use them only when targeted `themeFiles` discovery/upsert is
insufficient (broad migration, full local theme-check pass, user-provided local
theme project, or genuinely unknown dependency graph), and explain why.

---

## GitHub Theme Copy Is Not Decoration

**When this triggers:** the user or main Agent names a popular GitHub theme and
asks to "use it", "copy it", "reinstall from it", or "decorate like it".

**Symptom:** the agent treats a repository as a finished merchant theme, pushes
some or all of its files, and later discovers mixed theme structure, demo
sections on PDP/collection/cart, missing build assets, or theme settings that
cannot be written through the API.

**Root cause:** open-source theme repos are source material, not normalized
merchant-ready artifacts. Star count and MIT license say little about:

- whether the repo is a Liquid Online Store 2.0 theme vs Hydrogen/headless vs a
  scaffold
- whether compiled `assets/` exist or need a build
- whether demo templates and placeholder copy remain
- whether section settings rely on Theme Editor-only `image_picker` values
- whether homepage/PDP/collection/cart templates are safe for the merchant's
  actual products

**Fix pattern:**

1. Run `theme-source-intake.md` first. No intake report, no external source use.
2. Default third-party repos to `extract_patterns_only`.
3. Implement the desired look as plugin-controlled, namespaced custom sections
   on a safe base theme.
4. If intake returns `direct_base_allowed`, use a fresh unpublished theme path,
   never an in-place patch of the live theme or a live duplicate.
5. Run `template-sanitizer.md` and multi-page preview checks before publish
   approval. Homepage-only validation is insufficient.

Do not claim a theme is "based on GitHub Dawn/BootShop/etc." unless the report
states which parts were used: direct base, pattern reference, or visual reference.

---

## `image_picker` Cannot Be Set via API

Theme settings of type `image_picker` store internal Shopify references that are **only generatable by the Theme Editor UI**. Both GID and CDN URL values are **silently rejected** (or returned as `Setting '<field_id>' must be a valid shopify url` errors) when written via `themeFilesUpsert` to `config/settings_data.json` or any other settings store. No URL format works — not `shopify://media-production/...`, not CDN HTTPS, not GID. Retrying the same field with a different URL shape wastes a spawn.

**Why the workaround works — the mechanism, not just the steps.** The rejection is performed by Shopify's settings validator, which only runs against fields declared as `type: "image_picker"` in a section's `{% schema %}` block. **A field that does not exist cannot be validated.** So instead of trying to push a value INTO the locked field, you author a NEW section whose schema does NOT contain `image_picker` at all — and reference the image directly in the Liquid body. The validator has no field to lock.

Failing vs working code side-by-side:

```jsonc
// ❌ FAILING — original hero section, image_1 is an image_picker field
// templates/index.json:
{ "sections": { "hero": { "type": "hero",
    "settings": { "image_1": "shopify://media-production/..." }  // platform rejects, every shape
}}}
```

```liquid
{# ✅ WORKING — new custom section, no image_picker in its schema #}
{# sections/<brand>-hero.liquid #}
{% schema %}
{ "name": "<Brand> Hero",
  "settings": [ { "type": "text", "id": "heading", "label": "Heading" } ] }
{% endschema %}
<section class="<brand>-hero">
  {{ '<brand>-hero.png' | asset_url | image_tag: alt: '...' }}
  <h1>{{ section.settings.heading }}</h1>
</section>
```

```jsonc
// ✅ WORKING — templates/index.json re-points to the new section
{ "sections": { "hero": { "type": "<brand>-hero" }}}
```

**Three files in total:**

1. Upload the binary as a theme asset (note `body.type = URL` for binaries):
   ```json
   { "themeId": "gid://shopify/OnlineStoreTheme/{THEME_ID}",
     "files": [{ "filename": "assets/<brand>-hero.png",
       "body": { "type": "URL", "value": "https://cdn-url-of-generated-image.png" } }] }
   ```
2. Author `sections/<brand>-hero.liquid` from scratch — its `{% schema %}` must NOT contain any `image_picker` field. Embed the image with `{{ '<brand>-hero.png' | asset_url }}`.
3. Edit `templates/index.json` to set `"type": "<brand>-hero"` in place of `"type": "hero"`.

Verify via `themeFiles(filenames:["templates/index.json"])` re-read — confirm `"type"` is the new value before claiming deployment success. Asset upload checksum alone proves nothing about whether the banner is visible (see § "asset upload vs section binding").

> Full hero/banner deployment walkthrough (aspect-ratio inference, logo policy, dedupe namespace): see [banner-playbook.md](banner-playbook.md).
> Real-world failure mode: the mechanism above was rediscovered the hard way over several wasted spawns retrying `image_picker` shapes before switching to the new-section pattern. Authoring the custom section from the start avoids the whole loop.

---

## `themeFilesUpsert` Body Types

Use this section for the ordinary targeted write path described in
[dev-preview-craft.md](dev-preview-craft.md) §3.

| File type | `body.type` | Example |
|---|---|---|
| `.json`, `.liquid` (text) | `TEXT` | `{ "type": "TEXT", "value": "{ ... }" }` |
| `.webp`, `.png`, `.jpg` (binary) | `URL` | `{ "type": "URL", "value": "https://..." }` |

Mismatching the body type is the #1 cause of `userErrors: invalid body` responses.

---

## Section File Diff Is Not Section Instance Diff

**When this triggers:** user reports an extra/default/duplicate banner, hero, or
section; or a deploy adds a custom section to a page that already had a native
section.

**Symptom:** the custom section file was deployed successfully and may render, but
the page still shows the old/default section as well. The storefront looks like:

```text
default Horizon hero
+ custom brand hero
= two banners
```

**Root cause:** the agent changed `sections/<brand>-hero.liquid` but did not
change the owning template instance in `templates/index.json`:

```jsonc
{
  "sections": {
    "hero_jVaWmY": { "type": "hero" },
    "brand_hero_main": { "type": "brand-hero" }
  },
  "order": ["hero_jVaWmY", "brand_hero_main"]
}
```

**Fix pattern:**

1. Read the owning template JSON before more Liquid edits.
2. Decide whether the task is "replace existing hero" or "add a second banner".
3. Remove or replace the unintended default section instance.
4. Update `order` so it contains exactly the intended banner/hero IDs.
5. Deploy the template JSON together with the section file/CSS/assets through
   the selected write channel.
6. Validate rendered DOM count and template order before claiming success.

Required report shape:

```json
{
  "template": "templates/index.json",
  "section_file": "sections/brand-hero.liquid",
  "before_order": ["hero_jVaWmY", "brand_hero_main"],
  "after_order": ["brand_hero_main"],
  "removed_section_ids": ["hero_jVaWmY"],
  "added_section_ids": [],
  "expected_banner_count": 1,
  "rendered_banner_count": 1
}
```

A successful checksum on `sections/<brand>-hero.liquid` proves only the file
changed. It does not prove the page composition is correct.

---

## JSON Template DB Caching

Shopify stores a database copy of JSON templates (`templates/index.json`, `sections/header-group.json`, etc.) **separately from the theme files**. Once a theme is initially deployed, the storefront often renders from the DB copy, not from the file.

Symptoms:
- `themeFilesUpsert` returns success
- Re-reading the file shows the new content
- The live storefront still renders the old content

Causes / workarounds:
- **Only the Theme Editor UI reliably updates the DB layer**. There is no public API to flush the DB copy.
- **For new sections**: create a new `.liquid` section file (these always take effect immediately) instead of mutating an existing JSON template's section list.
- **For section settings**: if the storefront refuses to update, the merchant must open Theme Editor and click Save once to sync — there is no API workaround.

---

## Bundled Theme Files Cannot Be Overridden

Some themes (notably Horizon) ship with **bundled / locked** section files such as `sections/hero.liquid`. `theme push` and `themeFilesUpsert` may **silently no-op** when targeting these files.

**Workaround**: never edit a bundled section. Create a new custom section with a unique filename (e.g. `sections/custom-hero.liquid`), and reference the new type in `templates/index.json`.

---

## Section HTML ID Pattern

Section keys in `templates/index.json` do **NOT** directly map to HTML IDs. Shopify generates:

```
shopify-section-template--{TEMPLATE_DB_ID}__{SECTION_KEY}
```

When verifying section presence in storefront HTML, **match by suffix**, not exact string:

```python
sections = re.findall(r'id="(shopify-section[^"]*)"', html)
assert any(s.endswith('__custom_banner') for s in sections)
```

---

## Announcement Bar Location Varies by Theme

- **Dawn / standard themes**: `config/settings_data.json` → `header_announcement_bar_*` keys
- **Horizon / newer themes**: `sections/header-group.json` → announcement section block

Always read the theme's header configuration before writing. Full detection + write workflow: see [announcement-bar.md](announcement-bar.md).

---

## Dawn `.page-width` Habits Do Not Automatically Transfer to Horizon

**When this triggers:** any custom hero / banner / image-with-text section is authored from scratch, especially after bypassing `image_picker` with the custom-section + `asset_url` pattern.

**Symptom:** the banner image renders, but heading/subheading/CTA are flush with the viewport edge (usually left edge on desktop, both edges on mobile). There is no horizontal overflow and no Liquid error, so a naive HTML grep / screenshot quick glance may miss it.

**Root cause:** the section code assumes a Dawn-style global container class such as `.page-width` exists or applies to the custom section. Horizon and newer themes do not guarantee that class. Even when a similar selector exists, it may be scoped to bundled sections and not affect your new custom section.

**Fix pattern:**

- Before using any theme-global container class, read real theme files (`assets/base.css`, `assets/theme.css` / `global.css` / `critical.css` if present, `layout/theme.liquid`, and relevant section CSS) and cite the selector source.
- If no reusable container is proven, make the custom section self-contained: add an `__inner` wrapper with `max-width`, `margin-inline: auto`, `padding-inline`, and `box-sizing: border-box`.
- On mobile, keep at least a safe horizontal inset; do not let text touch the viewport edge.
- Verify with browser screenshots + DOM rect measurements. A banner that is flush-left but not overflowing is still a visual failure.

Minimal Horizon-safe container:

```css
.custom-hero__inner {
  max-width: var(--page-width, 1200px);
  margin-inline: auto;
  padding-inline: clamp(1rem, 5vw, 4rem);
  box-sizing: border-box;
}

.custom-hero__content {
  max-width: 640px;
}
```

Do not solve this by adding an arbitrary `margin-left` to only the heading or button. The container must own the spacing.

Full banner layout contract: see [banner-playbook.md](banner-playbook.md) §1.1.

---

## Collection / Catalog Product-Card Media Ratio Can Be Overridden by Theme JS

**When this triggers:** any brief mentions Catalog, collection grid, product grid, product cards, card image height/width alignment, or placeholder product-card cleanup **for products that already exist or must be visually repaired in-theme**.

**Boundary:** For new listing batches, media consistency belongs upstream in selection/listing preparation. The listing flow should inspect real supplier images, choose one evidence-based batch cover aspect ratio, and normalize/crop/canvas images before product creation when possible. Theme CSS is a fallback for existing products, urgent visual repair, or theme components that still render inconsistently after the listing media gate.

**Symptoms:**

- Collection / Catalog product cards have uneven image heights.
- A CSS override such as `.product-grid .card-gallery { --gallery-aspect-ratio: 4 / 5; }` is written successfully but one product card still renders taller.
- Text/price alignment may be fixed while the visible image boxes still feel inconsistent.
- Users may report "width inconsistency" even when card/media containers measure equal — usually this means the supplier image subject has different padding / whitespace, not a layout-width bug.

**Root causes:**

1. Product-card `image_ratio: adapt` modes inherit each product image's natural aspect ratio, so square, portrait, landscape, and whitespace-heavy supplier images produce uneven media boxes.
2. Horizon / newer themes can run JS such as `paginated-list-aspect-ratio.js` that writes both:
   - `--gallery-aspect-ratio` on the card gallery, and
   - inline `aspect-ratio` on `.product-media-container`.
3. Inline style writes beat normal class CSS. A non-`!important` CSS-variable override can look correct in `assets/base.css` but lose at runtime.

**Fix pattern — scoped to collection grids only:**

- Read actual theme files first: `snippets/card-gallery.liquid`, `snippets/card-product.liquid`, the relevant collection section/template, `assets/base.css`, and any asset containing `aspectRatio` / `--gallery-aspect-ratio` / `product-media-container`.
- Prefer a scoped override under `.product-grid` so PDP galleries, homepage custom showcases, and predictive search are not affected.
- Override both the CSS variable and the actual media wrapper `aspect-ratio`.
- Use `!important` only when runtime inspection shows theme JS writes inline ratio styles or an inline CSS variable.
- Default to `object-fit: contain` for supplier images to avoid cropping the product; use a neutral brand background for letterbox space.
- Choose the ratio from evidence (current theme setting, measured card media boxes, and actual cover image set). Do not copy `4 / 5` or `1 / 1` as a default.

Example Horizon-safe pattern after choosing a ratio from evidence:

```css
/* Catalog card fixed media box.
   Replace CHOSEN_RATIO with the measured ratio, e.g. 1 / 1 or 4 / 5.
   Add !important only if runtime inspection shows inline ratio styles. */
.product-grid .card-gallery {
  --gallery-aspect-ratio: CHOSEN_RATIO;
  overflow: hidden;
}

.product-grid .card-gallery .product-media-container {
  aspect-ratio: CHOSEN_RATIO;
  width: 100%;
  height: auto;
  overflow: hidden;
  background-color: #f8f7f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-grid .card-gallery .product-media-container img {
  object-fit: contain;
  object-position: center center;
  width: 100%;
  height: 100%;
}

@media screen and (max-width: 749px) {
  .product-grid .card-gallery {
    --gallery-aspect-ratio: CHOSEN_RATIO;
  }
  .product-grid .card-gallery .product-media-container {
    aspect-ratio: CHOSEN_RATIO;
  }
}
```

If mobile validation shows `document.documentElement.scrollWidth > window.innerWidth`, identify the overflowing element first. Add `overflow-x: clip` only to the smallest responsible wrapper, not to `.product-grid` by default.

**Verification contract — screenshots are not enough:**

Return DOM measurements for desktop and mobile:

```json
{
  "cardMeasurements": [
    {
      "title": "Portable Cleaning Caddy",
      "cardWidth": 285,
      "mediaWidth": 285,
      "mediaHeight": 356.25,
      "imgRenderedWidth": 285,
      "imgRenderedHeight": 356.25,
      "naturalWidth": 166,
      "naturalHeight": 199,
      "objectFit": "contain"
    }
  ],
  "mobileOverflow": {
    "scrollWidth": 390,
    "innerWidth": 390
  },
  "chosenRatio": "4 / 5",
  "ratioEvidence": "all fixed media boxes measured equal at 285x356.25; source covers are mostly portrait supplier images"
}
```

Pass criteria:

- media container width/height match across cards within the same row / grid mode;
- title and price y-positions align visually and by measurement;
- mobile `scrollWidth <= innerWidth`;
- no severe product cropping.

If containers are equal but the product subject still looks narrower/wider, classify it as an **image-standardization issue**, not a theme-layout bug. Recommend normalizing product images to a common 1:1 or 4:5 canvas with consistent subject padding (roughly 75-85% of the frame) rather than endlessly tuning CSS.
