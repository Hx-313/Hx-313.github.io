<!--
Template Instructions (Read by agent, delete all before output):
- [REQ:xxx] Required; [OPT:xxx] Optional, delete if no data; [LOOP:xxx] Loop by count.
- Pro version keeps professional metrics, but every metric must have a plain-language gloss in parentheses upon first occurrence, along with industry benchmarks.
- Before output, review SKILL.md §1 (2 hard rules) + §1.5 (5 soft references), especially "Reference image + multi-channel link" and "Tone & wording".
-->

# {Brand Name} · Product Selection Decision Report

> Target: Experienced eCommerce Sellers | Data Benchmark: {YYYY QX}

---

## 1. Decision Summary

| Item | Conclusion |
|---|---|
| Recommended Direction | **{Winning Direction}** |
| Product Matrix | **{N} Items** (Loss Leader × {n} / Hero × {n} / Flagship × {n} / Gift Set × {n}) |
| Business Model | All products passed 3 filters: CM% / Break-even ROAS / Risk Red Lines |
| Test Budget Allocation | **\${X}** (Sum of first batch MOQs), using {X}% of budget cap |
| Recommended Action | ✅ Execution: Store Setup (dtc-builder skill) |

---

## 2. 3-Candidate Direction 6-Dimension Scoring

[REQ: Multi-candidate scoring. If only 1 direction (focus validation scenario), delete this entire section.]

| Dimension (Max 5) | 🥇 {Winner} | 🥈 {Runner-up} | 🥉 {Third} |
|---|---|---|---|
| AOV Potential | {Score} | {Score} | {Score} |
| Profit Margin | {Score} | {Score} | {Score} |
| Competitive Landscape | {Score} | {Score} | {Score} |
| Content Creation Difficulty | {Score} | {Score} | {Score} |
| Seasonality | {Score} | {Score} | {Score} |
| Individual Seller Friendliness | {Score} | {Score} | {Score} |
| **Total Score** | **{X}** | **{X}** | **{X}** |

### 2.1 Reasons for Excluding Other Directions (Red Line Violations)

- ❌ **{Runner-up}**: {Specific red line triggered + data evidence}
- ❌ **{Third}**: {Specific red line triggered + data evidence}

---

## 3. {N}-Product Recommended Matrix

[LOOP:SKU]

| # | Reference Image | Product | Role | Price | Landed Cost | Net Profit/Unit¹ | CM%⁴ | Markup² | Break-even ROAS³ | Samples (Multi-channel) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | <img src="{IMG_URL_1}" width="60"> | {Product Name} | Loss Leader | **\${X}** | \${X} | \${X} | {X}% | {X}× | {X} | [Alibaba]({REF_ALIBABA_1}) \| [{Platform 2}]({REF_ALT_1}) |
| 2 | <img src="{IMG_URL_2}" width="60"> | {Product Name} | 🌟 Hero | **\${X}** | \${X} | \${X} | {X}% | {X}× | {X} | [Alibaba]({REF_ALIBABA_2}) \| [{Platform 2}]({REF_ALT_2}) |
| 3 | <img src="{IMG_URL_3}" width="60"> | {Product Name} | 🌟 Hero | **\${X}** | \${X} | \${X} | {X}% | {X}× | {X} | [Alibaba]({REF_ALIBABA_3}) \| [{Platform 2}]({REF_ALT_3}) |
| 4 | <img src="{IMG_URL_4}" width="60"> | {Product Name} | Flagship | **\${X}** | \${X} | \${X} | {X}% | {X}× | {X} | [Alibaba]({REF_ALIBABA_4}) \| [{Platform 2}]({REF_ALT_4}) |
| 5 | <img src="{IMG_URL_5}" width="60"> | {Product Name} | Gift Set | **\${X}** | \${X} | \${X} | {X}% | {X}× | {X} | [Alibaba]({REF_ALIBABA_5}) \| [{Platform 2}]({REF_ALT_5}) |

- **¹ Net Profit / Unit** = Price − Landed Cost − Platform Fees − Packaging − Discount/Refund Reserve (Cash in pocket per sale; matches `unit-economics.csv` `contribution_margin_usd`)
- **² Markup** = Selling Price ÷ Landed Cost (Healthy threshold ≥ 5×)
- **³ Break-even ROAS** = 1 ÷ CM% (Return on Ad Spend required to not lose money; healthy threshold ≤ 2.0)
- **CM%** ≥ 25% is healthy; **First Order Profit** for consumables must be ≥ 0.
- For industry benchmarks, see `references/thresholds.md`.

> ⚠️ **About Reference Samples**: The images and links above are for **product form reference** only—they are not final suppliers. Once you confirm the direction, a full sourcing process will be conducted. The final choice of supplier is **yours**.

> See `financial-model.md` for the full 17-item financial model.

**📌 Template Variable Constraints** (Hidden during agent output):
- `{IMG_URL_X}` must be a real image_url from `product_supplier_search` (Direct CDN links: s.alicdn.com / cbu01.alicdn.com / m.media-amazon.com, etc.), wrapped in `<img src="..." width="60">`.
- `{REF_ALIBABA_X}` = Real Alibaba product_url (Required).
- `{REF_ALT_X}` = Real link for a secondary channel. `{Platform 2}` should be 1688 / AliExpress / Made-in-China / TikTok / Amazon. If not found, write "`Alibaba only (1688 to be added during sourcing phase)`"—**do not fabricate**.
- No imaginary URLs; no image reuse across multiple SKUs.

