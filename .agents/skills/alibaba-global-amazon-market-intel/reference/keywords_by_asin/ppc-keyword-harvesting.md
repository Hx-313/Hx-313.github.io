# PPC Keyword Harvesting

Based on the Jungle Scout keywords_by_asin API, batch-collects keywords from competitor ASINs,
deduplicates and assigns three-tier priority labels (High / Medium / Low) based on search volume and PPC bid,
directly outputting keyword lists ready for ad campaign setup.

---

## When to Use

| Intent | Example Query |
|--------|-------------|
| Need keywords for a new PPC campaign | "Harvest PPC keywords from these competitor ASINs: B002XX, B003YY" |
| Understand competitor keyword bid ranges | "What's the PPC bid range for competitor B002XX's keywords?" |
| Filter keywords by priority for ad placement | "Help me find high search volume, low bid PPC opportunity keywords" |

### ⛔ Not Applicable

| Intent | Alternative Module |
|--------|-------------------|
| Keyword-based vocabulary expansion | `keyword-expansion` skill |
| Full PPC bid strategy development | `ppc-bid-strategy` skill |

---

## Usage

```python
# Step 1: Fetch data via MCP
# 调用ASIN关键词工具获取数据
# Step 2: Pass MCP response to analysis script
import sys
sys.path.insert(0, '/icbu-amazon-market-intel/scripts/keywords_by_asin')
from ppc_keyword_harvesting import ppc_keyword_harvesting

result = ppc_keyword_harvesting(
    mcp_data=<mcp_response>,
    competitor_asins=["B002COMP1", "B003COMP2"],   # Competitor ASINs (1–10)
    output_dir="/round-{N}/data",
    page_size=100,
    min_search_volume=100,   # Filter keywords below this search volume (default 100)
)
# Returns dict: {"total_unique_keywords", "tier_counts", "raw_csv", "tiered_csv"}
```

---

## Execution Steps

### Step 1: Parse Input

- Extract competitor ASINs (1–10) and optional minimum search volume threshold from user query

### Step 2: API Collection and Tiering

- Call `client.keywords_by_asin` for each competitor ASIN
- Deduplicate + assign PPC value tier labels

### Step 3: Deliver Results

- Output the key findings (tables, insights) directly in the conversation. Reference the CSV file for the complete dataset.

---

## Output Files

### `ppc_keywords_raw.csv` — All Deduplicated Collected Keywords

### `ppc_keywords_tiered.csv` — With Priority Tier Labels

| Column | Description |
|--------|-------------|
| `source_asin` | Source competitor ASIN |
| `name` | Keyword |
| `monthly_search_volume_exact` | Exact monthly search volume |
| `ppc_bid_broad` | PPC broad match recommended bid (USD) |
| `ppc_bid_exact` | PPC exact match recommended bid (USD) |
| `ease_of_ranking_score` | Ease of ranking score (0–100) |
| `ppc_priority` | Priority label: High Priority / Medium Priority / Low Priority |

Tiering rules:
- High Priority: monthly search volume ≥ 1000 and ppc_bid_exact ≤ 2.5 USD
- Medium Priority: monthly search volume ≥ 500 or ppc_bid_exact ≤ 1.5 USD
- Low Priority: remaining keywords meeting minimum search volume

---

## Notes

- Pass 1–10 competitor ASINs (excess is automatically truncated)
- `min_search_volume` defaults to 100, can be raised for competitive categories (recommend 500+ for highly competitive categories)
- Tiering thresholds are based on US marketplace medium bid levels; adjust manually if actual bids differ significantly
