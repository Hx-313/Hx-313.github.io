# Focused Validation Path (With Niche + Specific Product)

Applicable: Users who provided specific category keywords ("Crystals / Coffee / Massage Guns") or a specific product for Go/No-Go validation.

> 📅 **Data Benchmark: 2026 Q1**.

---

## 🎯 Agent Behavior Rules

1. **Do not ask the user "What data do you want to see?" or "What SKU range do you want?"** Directly fetch multi-source data + output a 15-20 SKU candidate matrix.
2. When performing Go/No-Go for a single product, the agent completes the scorecard + 4 Unit Economics (UE) metrics and **directly provides a diagnostic conclusion** (GO / CAUTION / NO-GO) instead of asking the user to interpret the data.
3. **Full product selection defaults to Branch A** (Winning Product Matrix); only move to **Branch B** (Single Product Go/No-Go) if the user explicitly says, "Just validate this one product."

---

## A. Full Winning Product Matrix (Default)

### Step 1: Multi-Source Data Collection (Agent-led)

Each data source solves a different problem. **Do not rely solely on Jungle Scout**:

| Data Source | Purpose | Usage |
|-------------|---------|-------|
| Jungle Scout | US Demand Validation | **Focus on Trends + Review Counts**; ignore sales volume (not Shopify-related) |
| Google Trends | Search Heat + Seasonality | Input niche keywords, analyze 12-month curves |
| TikTok Shop / Hashtag | Visual Virality + Gen Z Trends | Top 30-day #niche content |
| Pinterest Trends | Aesthetic Direction | Determine which products are "camera-ready" |
| Etsy Bestsellers | Handmade / Niche / High Premium | High-premium categories often trend on Etsy first |
| Reddit Niche Subreddits | Real Pain Points + Complaints | Reverse-engineer "unsolved" needs |
| Sourcing platforms (geography-conditional) | Sourcing Price + Supply Chain | Essential for calculating Landed Cost. **US/EU sellers** → Alibaba. **China-domestic sellers** → 1688. **US-domestic sellers** → domestic wholesale (Faire, Tundra, ABC trade shows) |
| 3-5 Top DTC Stores | Pricing / Bundle Strategy | Reverse-engineer industry benchmarks |

Detailed tools/links → `references/phase-1-research.md`

### Step 2: 3-Tier Pricing Architecture (Mandatory)

**A single price point is a major mistake in Shopify product selection.** Select 15-20 SKUs across 3 tiers:

| Tier | Share | Range | Role | Typical Format | Financial Requirements |
|------|-------|-------|------|----------------|-----------------------|
| **Entry (Traffic)** | 30% | \$15-25 | SEO/Ad hooks, impulse buys, upsells | Single item / Small / Consumable | Gross Margin ≥60%, Landed Cost \$2-4 |
| **Hero (Profit)** | 50% | \$45-75 | Main ad focus, bundle core, brand story | Sets / Medium size / Design-led | CM% 50-65%, Min CM ≥\$25, Markup ≥5× |
| **Premium (Anchor)** | 20% | \$95-200+ | Elevate perceived value, gift sets | Large / Gift box / Limited edition | Gross Margin ≥60%, High visual impact |

> **Common Mistake**: Users/AI tend to focus only on Entry and Hero, skipping Premium. **Without a Premium anchor, Hero feels expensive; without Entry traffic, CAC won't drop.** All 3 tiers are indispensable.

### Step 3: Bundle Design (Mandatory ≥3)

Goal: Drive AOV to \$60+:

| Bundle Type | Formula | Discount | Target |
|-------------|---------|----------|--------|
| Starter Set | 1 Hero + 2-3 Entry | -15% | New customer first order |
| Gifting Set | 1 Hero + 1 Premium Accessory + Box | -10% | Holidays / Birthdays |
| Advanced Set | 2-3 Hero items | -20% | Repurchase |

Detailed Formulas → `references/phase-2-matrix.md`

### Step 4: 14 Required Fields per SKU

Output to `project/.workspace/_product-selection-matrix.md` + `project/.workspace/_unit-economics.csv` + `project/.workspace/_product-marketing-ops.csv`:

