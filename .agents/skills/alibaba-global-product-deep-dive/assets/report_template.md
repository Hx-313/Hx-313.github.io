# {product} — Amazon Market Intelligence Report

> **Methodology**: Real Data Intelligence Pipeline (Jungle Scout API)

---

## 1. Executive Summary

[Brief overview: analysis scope, question type, 8 dimensions covered, confidence distribution, top-line recommendation]

---

## 2. Indicator Data Framework

The 12 core metrics below form the analytical foundation. Anomalies and extremes in these indicators directly drove the sub-question generation in the next section.

**Format**: markdown table with 3 columns — Indicator | Value | Explanation. Do NOT use bullet list.

---

## 3. Deep-Dive Analysis

8 dimension sections (3.1 through 3.8), each with the full analytical chain below.

⚠️ Use standard dimension names as section headers, NOT the full question text.
⚠️ Number 3.1, 3.2, 3.3, … in order. Never skip, duplicate, or reorder.
⚠️ Use English dimension names for `en` reports, Chinese for `zh` reports.

### Dimension Template

```markdown
### 3.X [Dimension Name]

**Core Question**: [The specific question being answered]

**Why this dimension**: [Why this matters for the entry decision]

**Data Acquisition**: [cite data source files]
- Source: [e.g., historical_search_volume, keywords_by_keyword]
- Expected format: [e.g., 12-month time series + long-tail keyword list]

**Key Data Points**:
| Metric | Value | Unit | Data Source Platform |
|--------|-------|------|----------------------|
| [metric] | [NUMERIC value] | [unit] | [e.g. Amazon/Alibaba] |
| [metric] | [NUMERIC value] | [unit] | [e.g. Amazon/Alibaba] |
| [metric] | [NUMERIC value] | [unit] | [e.g. Amazon/Alibaba] |

(Minimum 3 rows with numeric values. If data insufficient, omit table and use narrative.)

**Analysis**:
[2-4 sentences with calculations. Show derivations.]

[If chart available, insert on its own line: `![Chart Title](/round-{N}/charts/filename.png)`]

**Conclusion** (Confidence: 🟢/🟡/🔴 High/Medium/Low):
[One-sentence conclusion with key number]

**Decision Impact**:
[One sentence on how this finding affects the entry decision]
```

> ⚠️ **Formatting rules for each dimension** (violations cause broken rendering):
> - `**Conclusion**` and `**Decision Impact**` MUST each start on their own line as a standalone paragraph. Do NOT write them as inline text run together with the analysis.
> - Do NOT write `**Conclusion** (Confidence...) text **Decision Impact**: text` all on one line — this causes LaTeX math rendering in some environments.
> - Price values in Key Data Points table: write plain numbers (`34.99`), not `$34.99` inside cells.
> - Do NOT use `**bold**` inside table cells.
> - Every table MUST have a blank line before and after it.

Do NOT compress dimensions into one-line summaries — each must have the full structure above.

### Analysis Summary

After all 8 dimensions (3.1–3.8), add a summary table:

| Dimension | Confidence | Key Finding | Decision Impact |
|-----------|------------|-------------|-----------------|
| 3.1 [name] | 🟢/🟡/🔴 | One sentence with key number | One sentence on entry decision |
| 3.2 [name] | ... | ... | ... |
| ... | ... | ... | ... |

All 8 rows required.

---

## 4. Product Search & Positioning

> ⚠️ Do NOT expose the internal 3-tier filtering mechanism (Tier 1/2/3) to the reader.
> Instead, synthesize the analysis findings into a natural narrative that leads to product recommendations.

### Writing approach

1. **Market positioning summary** (1–2 paragraphs): Synthesize key findings from Section 3 — price tiers, competitive gaps, niche opportunities, pain points — into a cohesive market landscape picture. Identify the strategic entry windows.

2. **Analysis-driven product table** (heading: "### Recommended Products"): Naturally introduce the top recommended products as evidence of the opportunities identified above. Use a single unified table grouped by strategic theme (e.g., "Budget entry opportunity", "Premium gap", "Niche leader to study"), NOT by data source.

   ⚠️ Product data MUST come from `final_recommendations.csv` (≥10 products), NOT hand-picked examples from analysis text.

   Each row with markdown image from `imageUrl` and clickable product link:
   ```markdown
| Image | Platform | Product ID | Product Title | Price | Monthly Sales | Rating | Strategic Insight |
|-------|----------|------------|---------------|-------|---------------|--------|-------------------|
| ![](imageUrl) | Amazon | B0CXK7LMVP | [Product Name](prodUrl) | 34.99 | 2,500 | 4.4 | Why this product matters |
| ![](imageUrl) | Alibaba | 1600387472316 | [Product Name](prodUrl) | 27.50 | 1,500+ | 4.7 | Why this product matters |
   ```

   > ⚠️ **Product ID Rules (CRITICAL)**:
   > - Amazon products: use the **real ASIN** from `final_recommendations.csv` (10-char starting with B0, e.g. B0CXK7LMVP). NEVER write placeholder IDs like B0XXXXXXXXX, B08XXXXXXXX, or B0AXXXXXXXX.
   > - Alibaba products: use the **numeric item ID** from `alibaba_supply.csv` (e.g. 1600387472316). NEVER use an Amazon ASIN format for Alibaba products.
   > - If the real ID is not available in the CSV, write "-" in that cell. Do NOT invent IDs.
   > - Price cells: write plain numbers like `34.99` or `27.50`. NEVER use `$` as a LaTeX delimiter (i.e., do NOT write `$34.99` inside a table cell if it may trigger math rendering — use plain numbers and note the currency in the column header or caption).

