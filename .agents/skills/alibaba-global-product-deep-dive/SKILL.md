---
name: alibaba-global-product-deep-dive
metadata:
  version: "1.0.0"
description: >-
  Deep-dive product selection powered by Amazon market data (Jungle Scout) and Alibaba supply data. Analyzes demand, competition, pricing, and compliance across 8 dimensions, delivers ranked product recommendations with FOB pricing, and matches Alibaba suppliers — all from a GGS B2B supplier perspective. Bilingual.
trigger_keywords:
  - "analyze market"
  - "product selection"
  - "Amazon data"
  - "buyer demand"
  - "deep dive"
  - "market analysis"
  - "full report"
  - "competition analysis"
  - "FOB price"
  - "buyer profit margin"
workflow: >-
  Deep-dive analysis pipeline: Step 1: Detect language. Step 2: Collect JS data via MCP. Step 3: Compute indicators. Step 4: Generate 8 sub-questions. Step 5: Agent writes 8 SubQuestionAnswer objects. Step 6: 3-tier product recommendations to CSV. Step 7: B2B Supply Search + Output complete report in conversation.
enabled: true
---

# Product Selection Deep Research — Real Data Intelligence Pipeline

> **Path Convention**: All skill-internal paths below are relative to the skills installation directory
> declared in `<skills_library>`. The agent MUST prepend the skills base path at runtime.
> Workspace output paths are relative to the workspace root defined in `<workspace_directory>`.

> ★★★ **ABSOLUTE RULE — THE REPORT MUST BE OUTPUT DIRECTLY IN THE CONVERSATION** ★★★
>
> 1. The complete report MUST be output as markdown directly in the chat message — NOT written to a file
> 2. Do NOT use `write_file` for the report. The user should see the full report rendered in the conversation
> 3. If ANY step fails, still output the report with whatever data is available — partial report > no report
>
> ⚠️ **CRITICAL DISTINCTION**:
> - Steps 2-6: Use `write_file` / `bash_command` to save intermediate data (CSV, JSON) — this is correct
> - Step 7: The final report MUST be your **direct text reply** in the conversation. Do NOT call `write_file` for the report. Simply type out the full markdown report as your message.
> - Do NOT call `task_update` before or after the report. Do NOT call any tool in Step 7's report output phase. Just output the report text.

### Bilingual Support

CJK characters (U+4E00–U+9FFF) → `zh`, otherwise → `en`. All outputs follow detected language.

### ★ GGS Supplier Identity Rules (CRITICAL)

- **User Identity**: The user is a B2B manufacturer/supplier on Alibaba.com (GGS), NOT an Amazon B2C seller.
- **Amazon Data Purpose**: Amazon data (B2C) must ONLY be used to reverse-engineer global buyer demand, retail trends, and pricing ceilings.
- **NEVER Recommend Amazon Entry**: Do NOT recommend the user to open an Amazon store, sell directly on Amazon, or calculate FBA/PPC costs as their own operational costs.
- **B2B Profit Logic**: Margin analysis MUST compare "Amazon Retail Price" vs "User's FOB Wholesale Price" to calculate the *buyer's* profit margin. This margin is the user's B2B selling point.
- **Origin Awareness**: If the user specifies their country (e.g., Pakistan, Vietnam, India), highlight their local supply chain advantages (e.g., low MOQ, specific materials, labor cost) vs Chinese suppliers.

### User-Facing Presentation Rules

- Present insights as a market analyst
- Do NOT expose internal tool names, API parameter structures, or env variable names
- Attribute data as "Jungle Scout market data" or "Amazon platform data"
- Do NOT show scoring formulas or indicator calculations in the report

### Data Source Badges

See `references/data_source_badges.md` for badge definitions and usage.

---

## When to Use

| Question Type | Example (EN) | Example (ZH) |
|--------------|-------------|-------------|
| Market Opportunity | "Find blue ocean opportunities in Home & Kitchen" | "Find blue ocean in Home & Kitchen" |
| Competitive Analysis | "Analyze competitor ASIN B0XXXXXX traffic keywords" | "Analyze competitor ASIN traffic keywords" |
| Product Validation | "Is the $25-$35 yoga mat market worth entering?" | "Is the yoga mat $25-35 market worth entering?" |
| Ad & Traffic | "What's the PPC bid for 'portable blender'?" | "What is the PPC bid for portable blender?" |
| Trend & Seasonality | "Is 'christmas lights' a seasonal product?" | "Is christmas lights a seasonal product?" |

