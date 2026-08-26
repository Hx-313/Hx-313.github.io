# CSV Schema Definitions

CSV output is **optional** for this skill. Schemas defined here for future use.

## `hot_products.csv`

| Column | Description | Required |
|--------|-------------|----------|
| product_name | Fine-grained SKU name | ✅ |
| platform | Source platform (Alibaba.com / Amazon / Temu / TikTok Shop) | ✅ |
| core_selling_point | Key feature / material / certification | ✅ |
| pain_points | Consumer pain points from reviews | ✅ |
| competition_level | blue_ocean / red_ocean / saturated | ✅ |
| fob_price | Suggested FOB price range (USD) | ✅ |
| retail_price | Reference retail price range (USD) | ✅ |
| estimated_margin | Estimated net margin percentage | ✅ |
| prodUrl | Product page URL | ✅ |
| imageUrl | Product image URL | ✅ |
