# Jungle Scout MCP API Reference

Field definitions and tool parameters for the 6 Jungle Scout MCP tools.

---

## Authentication

Authentication is handled server-side by the MCP server.
The Agent does not need to handle credentials — just call the MCP tools with business parameters.

---

## How to Call

All Jungle Scout tools are called via the MCP tool interface:

```json
{
  "action": "mcp",
  "name": "<tool_name>",
  "arguments": { ... }
}
```

The response is a JSON string containing the full API response:
```json
{
  "data": [ { "id": "...", "type": "...", "attributes": { ... } }, ... ],
  "links": { "self": "...", "next": "..." },
  "meta": { "total_items": 3838 }
}
```

Save the **entire response** to `raw_*.json` — `collect_js_data.py` auto-unwraps the `data` envelope.

---

## 1. 产品数据库

**Use for**: Finding products by category, keywords, price, sales volume.

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `marketplace` | string | No (default "us") | us/uk/ca/de/fr/it/es/mx/jp/in |
| `include_keywords` | list[str] | Yes | **Must be JSON array**, e.g. `["yoga mat"]` |
| `exclude_keywords` | list[str] | No | |
| `categories` | list[str] | No | **Must be JSON array**, e.g. `["Sports & Outdoors"]` |
| `min_price` / `max_price` | float | No | USD |
| `min_revenue` / `max_revenue` | float | No | Monthly revenue filter |
| `page_size` | int | No (default 50) | Max 50 |

### Response Fields (in `attributes`)

| Attribute | Type | Notes |
|-----------|------|-------|
| `title` | str | NOT `product_name` |
| `brand` | str | |
| `price` | float | USD |
| `approximate_30_day_units_sold` | int | NOT `monthly_sales` |
| `approximate_30_day_revenue` | float | |
| `reviews` | int | |
| `rating` | float | 1.0-5.0 |
| `listing_quality_score` | float | 0-10 |
| `seller_type` | str | AMZ/FBA/FBM |
| `image_url` | str | Product image |
| `product_rank` | int | BSR |
| `category` | str | |
| `parent_asin` | str | For deduplication |

`id` field format: `"us/B0F1M6LB5R"` — strip marketplace prefix to get bare ASIN.

---

## 2. 关键词搜索量

**Use for**: Keyword research, search volume, PPC bids.

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `search_terms` | str | Yes | Keyword to research |
| `marketplace` | string | No (default "us") | |
| `categories` | list[str] | No | Filter by category |
| `page_size` | int | No (default 50) | Max 50 |

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | str | Keyword phrase |
| `monthly_search_volume_exact` | int | Exact match volume |
| `monthly_search_volume_broad` | int | Broad match volume |
| `ppc_bid_exact` | float | PPC bid USD (may be absent for some keywords) |
| `ease_of_ranking_score` | float | 1-100, higher=easier |
| `organic_product_count` | int | Competing products |

---

## 3. 历史搜索趋势

**Use for**: Keyword search volume trends over time, seasonality analysis.

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `keyword` | str | Yes | |
| `start_date` | str | Yes | YYYY-MM-DD format |
| `end_date` | str | Yes | YYYY-MM-DD format |
| `marketplace` | string | No (default "us") | |

Response: weekly data points with `date`, `estimated_exact_search_volume`.

---

## 4. 销量估算

**Use for**: Historical sales trends, daily granularity.

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `asin` | str | Yes | Single ASIN (bare, no prefix) |
| `start_date` | str | Yes | YYYY-MM-DD |
| `end_date` | str | Yes | YYYY-MM-DD |
| `marketplace` | string | No (default "us") | |

Response: daily data with `date`, `estimated_units_sold`, `last_known_price`.
Not all ASINs have data — may return empty or error.

---

## 5. 品牌份额

**Use for**: Brand dominance, market concentration.

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `keyword` | str | Yes | |
| `marketplace` | string | No (default "us") | |

Response: `attributes.brands[]` with `brand`, `combined_weighted_sov`, `organic_products`, `sponsored_products`.

---

## 6. ASIN关键词

**Use for**: Finding keywords an ASIN ranks for.

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `asins` | list[str] | Yes | **List of ASINs**, e.g. `["B0XXXXXX"]` |
| `marketplace` | string | No (default "us") | |
| `include_variants` | bool | No (default true) | |
| `page_size` | int | No (default 50) | |

### Response Fields

| Field | Type |
|-------|------|
| `name` | str |
| `monthly_search_volume_exact` | int |
| `ppc_bid_exact` | float |
| `organic_rank` | int |
| `sponsored_rank` | int |

---

## Supported Marketplaces

`us`, `uk`, `ca`, `de`, `fr`, `in`, `it`, `es`, `mx`, `jp`

---

## Error Handling

| Scenario | Action |
|----------|--------|
| MCP timeout (90s) | Retry once |
| Empty response | Mark as "Data unavailable", continue pipeline |
| ASIN not found (sales_estimates) | Skip, proceed with other data |
| Auth error | Server-side issue — report to user |