### ⛔ When NOT to Use

If the question can be answered by a single API call, do NOT activate this skill.

| User Intent | Correct Tool |
|-------------|-------------|
| Keyword search volume | Use Jungle Scout keyword tool directly |
| ASIN sales estimates | Use Jungle Scout sales estimates tool directly |
| Keyword ranking for ASIN | Use Jungle Scout ASIN keyword tool directly |
| Brand share of voice | Use Jungle Scout share of voice tool directly |
| Product database browse | Use Jungle Scout product database tool directly |
| Search volume trend | Use Jungle Scout historical trend tool directly |
| Quick product search | `info_search(mode="shopping")` |
| General web/trend lookup | `info_search(mode="web/trend")` |

---

## How to Use

> ⚠️ **Round Directory**: All paths use `round-{N}`. Do NOT hardcode `round-1`.

### Overview

1. **Step 1** — Detect language → `zh` or `en`
2. **Step 2** — Collect Jungle Scout API data → CSVs
3. **Step 3** — Compute Indicator Data Framework → JSON
4. **Step 4** — Detect anomalies in indicators → Generate 8 decision-oriented sub-questions (each with data premises)
5. **Step 5** — Extract CSV data → Agent analyzes each dimension with cross-referencing → structured answers + aggregate analysis-driven product recommendations (★ analytical backbone)
6. **Step 6** — ★ MANDATORY: 3-tier product recommendations: analysis-driven → data-filtered → search supplement → `final_recommendations.csv` (do NOT write report yet). **Section 4 of the report depends entirely on this step's output.**
7. **Step 7** — B2B supply search → Phase A: 3× `read_file` (template + answers + CSV) → Phase B: assemble report → Phase C: pre-output self-check → Output complete report directly in conversation ★ + `alibaba_supply.csv`

> **FAILURE RECOVERY**: If any step (2–6) errors, do NOT abort. Continue and still output the report in Step 7.
> **TURN BUDGET**: The pipeline needs ~30 turns. If you are past turn 35 and have NOT started Step 7, skip remaining steps and proceed directly to Step 7. **No matter what happens, you MUST output the report before stopping.**



---

## Step 1: Detect Language

`detect_language()` in `scripts/models.py` — CJK → `zh`, else → `en`. Pass to all subsequent steps.

---

## Step 2: Collect Jungle Scout Data via MCP

> ⚠️ **Read `references/mcp-tools.md` first**，Follow the tool quick reference.

Use MCP tools to fetch Jungle Scout data. Each call returns JSON, save to `round-{N}/data/` then convert to CSV via script.

> MCP returns complete API response (including `{"data": [...], "links": ..., "meta": ...}`). Save the raw response as-is,`collect_js_data.py` auto-unwraps the data envelope.

### 2a. Call MCP tools (4 mandatory + 2 optional)

1. Read `references/mcp-tools.md` for tool search keywords and parameter format
2. Use MCP search to discover tools
3. Use MCP to call tools, save results as `raw_*.json`

Mandatory calls (4):

| Search Keyword | Save File | Output CSV |
|-----------|---------|---------|
| `keywords_by_keyword` | `raw_keywords.json` | `keywords_market.csv` |
| `historical_search_volume` | `raw_historical.json` | `keyword_trends.csv` |
| `product_database` | `raw_products.json` | `competitors.csv` |
| `share_of_voice` | `raw_sov.json` | `market_concentration.csv` |

Optional calls:

| Search Keyword | Save File | Output CSV | When to Use |
|-----------|---------|---------|-------------|
| `keywords_by_asin` | `raw_asin_keywords.json` | `asin_keywords.csv` | ONLY when user explicitly provides a specific ASIN to analyze. Do NOT use proactively — this is a buyer-side tool for reverse-engineering competitor keywords, not needed for GGS supplier selection. |
| `sales_estimates` | `raw_asin_sales.json` | `asin_sales.csv` | When user provides ASIN(s) and wants detailed sales estimates for specific products. |

> Parameter format details in `references/mcp-tools.md`(date format, array params, etc.).

### 2b. Convert JSON → CSV

`bash_command`:

