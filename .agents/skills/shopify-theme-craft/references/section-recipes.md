# Section recipes

> Purpose: help `shopify-theme-decorator` turn its internally derived
> `theme_style_strategy` into differentiated Shopify sections. This is executor
> implementation guidance, never a Main-Agent spawn-brief requirement.
> Dawn / Horizon / current theme is the safe runtime base, not the visual design.
> Whole-store decoration must not stop at color/font swaps or native default
> section rearrangement.

## Core rule

For Stage 3 / whole-store decoration with
`implementation_mode: "generate_safe_sections"`, the decorator MUST create or
reuse plugin-controlled `accio-*` sections for the recipe. It may keep native
Shopify functional sections such as product information, product form, variant
picker, cart items, search results, and collection grids, but the merchant-facing
home/PDP storytelling surface must come from controlled custom sections.

Minimum differentiation bar for whole-store decoration:

- Homepage: at least two recipe-specific `accio-*` sections, one of which is a
  custom hero / lead section.
- PDP: at least one recipe-specific enhancement unless the brief explicitly
  limits scope to homepage only.
- Collection: at least one density / card / merchandising adjustment when the
  store has more than one product or the strategy is catalog-led.
- Do not claim a recipe was implemented if only colors, typography, announcement
  text, native `image-banner`, or native `featured-collection` changed.

## Recipe table

| Style pack | Recipe id | Required custom sections | Template emphasis |
|---|---|---|---|
| `official_clean` | `official_clean_v1` | `accio-clean-hero`, `accio-trust-strip` | Low-risk launch, restrained copy, simple featured collection, clean footer trust |
| `retail_conversion` | `retail_conversion_v1` | `accio-product-led-hero`, `accio-usp-strip`, `accio-promo-grid` | Product-first homepage, dense best sellers, offer/trust band, clear collection links |
| `warm_home` | `warm_home_v1` | `accio-room-hero`, `accio-lifestyle-story`, `accio-material-care-strip` | Editorial room scene, soft cards, lifestyle image-with-text, care/shipping reassurance |
| `beauty_editorial` | `beauty_editorial_v1` | `accio-editorial-hero`, `accio-benefit-ingredient-grid`, `accio-routine-steps` | Ingredient/benefit hierarchy, routine flow, reviews/social proof |
| `natural_fresh` | `natural_fresh_v1` | `accio-fresh-hero`, `accio-origin-benefits`, `accio-simple-category-grid` | Freshness/origin story, light category blocks, natural proof points |
| `gift_emotional` | `gift_emotional_v1` | `accio-occasion-hero`, `accio-gift-guide-grid`, `accio-delivery-reassurance` | Occasion-led shopping, gift guide, delivery/returns reassurance |
| `modern_tech` | `modern_tech_v1` | `accio-feature-hero`, `accio-spec-strip`, `accio-comparison-grid` | Feature/spec-first story, comparison modules, compatibility and warranty emphasis |
| `b2b_catalog` | `b2b_catalog_v1` | `accio-catalog-hero`, `accio-spec-table`, `accio-quote-cta` | Dense catalog navigation, spec table, bulk/inquiry CTA, fewer decorative images |

## Combining primary and secondary packs

Use the primary `style_pack` to choose the recipe id and required modules. Use
`secondary_style_pack` only to tune visual presentation:

- `warm_home` secondary: warmer imagery, room/context cards, softer spacing.
- `gift_emotional` secondary: occasion labels, giftability copy, delivery
  reassurance.
- `modern_tech` secondary: sharper contrast, spec labels, tighter information
  density.
- `beauty_editorial` secondary: editorial image rhythm and benefit-led copy.
- `natural_fresh` secondary: lighter palette, origin/freshness proof points.

Do not merge two complete recipes into one homepage. That produces bloated,
generic storefronts. Pick one recipe and borrow at most two secondary cues.

## Template placement patterns

Homepage recipe order should normally be:

1. Recipe-specific hero.
2. Collection or best-seller module using real collection/product data.
3. Recipe-specific trust / benefit / story section.
4. Product- or category-led supporting module.
5. Footer/header cleanup and trust links.

PDP enhancement should sit below the native product-information section and must
not break native product form, variant picker, media gallery, buy buttons, or app
blocks. If the product data needed for a section is missing, omit the section and
report `content_pending`; do not leave demo filler.

Collection enhancement should not fight existing filtering/sorting. Prefer
wrapping copy, merchandising bands, card ratio/density improvements, or
collection-specific trust strips.

## Pattern extraction from inspiration sources

When `theme_source_intake.decision` is `extract_patterns_only`, use source repos
only to inform:

- section order
- card density
- trust/review/bundle placement
- PDP information hierarchy
- copy structure and visual rhythm

Do not copy source repo Liquid, JSON templates, CSS class systems, JavaScript, or
settings schemas into the merchant theme. Re-author new `accio-*` sections on the
safe base.

## Output contract

Decorator final reports for Stage 3 / whole-store decoration MUST include:

```json
{
  "section_recipe": {
    "recipe_id": "retail_conversion_v1",
    "style_pack": "retail_conversion",
    "secondary_style_pack": "warm_home",
    "generated_sections": [
      "sections/accio-product-led-hero.liquid",
      "sections/accio-usp-strip.liquid",
      "sections/accio-promo-grid.liquid"
    ],
    "template_changes": [
      {
        "template": "templates/index.json",
        "added_section_types": ["accio-product-led-hero", "accio-usp-strip"],
        "removed_default_section_types": ["image-banner", "image-with-text"]
      }
    ],
    "visual_differentiators": [
      "product-first hero instead of native image banner",
      "custom USP strip with category-specific proof points"
    ],
    "content_pending": []
  }
}
```

If a recipe cannot be implemented because product, collection, image, or brand
inputs are missing, return `partial` with explicit `content_pending` instead of
falling back to generic Dawn/Horizon sections.
