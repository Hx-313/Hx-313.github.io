# Sub-Question Templates

Template library for sub-question generation, organized by question type.

> This document expands on the SKILL.md Quick Reference with complete sub-question templates and answering workflows.

---

## Sub-Question Generation Flow

```
Indicator Framework → Identify Question Type → Generate 8 Sub-Questions → Save subquestions.json
```

1. **Identify Type**: Detect question type from user query keywords
2. **Generate Questions**: Generate 8 sub-questions (one per standard dimension defined in SKILL.md Step 4)
3. **Save**: Save to `round-{N}/reports/subquestions.json`
4. **Answer (Step 5)**: Agent reads CSV data + indicators → constructs SubQuestionAnswer objects directly
5. **Output**: Structured answers (`subquestion_answers.json`) feed into `final_report.md` Section 3 (Deep-Dive Analysis)

---

## Question Type Detection

Identify question type based on keywords in user query:

| Type | Trigger Keywords (EN) | Trigger Keywords (ZH) | Focus Areas |
|------|----------------------|----------------------|-------------|
| **Market Opportunity** | blue ocean, opportunity, potential, discover, find, niche | 蓝海, 机会, 潜力, 发现, 寻找, 利基, 商机 | Demand gaps, low-competition niches, growth trends |
| **Competitive Analysis** | competitor, ASIN, rival, analyze, compare | 竞争, 竞品, 对手, 分析, 对比, 比较 | Competitor keywords, brand share, sales trends |
| **Product Validation** | validate, worth, feasible, enter, evaluate | 验证, 值得, 可行, 进入, 评估, 能不能做, 能做吗 | Market size, competition level, profit margins |
| **Ad & Traffic** | ads, PPC, traffic, bid, conversion, promote | 广告, 流量, 竞价, 转化, 推广, 投放 | B2B pricing analysis using PPC/bid data to calculate buyer margin and FOB ceiling. NOT Amazon ad strategy. |
| **Trend & Seasonality** | trend, seasonal, growth, change, cycle, fluctuation | 趋势, 季节, 增长, 变化, 周期, 波动 | Search volume trends, peak/trough timing |

Default: **Product Validation**.

---

## Dimension-to-Indicator Mapping

When generating sub-questions, use indicator anomalies to inspire targeted questions:

| Dimension | Indicator Pattern | Inspired Sub-Question |
|-----------|-------------------|----------------------|
| Market Size & Demand | Search Volume = 148K, YoY +12% | "What is the 12-month search volume trend and long-tail keyword potential?" |
| Competitive Landscape | Monopoly = 🔴 (Top1 > 30%) | "How concentrated is brand share? Is there room for a new entrant?" |
| Demand Seasonality & Stability | Seasonality CV > 0.5 | "What are the peak and trough months? Seasonal or year-round strategy?" |
| Margin Analysis | Avg Price = $30.35, FBA = $5.42 | "Given avg price and FBA fees, what is the estimated net margin?" |
| Barrier to Entry | Avg Reviews > 1000 | "Is the review barrier too high? Can new entrants compete?" |
| Buyer Market & Compliance | PPC Bid range wide ($0.42–$4.71) | "Which countries are the primary buyers for this product? What certifications are required for those markets, and can a GGS supplier use certification as a B2B competitive advantage?" |
| Niche Opportunities | Multiple sub-categories detected | "Are there underserved sub-niches with lower competition?" |
| User Pain-Points | Low avg rating in segment | "What are the common pain points from negative reviews?" |

---

## Type 1: Market Opportunity Discovery

### Core Focus
- Where are the demand gaps?
- Which segments have lower competition?
- What are the growth trends?

### Sub-Question Templates

#### Q1: Keyword Search Volume Trend Analysis
**Question**: For products in {category} with {filters}, are the core keyword search volumes trending up or down?

**Data Sources**: 
- `historical_search_volume` → keyword_trends.csv