---

## Step 3: Compute Indicator Data Framework

**Script**: `scripts/analyze_indicators.py`


Computes 12 indicators: Main Keyword, Category, Search Volume, Top 1 Revenue, $5K+ Listings, Avg Price/Weight/FBA, Avg Reviews/Rating, Monopoly, Seasonality, PPC Bid/Conversion, Buyer Market & Compliance Risk, Alibaba Supply Density.

> See `references/indicator_definitions.md` for detailed formulas, thresholds, and edge case handling.
> See `references/analysis_criteria.md` for qualitative threshold standards used in narrative analysis.

**Output**: `round-{N}/data/indicator_framework.json`


---

## Step 4: Sub-Question Generation (8 Dimensions)

**No script** — agent generates directly. Models in `scripts/models.py`.

Generate exactly **8 sub-questions**, one per dimension:

| # | Dimension (EN) | Dimension (ZH) | target_dimension key |
|---|----------------|----------------|---------------------|
| 1 | Market Size & Demand | Market Size Analysis | `market_size_demand` |
| 2 | Competitive Landscape | Competition Analysis | `competitive_landscape` |
| 3 | Demand Seasonality & Stability | Stability Analysis | `demand_seasonality` |
| 4 | Margin Analysis & Price Positioning | Margin Space | `margin_analysis` |
| 5 | Barrier to Entry | Entry Barrier Analysis | `entry_barrier` |
| 6 | Buyer Market & Compliance | Buyer Market & Certification | `marketing_traffic` |
| 7 | Niche Opportunities | Niche Mining | `niche_opportunities` |
| 8 | User Pain-Points | Pain Point Mining | `pain_points` |

> ⚠️ **Dimension 6 Note**: The `target_dimension` key `marketing_traffic` is retained for backward compatibility with existing scripts. However, the **analytical focus has changed**: Dimension 6 is now about **buyer market geography and certification requirements** (e.g., which countries buy this product, what certifications are required for those markets, and how a GGS supplier can use certification as a B2B competitive advantage). It is NOT about Amazon advertising strategy or organic vs paid traffic ratios.

### ★ Sub-Question Quality Requirements (MANDATORY)

> See `references/subquestion_templates.md` for full template library, anomaly detection rules, per-type examples, and detailed good/bad examples.

**Every sub-question MUST satisfy ALL 5 criteria**: Data-Premised (start with a specific number from indicators), Cross-Referential (reference ≥2 CSV sources), Decision-Oriented (end with decision implication), Calculable (require computation, not restating), Non-Obvious (not answerable by reading one value).

### Anomaly-Driven Generation Process

**Step 4a**: Read `indicator_framework.json` and detect anomalies (see `references/subquestion_templates.md` for full anomaly→question mapping rules).

**Step 4b**: Detect question type from user query keywords (see `references/subquestion_templates.md`).

**Step 4c**: Generate 8 questions using the type-specific templates, injecting detected anomaly values as premises. **At least 3 of the 8 questions MUST be directly triggered by detected anomalies.**

**Action**: Read indicators → detect anomalies → detect language → detect question type → generate 8 questions → save:

> See `references/step4_subquestions_script.md` for the Python script template to generate and save sub-questions.

**Output**: `round-{N}/reports/subquestions.json`

> ⚠️ **VERIFICATION**: After saving, `read_file` the JSON and confirm all 8 questions contain specific numbers from indicators. If any question is just a dimension name rephrased (e.g., "Analyze the competitive landscape"), regenerate it.

---

## Step 5: Real Data Answers

> ★ **The Agent itself IS the analyst.** Do NOT attempt to call an external LLM inside `bash_command`.
> The Agent reads the data, reasons over it, and produces structured answers directly.
>
> ★ **This step produces `subquestion_answers.json` — the analytical backbone of the final report.**
> Every answer written here becomes a section in the Deep-Dive Analysis (Section 3).
> Shallow answers here = shallow report. Deep answers here = deep report.
>
> ⚠️ **Data reuse priority**：Step 2 already saved all raw data to `round-{N}/data/`。This step should prioritize existing CSVs and `indicator_framework.json`，Do NOT re-call MCP.
> If supplementary data is truly needed (e.g., missing dimension), you may re-call MCP, but MUST:
> 1. Save new data to a **different filename** (e.g., `raw_keywords_v2.json`), do NOT overwrite original files
> 2. When re-running conversion, ensure existing CSVs are not overwritten

