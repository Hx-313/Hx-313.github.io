# Liquid section conventions (skeleton)

> Audience: `shopify-theme-decorator` sub-agent.
> Placeholder for accumulated Online Store 2.0 section / block / settings_schema
> craft. Populate as patterns are learned. Do NOT duplicate `shopify-liquid`
> reference material here — that skill is already loaded as systemPrompt.
> This file is for **plugin-specific learned patterns** (Horizon-theme quirks,
> recurring schema shapes for the surfaces this plugin actually builds,
> known-bad patterns to avoid).

## Suggested structure when populating

- §1 Section schema patterns for common surfaces (banner / collection list / featured product / testimonials)
- §2 Block-in-section vs standalone-section decision guide
- §3 settings_data.json wiring — common mistakes (orphan sections, ordering)
- §4 Theme-check warnings worth ignoring vs worth fixing
- §5 Horizon-theme-specific naming and CSS-variable conventions

---

## Horizon collection card media normalization

Use this when a brief touches Catalog / collection product grids or product-card image alignment for an existing theme/product set. For new listing batches, first resolve media consistency upstream: inspect supplier images, select an evidence-based batch cover aspect ratio, and normalize images before product creation. This theme rule is a fallback when existing products or theme mechanics still need visual repair.

### Pre-write inspection

Before changing collection product-card visuals, read or search these theme files where present:

- `snippets/card-gallery.liquid`
- `snippets/card-product.liquid`
- relevant collection section/template, such as `sections/main-collection-product-grid.liquid`, `templates/collection.json`, or Horizon equivalents
- `assets/base.css`
- any JS/CSS asset containing `aspectRatio`, `--gallery-aspect-ratio`, `product-media-container`, `card-gallery`, or `image_ratio`

### Classify the problem

Separate three cases before writing CSS:

1. **Media-box height mismatch** — card/media containers have different heights because the theme adapts to natural image ratio.
2. **Text/price alignment mismatch** — media boxes may differ, causing content below cards to start at different y-positions.
3. **Subject-size illusion** — measured media boxes are equal, but one product looks narrower/smaller because the source image has different padding, whitespace, or subject proportion.

Only cases 1-2 are theme-layout bugs. Case 3 is an image-standardization problem.

### Horizon-specific trap

Horizon can use JS such as `paginated-list-aspect-ratio.js` to write inline ratio styles after load:

- `--gallery-aspect-ratio` on the gallery element
- inline `aspect-ratio` on `.product-media-container`

Normal CSS variable overrides may not win. If runtime inspection shows inline aspect-ratio, override both the variable and the media wrapper with a narrowly scoped `!important` rule under `.product-grid`.

### Safe CSS strategy

Default for supplier images:

- fixed collection media frame chosen from evidence: current theme setting, measured card boxes, actual cover image ratios, and intended surface. Common outcomes are `1 / 1` or `4 / 5`, but neither is a universal default.
- `object-fit: contain` to avoid cropping products
- neutral brand background behind the contained image
- scope to `.product-grid` to avoid PDP galleries, homepage custom sections, and predictive search cards

Avoid global rules like `img { object-fit: cover; }` or `.product-media-container { ... }` without a collection/product-grid ancestor.
Do not add `overflow-x: clip` as a generic mobile fix; use it only after measuring `scrollWidth > innerWidth` and identifying the smallest overflowing wrapper.

### Required validation

After writing, the report must include desktop and mobile DOM measurements, not only screenshots:

- card/list item width/height
- media container width/height
- image rendered width/height
- natural image width/height when available
- computed `object-fit`
- chosen ratio and evidence for that ratio
- title/price y-position alignment
- mobile `document.documentElement.scrollWidth` vs `window.innerWidth`

If all containers measure equal but a product still looks visually narrower, report that the CSS fix is complete and recommend product-image standardization: same canvas ratio, same background, same subject padding, and similar subject scale.
