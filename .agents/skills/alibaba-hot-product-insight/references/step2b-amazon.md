# Step 2B: Amazon 数据获取

> 🔧 **允许工具：仅 `js_product_database_query`**
> ❌ **禁止：** `web_search`、`data_advisor_*`、`product_supplier_search`
> ⛔ `product_supplier_search` 在 Step 3 报告前单独调用（用于 Section 7 供应商推荐）。**在本步骤中调用 `product_supplier_search` 是违规行为。**
> 📖 工具参数见 `references/amazon-tools.md`，只允许使用该文档中列出的参数

JS 是 Amazon 的专用数据接口，数据质量（销量、价格、ASIN、评分）远高于 web_search。遇到问题时通过调整 JS 参数解决：
- 结果混入配件 → 加 `categories` 筛选或换更精确的 `include_keywords`
- 参数报错 → 简化参数重试（见 `references/amazon-tools.md`）
- 结果不足 → 换同义关键词重试

---

- **Input**: 用户关键词
- **Action**:
  1. `accio-mcp-cli call js_product_database_query --json '{"include_keywords":["<关键词>"],"marketplace":"us","page_size":50}'`
  2. 返回错误（422/402 等）→ **调整参数重试**：
     - 422 categories 错误 → 修正 category 名称（见 `references/amazon-tools.md` 可选值列表）
     - 422 其他参数错误 → 简化参数（去掉 categories，只保留 include_keywords）
     - 结果不足 → 换关键词重试（如 "smartphone" → "unlocked cell phone"），最多重试 2 次
  3. **⛔ 禁止 read_file 读取结果文件，禁止用 cat/grep/python 处理。** 调用完成后**立即**执行：
     ```
     python scripts/extract_amazon_top15.py <结果文件路径>
     ```
     > ⚠️ 不要凭记忆拼接文件路径。调用的 stdout 末尾会显示 `saved to <路径>`，直接复制该路径传给脚本。
     脚本自动按 30 天销量降序排列，输出精简 JSON（含预组装的 thumbnail 和 productLink），这是你唯一需要的数据。
- **Output**: 最多 15 条产品精简 JSON

## 字段组装

脚本 `scripts/extract_amazon_top15.py` 已预组装以下字段，直接复制到表格：

- 缩略图：`thumbnail`（已预组装为 `![img](url)` 格式，无图时为 `-`）
- 产品名+链接：`productLink`（已预组装为 `[title](url)` 格式，URL 由 ASIN + marketplace 自动拼接）
- 价格：`price`
- 月销量：`unitsSold`
- 评分：`rating`（null 时写 `-`）
- 评论数：`reviews`（null 时写 `-`）
