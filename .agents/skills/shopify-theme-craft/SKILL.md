---
name: shopify-theme-craft
displayName: Shopify Theme Craft
description: |
  Theme decoration craft — banner / hero / announcement bar conventions,
  category-to-style strategy, style-pack section recipes, external theme-source
  intake, template/demo sanitization, Horizon-theme Liquid section patterns,
  targeted theme-file discovery/upsert workflow, rare local pull/push exceptions,
  dev-preview validation hooks, plus a
  non-theme-surface image-aspect picker.
  Primary consumer is the
  `shopify-theme-decorator` sub-agent (loaded as systemPrompt); the main Agent
  also reads it only for §"Non-theme-surface aspect picker" and for reviewing
  decorator reports; it does not take over theme implementation.
triggers: []
---

# shopify-theme-craft

Craft knowledge for theme decoration. Primary consumer is the
`shopify-theme-decorator` sub-agent (loaded as systemPrompt). The main Agent
also reads specific sections directly (see "Read by whom" below).

## When to consult

While executing a theme-decoration brief (see sub-agent contract in
`subagents/shopify-theme-decorator/prompt.md`):

- Authoring or editing any **banner / hero / image-banner / image-with-text**
  surface → read `references/banner-playbook.md`.
- A brief includes a merchant category, asks to choose a theme/style, or names a
  GitHub/open-source theme as inspiration → read
  `references/theme-style-catalog.md`.
- A Stage 3 / whole-store brief carries merchant-facing category, aesthetic,
  target surfaces, content priorities, assets, and success criteria → the
  theme-decorator reads `references/section-recipes.md`, selects its own suitable
  implementation, and records the rationale. The Main Agent never preselects
  the recipe or implementation mode.
- A brief asks to use / copy / install / adapt a GitHub or third-party theme
  source → read `references/theme-source-intake.md` before any write. Default
  external sources to pattern extraction, not direct publish.
- A fresh theme base, external theme source, or large homepage/PDP rewrite is
  involved → read `references/template-sanitizer.md` and include its report.
- Reaching for a section pattern, schema convention, or Online Store 2.0
  primitive you are not 100% sure about → read
  `references/liquid-section-conventions.md`.
- Planning or executing theme file reads/writes and needing to decide between
  targeted `themeFiles` discovery/upsert versus rare full-tree `theme pull/push`
  → read `references/dev-preview-craft.md`.

Main Agent, before `image_generate` for a **non-theme** surface (product
hero / collection thumbnail / IG / X / email):

- Apply the table in §"Non-theme-surface aspect picker" below.

If the theme-decorator sub-agent is unavailable or failed, the Main Agent does
not take over theme implementation. Relay the unresolved business outcome and
evidence to the owning executor, or report the partial result.

## References (index)

| File | Status | Owns | Read by |
|---|---|---|---|
| [references/banner-playbook.md](references/banner-playbook.md) | written | Banner-surface craft: section types, file + template-instance + order deployment, aspect-ratio evidence, image source / logo / dedupe policy, server-side verify contract, deliverable contract for banner work | theme-decorator sub-agent; Main Agent reads only the separate image-generation/aspect evidence explicitly routed back to it |
| [references/theme-style-catalog.md](references/theme-style-catalog.md) | written | Category → internal style/implementation options, safe base choices, and inspiration-source policy. | theme-decorator sub-agent when category/style decisions are in scope |
| [references/section-recipes.md](references/section-recipes.md) | written | Style-pack → differentiated `accio-*` section recipes, minimum differentiation bar, recipe report contract. Prevents Dawn/Horizon skin-only storefronts. | theme-decorator sub-agent for Stage 3 / whole-store decoration; main Agent when reviewing decorator reports |
| [references/theme-source-intake.md](references/theme-source-intake.md) | written | Read-only intake for GitHub/open-source themes: direct base vs pattern extraction vs visual reference vs unsupported. Includes known policy for Dawn, KS BootShop, Hydrogen/headless, and scaffold repos. | theme-decorator sub-agent before using any external source; Main Agent may review the returned decision but does not preselect it |
| [references/template-sanitizer.md](references/template-sanitizer.md) | written | Demo/default-content scanner and cleanup protocol for homepage/PDP/collection/cart/header/footer templates before publish approval. | theme-decorator sub-agent; main Agent when reviewing reports |
| [references/announcement-bar.md](references/announcement-bar.md) | written | Announcement-bar cookbook: Dawn vs Horizon file-location matrix (`settings_data.json` vs `header-group.json`), read-then-write workflow, detection heuristic, verification | theme-decorator sub-agent |
| [references/theme-write-pitfalls.md](references/theme-write-pitfalls.md) | written | Theme-write failure modes: surface discovery before writing, targeted `themeFiles` reads/upserts, rare full-tree pull/push exceptions, `image_picker` cannot be set via API (asset_url workaround), JSON template DB caching, bundled/locked sections, section HTML ID suffix-match, section file diff vs template instance diff | theme-decorator sub-agent |
| [references/liquid-section-conventions.md](references/liquid-section-conventions.md) | skeleton | Online Store 2.0 section / block / settings_schema conventions; populated as patterns are learned. | theme-decorator sub-agent |
| [references/dev-preview-craft.md](references/dev-preview-craft.md) | written | Sub-agent-side theme workflow: targeted `themeFiles` discovery, explicit change plan, `themeFilesUpsert` writes, remote checksum/content verification, browser/admin-preview validation, and rare full-tree pull/push exception rules. Distinct from the **main Agent's** preview gate, which is `shopify-storefront-validate` SKILL.md mode `admin_preview` (the `?preview_theme_id=` URL). | theme-decorator sub-agent |

