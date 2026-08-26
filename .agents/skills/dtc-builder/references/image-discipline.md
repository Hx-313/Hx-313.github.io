# Image discipline (cross-cutting policy injected into every delegation)

When this orchestrator hands approved product or theme assets to an owning executor, it MUST include the applicable business constraints below without prescribing an API, script, field location, or implementation sequence. These are cross-stage setup policies; executor Skills may add stricter media rules.

> **Prompt-craft prerequisite** — for any delegated `image_generate` / `image_edit` call, also inject the requirement to consult the **`image-generation-guide`** skill (alias `image-prompt-guide`) first per plugin `prompt.md` Hard Rule #9. Install via `skill({ action: "install", skill_id: "image-prompt-guide" })` if missing from `<available_skills>`. The rules in THIS file (dedupe, single-reference anchor, default logo-removal, visual consistency) WIN on conflict; the guide layers reusable composition / lighting / product-photography patterns on top.

## A. Product image rules

### A-1. Listing-batch media consistency gate — BEFORE product creation

Product cover-image consistency is owned by the **selection/listing preparation stage**, not by theme decoration. Theme CSS can normalize containers later, but it cannot fix inconsistent subject scale, supplier-image whitespace, watermarks, or mixed white-background/lifestyle/collage covers.

Before delegating any product `create` brief to `shopify-product-editor`, the main Agent MUST resolve a launch-batch media plan:

1. Inspect the actual cover/reference image for every SKU in the listing batch.
2. Infer or ask for **one batch cover aspect ratio** from evidence: the actual image set, the intended surfaces (collection card, homepage card, PDP main image), and the brand direction. Do **not** hardcode `1:1` or `4:5` as a universal default.
3. For each SKU, classify cover media readiness:
   - `ready`: image already matches the batch ratio and subject scale.
   - `needs_editing`: image is usable but needs crop, canvas extension, background cleanup, watermark removal, or subject-scale normalization.
   - `poor`: acceptable for sourcing evidence but not launch-ready.
   - `reject_risk`: watermarked/collage/low-res/misleading image; avoid first-batch listing unless replacement media exists.
4. If any SKU is `needs_editing`, ask the user whether to normalize images before listing or create drafts with supplier originals and a `media_pending` note. Do not silently mix inconsistent cover styles in a published batch.
5. Include the resolved context in every product-create brief without turning it into Shopify write fields:
   - item-level `media_plan.batch_cover_aspect_ratio`
   - item-level `media_plan.decision_source`
   - optional per-media metadata: `cover_image_role`, `media_readiness`
   - `media_normalization_action`: `none` | `crop_canvas` | `white_background` | `watermark_removal` | `replace_later`

Use theme-side Catalog card CSS only as a fallback for existing products or emergency visual repair. For new products, fix the media before listing whenever possible.

### A-0.9 Same-product gallery rule — before any upload

All media for one product listing must depict the same physical product the merchant confirms will be sold. This is a product-fidelity check, not a supplier-provenance audit: merchant confirmation is sufficient, and no marketplace URL, product id, or external source verification is required.

Allowed sources for a product gallery:

- merchant-approved supplier/search images
- user-provided images for the exact SKU
- AI-edited/generated derivatives that use a merchant-approved product image as the anchor/reference

Forbidden:

- knowingly combining images that visibly or explicitly depict different products, variants, materials, markings, packaging, or bundle counts
- treating visual similarity alone as proof after the merchant says the images represent different goods
- using independent prompt-only `image_generate` outputs as gallery slots for the same product

If the approved product media set has too few images, do NOT fill gaps with images known to depict another product. Choose one of:

1. list with fewer same-product images,
2. ask the user for exact-SKU images,
3. use `image_edit` from a merchant-approved product anchor to create additional scene/angle/lifestyle variants,
4. create a draft with `media_pending`, or
5. switch product.