### 5a. Extract data for all 8 dimensions

Write and run a single script to load subquestions + CSV data and print the extracted context:

> See `references/step5_extract_data.md` for the Python script to extract and print context data.

### 5b. Agent analyzes each dimension and writes answers

After reading the data output from 5a, the Agent constructs **all 8** `SubQuestionAnswer` objects.

> ★ See `references/js_data_answer_prompt.md` for the complete output JSON schema, quality rules, depth requirements, and anti-patterns.

**Key rules**: You ARE the analyst (no external LLM calls). Every `answer_text` should be comprehensive with ≥3 specific numbers. Every `analysis_reasoning` should show calculations. Include `recommended_asins` when analysis naturally identifies specific products. Filter out accessories.

**Save all 8 answers** (use `write_file` + `bash_command` pattern):
> See `references/step5_answer_template.md` for the Python code template to save answers.

**Output**: `round-{N}/reports/subquestion_answers.json`

> ⚠️ **VERIFICATION (MANDATORY)**: After saving, run `read_file` on `subquestion_answers.json` and verify:
> 1. Exactly 8 answers exist
> 2. Every `answer_text` contains ≥3 specific numbers
> 3. Every `analysis_reasoning` contains at least one calculation
> If any answer fails these checks, rewrite it before proceeding to Step 6.

### 5c. Aggregate analysis-driven product recommendations

After saving `subquestion_answers.json`, run `generate_ranked_recommendations()` to collect all
`recommended_asins` across dimensions, cross-match with `competitors.csv`, and rank by how many
dimensions recommended each ASIN.

> ⚠️ **IMPORTANT**: `pipeline.py` is a library, NOT a CLI script. You MUST use the two-step
> pattern: first `write_file` a runner script, then `bash_command` to execute it.
> Do NOT run `python pipeline.py --generate_ranked_recommendations` — it will produce no output.

