# Banner playbook (theme-decorator internal)

> Audience: `shopify-theme-decorator` sub-agent.
> Single source of truth for banner-surface craft. Anything outside this file
> (main-Agent routing, image generation, publish gating) is owned elsewhere —
> see `SKILL.md` § "Authoritative scope boundary".

---

## §1 Banner surfaces in a Shopify theme

When a brief item carries `surface: "homepage hero banner"` /
`"image banner"` / `"announcement bar"` / `"image with text"`, you are
authoring one of these Online Store 2.0 sections. Treat them as distinct
surfaces with different aspect-ratio and copy constraints:

| Brief surface phrasing | Typical Horizon-theme section | Key slots | Notes |
|---|---|---|---|
| `homepage hero banner` / `hero` | `image-banner` (sometimes a custom `hero` section in non-Dawn themes) | `image` (desktop), optionally `image_mobile` / `mobile_image`, `heading`, `subheading`, `button_label`, `button_link` | First-screen surface; height usually `min-height: 70vh+` with `object-fit: cover` — almost always 16:9 desktop. |
| `image with text` | `image-with-text` | `image` (≤ 50% viewport width), `heading`, `text`, `button_label` | Side-by-side, image is typically square or 3:2; NOT a hero. |
| `announcement bar` | `announcement-bar` (group/section) or theme settings | `text`, `link`, optional `dismissible` | Pure text surface; no images. |
| `image banner` (generic) | `image-banner` | same as hero | When unsure whether the brief means hero or a secondary image strip, grep the section's CSS for `min-height: *vh` — if present and ≥ 50vh, treat as hero; otherwise treat as a secondary banner (often 3:1 or 4:1 wide strip). |
| `slideshow` / `carousel` | `slideshow` with per-slide `image` blocks | per-block image + per-block heading/cta | Each slide must satisfy §2 independently; do NOT mix aspect ratios across slides. |
| `mobile image` slot inside any of the above | distinct `image_mobile` / `mobile_image` setting on the same section | separate image URL | Always 9:16 when present (§2 row 5). |

If the brief surface phrasing doesn't match any row, grep the theme for the
closest section type (`grep -rln "hero\|banner" sections/`) before assuming —
custom themes rename freely.

### §1.0 Banner deployment = file + instance + order + DOM

Do not treat a banner as "deployed" because `sections/<brand>-hero.liquid`
changed. A shopper sees section instances mounted by template JSON.

Every banner / hero deployment or fix must account for four layers:

1. **Section file**: the Liquid/CSS/assets exist, e.g.
   `sections/<brand>-hero.liquid`.
2. **Template instance**: the owning template has an instance whose
   `type` points to that section, e.g.
   `templates/index.json.sections.<id>.type = "<brand>-hero"`.
3. **Order array**: the owning template's `order` contains exactly the intended
   hero/banner section IDs in the intended order.
4. **Rendered DOM count**: the preview page contains the expected number of
   hero/banner candidates.

Before editing, read the owning template JSON and record the existing
`sections` keys and `order`. For homepage hero work this is usually
`templates/index.json`; for other surfaces, identify the owning
`templates/*.json` or section group first.

If the user says "extra banner", "default banner still there", "duplicate
hero", or "多了个默认的 banner", suspect template section instances before
touching more Liquid.

Required before/after report for banner work:

```json
{
  "section_file": "sections/brand-hero.liquid",
  "template": "templates/index.json",
  "before_order": ["hero_jVaWmY", "brand_hero_main"],
  "after_order": ["brand_hero_main"],
  "removed_section_ids": ["hero_jVaWmY"],
  "added_section_ids": [],
  "expected_banner_count": 1,
  "rendered_banner_count": 1
}
```

If the intended result is one hero/banner and `after_order` still contains both
a native `hero`/`image-banner` instance and a custom hero instance, the fix is
incomplete even if the custom section renders.

### §1.1 Layout containment — never assume Dawn `.page-width`

When authoring a new custom hero / banner section, do **not** rely on a theme-global
container class such as `.page-width`, `.container`, or `.section-wrapper` unless
you have just read the current theme files and can cite the selector source. Dawn
examples frequently use `.page-width`; Horizon and newer themes do not guarantee
that class exists or applies to custom sections.

Default to a self-contained, Horizon-safe content container in every custom banner
section:

```liquid
<section class="brand-hero">
  <div class="brand-hero__inner">
    <div class="brand-hero__media">
      {{ 'brand-hero.png' | asset_url | image_tag: alt: '...' }}
    </div>
    <div class="brand-hero__content">
      <h1>{{ section.settings.heading }}</h1>
      <p>{{ section.settings.subheading }}</p>
      <a class="brand-hero__button" href="{{ section.settings.button_link }}">
        {{ section.settings.button_label }}
      </a>
    </div>
  </div>
</section>
```