Supplier/source provenance fields are optional operational context in every downstream product-create brief. Retain them when the user or a tool supplies them, but never require, infer, externally verify, or compare them. Missing, incomplete, or differing provenance metadata must not block creation, media upload, publication, or launch readiness. Never fabricate optional values.

### A0. Batch approval — `ask_user` before any product `image_generate`

Every `image_generate` whose output will land on a product page (main / gallery / lifestyle) or a collection card MUST be gated by an `ask_user` form. Banners / social / email creatives are NOT covered here — see §B and the lighter style-confirm protocol there.

**When**: once you have assembled the launch batch and resolved any usable supplier / reference images, but BEFORE the first `image_generate` call of the batch.

**How** — single `ask_user` form, one question per SKU (or one consolidated question if the batch fits ≤4 rows in one slot). Each row shows:

| SKU / handle | Slot | Prompt summary (≤1 line) | Aspect | Reference image (URL or "(none)") |
|---|---|---|---|---|
| `wireless-headphone-blue` | main | "side view, white background, no logo" | 1:1 | supplier_url_1 |
| `wireless-headphone-blue` | gallery-2 | "45° angle, same color, same materials, no logo" | 1:1 | supplier_url_1 (anchor) |
| `wireless-headphone-blue` | lifestyle | "on minimalist desk, daylight" | 4:5 | supplier_url_1 (anchor) |
| `usb-c-cable-2m` | main | "coiled, white background, no logo" | 1:1 | supplier_url_3 |

Form options should be **multi-select** so the user can approve / drop specific rows. Default-recommend ✨ "Approve all".

**After approval**: generate only approved rows. Apply A1 (dedupe), A2 (anchor reference), A3 (logo default-remove) on each call. Cite the approval line in chat before each `image_generate`, e.g. `approved: wireless-headphone-blue / main / 1:1`.

**Single-image re-do after delivery**: counts as one fresh `ask_user` (lightweight — show only the regenerated prompt + aspect for that one row). Do NOT batch re-dos silently under the original approval.

**Skip cases** (no `ask_user` required):
- Pure `image_edit` with `task_type: "watermark_removal"` on a supplier image (mechanical, no creative decision).
- `image_edit` re-do of an already-approved generated image with the user's verbatim correction instruction in the same turn.

### A0.5. Product identity drift stop — before any product media upload

Every generated or edited image whose output will land on a product page, gallery, collection card, or product feed must pass a product-identity check before it can be handed to `shopify-product-editor`.

Use the best available reference in this order:
1. The real supplier / Shopify product image after any approved mechanical cleanup.
2. The user-approved baseline anchor image for that product.
3. A user-supplied reference image for the exact SKU.

Reject the candidate if any of these changed from the reference / anchor:
- silhouette, outline, scale, or proportions
- physical product category / carrier / functional form, such as mug vs plate vs towel vs tray vs bowl
- colorway, material, finish, texture, or transparency
- handles, rims, lids, seams, ports, straps, labels, markings, patterns, visible text, typography, print/design placement, or logo-removal status
- package shape, included accessories, or bundle/set item count
- shopper-relevant feature placement, such as face/ear/button placement on character or electronic products

Preserving only the printed artwork / mascot / logo is not enough. Do not move a design from the real product onto another carrier type, for example turning a mug graphic into a towel, tray, bowl, plate, package, or generic prop.

On rejection, retry at most once from the same reference / anchor with a stricter product-preserving `image_edit` prompt that changes only background, canvas, crop, lighting, props, or scene. If the retry still drifts, do not upload the generated/edited image. Use the original supplier/reference image, create the product as draft with `media_pending`, or ask the user for a better exact-SKU source image.

### A1. No duplicate images across products
- Maintain a `used_image_urls` set across the whole launch batch.
- When delegating product creation to `shopify-product-editor`, pass the dedupe set as a business constraint so the executor refuses any image URL already used on a previous SKU in this session. Do not prescribe its script, mutation, or media-field placement.
- Each product must have a visually distinct cover image.
- Within a single product, the `images[]` array must also be unique (no repeated URLs across cover + gallery slots).