**Analysis Steps**:
1. Extract target keyword list
2. Get 12-month search volume time series
3. Calculate growth rate = (recent 3-month avg - prior 3-month avg) / prior 3-month avg
4. Plot trend chart, annotate growth/decline periods

**Output**: Trend chart + growth rate classification (growing/stable/declining)

---

#### Q2: Retail vs B2B Concentration Analysis
**Question**: In the search results for these keywords, is the top brand share highly concentrated on Amazon? How does this compare to B2B supplier concentration on Alibaba?

**Data Sources**: 
- `share_of_voice` → market_concentration.csv
- `product_supplier_search` → alibaba_supply.csv

**Analysis Steps**:
1. Get share_of_voice data for each keyword to calculate Amazon brand concentration
2. Analyze Alibaba supplier distribution (e.g., are inquiries/sales concentrated in a few factories?)
3. Compare retail brand monopoly vs wholesale supply diversity

**Output**: Brand share bar chart + concentration rating

---

#### Q3: Low-Rating Opportunity Mining
**Question**: Among keywords with {threshold}+ search volume and sustained growth, which have products with average rating below 4.2 in the top 3 pages?

**Data Sources**: 
- `keywords_by_keyword` → keywords_market.csv
- `product_database` → competitors.csv

**Analysis Steps**:
1. Filter keywords with search volume > threshold
2. Cross-validate growth trend (from Q1)
3. Get product list for these keywords
4. Calculate average rating, filter < 4.2

**Output**: Low-rating opportunity list (keyword + avg rating + search volume)

---

#### Q4: Buyer Country & Market Focus
**Question**: Based on the Amazon marketplace data, which countries or regions are the primary buyers for this product? What does this imply for a GGS supplier's target market on Alibaba.com?

**Data Sources**: 
- `product_database` → competitors.csv (marketplace field)
- `keywords_by_keyword` → keywords_market.csv

**Analysis Steps**:
1. Identify the primary Amazon marketplace (US/UK/DE/JP/etc.) from the data
2. Infer buyer geography from marketplace concentration
3. Map to Alibaba.com KWA ad targeting recommendations
4. Note any compliance/certification requirements for those markets (CE for EU, FCC for US, PSE for Japan, etc.)

**Output**: Primary buyer market list + Alibaba.com targeting recommendation + compliance checklist

---

#### Q5: Alibaba Supply-Side Competition Density
**Question**: How many suppliers on Alibaba.com are currently offering similar products? Is the supply side saturated or is there room for a GGS supplier to differentiate?

**Data Sources**: 
- `product_supplier_search` → alibaba_supply.csv

**Analysis Steps**:
1. Search Alibaba.com for the main keyword and related terms
2. Count the number of active suppliers and their price range
3. Assess supply-side concentration: are prices clustered (commoditized) or spread (differentiation opportunity)?
4. Identify gaps: price tiers, customization options, or certifications underserved by current suppliers

**Output**: Alibaba supply density assessment + differentiation gap analysis (for GGS supplier positioning)

---

#### Q6: Margin & Price Positioning (B2B Perspective)
**Question**: Given the average Amazon retail price and FBA fees, what is the buyer's net margin at different FOB price points? What FOB price ceiling should a GGS supplier target to ensure the buyer maintains at least 25-35% net margin?

**Data Sources**: 
- `product_database` → competitors.csv

**Analysis Steps**:
1. Calculate three retail price tiers (25th/50th/75th percentile) from competitor pool
2. Estimate FBA fee from weight/dimensions (∼$5-8) + platform commission (∼15%)
3. Calculate buyer net margin = Retail Price − FBA Fee − Platform Commission − Estimated Ad Cost − FOB Price
4. Identify the FOB price ceiling that preserves buyer margin ≥25%
5. This is the GGS supplier's B2B pricing argument

**Output**: Three-tier buyer margin table (Retail Price − FBA − Commission − FOB = Net Margin) + recommended FOB price range for GGS supplier

---

#### Q7: Entry Barrier Assessment
**Question**: What is the average review count and rating for the top 20 products? How high is the barrier for a new entrant?

