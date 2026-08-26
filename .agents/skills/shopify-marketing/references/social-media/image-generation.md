# Step 4 — Image Generation

Used by the `shopify-marketing` social-media track Step 4. Outputs saved as `marketing_images/*.png`.

> **Prompt-craft prerequisite** — before crafting any `image_edit` / `image_generate` prompt below, consult the **`image-generation-guide`** skill (alias `image-prompt-guide`) per plugin `prompt.md` Hard Rule #9. If it's not listed in `<available_skills>`, install via `skill({ action: "install", skill_id: "image-prompt-guide" })`. The plugin-specific rules in this file (lifestyle vs flat-lay routing, product-fidelity, `image_edit` over `image_generate` for the product itself) WIN on conflict; the guide provides reusable scene/composition patterns layered on top.

---

## 🚨 Step 0 — Ask the user FIRST (mandatory)

Before doing anything in this step, ask **once**, in the user's language, offering exactly these four options (re-render the labels in the user's language while keeping the A/B/C/D structure):

```
📸 How would you like to handle images for this post?

  A. Use the existing product page image
  B. I'll generate 1 lifestyle image for you  ★ recommended
  C. I'll generate 3 images for a carousel
  D. You'll provide your own (paste URL or local path)
```

Branch:
- **A** → skip image generation entirely; reuse the Shopify PDP featured image as the post image. Run `see_image` once to confirm it's usable, then prepare the final publish preview.
- **B** (default) → generate **1** lifestyle image by preserving the real product image and changing only the surrounding scene/background. Inspect the candidate with `see_image`; accept it only if it passes the Drift stop rule, then prepare the final publish preview.
- **C** → generate **3** images (Hook / detail / CTA) for carousel. Inspect each candidate with `see_image`; accept only the final 3 that pass the Drift stop rule.
- **D** → wait for user to supply image URL(s) or local paths. Run `see_image` to confirm, then prepare the final publish preview.

**Do NOT** generate extra "backup" images outside the chosen path. Candidate images may be inspected for fidelity, but rejected drafts must not be saved as deliverables, shown in the final publish preview, or published.

For a multi-slot Campaign, state the total image count before asking. If the option says “one lifestyle image for each of 3 posts,” selecting it commits the draft workflow to 3 accepted images; generating one image and silently substituting existing media for the other slots is not allowed. If only the current slot is in scope, say “one image for Day N” explicitly.

---

## Goal (when generating, i.e. branch B or C)

Generate **lifestyle** marketing imagery — NOT plain product-on-white shots (the Shopify PDP already has those). The lifestyle treatment may change the environment, lighting, crop, background, props, or overlay text, but it must not redraw the product itself.

---

## 🚨 Product Fidelity — HARD RULE

The marketing image MUST depict the **same physical product** the customer will receive — same product category/carrier, shape, color, material, markings, packaging, button placement, proportions, print/design placement, visible text/labels, and visible accessories. Never substitute, add, or remove product elements that don't exist in the Shopify product image or supplier listing.

Preserving a graphic motif is not enough. If the reference is a ceramic mug, bowl, plate, towel, tray, package, or any other carrier with artwork on it, the output must keep that exact carrier type and artwork placement. Do not transfer the dog/logo/pattern/text from the real SKU onto a different object such as a napkin, tray, bowl, cup, sign, package, or generic prop.

This rule decides which tool to use:

| Goal | Tool | Why |
|---|---|---|
| **Product itself must appear in shot** | `image_edit` with the actual Shopify product image as `reference_images`, instructed as a product-preserving composite / background-extension task | Pure text-to-image cannot reproduce a specific SKU faithfully, and unconstrained edits may redraw the product |
| **Pure background / atmosphere / lifestyle scene with NO product** | `image_generate` | Safe because it does not attempt to invent the SKU |
| **Background first, product added second** | `image_generate` for the product-free background, then `image_edit` to composite the real product reference without changing it | Preferred when direct lifestyle editing keeps changing the product |
| **Product photo + text overlay** | `image_edit` (reference = real product image, instruction = "add tagline …; do not alter the product pixels/identity") | Avoid drift |

