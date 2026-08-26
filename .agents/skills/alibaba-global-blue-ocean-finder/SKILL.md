---
name: alibaba-global-blue-ocean-finder
description: |
  B2B cross-border blue ocean opportunity discovery expert. Finds high-potential,
  low-competition profit opportunities by analyzing demand-supply mismatches.
  Uses Alibaba.com platform search data for supply-side analysis (supplier count,
  price distribution, product density) and cross-platform
  web research for demand-side signals (Amazon BSR, TikTok trends, Google Trends).
  Example queries:
  "Find products hot on Amazon but undersupplied on Alibaba.com"
  "Which niche in outdoor lighting has low competition and high margins?"
  "My factory has FDA certification — which high-growth categories should I target?"
  "Fastest growing dark horse products in the last 90 days"
  Skip for: hot product rankings (use hot-product-insight),
  Jungle Scout deep-dive (use jungle-scout-deep-dive-analyzer),
  single-supplier search or single-product pricing (not blue-ocean analysis).
metadata:
  version: "3.2.0"
workflow: |
  Step 1: Detect language + Scene routing (A-E)
  Step 2: Multi-query Alibaba search (supply) + Web research (demand)
  Step 3: Supply-demand gap analysis → 5 Blue Ocean opportunities with 4D scoring
  Step 4: Deep-dive each opportunity — gap analysis, differentiation path
  Step 5: Output report directly in conversation
enabled: true
---

# Blue Ocean Finder — Blue Ocean Opportunity Discovery

> ★ Report MUST be output directly in conversation, not written to file.
> ★ Step 2 supply-side (search) and demand-side (web) data collection are both mandatory.
> ★ Do NOT expose internal tool names, parameters, or scoring formulas to the user.

### Bilingual Support

CJK → `zh`, otherwise → `en`. Detect ONCE, pass globally.

### User-Facing Presentation Rules

- Present insights as a market analyst
- Do NOT mention tool names, scoring formulas, or other internals
- Attribute supply-side data as "Alibaba.com platform analysis"
- Attribute demand-side data as "Amazon/TikTok/Google Trends market research"

---

## When to Use

| Scenario | Example |
|------|------|
| Cross-platform supply-demand mismatch | "Find products hot externally but undersupplied on Alibaba" |
| Alibaba blue ocean | "Low competition high sales categories on Alibaba.com" |
| Regional potential | "Which region should I prioritize for outdoor lighting?" |
| Factory capability match | "My factory has CE/FCC certs — what should I sell?" |
| Dark horse products | "Fastest growing dark horse products in the last 90 days" |

### ⛔ When NOT to Use

| Intent | Correct Tool |
|------|---------|
| Hot product ranking | `hot-product-insight` |
| Jungle Scout deep analysis | `jungle-scout-deep-dive-analyzer` |

---

## Scene Routing

| Scene | Trigger Keywords | Core Logic |
|-------|--------|----------|
| A | cross-platform gap, supply gap | C-end demand (validated) × B2B supply gap |
| B | blue ocean, low competition | High inquiry × low supplier saturation |
| C | regional demand, market priority | Same product, different regional opportunity ranking |
| D | my factory, capability match | Reverse selection: factory capability → market fit |
| E | dark horse, fastest growing | Demand inflection point detection |

---

## Step 1: Detect Language + Scene Routing

- **Input**: User query
- **Action**: `detect_language()` + `detect_scenes()` from `scripts/models.py`
- **Output**: language + scenes

---

## Step 2: Data Collection (Supply + Demand)

- **Input**: language, scenes, category keyword (from Step 1)
- **Action**: 5-8 `product_supplier_search` queries (supply) + 5 `web_search` queries (demand)
- **Output**: Supply indicators dict (supplier_count, avg_price, price_spread, etc.) + Demand signals dict (Amazon BSR, TikTok heat, Google Trends direction)

### 2a. Supply-Side Data via Alibaba.com Search (PRIMARY)

Use `product_supplier_search` to collect supply-side product data from Alibaba.com:

```
product_supplier_search(intent_type="product", query="<category keyword in English>")
product_supplier_search(intent_type="supplier", query="<category keyword in English>")
```

Execute **5-8 queries** with different keyword variations and intent types to maximize coverage:

| Query Strategy | Example (for "portable blender") |
|---|---|
| Core keyword (product) | product_supplier_search(intent_type="product", query="portable blender") |
| Core keyword (supplier) | product_supplier_search(intent_type="supplier", query="portable blender") |
| Long-tail variant 1 | product_supplier_search(intent_type="product", query="USB rechargeable portable blender") |
| Long-tail variant 2 | product_supplier_search(intent_type="product", query="mini smoothie blender travel") |
| Feature variant | product_supplier_search(intent_type="product", query="portable blender 600ml BPA free") |
| Price-specific (Scene D) | Add price keywords: "portable blender wholesale $10-30" |
| Regional (Scene C) | Add regional keywords: "portable blender CE certified" |

