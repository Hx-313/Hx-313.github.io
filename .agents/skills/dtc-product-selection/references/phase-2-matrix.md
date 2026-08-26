# Phase 2: Product Matrix (3-Tier Pricing + Holiday Calendar + Bundles)

Three objectives, one document: 3-Tier Pricing Structure / Annual Holiday Marketing Calendar / 4 Bundle Formulas.

---

## 🎯 Agent Behavior Rules

1. **Don't ask "what price point do you want"**—directly output a 3-Tier SKU matrix draft for user correction.
2. Each SKU must be tagged with primary and secondary target holidays (cannot just be "year-round").
3. The first batch must include ≥ 3 Bundles (Entry x1 + Gifting x1 + Advanced x1).
4. **Cut and redo** any Bundle if the CM% after discount is < 45%.

---

## A. 3-Tier Pricing Structure

Why single-price-point stores fail: AOV won't scale / CAC won't drop / No brand anchoring / No ladder for repeat purchases.

### 3 Price Segments

| Tier | Distribution | Role | Key Metrics |
|------|------|------|---------|
| **Entry \$15-25** | 30% | Traffic driver / Upsell / Impulse | Landed Cost ≤ \$3-4, Markup ≥ 60%, small size for ePacket; **not intended for standalone profit**. |
| **Hero \$45-75** | 50% | Main profit driver / Bundle core | Markup ≥ 5×, CM ≥ \$25, CM% ≥ 50%, Break-even ROAS ≤ 2.0, 5-star visuals, strong storytelling; **at least 8-10 SKUs**. |
| **Premium \$95-200+** | 20% | Anchor / Gifting / Brand perception | Price ≥ Hero × 2, high visual impact + exquisite packaging + scarcity; **3-5 SKUs are sufficient**. |

### Typical Forms

| Tier | Form | Example (Crystal Niche) |
|------|------|-----------------|
| Entry | Single item / Mini version / Consumables / Accessories | Single crystal \$8-15, Stickers \$5, Small charms \$15-22 |
| Hero | Main sets (2-4 items) / Medium single items / Limited editions | Starter Kit \$49, Crystal Pillar \$55, Moon Phase Ornament \$59 |
| Premium | XL versions / Gift boxes / Limited editions / Subscription box first box | Large Crystal Cluster \$129, Holiday Gift Box \$159 |

### Multi-Tier Linkage

**1. Price Ladder Perception** (Making the Hero SKU feel "just right"):
```text
Wrong: $20 / $25 / $30  ← Too little differentiation
Right: $20 / $55 / $129 ← Clear ladder (Min vs Max ≥ 5x difference)
```

**2. Cross-Tier Bundles to Boost AOV**: 1 Hero (\$55) + 2 Entry (\$15) = Bundle \$75 (saves \$10).

**3. Upgrade Path**: First order Entry \$20 → 30-day Hero \$55 → 90-day Premium \$129.

### Implementation Checklist (Go back and fix if any are unmet)

- [ ] Entry ≥ 5 SKUs (\$15-25) / Hero ≥ 8 SKUs (\$45-75) / Premium ≥ 3 SKUs (\$95+)
- [ ] Clear 3-tier ladder (Min vs Max ≥ 5×)
- [ ] ≥ 3 cross-tier Bundles
- [ ] Estimated AOV ≥ \$50

---

## B. Holiday Marketing Calendar

E-commerce has massive annual fluctuations; BFCM week can equal a month of normal sales.

### US Market Annual Calendar

| Month | Holiday | Suitable Categories |
|----|------|---------|
| 1 | New Year's Resolutions | Health / Fitness / Education |
| 2 | Valentine's Day (2/14) | Gifts / Couples / Jewelry / Aromatherapy |
| 3 | Spring Cleaning + Women's Day | Organization / Home / Women |
| 4 | Easter + Earth Day | Gifts / Sustainability |
| 5 | **Mother's Day** ⭐ Peak | Gifts / Skincare / Jewelry / Home |
| 6 | Father's Day + Pride + Summer | Gifts / Outdoor / Rainbow |
| 7 | Prime Day + July 4th | Flag colors / Outdoor / Summer |
| 8 | Back to School | Education / Organization / Youth-oriented |
| 9 | Labor Day + Autumn | Outdoor / Home / Autumn colors |
| 10 | **Halloween** ⭐ Peak | Decor / Apparel / Spiritual |
| 11 | **BFCM** ⭐ Annual Largest | All Categories |
| 12 | **Christmas + Hanukkah + New Year's** | Gifts / Home / Holiday Decor |

