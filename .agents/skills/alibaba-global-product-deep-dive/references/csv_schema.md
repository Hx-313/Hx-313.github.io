# CSV Schema Definitions

Both CSVs are MANDATORY deliverables. Do NOT merge them. Do NOT skip either one.

## `final_recommendations.csv`

| Column | Description | Required |
|--------|-------------|----------|
| asin | Amazon Standard Identification Number | ✅ |
| title | Product title | ✅ |
| brand | Brand name | ✅ |
| price | Current listing price (USD) | ✅ |
| sales_cnt_30d | Estimated units sold in last 30 days | ✅ |
| rating | Average star rating (e.g., 4.5) | ✅ **MUST fill** |
| reviews | Total review count (e.g., 1234) | ✅ **MUST fill** |
| net_margin_pct | Estimated buyer net margin % (Retail Price − FBA − Commission − Ad Cost − Freight − FOB = Net Margin) | ✅ |
| prodUrl | `https://www.amazon.com/dp/{asin}` | ✅ |
| imageUrl | Product image URL | ✅ |
| recommendation_source | One of: `analysis-driven`, `data-filtered`, `search` | ✅ |
| recommendation_reason | Why this product was recommended (from GGS supplier perspective) | ✅ |
| reference_id | Reference ID from `info_search` shopping results. Empty for products not found in shopping search. | ⚠️ Fill when available |

⚠️ Every row MUST have all columns filled. Do NOT leave rating/reviews empty.

## `alibaba_supply.csv`

| Column | Description | Required |
|--------|-------------|----------|
| title | Product title on Alibaba | ✅ |
| supplier_name | Supplier/manufacturer name | ✅ |
| price_min | Minimum unit price FOB (USD) | ✅ |
| price_max | Maximum unit price FOB (USD) | ✅ |
| moq | Minimum order quantity | ✅ |
| supplier_rating | Supplier rating/score | ✅ |
| url | Product page URL on Alibaba | ✅ |
| target_market | Primary buyer market(s) this product targets (e.g., US, EU, JP) | ⚠️ Fill when inferable |
| compliance_certs | Known certifications offered (e.g., CE, FCC, RoHS) | ⚠️ Fill when available |
| reference_id | Reference ID from `product_supplier_search`. | ⚠️ Fill when available |
