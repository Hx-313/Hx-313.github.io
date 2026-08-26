# Analysis Criteria

Qualitative thresholds for market analysis dimensions. Used in the narrative report and sub-question analysis.

---

## Market/Customer

| Metric | Large | Medium | Small |
|--------|-------|--------|-------|
| Search Volume | >10K/mo | 5K-10K | <5K |
| Top Seller Revenue | >$100K/mo | $50K-$100K | <$50K |

- Pain points clear and fixable? → Strong demand
- Unmet needs in reviews? → Differentiation opportunity

**Verdict**: Market Size + Customer Demand (Strong/Moderate/Weak) + Market Health (Healthy/Moderate/Risky)

---

## Competition

| Metric | Low | Medium | High |
|--------|-----|--------|------|
| Effective Competitors | <50 | 50-200 | >200 |
| Top 5 Market Share | <40% | 40-60% | >60% |
| Top 10 Avg Reviews | <500 | 500-1000 | >1000 |
| PPC CPC | <$1 | $1-$2 | >$2 |

- Amazon in Top 10 → Higher barrier for retail buyers; indicates strong brand competition that buyers must overcome
- High review count (>1000 avg) → Buyers need differentiated products to earn reviews faster; GGS suppliers should offer quality improvements

**Verdict**: Retail Competition Level + Entry Barriers for Buyers + Top 3 Product Differentiation Opportunities (for GGS suppliers to offer buyers)

---

## Trends

| YoY Change | Classification |
|------------|----------------|
| >10% growth | Growing |
| -5% to +10% | Stable |
| <-5% | Declining |

| Seasonal Variance (CV) | Assessment |
|------------------------|------------|
| CV ≤ 0.5 | Non-seasonal (year-round demand) |
| CV > 0.5 | Seasonal |
| < 12 data points | Insufficient data |

> CV = standard deviation / mean of weekly search volumes over 12+ months.
> Matches the threshold in `analyze_indicators.py` (`CV_THRESHOLD = 0.5`).

**Verdict**: Growth Trend + Seasonality + Market Stage (Introduction/Growth/Maturity/Decline)

---

## B2B Supplier Margin Proof

> For GGS suppliers: use Amazon retail price and all buyer-side costs to demonstrate profit space.
> Full formula: Buyer Net Margin = Amazon Retail Price − FBA Fee (∼$5-8) − Platform Commission (∼15%) − Ad Cost − Sea Freight per unit − FOB Price

| Buyer Net Margin | Assessment |
|------------------|------------|
| >35% of retail price | Strong profit space — easy to convince buyer |
| 20-35% | Acceptable — highlight product differentiation |
| <20% | Tight — lower FOB or offer higher-value differentiation |

| Risk | Low | Medium | High |
|------|-----|--------|------|
| Buyer MOQ Acceptance | MOQ <500 | 500-2000 | >2000 |
| Market Entry Capital for Buyer | <$5K | $5K-$15K | >$15K |
| Product Weight (freight mode) | <0.5 kg (air viable) | 0.5-2 kg (air marginal) | >2 kg (sea required) |

**Verdict**: Buyer Margin Viability + MOQ Feasibility + Freight Mode + Risk Level for Buyer

---

## Buyer Market & Compliance

| Primary Market | Key Certifications | Risk if Missing |
|----------------|-------------------|----------------|
| US | FCC (electronics), UL (electrical), CPSC (children's), FDA (food/cosmetics) | Amazon listing removal, customs hold |
| EU | CE marking, RoHS, REACH, WEEE | Market ban, buyer liability |
| UK | UKCA | Cannot sell post-Brexit without it |
| Japan | PSE (electrical), PSC (safety) | Customs rejection |
| Australia | SAA (electrical), TGA (therapeutic) | Regulatory fine |

**Verdict**: Required certifications + whether GGS supplier can offer pre-certified products as a competitive advantage

---

## Alibaba Supply-Side Competition

| Supply Density | FOB Price Spread | Assessment |
|----------------|-----------------|------------|
| <50 suppliers | Wide (>3x range) | Blue ocean — GGS supplier can differentiate and command premium |
| 50-200 suppliers | Moderate | Competitive — differentiate on quality, certification, or customization |
| >200 suppliers | Narrow (<1.5x range) | Commoditized — GGS supplier must offer unique value or accept thin margin |

**Verdict**: Supply-side saturation level + recommended differentiation strategy for GGS supplier
