# 商品治理工具 · 调用规范

本文件定义了 `alibaba-global-product-optimize` Skill 依赖的工具的完整调用方式，供跨平台移植时注册工具使用。

## 通用约定

- **调用方式**：所有工具均通过 **MCP 工具调用**方式执行，Agent 直接调用对应的 MCP 工具并传入参数即可，**不再有任何 HTTP POST 请求**。**⚠️ 严禁通过编写 Python/Shell/Node.js 等脚本来间接构造参数或调用 MCP 工具**，所有参数必须由 Agent 直接以 JSON 格式内联传入 MCP 工具调用中
- **认证**：由 MCP 网关统一注入，工具层不处理
- **超时**：所有工具的超时时间均为 **600s（10 分钟）**
- **响应体统一结构**（对齐 `ProductAgentResponse`）：
- **⚠️ 工具调用失败处理**：如果工具调用失败（`success` 为 `false` 或抛出异常），**请直接结束本次调用，向用户报告错误，不要尝试缩小参数后重试**。工具调用失败通常意味着参数格式错误、数据问题或系统异常，重试不会解决问题。
- **⚠️ 401 错误自检**：如果工具调用返回 **401 Unauthorized** 错误，请检查是否传递了 `mcp-ali-id` 参数。**每一个接口都需要传 `mcp-ali-id`**，如果没有传递，请确保在 MCP 工具调用中包含 `mcp-ali-id` 参数，格式为 `{"mcp-ali-id": "your-ali-id"}`。
- **⚠️ 特殊字符转义**：在调用 MCP 工具时，如果参数中包含特殊字符（如 `description` 字段中的双引号 `"`、反斜杠 `\`、换行符 `\n` 等），**必须进行 JSON 转义**，否则会导致工具调用失败。例如：
  - 双引号 `"` → `\"`
  - 反斜杠 `\` → `\\`
  - 换行符 → `\n`
  - 回车符 → `\r`
  
  **错误示例**（未转义）：
  ```json
  {
    "description": "This is a \"test\" description"
  }
  ```
  
  **正确示例**（已转义）：
  ```json
  {
    "description": "This is a \\\"test\\\" description"
  }
  ```


| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否成功 |
| `data` | any | 业务数据体 |
| `message` | string | 失败/说明文案 |
| `errorCode` | string | 错误码 |

---

## ProductSnapshotDTO 结构定义

`before` 和 `after` 共用同一结构 **`ProductSnapshotDTO`**，须与 Java 类 `com.alibaba.ggs.nurture.product.dto.agent.ProductSnapshotDTO` 的字段名及嵌套类型一致（与 `references/optimize-preview-html.md` 中的解析规则一致）。**交期**须使用 `QuantityTieredLeadTime` 形态，**禁止**使用已废弃字段名 `quantityFrom`、`quantityTo`、`leadTimeFrom`、`leadTimeTo`。

### 结构示例

```json
{
  "title": "Original Product Title",
  "price": {
    "priceType": "sku",
    "currency": "USD",
    "skuPrices": [
      {"skuName": "Color:Red", "price": 10.00, "skuId": 50001}
    ],
    "ladderPrices": [
      {"minQuantity": 1, "price": 10.00}
    ],
    "minPrice": 10.00,
    "maxPrice": 10.00,
    "fixedPrice": ""
  },
  "leadTime": [
    {"quantity": 1, "leadTime": 7}, {"quantity": 100, "leadTime": 12}
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
  "description": "<p>Original description</p>",
  "properties": [
    {"attributeId": 1001, "attributeName": "Material", "attributeValue": "Plastic", "attributeValueId": 2001}
  ],
  "images": ["https://example.com/img1.jpg"],
  "inventory": "{\"type\":\"sku\",\"skuInventories\":[{\"skuId\":12345,\"items\":[{\"dispatchLocation\":\"CN\",\"warehouseCode\":\"WH001\",\"quantity\":30}]}]}",
  "pis": 3.5,
  "keywords": "[\"men cotton shirt casual printed anti-wrinkle long sleeve\"]",
  "hsCodeList": [
    {"targetCountry": "US", "hsCode": "1234567890"},
    {"targetCountry": "EU", "hsCode": "0987654321"}
  ],
  "currencyCode": "USD"
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `productId` | Long | **仅**在 `query_product_score` 的 `snapshot` 根对象上需要与 DTO 对齐传入；`ProductSandboxRecordDTO` 内嵌的 `before` / `after` 以顶层 `productId` 标识商品，嵌套快照是否带该字段以后端序列化为准 |
| `title` | String | 商品标题 |
| `price` | Object | `ProductPriceDTO`：`priceType` 为小写字符串枚举 `sku` / `ladder` / `tiered` / `range` / `fixed`；`currency`（String）。按类型选用字段：`sku` → `skuPrices`（`skuName`、`price`、`skuId`）；`ladder` / `tiered` → `ladderPrices`（`minQuantity`、`price`）；`range` → `minPrice`、`maxPrice`；`fixed` → `fixedPrice`（String）。实际报文可能同时出现未使用的键，以 DTO 为准 |
| `leadTime` | Array | `List<QuantityTieredLeadTime>`：每项仅 **`quantity`（数量档）**、**`leadTime`（交期天数）**。`quantity` 代表起订量阈值，含义为"当起订量 ≤ `quantity` 时，交期为 `leadTime` 天"。按数量档升序排列；与阶梯价类似可用多档表达不同起订量下的交期 |
| `moq` | Integer | 最小起订量 |
| `unitWeight` | Double | 单件毛重（千克） |
| `unitSize` | String | 包装尺寸（长×宽×高等字符串） |
| `shippingTemplate` | Object | 物流模板：`id`（Long）、`name`（String） |
| `category` | Object | 类目：`categoryId`（Long）、`categoryPath`（String） |
| `description` | String | 商品描述（HTML），传输时须完整保留标签 |
| `properties` | Array | `GlobalProductAttribute[]`：`attributeId`、`attributeName`、`attributeValue`、`attributeValueId` |
| `images` | String[] | 商品图片 URL 列表 |
| `inventory` | String | 发货地与库存信息（JSON 字符串），分 SKU/SPU 两种类型。SKU 类型含 type、skuInventories（每项含 skuId 和 items）；SPU 类型含 type、items。每个 item 含 dispatchLocation、warehouseCode（可选）、quantity |
| `pis` | Double | 商品质量分（PIS / 竞争力分） |
| `keywords` | String（JSON 数组字符串） | 关键词，**必须为 JSON 数组格式的字符串**，如 `"[\"keyword1\",\"keyword2\"]"`。禁止传纯文本（如 `"keyword1 keyword2"`） |
| `hsCodeList` | Array\<Object\> | HS 编码列表，**数组中每项为对象**，含 `targetCountry`（目标国家，String）和 `hsCode`（对应的 HS 编码，String）。示例：`[{"targetCountry": "US", "hsCode": "1234567890"}, {"targetCountry": "EU", "hsCode": "0987654321"}]` |
| `currencyCode` | String | 快照级币种，可与 `price.currency` 并存 |

### 属性（CPV）合并与发布规范

在构造 `apply_governance` 的 `after.properties` 时，禁止简单追加列表，必须遵循以下"三步合并法"：

**1. 标识符对齐**：遍历 AI 建议的新属性（`after`），优先通过 `attributeId` 与原属性（`before`）匹配；若 ID 为空，则通过 `attributeName` 进行文本匹配。

**2. 精准覆盖**：
- **匹配成功**：保留原有的 `attributeId`，将 `attributeValue` 更新为新值，同时将 `attributeValueId` 显式设为 `null` 或 `-1`（防止旧 ID 与新文字冲突）。
- **匹配失败**：作为新属性添加到列表。

**3. 去重清洗**：最终生成的列表严禁出现重复的 `attributeName` 或 `attributeId`。若存在冲突，必须以"优化后"的值为准。

**4. 全量提交**：即使只修改了一个属性，也必须提交该商品在 `before` 中存在的全量属性列表，确保 SKU 销售属性不丢失。

> **注意**：`after` 中未优化的字段设为 `null`，后端只会更新非 null 的字段。`price`、`leadTime`、`shippingTemplate`、`category`、`properties`、`images` 在传输时为 **JSON 对象或数组**（非字符串）。`description` 为纯 HTML 字符串。`inventory` 为字符串。**特别注意：`description` 字段的值包含 HTML 标签（如 `<p>`、`<br>`、`<img>` 等），在读取、传输和写回过程中必须完整保留所有 HTML 标签，不可丢失、转义或修改。**

---

## 1. 批量优化工具（异步）

批量优化功能已拆分为三个异步工具，按顺序调用：

### 1.1 create_ggs_batch_optimize_main_task（创建 GGS 批量优化主任务）

创建批量优化主任务，返回任务 ID。

- **调用方式**：**MCP 工具调用**。Agent 直接调用 MCP 工具 `create_ggs_batch_optimize_main_task`，传入下方参数即可
- **超时**：600s（10min）

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `mcp-ali-id` | string | 是 | 商家的阿里 ID，**每一个接口都需要传** |
| `total` | Integer | 是 | 待优化商品总数 |
| `taskFileId` | String | 否 | 任务文件 ID（可选） |
| `actions` | object[] | 是 | 字段级优化动作数组，每项含 `field`、`strategy`（`AI_SUGGEST` 或 `USER_PROMPT`）和 `value`。**⚠️ `field` 必须使用以下枚举值**：`TITLE`、`PRICE`、`LEAD_TIME`、`MOQ`、`WEIGHT`、`DIMENSION`、`LOGISTICS_TEMPLATE`、`CATEGORY`、`DESCRIPTION`、`CPV`、`IMAGE`、`INVENTORY`、`KEYWORD`、`TRANSLATE`、`PRICE_EXCHANGE`。枚举详见 `actions-and-presets.md` |
| `userPrompt` | String | 否 | 用户的自然语言优化指令（纯文本字符串） |

#### 请求体示例

```json
{
  "mcp-ali-id": "your-ali-id",
  "total": 1,
  "taskFileId": "",
  "actions": [
    {"field": "TITLE", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "PRICE", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "MOQ", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "LEAD_TIME", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "DESCRIPTION", "strategy": "AI_SUGGEST", "value": ""}
  ],
  "userPrompt": ""
}
```

#### 成功响应

```json
{
  "success": true,
  "data": "2e59a61eac5a44e3aaa481db78774080",
  "fileId": ""
}
```

`data` 为任务 ID，后续步骤需要使用此 ID。

---

### 1.2 submit_ggs_batch_optimize_detail（提交 GGS 批量优化任务明细）

提交批量优化任务的商品明细数据。

- **调用方式**：**MCP 工具调用**。Agent 直接调用 MCP 工具 `submit_ggs_batch_optimize_detail`，传入下方参数即可
- **超时**：600s（10min）

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `mcp-ali-id` | string | 是 | 商家的阿里 ID，**每一个接口都需要传** |
| `taskId` | String | 是 | 任务 ID（由 `create_ggs_batch_optimize_main_task` 返回） |
| `productInfo` | ProductSandboxRecordDTO[] | 是 | 待优化的商品记录列表。**⚠️ 必须以 JSON 数组格式直接传入 MCP 工具调用参数中**，严禁通过编写 Python/Shell 脚本等方式间接构造或提交。**⚠️ 必须传入完整的 `ProductSandboxRecordDTO` 结构体**：每个商品记录必须包含 `productId`、`absSummImageUrl`、`isExcluded`、完整的 `before` 对象（含 `title`、`price`、`leadTime`、`moq`、`unitWeight`、`unitSize`、`shippingTemplate`、`category`、`description`、`properties`、`images`、`inventory` 等所有字段，CSV 中有值的字段都必须传入）。其中 **`before` 的字段名与嵌套 JSON 形状须与 `ProductSnapshotDTO` 一致**（例如 `leadTime` 为 `{ "quantity", "leadTime" }[]`，`price.priceType` 为小写 `sku`/`ladder`/…，详见下文「ProductSnapshotDTO 字段说明」）。**禁止只传部分字段或省略 `before` 中的任何字段**，否则后端优化逻辑无法正确执行。**每批最多 50 个** |

#### 请求体示例

```json
{
  "mcp-ali-id": "your-ali-id",
  "taskId": "2e59a61eac5a44e3aaa481db78774080",
  "productInfo": [
    {
      "productId": "1601653380590",
      "generalProductId": "2601653380590",
      "absSummImageUrl": "https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J/Test-100-Cotton-Anti-Wrinkle-Casual.png_100x100.png",
      "isExcluded": false,
      "reason": "",
      "status": "",
      "before": { "...完整的 ProductSnapshotDTO 结构，详见上文『ProductSnapshotDTO 结构定义』..." },
      "after": { "...完整的 ProductSnapshotDTO 结构，详见上文『ProductSnapshotDTO 结构定义』..." }
    }
  ]
}
```

#### 成功响应

```json
{
  "success": true,
  "data": 1,
  "fileId": "2e59a61eac5a44e3aaa481db78774080"
}
```

`data` 为提交的商品数量，`fileId` 为任务 ID。

---

### 1.3 query_ggs_batch_optimize_result（查询 GGS 批量优化结果）

查询批量优化任务的结果。

- **调用方式**：**MCP 工具调用**。Agent 直接调用 MCP 工具 `query_ggs_batch_optimize_result`，传入下方参数即可
- **超时**：600s（10min）

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `mcp-ali-id` | string | 是 | 商家的阿里 ID，**每一个接口都需要传** |
| `taskId` | String | 是 | 任务 ID（由 `create_ggs_batch_optimize_main_task` 返回） |
| `pageNo` | Integer | 是 | 页码，**从 1 开始**（第 1 页为 `pageNo=1`） |
| `pageSize` | Integer | 是 | 每页大小，**必须大于 0 且不超过 20** |

**⚠️ 分页说明**：查询优化结果是分页的，`pageNo` 从 1 开始计数，`pageSize` 必须大于 0 且**不超过 20**。若商品数量超过 `pageSize`，需要多次调用此工具遍历所有页面。

**⚠️ pageSize 上限说明**：`pageSize` 的最大值为 **20**，超过此值会导致请求体长度超出限制，工具调用失败。建议设置为 10-20 之间的值。

### 常见错误参数示例

**错误示例 1**：`pageNo` 从 0 开始
```json
{
  "taskId": "xxx",
  "pageNo": 0,  // ❌ 错误：pageNo 必须从 1 开始
  "pageSize": 10
}
```

**正确示例**：
```json
{
  "taskId": "xxx",
  "pageNo": 1,  // ✅ 正确：pageNo 从 1 开始
  "pageSize": 10
}
```

**错误示例 2**：`pageSize` 为 0 或负数
```json
{
  "taskId": "xxx",
  "pageNo": 1,
  "pageSize": 0  // ❌ 错误：pageSize 必须大于 0
}
```

**正确示例**：
```json
{
  "taskId": "xxx",
  "pageNo": 1,
  "pageSize": 10  // ✅ 正确：pageSize 大于 0
}
```

#### 请求体示例

```json
{
  "mcp-ali-id": "your-ali-id",
  "taskId": "2e59a61eac5a44e3aaa481db78774080",
  "pageNo": 1,
  "pageSize": 10
}
```

#### 成功响应

```json
{
  "success": true,
  "data": {
    "totalCnt": 1,
    "records": [
      {
        "productId": "1601653380590",
        "generalProductId": "2601653380590",
        "before": { "...ProductSnapshotDTO 结构，详见上文『ProductSnapshotDTO 结构定义』..." },
        "after": { "...ProductSnapshotDTO 结构，详见上文『ProductSnapshotDTO 结构定义』..." },
        "status": "SUCCESS",
        "reason": "",
        "isExcluded": false,
        "absSummImageUrl": "https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J/Test-100-Cotton-Anti-Wrinkle-Casual.png_100x100.png"
      }
    ],
    "pageNo": 1,
    "pageSize": 10
  },
  "fileId": "2e59a61eac5a44e3aaa481db78774080"
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | Boolean | 请求是否成功 |
| `fileId` | String | 任务 ID，用于后续查询 |
| `filePath` | String | 文件路径（可选） |
| `data.status` | String | 任务整体状态：`PROCESSING`（处理中）、`COMPLETED`（已完成） |
| `data.totalCnt` | Integer | 总记录数（待优化的商品总数） |
| `data.processingCnt` | Integer | 处理中的商品数量 |
| `data.successCnt` | Integer | 已成功优化的商品数量 |
| `data.failedCnt` | Integer | 优化失败的商品数量 |
| `data.records` | ProductSandboxRecordDTO[] | 当前页的优化结果列表 |
| `data.pageNo` | Integer | 当前页码 |
| `data.pageSize` | Integer | 每页大小 |
| `data.records[].status` | String | 单个商品的优化状态：`SUCCESS`（成功）、`FAILED`（失败）、`PENDING`（处理中） |
| `data.records[].reason` | String | 失败原因（仅当 status 为 FAILED 时有效） |
| `data.records[].after` | ProductSnapshotDTO | 优化后的商品快照 |

#### 异步进度渲染

根据返回的字段，可以计算并渲染异步任务的进度：

- **总进度**：`(successCnt + failedCnt) / totalCnt * 100%`
- **处理中进度**：`processingCnt / totalCnt * 100%`
- **成功进度**：`successCnt / totalCnt * 100%`
- **失败进度**：`failedCnt / totalCnt * 100%`

**进度条示例**：
```
[████████░░] 60% (100/164) - 处理中: 50, 成功: 50, 失败: 0
```

**状态判断**：
- 当 `status` 为 `PROCESSING` 时，任务仍在处理中，需要继续轮询
- 当 `status` 为 `COMPLETED` 时，任务已全部完成，可以停止轮询
- 当 `status` 为 `PARTIAL_FAILED` 时，任务已完成但部分商品失败，可以停止轮询
- 当 `processingCnt` 为 0 且 `successCnt + failedCnt` 等于 `totalCnt` 时，任务已完成

#### 轮询策略

Agent 需要轮询查询结果，直到所有商品的状态变为 `SUCCESS` 或 `FAILED`，并且**需要遍历所有页面获取全部结果**：

1. **调用查询**：调用 `query_ggs_batch_optimize_result` 查询任务状态和商品结果
2. **检查状态**：检查 `data.status` 字段及 `data.records` 中各商品的 `status` 字段
3. **继续轮询**：如果 `data.status` 为 `PROCESSING` 或仍有商品状态为 `PENDING`，按轮询间隔等待后继续查询
4. **终态处理**：当 `data.status` 为 `COMPLETED` 或 `PARTIAL_FAILED` 时，停止轮询，进入后续处理
5. **分页遍历**：任务完成后，从 `pageNo=1` 开始遍历所有页面，获取全部商品的优化结果

**⚠️ 重要**：必须遍历所有页面，确保获取全部商品的优化结果，不能只查询第一页。

#### 轮询间隔规则（直接查表，固定不变）

每次轮询使用一次性 cron（`deleteAfterRun: true`），间隔**直接查下表**，**全程同间隔，不递增、不推算**。

**间隔表**（对应 cron 工具 `schedule.kind=in` 的 `inMs` 参数）：

| 商品数量 | inMs |
|---------|------|
| ≤ 10 个 | `60000` |
| 11 ~ 50 个 | `120000` |
| > 50 个 | `180000` |

**硬约束（违反即失败）**：

1. **单位强制毫秒**：`inMs` 只能填上表中的数值（`60000` / `120000` / `180000`），不得做单位换算。
2. **硬下限**：`inMs` 必须 ≥ `60000`,任何情况下都不允许更小。
3. **全程同间隔**：首次轮询和后续每次轮询都使用同一个 `inMs` 值,不按进度推算、不按次数递增。
4. **不动态计算**：本规则下不存在"动态计算下一次间隔"的逻辑,只查表。

---

### 异步任务后台轮询与面板反馈规则

**在调用 `query_ggs_batch_optimize_result` 工具时，必须使用以下轮询方式：**

1. **任务创建**：调用 `create_ggs_batch_optimize_main_task` 获取 `taskId` 后，立即调用 `task_create` 创建本地任务。
   - **Subject**（必须使用用户当前语言）：
     - 中文用户示例：`商品优化进行中 ⏳`
     - 英文用户示例：`Product Optimization In Progress ⏳`
     - **⚠️ 语言适配**：以上仅为中英文示例，实际输出时必须翻译为用户当前使用的语言（包括繁体中文等）。
   - **Description**（面向用户的部分必须使用用户当前语言，技术元数据部分可保留英文）：
     ```
     正在为您优化 <商品总数> 个商品，请稍候...
     处理完成后会自动通知您查看优化结果。

     ---
     [Skill: alibaba-global-product-optimize]
     [Protocol: execution-protocol.md, optimize-preview-html.md]
     [TaskId: <taskId>]
     [TotalItems: <商品总数>]
     [CsvPath: <CSV文件路径>]
     [CurrentInterval: <inMs 数值,取自轮询间隔规则表>]
     [PollCount: 0]
     [Progress: ▓░░░░░░░░░ 0%]

     ## 自动完结指令（当所有商品状态变为 SUCCESS 或 FAILED 时执行）
     1. 调用 task_update 将任务状态设为 completed（成功）或 failed（失败），阻断后续残留消息
     2. 将 query_ggs_batch_optimize_result 返回的最终 JSON 保存为本地文件（如 optimize_result.json）
     3. 执行 python references/json_to_csv.py optimize_result.json <CsvPath>，将优化结果写回 CSV 的 after.* 列（禁止手写脚本）
     4. 重读 SKILL.md，获取最新的执行协议和强制动作要求
     5. 按 SKILL.md 规范决策并执行后续强制动作（查询 PIS、生成预览等）
     ⚠️ 禁止跳过步骤 4 的重读，禁止要求用户回复"查看结果"等引导词
     ```
   - **⚠️ 语言一致性要求**：Subject 和 Description 中面向用户可见的文案，**必须与用户当前对话使用的语言保持一致**（包括简体中文、繁体中文、英文等）。以上中文模板仅为语义参考，实际输出时必须翻译为用户的语言。技术元数据（如 `[TaskId]`、`[CsvPath]` 等）可保留英文。

2. **提交商品明细**：调用 `submit_ggs_batch_optimize_detail` 提交商品数据。

3. **启动首次轮询（直接创建，无需用户确认）**：提交商品明细后，**立即**使用 `cron` 工具创建一次性轮询任务，**必须设置 `deleteAfterRun: true`**，`sessionTarget: "main"`。**间隔按上方「轮询间隔规则」的间隔表设置。** 轮询逻辑完全由 `cron` 后台 Agent 执行，主对话 Agent 不参与轮询过程。**⚠️ 禁止向用户询问"是否创建定时任务"或要求用户说"继续轮询"等引导词，直接创建即可。**
   - **⚠️ 格式强制要求**：cron Payload 消息和 Task Description 在实际写入时，**必须严格保留模板中的换行和缩进格式**，禁止将多行内容压缩为单行。每个步骤、每个子项必须独占一行，确保后续 Agent 能逐行解析执行。
   - **cron Payload 消息**必须使用以下**固定模板**（禁止 Agent 自由发挥）：
     ```
     [后台轮询] 商品优化任务状态检查（第 <PollCount+1> 次）
     任务ID: <taskId>

     ## 执行步骤
     0. 【短路检查 - 最高优先级】先通过 task_read 读取本地 Task 的状态：
        - 若 Task 已是 completed 或 failed → 直接退出，不执行后续步骤（cron 已设置 deleteAfterRun，无需手动删除）
        - 若 Task 仍为 in_progress → 继续执行步骤 1
     1. 调用 query_ggs_batch_optimize_result（taskId=<taskId>, pageNo=1, pageSize=20）查询任务状态
     2. 根据返回的 data.status 执行对应操作：
        - PROCESSING（非终态）：
          a. 调用 task_update 更新任务描述中的 [Progress: ...] 和 [PollCount: ...] 行
          b. 创建新的一次性 cron（deleteAfterRun: true），inMs **直接复用 [CurrentInterval] 对应的毫秒值**（查「轮询间隔规则」表，不递增、不推算），Payload 使用本模板（PollCount 递增、CurrentInterval 保持不变）
          c. ⚠️ inMs 必须 ≥ 60000
        - COMPLETED / PARTIAL_FAILED（终态）：按任务描述中的「自动完结指令」顺序执行全部步骤
     ```
   - **⚠️ 语言适配**：cron Payload 消息中面向用户可见的文案（如标题、question 中的失败通知文案等），**必须翻译为用户当前对话使用的语言**。以上中文模板仅为语义参考，技术指令部分（如步骤编号、工具名称、参数名等）可保留英文。

4. **面板反馈**：后台 Agent 每次轮询后，调用 `task_update` 将最新进度（如 `[▓▓░░] 20%`）和轮询计数更新到任务描述中。禁止在静默期频繁向聊天框发送进度文本。

5. **自动完结**：当所有商品状态变为 `SUCCESS` 或 `FAILED` 时，后台 Agent 读取任务描述中的「自动完结指令」，按指令顺序执行。核心流程为：**设置 Task 完成**（最先执行，阻断残留消息） → **保存结果并写入 CSV** → **重读 `SKILL.md`** → **按规范继续执行后续强制动作**。

   > **⚠️ 无需手动删除 cron**：由于所有 cron 均设置了 `deleteAfterRun: true`，执行完毕后会自动删除，**无需手动调用 `cron list` + `cron remove`**。`task_update` 设置 Task 为 completed 后，即使存在残留的待执行 cron，短路检查（步骤 0）会检测到 Task 已完成并直接退出，不会产生重复操作。

6. **用户主动查询进度**：当用户在对话中询问优化任务的进度或结果（如"优化进度怎么样了"、"任务完成了吗"）时，Agent 应调用 `query_ggs_batch_optimize_result` 查询任务状态并返回给用户。若上下文中有 `taskId` 则直接使用；若上下文中无 `taskId`，应询问用户提供。查询到终态后，自动进入唤回处理流程（第 5 步）。

7. **非阻塞体验**：提交任务并创建后台轮询后，Agent 应向用户输出**友好的等待提示**，告知任务已在后台运行。
   - **⚠️ 友好文案要求**：面向用户的文案必须简洁温和，**禁止暴露技术细节**（如 `[BACKGROUND POLL]`、`accio-mcp-cli call`、`query_ggs_batch_optimize_result`、JSON 参数等）。
   - **推荐文案示例**（使用用户当前语言）：
     > "已为您提交优化任务（Task ID: [taskId]），后台正在处理中 ⏳ 您可以继续其他操作，进度将在顶部任务面板实时更新。完成后我会第一时间通知您。"
   - **⚠️ 语言适配**：以上仅为中文示例，实际输出时必须翻译为用户当前使用的语言（包括繁体中文、英文等）。
   - **⚠️ 禁止行为**：
     - 禁止要求用户说"继续轮询"、"查看结果"等引导词
     - 禁止在对话中输出定时任务的技术内容（如 cron 指令、MCP 调用命令等）
     - 禁止向用户暴露轮询间隔、重试次数等执行参数

8. **致命红线**：
   - **🚫 严禁同步轮询**：禁止在主对话中使用 `sleep`、`bash`、循环、定时器等任何方式同步阻塞等待任务结果
   - **🚫 严禁跳过 cron 后台轮询**：必须使用一次性 cron（`deleteAfterRun: true`）实现异步追踪
   - **🚫 严禁在任务未完成时提前处理结果**：必须等待状态变为终态
   - **🚫 严禁手写脚本处理 JSON 数据**：必须使用 `references/json_to_csv.py`
   - **🚫 严禁创建不设置 deleteAfterRun 的 cron**：所有轮询 cron 必须设置 `deleteAfterRun: true`，确保执行后自动销毁

---

### 批量优化调用流程

1. **创建主任务**：调用 `create_ggs_batch_optimize_main_task`，传入 `total`、`actions`、`userPrompt`，获取 `taskId`
2. **提交商品明细**：调用 `submit_ggs_batch_optimize_detail`，传入 `taskId` 和 `productInfo`（每批最多 50 个商品）
3. **轮询结果**：调用 `query_ggs_batch_optimize_result` 轮询查询结果，直到所有商品处理完成
4. **处理结果**：从 `data.records` 中提取 `after` 字段，写入本地 CSV 的 `after.*` 列

### 返回结果处理规则

Agent 客户端收到返回后，需要按以下流程处理：

1. **提取优化结果**：从 `data.records` 中每个商品的 `after` 字段提取优化后的值
2. **写入本地 CSV**：将 `after` 中非 null 的字段值直接写入本地 CSV 中间产物对应行的 `after.*` 列。后端已完成所有优化逻辑（包括格式转换、联动更新、价格类型保持等），Agent 无需做额外的本地处理
3. **AI_SUGGEST 特殊处理**：对于 AI_SUGGEST 策略返回的 Price（价格）、MOQ、Lead Time（交期）等数值类字段，返回的建议值代表**允许的最大值上限**。Agent 需要将商品当前值（`before.*`）与建议最大值进行比较：**只要当前值不超过该最大值，说明已满足条件，无需调整**（`after.*` 列保持为空）；仅当当前值超过建议最大值时，才需要将后端返回的 `after` 值写入 CSV
4. **更新 MD 预览文件并展示给用户**

---

## 3. apply_governance（已废弃）

> **⚠️ 本工具已废弃**。商品发布（新发 + 编辑）统一使用 `alibaba-global-product-publish` Skill 的 `publish_ggs_migration_product` 接口。
>
> - **新发模式**（`productId` 为空）：`before` 传 `null`，`after` 包含完整商品数据
> - **编辑模式**（`productId` 非空）：`before` 传优化前完整快照，`after` 传优化后快照（未优化字段设 `null`）
>
> 详见 `skills/alibaba-global-product-publish/references/tools-openapi.md`。

---

## 4. query_product_score（查询商品质量分）

基于优化后的商品快照数据计算商品的预期质量分（PIS）。每次优化商品后，Agent 需要逐个调用此接口查询每个商品的最新质量分。

> **⚠️ 反幻觉硬约束（HARD RULE）**：质量分数值**只能**来自本工具的真实返回值 `data.finalScore`。Agent **严禁**在未调用本工具的情况下，在对话、预览或 CSV 中给出任何具体的质量分数字（包括预估、推算、编造）。未调用前应告知用户"优化完成后我会为您查询最新的质量分"。

- **调用方式**：**MCP 工具调用**。Agent 直接调用 MCP 工具 `query_product_score`，传入下方参数即可，无需手动构造 HTTP 请求
- **超时**：600s（10min）

**⚠️ 重要：必须逐个调用**：`query_product_score` 工具**必须一个一个地调用**，每次只查询一个商品的质量分。**严禁批量调用或同时调用多个商品**，否则会导致工具调用直接失败。如果有多个商品需要查询质量分，请使用循环或顺序调用的方式，逐个处理每个商品。

**⚠️ Payload 复用规则**：调用 `query_product_score` 的 `description` / `title` / `keywords` / `images` / `properties` 等字段，**必须与同一商品最近一次 `apply_governance` 提交的 `after.*` 完全一致（字符级 byte-equal）**。推荐做法：把 `apply_governance` 请求中的 `after` 对象完整拷贝，在顶层补上 `productId` 和 `mcp-ali-id`，直接调用。**禁止**用重新生成或清洗后的版本替代原始 `after` 数据，也**禁止**漏传 `productId`（会导致返回 `null`）。

**错误示例**（批量调用，会失败）：
```
❌ 同时调用 query_product_score 查询 10 个商品的质量分
```

**正确示例**（逐个调用）：
```
✅ 对每个商品单独调用 query_product_score，等待返回后再处理下一个商品
```

### 请求参数

请求体为扁平化结构，包含以下字段：**字段定义与 `ProductSnapshotDTO` 一致**，详见上文「ProductSnapshotDTO 结构定义」章节。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `mcp-ali-id` | string | 是 | 商家的阿里 ID，**每一个接口都需要传** |
| `productId` | String | 是 | 商品 ID（字符串格式），如 `"1601653380590"` |
| `title` | String | 是 | 商品标题，完整的商品名称描述 |
| `price` | Object | 是 | 价格对象，结构见下文「`price` 对象结构」 |
| `leadTime` | Array | 是 | 阶梯交期数组，每项含 `quantity`（数量档，如 1、100）和 `leadTime`（交期天数，如 5、7）。按数量档升序排列 |
| `moq` | Integer | 是 | 最小起订量（Minimum Order Quantity），如 1、2、10 等 |
| `unitWeight` | Double | 是 | 单件毛重（千克），如 0.5、1.2 等 |
| `unitSize` | String | 是 | 单位尺寸，格式为 "长×宽×高"，如 `"10x10x10"` |
| `shippingTemplate` | Object | 是 | 物流模板对象，含 `id`（模板 ID，Long 类型）和 `name`（模板名称，String 类型） |
| `category` | Object | 是 | 类目对象，含 `categoryId`（类目 ID，Long 类型）和 `categoryPath`（类目路径，如 `"Apparel & Accessories > Men's Clothing > Men's T-Shirts"`） |
| `description` | String | 是 | 商品描述，支持 HTML 格式，如 `"<p>Product description</p>"` |
| `properties` | Array | 是 | 商品属性数组（CPV），每项含 `attributeId`（属性 ID）、`attributeName`（属性名称）、`attributeValue`（属性值）、`attributeValueId`（属性值 ID，可为 -1 表示自定义值） |
| `images` | Array | 是 | 商品图片 URL 数组，如 `["https://example.com/image1.jpg", "https://example.com/image2.jpg"]` |
| `pis` | Double | 是 | 当前质量分（Product Information Score），如 3.5、4.2 等 |
| `keywords` | String | 是 | 商品关键词，**必须为 JSON 数组格式的字符串**，如 `"[\"cotton\",\"shirt\",\"men\",\"casual\"]"`。禁止传纯文本 |
| `currencyCode` | String | 是 | 货币代码，如 `"USD"`、`"EUR"`、`"CNY"` |

### `price` 对象结构

```json
{
  "priceType": "sku",  // 枚举值：sku / ladder / tiered / range / fixed
  "currency": "USD",
  "skuPrices": [
    {"price": 0.9, "skuId": 107473546692, "skuName": "Xxs, Red"}
  ],
  "ladderPrices": [
    {"minQuantity": 1, "price": 9.50}
  ],
  "minPrice": 0.9,
  "maxPrice": 1.8,
  "fixedPrice": "1.5"
}
```

#### `price` 对象字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `priceType` | String | 是 | 价格类型枚举，可选值：`sku`（SKU 价格）、`ladder`（阶梯价）、`tiered`（分级价）、`range`（区间价）、`fixed`（固定价） |
| `currency` | String | 是 | 货币代码，如 `USD`、`EUR`、`CNY` 等 |
| `skuPrices` | Array | 条件必填 | SKU 价格数组，当 `priceType` 为 `sku` 时必须填写。每项包含 `price`（价格）、`skuId`（SKU ID）、`skuName`（SKU 名称） |
| `ladderPrices` | Array | 条件必填 | 阶梯价格数组，当 `priceType` 为 `ladder` 或 `tiered` 时必须填写。每项包含 `minQuantity`（最小数量）和 `price`（对应价格） |
| `minPrice` | Double | 条件必填 | 最低价格，当 `priceType` 为 `range` 时必须填写 |
| `maxPrice` | Double | 条件必填 | 最高价格，当 `priceType` 为 `range` 时必须填写 |
| `fixedPrice` | String | 条件必填 | 固定价格，当 `priceType` 为 `fixed` 时必须填写 |

**注意**：根据 `priceType` 的不同，只需填写对应的价格字段，其他价格字段可以留空或为 `null`。


### ⚠️ 重要：字段名和字段值要求

**字段名必须严格按照文档示例**：请求体中的字段名必须与上文表格中的字段名完全一致，**严禁随意修改字段名或使用错误的字段名**。例如：
- ✅ 正确：`title`、`price`、`leadTime`、`moq`、`unitWeight`、`unitSize`、`shippingTemplate`、`category`、`description`、`properties`、`images`、`pis`、`keywords`、`currencyCode`
- ❌ 错误：`productTitle`、`productPrice`、`lead_time`、`minOrderQuantity` 等

**字段值必须使用真实数据**：请求体中的字段值必须使用 CSV 中 `before` 或 `after` 列的**真实值**，**严禁伪造、编造或使用示例值**。例如：
- ✅ 正确：从 CSV 中读取 `after.title` 的实际值作为 `title` 字段值
- ❌ 错误：使用 `"Optimized Product Title"` 等示例值代替真实数据

### 请求体示例

```json
{
  "mcp-ali-id": "your-ali-id",
  "productId": "1601653380590",
  "title": "100% Cotton Anti-Wrinkle Casual Regular Fit Printed Shirt for Men",
  "price": {
    "priceType": "sku",
    "currency": "USD",
    "skuPrices": [
      {"price": 0.9, "skuId": 107473546692, "skuName": "Xxs, Red"},
      {"price": 1.8, "skuId": 107869507058, "skuName": "M, Lavender"},
      {"price": 1.8, "skuId": 107869507057, "skuName": "Xxs, Lavender"},
      {"price": 0.9, "skuId": 107869507056, "skuName": "M, Red"}
    ],
    "ladderPrices": [
      {"minQuantity": 1, "price": 9.50}
    ],
    "minPrice": 0.9,
    "maxPrice": 1.8,
    "fixedPrice": "1.5"
  },
  "leadTime": [
    {"quantity": 1, "leadTime": 5}, {"quantity": 100, "leadTime": 7}
  ],
  "moq": 2,
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
  "description": "Experience all-day comfort with our 100% Cotton Anti-Wrinkle Casual Regular Fit Printed Shirt. Perfect for everyday wear, this shirt combines a classic regular fit with a modern print. Made from premium cotton, it is durable, breathable, and easy to care for.",
  "properties": [
    {"attributeId": 191284187, "attributeName": "Gender", "attributeValue": "Men", "attributeValueId": -1},
    {"attributeId": 379279930, "attributeName": "Logo position", "attributeValue": "Front", "attributeValueId": 3946309},
    {"attributeId": 191284169, "attributeName": "Technics", "attributeValue": "Printed", "attributeValueId": 8665793},
    {"attributeId": 191284183, "attributeName": "Sleeve Style", "attributeValue": "Long Sleeve", "attributeValueId": 12373461},
    {"attributeId": 200000277, "attributeName": "Fit Type", "attributeValue": "Regular Fit", "attributeValueId": 18110138},
    {"attributeId": 251468744, "attributeName": "Weaving method", "attributeValue": "Woven", "attributeValueId": 3868949},
    {"attributeId": 210202057, "attributeName": "Fabric Type", "attributeValue": "Woven", "attributeValueId": 3868949},
    {"attributeId": 191284014, "attributeName": "Material", "attributeValue": "100% Cotton", "attributeValueId": 26389775},
    {"attributeId": 191288083, "attributeName": "Design", "attributeValue": "With Pattern", "attributeValueId": 1875812531},
    {"attributeId": 210192747, "attributeName": "Length", "attributeValue": "Regular", "attributeValueId": 4332633},
    {"attributeId": 200000329, "attributeName": "Pattern Type", "attributeValue": "Print", "attributeValueId": 7336907},
    {"attributeId": 210192633, "attributeName": "Style", "attributeValue": "Casual", "attributeValueId": 4183079},
    {"attributeId": 100002013, "attributeName": "Feature", "attributeValue": "Anti-Wrinkle", "attributeValueId": 3377077},
    {"attributeId": 230797472, "attributeName": "7 days sample order lead time", "attributeValue": "Support", "attributeValueId": 6212099},
    {"attributeId": 210196193, "attributeName": "Fabric Weight", "attributeValue": "230 grams", "attributeValueId": 1982807684},
    {"attributeId": 345770527, "attributeName": "Needle detection", "attributeValue": "No", "attributeValueId": 3262824},
    {"attributeId": 1, "attributeName": "Place of Origin", "attributeValue": "AD", "attributeValueId": -1},
    {"attributeId": 100002053, "attributeName": "Collar", "attributeValue": "Polo Neck", "attributeValueId": -1},
    {"attributeId": 100007858, "attributeName": "Printing Methods", "attributeValue": "Printed", "attributeValueId": -1}
  ],
  "images": ["https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J.png"],
  "pis": 3.5,
  "keywords": "[\"cotton\",\"shirt\",\"men\",\"casual\",\"printed\",\"anti-wrinkle\"]",
  "currencyCode": "USD"
}
```

### 成功响应

```json
{
  "success": true,
  "data": {
    "pis": 5.2,
    "scoreDetails": {
      "titleScore": 0.8,
      "imageScore": 0.7,
      "priceScore": 0.9
    }
  }
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.pis` | Double | 商品最终质量分（Product Information Score） |
| `data.scoreDetails` | Map<String, Object> | 商品存在的问题项枚举，**true 代表存在此项问题**。各枚举含义如下： |

### `scoreDetails` 枚举说明

`scoreDetails` 是一个 Map 结构，**值为 `true` 表示存在此项问题**，值为 `false` 或不存在表示该项正常。

> **⚠️ 完整的扣分项枚举含义、A/B/C 分类、对应 actions 字段及修复路径，请查阅 `product-score-rules.md` 中的「scoreDetails 扣分项枚举说明」章节。** 本处仅列出枚举键速查表。

| 枚举键 | 简要含义 |
|--------|---------|
| `category` | 类目不一致 |
| `imageText` | 图文不一致 |
| `name_capitalize_first_letter` | 标题首字母大写检测 |
| `image_num` | 图片数目检测 |
| `imageSubTitle` | 图片和副标题检测 |
| `imageQualityBad` | 图片质量不佳 |
| `image_scale` | 图片尺寸得分 |
| `title_repeat` | 标题信息堆砌 |
| `title_spell` | 标题拼写错误 |
| `title_bad` | 标题含不当信息 |
| `title_word_miss_core_error` | 标题缺少核心词 |
| `selling_point_attribute_conflict` | 卖点和属性冲突 |
| `attribute_less_or_repeat` | 属性未填完整或重复 |
| `price` | 价格检测得分 |
| `freightRate` | 运费占比检测得分 |
| `inventory` | 库存需大于 MOQ |
| `moq_incomplete` | MOQ 信息不完整 |
| `logistics_incomplete` | 物流信息不完整 |
| `sku_text` | SKU 文本检测得分 |
| `sku_image` | SKU 图片检测得分 |
| `trend_product` | 是否趋势品 |
| `range_price` | 信息确定性-区间价 |
| `shipping_cal` | 信息确定性-物流可计算 |
| `core_country_freight_calculable` | 核心国家运费不可计算 |
| `lead_time_exist` | 信息确定性-交期 |
| `moq_price_ability` | 价格力-MOQ |
| `weight_volume_ration` | 信息确定性-重量体积比 |
| `shipping_fee_weight` | 价格力-运费重量检测 |
| `price_ability` | 价格力-价格 |
| `lead_time` | 服务力-交期 |
| `keyword_length` | 关键词长度不足 |
| `keyword_core_less` | 关键词缺少核心词 |
| `keyword_repeat` | 关键词重复 |
| `keyword_bad` | 关键词含不当信息 |
| `keyword_name_impact` | 关键词与标题冲突 |
| `detail_bad` | 详情描述质量不佳 |
| `main_video_bad` | 主图视频质量不佳 |
| `payment_method` | 支付方式不完整 |
| `core_country_arrival_guarantee` | 核心国家未配置到货保障 |
| `anything_core_country_delivery_by` | 任意核心国家未配置到货保障 |
| `product_certification` | 服务力-品证 |
| `free_samples` | 服务力-拿样 |
| `light_customization` | 定制力 |

### 使用场景

每次优化商品后（Step 2 完成后），Agent 需要：
1. 对每个被优化的商品，基于 CSV 中 `after.*` 列的值构造 `ProductSnapshotDTO`，连同 `productId` 一起传入，逐个调用此 MCP 工具
2. 从返回的 `data.finalScore` 获取优化后的预期质量分
3. 将质量分写入 CSV 的 `after.pis` 列，并在 MD 预览文件中展示
