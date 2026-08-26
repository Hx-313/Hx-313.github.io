# 站外数据工具速查表（Amazon / 跨平台热销 / web_search）

> 站外数据用于交叉验证站内信号、补充市场规模/趋势/买家偏好。
> `js_*` 通过 bash `accio-mcp-cli call` 调用；`web_search` / `product_supplier_search` 是内置 tool_call。

---

## A. Amazon 需求 — js_product_database_query（accio-mcp-cli）

```bash
accio-mcp-cli call js_product_database_query --json '{"include_keywords":["portable blender"],"marketplace":"us","page_size":50}'
```

| 参数 | 说明 |
|------|------|
| `include_keywords` | 关键词数组（英文） |
| `marketplace` | 站点 `us`/`uk`/`de`/`jp` 等，默认 `us` |
| `page_size` | 返回条数，建议 50 |

- 返回错误 → 调参重试，最多 2 次；**不要 fallback 到 web_search**（除非降级路径明确允许）。
- 提取交给 `scripts/extract_demand.py <结果文件> amazon`。
- 关键字段：`title` `price` `unitsSold`(月销) `revenue` `rating` `reviews` `imageUrl` `productLink`。

---

## B. 跨平台热销 — global_hot_selling_products（accio-mcp-cli）

Temu / SHEIN / TikTok / Shopee / 1688 热销验证。

```bash
accio-mcp-cli call global_hot_selling_products --json '{"query":"men jacket","platform":"temu","region":"US","sorting_rule":"sales","type":"hot_selling"}'
```

> ⛔ 正确：`accio-mcp-cli call global_hot_selling_products --json '{...}'`
> ❌ 错误：`workctl icbu product global-hot-selling-products ...`（不要用 workctl 调用此工具）

| 参数 | 说明 |
|------|------|
| `query` | 品类英文关键词 |
| `platform` | `temu`/`shein`/`tiktok`/`shopee`/`1688`，必须小写 |
| `region` | ISO 2 字母国家代码，默认 `US` |
| `sorting_rule` | 固定传 `sales` |
| `type` | 固定传 `hot_selling` |

> ⚠️ **Shopee 特殊规则**：`region` 必须传空字符串 `""`，不能传国家代码。
> ⚠️ **1688 特殊规则**：`region` 必须传 `"CN"`。
> ⚠️ 只允许使用本文档中列出的参数，不要自己发明参数。

- 调用后 stdout 末尾会显示 `saved to <路径>`，直接把该路径传给 `scripts/extract_demand.py <路径> global`。
- 关键字段：`title` `price` `sales`/`unitsSold` `rating` `image` `link` `platform`。

---

## C. web_search（内置 tool_call）

用于：市场规模/增长率、Google Trends 趋势、季节性、行业新闻/热点、买家偏好评论、海关进出口统计、当地文化背景。

检索词建议（英文优先，命中权威来源）：

| 场景 | 检索词模板 |
|------|-----------|
| 市场规模 | `"<品类> global market size 2025 2026"`、`"<品类> market report CAGR"` |
| 趋势 | `"<品类> google trends"`、`"<品类> demand trend 2026"` |
| 国家需求 | `"best selling <品类> in <国家>"`、`"<国家> <品类> import demand"` |
| 季节/文化 | `"<品类> seasonality <国家>"`、`"<国家> <品类> consumer preference culture"` |
| 买家偏好/痛点 | `"<品类> buyer preferences <市场>"`、`"<品类> common complaints reviews"` |
| 行业热点 | `"<行业> industry news trends 2026"`、`"<行业> latest developments"` |

- 引用时在报告标注来源平台（不写工具名），优先近 6 个月数据，注明数据日期。
- 拿不到权威数字时用定性描述，**禁止编造统计数字**。

---

## 字段组装（报告表格）

### 站内商品（Section 3）
- 缩略图：`thumbnail`（脚本预组装 `![img](url)`）
- 产品名+链接：`productLink`（脚本预组装）
- FOB 价：`price`（区间用 `-`）
- MOQ：`minOrdQty`
- 询盘/GMV 指数：`inquiryIdx` / `gmvIdx`

### 站外商品（Section 3 交叉验证）
- 缩略图：`thumbnail`
- 产品名+链接：`productLink`
- 价格：`price`
- 月销：`unitsSold` / `sales`
- 来源平台：Amazon / Temu / SHEIN / TikTok / Shopee / 1688
