# Jungle Scout MCP Pitfalls

Known runtime behaviors when using Jungle Scout via MCP tools. **Ignoring these causes pipeline failures.**

---

## 1. Authentication — Server-Side Only

Authentication is managed by the MCP server.
The Agent does NOT need credentials, SDK setup, or Gateway calls.
Just call the MCP tools with the required business parameters.

---

## 2. Response Format — JSON String with Envelope

MCP returns a JSON **string** (not a parsed object). The Agent must parse it.
The response has an envelope structure:

```json
{
  "data": [ { "id": "us/B0XXXXXX", "type": "...", "attributes": { ... } } ],
  "links": { "self": "...", "next": "..." },
  "meta": { "total_items": 100 }
}
```

When saving to `raw_*.json` via `write_file`, save the **entire response** as-is.
`collect_js_data.py` auto-unwraps the `data` envelope.

---

## 3. ASIN Format: Marketplace Prefix in `id`

`id` field returns `"us/B0F1M6LB5R"`, NOT a bare ASIN.
`collect_js_data.py` handles this automatically: `raw_id.split('/')[-1]`.

---

## 4. Parameter Name Differences from SDK

MCP tool parameter names differ from the raw SDK in some cases:

| MCP Tool | Parameter | Notes |
|----------|-----------|-------|
| 产品数据库工具 | `include_keywords` | **Must be a JSON array** `["yoga mat"]`, not a string |
| 产品数据库工具 | `categories` | **Must be a JSON array** `["Sports & Outdoors"]` |
| ASIN关键词工具 | `asins` | **List** `["B0XX"]`, not single string `"B0XX"` |
| 关键词搜索量工具 | `search_terms` | String, not list |
| 历史搜索趋势工具 | `start_date`, `end_date` | **Required**, YYYY-MM-DD format |
| 销量估算工具 | `start_date`, `end_date` | **Required**, YYYY-MM-DD format |

---

## 5. Pandas int64/float64 Not JSON Serializable

When building `data_points` from CSV data in Step 5, pandas returns `int64`/`float64`
types that `json.dumps` cannot serialize. Always cast to native Python types:

```python
# ❌ WRONG — causes TypeError: Object of type int64 is not JSON serializable
data_points=[{"label": "Search Volume", "value": row['monthly_search_volume_exact'], ...}]

# ✅ CORRECT — cast to int/float
data_points=[{"label": "Search Volume", "value": int(row['monthly_search_volume_exact']), ...}]
```

---

## 6. Some Fields May Be Absent

Not all keywords return `ppc_bid_exact` or `ppc_bid_broad` — these fields may be
missing from the response. `collect_js_data.py` handles this via `.get()` with
implicit `None` default, but analysis scripts should check for missing values.

---

## 7. Share of Voice — Single Object, Not List

品牌份额工具 returns a single data object (not a list of items).
The response structure is:
```json
{
  "data": { "attributes": { "brands": [...] } }
}
```
or possibly:
```json
{
  "data": [{ "attributes": { "brands": [...] } }]
}
```

`collect_js_data.py` handles both cases automatically.