3. **Positioning recommendation** (1 paragraph): Based on the products above, recommend specific positioning strategy (price point, differentiation angle, target customer segment).

4. Reference to `final_recommendations.csv` for the complete product list.

---

## 5. Conclusions & Actionable Recommendations

### Top Picks Decision Table

Distill the analysis into 1–3 most investable directions. Each column = one candidate strategy with a representative product image.

| | Pick 1 | Pick 2 | Pick 3 |
|---|---|---|---|
| Representative Product | ![](imageUrl) Product Name | ![](imageUrl) Product Name | ![](imageUrl) Product Name |
| Core Business Value | Why worth pursuing | ... | ... |
| Buyer Target Margin | Est. buyer net margin % after FBA+freight+ad | ... | ... |
| Recommended FOB Range | $X – $Y per unit | ... | ... |
| Primary Buyer Market | US / EU / JP / etc. | ... | ... |
| Required Certifications | CE / FCC / none / etc. | ... | ... |
| Key Risks | Top 1–2 risks | ... | ... |
| Confidence | 🟢/🟡/🔴 | ... | ... |

### Actionable Next Steps for B2B Suppliers

Concrete 5-step action plan for Alibaba.com GGS Suppliers:
- Step 1 (Listing Optimization): How to rewrite Alibaba.com product titles and keywords based on Amazon search demand
- Step 2 (B2B Pricing Strategy): Specific FOB price range — use Amazon Retail Price − FBA Fee − Platform Commission − Ad Cost − Sea Freight = FOB ceiling; target buyer net margin ≥25%
- Step 3 (MOQ & Customization): Recommended MOQ settings. If the product category supports customization (e.g., branding-sensitive consumer goods, private label opportunities), suggest specific light-customization options (e.g., logo printing, custom packaging, color variants). If the category is commodity-driven (e.g., standard industrial parts, generic components), focus on competitive MOQ and lead time instead — do NOT force customization advice where it does not apply.
- Step 4 (Target Market Focus): Which buyer countries to target with Alibaba.com KWA ads based on retail demand concentration
- Step 5 (Compliance Readiness): Which certifications to obtain or highlight (CE/FCC/PSE/etc.) based on the primary buyer market — frame certification as a B2B competitive advantage

---

## 6. Risk Assessment

Cover ALL of the following risk categories:
- **Data gaps & API coverage**: What data was unavailable or low-confidence?
- **Monopoly / brand concentration risk**: Can buyers realistically enter against dominant brands?
- **Compliance / certification risk**: Are required certifications obtainable? At what cost and timeline?
- **Seasonality risk**: If seasonal, what is the off-season demand floor? Can GGS suppliers manage production cycles?
- **Alibaba supply-side saturation risk**: Is the FOB market already commoditized? Can GGS suppliers differentiate?

---

## 7. B2B Supply Search Recommendations

Organize by recommended direction from Section 5. For each direction:

### Direction N: [Direction Name]

1. Brief supply strategy for this direction (from GGS supplier perspective: how to price FOB, how to position MOQ, how to demonstrate buyer profit space)
2. Supplier product markdown table (MANDATORY, **4 rows per direction**) — each row with product image URL and clickable link:
   ```markdown
   | Image | Product Title | Platform | FOB Price | MOQ | Target Market | Certifications |
   |-------|---------------|----------|-----------|-----|---------------|----------------|
   | ![](product_image_url) | [Product Name](product_url) | Alibaba | $0.52-0.99 | 100 pcs | US, EU | CE, RoHS |
   ```
3. Sourcing insight connecting your FOB wholesale price to the Amazon retail margin, demonstrating the profit space you can offer to B2B buyers for this direction (e.g., "At FOB $X, buyer nets ~Y% margin after FBA, freight, and platform fees")

Repeat for each direction (1–3 total). End with reference to `alibaba_supply.csv`.

---

📋 **Help us improve** — Did this report help your sourcing decision? [Share your feedback (1 min)](https://survey.alibaba.com/uone/sg/survey/XJ_0JThIX)
