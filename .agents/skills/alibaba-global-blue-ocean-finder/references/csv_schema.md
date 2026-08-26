# CSV Schema Definitions

Both CSVs are MANDATORY deliverables. Do NOT merge them. Do NOT skip either one.

## `blue_ocean_products.csv`

| Column | Description | Required |
|--------|-------------|----------|
| product_name | Product name (fine-grained SKU level) | ✅ |
| platform | Source platform (Amazon / Temu / Alibaba / TikTok Shop) | ✅ |
| price | Current listing price (USD) | ✅ |
| monthly_sales | Estimated monthly sales volume | ✅ |
| blue_ocean_score | Composite Blue Ocean Score (1.0-5.0) | ✅ |
| demand_score | Demand intensity (1-5) | ✅ |
| competition_score | Competition density (1-5) | ✅ |
| growth_score | Growth slope (1-5) | ✅ |
| opportunity_segment | Which blue ocean segment this belongs to | ✅ |
| differentiation_angle | Key differentiation opportunity | ✅ |
| prodUrl | Product page URL | ✅ |
| imageUrl | Product image URL | ✅ |

## `alibaba_supply.csv`

| Column | Description | Required |
|--------|-------------|----------|
| title | Product title on Alibaba | ✅ |
| supplier_name | Supplier/manufacturer name | ✅ |
| price_min | Minimum unit price (USD) | ✅ |
| price_max | Maximum unit price (USD) | ✅ |
| moq | Minimum order quantity | ✅ |
| supplier_rating | Supplier rating/score | ✅ |
| url | Product page URL on Alibaba | ✅ |