**Data Sources**: 
- `product_database` → competitors.csv

**Analysis Steps**:
1. Get Top 20 products by sales
2. Calculate average reviews and rating
3. Assess barrier: <500 reviews = low, 500-2000 = medium, >2000 = high

**Output**: Review/rating distribution + barrier rating

---

#### Q8: User Pain-Point Mining
**Question**: Among the top products, which have ratings below 4.2? What common complaints might indicate differentiation opportunities?

**Data Sources**: 
- `product_database` → competitors.csv

**Analysis Steps**:
1. Filter products with rating < 4.2
2. Cross-reference with sales volume (high sales + low rating = pain-point opportunity)
3. Identify product categories with consistent low ratings

**Output**: Pain-point opportunity list (product + rating + sales volume)

---

## Type 2: Competitive Analysis

> **GGS Supplier Note**: In this context, "competitors" refers to Amazon retail products (the buyer's competitive landscape), NOT other Alibaba.com suppliers. The goal is to understand what Amazon buyers are competing against, so GGS suppliers can offer differentiated products and better pricing.

### Core Focus
- What are the retail competitor's traffic sources? (to understand buyer demand patterns)
- What are the retail competitor's sales and pricing strategies? (to calculate buyer margin)
- Which keywords are not covered by retail competitors? (to identify niche opportunities for buyers)

### Sub-Question Templates

#### Q1: Competitor Keyword Matrix
**Question**: What are the top-ranking keywords for competitor {ASIN}? What's this competitor's organic search share rank for these keywords?

**Data Sources**: 
- `keywords_by_asin` → asin_keywords.csv
- `share_of_voice` → market_concentration.csv

**Analysis Steps**:
1. Call keywords_by_asin to get competitor keywords
2. Sort by organic_rank
3. Call share_of_voice for Top 10 keywords
4. Locate competitor's share rank for each keyword

**Output**: Keyword traffic matrix table

---

#### Q2: Sales & Price Fluctuation
**Question**: How did this ASIN's sales and price fluctuate over the past 30 days? Are there signs of a price war?

**Data Sources**: 
- `sales_estimates` → asin_sales.csv

**Analysis Steps**:
1. Get 30-day sales and price time series
2. Calculate price volatility = std(price) / mean(price)
3. Detect price decline trend
4. Plot dual-axis chart (sales + price)

**Output**: Sales/price fluctuation chart + price war risk assessment

---

#### Q3: Keyword Gap Analysis
**Question**: What related long-tail keywords are not covered by this competitor?

**Data Sources**: 
- `keywords_by_keyword` → keywords_market.csv
- `keywords_by_asin` → asin_keywords.csv

**Analysis Steps**:
1. Get expanded keyword list for main keyword
2. Get keywords already covered by competitor
3. Calculate difference = expanded keywords - competitor keywords
4. Sort by search volume

**Output**: Keyword gap list (uncovered keywords + search volume)

---

#### Q4: Multi-Competitor Comparison
**Question**: Comparing ASIN A and ASIN B, what keywords do they both cover? How different are their search rankings on these shared keywords?

**Data Sources**: 
- `keywords_by_asin` (multiple ASINs)

**Analysis Steps**:
1. Get keywords for both ASINs separately
2. Calculate intersection
3. Compare organic_rank for each shared keyword
4. Calculate ranking difference

**Output**: Keyword overlap analysis table

---

#### Q5: Listing Quality Assessment
**Question**: What's the competitor's Listing Quality Score? What optimization opportunities exist?

**Data Sources**: 
- `product_database` → competitors.csv

**Analysis Steps**:
1. Get competitor's listing_quality_score
2. Compare with category average
3. Identify dimensions below average

**Output**: LQS score + optimization recommendations

---

#### Q6: Seasonality & Demand Stability
**Question**: Does the competitor's product category show seasonal demand patterns? How stable is search volume over 12 months?

**Data Sources**: 
- `historical_search_volume` → keyword_trends.csv

**Analysis Steps**:
1. Get 12-month search volume for competitor's main keywords
2. Calculate CV (coefficient of variation)
3. Classify: CV > 0.5 = seasonal, CV ≤ 0.5 = non-seasonal

**Output**: Seasonality classification + trend chart

---

#### Q7: Niche Sub-Category Opportunities
**Question**: Are there sub-niches within the competitor's category that have lower competition but meaningful search volume?

**Data Sources**: 
- `keywords_by_keyword` → keywords_market.csv
- `product_database` → competitors.csv

**Analysis Steps**:
1. Expand keyword list for the category
2. Identify long-tail keywords with high volume but low organic_product_count
3. Cross-reference with competitor's keyword coverage

**Output**: Niche keyword opportunity list

---

#### Q8: Buyer Margin & Pricing Strategy
**Question**: What is the competitor's pricing strategy relative to the category average? What does this imply about the buyer's margin and the FOB price a GGS supplier should offer?

**Data Sources**: 
- `product_database` → competitors.csv

**Analysis Steps**:
1. Compare competitor price vs category average
2. Estimate FBA fees (∼$5-8) + platform commission (∼15%)
3. Calculate buyer net margin = Retail Price − FBA Fee − Commission − FOB Price
4. Identify optimal FOB price range for GGS supplier to offer competitive buyer margin

**Output**: Pricing comparison table + buyer margin estimate + recommended FOB price range

---

## Type 3: Product Validation

### Core Focus
- Is the market size large enough?
- How high is the competition barrier?
- Is the profit margin sufficient?

### Sub-Question Templates

#### Q1: Search Volume Trend Validation
**Question**: What's the search volume trend for '{keyword}' over the past 6 months? Is it growing, stable, or declining?

**Data Sources**: 
- `historical_search_volume` → keyword_trends.csv

**Analysis Steps**:
1. Get 6-12 months of search volume data
2. Calculate trend slope
3. Classify: slope > 0.1 = growing; -0.1~0.1 = stable; < -0.1 = declining

**Output**: Trend chart + trend classification

---

#### Q2: Market Monopoly Assessment
**Question**: In the current top 3 pages of search results, what's the Top 3 brand combined share? Is the market monopolized?

**Data Sources**: 
- `share_of_voice` → market_concentration.csv

**Analysis Steps**:
1. Get share_of_voice data
2. Calculate Top 3 cumulative share
3. Check for Amazon presence

**Output**: Brand share pie chart + monopoly rating

---

#### Q3: Entry Barrier Analysis
**Question**: What's the monthly sales and review count distribution for Top 10 products? How high is the entry barrier?

**Data Sources**: 
- `product_database` → competitors.csv
- `sales_estimates` → asin_sales.csv

**Analysis Steps**:
1. Get Top 10 product data
2. Calculate monthly sales distribution
3. Calculate review count distribution
4. Assess entry barrier

**Output**: Sales/review distribution chart + barrier rating

---

#### Q4: Keyword Expansion
**Question**: What other related keywords (like '{variant_1}', '{variant_2}') have notable search volume worth attention?

**Data Sources**: 
- `keywords_by_keyword` → keywords_market.csv

**Analysis Steps**:
1. Expand search for related keywords
2. Sort by search volume
3. Identify high-potential variant keywords

**Output**: Keyword expansion table

---

#### Q5: Buyer Profit Calculation (B2B Margin Proof)
**Question**: Based on the Amazon retail price range and estimated costs, what net margin can a buyer expect? Does this margin justify sourcing from a GGS supplier at competitive FOB prices?

**Data Sources**: 
- `product_database` → competitors.csv

**Analysis Steps**:
1. Calculate three retail price tiers (25th/50th/75th percentile) from competitors.csv
2. Estimate FBA fee from weight/dimensions (∼$5-8) + platform commission (∼15%)
3. Calculate buyer net margin = Retail Price − FBA Fee − Platform Commission − Estimated Ad Cost − FOB Price
4. Identify FOB price ceiling that still gives buyer >25% net margin

**Output**: Three-tier buyer margin table (Retail Price − FBA − Commission − FOB = Net Margin) + recommended FOB price range for GGS supplier

---

#### Q6: Demand Seasonality
**Question**: Is '{keyword}' a seasonal product? What are the peak and trough months?

**Data Sources**: 
- `historical_search_volume` → keyword_trends.csv

**Analysis Steps**:
1. Get 12-month search volume time series
2. Calculate CV (coefficient of variation)
3. Identify peak and trough months
4. Classify: CV > 0.5 = seasonal, CV ≤ 0.5 = non-seasonal

**Output**: Seasonality classification + peak/trough months + trend chart

---

#### Q7: Niche Differentiation Opportunities
**Question**: Are there underserved sub-niches within the '{keyword}' market with lower competition?

**Data Sources**: 
- `keywords_by_keyword` → keywords_market.csv
- `product_database` → competitors.csv

**Analysis Steps**:
1. Identify long-tail keyword variants
2. Filter by high search volume + low organic_product_count
3. Check if existing products in these niches have low ratings (< 4.2)

**Output**: Niche opportunity list (keyword + volume + competition + avg rating)

---

#### Q8: User Pain-Points & Review Analysis
**Question**: What are the common pain points among top-selling products? Are there quality gaps that a GGS supplier could address to offer buyers a differentiated product?

**Data Sources**: 
- `product_database` → competitors.csv

**Analysis Steps**:
1. Identify products with high sales but rating < 4.3
2. Calculate the gap between best-rated and worst-rated products
3. Assess whether quality differentiation is viable

**Output**: Pain-point opportunity assessment + differentiation recommendations

---

## Type 4: B2B Pricing & Market Positioning

> **Purpose**: This type is triggered when the user asks about pricing, ad costs, or market entry difficulty. The goal is NOT to advise on Amazon advertising strategy, but to use PPC/traffic data to calculate the buyer's profit margin and help the GGS supplier set a competitive FOB price.

### Sub-Question Templates

#### Q1: Buyer Margin Calculation
**Question**: Given the average retail price and PPC bid range for keyword '{keyword}', what net margin can a buyer expect? What FOB price ceiling should a GGS supplier target to ensure buyer margin ≥25%?

**Data Sources**: 
- `keywords_by_keyword` → keywords_market.csv
- `product_database` → competitors.csv

**Analysis Steps**:
1. Get average retail price from competitors.csv
2. Get ppc_bid_exact range from keywords_market.csv
3. Estimate buyer costs: FBA fee (∼$5-8) + platform commission (∼15%) + estimated ad cost
4. Calculate: Buyer Net Margin = Retail Price − FBA − Commission − Ad Cost − FOB Price
5. Solve for FOB ceiling where buyer margin = 25%

**Output**: Three-tier buyer margin table (at 25th/50th/75th percentile retail price) + recommended FOB price range for GGS supplier

---

#### Q2: Shipping Cost Impact on FOB Ceiling
**Question**: Given the average product weight and dimensions, what is the estimated sea/air freight cost per unit? How does this affect the buyer's landed cost and the FOB price a GGS supplier can charge?

**Data Sources**: 
- `product_database` → competitors.csv (weight, dimensions)

**Analysis Steps**:
1. Get average weight and dimensions from competitors.csv
2. Estimate sea freight cost per unit (CBM-based, ∼$1-3/kg sea, ∼$4-8/kg air)
3. Add to buyer's cost structure: Landed Cost = FOB + Freight + Tariff
4. Recalculate buyer net margin with freight included
5. Identify whether sea or air freight is viable for this product's weight/value ratio

**Output**: Freight cost estimate + adjusted buyer margin table + sea vs air recommendation

---

#### Q3: Brand Concentration & Buyer Entry Difficulty
**Question**: How concentrated is brand share on Amazon? Does this make it harder for buyers to enter, and does it affect the FOB price GGS suppliers can command?

**Data Sources**: 
- `share_of_voice` → market_concentration.csv

**Analysis Steps**:
1. Get top brand share distribution
2. Assess: high concentration = buyers need differentiated products to compete = GGS suppliers with unique features can charge premium FOB
3. Assess: fragmented market = buyers can enter with standard products = price competition on FOB

**Output**: Brand concentration assessment + FOB pricing implication for GGS supplier

---

#### Q4: Low-Competition Keyword Niches for Buyer Targeting
**Question**: Among related long-tail keywords, which have decent search volume but lower competition? These represent lower-cost entry points for buyers, which validates demand for GGS suppliers.

**Data Sources**: 
- `keywords_by_keyword` → keywords_market.csv

**Analysis Steps**:
1. Get expanded keyword list
2. Filter keywords with ppc_bid_exact < category median AND search volume > 1,000
3. Calculate opportunity score = search_volume / organic_product_count
4. These niches = buyers can enter with lower ad spend = GGS supplier can pitch these as low-barrier opportunities

**Output**: Low-competition niche keyword list + buyer entry cost estimate + GGS supplier pitch angle

---

#### Q5: Compliance & Certification Requirements
**Question**: What compliance certifications are required for this product in the primary buyer market? What risk does non-compliance pose for buyers, and how can GGS suppliers use certification as a competitive advantage?

**Data Sources**: 
- `product_database` → competitors.csv (marketplace, category)

**Analysis Steps**:
1. Identify primary marketplace (US/EU/UK/JP/AU) from competitors.csv
2. Map product category to known certification requirements:
   - US: FCC (electronics), UL (electrical), CPSC (children's products), FDA (food/cosmetics)
   - EU: CE marking, RoHS, REACH, WEEE
   - UK: UKCA (post-Brexit)
   - Japan: PSE (electrical), PSC (safety)
3. Assess whether top-selling ASINs show certification badges
4. Identify if certification is a differentiator or table-stakes

**Output**: Compliance requirement checklist by market + certification-as-differentiator assessment

---

#### Q6: Entry Barrier via Reviews
**Question**: What is the average review count for the top 20 products? What does this mean for the buyer's market entry difficulty, and how should a GGS supplier position their product to help buyers overcome this barrier?

**Data Sources**: 
- `product_database` → competitors.csv

**Analysis Steps**:
1. Get Top 20 products by sales
2. Calculate average and median review counts
3. Assess barrier: <500 = low, 500-2000 = medium, >2000 = high
4. Translate to GGS supplier pitch: high review barrier = buyers need better product quality to earn reviews faster

**Output**: Review barrier assessment + GGS supplier product quality pitch angle

---

#### Q7: Alibaba Supplier Price Benchmarking
**Question**: What is the current FOB price range on Alibaba.com for this product? Is there a price tier gap that a GGS supplier could fill?

**Data Sources**: 
- `product_supplier_search` → alibaba_supply.csv

**Analysis Steps**:
1. Collect FOB price range from alibaba_supply.csv
2. Segment into low/mid/premium tiers
3. Cross-reference with buyer margin calculation from Q1
4. Identify which price tier offers the best balance of buyer margin and GGS supplier profitability

**Output**: FOB price tier map + recommended positioning for GGS supplier

---

#### Q8: Product Quality Gaps as B2B Differentiation Opportunities
**Question**: Are there product quality gaps (low ratings, high sales) that GGS suppliers can address to offer buyers a differentiated product with better margin potential?

**Data Sources**: 
- `product_database` → competitors.csv

**Analysis Steps**:
1. Filter products with high sales + rating < 4.2
2. Identify categories with consistent quality complaints
3. Assess how a GGS supplier can offer improved quality at competitive FOB prices
4. Frame as B2B pitch: "Our product addresses these quality gaps, giving your buyers better reviews and repeat purchases"

**Output**: Pain-point driven differentiation opportunity list (for GGS supplier B2B pitch)

---

## Type 5: Trend & Seasonality

### Sub-Question Templates

#### Q1: 12-Month Search Curve
**Question**: What does the search volume curve for keyword '{keyword}' look like over the past 12 months?

**Data Sources**: 
- `historical_search_volume` → keyword_trends.csv

**Output**: 12-month trend chart + peak/trough annotations

---

#### Q2: Seasonal Brand Shift
**Question**: During peak search periods, how does the top brand share distribution compare to off-season?

**Data Sources**: 
- `share_of_voice` (multiple time points)

**Output**: Peak vs off-season brand share comparison

---

#### Q3: Peak vs Trough Sales Comparison
**Question**: How much did sales drop for top-ranking ASINs during peak season compared to off-season?

**Data Sources**: 
- `sales_estimates` → asin_sales.csv

**Output**: Peak vs trough sales comparison table

---

#### Q4: Seasonality Coefficient
**Question**: What's the seasonality coefficient for this category? Is it suitable for year-round operation or seasonal stocking?

**Data Sources**: 
- `historical_search_volume` → keyword_trends.csv

**Output**: CV value + operational recommendation

---

#### Q5: Counter-Seasonal Keywords
**Question**: Are there counter-seasonal related keywords that could balance year-round sales?

**Data Sources**: 
- `keywords_by_keyword` + `historical_search_volume`

**Output**: Counter-seasonal keyword list

---

#### Q6: Competitive Landscape Shifts
**Question**: Has the brand concentration changed over the past year? Are new brands gaining share?

**Data Sources**: 
- `share_of_voice` → market_concentration.csv

**Analysis Steps**:
1. Get current brand share distribution
2. Identify brands with low share but high growth signals (new entrants)
3. Assess whether market is consolidating or fragmenting

**Output**: Brand share trend analysis + new entrant assessment

---

#### Q7: Margin Stability Across Seasons
**Question**: How does pricing fluctuate between peak and off-season? Does margin remain viable year-round?

**Data Sources**: 
- `product_database` → competitors.csv
- `historical_search_volume` → keyword_trends.csv

**Analysis Steps**:
1. Identify peak and off-season periods from search volume data
2. Compare average prices during peak vs off-season (if historical price data available)
3. Estimate margin impact of seasonal price changes

**Output**: Seasonal pricing analysis + margin stability assessment

---

#### Q8: Pain-Points & Quality Gaps
**Question**: Do top products show quality issues (low ratings) that a new entrant could address with better product design?

**Data Sources**: 
- `product_database` → competitors.csv

**Analysis Steps**:
1. Filter top 20 products by sales
2. Identify those with rating < 4.3
3. Calculate the rating gap between category leaders and laggards

**Output**: Quality gap analysis + differentiation opportunity

---

## Sub-Question Generation Rules

1. **Quantity Control**: Generate exactly 8 sub-questions (one per standard dimension defined in SKILL.md Step 4)
2. **Fixed Dimension Order**: Follow the dimension order defined in SKILL.md Step 4 (1=market_size_demand, 2=competitive_landscape, ..., 8=pain_points). Do NOT reorder by importance.
3. **Data Feasibility**: Ensure each question can be answered with available CSV data from Step 2
4. **Avoid Overlap**: Sub-questions should not have redundant coverage
5. **Actionability**: Each answer should lead to specific action recommendations **for GGS B2B suppliers** (e.g., how to price FOB, how to position on Alibaba.com, which buyer countries to target)
6. **GGS Supplier Perspective**: ALL sub-questions and answers MUST be framed from the perspective of a B2B supplier on Alibaba.com. Amazon data is used to reverse-engineer buyer demand and margin space, NOT to advise the user to sell on Amazon.
7. **Product-Level Conclusions**: Where the analysis naturally points to specific products in `competitors.csv` (e.g., weak incumbents, quality gaps, niche leaders), the sub-question should be phrased to guide the Agent toward identifying those ASINs. This is NOT forced for every dimension — only where product-level mapping is natural (typically: competitive_landscape, entry_barrier, niche_opportunities, pain_points).
