# {category} Market: Blue Ocean Opportunity Analysis

> **Methodology**: Blue Ocean Finder — Multi-source Intelligence Pipeline

---

## 1. Executive Summary

[Brief overview: analysis scope, triggered scenes, number of opportunities identified, core recommendation]

### Opportunity Snapshot

| Opportunity | Blue Ocean Score | Confidence | Key Gap | Recommended Action |
|-------------|-----------------|------------|---------|-------------------|
| 2.1 [name] | X.X/5 emoji | emoji | One sentence | One sentence |
| 2.2 [name] | ... | ... | ... | ... |
| 2.3 [name] | ... | ... | ... | ... |
| 2.4 [name] | ... | ... | ... | ... |
| 2.5 [name] | ... | ... | ... | ... |

All 5 rows required. This table gives readers the full picture at a glance — detailed analysis follows in Section 2.

---

## 2. Blue Ocean Opportunities: Top 5 High-Potential Segments

5 opportunity sections (2.1 through 2.5), each with the full analytical structure below.

### Opportunity Template

```markdown
### 2.X [Opportunity Name]

**Blue Ocean Score: X.X/5** [emoji]

**Market Signal**: [What demand signal was detected and from where] 

**Key Data Points**:
| Metric | Value | Unit | Source |
|--------|-------|------|--------|
| [metric] | [NUMERIC value] | [unit] | |
| [metric] | [NUMERIC value] | [unit] | |
| [metric] | [NUMERIC value] | [unit] | |

(Minimum 3 rows. Source column uses external platform names only: Amazon, Alibaba, Google Trends, Temu, TikTok Shop, etc.)

**Scoring Breakdown**:
| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Demand Intensity (D) | X/5 | [one sentence] |
| Competition Density (C) | X/5 | [one sentence] |
| Growth Slope (G) | X/5 | [one sentence] |
| Capability Fit (F) | X/5 | [one sentence, or "Default 3.0" for non-Scene-D] |

**Gap Analysis**: [2-3 sentences on the structural gap between demand and supply]

**Differentiation Path**: [2-3 actionable OEM/ODM differentiation suggestions]

**Conclusion** (Confidence: emoji High/Medium/Low):
[One clear sentence with the key number.]
```

### Opportunity Summary Table

After all 5 opportunities (2.1-2.5), repeat the same summary table from Section 1 for readers who jump directly to this section.

---

## 3. Recommended Products and Manufacturers

### Writing approach

1. **Benchmark Products**: Introduce products that represent the current state-of-the-art or validate the identified blue ocean segments. Product carousel tag on its own line (per the table format examples in SKILL.md).

2. **Product table** (heading: "### Benchmark Products"): Products from `blue_ocean_products.csv`, grouped by opportunity segment.

   Each row with markdown image from `imageUrl` and inline product citation:
   ```markdown
   | Image | Product Name | Platform | Price | Monthly Sales | Blue Ocean Score | Strategic Insight |
   |-------|-------------|----------|-------|---------------|-----------------|-------------------|
   | ![](https://example.com/image.jpg) | [Product Name](https://www.amazon.com/dp/xxx) | Amazon | $XX.XX | X,XXX | X.X/5 | Why this product matters |
   ```

   ⚠️ Image column MUST use `![](actual_https_image_url)` — a real image URL from search results (`imageUrl` field). Do NOT use reference IDs like `` inside tables. If no image URL is available, leave the cell empty.

3. **Top OEM/ODM Manufacturers**: Recommended suppliers with OEM/ODM capabilities. Company carousel tag on its own line.

4. Reference to `blue_ocean_products.csv` for the complete product list.

---

## 4. Market Dynamics and Consumer Voice

### Market Size Table

| Metric | Value | Source |
|--------|-------|--------|
| [metric] | [value] |  |

### Core Consumer Pain Points (from 1-3 star reviews)

Bullet list of top pain points with specific data.

---

## 5. Strategic Action Plan

### Top Picks Decision Table

| | Pick 1: [Direction] | Pick 2: [Direction] | Pick 3: [Direction] |
|---|---|---|---|
| Representative Product | ![](https://example.com/img1.jpg) Product Name | ![](https://example.com/img2.jpg) Product Name | ![](https://example.com/img3.jpg) Product Name |
| Blue Ocean Score | X.X/5 emoji | X.X/5 emoji | X.X/5 emoji |
| Core Opportunity | Why worth pursuing | ... | ... |
| Target FOB Price | $XX-XX | ... | ... |
| Target Retail Price | $XX-XX | ... | ... |
| Key Risks | Top 1-2 risks | ... | ... |
| Confidence | emoji | ... | ... |

### Actionable Next Steps

Concrete 4-step action plan:
- Step 1 (Supplier Selection): Which OEM/ODM suppliers to contact, what to customize
- Step 2 (Certification): Required certifications for target markets (CE/FCC/RoHS)
- Step 3 (Pricing Strategy): FOB pricing and retail positioning
- Step 4 (Small Batch Test): Recommended MOQ and test market strategy

---

## 6. Risk Assessment

| Risk Type | Level | Description | Mitigation |
|-----------|-------|-------------|------------|
| Patent Risk | emoji | [description] | [mitigation] |
| Tariff Barriers | emoji | [description] | [mitigation] |
| Logistics Constraints | emoji | [description] | [mitigation] |
| Hype Risk | emoji | [description] | [mitigation] |

---

## 7. B2B Supply Recommendations

Organize by recommended direction from Section 5. For each direction:

### Direction N: [Direction Name]

1. Brief sourcing strategy for this direction
2. Product carousel tag with supplier product reference IDs (MANDATORY, own line)
3. Supplier product markdown table (MANDATORY, 4 rows per direction):
   ```markdown
   | Image | Product Title | Platform | Price | MOQ |
   |-------|---------------|----------|-------|-----|
   | ![](https://example.com/supplier_img.jpg) | [Product Name](https://www.alibaba.com/product/xxx) | Alibaba.com | $X.XX-X.XX | XXX pcs |
   ```
4. Sourcing insight connecting supplier prices to retail margins

Repeat for each direction (1-3 total). End with reference to `alibaba_supply.csv`.