> See `references/step5_tier1_script.md` for the Python script to run Tier 1 recommendations.`

**Output**: `round-{N}/reports/product_recommendations_ranked.json`

> This is the **Tier-1** recommendation source. Products here were identified by the analysis itself,
> not by a generic search. They carry the highest recommendation weight in the final report.

---

## Step 6: Product Recommendations — 3-Tier Strategy

> ⚠️ **Data reuse priority**: Use existing CSVs and JSONs in `round-{N}/`. If supplementary data needed, save to different filenames — do NOT overwrite originals.

**Script**: `scripts/pipeline.py` (`save_recommendations_csv()`, `generate_ranked_recommendations()`)

Product recommendations come from three sources, in priority order:

### 6a. Tier 1 — Analysis-Driven (from Step 5c)

Already generated in Step 5c as `product_recommendations_ranked.json`. No additional action needed here.

- Ranked by `dimension_count`, enriched with `competitors.csv` data, marked `recommendation_source: "analysis-driven"`
- Typical yield: 5–15 products. If 0 products, that's OK — proceed to Tier 2 and Tier 3

### 6b. Tier 2 — Data-Filtered (from `competitors.csv`)

If Tier 1 yields fewer than ~20 products, supplement from `competitors.csv` using data-driven filtering. Compute distribution stats first, then set relative thresholds (do NOT hardcode). Use `write_file` + `bash_command` pattern.

**Requirements**: `write_file` → `/round-{N}/data/filter_tier2.py`, then `bash_command`:
1. Deduplicate against Tier 1 ASINs
2. Mark with `recommendation_source: "data-filtered"` and `recommendation_reason`
3. Save to `{base_dir}/reports/_tier2_products.json`

Typical yield: 10–20 additional products.

### 6c. Tier 3 — Search Supplement (info_search shopping)

Fill remaining quota to reach ~30 total products (quality over quantity — GGS suppliers need clear direction, not an exhaustive list):

1. Call `info_search` with `shopping: true, allowed_sites: ["amazon.com"]` using 3–4 queries focused on the top recommended directions from Step 5
2. Results auto-saved to `/round-{N}/info_search/shopping_search/shopping_<query_slug>.csv`
3. Deduplicate against Tier 1 + Tier 2 ASINs
4. New products get `recommendation_source: "search"`
5. Prioritize products that represent the recommended strategic directions — do NOT add random products just to hit a number

### 6d. Merge all tiers and save CSV

**Action**: `read_file` → `references/merge_tiers_example.md`, copy the script to `/round-{N}/data/merge_tiers.py` (replace `{N}`), then `bash_command` to execute.

> ⚠️ **DO NOT write your own merge script.** The reference implementation handles CSV column name mismatches, rating/price parsing, and reference_id backfilling that custom scripts often break on. Copy it as-is.

Expected output: 20–40 products total, grouped by strategic direction.

### ★ Step 6 Completion Checkpoint (MANDATORY)

Before proceeding to Step 7, verify ALL exist:
1. `round-{N}/reports/final_recommendations.csv` — `bash_command`: `wc -l` → must show ≥10 rows
2. `round-{N}/reports/product_recommendations_ranked.json` — Tier 1 products
3. `round-{N}/info_search/shopping_search/` — must contain ≥1 CSV file

**If any is missing, go back and execute the corresponding Step 6 sub-step before proceeding.**

**Output**: `round-{N}/reports/final_recommendations.csv`

---

## Step 7: B2B Supply Search + Output Final Report in Conversation

> Execute AFTER Step 6.

### 7a. B2B Supply Search (per recommended direction)

Search suppliers **per direction** based on the Top 1–3 investable directions identified during analysis (from Step 5 answers and Section 3 conclusions). Each direction gets its own `product_supplier_search` call so results are grouped by recommendation.

**For each Top Pick direction**:
1. `product_supplier_search(intent_type="product", tasks=[{"query": "<direction-specific query>"}])` → collect results
2. If user explicitly asked for suppliers, also call `product_supplier_search(intent_type="supplier", tasks=[...])` for that direction. Default: product search only.

**Example** (2 directions):

3. Generate `alibaba_supply.csv` from ALL directions combined (use `write_file` + `bash_command` pattern):

### 7b. Output Final Report directly in conversation (★ CRITICAL)

> ★ **BREAK THE PATTERN — DO NOT USE write_file FOR THE REPORT.**
> You have been using write_file and bash_command throughout Steps 2-6 to save intermediate data.
> Step 7 is DIFFERENT. The final report is NOT a file — it is your chat message.
> Your next message after completing analysis should BE the report itself.
> Do NOT call any tool (write_file, bash_command, edit_file, read_file, etc.) to produce the report.
> Simply respond with the full markdown content as plain text in the conversation.
> The user will see it rendered with headings, tables, images, etc.
>
> ⛔ If you find yourself about to call write_file with report content, STOP. That is wrong.
> Output the report text directly as your reply instead.

### ★ Phase A: Read ALL inputs (3 mandatory read_file calls)

You MUST execute ALL 3 `read_file` calls below BEFORE outputting the report. Do NOT skip any.

| # | `read_file` target | What you get | Used in |
|---|-------------------|--------------|---------|
| 1 | `assets/report_template_zh.md` (zh) or `assets/report_template.md` (en) | Section structure + dimension template (7 sub-fields) + Section 4/7 writing approach | ALL sections |
| 2 | `round-{N}/reports/subquestion_answers.json` | 8 SubQuestionAnswer objects — the analytical backbone | Section 3 (3.1–3.8) |
| 3 | `round-{N}/reports/final_recommendations.csv` | ALL product recommendations | Section 4 + Section 5 |

> ⚠️ **MANDATORY PRE-CHECK after reading #3**: If `final_recommendations.csv` does not exist or has < 5 rows,
> STOP and go back to execute Step 6. Do NOT output a report without product recommendation data.

### ★ Phase B: Assemble report — output directly as your reply

After reading all inputs, your next message should BE the complete report in markdown. No tool calls. No write_file. Just type the report as your response.

**Markdown rendering capabilities** (the conversation UI supports all of these):
- `#`, `##`, `###` headings
- GFM tables with horizontal scroll
- `![img](https://...)` remote images (max height 400px, with save/download/lightbox)
- `![chart](/round-{N}/charts/xxx.png)` sandbox-generated images — the UI auto-converts absolute paths and `file://` URLs to blob URLs for display
- `[Product Name](product_page_url)` clickable links (opens in browser)
- `**bold**`, `*italic*`, `> blockquote`, `---` horizontal rule
- Ordered/unordered lists with nesting
- Code blocks with syntax highlighting
- Emoji (🟢🟡🔴 etc.)