| Financial Fields (UE Table) | Marketing/Ops Fields (Ops Table) |
|-----------------------------|----------------------------------|
| SKU Name / Pricing Tier / List Price / Supplier Cost / Landed Cost / CM / CM% / Break-even ROAS / Markup Multiple / Seasonality | Selection logic + Data sources / Visual asset rating (1-5 stars) / TikTok potential / SEO keywords (Main + 2-3 Long-tail) / Candidate supplier links |

### Step 5: ICP Back-Inference

After listing the SKU matrix, backtrack to define the ICP (unless already provided) → See "Back-inference from product" section in `references/icp.md`.
Once the ICP is confirmed, filter the SKU matrix and remove non-matching SKUs.

---

## B. Single Product Go/No-Go (Triggered by specific SKU request)

### Step 1: Base Information (User-provided)
- Product Model / Alibaba or 1688 Link
- Sourcing Price (use `product_supplier_search` if no supplier found)
- Planned Selling Price
- Planned Acquisition Channels (Paid Ads / SEO / TikTok / Social)

### Step 2: 6-Dimension Red/Yellow/Green Light Scoring

| Dimension | 🟢 Strong GO | 🟡 Caution | 🔴 Strong NO-GO |
|-----------|--------------|------------|-----------------|
| **Markup Multiple ⭐** | ≥5× | 4-5× | <4× |
| **CM%** | ≥50% | 30-50% | <30% |
| **Market Demand** | Google Trends stable/rising | Flat or high volatility | Consistent decline |
| **Competition** | Fragmented long-tail | A few mid-sized brands | Giant/Amazon BSR monopoly |
| **Visual Assets** | 5+ High-quality supplier photos | Useable but needs editing | Poor quality/Needs original shoot |
| **Compliance** | General item/No certification | Basic (e.g., food labels) | Heavy (CPSC/Battery/Medical) |
| **Logistics** | Small/Non-fragile/Air freight | Medium size or fragile | Liquid/Magnet/Battery/Oversized |

> 📌 **30-Second Filter**: Start with the Markup Multiple. If <4×, PASS immediately—no need to calculate the rest.

**Verdict**:
- Any 🔴 → Immediate NO-GO; **provide 2-3 alternatives**.
- All 🟢/🟡 + 🟢 ≥4 → GO.
- 🟡 ≥4 + No 🔴 → Caution; recommend small batch testing first.
- Others → Not recommended.

### Step 3: Competitor Benchmarking
1. Google "best [product name]" + "[product name] reviews".
2. Find 3-5 similar Shopify stores.
3. Compare: Pricing / Main Image / PDP / Review Count / Average Rating / **Main complaints ← Your differentiation opportunity**.
4. Check Facebook Ads Library for creative assets.
5. Check Instagram for follower counts + content style.

See "Competitor Store Deconstruction" in `references/phase-1-research.md`.

### Step 4: Unit Economics (4 Core Metrics ⚡ Fast Track)

For single product Go/No-Go, only calculate:
1. 30-Second Triple Filter (Markup ≥5× / GM% ≥70% / MOQ × Unit Price < 30% of testing budget).
2. CM + CM% + Break-even ROAS (=1/CM%).

Sufficient for a Go/No-Go decision. See `references/phase-4-unit-economics.md`.

### Step 5: Single Product != Complete Store

Even for a "GO," remind the user: **A Shopify store cannot sell just one product.** Suggest using it as the Hero SKU and expanding to 10-15 related SKUs to form a 3-Tier matrix → Switch back to Branch A.

### Output Format

```markdown
# [Product Name] Feasibility Diagnosis

## Overall Verdict: 🟢 GO / 🟡 CAUTION / 🔴 NO-GO

## 6-Dimension Scoring (Table)

## Competitor Benchmarking (3-5 stores)

## Unit Economics (4 Core Metrics)

## Risk Factors & Mitigation Plans

## Recommended Action
(GO: Move to Branch A for expansion; NO-GO: Suggest 2-3 alternatives)
```

---

## Anti-Patterns (Agent Self-Check)

- ❌ Recommending only 3-5 products in a niche (insufficient; professional stores need 15+).
- ❌ Only finding Hero price points (missing Entry / Premium).
- ❌ Forgetting bundle designs.
- ❌ Making a GO decision based on a single data source.
- ❌ Recommending products without checking Unit Economics.
- ❌ Not providing alternatives on a NO-GO.
- ❌ Compromising on Red Lights (Red Light = Veto).
ghts (Red Light = Veto).
