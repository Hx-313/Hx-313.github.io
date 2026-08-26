# 商品发布 MCP 工具参考

本文件定义了 GGS 商品发布流程中使用的 MCP 工具的参数格式。支持两种发布模式：**新发**（搬品场景）和**编辑**（存量商品优化场景）。

---

## 1. publish_ggs_migration_product

商品发布接口（统一新发 + 编辑）。根据 `productId` 是否存在自动区分：
- **`productId` 为空**：**新发模式** — 创建新商品到 Alibaba 国际站
- **`productId` 非空**：**编辑模式** — 更新已有商品的数据

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `taskId` | number | 否 | 搬品任务 ID。搬品场景下传入，编辑场景下不传 |
| `records` | array\<ProductSandboxRecordDTO\> | 是 | 商品记录列表。**⚠️ 每批最多 5 个商品**，超过可能超出平台上下文限制导致调用失败。商品数量较多时需分批调用 |
| `publishAsDraft` | boolean | 否  | 是否发布为草稿 |

> **⚠️ `before` 和 `after` 的传值取决于发布模式：**
> - **新发模式**（`productId` 为空）：`before` 固定传 `null`，`after` 包含完整的商品数据
> - **编辑模式**（`productId` 非空）：`before` 传优化前的完整快照（从 CSV 的 `before.*` 列构造），`after` 传优化后的快照（从 CSV 的 `after.*` 列构造，未优化字段设 `null`）
>
> **🚨 严禁精简参数（FATAL RED LINE）**：发布操作是**不可逆**的线上行为。如果调用本接口报错，Agent **绝对不允许**私自删除 `after` 中的任何字段、缩减 payload 或尝试用残缺数据重试。报错后必须立即停止并通知用户。
>
> **⚠️ category 为发布必要参数**：若商品最终无有效类目（`after.category` 和 `before.category` 均为空），该商品**不得提交发布**，需先通过优化补全类目。
>
> **⚠️ 同商品多类型优化合并规则**：当同一商品同时存在字段优化结果和图片优化结果时，必须合并到同一次调用的同一个 record 中，严禁对同一商品分多次调用。
>
> 完整的字段结构和格式约束见 `skills/alibaba-global-product-optimize/SKILL.md` 末尾的「ProductSnapshotDTO 完整结构参考」章节。

**ProductSandboxRecordDTO 结构：**

#### 新发模式示例（`productId` 为空，`before` 传 `null`）

```json
{
  "productId": "",
  "generalProductId": "GP987654321",
  "absSummImageUrl": "https://example.com/image.jpg",
  "isExcluded": false,
  "status": "PENDING",
  "reason": null,
  "before": null,
  "after": {
    "title": "Optimized Product Title - High Quality Electronics",
    "price": {
      "priceType": "sku",
      "currency": "USD",
      "skuPrices": [
        {"skuName": "Color:Red", "price": 9.50, "skuId": 50001}
      ],
      "ladderPrices": [],
      "minPrice": 0,
      "maxPrice": 0,
      "fixedPrice": ""
    },
    "leadTime": [
      {"quantity": 1, "leadTime": 5}
    ],
    "moq": 1,
    "unitWeight": 0.5,
    "unitSize": "10x10x10",
    "shippingTemplate": {
      "id": 100001,
      "name": "Standard Shipping"
    },
    "category": {
      "categoryId": 200001,
      "categoryPath": "Electronics > Consumer Electronics"
    },
    "description": "<p>High quality electronics product with advanced features.</p>",
    "properties": [
      {"attributeId": 1001, "attributeName": "Material", "attributeValue": "Plastic", "attributeValueId": 2001}
    ],
    "images": ["https://example.com/img1.jpg"],
    "inventory": "{\"type\":\"SPU\",\"items\":[{\"dispatchLocation\":\"CN\",\"quantity\":1000}]}",
    "pis": 4.5,
    "keywords": "[\"electronics\",\"gadget\",\"wholesale\"]",
    "currencyCode": "USD"
  }
}
```

#### 编辑模式示例（`productId` 非空，`before` 传完整快照）

