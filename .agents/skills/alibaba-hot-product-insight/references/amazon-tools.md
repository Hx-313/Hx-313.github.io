# Amazon 数据工具速查表（Jungle Scout）

**`js_*` 系列工具通过 `accio-mcp-cli call <工具名>` 直接调用（⛔ 禁止用 workctl 调用——workctl 不支持 Amazon 工具），工具名即为调用标识，无需指定 Server 前缀。**

> ⛔ 正确：`accio-mcp-cli call js_product_database_query --json '{...}'`
> ❌ 错误：`accio-mcp-cli call jungle_scout js_product_database_query --json '{...}'`
> ⚠️ **只允许使用本文档中列出的参数。** 不要自己发明参数（如 `exclude_keywords`、`sort_by` 等），API 不支持的参数会被静默忽略，导致结果不符合预期。

## js_product_database_query

产品数据库筛选，返回 Amazon 商品列表。

调用 `js_product_database_query`，入参：

```bash
accio-mcp-cli call js_product_database_query --json '{"include_keywords":["smartphone"],"categories":["Cell Phones & Accessories"],"marketplace":"us","page_size":50}'
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `include_keywords` | string[] | ✅ | 包含词 |
| `categories` | string[] | ❌ | 类目筛选 |
| `marketplace` | string | ❌ | 站点，默认 `us` |
| `page_size` | number | ❌ | 返回数量，默认 50 |
| `min_price` / `max_price` | number | ❌ | 价格区间(USD) |
| `min_revenue` / `max_revenue` | number | ❌ | 月营收区间(USD) |

### categories 可选值

`Appliances`, `Arts, Crafts & Sewing`, `Automotive`, `Baby`, `Beauty & Personal Care`, `Camera & Photo`, `Cell Phones & Accessories`, `Clothing, Shoes & Jewelry`, `Computers & Accessories`, `Electronics`, `Grocery & Gourmet Food`, `Health & Household`, `Home & Kitchen`, `Industrial & Scientific`, `Kitchen & Dining`, `Musical Instruments`, `Office Products`, `Patio, Lawn & Garden`, `Pet Supplies`, `Software`, `Sports & Outdoors`, `Tools & Home Improvement`, `Toys & Games`, `Video Games`

> ⚠️ categories 值必须完全匹配上述列表，大小写和符号敏感。`Cell Phones` ❌ → `Cell Phones & Accessories` ✅

## js_historical_search_volume

历史搜索量趋势。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyword` | string | ✅ | 关键词 |
| `start_date` | string | ✅ | 开始日期 YYYY-MM-DD |
| `end_date` | string | ✅ | 结束日期 YYYY-MM-DD |

## js_sales_estimates

ASIN 销量估算。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `asin` | string | ✅ | 亚马逊 ASIN |
| `start_date` | string | ✅ | 开始日期 YYYY-MM-DD |
| `end_date` | string | ✅ | 结束日期 YYYY-MM-DD |

## js_share_of_voice

品牌声量份额 (SOV)。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyword` | string | ✅ | 目标关键词 |

## js_keywords_by_asin

ASIN 反查关键词。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `asins` | string[] | ✅ | ASIN 列表，如 `["B00I26U9WS"]` |
| `include_variants` | boolean | ❌ | 是否包含变体 |

## js_keywords_by_keyword

关键词拓展/相关词。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `search_terms` | string | ✅ | 种子关键词 |
| `categories` | string[] | ❌ | 类目过滤 |
