# Keyword Gap Analysis

Based on the Jungle Scout keywords_by_asin API, collects keywords for both your own ASIN and competitor ASINs,
then calculates three types of gaps: Gap keywords, Rank Disadvantage keywords, and Your Unique keywords.

---

## When to Use

| Intent | Example Query |
|--------|-------------|
| Find keywords competitors rank for that you don't | "What keywords is my ASIN B001XX missing compared to competitor B002YY?" |
| Discover rank disadvantage keywords | "Which keywords does the competitor rank higher on with high search volume?" |
| Quantify keyword coverage gap | "What's the keyword overlap rate between B001XX and B002YY, B003ZZ?" |

### ⛔ Not Applicable

| Intent | Alternative Module |
|--------|-------------------|
| Single ASIN full keyword profile | Reverse ASIN Research (within this skill) |
| Full catalog multi-ASIN coverage audit | Multi-ASIN Keyword Portfolio (within this skill) |

---

## Usage

```python
# Step 1: Fetch data via MCP
# 调用ASIN关键词工具获取数据
# Step 2: Pass MCP response to analysis script
import sys
sys.path.insert(0, '/icbu-amazon-market-intel/scripts/keywords_by_asin')
from keyword_gap_analysis import keyword_gap_analysis

result = keyword_gap_analysis(
    mcp_data=<mcp_response>,
    my_asin="B001MYASIN",                          # Your own ASIN (single)
    competitor_asins=["B002COMP1", "B003COMP2"],   # Competitor ASIN list (1–9)
    output_dir="/round-{N}/data",
    page_size=100,
)
# Returns dict: {"gap_count", "rank_disadvantage_count", "my_unique_count", "gap_csv", ...}
```

---

## Execution Steps

### Step 1: Parse Input

- Extract from user query: your own ASIN (1) and competitor ASINs (1–9)

### Step 2: API Collection and Gap Calculation

- Call `client.keywords_by_asin` for each ASIN
- Calculate Gap / Rank Disadvantage / Your Unique keyword sets

### Step 3: Deliver Results

- Output the key findings (tables, insights) directly in the conversation. Reference the CSV file for the complete dataset.

---

## Output Files

### `gap_keywords.csv` — Keywords competitors have that you don't

| Column | Description |
|--------|-------------|
| `asin` | Competitor ASIN |
| `name` | Keyword |
| `monthly_search_volume_exact` | Exact monthly search volume |
| `ease_of_ranking_score` | Ease of ranking score |
| `ppc_bid_exact` | PPC exact bid (USD) |

### `rank_disadvantage.csv` — Keywords both have but competitor ranks higher

| Column | Description |
|--------|-------------|
| `name` | Keyword |
| `my_rank` | Your ASIN organic rank |
| `competitor_best_rank` | Competitor's best organic rank |
| `monthly_search_volume_exact` | Exact monthly search volume |

### `my_unique_keywords.csv` — Keywords only you have

Same format as gap_keywords.

---

## Notes

- Pass only 1 ASIN as your own; competitors can be 1–9 (total ≤ 10 ASINs)
- Rank disadvantage keywords are only effective when the API returns the `organic_rank` field
- Gap keyword deduplication: when multiple competitors have the same keyword, the entry with the highest search volume is retained
