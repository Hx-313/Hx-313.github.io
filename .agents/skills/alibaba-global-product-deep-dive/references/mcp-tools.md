# Jungle Scout MCP 工具速查表

**系统参数由平台自动注入，调用时无需传递，只需关注业务参数。**
**通过 MCP 工具接口调用（tool_call，不是 bash 命令）。先用 search 发现工具，再调用。**

## 工具列表

| 工具 | 搜索关键词 | 用途 | 必填业务参数 |
|------|-----------|------|------------|
| 关键词搜索量 | `keywords_by_keyword` | 查询关键词搜索量、竞争度 | `search_terms`, `marketplace`(默认"us"), `page_size` |
| 历史搜索趋势 | `historical_search_volume` | 查询关键词历史搜索量趋势 | `keyword`, `start_date`, `end_date`, `marketplace` |
| 产品数据库 | `product_database` | 按关键词筛选 Amazon 产品 | `include_keywords`(数组), `marketplace`, `page_size` |
| 品牌份额 | `share_of_voice` | 查询搜索结果页品牌占比 | `keyword`, `marketplace` |
| ASIN 关键词 | `keywords_by_asin` | 反查 ASIN 的流量关键词 | `asins`(数组), `marketplace`, `page_size` |
| ASIN 销量估算 | `sales_estimates` | 估算 ASIN 销量和收入 | `asin`, `start_date`, `end_date`, `marketplace` |

## 参数说明

| 参数 | 格式 | 说明 |
|------|------|------|
| `marketplace` | 字符串 | 默认 `"us"`，可选 `"uk"`, `"de"`, `"jp"` 等 |
| `start_date` / `end_date` | `YYYY-MM-DD` | 历史搜索趋势和销量估算必填 |
| `include_keywords` | JSON 数组 | 如 `["yoga mat"]`，不是字符串 |
| `asins` | JSON 数组 | 如 `["B0XXXXXX"]`，不是字符串 |
| `page_size` | 数字 | 建议 50 |

## 必选调用（4 个）

| 步骤 | 搜索关键词 | 输出 CSV |
|------|-----------|---------|
| 1 | `keywords_by_keyword` | `keywords_market.csv` |
| 2 | `historical_search_volume` | `keyword_trends.csv` |
| 3 | `product_database` | `competitors.csv` |
| 4 | `share_of_voice` | `market_concentration.csv` |

## 可选调用（用户提供 ASIN 时）

| 步骤 | 搜索关键词 | 输出 CSV |
|------|-----------|---------|
| 5 | `keywords_by_asin` | `asin_keywords.csv` |
| 6 | `sales_estimates` | `asin_sales.csv` |