## Non-theme-surface aspect picker (main Agent)

> For **theme surfaces** (hero / image-banner / image-with-text / announcement /
> slideshow / mobile slot) the procedure is `references/banner-playbook.md` §2 —
> use that, not the table here. The table here covers product / collection /
> social / email images the main Agent generates directly without going through
> the theme-decorator sub-agent.

Before each `image_generate` call:

1. Identify the surface the image will sit on (product page main slot, collection card, IG square post, IG story, X card, email hero, etc.).
2. Pick `aspect_ratio` from the table (matches `image_generate`'s enum):

   | Surface | aspect_ratio | Evidence to state |
   |---|---|---|
   | Shopify product page main image (Dawn / Horizon default) | `1:1` | "product page main slot defaults to 1:1 square" |
   | Product gallery secondary slot | `1:1` or `4:5` | match the cover; do not mix |
   | Collection card thumbnail | `1:1` | "collection card thumbnail renders square" |
   | Lifestyle / scene shot for product gallery | `4:5` or `3:4` | "vertical lifestyle frame for mobile-first gallery" |
   | Social — IG feed post | `1:1` or `4:5` | platform default |
   | Social — IG story / Reels cover | `9:16` | platform default |
   | Social — X post image | `16:9` | platform default |
   | Email hero | `2:1` is unsupported by enum → use `16:9` and crop in email | platform default |
   | Anything not above | STOP — `ask_user` for the target surface, then map to the table. Do NOT default-guess. |

3. State the evidence in chat before the `image_generate` call, e.g. `surface: product page main slot → aspect_ratio = 1:1`. No evidence line → no `image_generate` call.

### When a `pending_image_generation` arrives from `shopify-theme-decorator`

Do NOT apply the table above — that sub-agent's `pending_image_generation`
payload tells you exactly what to do:

1. Read `surface_files_for_aspect_inference` and `grep` each file for `aspect-ratio:` / `min-height:` / `object-fit:` / explicit width×height.
2. Cross-check against `suggested_aspect_ratio` (the sub-agent's own inference).
3. If they agree, proceed; quote the file + matching CSS line as the evidence.
4. If they disagree, trust your re-derivation but log the disagreement in chat.
5. If `suggested_aspect_ratio` is `null`, the sub-agent saw no signals — `ask_user`.

Full signal→ratio table, slideshow handling, mobile slot pairing live in
`references/banner-playbook.md` §2.

## Scope

Theme-work craft + the non-theme-surface aspect picker (aspect ratio only). The
adjacent decisions this skill does NOT own are already enforced at their source —
spawn routing in `dtc-builder` / main-Agent prompt §2; image-generation (Hard Rule
#9) and the user-facing go-live gate in the main-Agent prompt + `shopify-theme-decorator`
sub-agent prompt; non-banner product / social image policy in
`skills/dtc-builder/references/image-discipline.md` §A.
