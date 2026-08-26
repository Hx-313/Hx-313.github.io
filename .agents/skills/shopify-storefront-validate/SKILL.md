---
name: shopify-storefront-validate
description: Shopify storefront/theme validation protocol. Use when an assistant or auditor must verify a Shopify dev-theme admin preview (`?preview_theme_id=`), post-publish live storefront, or pre-launch store readiness: theme structure, Theme Check, admin-preview rendering, homepage/PDP/collection/cart checks, desktop/mobile screenshots, password-page blockers, responsive layout, and evidence-based blocking/warning/info reports. Verification goes through the server-side `?preview_theme_id=` URL. This skill is read-only by default; it does not author Liquid, upload products, authenticate Shopify, push theme files, or publish themes.
---

# Shopify Storefront Validate

## Core Rule

Validate with observable evidence before advancing a Shopify storefront/theme change. Record what was checked, what passed, what failed, and what remains unknown. This skill is read-only by default: do not push theme files, publish themes, create products, upload media, change inventory, or alter store settings.

## Validation Modes

Choose exactly one mode before checking:

| mode | Use when | Base URL |
|---|---|---|
| `admin_preview` | Publish-before-live validation of a dev/unpublished theme | `https://<store>?preview_theme_id=<dev_theme_id>` |
| `post_publish_live` | After `themePublish`, verify the live storefront now shows the intended theme/content | live primary domain |
| `pre_launch` | Whole-store launch readiness: products, policies, navigation, password page, payment/shipping/tax signals, buying path | live primary domain or password-bypassed storefront |
| `full_audit` | Deep read-only audit when current state is unknown | live primary domain plus Admin reads |

For `admin_preview`, never verify against the public `*.myshopify.com` root. Password-page HTML can return HTTP 200 and produce false confidence.

## Inputs To Record

- `store_domain`: `<store-domain>` or full `*.myshopify.com`.
- `mode`: one of the modes above.
- `theme_id`: dev theme for `admin_preview`, live theme for `post_publish_live`.
- `local_theme_path` when static checks are required.
- `preview_base_url` for `admin_preview`: `https://<store>?preview_theme_id=<dev_theme_id>`.
- `changed_surfaces`: homepage, PDP handle, collection handle, cart, navigation, password page, etc.
- `expected_section_counts` when known, especially for banner/hero work, e.g. `{ "homepage_hero_banner": 1 }`.
- `storefront_password`: only when the storefront is password protected and a live-domain check must bypass `/password`.

## Lightweight Published-Product Reachability

When Product publication verification needs only proof that the public PDP URL resolves, keep this smoke test narrower than theme/content validation:

1. Run it only after the owning Product publication read reports the confirmed Publication state. Do not pre-probe an expected DRAFT/unpublished 404 unless the merchant explicitly asked for a before/after comparison.
2. Start from one confirmed `*.myshopify.com/products/<handle>` URL and follow redirects. Do not fetch both that alias and the resulting primary-domain URL separately; the final URL is redirect evidence.
3. Prefer one `HEAD` request with an eight-second per-attempt timeout. If the origin rejects or blocks `HEAD`, make one bounded `GET` with the same timeout, stop after response headers, and cancel the response body rather than downloading the full page.
4. Record the method, original URL, final URL, redirect flag, HTTP status, and whether the response body was inspected. A final 2xx/3xx status proves reachability only. It does not prove the page is not a password page, contains the expected product, or renders correctly.
5. Use `shopify-product-management/scripts/probe_product_storefront.mjs` for this Product-specific smoke test. Continue with the normal render/browser workflow below when content or visual correctness is part of the success criteria.

Do not turn a successful status line followed by a cancelled or timed-out body transfer into a claim that the full page downloaded cleanly. Report the narrower evidence actually obtained.

## Admin Preview Contract

The main Agent verifies the dev theme through the admin `?preview_theme_id=` URL. This gate is main-Agent-owned and cannot be delegated to `shopify-theme-decorator`.

After `shopify-theme-decorator` returns `dev_theme_id`, and before any `theme push --allow-live` / `themePublish`, the main Agent must run this gate.

1. Build the preview URL (no server needed):

```
https://<store-domain>?preview_theme_id=<dev_theme_id>
```

Rules:

- This URL renders the dev theme server-side via Shopify — fetch it directly to verify.
- Auth and authorization are defined in `skills/aw-shopify-oauth/SKILL.md`; do not duplicate or improvise OAuth/scope handling here.
- Query `shop { passwordEnabled }` first. If `passwordEnabled == true`, the `?preview_theme_id=` URL returns the `/password` challenge and visual checks cannot run until the password is supplied. The runner may request the storefront password **only when it is execution-blocking**:
  - **Main Agent**: proactively `ask_user` for the storefront password as the FIRST action — do not silently skip verification or jump to "blocked". Concrete prompt: *"Your store is still password-protected, so I can't open the preview to check it visually. Please share the storefront password (Shopify admin → Online Store → Preferences → **Store access** → Password — the page at `https://admin.shopify.com/store/<your-store>/online_store/preferences`), or temporarily turn off password protection, and I'll verify the banner/decoration for you."* Then pass the password to the browser/fetch tool (request param / cookie the tool supports) to load the gated preview.
  - **Sub-agent** (`shopify-theme-decorator` / `shopify-store-auditor`): it MAY `ask_user` for this execution-blocking password directly. If it asks, it MUST include a `user_interactions` entry in the final report with the exact question and a redacted outcome (`provided_and_used` / `declined` / similar), so the Main Agent knows the password was requested and whether it was provided. Do NOT print the raw password in the report. If it chooses not to ask, set `storefront_password_needed: true` and return to the Main Agent.
  - Only if the user declines or cannot provide it: record `verified_rendering: pass=false, reason="password_page_returned"`, tell the user visual verification is blocked until the password is shared or protection is lifted, and do NOT claim the decoration is verified.
  - Never fall back to grepping the public storefront root to fake a pass.

