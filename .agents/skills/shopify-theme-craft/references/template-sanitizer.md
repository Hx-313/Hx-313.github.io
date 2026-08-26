# Template sanitizer

> Purpose: remove demo/default theme content before a theme preview can be shown
> as launch-ready. This applies to fresh external bases, official theme bases, and
> major homepage/PDP rewrites.

## When required

Run this checklist before returning a theme as ready for main-Agent publish
approval when any of these are true:

- a fresh theme base was installed or reinstalled
- an external GitHub theme source influenced templates or sections
- homepage, product template, collection template, cart template, header, or
  footer was replaced or heavily rewritten
- the user reports default/demo content, duplicate banners, or unexpected page
  sections

## Files to inspect

Inspect every file that exists in this list:

- `templates/index.json`
- `templates/product.json`
- `templates/collection.json`
- `templates/list-collections.json`
- `templates/cart.json`
- `templates/search.json`
- `templates/page.json`
- `templates/404.json`
- `sections/header-group.json`
- `sections/footer-group.json`
- `config/settings_data.json`
- section files referenced by the template `order` arrays
- locale files only when template/settings labels appear as translation keys

## Demo-content indicators

Flag these unless they are intentionally merchant-authored and explained:

- `Image with text`
- `Pair text with an image`
- `Talk about your brand`
- `Hassle-Free Exchanges`
- `Free Shipping` when it is theme demo copy, not a merchant policy
- `Example product`, `Sample product`, `Demo product`
- `Lorem ipsum`
- `Your collection's name`
- `Featured collection` with no real collection target
- placeholder SVGs such as `placeholder_svg_tag`, `lifestyle-1`, `product-1`,
  `collection-1`
- demo images of apparel, furniture, cosmetics, food, or plants unrelated to the
  merchant category
- empty or broken links in visible CTAs

## Sanitizer actions

Choose the least destructive action that makes the storefront truthful:

1. Remove demo-only section instances from the template `sections` object and
   `order` array.
2. Replace demo copy with merchant-specific copy from the brief/brand guide.
3. Replace placeholder imagery only through the normal image policy. If image
   generation is needed, return `pending_image_generation` to the main Agent.
4. Keep standard functional sections when useful, such as product information,
   buy buttons, variant picker, cart items, related products, search results,
   header, and footer.
5. If the intended section is unavailable because real data is missing, omit the
   section and report `content_pending`, instead of leaving demo filler.

## Required page-level checks

Before claiming the sanitizer passed, check at least:

| Page | Must be true |
|---|---|
| Homepage | No duplicate hero/banner; no unrelated demo images; CTAs link to real routes |
| Product page | No default image-with-text or multicolumn demo blocks below PDP; product media/title/price/buy buttons remain |
| Collection page | No placeholder products; grid renders real products or a truthful empty state |
| Cart page | Cart form/checkout path remains; no demo promotional blocks that imply false policies |
| Header/footer | No broken demo links; merchant brand/contact/footer intent present or omitted cleanly |

## Structured report

Include a `template_sanitizer` object in the theme-decorator final report:

```json
{
  "status": "pass",
  "files_scanned": [
    "templates/index.json",
    "templates/product.json",
    "templates/collection.json",
    "templates/cart.json"
  ],
  "removed_section_ids": {
    "templates/product.json": ["image-with-text", "multicolumn"]
  },
  "replaced_demo_copy": [
    "homepage hero heading",
    "footer brand text"
  ],
  "remaining_demo_indicators": [],
  "content_pending": []
}
```

If any `remaining_demo_indicators` are non-empty, do not mark the theme ready
for publish approval. Return `pending_main_agent_action:
"verification incomplete — demo content remains"`.
