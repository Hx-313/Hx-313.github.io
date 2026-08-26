# Step 3 — Content Templates

Used by the `shopify-marketing` social-media track Step 3. Outputs saved as `caption_ig.txt` and `tweet_x.txt` (see `templates/social-media/`).

---

## Principles

- **Pain-point-driven** — every post addresses a specific pain point from `audience_research.md` (use a verbatim quote in the hook when possible).
- **Platform-native** — never reuse the same copy verbatim on IG and X.
- **Traffic-driving** — X may use a verified Shopify product URL. Instagram Feed captions should default to link-in-bio / product-tag / Story-link wording because caption URLs are non-clickable; never tell users to “click the link below.”
- **Authentic tone** — write like a real person, not a brand.
- **Brand voice from MEMORY** — if the store has an established voice (e.g., "ethereal, calming, beginner-friendly"), match it. Otherwise infer from `productType` + `tags` and confirm with the user.
- **Evidence-bound** — keep a claim ledger while drafting. Numeric/unit, price, discount, certification, warranty, delivery-time, scarcity, and performance claims need an exact Shopify/public/merchant source before they may appear.

---

## Instagram caption — structure

```
HOOK     → first line stops the scroll, addresses a pain point (verbatim quote OK)
BODY     → product benefits that solve the pain point
           "what's included" / key features / variants
CTA      → "Shop via the link in bio" / product tag / Story link
HASHTAGS → a focused set of relevant hashtags
ATTRIBUTION (optional, last line) → see "Attribution" section
```

**IG hard rules:**
- Caption ≤ 2,200 chars
- Write `#` directly — **do NOT** encode as `%23` (the IG tool docs say to encode; that is wrong and will break the hashtag)
- Use `\n` for newlines in JSON payloads
- Instagram caption URLs are generally not clickable. If the goal is click-through traffic, phrase CTA as link-in-bio / product tag / story link / ad CTA rather than relying on a bare caption URL. A bare caption URL or “click below” CTA must produce a preflight warning.
- Do not use area, weight, dimensions, delivery time, warranty, certification, discount, or scarcity merely because it sounds persuasive. Copy the exact supported claim into the preflight claim ledger and cite its source.

---

## Twitter / X tweet — structure

```
HOOK         → pain-point question or bold statement
SOLUTION     → product benefit in 1–2 lines
OFFER        → price + Shopify product URL
ATTRIBUTION  → optional, must be last line of text
IMAGE URL    → see references/social-media/publish-twitter.md for native vs Imgur path
```

**X hard rules:**
- Tweet text ≤ 280 chars
- Each URL ≈ 23 chars; if both Shopify URL and image URL are present, that's ~46 chars consumed
- Keep written copy ≤ ~200 chars
- Single tweet only — no threads
- No `\n\n\n` triple breaks — Twitter collapses them

---

## Attribution tagline — DO NOT ADD

Do **not** append any agent-added attribution, promotional tagline, or "posted by" line to captions or tweets — including but not limited to `@Accio_b2b`, `@Accio_official`, `#MyAccioWorks`, `#VibeSellingChallenge`, "This post wrote itself", or any equivalent. Captions belong to the user; the agent must not silently insert promotional credit.

**Override** (rare): only if the user explicitly asks in the current turn (e.g. "add the Accio tagline this time"), include the exact phrasing they request. Otherwise default = clean caption with zero agent attribution.

---

## Content angle templates

### 1 — Pain Point Attack
```
IG: "Tired of <pain point>? Meet <product>. <benefit 1>, <benefit 2>, <benefit 3>. Shop via the link in bio."
X:  "<Pain point question>? Try <product>. <key benefit>. $XX <shop link>"
```

### 2 — Lifestyle Aspiration
```
IG: "Your <space/ritual> deserves better. <Product> brings <transformation>. <Features>. Shop via the link in bio."
X:  "Upgrade your <space/ritual>. <Product>: <benefit>. $XX <shop link>"
```

### 3 — Comparison / Switch
```
IG: "Still using <inferior alternative>? Here's why <product> is better: <reasons>. See the product via the link in bio."
X:  "<Inferior alt> vs <product>: <key difference>. $XX <shop link>"
```

### 4 — First-Person Story (Shopify-friendly)
> Shopify owners often run small / personal brands → first-person stories convert well.
```
IG: "I built <store> because <origin pain>. <Product> is what I wish I'd had when <scenario>. Details via the link in bio."
X:  "<Origin story in 1 line>. That's why I made <product>. $XX <shop link>"
```

---

## Character budget (X with image)

| Element | Approx chars |
|---|---|
| Imgur / image URL | 23 |
| Shopify URL | 23 (consider short URL if domain is long) |
| Optional attribution | 55 |
| **Remaining for hook + offer** | **~180** |