> ★ **Chart Images**: Charts generated by matplotlib in Steps 3-6 (saved to `round-{N}/charts/`) CAN be embedded in the report using `![Chart Title](/round-{N}/charts/filename.png)`. The conversation UI will load and render them inline. See `assets/chart-design-guide.md` for chart generation best practices.

**Section-by-Section assembly rules** (follow the template structure EXACTLY):

**Section 1 — Executive Summary**: Synthesize overall findings. 1 paragraph.

**Section 2 — Indicator Data Framework**: Markdown table with 3 columns (Indicator | Value | Explanation). Source: `indicator_framework.json` values you already have from Step 3.

**Section 3 — Deep-Dive Analysis (3.1–3.8)**: This is the report's core. Each of the 8 dimensions MUST follow the template's 7-field structure. Map `subquestion_answers.json` fields as follows:

| Template field | Source from SubQuestionAnswer | Minimum requirement |
|---------------|------------------------------|-------------------|
| **Core Question** | `question_text` from the matching subquestion | Copy verbatim |
| **Why this dimension** | Agent writes based on dimension context | 1–2 sentences |
| **Data Acquisition** | `citations` array | List source CSV files |
| **Key Data Points** (table) | `data_points` array | ≥3 rows, each with numeric value + unit + source |
| **Analysis** | `answer_text` + `analysis_reasoning` | ≥2 paragraphs, expand (not compress) the answer, show calculations. Insert chart image if generated: `![Chart Title](/round-{N}/charts/filename.png)` |
| **Conclusion** (with confidence emoji) | `conclusion` + `confidence_level` (high=🟢, medium=🟡, low=🔴) | 1 sentence with THE key number |
| **Decision Impact** | Agent derives from conclusion | 1 sentence on entry decision implication |

> ⚠️ **COMMON FAILURE**: Agent compresses a dimension into 2-3 sentences without the table or sub-fields.
> Every dimension MUST have ALL 7 fields. If you find yourself writing a dimension in very few words, you are compressing — go back and expand.
> **Do NOT discard the structured answers and write a shallow summary instead.**

**Section 3 — Summary Table (after 3.8)**: After all 8 dimensions, add a summary table so readers can quickly grasp the overall picture:


Each row: dimension name, confidence emoji, one-sentence key finding (with the key number), one-sentence decision impact. All 8 rows required.

**Section 4 — Product Search & Positioning**: Follow the template's 5-part writing approach:
1. Market positioning summary (1–2 paragraphs synthesizing Section 3 findings)
2. **Analysis-driven product table** (from `final_recommendations.csv`): Build ONE unified table grouped by strategic theme (e.g., "Budget entry", "Premium gap", "Niche leader"), NOT by Tier 1/2/3. **≥10 product rows REQUIRED**. Image column uses markdown image syntax with `imageUrl` from CSV.
   Products without `imageUrl` → leave Image cell as `-`.

> ⚠️ **Do NOT add source/origin tags** like `[Search]`, `[Analysis]`, `[Tier 1]`, `[Tier 2]` etc. to product names or table columns. All products come from the analysis pipeline — just present them by strategic theme with their data.
3. Positioning recommendation (1 paragraph)
4. Reference to `final_recommendations.csv` for complete list

> ⚠️ **Section 4 products MUST come from `final_recommendations.csv`** — NOT hand-picked from analysis text.
> ⚠️ **Inside tables**: use `[Product Name](prodUrl)` for clickable product links. Image column uses `![](imageUrl)`.

**Section 5 — Conclusions & Actionable Recommendations**: This is the decision section — help the user act, not just read.

1. **Top 1–3 Picks Decision Table**: Distill the entire analysis into a comparison table of the most investable directions. Each row = one candidate direction (not a single ASIN, but a product strategy). Use `imageUrl` from `final_recommendations.csv` for the best representative product of each direction.