### Holiday Strategies Per Price Tier

| Tier | Role | Launch Timing |
|------|------|---------|
| Entry | Holiday upsells + accessories | 2-3 weeks before holiday |
| Hero | Main holiday Bundle core | 4-6 weeks before (to build SEO) |
| Premium | Holiday gifting anchor | 6-8 weeks before |

### Seasonal Tagging in Selection Matrix

Every SKU in `_product-marketing-ops.csv` must fill: Primary Holiday / Secondary Holiday.

**Year-round stable SKUs must be ≥ 50%** (to avoid starving during off-seasons).

### Holiday Niche Bonuses

| Niche | Holiday Bonus | Recommendation |
|-------|---------|------|
| Gift Shops | Extremely High (90% of sales on holidays) | Mandatory holiday-exclusive SKUs |
| Spiritual / Crystals | High | Recommend 3-5 holiday exclusives |
| Health / Fitness | Medium | 1-2 holiday gift boxes |
| Digital / 3C | Low | Primarily driven by discounts |
| Outdoor / Camping | Medium | Seasonal collection pages are sufficient |

### Key Stocking Schedule

| Holiday | Stocking Deadline | Listing Date | Main Promotion Start |
|------|---------|------|---------|
| Mother's Day | 3/15 | 4/1 | 4/20 |
| BFCM | 9/30 | 10/15 | 11/15 |
| Christmas | 10/15 | 11/1 | 11/20 |

Output: Write to `project/.workspace/_marketing-calendar.md` (12-month breakdown + stocking table).

---

## C. Bundle Design (4 Formulas)

Bundles are the most effective way to boost AOV on Shopify. Top DTC brands have 5-15 each.

| Type | Formula | Discount | Purpose | Example (Crystals) |
|------|------|------|------|-----------|
| **1. Starter Kit** | 1 Hero + 2-3 Entry + Packaging | -10% ~ -15% | Best for first-time buyers | "Crystal Beginner Kit" \$45.99 (Solo total \$65) |
| **2. Gifting Kit** | 1 Hero + 1 Premium Accessory + Box | -8% ~ -12% | Holidays / Birthdays / Gifts | "Mother's Day Self-Care Box" \$89 |
| **3. Advanced Kit** | 2-3 Hero (Same theme) | -15% ~ -20% | For repeat customers to "complete collection" | "Full Chakra Collection" \$149 (7 items, total \$175) |
| **4. Subscription Box** | New theme monthly \$30-50 | -10% vs Solo | Stable LTV | "Monthly Crystal Box" \$39/mo (Solo \$45) |

### Bundle Decision Matrix

| Type | Suitable Phase | Priority |
|------|---------|-------|
| Starter Kit | Mandatory (Week 1) | ⭐⭐⭐⭐⭐ |
| Gifting Kit | Mandatory (Before Holidays) | ⭐⭐⭐⭐⭐ |
| Advanced Kit | Months 2-3 | ⭐⭐⭐ |
| Subscription Box | After 100+ customers | ⭐⭐ |

### Bundle Quantity Targets

- Week 1: ≥ 3 / Month 1: ≥ 5 / Month 3: ≥ 8

🟥 **Red Line**: Cut the Bundle if CM% < 45% after discount.

### Mandatory Bundle Fields (`_product-marketing-ops.csv`)

Bundle Name (EN) / Type / Included SKUs / Total Solo Price / Bundle Price / Discount % / Bundle CM / Bundle Gross Margin / Primary Holiday.

---

## Anti-Patterns (Agent Self-Check)

- ❌ Single price segment (most common mistake).
- ❌ Price gaps too small (\$20 vs \$30 is meaningless).
- ❌ Missing Premium anchoring items.
- ❌ Only seasonal products (starve in the off-season).
- ❌ Forgetting holiday lead times (launching for Christmas in November is too late).
- ❌ Launching with 0 Bundles.
- ❌ Excessive Bundle discounts (erodes profit) / Random Bundle combinations (needs a theme).
