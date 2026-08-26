# Step 2C: Temu / SHEIN / 1688 / Shopee / TikTok 数据获取（global_hot_selling_products）

> 🔧 **允许工具：仅 `global_hot_selling_products`**
> ❌ **禁止：** `web_search`、`data_advisor_*`、`js_*`、`product_supplier_search`
> ⛔ `product_supplier_search` 在 Step 3 报告前单独调用（用于 Section 7 供应商推荐）。**在本步骤中调用是违规行为。**
> 📖 工具参数见 `references/global-hot-selling.md`，只允许使用该文档中列出的参数

---

## 参数提取

从用户 query 中识别：

| 用户表达 | 参数 | 默认值 |
|----------|------|--------|
| "Temu" | `platform="temu"` | — |
| "SHEIN" | `platform="shein"` | — |
| "1688" | `platform="1688"` | 必须传 `region="CN"` |
| "Shopee" | `platform="shopee"` | 必须传 `region=""` |
| "TikTok" | `platform="tiktok"` | — |
| "美国/US" → `US`，"英国" → `GB` 等 | `region` | 不传 |

> `sorting_rule` 固定传 `sales`，`type` 固定传 `hot_selling`。

## 执行流程

- **Input**: 用户关键词 + 平台
- **Action**:
  1. `global_hot_selling_products(query="<关键词英文>", platform="<平台>", sorting_rule="sales", type="hot_selling")`
     - 关键词建议使用英文（如 "yoga mat"、"smartphone"）
     - 如果用户用中文，翻译为英文后调用
     - ⛔ **region 规则**（在调用时必须检查）：
       - 1688 → 加 `"region":"CN"`
       - Shopee → 加 `"region":""`
       - 其他平台 → 用户指定了国家则加对应代码（如 `"region":"US"`），未指定则不传
  2. **⛔ 禁止 read_file 读取结果文件。** 调用完成后**立即**执行：
     ```
     python scripts/extract_global_top15.py <结果文件路径>
     ```
     > ⚠️ 不要凭记忆拼接文件路径。调用的 stdout 末尾会显示 `saved to <路径>`，直接复制该路径传给脚本。
     脚本输出精简 JSON（最多 15 条，含预组装的 thumbnail 和 productLink）。
  3. 结果不足或不相关 → 换英文同义关键词重试，最多 2 次
  4. 重试 2 次仍失败（返回 null 或空结果）→ 切换到 web_search 路径：按 `references/step2d-websearch.md` 执行，报告使用 `assets/report_template_websearch_zh.md`（无缩略图列）
  4. **Shopee 特殊情况**：由于 `region=""` 返回的是多站点聚合数据，结果可能较少（<10 条）。数据不足时有多少用多少，不要编造凑数。
- **Output**: 最多 15 条产品精简 JSON

## 字段组装

脚本 `scripts/extract_global_top15.py` 已预组装以下字段，直接复制到表格：

- 缩略图：`thumbnail`（已预组装为 `![img](url)` 格式）
- 产品名+链接：`productLink`（已预组装为 `[title](url)` 格式，URL 来自 `prod_url` 原始值）
- 价格：`price`
- 30天销量：`salesCnt30d`
- 评分：`rating`（null 时写 `-`）
- 评论数：`reviewCnt`（null 时写 `-`）
- 正面标签：`positiveTag`（Section 3 深度分析中可用）
- 负面标签：`negativeTag`（Section 3/4 中可用）
- TikTok 视频数：`ttRelateVideo`（Section 3 中可用）

> 📖 报告模板使用 `assets/report_template_global_zh.md`。
