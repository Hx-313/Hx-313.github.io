# Platform Data Tool Quick Reference

> ⚠️ **STATUS: UNAVAILABLE** — Category Prediction 和 Product Selection 接口当前为付费接口，暂不可用。
> 本 Skill 已切换到 `product_supplier_search` 作为主要数据源，此文件保留供未来接口恢复时参考。

**System parameters are auto-injected by the platform before Skill execution. Only business parameters are needed.**

## Tools (CURRENTLY UNAVAILABLE)

| Tool | Purpose | Business Parameters (system params omitted) | Status |
|------|---------|------|--------|
| Category Prediction | Predict Alibaba category ID from keyword | `categoryDesc` (category keyword, e.g., "cat food") | ❌ 付费，暂不可用 |
| Product Selection | Query hot product rankings for a category | `cateId`, `statisticsType`, `orderBy`, `order`, `countryId?`, `moqPriceMin?`, `moqPriceMax?` | ❌ 付费，暂不可用 |

## Current Data Source

本 Skill 当前使用 `product_supplier_search` 作为主要数据源，通过多组关键词变体查询 + cross-platform web signals 来替代上述付费接口。

详见 SKILL.md Step 2。

---

## Original Tool Details (for future reference)

### Category Prediction

- Search keyword: `category_prediction`
- Business param: `categoryDesc` = user's category keyword
- Returns: `cateId` (category ID), `cateDesc` (category description), `cateLevel` (category level)

### Product Selection

- Search keyword: `product_selection`
- Required business params:
  - `cateId`: category ID from category prediction
  - `statisticsType`: `7d` (7-day) or `30d` (30-day)
  - `orderBy`: sort dimension
  - `order`: `desc` (descending) or `asc` (ascending)

### orderBy Values

| Value | Meaning |
|-------|---------|
| `ab_cnt` | Inquiry volume |
| `rec_ord_amt` | GMV |
| `uv_detail` | UV |
| `prepay_ord_cnt` | Order count |

### Optional Filters

| Parameter | Description |
|-----------|-------------|
| `countryId` | Country code (e.g., "US", "GB") |
| `moqPriceMin` / `moqPriceMax` | Price range filter |
