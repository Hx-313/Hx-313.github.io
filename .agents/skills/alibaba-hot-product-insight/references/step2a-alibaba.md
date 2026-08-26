# Step 2A: 国际站数据获取

> 🔧 **允许工具（品类词）：** `data_advisor_category_infer` → `data_advisor_product_selection` → `scripts/extract_top15.py`
> 🔧 **允许工具（品牌词）：** `product_supplier_search`
> ❌ **禁止：** `web_search`、`js_*`
> 📖 工具参数见 `references/platform-config.md`，字段映射见 `references/field-mapping.md`

---

先判断用户关键词是「品类词」还是「品牌/产品词」：
- **品类词**（猫粮、LED灯、瑜伽垫）→ 类目预测 + 商品排行（workctl）
- **品牌/产品词**（Pop Mart、Anker、Dyson）→ 直接 `product_supplier_search`

## 品类词流程

- **Input**: 用户关键词（品类词）
- **参数提取**（从 query 中识别，未提及则用默认值）：

  | 用户表达 | 参数 | 默认值 |
  |----------|------|--------|
  | "美国/US/北美" → `US`，"英国" → `GB`，"德国" → `DE` 等 | `countryId` | 不传（全球） |
  | "XX美元以下"/"低于XX" | `moqPriceMax` | 不传 |
  | "XX美元以上"/"高于XX" | `moqPriceMin` | 不传 |
  | "询盘最多"/"询盘增长" | `orderBy="ab_cnt"` | `rec_ord_amt` |
  | "访问最高"/"流量最大" | `orderBy="uv_detail"` | `rec_ord_amt` |
  | "订单最多" | `orderBy="prepay_ord_cnt"` | `rec_ord_amt` |
  | "最近一周"/"7天"/"近7日" | `statisticsType="7d"` | `30d` |

- **Action**:
  1. 类目预测：
     ```bash
     workctl icbu product data-advisor-category-infer --categoryDesc "<用户原文关键词>" --format json --output infer.json
     ```
     > **fallback**：`accio-mcp-cli call data_advisor_category_infer --json '{"categoryDesc":"<用户原文关键词>"}' > infer.json`
     - 检查 cateDesc 和用户关键词是否相关
     - 不相关 → 重试 1 次（最多 2 次）
     - 仍不相关 → 先尝试联想扩词（同义词、下位词、英文变体，如"厨房用品"→"kitchen organizer / cutting board"）重新预测；仍无法定位 → 用 `ask_user` 追问用户缩窄范围（如"'厨房用品'涵盖面较广，您更关注哪类？如收纳、刀具、小家电"），拿到具体品类后再继续
     - 联想扩词和追问都无法解决 → 改用 `product_supplier_search(query=<用户原文关键词>)`
  2. 商品排行：
     ```bash
     workctl icbu product data-advisor-product-selection --cateId <id> --statisticsType 30d --orderBy rec_ord_amt --order desc --format json --output rank.json
     ```
     > **fallback**：`accio-mcp-cli call data_advisor_product_selection --json '{"productSelectionParam":{"cateId":<id>,"statisticsType":"30d","orderBy":"rec_ord_amt","order":"desc"}}' > rank.json`
     - **只调一次**，接口返回已排序 Top 20
     - 如果参数提取得到了 countryId / moqPriceMin / moqPriceMax / 非默认 orderBy / 非默认 statisticsType，传入对应参数
  3. **⛔ 禁止 read_file 读取结果文件。** 调用完成后**立即**执行：
     ```
     python3 scripts/extract_top15.py <结果文件路径>
     ```
     > ⚠️ 不要凭记忆拼接文件路径。调用的 stdout 末尾会显示 `saved to <路径>`，直接复制该路径传给脚本。
     脚本输出精简 JSON（15 条，只含报告字段 + 指数汇总），这是你唯一需要的数据。
- **Output**: 15 条产品精简 JSON（只含报告字段）

> ⚠️ 不需要调用 ab_cnt。不需要合并、去重、自己排序。
> 如果用户明确要求看询盘数据：额外调一次 `orderBy="ab_cnt"`，两份数据分两个表格独立展示，不合并。
> 多品类处理见 `references/multi-category.md`。

## 品牌/产品词流程

- **Input**: 用户关键词（品牌/产品词）
- **Action**:
  1. `product_supplier_search(intent_type="product", query=<用户原文关键词>)`
     - 这是内置工具，结果直接在 tool_call 返回中，不需要 read_file，不需要 extract_top15.py
  2. 取 Top 15
- **Output**: 15 条产品数据
- **字段组装**：
  - 图片：`Main Image` → `![img](Main Image值)`，为空写 `-`
  - 产品名：`Product Title` + `Product URL` → `[Product Title](Product URL)`
  - 价格：`Price (USD)`
  - MOQ：`MOQ`
  - 评分：`Review Score`