2. Validate pages through the preview URL (append the path, keep `?preview_theme_id=`):
   - `/`
   - `/products/<changed-or-sampled-handle>`
   - `/collections/<changed-or-sampled-handle>` or `/collections/all`
   - `/cart` when buying-flow surfaces changed

   Each page must return HTTP 200, must not be a password page, and must contain the expected new content. If any check fails, return to `shopify-theme-decorator` with a narrow fix brief.

2.5. **For banner / hero / template work, verify section instances, not only files.**
   - Read or use the provided local copy of the owning template JSON (`templates/index.json` for homepage hero unless another template owns the surface).
   - Record the template `sections` keys, each relevant section `type`, and the `order` array.
   - Confirm the intended section instance exists and any replaced/default hero instance was removed from `order`.
   - Count rendered hero/banner candidates in the preview DOM and compare to `expected_section_counts` or the brief. Use specific selectors first (custom class / section id), then broader selectors only with manual inspection:

```js
[
  ...document.querySelectorAll('.brand-hero, .pawlick-hero, [data-section-type="hero"], .hero, .image-banner')
].length
```

   - Also count H1s when the hero owns the only homepage H1. More than one visible first-screen hero/H1 is a warning or blocker depending on intent.
   - Evidence must include: `template`, `order`, `expected_count`, `actual_dom_count`, selector used, and screenshot path when available.
   - Do not accept `document.body.innerText.includes('Liquid error') === false` as a banner pass. It only proves one error string is absent.

