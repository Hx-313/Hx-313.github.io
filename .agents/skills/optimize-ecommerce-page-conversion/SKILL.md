---
name: optimize-ecommerce-page-conversion
description: Diagnose and fix Shopify page conversion problems — Home, Collection, Product Detail Page (PDP), and Promo Landing Pages. Use when traffic is healthy but conversion rate (CR), add-to-cart rate, or cart-to-checkout rate is below industry benchmark, or before launching a paid campaign so the landing page is ready. Triggers — "conversion rate", "CR", "ATC", "cart-to-checkout", "high bounce", "abandoned cart", "fix product page", "campaign landing page", "CRO".
---

# Optimize Ecommerce Page Conversion

Conversion Rate Optimization (CRO) for Shopify storefronts. Goal: increase the share of visitors who Add-to-Cart and complete checkout, using benchmark-driven page diagnostics + Shopify-specific fixes.

## Prerequisite — analytics must be installed

CRO is data-driven. Without Shopify Analytics + (ideally) Microsoft Clarity, you cannot measure bounce rate, engagement time, cart-to-checkout drop-off, or mobile-vs-desktop CR — most diagnostic criteria below become guesswork.

If the user has not installed monitoring → route to `dtc-monitoring-and-daily-report` first to install Clarity, then return to this skill once 7 days of data has accumulated.

If the user insists on a diagnosis without analytics data, you may still review the page, but state clearly that this is a **heuristic structural review based on page layout and best practices, not a data-validated diagnosis** — its confidence is limited and findings must be confirmed with real data before acting on them.

## When to use this skill
- Store has steady traffic (≥ 500 sessions/week) but **CR is below 1.5%** (industry benchmark: 2.0–4.0%).
- Specific page type shows **bounce rate > 70%** (PDP) or **> 60%** (Home/Collection).
- About to launch a paid ads campaign and the landing page hasn't been audited.
- Cart-to-checkout drop-off > 50% (target: keep ≥ 50% reaching checkout).

## When NOT to use
- No traffic yet (< 100 sessions/week) → use `ecommerce-marketing` to drive traffic first; CRO needs data to test against.
- Traffic problem, not conversion problem → use `ecommerce-marketing` + `ecommerce-seo-optimizer`.
- Need a single-page SEO health diagnostic before deciding what to fix → use `seo-page-audit` first; it scores meta/content/technical/performance in 4 categories and tells you whether the bottleneck is SEO or conversion.
- Need AI-engine citation visibility → use `dtc-geo-optimizer`.
- A/B testing infrastructure setup → this skill recommends *what* to test; build the experiment in Shopify Markets/themes manually or via a third-party app (Convert, VWO).

## Industry benchmarks (cross-category reference, not a fixed target)
These are cross-category averages — actual healthy ranges vary widely by niche, price point, and traffic source (high-AOV / B2B / considered purchases run lower; impulse / low-price commodities run higher). Use them as a starting reference, but calibrate against the store's own historical baseline before calling any number a "problem".

| Metric | Healthy range | Crisis threshold |
|---|---|---|
| Overall conversion rate | 2.0% – 4.0% | < 1.0% |
| Mobile conversion rate | 60% of desktop | < 40% of desktop |
| Cart-to-checkout completion | ≥ 50% | < 30% |
| PDP bounce rate | < 50% | > 70% |
| Above-the-fold load (LCP) | < 2.5s | > 4s |
| Returning visitor CR | 2x first-time CR | < first-time CR |

Source for ranges: Shopify benchmark data (2024–2025), Baymard cart abandonment study, Google Web Vitals industry data.

## Page-specific frameworks

### 1. Home page — brand trust + navigation funnel
**Objective**: establish credibility within 3 seconds, route traffic to high-intent collection or product pages.

Diagnostic checklist:
- Hero communicates "what we sell + why us" without scrolling
- ≥ 1 social proof element above the fold (review average, "as featured in", trust badge)
- Lifestyle imagery showing products in use (not flat product shots)
- Primary CTA links to a top-selling collection or PDP (NOT to "Shop All")
- Mobile load < 3s LCP (Lighthouse audit)

### 2. Collection pages — discovery + filtering
**Objective**: minimize time-to-relevant-product.

Diagnostic checklist:
- Filters: at minimum Size, Color, Price, Availability — match what your category needs
- Consistent product photo treatment (all white background OR all lifestyle, never mixed)
- Quick-add-to-cart for low-consideration items (≤ \$30 commodities)
- Hover/secondary image (lifestyle ↔ product detail)
- Sort: "Best selling" default, not "Featured" (which is manual order — usually stale)

