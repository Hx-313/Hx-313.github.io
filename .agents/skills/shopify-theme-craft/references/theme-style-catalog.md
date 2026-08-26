# Theme style catalog

> Purpose: choose a decoration strategy from the merchant's category and brand
> direction. This is NOT a theme marketplace. A style pack decides the visual
> language, section mix, density, and conversion emphasis; the implementation
> still uses a safe Liquid base theme plus controlled custom sections.

## Core rule

Do not choose a GitHub repo as "the theme" merely because the merchant's category
matches its demo. Choose:

1. `base_theme`: a safe Liquid base (`dawn`, `horizon`, or a clean OS 2.0 blank
   base approved by theme-source intake).
2. `style_pack`: the decoration strategy below.
3. `inspiration_sources`: optional repos used as pattern references only.
4. `implementation_mode`: usually `generate_safe_sections`.
5. `section_recipe_id`: the recipe to execute from `section-recipes.md`.

Hydrogen / headless / Next.js / Svelte storefronts are visual references only in
this plugin. They require a separate storefront architecture and must not be
published through Shopify Online Store theme APIs.

## Style packs

| Style pack | Best for | Base preference | Inspiration sources | Storefront shape |
|---|---|---|---|---|
| `official_clean` | New stores, unknown category, low-risk launch, general catalog | Dawn or Horizon | `Shopify/dawn` | Simple hero, featured collection, USP row, clean PDP, minimal motion |
| `retail_conversion` | Home organization, tools, kitchen, daily goods, pet supplies, SKU-rich stores | Dawn first, Horizon if already live | `kondasoft/ks-bootshop`, `VienDinhCom/bootstrap-shopify-theme` | Product-led hero, dense best-seller grid, promo/trust blocks, clear CTAs |
| `warm_home` | Home decor, storage, furniture, interior design, soft goods | Dawn or Horizon | `Weaverse/aspen`, `Weaverse/maison`, `Weaverse/pilot` | Warm editorial hero, roomy grids, lifestyle image-with-text, softer USP copy |
| `beauty_editorial` | Beauty, skincare, fragrance, wellness, personal care | Dawn | `Weaverse/naturelle`, `Weaverse/pilot` | Editorial imagery, ingredient/benefit blocks, review/social proof slots |
| `natural_fresh` | Food, grocery, fresh products, natural health, eco goods | Dawn or clean OS 2.0 base | `wpfreelance/vegfresh` | Light palette, freshness/ingredient story, simple category blocks |
| `gift_emotional` | Gifts, flowers, candles, wedding, seasonal products | Dawn | `gonzalolater/Speaking-Roses` | Emotion-first hero, occasion collections, giftability and shipping reassurance |
| `modern_tech` | Electronics, smart devices, accessories, modern apparel, performance products | Dawn with custom sections | `montalvomiguelo/hydrogen-theme`, `Weaverse/pilot` | High-contrast hero, specs/feature strips, fast product comparison |
| `b2b_catalog` | Wholesale, furniture B2B, industrial, bulk-buy catalogs | Dawn or clean OS 2.0 base | `Weaverse/maison`, Bootstrap catalog themes | Catalog-first nav, dense grids, inquiry/quote CTA, clear specs |

## Category routing

Use exact user input, product brief, or selected supplier category. If category is
unknown, ask the user to pick one of: clean official / high-conversion retail /
warm home / beauty editorial / natural fresh / gift emotional / modern tech.

For cross-category signals, choose one primary `style_pack` from the product's
buying decision and one `secondary_style_pack` from the visual context:

- Primary = what the shopper compares before buying (function, specs, use case,
  price, giftability, ingredients, or wholesale terms).
- Secondary = the environment or mood used for merchandising (home, editorial,
  natural, premium, seasonal, modern).
- Example: "smart home decor" → primary `modern_tech` (features/specs), secondary
  `warm_home` (room/lifestyle presentation).
- Example: "organic skincare gift set" → primary `beauty_editorial`, secondary
  `gift_emotional`.
- If two packs remain equally plausible and the confirmed business brief does
  not resolve the intended buying angle, return that missing business decision
  to the Main Agent instead of blending both into a vague design. Do not ask the
  Main Agent to choose a recipe or implementation mode.

| Merchant category signal | Recommended strategy |
|---|---|
| home organization, storage, kitchen organizer, under-sink, drawer, shelf | `retail_conversion` + `warm_home` |
| furniture, interior design, home decor, lighting, textiles | `warm_home` |
| beauty, skincare, cosmetics, fragrance, spa, wellness | `beauty_editorial` |
| food, grocery, fresh, organic, tea, coffee, supplements | `natural_fresh` |
| gifts, flowers, candles, wedding, holiday, stationery | `gift_emotional` |
| electronics, gadget, smart home, phone accessory, performance gear | `modern_tech` |
| wholesale, B2B, bulk order, distributor, industrial supply | `b2b_catalog` |
| apparel, jewelry, general merchandise, unclear | `official_clean` unless user selects a stronger mood |

## Executor-internal strategy contract

After receiving the merchant-facing business/design brief and inspecting the
actual theme, `shopify-theme-decorator` derives an internal
`theme_style_strategy`. The Main Agent must not pre-populate this object in the
spawn brief:

```json
{
  "base_theme": "dawn",
  "style_pack": "retail_conversion",
  "secondary_style_pack": "warm_home",
  "section_recipe_id": "retail_conversion_v1",
  "implementation_mode": "generate_safe_sections",
  "inspiration_sources": [
    "Shopify/dawn",
    "kondasoft/ks-bootshop",
    "Weaverse/aspen"
  ],
  "reason": "Home organization needs warm trust cues plus product-grid clarity and conversion-focused CTAs.",
  "homepage_section_plan": [
    "product-led hero",
    "best sellers collection grid",
    "space-saving / easy install / fast shipping USP row",
    "lifestyle image-with-text",
    "footer trust links"
  ],
  "pdp_emphasis": [
    "dimensions",
    "fit/use cases",
    "shipping and returns",
    "related products"
  ]
}
```

## Implementation boundaries

- `generate_safe_sections`: default. Author plugin-controlled sections such as
  `sections/accio-hero.liquid` and namespace CSS to those sections. For Stage 3
  / whole-store decoration, execute the matching `section_recipe_id` from
  `section-recipes.md`; color/font swaps alone are not enough.
- `direct_base_allowed`: only for approved Liquid base themes that pass
  `theme-source-intake.md`; still run template sanitizer and smoke test before
  publish.
- `extract_patterns_only`: read layout and section ideas from a source repo, but
  do not upload its templates or native sections into the merchant store.
- `visual_reference_only`: headless / Hydrogen / framework storefronts. Use for
  mood and layout inspiration only.

Never expose internal style-pack scoring to the user. User-facing wording should
name the practical strategy, e.g. "warm high-conversion retail style for home
organization", not a checklist score.