2. **Actionable Next Steps** (5 concrete steps for GGS B2B Suppliers, not vague advice):
   - Step 1 (Listing Optimization): How to rewrite Alibaba.com product titles and keywords based on Amazon search demand data
   - Step 2 (B2B Pricing Strategy): Specific FOB price range recommendation — use Amazon Retail Price − FBA Fee − Platform Commission − Ad Cost − Sea Freight = FOB ceiling; target buyer net margin ≥25%
   - Step 3 (MOQ & Customization): Recommended MOQ settings. If the product category supports customization (branding-sensitive consumer goods, private label opportunities), suggest specific light-customization options (e.g., logo printing, custom packaging, color variants). If the category is commodity-driven (standard industrial parts, generic components), focus on competitive MOQ and lead time — do NOT force customization advice where it does not fit the product.
   - Step 4 (Target Market Focus): Which buyer countries to target with Alibaba.com KWA ads based on retail demand concentration (e.g., US buyers for Amazon.com, DE/FR/UK buyers for Amazon EU)
   - Step 5 (Compliance Readiness): Which certifications to obtain or highlight (CE/FCC/PSE/etc.) based on the primary buyer market — frame certification as a B2B competitive advantage

**Section 6 — Risk Assessment**: Cover ALL of the following risk categories:
- Data gaps and API coverage limitations
- Monopoly / brand concentration risk (can buyers realistically enter?)
- Compliance / certification risk (are required certs obtainable? at what cost?)
- Seasonality risk (if seasonal, what is the off-season demand floor?)
- Alibaba supply-side saturation risk (is the FOB market already commoditized?)
- Low-confidence areas in the analysis

**Section 7 — B2B Supply Recommendations**: Organize by recommended direction from Section 5. For each direction:

1. Direction heading (e.g., "### Direction 1: Premium Glass Blender")
2. Brief supply strategy for this direction (1–2 sentences: target buyer market, recommended FOB range, key differentiator)
3. Supplier product markdown table (MANDATORY, **4 rows per direction**) — each row with product image URL from search results:
4. Sourcing insight: connect your FOB wholesale price to the Amazon retail margin, demonstrating the profit space you offer to B2B buyers for this direction (e.g., "At FOB $X, buyer nets ~Y% margin after FBA, freight, and platform fees")

Repeat for each direction (1–3 total). End with reference to `alibaba_supply.csv`.

> ★ **MANDATORY FINAL LINE**: After the last direction and the `alibaba_supply.csv` reference, you MUST append the following feedback survey line as the very last line of the report:
> ```
> ---
> 📋 **Help us improve** — Did this report help your sourcing decision? [Share your feedback (1 min)](https://survey.alibaba.com/uone/sg/survey/XJ_0JThIX)
> ```
> Do NOT omit this line. It is a required part of the report output.

> ⚠️ **Table formatting rules** (MUST follow strictly — violations cause broken rendering):
>
> **Rule 1 — Blank lines (CRITICAL)**: Every markdown table MUST have a completely blank line before the header row AND after the last data row. If the table is immediately preceded by text with no blank line, the markdown parser treats the entire table as plain text. This is the #1 cause of tables rendering as raw text.
>
> **Rule 2 — Price / Dollar sign**: Write prices as plain numbers in table cells: `34.99` not `$34.99`. The `$` symbol inside markdown table cells can trigger LaTeX math rendering in some environments, causing text like `$34.99isdifficultfor...` to appear as garbled italic math. If you need to indicate USD, add "(USD)" to the column header instead.
>
> **Rule 3 — Bold text inside cells**: Do NOT use `**bold**` inside table cells. Some markdown renderers parse `**text**` inside cells as italic (`*text*`) or break the cell boundary. Use plain text for emphasis inside tables.
>
> **Rule 4 — No line breaks inside cells**: Each table row must be on a single line. Never break a cell value across multiple lines — it causes the row to render as multiple disconnected lines of text.
>
> **Rule 5 — Conclusion / Decision Impact fields**: Write `**Conclusion**` and `**Decision Impact**` as separate paragraphs OUTSIDE the table, not as inline bold text run together with the analysis text. When these fields are written inline (e.g., `**Conclusion** (Confidence: ...) text **Decision Impact**: text`), some renderers collapse them into a single italic-math block.
>
> **Rule 6 — Product IDs**: Amazon products use real ASINs from CSV (e.g., `B0CXK7LMVP`). Alibaba products use numeric item IDs (e.g., `1600387472316`). NEVER use placeholder IDs like `B0XXXXXXXXX` or `B08XXXXXXXX`.
>
> **Rule 7 — Images and links**: `![img](url)` with real URL, or `-` if unavailable. Product name: `[Name](product_page_url)` — clickable link. You MUST use the `imageUrl` and `prodUrl` from CSVs. Do NOT leave image cells empty if you have the URL.