**Per product, use these fields**:
- title / product name
- price (min-max range)
- imageUrl, prodUrl
- MOQ (minimum order quantity)
- supplier name, supplier rating (if available)

Merge all query results, deduplicate by product URL or title similarity.

From the candidate pool, extract **category-level supply indicators** (internal — do NOT expose):

| Indicator | Calculation | Meaning |
|-----------|------------|---------|
| supplier_count | distinct supplier name count across all results | Active supplier count |
| total_products | total unique product count | Category product density |
| avg_price | median of price field | Category price level |
| price_spread | (max - min) / median | Price dispersion |
| moq_range | min and max of MOQ values | Order threshold spread |
| high_rated_ratio | count(supplier_rating ≥ 4.5) / total suppliers (if available) | Quality supplier proportion |

> ⚠️ Note: supplier_count from search results is an estimate (search returns a subset of all suppliers). Actual supplier numbers may be higher. Keep this in mind when scoring C-dimension.

Product link: use `prodUrl` directly from search results.

### 2b. Demand-Side Data via Web Search (MANDATORY)

Search C-end platforms for demand signals:

| Search | Extract |
|--------|---------|
| "[category] best seller amazon 2026" | Amazon BSR, review count, price |
| "[category] trending tiktok 2026" | TikTok topic heat, video views |
| "[category] google trends 2026" | Search trend direction |
| "[category] consumer complaints reddit" | Unmet needs / pain points |
| "[category] market growth rate 2026" | Market size, growth rate estimates |

---

## Step 3: Blue Ocean Opportunity Identification

- **Input**: Supply indicators (Step 2a) + Demand signals (Step 2b)
- **Action**: Identify 5 blue ocean opportunities with 4-dimension scoring
- **Output**: 5 opportunities → `reports/opportunities.json`

### 4-Dimension Scoring Model (internal — do NOT expose to user)

| Dimension | Code | Weight | Data Source |
|-----------|------|--------|-------------|
| Demand Intensity | D | 0.35 | web_search |
| Competition Density | C | 0.30 | Alibaba search indicators |
| Growth Slope | G | 0.25 | web signals |
| Capability Fit | F | 0.10 | User input (default 3.0) |

Formula: `Score = (D × 0.35) + ((6 - C) × 0.30) + (G × 0.25) + (F × 0.10)`

Note: C is inverted — lower competition = higher score.

> **Detailed scoring guidelines for each dimension** (C/G thresholds, D/F criteria, score interpretation): see `read_file('references/scoring_model.md')`

### Score Interpretation

| Score | Emoji | Action |
|-------|-------|--------|
| ≥ 4.0 | 🟢 | Strong entry recommendation |
| 3.0–3.9 | 🟡 | Cautious, differentiation needed |
| < 3.0 | 🔴 | Hold, wait for timing |

### Opportunity Identification Process

1. Compare supply (Alibaba search) vs demand (web): demand strong + supply weak → blue ocean
2. From search candidate pool, find specific gap directions:
   - Sub-segments with high demand signals but few suppliers on Alibaba
   - Price band gaps (demand exists but no one serves that price point)
   - Feature/material innovation directions (derived from pain points)
3. Output exactly **5 opportunities**, each with:
   - Specific product segment (SKU-level, not broad category)
   - 4-dimension scores with rationale
   - Supply-demand gap description
   - Differentiation path

Save using `save_opportunities()` from `scripts/pipeline.py`.

---

## Step 4: Deep-Dive Analysis

- **Input**: 5 blue ocean opportunities (from Step 3) + raw supply/demand data (from Step 2)
- **Action**: For each opportunity, analyze supply-demand gap, scoring breakdown, differentiation path, profit estimation
- **Output**: 5 deep-dive narratives with data tables and conclusions → `reports/opportunity_answers.json`

> Agent IS the analyst. No external LLM calls.

For each of the 5 opportunities:

1. **Supply-Demand Gap**: Alibaba search supply data vs web demand signals — where is the mismatch?
2. **Key Data Points**: supplier count, price distribution (from Alibaba search) + Amazon BSR, TikTok heat (from web)
3. **Scoring Breakdown**: 4 dimensions with rationale
4. **Differentiation Path**: Concrete OEM/ODM suggestions
5. **Profit Estimation**: Alibaba search `price` as FOB reference vs C-end retail price → margin
6. **Conclusion**: 1 sentence with key number + confidence emoji

Save using `save_opportunity_answers()` from `scripts/pipeline.py`.

---

## Step 5: Output Report in Conversation

- **Input**: Opportunities (Step 3) + deep-dive insights (Step 4) + report template
- **Action**: Assemble 7-section report, output directly in conversation
- **Output**: Complete markdown report (Sections 1-7) rendered in chat

