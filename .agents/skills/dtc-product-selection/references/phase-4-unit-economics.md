# Phase 4: Unit Economics Calculator

17 metrics per SKU. The "Hard Science" of Shopify DTC product selection. Terminology: **CM (Contribution Margin)** = Price - All Variable Costs.

---

## 🎯 Agent Behavior Rules

1. **Individual SKU Go/No-Go** = Calculate 4 core numbers (30-second triage + Break-even ROAS).
2. **Complete Selection Matrix** = Calculate 14 metrics (#1-#12 + #16-#17).
3. **Post-Launch Tracking** = Full set of 17 metrics.
4. Trigger any Red Line → Reject immediately.

---

## 🚨 30-Second Triage (Reject if any fail)

| # | Triage | Red Line |
|---|--------|----------|
| A | **Markup Multiple ≥ 5×** | < 4× → Reject |
| B | **Gross Margin % ≥ 70%** | < 60% → Reject |
| C | **MOQ × Unit Price < 30% of Testing Budget** | > 50% → Reject |

---

## [Cost Side] 4 Items

### #1 Landed Cost = Unit Cost + First-mile Freight + Tariffs + Creative Production Allocation
- First-mile: CN→US 3PL allocation per unit (0 for direct dropshipping).
- Tariffs: 0% for general goods to US; 7.5-25% for toys/electronics/textiles.
- ⚠️ **Packaging is not part of Landed Cost**; it belongs to #2.

Example (Amethyst Pillar): Supplier \$2.47 + Freight \$0.80 + Tariff \$0 + Creative \$0.50 = **\$3.77**

### #2 Variable Cost = Last-mile Shipping + Packaging + Fulfillment Labor
- ⚠️ If DIY packing, factor in hourly wage; your time is not free.

Example: Last-mile shipping \$6.50 + Kraft Box & Card \$1.80 + DIY Packing (\$5/h labor × 6min) \$0.50 = **\$8.80**

### #3 Transaction Cost = Price × Fee Rate + Fixed Fee

| Channel | Fee Rate |
|---------|----------|
| Shopify Payments / Stripe | 2.9% + \$0.30 |
| PayPal Standard | 3.49% + \$0.49 |
| PayPal Cross-border | 4.4% + \$0.49 |

Example (\$55 via PayPal): 55 × 3.49% + 0.49 = **\$2.41**

### #4 Discount/Refund Reserve = Price × (Discount Rate + Refund Rate)
- Discount Rate: 8-15% (New customer + BFCM + Abandoned cart recovery).
- Refund Rate: See `phase-4-return-rate-benchmarks.md`.

Example (\$55, 10%+10%): 55 × 20% = **\$11.00**

---

## [Profit Side] 3 Items

### #5 CM = Price − (#1 + #2 + #3 + #4)
Example: 55 − 25.93 = **\$29.07**

### #6 CM%

| CM% | Health Status |
|-----|---------------|
| ≥ 60% 🟢 | Any traffic source viable |
| 45-60% 🟢 | Paid ads OK |
| 30-45% 🟡 | Organic traffic only + Strong AOV required |
| < 30% 🔴 | Reject — or use as a loss-leader product only |

### #6b Gross Margin % = (Price − Landed Cost) / Price

> 📌 GM% only deducts Landed Cost; CM% is the true baseline for running ads. The gap is usually 20-30 pp. Use CM% for decisions, but reject during selection if GM% < 60%.

| GM% | Decision |
|-----|----------|
| ≥ 70% 🟢 | Standard for DTC |
| 60-70% 🟡 | Tight |
| < 60% 🔴 | Reject |

---

## [Ad Decision] 3 Items

### #7 Break-even ROAS = 1 / CM%
Required revenue per \$1 of ad spend to not lose money. Example: 1 / 0.529 = **1.89**

| Break-even ROAS | Decision |
|-----------------|----------|
| ≤ 1.5 🟢 | Any traffic source viable |
| 1.5-2.0 🟢 | Paid ads feasible |
| 2.0-2.5 🟡 | Tight; requires precise targeting |
| > 2.5 🔴 | Organic traffic only |

### #8 Target CAC = CM × (1 − Target First-Order Profit Margin)

Target First-Order Profit Margin: One-time purchases (Home/Decor/Crystals) **40-50%** / High Repeat (Beauty/Food) **0-20%** / High LTV (Subscription) **can be -20% to -50%**.

Example: 29.07 × 0.60 = **\$17.44**

Actual CAC (2026 US): SEO \$2-8 / Pinterest \$3-10 / Email \$1-5 / TikTok \$8-25 / Google \$10-30 / Meta \$15-40

> ⚠️ Target CAC < \$15 → Paid ads are nearly impossible; must rely on organic traffic.

### #9 Target ROAS = Price / Target CAC
Example: 55 / 17.44 = **3.15**. Use this as the bidding goal for Meta/Google.

---

## [Health Metrics] 3 Items

### #10 Markup Multiple = Price / Landed Cost ⭐ Most Critical for Selection

> **The first 30-second triage**—decide before even calculating CAC/Refunds/Shipping.

Example: 55 / 3.77 = **14.6×**

| Markup | Decision |
|--------|----------|
| **5-8×** 🟢 | **DTC Golden Range** |
| 8-12× 🟡 | High; beware of price bloating |
| 4-5× 🟡 | Tight; requires high AOV or ultra-high repeat rate |
| < 4× 🔴 | Reject (Wholesale mindset, not DTC) |
| ≥ 12× ⚠️ | Re-evaluate (Unless Glossier/Aesop-level brand premium) |

**Why so high?**: Shopify starts with 0 traffic. 30-40% of the price is reserved for "Acquisition + Fulfillment + Risk." Traditional retail survives on 2× markup; DTC **needs 5×+ to be safe**.

### #11 First-Order Profit = CM − Actual CAC
Example: 29.07 − 15 = **\$14.07**

| First-Order Profit | Meaning |
|--------------------|---------|
| ≥ \$10 🟢 | Standard for one-time products |
| \$0-10 🟡 | OK for high repeat; tight for one-time |
| -\$5 ~ \$0 🟡 | Requires LTV:CAC > 3 |
| < -\$5 🔴 | Cash flow collapse |

> ⚠️ 95% of DTC failures = Heavy loss on first order + no repeat purchases. **Strive for at least break-even**.

### #12 LTV:CAC (Repeat products only)

LTV (12 months) = CM × Annual Purchase Frequency; Target **> 3**

Example (Crystal shop, 1.4x avg): LTV = 29.07 × 1.4 = \$40.70; LTV:CAC = 40.70 / 15 = **2.71** → 🟡 Low

| LTV:CAC | Decision |
|---------|----------|
| > 5 🟢 | Excellent; aggressive scaling possible |
| 3-5 🟢 | Healthy |
| 2-3 🟡 | Optimize repeat purchase strategies |
| < 2 🔴 | Model is not viable |

> Not applicable for one-time items (Gifts/Decor); use #11 instead.

---

## [Operational Pre-calculation] 2 Items (Calculate before Sourcing/Logistics)

### #16 MOQ × Unit Price < Testing Budget × 30%

Logic: Testing budget (≤ \$3000) must leave 70% for traffic validation.

| Ratio | Decision |
|-------|----------|
| < 20% 🟢 | Multiple SKUs can be tested in parallel |
| 20-30% 🟢 | OK |
| 30-50% 🟡 | Tight; requires extreme confidence in the SKU |
| > 50% 🔴 | Single SKU bet; gambling |

**4 Ways to Lower MOQ**: Direct shipping from China skips MOQ / 1688 small batches (from 1 unit) / Alibaba Sample Order (5-20 units) / Test traffic with similar products before purchasing.

### #17 Total Logistics Lead Time = First-mile + Last-mile

| CN→US Total Lead Time | Decision |
|-----------------------|----------|
| ≤ 7 Days 🟢 | Excellent (Overseas Warehouse + USPS/FedEx) |
| 8-12 Days 🟢 | Acceptable (4PX / SF International Economy) |
| 13-15 Days 🟡 | **Repeatedly declare** on product pages + emails |
| 16-22 Days 🟡 | Gifts/Mystery items only; requires discount compensation |
| > 22 Days 🔴 | Refund rates will spike 15%+ |

**Beginner Tip**: US customers start checking tracking after 7 days, 30% open PayPal disputes after 14 days. Every 7-day delay adds +3-5% negative review rate and +2-3% refund rate. Logistics > 12 days must be explicitly stated on the product page, otherwise it violates the FTC "Mail Order Rule."

---

## [Operational Validation] 3 Items (Post-Launch Tracking)

### #13 Sell-through (30 Days)

| Sell-through | Decision |
|--------------|----------|
| ≥ 60% 🟢 | Potential winner; restock immediately |
| 30-60% 🟢 | Healthy (> 40% is excellent) |
| 10-30% 🟡 | Optimize page/traffic |
| < 10% 🔴 | Dead stock; liquidate within 60 days |

### #14 Refund Rate (Categorized Thresholds)

| Category | Healthy Range |
|----------|---------------|
| Home / Decor / Crystals / Stationery | 3-8% |
| Beauty / Personal Care | 5-12% |
| Footwear | 15-25% |
| Apparel (with sizes) | 25-40% |
| Electronics (small) | 8-15% |

Red Line: Actual rate > 2× Reserve → Business model failure.

### #15 NPS / Repeat Purchase Rate

| Metric | 🟢 | 🔴 |
|--------|----|----|
| NPS | ≥ 50 | < 20 |
| 30-Day Repeat Purchase | ≥ 8% | < 3% |
| 90-Day Repeat Purchase | ≥ 20% | < 10% |

---

## Decision Red Lines (10 Rules, Stop if any are violated)

**🟥 Selection Phase (Before sourcing)**: 1. Markup < 4× / 2. GM% < 60% / 3. MOQ × Unit Price > 50% of Testing Budget.

**🟧 Pre-Launch**: 4. CM% < 30% / 5. Break-even ROAS > 2.5 / 6. First-Order Profit < -\$5 (unless high LTV) / 7. LTV:CAC < 2 (Repeat products) / 8. Logistics > 22 Days.

**🟨 Post-Launch**: 9. Sell-through (30d) < 10% → Liquidate in 60 days / 10. Actual Refund Rate > 2× Reserve.

---

## CSV Output (`project/.workspace/_unit-economics.csv`, Template: `templates/unit-economics-template.csv`)

```csv
SKU,Price,Landed,Variable,Transaction,Reserve,CM,CM%,Break-even ROAS,Target CAC,Target ROAS,Markup,First-Order Profit,Health
Amethyst Pillar,55.00,3.77,8.75,2.41,11.00,29.07,52.9%,1.89,17.44,3.15,14.6,14.07,🟢
7-Chakra Hanging,49.99,2.10,7.80,2.23,10.00,27.86,55.7%,1.79,16.72,2.99,23.8,12.86,🟢
Single Rose Quartz,12.99,1.11,5.20,0.94,2.60,3.14,24.2%,4.13,1.88,6.91,11.7,-11.86,🔴
```

## Store-Wide Requirements

| Health Status | SKU Mix % |
|---------------|-----------|
| 🟢 (CM% ≥ 45% + Break-even ROAS ≤ 2.0) | ≥ 60% |
| 🟡 Tight | ≤ 30% |
| 🔴 Danger | ≤ 10% (Entry/Lead products only) |

## 5 Common Mistakes

1. ❌ Looking only at price and not CM% (most common).
2. ❌ Forgetting to calculate fulfillment labor (DIY packing ≠ free).
3. ❌ Forgetting the Discount/Refund Reserve (15-25% mandatory deduction).
4. ❌ Using Net Margin instead of CM (mismatch with marketing team terms).
5. ❌ Ignoring the 30-second Markup Multiple triage.