### ★ Phase C: Pre-output self-check (MANDATORY)

Before outputting the report, mentally verify this checklist. Do NOT output an incomplete report.

| # | Check | If FAIL |
|---|-------|---------|
| 1 | All 7 sections present (1–7) | Add missing sections |
| 2 | Section 3 has 8 sub-sections (3.1–3.8) | Add missing |
| 3 | Section 3 ends with Analysis Summary table | Add it |
| 4 | Each 3.X has Key Data Points table | Add missing |
| 5 | Each 3.X has Conclusion with emoji | Add missing |
| 6 | Section 4 "Recommended Products" table has ≥10 rows | Add products from CSV |
| 7 | Section 5 has Top Picks Decision Table with FOB Range + Buyer Market + Certifications rows | Add missing rows |
| 8 | Section 5 Actionable Next Steps has 5 steps including compliance | Add missing steps |
| 9 | Section 6 covers all 5 risk categories (data gaps, monopoly, compliance, seasonality, supply saturation) | Add missing |
| 10 | Section 7 has supplier product table per direction with Target Market + Certifications columns | Add missing |
| 11 | **Every table has a blank line before AND after it** | Fix — without blank lines the table renders as plain text |
| 12 | Report is comprehensive and detailed | Expand thin sections |
| 13 | Report ends with the feedback survey line (`https://survey.alibaba.com/uone/sg/survey/XJ_0JThIX`) | Add it as the last line |

**Quality requirements summary**:
- Report should be comprehensive — aim for depth over a specific word count
- Section 3: all 8 dimensions × 7 fields each, each dimension should be thorough
- Section 4: ≥10 products from CSV, grouped by strategic theme
- Section 5: FOB price range must be a specific number range (e.g., $3–$6), not vague language
- Section 7: Supplier table with image/product links, target market, and certifications
- Partial report > no report

**Output**: ★ The complete report rendered directly in the conversation + `round-{N}/reports/alibaba_supply.csv`

> ⚠️ **STOP RULE**: After outputting the report, STOP IMMEDIATELY. Do NOT append any summary, status update, task completion message, follow-up suggestions, file references (like "reports/xxx.json"), or meta-commentary after the report. The report IS the final output — nothing should come after it.
> ★ **SURVEY REQUIREMENT**: The very last line of the report MUST be the feedback survey: `📋 **Help us improve** — Did this report help your sourcing decision? [Share your feedback (1 min)](https://survey.alibaba.com/uone/sg/survey/XJ_0JThIX)` — this is part of the report, not meta-commentary.

---

## CSV Requirements

See `references/csv_schema.md`. Both MANDATORY:
- `final_recommendations.csv` — 13 columns (including `reference_id` from info_search)
- `alibaba_supply.csv` — 10 columns (including `target_market` and `compliance_certs`)

---

## Dependencies

| Tool / Script | Purpose | Step |
|---------------|---------|------|
| `scripts/models.py` | Data models + language detection | All |
| `scripts/pipeline.py` | I/O helpers, CSV generation, ranked recommendations | All |
| `scripts/collect_js_data.py` | JSON → CSV conversion | Step 2 |
| `scripts/analyze_indicators.py` | 12 indicator computation | Step 3 |
| `scripts/answer_with_js_data.py` | Data extraction for sub-question answers | Step 5 |

---

## Next Steps

- **Chart design guide** → `assets/chart-design-guide.md`
- **Indicator definitions** → `references/indicator_definitions.md`
- **Analysis criteria** → `references/analysis_criteria.md`
- **Sub-question templates** → `references/subquestion_templates.md`
- **Answer quality rules** → `references/js_data_answer_prompt.md`
- **SDK pitfalls** → `references/sdk_pitfalls.md`
- **API reference** → `references/api_reference.md`
- **CSV schemas** → `references/csv_schema.md`
- **Data source badges** → `references/data_source_badges.md`
- **Merge tiers script** → `references/merge_tiers_example.md`
- **Report template (EN / ZH)** → `assets/report_template.md` / `assets/report_template_zh.md`