```css
.brand-hero {
  width: 100%;
  overflow: hidden;
}

.brand-hero__inner {
  max-width: var(--page-width, 1200px);
  margin-inline: auto;
  padding-inline: clamp(1rem, 5vw, 4rem);
  box-sizing: border-box;
}

.brand-hero__content {
  max-width: 640px;
}

@media screen and (max-width: 749px) {
  .brand-hero__inner {
    padding-inline: max(1rem, env(safe-area-inset-left));
  }
}
```

Rules:

- If using an existing theme container class, cite the file + selector in the
  report (e.g. `assets/base.css: .page-width { max-width: ... }`).
- If there is no cited selector, keep the self-contained container above.
- Do not fix a flush-left banner by adding a random `margin-left` to the heading
  only; fix the section container (`max-width`, `margin-inline`, `padding-inline`).
- The content edge should align visually with the normal page content / product
  grid edge, not with the viewport edge.

---

## §2 Aspect ratio inference — evidence-first

Banner images MUST be generated at the ratio the section actually renders at,
not at a default. Since the sub-agent does not call `image_generate` directly
(§3), you express the ratio decision through `pending_image_generation.
suggested_aspect_ratio` + `surface_files_for_aspect_inference` so the main
Agent can re-derive it independently.

**Procedure** (run BEFORE returning `pending_image_generation`):

1. Identify the section's `.liquid` file (e.g. `sections/image-banner.liquid`).
2. Identify every stylesheet that scopes the section: section-specific CSS
   (`assets/section-image-banner.css`), the base stylesheet (`assets/base.css`),
   and `assets/theme.scss.liquid` if present.
3. Grep those files for `aspect-ratio:` / `min-height:` / `object-fit:` /
   explicit width×height attributes.
