# Step 2D: 其他站外平台数据获取（web_search）

> 🔧 **允许工具：仅 `web_search`**
> ❌ **禁止：** `data_advisor_*`、`js_*`、`global_hot_selling_products`、`product_supplier_search`
> ⛔ `product_supplier_search` 在 Step 3 报告前单独调用（用于 Section 7 供应商推荐）。**在本步骤中调用是违规行为。**
> **⛔ 本路径报告表格不含缩略图列。**

---

## 适用平台

| 平台 | 搜索格式 |
|------|----------|
| eBay | `web_search(query="<类目> best seller site:ebay.com")` |
| AliExpress / 速卖通 | `web_search(query="<关键词> 热卖 site:aliexpress.com")` |
| Lazada | `web_search(query="<关键词> 热卖 site:lazada.com")` |

## 执行流程

- **Input**: 用户关键词 + 平台
- **Action**:
  1. `web_search(query="...")`（按上表格式）
  2. 结果不相关或质量差 → **换关键词重试**，最多 2 次。**不要换数据源**
  3. 从搜索结果中提取产品信息（能提取多少就多少，不足 15 条也可以）
- **Output**: 产品数据（质量取决于搜索结果）

## 字段组装

web_search 返回的是搜索摘要，非结构化数据，按以下优先级处理：

- 产品名：有标题文本 → 直接用；搜索结果含 `[标题](URL)` markdown → 直接用；都没有 → 用搜索摘要前 50 字符
- 链接：搜索结果中有明确的产品页 URL → `[产品名](URL)`；URL 不可靠或缺失 → 只写产品名，不加链接
- 图片：**不要求，不要有缩略图列**
- 价格：从摘要文本中提取，无法提取写 `-`
- 评分：从摘要文本中提取，无法提取写 `-`

> ⚠️ web_search 数据质量有限，**宁可少列也不要编造**。
> ⚠️ **禁止编造产品名称、价格、评分。** 所有数据必须来自 web_search 返回的实际内容。
> 📖 报告模板使用 `assets/report_template_websearch_zh.md`（该模板没有缩略图列）。
