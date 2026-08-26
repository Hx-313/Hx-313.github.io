# Store quality self-check (agent internal)

> 🔴 **R3 hard rule**: this checklist is an **internal diagnostic tool for the agent**, **not a gate**. A low score **cannot** block any user flow. Scores / dimension names / deductions **never appear in user-facing messages**. The only thing the agent is allowed to do: include **at most one** improvement tip in a reply that was already going out.

## Six dimensions (run silently)

| Dimension | Check |
|---|---|
| 1. Homepage readability | Hero present / featured collection ≥ 1 / USP row ≥ 1 |
| 2. Navigation usability | Main nav ≤ 5 items / footer has contact info |
| 3. Product completeness | Each SKU has ≥ 3 images + an approved product description ≥ 100 chars |
| 4. SEO coverage | Each SKU has seo.title + seo.description + image alt |
| 5. Legal compliance | **Base (all geos)**: Refund / Privacy / Terms / Shipping — 4 pages present. **EU/UK additions (mandatory)**: Imprint (Impressum in DE) under §5 TMG + Right of Withdrawal (14-day cooling-off) under EU Consumer Rights Directive + GDPR cookie consent banner enabled (Settings → Customer Privacy → Cookie banner) |
| 6. Payment & shipping | At least 1 payment method + 1 shipping zone |

## When you find a gap

If a SKU has only 1 image, drop a single tip into the next outgoing reply:

> "By the way — Cooling Globe only has 1 image; adding 2-3 angle shots would improve conversion."

## Strictly forbidden

- ❌ A standalone "store quality report" / "score: X" / itemized deductions
- ❌ "Wait until you finish the images before publishing" (using a low score to block flow)
- ❌ Stacking ≥ 2 tips in a single reply
- ❌ Exposing meta concepts: "dimension", "check item", "score", "checklist"