3. **Open the rendered preview in an actual browser and look at it — this is mandatory for any banner / hero / decoration work, not optional.** HTML grep proves a snippet exists in the markup; it does NOT prove the page *looks* right. You MUST drive the browser tool (spawn a `browser` sub-agent if you don't hold browser atoms yourself) to load the `?preview_theme_id=` URL, screenshot it at desktop `1920x1080` and mobile `390x844`, and visually inspect the screenshots. Capture screenshot paths and mobile `document.documentElement.scrollWidth` vs `window.innerWidth`. Answer EACH of these with evidence (cite the screenshot + what you saw):
   - **Image resolution / sharpness**: is the banner/hero image crisp, or visibly blurry / pixelated / upscaled-looking / low-DPI on the rendered page?
   - **Banner occlusion / overlap**: is any part of the banner image covered or obscured by overlapping text, buttons, badges, or another section? Is the key subject hidden behind an overlay or gradient?
   - **Button & CTA text alignment**: is button label text centered within the button (not off-center, clipped, wrapping awkwardly, or overflowing the button edge)? Are CTAs aligned as intended?
   - **Text legibility & contrast**: is heading/subheading/CTA text readable against the banner (not washed out, not colliding with a busy part of the image)?
   - **Content-edge alignment / flush-edge check**: does the hero/banner text block have a real horizontal inset from the viewport edge? It should visually align with the normal page content / product grid edge, not sit flush against the browser edge. Desktop text/content left offset should be clearly >0 (typically ≥32px unless the theme intentionally uses a full-bleed art direction); mobile should retain reasonable padding (typically ≥16px). A section that is flush-left but not overflowing still fails. Capture DOM evidence when possible: `document.querySelector('<hero content selector>').getBoundingClientRect().left` on desktop + mobile, plus screenshot paths.
   - **Empty-band**: is there visible whitespace where an image should fill its container?
   - **Subject-clipped**: is a product, face, heading, CTA, or price cropped or pushed off-frame?
   - **Mobile-overflow**: is there real horizontal scroll or visibly cut-off content?
   - **Mobile reflow**: on the `390x844` shot, does the banner still look intentional (text not overlapping the image subject, button still centered, image not stretched)?

   Do NOT claim the decoration "looks good" / "renders correctly" without these screenshots. A pass on HTML grep alone is `verified_rendering: file-level only` — say so explicitly; it is NOT a visual pass.

4. If a visual check fails, run at most two fix iterations:
   - Wrong image aspect: regenerate or replace the asset with the correct aspect ratio, then re-run validation.
   - Blurry / low-resolution image: replace with a higher-resolution asset (regenerate at the correct dimensions, or HD-upscale), then re-run.
   - Banner occlusion / overlap: ask `shopify-theme-decorator` to adjust z-index / section order / overlay opacity / text placement so the subject isn't covered.
   - Content-edge alignment / flush-edge failure: ask `shopify-theme-decorator` to fix the section container (`max-width`, `margin-inline:auto`, `padding-inline`, mobile padding). Do not accept a one-off `margin-left` on the heading/button as the durable fix.
   - Off-center or clipped button text: ask `shopify-theme-decorator` for the CSS fix (text-align, padding, button min-width, white-space).
   - Subject framing only: ask `shopify-theme-decorator` to adjust object-position / focal point.
   - Mobile overflow: ask `shopify-theme-decorator` for targeted mobile CSS fixes, text clamping, and route fixes.

5. Only after validation passes, show the user the `?preview_theme_id=` URL and wait for explicit approval before publish. Silence, emoji, "you decide", or "随便" is not approval.

## Static Theme Checks

Run when `local_theme_path` is available or when validating a changed theme:

1. Confirm expected files exist: `templates/*.json`, `sections/*.liquid`, `snippets/*`, `assets/*`, and relevant `config/*`.
2. Strip Shopify auto-generated JSON comment headers before parsing templates.
3. Confirm every template section `type` resolves to a real `sections/<type>.liquid` file.
4. Confirm Liquid asset references such as `{{ 'hero.png' | asset_url }}` resolve under `assets/`.
5. For banner/hero changes, confirm the owning template `order` contains exactly the intended banner/hero section IDs. If the intended result is one hero and `order` still contains both a native `hero`/`image-banner` instance and a custom hero instance, mark blocking.
6. Run Theme Check:

```bash
shopify theme check --path <local-theme-dir> --fail-level error --output json --no-color
```

`errorCount > 0` is blocking. Warnings introduced by the current change should be fixed or reported with evidence.

## Render Checks

Check real pages, not only files:

- Homepage: `/`
- PDP: `/products/<changed-or-sampled-handle>`
- Collection: `/collections/<changed-or-sampled-handle>` or `/collections/all`
- Cart: `/cart` when navigation, cart, product form, or buying path changed

For each page, record:

- HTTP status.
- Whether the response is a password page, 404, empty shell, or real storefront page.
- Expected content: section text, hero headline, product title, price, image URL/alt, Add to cart, navigation links.
- Expected vs actual hero/banner count when the page includes banner/hero changes.
- Evidence: short HTML excerpt, page metadata, CLI output line, or screenshot path.

## Visual Checks

Capture at least:

- Desktop: `1920x1080`
- Mobile: `390x844`

Inspect for:

- blank pages or empty bands where images should fill containers
- duplicate/default banner or hero sections that should have been removed
- clipped hero/product subject, CTA, heading, price, or Add to cart
- text overlap or button occlusion
- missing images
- password page instead of storefront
- unwanted horizontal scroll

For mobile overflow, record:

```js
document.documentElement.scrollWidth
window.innerWidth
```

If `scrollWidth > innerWidth`, identify the widest overflowing element unless it is an intentional off-canvas drawer or skip link.

## Store Readiness Checks

Use for `pre_launch` and `full_audit`:

- Products: ACTIVE products are published to Online Store and have media, price, variants, and inventory policy. Supplier/source metadata is optional supplemental context for every product and is never verified or treated as a readiness condition.
- Navigation: header/footer links resolve and expose the buying path.
- Policies: Privacy, Refund, Terms, Shipping, and any jurisdiction-required pages are present and not placeholders.
- Payment/shipping/tax: verify configured signals where available; report unknowns as not checked, not as pass.
- Password page: if still enabled before launch, mark as blocking unless the user explicitly intends to stay private.
- Markets/currency/locale: consistent with advertised regions.
- SEO/schema smoke: title/meta/schema exist on sampled pages; deeper SEO belongs to `shopify-page-auditor`.

## Result Format

Return findings as evidence-based records:

- `BLOCKING`: must fix before advancing or publishing.
- `WARN`: should fix soon, but not necessarily launch-blocking.
- `INFO`: useful observation or explicit not-checked item.

Each finding must include:

- `area`
- `finding`
- `evidence`
- `recommended_fix`
- `owner`: `main-agent`, `shopify-theme-decorator`, `shopify-product-editor`, `shopify-admin`, or `merchant`

Do not claim a check passed without evidence.

## Forbidden

- Do not push theme files, run `themeFilesUpsert`, or publish a theme.
- Do not edit live theme files.
- Do not use public storefront root as proof for an unpublished/dev theme.
- Do not treat `/password` HTML as a successful storefront render.
- Do not create products, upload media, change inventory, or alter policies.
- Do not ask the user for raw Admin API tokens.
- Do not leave browser or Playwright processes running after validation. The admin preview is a plain URL fetch.

## Weak Model Guardrails

- Fetch fresh theme/store state; do not trust memory.
- Record live theme ID, dev theme ID, preview URL, and base URL before checking.
- Keep `admin_preview` and `post_publish_live` separate.
- Verify both HTML and screenshots; one without the other is incomplete for theme work.
- Use targeted evidence. A generic "looks good" is not a validation result.
