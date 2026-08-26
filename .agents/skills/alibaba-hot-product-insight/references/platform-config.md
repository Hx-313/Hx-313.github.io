# 国际站数据工具速查表

**`aliId` 和 `accessToken` 由平台自动注入，调用时无需传递，只需关注业务参数。**

> ⛔ **禁止通过搜索发现工具。** 所有命令名已在本文档中列出，通过 `workctl icbu product <命令名> ... --format json --output <path>` 直接调用。
> ⚠️ **workctl 不可用时的 fallback**：workctl 调用失败（command not found / exit 127 / 超时）→ 用 `accio-mcp-cli call <tool_name> --json '{...}' > <output_path>` 替代（tool_name 用下划线）。各命令的 fallback 写法见下方代码块旁注。
> ⛔ 保存结果只用长参数 `--output <path>`，禁止短参数 `-o`。
> ⛔ 禁止 read_file 读取结果文件，直接把 `--output` 路径喂给 `scripts/` 脚本。

---

## data_advisor_category_infer

根据关键词预测 Alibaba 类目 ID。

```bash
workctl icbu product data-advisor-category-infer --categoryDesc "<品类>" --format json --output infer.json
```

> **fallback**：`accio-mcp-cli call data_advisor_category_infer --json '{"categoryDesc":"<品类>"}' > infer.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `categoryDesc` | string | ✅ | 类目关键词（中英文均可） |

返回：`{"data":[{"cateDesc":"猫粮","cateId":100007073,"cateLevel":3}]}`

| 字段 | 含义 |
|------|------|
| `cateId` | 类目数字 ID（后续工具调用使用此值） |
| `cateDesc` | 类目描述 |
| `cateLevel` | 类目层级 |

---

## data_advisor_product_selection

查询指定类目的热门商品排行。

```bash
workctl icbu product data-advisor-product-selection \
  --cateId <id> --statisticsType 30d --orderBy rec_ord_amt --order desc \
  --format json --output rank.json
```

> **fallback**：`accio-mcp-cli call data_advisor_product_selection --json '{"productSelectionParam":{"cateId":<id>,"statisticsType":"30d","orderBy":"rec_ord_amt","order":"desc"}}' > rank.json`

### 必填参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `cateId` | number | 类目预测返回的类目 ID |
| `statisticsType` | string | 时间周期：`1d`（日）、`7d`（7天汇总）、`30d`（30天汇总） |
| `orderBy` | string | 排序列（见下表） |
| `order` | string | `desc`（降序）或 `asc`（升序） |

### orderBy 可选值

| 值 | 含义 |
|----|------|
| `ab_cnt` | 询盘量 |
| `rec_ord_amt` | 实收 GMV |
| `uv_detail` | Detail UV |
| `prepay_ord_cnt` | 挂账订单量 |

### 可选筛选参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `countryId` | string | 国家编码（如 `"US"`、`"GB"`） |
| `moqPriceMin` / `moqPriceMax` | number | 价格区间 |
| `moqMin` / `moqMax` | number | MOQ 区间 |
| `abCntMin` / `abCntMax` | number | 询盘量区间 |
| `recOrdAmtMin` / `recOrdAmtMax` | number | GMV 区间 |
| `uvDetailMin` / `uvDetailMax` | number | UV 区间 |
| `prepayOrdCntMin` / `prepayOrdCntMax` | number | 挂账订单数区间 |

> ⚠️ 参数必须放在 `productSelectionParam` 对象内，不要放在顶层。
> ⚠️ 传入 JSON 对象，不要传入 JSON STRING。

### 只读 fan-out 并发（拿到 cateId 后）

```json
{
  "steps": [
    {"name": "rank_inquiry", "path": "icbu.product.data-advisor-product-selection", "params": {"cateId": <id>, "statisticsType": "30d", "orderBy": "ab_cnt", "order": "desc"}},
    {"name": "rank_gmv", "path": "icbu.product.data-advisor-product-selection", "params": {"cateId": <id>, "statisticsType": "30d", "orderBy": "rec_ord_amt", "order": "desc"}}
  ]
}
```

```bash
workctl batch call --file rank-batch.json --format json
```

> `batch call` 不支持引用前一步输出；先单独拿 `cateId` 再生成 batch spec。

### 返回字段

| 字段 | 含义 | 报告用法 |
|------|------|---------|
| `prodId` | 商品 ID | 表格标识 |
| `prodName` | 商品名称 | 表格品名列 |
| `imageUrl` | 商品主图 URL | 表格图片列 |
| `priceRange` | 价格区间 | 表格价格列 |
| `moq` | 最小起订量 | 表格 MOQ 列 |
| `abCnt` | 询盘量 | 表格询盘列 |
| `recOrdAmt` | 实收 GMV | 表格 GMV 列 |
| `uvDetail` | Detail UV | 表格 UV 列 |
| `prepayOrdCnt` | 挂账订单量 | 表格订单列 |