### A2. Same-product visual consistency (multi-slot images for one SKU)

**Never generate a multi-image set for the same product as independent prompt-only `image_generate` calls.** Five slots (main / flat-lay / top view / gift box / hand-held, etc.) must not be five unrelated text-to-image jobs, even if the prompts repeat the same product name. Text prompts do not lock identity; ears, face shape, material sheen, button placement, color tone, and proportions will drift.

Use this sequence instead:

1. **Choose or create one identity anchor per product.** Prefer a real supplier/reference image after watermark removal. If no usable reference exists and the user has approved AI product imagery, generate exactly **one** baseline hero shot first.
2. **Freeze the product identity from that anchor.** Write the invariant attributes once: physical product category/carrier, color, material, shape, dimensions/proportions, handles/rims/lids/edges, decorative parts, visible text, print/design placement, face/ear/button placement, accessories, logo-removal status.
3. **Derive every other slot from the anchor.** Use `image_edit` with the same anchor in `reference_images` for each subsequent scene / angle / lifestyle slot. Only scene, angle, lighting, background, hand/model, packaging, or context may change — never the product itself.
4. **If a tool only supports `image_generate`, stop and ask for a different route.** Do not silently run independent generations for the same SKU. Either use the baseline image as a reference via an editing/composition route, or create only the baseline and report `additional_slots_pending_consistency_reference`.
5. **Run the A0.5 product identity drift stop after generation.** Compare silhouette, key dimensions, material/reflection, colors, decorative details, and front-facing features across all slots. Reject any drifting slot before delegating to upload.

Allowed exceptions:
- Different colorway / SKU intentionally needs a different anchor.
- User explicitly requests concept variations rather than one consistent product listing set — label outputs as concepts, not as final product gallery images.

Prompt rule: lock identity attributes in every derived prompt, and state the anchor source, e.g. `anchor: baseline hero image URL <...>; preserve identical physical carrier, bunny face, ear proportions, white matte plastic, pink cheek dots; change only scene to hand-held lifestyle shot`.

### A3. Logo policy (default = remove)
- Default: append `"remove all logos, watermarks, and brand text from the product"` to every `image_generate` / `image_edit` prompt.
- Exceptions where logos may be kept:
  1. The user has explicitly asked to retain the logo (e.g. "keep the logo", "don't remove the brand").
  2. The logo on the supplier image already matches the merchant's own store brand (cross-check against the store name / vendor / brand resolved during authentication). When in doubt, remove.
- For supplier reference images that contain a logo and you are NOT keeping it, route through `image_edit` with `task_type: "watermark_removal"` first, then use the cleaned output downstream.

## B. Banner / hero / theme-asset image rules

Banner-image craft is owned by the `shopify-theme-decorator` sub-agent. See `skills/shopify-theme-craft/references/banner-playbook.md` §3 for the full policy (logo handling, dedupe namespace, `pending_image_generation` request shape).

Two invariants kept here because they belong to **this** orchestrator's cross-cutting layer (banner + product live in one image pool):

- **Shared dedupe namespace** — banners and product covers MUST share the same `used_image_urls` set from A1. When the sub-agent returns a `pending_image_generation` with `dedupe_namespace: "product_and_banner_shared"`, this orchestrator enforces that the URL the main Agent eventually picks (or generates) is not already in the set, and adds the new URL on success.
- **Logo policy mirrors A3** — the default `remove_default` from A3 applies to banner imagery too; exceptions and the exception list live in `banner-playbook.md` §3.1.

> **These constraints are non-negotiable and apply across every executor handoff** — even if the executor skill itself doesn't enforce them, this orchestrator does, and an executor that returns a violation must trigger a regenerate-and-retry, not a silent pass-through.