```json
{
  "productId": "1601653380590",
  "generalProductId": "",
  "absSummImageUrl": "https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J.png_100x100.png",
  "isExcluded": false,
  "status": "PENDING",
  "reason": null,
  "before": {
    "title": "Test 100% Cotton Anti-Wrinkle Casual Regular Fit Printed Shirt",
    "price": {
      "priceType": "sku",
      "currency": "USD",
      "skuPrices": [
        {"skuName": "Xxs, Red", "price": 0.9, "skuId": 107473546692}
      ],
      "ladderPrices": [],
      "minPrice": 0,
      "maxPrice": 0,
      "fixedPrice": ""
    },
    "leadTime": [
      {"quantity": 1, "leadTime": 7},
      {"quantity": 100, "leadTime": 12}
    ],
    "moq": 2,
    "unitWeight": 0.5,
    "unitSize": "10x10x10",
    "shippingTemplate": {"id": 2106539053, "name": "12121122"},
    "category": {"categoryId": 127734143, "categoryPath": "Apparel & Accessories > Men's Clothing > Men's T-Shirts"},
    "description": "High quality 100% cotton shirt with anti-wrinkle technology.",
    "properties": [
      {"attributeId": 191284014, "attributeName": "Material", "attributeValue": "100% Cotton", "attributeValueId": 26389775}
    ],
    "images": ["https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J.png"],
    "inventory": "{\"type\":\"SPU\",\"items\":[{\"dispatchLocation\":\"CN\",\"quantity\":1000}]}",
    "pis": 2.3,
    "keywords": "[\"cotton shirt men casual printed anti-wrinkle\"]",
    "currencyCode": "USD"
  },
  "after": {
    "title": "Men's Cotton Printed Casual Shirt Long Sleeve Regular Fit Anti-Wrinkle",
    "price": null,
    "leadTime": [
      {"quantity": 1, "leadTime": 5},
      {"quantity": 100, "leadTime": 7}
    ],
    "moq": 1,
    "unitWeight": null,
    "unitSize": null,
    "shippingTemplate": null,
    "category": null,
    "description": null,
    "properties": null,
    "images": null,
    "inventory": null,
    "pis": 4.5,
    "keywords": "[\"men cotton shirt casual printed anti-wrinkle long sleeve\"]",
    "currencyCode": null
  }
}
```

> **编辑模式说明**：`after` 中**未优化的字段设为 `null`**，表示保持原值不变。只有被优化过的字段才赋新值。`before` 必须传入完整的优化前快照。

### ProductSandboxRecordDTO 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `productId` | String | 条件必填 | 商品 ID。存量品有值（编辑模式），搬品/新发品为空（新发模式） |
| `generalProductId` | String | 否 | 通用商品 ID（搬品/新发品有值） |
| `absSummImageUrl` | String | 是 | 商品主图 URL |
| `isExcluded` | Boolean | 否 | 是否被排除 |
| `status` | String | 否 | 状态：`PENDING` / `SUCCESS` / `FAILED` |
| `reason` | String | 否 | 失败原因（仅 status=FAILED 时有值） |
| `before` | ProductSnapshotDTO | 条件必填 | 新发模式传 `null`；编辑模式传优化前的完整商品快照 |
| `after` | ProductSnapshotDTO | 是 | 优化后的商品快照。新发模式包含完整数据；编辑模式中未优化字段设 `null` |
| `isPotentialCompetitive` | Boolean | 否 | 是否为潜在趋势品。由后端自动填充，Agent **只读不写** |

### ProductSnapshotDTO 字段说明

`before` / `after` 使用 `ProductSnapshotDTO` 结构（与 `com.alibaba.ggs.nurture.product.dto.agent.ProductSnapshotDTO` 对齐）。

> 完整的类型层级、嵌套结构、字段约束和多种 priceType 的 JSON 样例见 `skills/alibaba-global-product-optimize/SKILL.md` 末尾的「ProductSnapshotDTO 完整结构参考」章节。

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| `title` | String | 是 | 非空字符串 | 商品标题 |
| `price` | ProductPriceDTO | 是 | 嵌套对象，非字符串 | 商品价格，详见下文 ProductPriceDTO |
| `leadTime` | QuantityTieredLeadTime[] | 是 | 嵌套数组，按 quantity 升序 | 阶梯交期，详见下文 QuantityTieredLeadTime |
| `moq` | Integer | 是 | 正整数 | 最小起订量 |
| `unitWeight` | Double | 否 | 正数，单位：千克 | 单件毛重 |
| `unitSize` | String | 否 | 纯数字+`x`分隔，如 `"30x20x15"` | 包装尺寸（长x宽x高），**禁止包含 cm/mm 等单位后缀** |
| `shippingTemplate` | ShippingTemplateDTO | 否 | 嵌套对象，非字符串 | 物流模板，详见下文。**若用户选择了物流模版，必须优先使用** |
| `category` | CategoryDTO | 条件必填 | 嵌套对象，非字符串 | 类目信息，**发布时必须有值** |
| `description` | String | 否 | HTML 字符串，保留所有标签 | 商品描述 |
| `properties` | GlobalProductAttribute[] | 否 | 嵌套数组 | 商品属性列表，详见下文 |
| `images` | String[] | 否 | URL 字符串数组 | 商品图片 URL 列表 |
| `inventory` | String | 否 | JSON 字符串，分 SKU/SPU 两种类型 | 库存信息。SKU 类型含 `skuInventories` 数组（每项含 `skuId` 和 `items`）；SPU 类型含 `items` 数组。每个 item 含 `dispatchLocation`、`warehouseCode`（可选）、`quantity`。**🚨 严禁捏造或默认填充库存数量** |
| `pis` | Double | 否 | 0-6 分 | 商品质量分 |
| `keywords` | String | 否 | **必须为 JSON 数组格式字符串** | 关键词，如 `"[\"keyword1\",\"keyword2\"]"`，**禁止传纯文本** |
| `currencyCode` | String | 否 | ISO 4217 货币代码 | 币种，如 `"USD"` |

