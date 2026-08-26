# Common Prerequisites — Setup Guide

> ⚠️ Read this before executing any sub-module.

---

## Data Fetching via MCP

All Jungle Scout data is fetched via platform MCP tools. The Agent calls the tool, receives JSON, then passes it to the analysis script.

### Available MCP Tools

| MCP Tool | JS API | Key Params |
|----------|--------|------------|
| 关键词搜索量 | Keywords by Keyword | `search_terms`, `marketplace`, `page_size` |
| ASIN关键词 | Keywords by ASIN | `asins` (List), `marketplace`, `page_size` |
| 历史搜索趋势 | Historical Search Volume | `keyword`, `start_date`, `end_date`, `marketplace` |
| 销量估算 | Sales Estimates | `asin`, `start_date`, `end_date`, `marketplace` |
| 产品数据库 | Product Database | `include_keywords` (List), `categories` (List), `marketplace`, `page_size` |
| 品牌份额 | Share of Voice | `keyword`, `marketplace` |

### Example MCP Call

```json
{
  "action": "mcp",
  "name": "<通过search发现的工具名>",
  "arguments": {
    "search_terms": "yoga mat",
    "marketplace": "us",
    "page_size": 50
  }
}
```

### Passing Data to Scripts

MCP returns a JSON string. Save it to a file, then pass to the script:

```python
import json
# mcp_result is the raw JSON string from the MCP tool call
data = json.loads(mcp_result) if isinstance(mcp_result, str) else mcp_result

# Pass to analysis function
from <module> import <function>
result = <function>(mcp_data=data, output_dir="/round-{N}/data")
```

---

## Import Paths

```python
import sys
sys.path.insert(0, '/icbu-amazon-market-intel/scripts/<api_name>')
# api_name: historical_search_volume | keywords_by_asin | sales_estimates
#           | keywords_by_keyword | product_database | share_of_voice
```

---

## Round Directory

> All output paths use `round-{N}`, where `{N}` is the current round number.
> Do not hardcode `round-1`.

---

## Common Notes

- **Search Volume modules**: Max 5 keywords, date range up to 366 days, 7-day granularity
- **ASIN modules**: Max 10 ASINs (some modules limit to 5), page_size max 100
- **Sales Estimates modules**: Max 10 ASINs, date range up to 365 days, daily granularity, `end_date` ≤ yesterday
- **Keyword modules**: Max 10 seed keywords (some modules limit to 5), page_size max 100
- **Product Database modules**: Max 50 results per call; `categories` and `include_keywords` must be JSON arrays
- **Share of Voice modules**: Covers top 3 pages of Amazon search results; returns both basic and weighted SOV metrics
- **Supported marketplaces**: us, uk, ca, de, fr, it, es, mx, jp, in
- **MCP authentication**: Handled server-side, no credentials needed
- **Parameter format**: `include_keywords` and `categories` MUST be JSON arrays (e.g., `["yoga mat"]`), not strings
- **ASIN format**: ASIN关键词工具 takes `asins` as a list (e.g., `["B0XXXXXX"]`)
- **Date format**: `start_date` and `end_date` must be YYYY-MM-DD strings
