---
name: alibaba-global-hot-product-insight
description: |
  Cross-border B2B hot product intelligence expert. Identifies top-selling
  trends on Alibaba.com using platform search data and cross-platform web
  research, then provides deep-dive analysis on profit logic, competition
  landscape, and actionable sourcing strategy.
  Example queries:
  "What's hot on Alibaba.com right now — is competition fierce?"
  "Find high-inquiry products on Alibaba.com priced $20-50"
  "What pet products are hot on Alibaba.com recently?"
  "Hottest home appliance categories in the US market"
  Skip for: blue-ocean/supply-gap analysis (use blue-ocean-finder),
  Jungle Scout deep-dive (use jungle-scout-deep-dive-analyzer).
metadata:
  version: "5.2.0"
workflow: |
  Step 1: Detect language + Scene routing
  Step 2: Multi-query Alibaba search + cross-platform web signals
  Step 3: Hot product scoring (search-rank model) → Top 10-20
  Step 4: Deep-dive Top 5 — drivers, profit chain, buyer profile
  Step 5: Output report directly in conversation
enabled: true
---

# Hot Product Insight — Alibaba.com Hot Product Analysis

> ★ Report MUST be output directly in conversation, not written to file。
> ★ Step 2 data collection is critical, do NOT skip。
> ★ Do NOT expose internal tool names, parameters, or scoring formulas to the user。
> ★ Only Step 2 calls data tools. All other steps (scoring, analysis, report) are done in memory — no scripts, no file saves, no bash.

### User-Facing Presentation Rules

- Present insights as a market analyst
- Do NOT mention tool names, scoring formulas, search_rank, query_hits, or other internals
- Attribute data source as "Alibaba.com platform data"
- Describe popularity in natural language

### Bilingual: CJK → `zh`, else → `en`.

---

## When to Use

| Scenario | Example |
|------|------|
| Alibaba Hot Products | "Hot [category] on Alibaba.com recently" |
| Regional Hot Products | "Hottest [category] in the US" |
| Price-Band Analysis | "Hot [category] priced $20-50" |

### ⛔ When NOT to Use

| Intent | Correct Tool |
|------|---------|
| Blue ocean / supply gap | `blue-ocean-finder` |
| Jungle Scout deep analysis | `jungle-scout-deep-dive-analyzer` |

---

## Step 1: Detect Language + Scene Routing

- **Input**: User query text
- **Action**: `detect_language()` + `detect_scenes()` from `scripts/models.py`
- **Output**: language code (`zh`/`en`) + triggered scenes list

| Scene | Trigger Keywords | Logic |
|-------|--------|------|
| A | alibaba hot, inquiry growth | Platform hot product ranking |
| B | hot product, best seller | Comprehensive hot products |
| C | US, Southeast Asia, Europe | Regional filter |
| D | price range, highest inquiry | Price-band filter |

---

## Step 2: Data Collection

- **Input**: language, scenes, category keyword (from user query)
- **Action**: 5-8 `product_supplier_search` queries + 4 `web_search` queries
- **Output**: 30-60 deduplicated candidate products + cross-platform demand signals

### 2a. Alibaba.com Product Search (PRIMARY)

Use `product_supplier_search` to collect supply-side product data from Alibaba.com:

```
product_supplier_search(intent_type="product", query="<category keyword in English>")
```

Execute **5-8 queries** with different keyword variations to maximize coverage:

| Query Strategy | Example (for "cat food") |
|---|---|
| Core keyword | "cat food" |
| Long-tail variant 1 | "premium cat food dry" |
| Long-tail variant 2 | "wet cat food pouch" |
| Material/feature variant | "grain free cat food" |
| Trend variant | "organic natural cat food" |
| Supplier query | product_supplier_search(intent_type="supplier", query="cat food") |

Scene C: Add regional keywords (e.g., "cat food US market", "cat food CE certified")
Scene D: Add price keywords (e.g., "cat food wholesale $20-50")

**Per product, use these fields**:
- title / product name
- price (min-max range)
- imageUrl, prodUrl
- MOQ (minimum order quantity)
- supplier name, supplier rating (if available)
- Search query it appeared in + its position in results (`search_rank`)