### ProductPriceDTO（价格对象）

**`priceType` 为必填字段，必须为小写枚举值。** 根据 priceType 不同，选用对应的价格字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `priceType` | String | **是** | **必填**，枚举值（**小写**）：`sku` / `ladder` / `tiered` / `range` / `fixed` |
| `currency` | String | 是 | 币种，如 `"USD"` |
| `skuPrices` | SkuPriceItem[] | priceType=`sku` 时必填 | SKU 价格列表，每项含 `skuName`(String)、`price`(Double)、`skuId`(Long) |
| `ladderPrices` | LadderPriceItem[] | priceType=`ladder`/`tiered` 时必填 | 阶梯价格列表，每项含 `minQuantity`(Integer)、`price`(Double) |
| `minPrice` | Double | priceType=`range` 时必填 | 最低价 |
| `maxPrice` | Double | priceType=`range` 时必填 | 最高价 |
| `fixedPrice` | String | priceType=`fixed` 时必填 | 固定价格（注意是 String 类型） |

**priceType 与字段对应关系：**

| priceType | 必用字段 | 其余字段 |
|-----------|---------|---------|
| `sku` | `skuPrices` | 其余可为空数组/0/空字符串 |
| `ladder` / `tiered` | `ladderPrices` | 其余可为空数组/0/空字符串 |
| `range` | `minPrice` + `maxPrice` | 其余可为空数组/0/空字符串 |
| `fixed` | `fixedPrice` | 其余可为空数组/0/空字符串 |

### QuantityTieredLeadTime（阶梯交期）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `quantity` | Integer | 是 | 数量档（如 1, 100, 500） |
| `leadTime` | Integer | 是 | 交期天数 |

**禁止使用已废弃字段名**：`quantityFrom`、`quantityTo`、`leadTimeFrom`、`leadTimeTo` 均已废弃，严禁使用。

### ShippingTemplateDTO（物流模板）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | 是 | 物流模板 ID |
| `name` | String | 是 | 物流模板名称 |

### CategoryDTO（类目信息）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `categoryId` | Long | 是 | 类目 ID |
| `categoryPath` | String | 是 | 类目路径，如 `"Apparel & Accessories > Men's Clothing > Men's T-Shirts"` |

### GlobalProductAttribute（商品属性）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `attributeId` | Long | 是 | 属性 ID |
| `attributeName` | String | 是 | 属性名称，如 `"Material"` |
| `attributeValue` | String | 是 | 属性值，如 `"100% Cotton"` |
| `attributeValueId` | Long | 是 | 属性值 ID（自定义值时传 `-1`） |

> **注意**：`price`、`leadTime`、`shippingTemplate`、`category`、`properties`、`images` 在传输时为 **JSON 对象或数组**（非字符串）。`description` 为纯 HTML 字符串，必须完整保留所有 HTML 标签。`inventory` 为 JSON 字符串。**`keywords` 必须为 JSON 数组格式的字符串**。**`unitSize` 必须为纯数字 + `x` 分隔符格式**。

**返回值说明：**

返回 `BatchPostingResponse` 结构：
```json
{
  "successCount": 10,
  "failCount": 2,
  "skippedAlreadyPostedCount": 0,
  "successUrls": {
    "123456789": "https://www.alibaba.com/product-detail/...",
    "987654321": "https://www.alibaba.com/product-detail/..."
  },
  "errorMsgList": {
    "111222333": "Category ID is invalid",
    "444555666": "Price type is missing"
  }
}
```
Agent 需将此 JSON 结果保存，并调用 `update_publish_result.py` 脚本将状态和 URL 写回 CSV。

---

## 2. ggs_cancel_migration_task

取消进行中的 GGS 搬品任务。当用户在创建任务或预检查时遇到 `ALREADY_HAS_RUNNING_TASK` 错误时，可调用此接口取消老任务。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `taskId` | number | 是 | 要取消的搬品任务 ID |

**返回值说明：**

返回取消结果。成功后，Agent 可继续为用户创建新的搬品任务。

---

## 通用说明

- 所有工具通过 **MCP 方式调用**，无需构造 HTTP 请求
- `mcp-ali-id` header 由 MCP 框架自动注入，Agent 无需手动传递
- 长耗时工具（`publish_ggs_migration_product`）超时建议设为 120s
- 查询类工具超时保持默认 30s 即可