### 3. Product Detail Page (PDP) — the conversion engine
**Objective**: answer every objection a buyer has and trigger Add-to-Cart.

PDP is where 80% of CRO gains live. Diagnostic checklist:
- **Hero image**: zoomable, ≥ 5 angles, includes a scale reference (hand/room context)
- **Price + value stack**: shipping cost shown above fold, free-ship threshold visible if active
- **Add-to-Cart button**: high-contrast color (NOT the theme primary), sticky on mobile, label tested ("Add to Cart" usually beats "Buy Now" on commodity, opposite on impulse)
- **Reviews**: 4.5+ stars average, visible review count, photo reviews if possible. Use Judge.me / Loox for collection.
- **Urgency / scarcity**: real inventory ("Only 3 left") — never fake counters
- **Trust block** near ATC: shipping/return policy summary, payment methods (Shop Pay, Klarna), security badge
- **Cross-sell** below the fold (NOT above it — never compete with ATC for attention)

### 4. Promotional landing pages — single-focus conversion
**Objective**: one offer, one decision.

Diagnostic checklist:
- Headline matches the ad copy word-for-word (message match)
- Header navigation removed or minimized (reduce escape paths)
- Tiered offer visualization (e.g. Buy 2 Get 1, with savings stacked)
- Countdown timer if the offer is genuinely time-limited (NEVER fake)
- ONE CTA, repeated 2–3 times down the page
- Below the fold: testimonials specific to the offer, FAQ addressing top objections

## Execution chain — when an audit recommends a Shopify change

> **Tip**: if you haven't yet diagnosed where the page is weakest, run `seo-page-audit` first — it scores 4 categories (meta / content / technical / performance) and pinpoints the bottleneck before you start fixing conversion.

This skill diagnoses; the fix runs through the standard chain:
1. **Theme/Liquid changes** (custom sections, sticky ATC, hero rebuild) → send the confirmed business/design outcome and evidence to `shopify-theme-decorator`; it discovers the actual theme surface, selects its skill-backed write and verification path, and returns a preview for `shopify-storefront-validate`
2. **Product or Collection core copy/SEO fields** → route the confirmed Product or Collection envelope to the shared `shopify-product-editor`; it selects the domain Skill and execution mechanism
3. **Metafield/Metaobject-backed trust content, size charts, or material specifications** → `shopify-custom-data` first for domain design, then Main Agent Route C through `shopify-admin` and `shopify-use-shopify-cli`; the Product/Collection executor does not own these writes
4. **Image swaps** (hero image, lifestyle photos) → consult **`image-generation-guide`** (alias `image-prompt-guide`) per plugin `prompt.md` Hard Rule #9 for prompt patterns, then `image_generate` / `image_edit` for assets, then upload via `shopify-use-shopify-cli` `fileCreate`
5. **Reviews onboarding** → recommend Judge.me (free) or Loox (paid), set up via Shopify Admin UI

Never recommend a fix without specifying which skill executes it.

## A/B test ideas (quick reference)
The hypotheses below are directional patterns observed across stores, **not predictions for this specific store**. Treat each as a test to run, not a guaranteed outcome — only the store's own A/B result is conclusive.

| Test | Hypothesis | Effort |
|---|---|---|
| Lifestyle vs studio hero | Lifestyle may drive higher CR for non-utility goods | Low |
| ATC label: "Add to Cart" vs "Buy Now" | "Buy Now" tends to win on impulse goods, "Add to Cart" on commodity | Low |
| Reviews above vs below ATC | Above tends to win for new brands, below for known brands | Medium |
| Free shipping threshold \$50 vs \$75 | Higher threshold may lift AOV without hurting CR if delta < 30% of basket | Medium |
| Sticky ATC on mobile vs static | Sticky often helps mobile CR on long PDPs (> 1500px tall) | Low |

A/B test setup itself is out of scope for this skill — recommend the test, then implement in Shopify Markets, theme branching, or third-party tool.

## Output contract
When invoked, deliver:
1. **Page audit table** — current state vs benchmark for every checklist item
2. **Critical issues** (red) — fix first; note the estimated CR impact as directional only (validate with the store's own data)
3. **Optimization opportunities** (yellow) — fix when capacity allows
4. **Top 3 A/B test recommendations** — hypothesis + estimated lift (directional; confirm via the store's own A/B test)
5. **Execution handoff** — which skill runs each fix

Save the audit to `project/cro/audit-YYYY-MM-DD-<page-handle>.md`.
