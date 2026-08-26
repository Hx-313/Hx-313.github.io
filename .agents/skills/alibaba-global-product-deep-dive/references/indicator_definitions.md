# Indicator Definitions

Detailed definitions, calculation logic, and threshold standards for the Indicator Data Framework.

> This document expands on the SKILL.md Quick Reference with complete formulas and edge case handling.

---

## Indicator Computation Flow

```
User Query → Parse Scope → collect_js_data.py → analyze_indicators.py → indicator_framework.json
```

1. **Parse Scope**: Extract marketplace, category, keywords, ASINs, filters from user query
2. **Data Collection**: Run `scripts/collect_js_data.py` to call up to 6 JS APIs
3. **Indicator Computation**: Run `scripts/analyze_indicators.py` to compute 12 indicators
4. **Output**: `indicator_framework.json` (single JSON file with all 12 indicators)

---

## 12 Core Indicators

### 1. Main KW (Primary Keyword)

| Attribute | Detail |
|-----------|--------|
| **Definition** | The core search keyword for the category/product |
| **Data Source** | `keywords_by_keyword` → `keywords_market.csv` |
| **Calculation** | User-specified keyword, or keyword with highest `monthly_search_volume_exact` |
| **Output Format** | String — e.g. `"yoga mat"` |

### 2. Category

| Attribute | Detail |
|-----------|--------|
| **Definition** | Amazon category the product belongs to |
| **Data Source** | `product_database` → `competitors.csv` |
| **Calculation** | Most frequent category (mode) from returned products |
| **Output Format** | String — e.g. `"Sports & Outdoors"` |

### 3. Search Volume

| Attribute | Detail |
|-----------|--------|
| **Definition** | Monthly exact search volume for the main keyword |
| **Data Source** | `keywords_by_keyword` → `keywords_market.csv` |
| **Calculation** | Read `monthly_search_volume_exact` for Main KW |
| **Thresholds** | >10K = large market; 5K-10K = medium; <5K = niche |
| **Output Format** | Integer — e.g. `148,000` |

### 4. Top 1 Seller Revenue

| Attribute | Detail |
|-----------|--------|
| **Definition** | Estimated monthly revenue of the current market leader |
| **Data Source** | `sales_estimates` + `product_database` |
| **Calculation** | `Revenue = Daily Sales × Price × 30`, take maximum |
| **Thresholds** | >$100K = large market; $50K-$100K = medium; <$50K = small |
| **Output Format** | USD — e.g. `$125,400` |

### 5. $5K+ Listings

| Attribute | Detail |
|-----------|--------|
| **Definition** | Number of active listings with monthly revenue > $5,000 |
| **Data Source** | `product_database` + `sales_estimates` |
| **Calculation** | Iterate product list, compute monthly revenue per ASIN, count where > $5,000 |
| **Business Meaning** | Measures market depth — higher count indicates more buyers are actively purchasing, validating wholesale demand for B2B suppliers |
| **Output Format** | Integer — e.g. `42` |

### 6. Avg Price / Weight / FBA Fee

| Attribute | Detail |
|-----------|--------|
| **Definition** | Average selling price, weight, and FBA fee from competitor pool |
| **Data Source** | `product_database` → `competitors.csv` |
| **Calculation** | `mean(price)`, `mean(weight)`, FBA estimated from weight + dimensions |
| **Business Meaning** | Baseline values for calculating buyer's retail margin — used to demonstrate profit space to B2B buyers (Amazon Retail Price − FBA Fee − FOB Price = Buyer Net Margin). Weight also determines freight mode viability (sea vs air). |
| **Output Format** | USD / lbs / USD — e.g. `$29.99 / 2.1 lbs / $5.42` |

### 7. Avg Reviews / Rating

| Attribute | Detail |
|-----------|--------|
| **Definition** | Average review count and rating from Top 10-50 products |
| **Data Source** | `product_database` → `competitors.csv` |
| **Calculation** | `mean(reviews)` and `mean(rating)` from Top 10-50 products |
| **Thresholds** | Reviews <500 = low barrier; 500-2000 = medium; >2000 = high barrier |
| **Output Format** | Integer / Float — e.g. `1,245 / 4.3` |

### 8. Monopoly

| Attribute | Detail |
|-----------|--------|
| **Definition** | Market brand concentration assessment |
| **Data Source** | `share_of_voice` → `market_concentration.csv` |
| **Calculation** | See algorithm below |
| **Output Format** | Traffic light — 🔴 / 🟡 / 🟢 + description |

**Monopoly Detection Algorithm**:
```
top_brand_share = max(combined_weighted_sov)
top3_share = sum(top 3 combined_weighted_sov)

top_brand_share > 0.30 → 🔴 "Single brand monopoly"
top3_share > 0.60      → 🟡 "Concentrated market"
otherwise              → 🟢 "Fragmented market"

If top brand == "Amazon" → "Amazon monopoly"
Else                     → "Third-party brand monopoly"
```

### 9. Seasonality