> Your next message IS the report. No tool calls. No write_file. No task_update.

### Phase A: Read inputs

1. `assets/report_template_zh.md` (zh) or `assets/report_template.md` (en)
2. `reports/opportunities.json`
3. `reports/opportunity_answers.json` (if saved in Step 4)

### Phase B: Output report

**Section 1 — Executive Summary**: 1 paragraph + opportunity snapshot table:

```markdown
| Blue Ocean Opportunity | Score | Demand Signal | Competition | Recommended Action |
|----------|---------|----------|----------|----------|
| USB-C Portable Blender 600ml+ | 4.2 🟢 | Amazon BSR Top 10 | Only 8 suppliers found | Enter premium materials |
```

**Section 2 — Blue Ocean Opportunity Deep-Dive Analysis (2.1–2.5)**: Each opportunity includes:

- Blue ocean score + emoji
- Market demand signal (C-end data)
- Supply-side analysis (supplier count, price distribution — natural language, no formulas)
- Key data table (≥3 rows with specific numbers)
- 4-dimension scoring table (D/C/G/F scores + rationale)
- Supply-demand gap analysis
- Differentiation path (OEM/ODM suggestions)
- Conclusion (1 sentence + confidence emoji)

**Section 3 — Recommended Products & Suppliers**: Select representative products from search data:

```markdown
| Image | Product Name | Supplier | Price | MOQ | Opportunity |
|--------|----------|--------|------|-----|----------|
| ![img](prodImage) | [prodName](prodUrl) | [Supplier Name](https://www.alibaba.com/trade/search?SearchText=供应商名) | $X.XX | N pcs | Opportunity 1 |
```

Table rules:
- ⛔ Tables MUST have a blank line before AND after
- **Product name MUST be a clickable link**: `[Product Name](prodUrl)` — use prodUrl directly from search results
- **Supplier name MUST be a clickable link**: `[Supplier Name](https://www.alibaba.com/trade/search?SearchText=供应商名)`
- Image: `![img](prodImage_url)`, no image write `-`
- Price as plain text `$29.99`

**Section 4 — Market Dynamics & Consumer Pain Points**: Market size + unmet consumer needs.

**Section 5 — Strategic Action Plan**: Top 1-3 investable directions + 4-step action plan.

**Section 6 — Risk Assessment**: Patent/tariff/logistics/hype risks.

**Section 7 — Supplier Recommendations**: Organized by direction, one supplier table per direction:

```markdown
### Direction 1: [Direction Name]

| Image | Product Name | Supplier | Price | MOQ |
|--------|----------|--------|------|-----|
| ![img](prodImage) | [prodName](prodUrl) | [Supplier Name](https://www.alibaba.com/trade/search?SearchText=供应商名) | $X.XX | N pcs |
```

### Phase C: Self-check

| # | Check |
|---|-------|
| 1 | All 7 sections present |
| 2 | Section 1 has opportunity snapshot table (5 rows) |
| 3 | Section 2 has 5 deep-dive analyses (2.1-2.5) |
| 4 | Each 2.X has data table + 4D scoring + conclusion |
| 5 | No internal tool names/params/formulas exposed |

> ⚠️ **STOP RULE**: Stop immediately after outputting the report. Do NOT append any follow-up content.

---

## Dependencies

| Tool | Purpose | Step |
|------|---------|------|
| `product_supplier_search` | Alibaba.com product/supplier search | 2a |
| `web_search` | Demand-side signals (Amazon/TikTok/Trends) | 2b |
| `scripts/models.py` | Language detection + scene routing + scoring models | All |
| `scripts/pipeline.py` | I/O helpers | All |

---

## Examples

**"Find blue ocean in portable blenders — hot externally but undersupplied on Alibaba"**
→ zh + Scene A → 5-8 Alibaba search queries + web demand data (Amazon BSR Top 10, TikTok 5M views) → supply-demand gap analysis → 5 blue ocean opportunities

**"Which niche in outdoor lighting has low competition?"**
→ en + Scene B → multi-query Alibaba search (supplier_count=23) + web(Google Trends rising) → 5 opportunities with 4D scoring

**"Which region should I prioritize for pet grooming tools?"**
→ en + Scene C → add regional keywords ("pet grooming tools US", "pet grooming CE certified", "pet grooming tools Middle East") → compare supply indicators across regions + web demand by region → 5 region-specific opportunities

**"我的工厂有 CE/FCC 认证，MOQ 3000 — 适合做什么品类？"**
→ zh + Scene D → extract factory capabilities (CE, FCC, MOQ 3000) → multi-query search across multiple categories → score with F-dimension based on cert match → 5 opportunities ranked by capability fit

**"过去 90 天增速最快的黑马产品"**
→ zh + Scene E → web search for trending/emerging products across platforms → Alibaba search to check supply status → identify demand inflection points with low supply → 5 dark-horse opportunities
