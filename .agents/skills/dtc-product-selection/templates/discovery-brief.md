<!--
Template Instructions (Read by agent, delete all before output):
- This is the standard format for .workspace/_discovery-brief.md.
- If data is missing for any field, write "Not provided". DO NOT DELETE FIELDS—downstream skills (dtc-builder / monitoring) read by field names.
- Filename must strictly be `_discovery-brief.md`. Path = `project/.workspace/_discovery-brief.md`.
-->

# Discovery Brief

> Data Benchmark: YYYY-MM-DD | Written by dtc-product-selection skill | Read by downstream skills to identify buyer profile.

---

## Buyer Identity

- **buyer_level**: novice | pro    ← Required; determines tone of downstream skills.
- **Trigger Quote**: "{User's original quote}"
- **Classification Reasoning**: "{Reason for assigning this level}"

## Niche and Requirement Clarity

- **Request Type**: focused (specific item identified) | category (niche identified but no item) | blank (completely open)
- **General Direction**: {Home / Pet / Outdoor / Beauty / ...}
- **Specific Product Candidates**: {List if focused; otherwise "Not provided"}
- **Target ICP**: {Agent inferred; note "Agent Inference"}

## Resource Constraints

- **Currency**: USD | CAD | EUR | GBP | RMB | AUD | ...    ← Required; downstream templates use this to decide whether to display \$/€/£/CA\$/¥. **Default to seller's country currency**: US→USD, Canada→CAD, UK→GBP, EU→EUR, Australia→AUD, China→RMB. If unclear from context, ask once.
- **One-time startup capital**: {Amount + currency code, e.g. "\$3000 USD" / "CA\$4500" / "Not provided, defaults to seller-currency \$4,000"}
- **Monthly ad spend (recurring)**: {Amount + currency code, e.g. "\$500/mo USD" / "\$0 (organic-only)" / "Not provided"}
- **Geography**: {US-domestic / Canada / UK / EU / Australia / China cross-border / Other}
- **Logistics Plan**: {Self-fulfillment / Overseas Warehouse / Factory Direct / TBD}
- **Individual Seller Status**: Yes / No

## Product Selection Results (To be filled after completion)

- **Winning Direction**: {SKU Category}
- **Working Brand Name** (placeholder; user finalizes during builder phase): {Maison Lumi / ...}
  <!-- Generate a 2-word working name so downstream artifacts can be addressed; explicitly tell the user "this is a working name — replace it before launch." Do NOT pick the final brand for them. -->

- **Brand Aesthetic**: {one short phrase, e.g. "Japandi minimalist", "creamy forestcore", "neon Y2K", "rustic apothecary"}    ← Required; **dtc-builder §4.3 reads this verbatim to pick the color palette**. Do not leave blank.
- **Initial SKU Count**: {Number}
- **Test Budget Allocation**: {Amount + currency, e.g. "\$1100" or "¥7,800 (\$1100)"}
- **Store Health Rating**: 🟢 / 🟡 / 🔴
- **Next Phase**: dtc-builder (Launch) / stop (Not recommended)

---

## Downstream Skill Consumption Guide

- **dtc-builder**: Reads fields line-by-line from `_product-marketing-ops.csv` when listing products.
- **shopify-monitoring**: Reads Target CAC from `_unit-economics.csv` for calibration.
- **New Selection Round**: (Expansion / Matrix adjustment) Read this file directly; do not re-ask for buyer_level.