Merge all query results, deduplicate by product URL or title similarity → **30-60 candidates**.

### 2b. Cross-Platform Web Signals (MANDATORY)

Search C-end platforms for demand and trend validation:

| Search | Extract |
|--------|---------|
| "[category] best seller amazon 2026" | Amazon BSR, review count, price range |
| "[category] trending tiktok 2026" | TikTok topic heat, video views |
| "[category] google trends 2026" | Search trend direction (rising/stable/declining) |
| "[category] consumer complaints reddit" | Unmet needs / pain points |

Use web signal results to enrich candidate scoring in Step 3.

---

## Step 3: Hot Product Scoring & Selection

- **Input**: 30-60 candidate products (Step 2a) + web demand signals (Step 2b)
- **Action**: Deduplicate → cross-platform validation → score → rank → select Top 10-20
- **Output**: Scored and ranked product list (Top 10-20) kept in memory

> ⚠️ **Do NOT write scripts, save files, or use bash for scoring.** Compute everything mentally from the search results. Go directly from search results → scoring → report output.

### Data Processing Guide

After completing 5-8 search queries + web research, process candidates mentally:

**Step 3.1 — Deduplicate**: Group by product URL or title similarity. For each unique product, remember:
- Basic info (title, price, imageUrl, prodUrl, MOQ, supplier name)
- How many of the search queries it appeared in (`query_hits`)
- Its best search position across all appearances (`best_search_rank`)
- Supplier rating (if available)

**Step 3.2 — Cross-platform validation**: For each candidate, check whether:
- The product or similar products appear in Amazon BSR results (`amazon_validated` = 1 or 0)
- The product category is trending on TikTok/social media (`social_trending` = 1 or 0)
- Google Trends shows rising search interest (`trend_rising` = 1 or 0)

**Step 3.3 — Score**:

```
score = query_hits × 8
      + search_rank_score
      + price_competitiveness
      + supplier_score
      + cross_platform_bonus

where:
  search_rank_score    = max(0, 10 - best_search_rank)  (top position = 10, position 10+ = 0)
  price_competitiveness = 3 if price near category median, 2 if slightly off, 1 if extreme outlier
  supplier_score       = 3 if supplier_rating ≥ 4.5, 2 if ≥ 4.0, 1 if ≥ 3.5, 0 otherwise
  cross_platform_bonus = amazon_validated × 5 + social_trending × 3 + trend_rising × 3
```

**Step 3.4 — Select**: Sort by score descending. Take Top 10-20 (aim 15). Prefer:
1. query_hits ≥ 2 (appears in multiple search queries)
2. cross_platform_bonus > 0 (validated by external signals)
3. Supplier diversity (avoid too many from same supplier)

### Score Interpretation (internal — do NOT expose to user)

Products with higher `query_hits` and `cross_platform_bonus` are more likely to be genuinely hot — they appear consistently across Alibaba searches AND have validated demand from consumer platforms.

> Do NOT save to files. Keep the scored list in memory and proceed directly to Step 4.

---

## Step 4: Deep-Dive Analysis (Top 5)

- **Input**: Top 5 products by score (from Step 3) + web signals (from Step 2b)
- **Action**: For each Top 5 product, analyze platform presence, drivers, profit chain, buyer profile, differentiation
- **Output**: 5 deep-dive narratives with data tables and conclusions, kept in memory

> Agent IS the analyst. No external LLM calls.

For **Top 5** by score:

1. **Platform Presence**: Describe search prominence on Alibaba.com (appeared in N search queries, consistently ranked high)
2. **Hot-Selling Drivers**: social media / pain point / seasonal / supply chain
3. **Profit Chain**: price field as FOB → estimate retail → margin
4. **Buyer Profile**: regional preferences
5. **Differentiation Path**: OEM/ODM suggestions

Remaining 5-15 get summary rows in ranking table only.

> Do NOT save to files. Keep insights in memory and proceed directly to Step 5 (report output).

---

## Step 5: Output Report in Conversation

- **Input**: Scored product list (Step 3) + deep-dive insights (Step 4)
- **Action**: Assemble 7-section report from memory, output directly in conversation
- **Output**: Complete markdown report (Sections 1-7) rendered in chat

> Your next message IS the report. No tool calls.