> **Never** use `image_generate` to "draw" the product from scratch. It will hallucinate details and violate fidelity. If you need the product visible, the visible product must be derived from a real product reference. If `image_edit` changes the product identity, do not use that output.

### Drift stop rule

After every generated or edited candidate, compare it against the reference product image before it can enter the final publish preview. Reject the candidate if any of these changed:

- silhouette / outline / proportions
- physical product category / carrier / functional form (for example mug vs plate vs towel vs tray vs bowl)
- colorway, material, finish, texture, or transparency
- handles, rims, lids, seams, ports, straps, labels, markings, patterns, visible text, typography, print/design placement, logo-removal status
- package shape or included accessories
- count of items in a set or bundle

On rejection, retry at most once using the safer background-first composite path. If the second candidate still drifts, stop image generation for that post and use option **A** (existing product page image) or ask the user for a better source image. Do not publish a visually inconsistent product image.

---

## Recommended image types

### 1. Lifestyle Scene — product-preserving composite
- Aspect ratio: **4:5** (Instagram), **16:9** (Twitter)
- Soft, warm, inviting lighting; aspirational but attainable
- Reference image: the Shopify featured image
- Preferred method: keep the product from the reference image intact; extend or replace only the background / setting. The product artwork may not be copied onto a different carrier.
- Prompt example:
  > "Create a warm lifestyle scene around the referenced product. Preserve the product's exact physical object type, silhouette, proportions, color, material, handles/rims/edges, print placement, visible text, markings, packaging, and visible details. Change only the surrounding background, lighting, props, and crop. Do not redraw, redesign, simplify, substitute, or transfer the artwork onto another object."

### 2. Flat-Lay / Overhead — product-preserving composite
- Aspect ratio: **1:1** (Instagram)
- Reference image: real product image
- Prompt example:
  > "Compose the referenced product into a stylish overhead flat-lay on a linen surface with complementary props. Preserve the product exactly: same physical object type, shape, proportions, color, material, handles/rims/edges, print placement, visible text, markings, packaging, and visible details. Do not alter the product or place its artwork on a different object."

### 3. Product-in-Context with Subtle Brand Overlay — `image_edit`
- Aspect ratio: **4:5**
- Reference image: real product image
- Add tagline overlay (never a hard sales claim, never fake review stars). The overlay may not cover or obscure identifying product details needed for fidelity checking.

---

## Workflow

1. Generate the number of images dictated by the user's Step 0 choice: **B → 1 image, C → 3 images**. Do not generate more "for variety".
2. For each image where the product appears, use the single Generation reference image from `product_details.md` as the identity reference. If the Shopify images show a family of different physical products, variants, or bundle items, do not blend them; promote exactly the selected reference product or ask the user which item/image to use.
3. Run `see_image` on every candidate needed for fidelity acceptance and compare visible labels/wordmarks character-for-character. Discarded drafts may be inspected, but they must not be saved as deliverables or included in the final publish preview. A generated image with malformed branding cannot be described as “100% preserved.”
4. Apply the Drift stop rule against the reference image. If the generated product looks wrong (different shape / color / extra element), reject it, retry once with the safer background-first composite path, or fall back to the original Shopify PDP image.
5. Save only accepted images under `social-media-campaigns/<date>-<product>/marketing_images/` so the user can reuse.
6. Do not publish from this step. Return the final candidate image URL(s) to the social-media track, which must show the full post preview and wait for explicit publish confirmation before Step 5.

---

## Aspect ratio cheat-sheet

| Platform | Format | Ratio |
|---|---|---|
| Instagram feed (single) | Portrait | 4:5 |
| Instagram feed (square) | Square | 1:1 |
| Instagram story / reel | Portrait | 9:16 |
| Twitter / X inline image | Landscape | 16:9 |
| Twitter / X card | Landscape | 1.91:1 (≈ 16:9 works) |
