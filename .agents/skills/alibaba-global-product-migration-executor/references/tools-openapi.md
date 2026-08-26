# 搬品执行 MCP 工具参考

本文件定义了搬品任务执行阶段所需的 MCP 工具参数格式。

---

## 1. get_oss_pre_upload_url

获取 OSS 直传预签名 URL，用于文件上传。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fileName` | string | 是 | 要上传的文件名（含扩展名，如 `products.xlsx`） |

**返回值：** 预签名 URL（string），Agent 使用该 URL 将文件 PUT 上传至 OSS。

---

## 2. start_ggs_product_migration

触发搬品任务，进行数据拉取和商品信息解析。**异步接口**，返回 taskId 后需轮询。

> **⚠️ 关键接口**：此接口若调用失败，必须**立即中断流程**，将完整错误信息展示给用户，不做任何降级或替代处理。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `productFrom` | string | 是 | 数据来源类型枚举：`SMART_FILE`（云端解析文件，所有 Excel/CSV/PDF 均走此模式）/ `FILE`（本地兜底模式：仅在云端解析失败时降级使用，Agent 本地浏览器抓取 URL 数据后组装 JSON 上传）/ `PDP`（商品详情 URL，云端解析）/ `STORE`（店铺 URL，云端解析）/ `API`（Shopify API 拉取） |
| `urls` | array\<string\> | 条件必填 | 商品/店铺 URL 列表（`productFrom` 为 `PDP` 或 `STORE` 时必传，仅支持 1688 和 Amazon 的 URL） |
| `fileName` | string | 条件必填 | **必须传 OSS 相对路径**（不含域名前缀），`productFrom` 为 `SMART_FILE`、`FILE` 或 `API` 时必传。该路径从 `get_oss_pre_upload_url` 返回的预签名 URL 中提取（去掉域名和查询参数）。✅ 正确：`migrate/2024/ggs_migration_1713456789.json`。❌ 错误：`ggs_migration_1713456789.json`（自定义短文件名）、`https://oss.xxx.com/migrate/2024/file.json?sign=xxx`（完整 URL） |
| `originSite` | string | 否 | 当 `productFrom` 为 `API` (Shopify API 搬品) 时，`originSite` 参数固定传 `SHOPIFY`；其他模式下不传该参数。 |
| `currency` | string | 是（用户确认后传入） | 原始数据币种，**ISO 4217 三位大写字母**（如 `USD`、`CNY`、`EUR`）。必须在入口 Skill 中由 Agent 快速推断后经用户确认，确认后传入此参数。**若未传则后端默认 `USD`，可能导致价格数据错误** |
| `language` | string | 否 | 目标语言代码（默认 `en`） |
| `logisticsTemplateId` | number | 否 | 物流模板 ID |

**返回值示例：**
```json
{
   "success": true,
   "data": {
      "taskId": 123456
   }
}
```

---

## 3. query_ggs_migration_task_status

查询搬品任务状态。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `taskId` | number | 是 | 搬品任务 ID（由 `start_ggs_product_migration` 返回） |

**返回值说明：**

返回结构（关键字段位于 `data.data` 内）：

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.data.taskStatus` | string | 任务状态枚举，见下方 |
| `data.data.migrationTaskId` | number | 搬品任务 ID |
| `data.data.totalProductCount` | number\|null | 商品总数（任务初期可能为 `null`） |
| `data.data.successPulledCount` | number | 已成功拉取的商品数（用于计算进度） |
| `data.data.failReason` | string\|null | 失败原因（仅 `FAILED` 时有值） |

**`taskStatus` 枚举：**
- 处理中（继续轮询）：`PRE_DATA` / `PRE_DATA_SUCCESS` / `AGGREGATE_DATA`
- 成功终态（停止轮询，进入完结流程）：`AGGREGATE_SUCCESS` / `SUCCESS`
- 失败终态（停止轮询，提取 `failReason` 告知用户）：`FAILED`

---

### 轮询与追踪协议

> 本接口的完整调用协议（任务创建、cron 后台轮询、面板反馈、自动完结、致命红线）见 👉 **[`migration-task-tracking-protocol.md`](./migration-task-tracking-protocol.md)**。Agent 在执行任何追踪逻辑前必须 `read_file` 完整读取该文件。

---

## 4. page_query_migration_task_info_product_info

分页查询搬品任务下的商品详情。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `taskId` | number | 是 | 搬品任务 ID |
| `pageNo` | number | 是 | 页码（从 1 开始） |
| `pageSize` | number | 是 | 每页条数（建议 50，最大 50） |

**返回值说明：**

返回 `data` 中包含商品列表，每个商品包含解析出的字段：
- `productId`：商品 ID
- `generalProductId`：通用商品 ID
- `absSummImageUrl`：商品主图 URL
- `title`：商品标题
- `price`：价格对象（含 `priceType`、`currency`、`skuPrices` 等）
- `description`：商品描述
- `images`：图片列表
- `properties`：商品属性
- `moq`：最小起订量
- `leadTime`：交期
- `unitWeight`：单位重量
- `category`：类目信息
- 等其他字段

分页信息通过 `totalCount` / `totalPage` 等字段获取。

**⚠️ 空结果强制终止约束：**

当商品解析任务已结束（状态为完成/失败）且首页查询（`pageNo=1`）返回的商品列表为空（`totalCount = 0` 或 `data` 列表为空）时，Agent **必须立即终止搬品流程**，不得继续后续步骤，并向用户输出以下提示：

> ❌ **搬品解析无结果**
> 商品解析任务已完成，但未解析到任何有效商品数据。
>
> 可能的原因：
> - 提供的链接/文件中无有效商品信息
> - 目标平台页面结构变更或反爬限制导致解析失败
> - 文件格式不符合要求或内容为空
>
> 🔧 **您可以选择：**
> - **「重新提交」** → 请提供新的商品链接或文件，重新发起搬品
> - **「换个方案」** → 尝试使用其他搬品方式（如从文件搬品改为链接搬品，或反之）
> - **「结束搬品」** → 取消本次操作

---

## 通用说明

- 所有工具通过 **MCP 方式调用**，无需构造 HTTP 请求
- `mcp-ali-id` header 由 MCP 框架自动注入，Agent 无需手动传递
- 长耗时工具（`start_ggs_product_migration`）超时建议设为 120s
- 查询类工具超时保持默认 30s 即可

---

> **商品优化说明**：商品优化的意图理解和执行逻辑**完全交由 `alibaba-global-product-optimize` Skill 承接**，本 Skill 不直接调用优化 MCP 工具。优化相关的工具参数定义请参阅 alibaba-global-product-optimize Skill 的 `references/tools-openapi.md`。