> **About "Discarded Candidates" Section**: The default report **does not proactively show** discarded candidates to avoid making the research pool seem small. This section appears only if: (1) The user asks "Are there other directions?" (2) The user wants a product you previously filtered. In those cases, output a Risk Assessment Table separately.

---

## 4. Unit Economics (Profit per Order + Customer Lifetime Value)

> **Academic Framework**: Unit Economics is defined by two dimensions—**A. Order Dimension** (Net profit per order, store model health) + **B. Customer Dimension** (Cost to acquire, retention, lifetime value). Both must pass for a valid business model.

### 4.1 Profit per Order (Order Dimension)

#### 4.1.1 Monthly Store Projections

> **Scenario**: {X} orders/month · Hero SKU accounts for {X}% · {X}% of revenue allocated to ads.

| Metric | Value | Industry Benchmark |
|---|---|---|
| Average Order Value (AOV) | \${X} | {Benchmark Range} |
| Weighted Avg CM% | {X}% | {Category Benchmark} |
| Monthly Revenue | \${X} | — |
| Monthly Net Profit (Pre-Ad) | \${X} | — |
| Assumed {X}% Ad Spend | -\${X} | {Channel Benchmark} |
| **Monthly Net Profit (Final)** | **\${X}** | — |
| **Net Profit at {2X} Orders** | **\${X}** | — |

#### 4.1.2 Store Model Health Check (6-Dimension Audit)

> **6-Dimension Audit**: 3 Financial (Profit / Markup / Inventory Stress) + 3 Operational (Ad Ceiling / AOV / SKU Roles). All must pass.

| Check Item | Health Line | Actual Result |
|---|---|---|
| Hero SKU CM% | ≥ 45% | {X}% — {Pass / Fail, -X pp} |
| Markup ≥ 5× across store | 100% | {X}/{N} Items Pass |
| Initial Inventory % of Budget | ≤ 30% | {X}% — {Pass / Over-budget X pp} |
| Break-even ROAS ≤ 2.0 SKUs | ≥ 2 Items | {X}/{N} Items — {Pass / Ads not viable} |
| Average Order Value (AOV) | ≥ \$25 | \${X} — {Pass / Too low, needs upsell} |
| SKU Role Coverage | 3 Roles Complete | {Complete / Missing X role} |

**Order Dimension Verdict**: {✅ Model Viable — All pass / ⚠️ Tight but viable — {X} items fail but optimizable / ❌ Pivot required — {X} items hit red lines}

---

## 4.2 Customer Value (Customer Dimension)

> Cost per Acquisition (CAC), Retention (Repurchase Cycle), and 12-Month Lifetime Value (LTV)—the critical ledger that separates DTC from Amazon. **LTV:CAC ≥ 3:1** is the healthy threshold.

| Metric | Measured | Health Line | Verdict |
|---|---|---|---|
| **CAC** ({Primary Ad Channel}) | \${X} | ≤ First Order Net Profit \${X} | {✅ / ❌} |
| First Order Net Profit (=Profit−CAC) | \${X} | ≥ 0 | {✅ / ❌ Loss on 1st order} |
| Repurchase Cycle | {X Days} | — | {Consumable / One-time purchase} |
| 12-Month Projected Orders | {X-Y} times | ≥ 2 times (Non-durables) | {✅ / ❌} |
| **LTV** (12-Month) | \${X} | — | — |
| **LTV:CAC** | {X}:1 | ≥ 3:1 | {✅ / ⚠️ / ❌} |
| **Payback Period** | {X} Months | ≤ 12 Months | {✅ / ❌} |
| AOV Lever | {Free shipping over \$X / Gift over \$Y} | — | — |

**Customer Dimension Verdict**: {✅ Model Viable — LTV:CAC ≥ 3:1 & Payback ≤ 12m / ⚠️ Slow Payback — Adjust channels / ❌ Model Invalid — Scaling will increase losses}

---

## 4.3 Combined Unit Economics Verdict

**A. Order Dimension** {✅ / ⚠️ / ❌} + **B. Customer Dimension** {✅ / ⚠️ / ❌} = **Business Model {✅ Viable / ⚠️ Tight but viable / ❌ Pivot required}**

---

## 5. Suggested Next Steps

1. ✅ Selection plan is ready.
2. ⏭ **Suggestion: Move to dtc-builder skill** — Express launch mode (2h to launch).
3. ⏭ Deep product page optimization for 5 items.
4. ⏭ Setup monitoring + 09:00 automated daily report.

> Please confirm the direction, product matrix, and pricing strategy. If you have adjustments, let me know. If OK, reply "Start building the store," and we'll proceed.

---

> Detailed Financial Projection → [financial-model.md](financial-model.md)
page optimization for 5 items.
4. ⏭ Setup monitoring + 09:00 automated daily report.

> Please confirm the direction, product matrix, and pricing strategy. If you have adjustments, let me know. If OK, reply "Start building the store," and we'll proceed.

---

> Detailed Financial Projection → [financial-model.md](financial-model.md)
