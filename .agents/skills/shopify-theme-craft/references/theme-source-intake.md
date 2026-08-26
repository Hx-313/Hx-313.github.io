# Theme source intake

> Purpose: safely evaluate a GitHub/open-source theme before it can influence a
> Shopify store decoration job. This is a read-only intake step unless the result
> explicitly permits a fresh base install.

## Intake decision

Every external theme source must end with one of these decisions:

| Decision | Meaning | Allowed next step |
|---|---|---|
| `direct_base_allowed` | Liquid Online Store 2.0 theme, license acceptable, build artifacts present or build is reproducible, demo risk manageable | Create a fresh unpublished theme, push the full clean base, sanitize templates, then smoke test |
| `extract_patterns_only` | Useful Liquid sections/layouts, but risky as a base because of build chain, demo content, stale APIs, or theme assumptions | Extract layout/section ideas and generate plugin-controlled sections on a safe base |
| `visual_reference_only` | Headless/Hydrogen/Next/Svelte or non-Liquid theme | Use only for mood/layout inspiration; do not push to Online Store theme |
| `unsupported` | Missing theme structure, unclear license, broken build, or non-Shopify project | Do not use |

Default to `extract_patterns_only` for third-party repos. `direct_base_allowed`
is an exception, not the default.

## Read-only checks

For each source repo, inspect and record:

- repo URL, owner/name, commit SHA or release tag, license file and SPDX-style
  conclusion where possible
- project type: `liquid_theme`, `liquid_boilerplate`, `hydrogen`, `headless`,
  `dev_scaffold`, or `unknown`
- required build tool: none / npm / pnpm / yarn / bun / gulp / webpack / vite /
  theme-lab / unknown
- Online Store 2.0 support: presence of `templates/*.json`, `sections/*.liquid`,
  `config/settings_schema.json`, `layout/theme.liquid`
- publish readiness: whether compiled assets are already present in `assets/`
  or must be built
- demo placeholder risk: text/images/products in templates, presets, sections,
  locales, or settings data
- `image_picker` dependency level: low / medium / high
- template coverage: homepage, product, collection, cart, search, 404
- JavaScript dependency risk: cart drawer, variant picker, sliders, app embeds,
  framework islands, external CDNs
- Storefront API/headless dependency risk

## Known repo policy from the current catalog

| Repo | Category | Default decision | Notes |
|---|---|---|---|
| `Shopify/dawn` | Liquid reference theme | `direct_base_allowed` | Official reference base; still sanitize templates and run smoke test |
| `andreasdevjs/shopify_OS20_boilerplate` | Liquid boilerplate | `direct_base_allowed` | Blank base only; needs generated sections to look production-ready |
| `kondasoft/ks-bootshop` | Liquid Bootstrap theme | `extract_patterns_only` | Good retail/conversion patterns; do not install blindly |
| `montalvomiguelo/hydrogen-theme` | Liquid theme with Tailwind/Vite/islands style | `extract_patterns_only` | Good modern visual reference; build/runtime assumptions need intake |
| `VienDinhCom/bootstrap-shopify-theme` | Liquid Bootstrap/Webpack theme | `extract_patterns_only` | Good engineering reference; direct install is higher risk |
| `instantcommerce/shopify-headless-theme` | Liquid redirect / headless bridge | `visual_reference_only` | Not an Online Store design base |
| `gonzalolater/Speaking-Roses` | Liquid theme | `extract_patterns_only` | Low-star source; use only after intake |
| `wpfreelance/vegfresh` | Liquid minimal theme | `extract_patterns_only` | Low-star source; use as natural/fresh pattern reference |
| `Weaverse/*`, `Shopify/hydrogen`, `packdigital/*` | Hydrogen/headless | `visual_reference_only` | Not publishable through Liquid theme workflow |
| theme-lab / gulp / tailwind / packer scaffolds | Developer scaffolds | `unsupported` for merchant decoration | Tooling, not a storefront theme |

## Direct base install constraints

If a source is `direct_base_allowed`, use a fresh-theme path:

1. Never patch the current live theme or a live-theme duplicate with an external
   repo in place.
2. Create or target a new unpublished theme.
3. Push the complete clean theme file tree, not a partial mixture with the
   previous store theme.
4. Run `theme check`.
5. Run `template-sanitizer.md`.
6. Run homepage + PDP + collection + cart smoke checks before any publish gate.

If any step fails, downgrade to `extract_patterns_only` or abort.

## Structured intake report

Return this object to the main Agent when a source repo is used:

```json
{
  "source_repo": "kondasoft/ks-bootshop",
  "commit": "<sha-or-tag>",
  "license": "MIT",
  "project_type": "liquid_theme",
  "os_2_0": true,
  "requires_build": true,
  "build_tool": "bootstrap/npm",
  "template_coverage": ["index", "product", "collection", "cart"],
  "demo_placeholder_risk": "medium",
  "image_picker_dependency": "medium",
  "decision": "extract_patterns_only",
  "allowed_use": [
    "homepage layout reference",
    "product-grid density reference",
    "trust/USP section reference"
  ],
  "blocked_use": [
    "direct theme publish",
    "copy templates/product.json without sanitizer"
  ]
}
```