| Attribute | Detail |
|-----------|--------|
| **Definition** | Whether product demand has seasonal fluctuations |
| **Data Source** | `historical_search_volume` → `keyword_trends.csv` |
| **Calculation** | See algorithm below |
| **Output Format** | Classification — `"Seasonal"` / `"Non-seasonal"` / `"Insufficient data"` |

**Seasonality Variance Algorithm**:
```
mean = sum(values) / N
std  = sqrt(sum((vi - mean)²) / N)
cv   = std / mean

cv > 0.5  → "Seasonal"
cv ≤ 0.5  → "Non-seasonal"
N < 12    → "Insufficient data"
mean == 0 → "No search volume"
```

### 10. PPC Bid / Conversion (Buyer Cost Indicator)

| Attribute | Detail |
|-----------|--------|
| **Definition** | PPC bid range and category average conversion rate |
| **Data Source** | `share_of_voice` + `keywords_market.csv` |
| **Calculation** | `min/max(ppc_bid_exact)` + category average conversion rate |
| **Business Meaning** | Used to estimate buyer's ad cost per unit sold. Low PPC bid = buyer has more margin after ad spend = easier for GGS supplier to close B2B deals. High PPC bid = competitive retail market = buyers need lower FOB prices to maintain margin. |
| **Output Format** | USD range + percentage — e.g. `"$0.85 - $2.30 / Conv. 12.5%"` |

### 11. Buyer Market & Compliance Risk

| Attribute | Detail |
|-----------|--------|
| **Definition** | Primary buyer market(s) and associated compliance/certification requirements |
| **Data Source** | `product_database` → `competitors.csv` (marketplace field) |
| **Calculation** | Identify dominant marketplace from product data; map to known certification requirements |
| **Business Meaning** | GGS suppliers must know which certifications buyers need to avoid recommending a product that buyers cannot legally sell. Certification capability (CE/FCC/PSE/etc.) is also a B2B competitive advantage that justifies premium FOB pricing. |
| **Output Format** | String — e.g. `"US market: FCC + CPSC required"` / `"EU market: CE + RoHS required"` |

**Market-to-Certification Mapping**:
```
US marketplace  → FCC (electronics), UL (electrical), CPSC (children's), FDA (food/cosmetics)
EU marketplace  → CE marking, RoHS, REACH, WEEE
UK marketplace  → UKCA (post-Brexit CE equivalent)
Japan           → PSE (electrical), PSC (safety)
Australia       → SAA (electrical), TGA (therapeutic goods)
```

### 12. Alibaba Supply Density

| Attribute | Detail |
|-----------|--------|
| **Definition** | Number of active Alibaba.com suppliers offering similar products and their FOB price range |
| **Data Source** | `product_supplier_search` → `alibaba_supply.csv` |
| **Calculation** | Count suppliers returned; compute min/max/median FOB price from alibaba_supply.csv |
| **Business Meaning** | High supply density + narrow price range = commoditized market (GGS supplier must differentiate on quality/certification/customization). Low density = blue ocean on supply side = GGS supplier can command premium FOB. |
| **Output Format** | Integer + USD range — e.g. `"120+ suppliers, FOB $3.50–$12.00"` |

---

## Indicator Data Framework Template

```markdown
| Indicator | Value | Derivation Logic |
|-----------|-------|------------------|
| **Main KW** | "{keyword}" | {derivation} |
| **Category** | {category} | Dominant category from product_database. |
| **Search Volume** | {volume} | `monthly_search_volume_exact` for Main KW. |
| **Top 1 Seller Revenue** | ${revenue} | Daily Sales ({daily}) × Price (${price}) × 30. |
| **$5K+ Listings** | {count} | Count of ASINs with monthly revenue > $5,000. |
| **Avg Price / Weight / FBA** | ${price} / {weight} lbs / ${fba} | Mean values from competitors.csv. |
| **Avg Reviews / Rating** | {reviews} / {rating} | Mean from Top {n} products. |
| **Monopoly** | {emoji} {classification} (Top 1: {share}%) | {description} |
| **Seasonality** | {classification} (CV: {cv}) | CV = {cv} {comparison} 0.5 threshold. |
| **PPC Bid / Conv.** | ${min} - ${max} / {conv}% | Bid range from keywords_market.csv. |
| **Buyer Market & Compliance** | {market}: {certifications} | Inferred from marketplace + category. |
| **Alibaba Supply Density** | {count} suppliers, FOB ${min}–${max} | From product_supplier_search results. |
```

---

## Data Quality Checks

Perform these data quality checks when computing each indicator:

| Check | Action |
|-------|--------|
| Empty data | Mark as "Data unavailable", do not force calculation |
| Insufficient data points | Mark as "Insufficient data", explain required count |
| Outliers | Exclude price=0, extreme high values, etc. |
| Data inconsistency | Cross-validate multiple sources, note discrepancies |

---

## Implementation Reference

- Indicator calculation script → `scripts/analyze_indicators.py`
- Data collection script → `scripts/collect_js_data.py`