### Phase A: Assemble report from memory

Use the scored product list (Step 3) and deep-dive insights (Step 4) directly from memory. Do NOT read any files.

### Phase B: Output report

**Section 1 — Executive Summary**: 1 paragraph summarizing category trends and key findings.

**Section 2 — Hot Product Rankings**: Top 10-20 products.

```markdown
### Hot Product Rankings

| Rank | Image | Product Name | Price | MOQ | Supplier | Rating | Search Prominence | Cross-Platform Signal |
|------|--------|----------|------|-----|----------|--------|-------------------|----------------------|
| 1 | ![img](prodImage) | [prodName](prodUrl) | $0.94-1.17 | 1000 | Supplier Co. | 4.8 ⭐ | ★★★ | Amazon BSR ✓ |
```

Table rules:
- ⛔ Tables MUST have a blank line before AND after, otherwise they will not render
- Price as plain text `$29.99` or `$0.94-1.17`
- Image: `![img](prodImage_url)`, no image write `-`
- **Product name MUST be a clickable link**: `[Product Name](prodUrl)`
- No rating write `-`
- **Search Prominence**: ★★★ (3+ queries), ★★ (2 queries), ★ (1 query) — indicates how consistently this product appears across multiple Alibaba searches
- **Cross-Platform Signal**: brief note if validated (e.g., "Amazon BSR ✓", "TikTok trending ✓"), or `-` if none

**Section 3 — Top 5 Deep-Dive Analysis (3.1–3.5)**: Each product:

- Competition assessment 🟢/🟡/🔴
- Key data table (price range, MOQ, supplier info, cross-platform signals)
- Hot-selling drivers (4 dimensions)
- Profit chain (FOB → retail → margin)
- Conclusion (1 sentence + confidence emoji)

**Section 4 — Buyer Demand Profile**: Regional buyer characteristics table.

**Section 5 — Competition & Differentiation**: Competition summary + differentiation suggestions.

**Section 6 — Risk Assessment**: Patent/tariff/logistics risks.

**Section 7 — Action Plan & Supplier Recommendations**: Entry timing + supplier table:

```markdown
### Recommended Suppliers

| Image | Product Name | Supplier | Price | MOQ |
|--------|----------|--------|------|-----|
| ![img](prodImage) | [prodName](prodUrl) | [Supplier Name](https://www.alibaba.com/trade/search?SearchText=供应商名) | $X.XX | N pcs |
```

Supplier link rules:
- Product link: use `prodUrl` directly from search results
- Supplier link: `https://www.alibaba.com/trade/search?SearchText=供应商名` (constructed from supplier name, URL-encode Chinese)
- Data from search results: supplier name, prodImage, price, MOQ

### Phase C: Self-check

| # | Check |
|---|-------|
| 1 | All 7 sections present |
| 2 | Section 2 table has ≥10 rows |
| 3 | Section 3 has 5 deep-dive analyses |
| 4 | Tables have blank lines before and after |
| 5 | No internal tool names/params/formulas exposed |

> ⚠️ **STOP RULE**: Stop immediately after outputting the report.

---

## Dependencies

| Tool | Purpose | Step |
|------|---------|------|
| `product_supplier_search` | Alibaba.com product/supplier search | 2a |
| `web_search` | Cross-platform demand signals | 2b |
| `scripts/models.py` | Language + scene routing | 1 |
| `scripts/pipeline.py` | I/O helpers — DEPRECATED in current workflow, kept for future use | — |

---

## Examples

**"What are the hot products in cat food?"** → zh + Scene A → 5-8 Alibaba search queries → web signal validation → search-rank scoring → Top 15 + Top 5 deep-dive

**"Find hot faucets on Alibaba"** → en + Scene B → multi-query search → cross-platform validation → scoring → report

**"Hottest home decor products in the US market"** → en + Scene C → add regional keywords ("home decor US market", "home decor FCC certified") → multi-query search → cross-platform validation (Amazon US BSR) → scoring → report with US buyer profile focus

**"询盘最高的宠物用品，价格 $10-30"** → zh + Scene D → add price keywords ("pet supplies wholesale $10-30") → multi-query search → filter by price range → cross-platform validation → scoring → report with price-band analysis
