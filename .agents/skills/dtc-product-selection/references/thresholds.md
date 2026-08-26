# Industry consensus thresholds (the verifiable backbone of every decision)

> **Purpose**: every "is the margin enough / is the volume enough / is the repeat rate healthy" verdict must NOT be agent improvisation. Every numerical conclusion in a report must map to a specific cell in the tables below, so the user can **verify it themselves with a calculator or in their Shopify admin**.
> **Sources**: synthesis of 5 major industry tools' published methodology (Jungle Scout / Helium 10 / AMZScout / SmartScout / Viral Launch) + mainstream DTC financial-diagnostic frameworks (ecom-cfo / Shopify Plus seller community consensus).
> **Usage rule**: every ✅/⚠️/🔴 verdict in a report must directly correspond to a row below. **If a new metric has no threshold here, look up the industry source, add it to the table, then use it — never make one up.**

---

## A. Selection — 7 dimensions (is the market worth playing in?)

| # | Metric | ✅ Healthy | ⚠️ Caution | 🔴 Danger | Notes |
|---|---|---|---|---|---|
| 1 | **Target product monthly sales** (Amazon BSR peers) | > 300 units | 100–300 units | < 100 units | Source: Jungle Scout `monthly_sales` |
| 2 | **Target keyword monthly market total** (sum of Top 30) | > \$10M | \$5–10M | < \$5M | Too small → no volume; too large → top players locked in |
| 3 | **Top 10 average review count** | < 200 | 200–1000 | > 1000 | Determines whether a newcomer can break in: > 1000 = oligopoly |
| 4 | **Brand concentration CR10** (Top 10 sales share of category) | < 40% | 40–60% | > 60% | > 60% = top players capture all the traffic |
| 5 | **Target price sweet spot** (USD) | \$25–80 | \$15–25 or \$80–150 | < \$15 or > \$150 | < \$15 → logistics eats the margin; > \$150 → high decision threshold |
| 6 | **Average rating** | > 4.3 | 4.0–4.3 | < 4.0 | < 4.0 = whole category is grumpy; newcomer inherits the bag |
| 7 | **# of new entrants (< 6 months) breaking into Top 30** | ≥ 3 | 1–2 | 0 | 0 = category is locked; no opportunity for new entrants |

**Verdict rule**:
- ≥ 5 of 7 ✅ → category is worth doing
- 3–4 ✅ → caution, must have a differentiation play
- ≤ 2 ✅ → switch categories

---

## B. Finance — 5 dimensions (per-order axis: does each order make money?)

| # | Metric | ✅ Healthy | ⚠️ Warning | 🔴 Death line | Definition |
|---|---|---|---|---|---|
| 1 | **COGS as % of price** | < 30% | 30–40% | > 40% | Cost too high → no room for ads |
| 2 | **Logistics + fulfillment as % of price** | < 20% | 20–30% | > 30% | Sea freight + US warehouse + last-mile combined |
| 3 | **Platform fees** (Shopify Payments / TikTok Shop / Affiliate) | < 8% | 8–15% | > 15% | TikTok Shop affiliate ≥ 15% — be wary |
| 4 | **Ad spend as % of price** | < 20% | 20–30% | > 30% | 30%+ = working for Meta on every order |
| 5 | **Contribution margin CM%** (price − goods − logistics − fees − ads) | > 25% | 15–25% | < 15% | **< 15% = death line, breakeven at best per order** |

**Killer-combo alarms** (any one hit forces 🔴):
- Ad spend > 25% **AND** CM < 15% → losing money on every order
- Price < \$25 **AND** logistics > 30% → logistics consumed all headroom
- COGS > 40% **AND** price < \$40 → expensive in + cheap out = no fix
- COGS + logistics + fees + ads > 80% → < 20% of each order left for ops + profit; not sustainable

---

## C. Customer — 4 dimensions (per-customer axis: is each customer worth it?)

| # | Metric | ✅ Healthy | ⚠️ Warning | 🔴 Danger | Definition |
|---|---|---|---|---|---|
| 1 | **CAC** (acquisition cost) | < AOV × 30% | AOV × 30–50% | > AOV × 50% | Ads + affiliate commission to acquire a new customer |
| 2 | **LTV / CAC** | ≥ 3 | 1.5–3 | < 1.5 | Customer value ÷ acquisition cost; DTC industry baseline 3:1 |
| 3 | **Payback period** | < 3 months | 3–6 months | > 6 months | The cash-flow lifeline — shorter = faster ad reinvestment |
| 4 | **6-month repeat-purchase rate** | > 30% | 15–30% | < 15% | Candles/beauty/food ≥ 30%; durables ≥ 10% is fine |

---

## D. Whole-store 6-dimension health (composite)

| # | Dimension | ✅ Healthy | ⚠️ Warning | 🔴 Below bar |
|---|---|---|---|---|
| 1 | Hero SKU net margin | > 25% | 15–25% | < 15% |
| 2 | Store-wide markup ratio (price/cost) | ≥ 4× | 3–4× | < 3× |
| 3 | First-batch inventory as % of test budget | ≤ 30% | 30–50% | > 50% |
| 4 | # of SKUs with break-even ROAS ≤ 2.0 | ≥ 3 | 1–2 | 0 |
| 5 | Average AOV | \$40–80 | \$25–40 or \$80–120 | < \$25 or > \$120 |
| 6 | SKU role coverage (traffic / hero / profit / bundle / filler) | All 5 covered | Missing 1–2 | Missing ≥ 3 |

---

## How to apply (when the agent writes the report)

Every ✅/⚠️/🔴 must trace back to this file:

> Example: `Contribution margin CM = 18% — ⚠️ warning (B5: 15–25%)` ← user can directly check row B5
> Example: `Price \$35 — ✅ healthy (A5: \$25–80 sweet spot)` ← user can directly check row A5

❌ Not allowed: `Contribution margin looks good ✅` ← no number, no trace, not verifiable
