---
name: alibaba-global-amazon-market-intel
version: "1.0.0"
description: |
  Amazon market data analysis toolkit powered by Jungle Scout MCP tools.
  Covers keyword search volume, ASIN keyword research, sales estimates, product database filtering, and brand share of voice.

  ✅ Use this skill when:
  - Amazon keyword search volume, trends, or seasonality analysis
  - ASIN reverse keyword lookup, competitive keyword gap, Listing/SEO analysis
  - ASIN sales & revenue estimation, stock-out monitoring, promotion impact analysis
  - Keyword expansion, PPC bid analysis, cross-market comparison
  - Product database filtering: product research, competitive landscape, category sizing, brand intelligence
  - Search results page Share of Voice (SOV), advertising effectiveness, brand share analysis

  ⛔ Do NOT use when:
  - Non-Amazon platform data needs
  - Logistics, payment, contracts, legal, or other non-market-data questions
  - Only general knowledge answers needed, no actual data pull required
  - Supply chain / factory / 1688 / Alibaba data
  - User already has data and only needs charts or reports
workflow: |
  Amazon Market Intel pipeline:
    Step 1: Read reference/help.md, select the best-matching API from the 6 APIs based on user intent
    Step 2: Within the selected API group, determine the specific sub-module
    Step 3: Read reference/setup.md for MCP tool usage, import paths, and output conventions
    Step 4: Read the corresponding sub-module reference file for full instructions
    Step 5: Fetch data via Jungle Scout platform tools, then run the analysis script
    Step 6: Output results directly in the conversation (tables, charts, CSV references)
enabled: true
---

# Amazon Market Intel

Amazon market evidence analysis toolkit powered by Jungle Scout MCP tools, containing 42 sub-modules.

> ★★★ **ABSOLUTE RULE — RESULTS MUST BE OUTPUT DIRECTLY IN THE CONVERSATION** ★★★
>
> 1. Analysis results (tables, charts, insights) MUST be output as markdown directly in the chat — NOT only written to files
> 2. CSV files are saved as intermediate data for reference, but the key findings MUST appear in the conversation
> 3. Do NOT use `submit_result` — it does not exist in this framework

> ⚠️ **First step**: Read `read_file('reference/help.md')` to view the module selection guide. Determine which API to use based on user intent, then select the specific sub-module, and read the corresponding reference file for full instructions.
>
> **Before executing**: Read `read_file('reference/setup.md')` for MCP tool usage, import paths, output directory conventions, and API-specific limits.

### User-Facing Presentation Rules

- Present insights as an Amazon market analyst
- Do NOT expose internal tool names, API parameter structures, or env variable names
- Attribute data as "Jungle Scout market data" or "Amazon platform data"