4. Pick the ratio by this table (matches `image_generate`'s enum):

   | CSS / Liquid signal | aspect_ratio |
   |---|---|
   | `aspect-ratio: 16/9` or explicit `1920×1080` / `2400×1350` | `16:9` |
   | `aspect-ratio: 3/2` | `3:2` |
   | `aspect-ratio: 1/1` | `1:1` |
   | `aspect-ratio: 4/3` | `4:3` |
   | `min-height: 70vh+` AND `object-fit: cover` AND no fixed aspect-ratio (first-screen hero) | `16:9` |
   | Section exposes a separate `image_mobile` / `mobile_image` slot | request TWO images — desktop `16:9` + mobile `9:16` |
   | Slideshow / carousel | resolve per-slide individually; if all slides share the same container, one ratio for all |
   | Nothing matches | do NOT guess. Return `pending_image_generation` with `suggested_aspect_ratio: null` and put the relevant files in `surface_files_for_aspect_inference`; let the main Agent decide (it has Hard Rule #9 + may `ask_user`). |

5. Quote the evidence line in `pending_image_generation.suggested_prompt_hint`
   so the main Agent can verify, e.g.
   `"section image-banner.liquid + assets/section-image-banner.css: min-height: 74vh; object-fit: cover; no fixed aspect-ratio → suggested 16:9"`.

If you authored the section yourself (added the CSS in this same session),
your suggestion is high-confidence — say so. If you're working against a
pre-existing third-party theme section, mark it as `inferred`.

---

## §3 Image source policy (what to do when an image is needed)

**The sub-agent does NOT call `image_generate` / `image_edit`.** That is a
deliberate plugin Hard Rule #9 constraint: the main Agent owns image policy
because image choices need user-visible decisions (supplier original vs
regenerate vs add logo vs style change). Sub-agents may `ask_user` only for
execution-blocking inputs such as a storefront password; they must not ask for
subjective image-source or style decisions.

Your responsibility on the image-source question is to **make the request
fully decidable** in one main-Agent turn. For every banner image you need,
return a `pending_image_generation` entry with these fields:

| Field | Required | Content |
|---|---|---|
| `surface` | yes | matches the brief surface phrasing, e.g. `"homepage hero banner"` |
| `intent` | yes | one-line purpose: `"first-screen hero for the FW25 collection landing"` |
| `suggested_prompt_hint` | yes | half-sentence describing subject + setting + mood, plus the aspect-evidence quote from §2 |
| `suggested_aspect_ratio` | yes (null if §2 step 5) | one of the `image_generate` enum values, or `null` |
| `surface_files_for_aspect_inference` | yes (always) | array of file paths the main Agent must grep to re-derive ratio; must include the section's `.liquid` + section-CSS + base-CSS |
| `logo_handling_hint` | yes | one of `remove_default` / `keep_existing` / `apply_store_brand` — see logo subsection below |
| `dedupe_namespace` | yes | always `"product_and_banner_shared"` — see dedupe subsection below |
| `reference_image_url` | optional | if the brief or brand_guide supplied a reference (e.g. supplier hero shot, prior season banner), pass the URL through |
| `notes_for_main_agent` | optional | anything the main Agent should know but can't derive — e.g. `"section also exposes image_mobile slot; please request a 9:16 pair"` |

### §3.1 Logo policy (mirror of `dtc-builder/.../image-discipline.md` A3, banner edition)

Default `logo_handling_hint = "remove_default"`. Exceptions (set
`"keep_existing"` or `"apply_store_brand"` instead) only when:

1. The brief explicitly says to keep / add a brand mark.
2. The `brand_guide` provides a logo URL and the banner is a brand-introduction
   surface (about page hero, homepage if the brand is the product).

When in doubt, default. The main Agent will route through
`image_edit` `task_type: "watermark_removal"` before downstream use.

### §3.2 Dedupe namespace (banners + product covers share one pool)

Banner imagery lives in the **same `used_image_urls` set as product covers**
(this is `image-discipline.md` A1 / §B speaking — banner-and-product share one
namespace, not separate ones). The sub-agent does not maintain this set
(it's main-Agent state), but you MUST flag it so the main Agent enforces it:

- Always set `dedupe_namespace: "product_and_banner_shared"` on every
  `pending_image_generation` entry from this sub-agent.
- If the brief already supplied a specific image URL to embed (e.g. brand
  asset), include it in the complete theme-file change set AND note the URL
  in your return so the main Agent can add it to the dedupe set.
- Do NOT pick a URL from the product cover pool yourself, even if it
  visually fits — let the main Agent decide what's shared vs unique.

---

## §4 Server-side render verification (banner-specific)

The sub-agent's general verify contract (re-read sub-agent prompt § Scope
step 4) requires server-side grep after every theme deployment. Banner surfaces
have extra grep targets because the visible payload is structured:

| Banner surface | Grep these in the fetched admin-preview HTML |
|---|---|
| Hero / image-banner | (a) the `heading` text verbatim; (b) the `button_label` text; (c) the `src=` URL ending of the desktop image (last path segment); (d) if mobile slot present, the mobile image URL ending too |
| Announcement bar | the announcement text verbatim |
| Image with text | heading + text body first 30 chars + image src ending |
| Slideshow | for EACH slide: heading + image src ending |

Each grep result goes into `verified_rendering[]` as a separate row —
`pass: true` only when the snippet was actually found. Do NOT collapse multi-
slide slideshows into one row.

Also count rendered banner/hero instances and compare to the expected template
state. Use the most specific selectors available for the authored section, then
fallback candidates when needed:

```js
[
  ...document.querySelectorAll('.brand-hero, .pawlick-hero, [data-section-type="hero"], .hero, .image-banner')
].length
```

For generic selectors, inspect matches before trusting the count; `.hero` can
appear in unrelated CSS/markup. Record the selector used, actual count, expected
count, and screenshot path. A page with no `Liquid error` but two first-screen
hero sections is a failed banner deployment.

**Forbidden verification path** (same as general contract, restated because
banners are the surface most often tested wrong): do NOT fetch the public
storefront root `https://<store_handle>/` and grep — trial / password-
protected stores return the password challenge HTML with HTTP 200 and a
naive grep silently misses your content. Always use
`https://<store_handle>/?preview_theme_id=<dev_theme_id>`.

---

## §5 Deliverable contract for banner work

When the brief contains one or more banner surfaces, your structured report
(per sub-agent prompt § Scope step 5) MUST include:

- `verified_rendering[]` rows for every banner surface, with the §4 grep
  results.
- `template_instance_diff` with the §1.0 before/after order, added/removed
  section IDs, expected banner count, and rendered banner count.
- `pending_image_generation[]` rows for every banner needing a new image,
  with all §3 fields populated.
- `changed_files[]` entries for the section `.liquid`, the section CSS, AND
  the owning `templates/*.json` if you added/replaced/removed the section
  instance. Include `config/settings_data.json` only when settings/app embeds
  were changed.
- `pending_main_agent_action` MUST NOT be `"publish"` if any banner has
  `verified_rendering.pass = false` or any unresolved
  `pending_image_generation` entry — instead use
  `"banner verification incomplete — see verified_rendering[] / pending_image_generation[]; do not publish yet"`.
