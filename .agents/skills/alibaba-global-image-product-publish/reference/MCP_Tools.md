# GGS Agent MCP 工具说明文档

> **通用调用约定**：
> - 所有工具均通过 **MCP 工具调用** 方式执行，Agent 直接调用对应工具名并传入参数即可。
> - **`aliId` 无需 Agent 显式声明**，Agent 框架会根据当前登录态自动注入，下文各工具的入参表中均已省略该字段。
> - 若某工具返回 `success=false`，请优先读取 `errorCode` / `errorMsg` 并终止后续依赖步骤。

## 工具总览

| 序号 | toolCode | 功能名称 | 适用场景 |
| --- | --- | --- | --- |
| 1 | `ggs_migration_pre_check` | 发品基础信息预检 | 校验图片银行/草稿箱容量 |
| 2 | `ggs_image_predict_category` | 图片预测类目 | 利用图片预测可发布的叶子类目 |
| 3 | `ggs_category_query` | 类目查询匹配 | 按关键词检索候选类目 |
| 4 | `ggs_image_quality_check` | 图片质量检测 | 校验图片质量问题 |
| 5 | `ggs_ai_assistant_ability_check_point` | 商业化点数校验 | 校验生意助手指定能力项点数余额 |
| 6 | `ggs_image_post_task_start` | 开启图片发品AI生成任务 | 基于图片+类目异步发起AI预测商品信息的任务 |
| 7 | `ggs_image_post_task_result` | 获取图片发品AI生成结果 | 轮询获取AI生成的商品信息结果 |
| 8 | `ggs_XDataLogger_log` | 打点工具 | GGS接口关键动作埋点记录 |

---

## 1. `ggs_migration_pre_check` — 发品基础信息预检

**功能**：检查当前商家图片银行/草稿箱剩余数量。

### 入参

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `productCount` | Integer | 是 | 本次预计发布的商品数量 |

### 出参 `Result<MigrationPreCheckResult>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | boolean | 调用是否成功 |
| `errorCode` | String | 失败错误码（成功为 null） |
| `errorMsg` | String | 失败错误消息（成功为 null） |
| `data.checkResult` | Boolean | 预检是否通过（**仅供参考**，不作为阻断依据） |
| `data.errorCode` | List&lt;String&gt; | 失败原因码列表，可能取值：`PHOTO_BANK_LIMIT`（图片银行不足）、`DRAFT_NUM_LIMIT`（草稿箱不足）、`MCP_RUNNING_TASK_LIMIT`（MCP 并发任务超限）、`SYSTEM_ERROR`（系统异常） |
| `data.data.imageSize` | Long | 本次预估图片大小（字节） |
| `data.data.photoBankRemain` | Long | 图片银行剩余可用数量 |
| `data.data.draftRemain` | Integer | 草稿箱剩余可用数量 |

### Agent 使用建议

- **仅关心 `data.errorCode` 中是否包含 `PHOTO_BANK_LIMIT` 或 `DRAFT_NUM_LIMIT`**，命中任一个则阻断流程并告知用户对应容量不足项。
- **其他错误码（如 `MCP_RUNNING_TASK_LIMIT`、`SYSTEM_ERROR`）一律忽略**，不需告知用户，直接进入后续步骤。
- 工具调用本身 `success=false` 时也视为预检不可用，**继续流程不阻断**。

---

## 2. `ggs_image_predict_category` — 图片预测类目

**功能**：根据商品主图 URL 预测可发布的叶子类目。

### 入参

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `imageUrl` | String | 是 | 商品主图URL |

### 出参 `TopResultDO<List<CategoryDTO>>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | Boolean | 调用是否成功 |
| `message` | String | 提示信息 |
| `msgCode` | String | 消息码 |
| `traceId` | String | 链路追踪 ID（排障用） |
| `data[].cateId` | Long | 类目 ID |
| `data[].cateLevel` | Integer | 类目层级 |
| `data[].catePath` | String | 类目路径（根到叶子，用于展示） |

### Agent 使用建议

- `data` 为空时改用工具 `ggs_category_query` 关键词检索兜底。
- 返回 >1 个候选时，展示 `catePath` 让用户挑选 `cateId` 后再进入后续步骤。

---

## 3. `ggs_category_query` — 类目查询匹配

**功能**：按关键词（商品名、品类词等）检索候选叶子类目。

### 入参

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `keyword` | String | 是 | 搜索关键词 |

### 出参

同工具 `ggs_image_predict_category` 的 `TopResultDO<List<CategoryDTO>>`，字段含义一致。


---

## 4. `ggs_image_quality_check` — 图片质量检测

**功能**：调用质量分主图检测服务，判断主图是否存在质量问题。

### 入参

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `imageUrl` | String | 是 | 待检测图片 URL，不能为空 |

### 出参 `ResultModel<ImageQualityCheckDTO>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | Boolean | 调用是否成功 |
| `errorCode` | String | 错误码 |
| `errorMsg` | String | 错误消息 |
| `data.pass` | Boolean | 质量是否通过（true=通过，false=未通过） |
| `data.problemDescriptions` | List&lt;String&gt; | 未通过时的多语言问题描述 |

---

## 5. `ggs_ai_assistant_ability_check_point` — 商业化点数校验

**功能**：校验用户在指定 AI 能力下的点数是否充足（预检，不扣费）。

### 入参

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ability` | String | 是 | 场景能力码 |
| `number` | Integer | 是 | 本次预计调用次数|

### 出参 `ResultModel<Boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | Boolean | 调用是否成功 |
| `errorCode` | String | 错误码 |
| `errorMsg` | String | 错误消息 |
| `data` | Boolean | 点数是否充足（true=充足，false=不足） |

### Agent 使用建议

- `ability` 在本场景(GGS图片发品)中固定为 `ggsAiCopilotImageOptimization`，不要替换。
- `number` 在本场景(GGS图片发品)中，根据预计需要发布的品数传对应的数字，默认传1
- 在本场景(GGS图片发品)中，如果`data=false`则调用`ggs_image_post_task_start`工具时`enableImageOptimization=false`

---

## 6. `ggs_image_post_task_start` — 开启图片发品AI生成任务

**功能**：基于图片+类目创建AI发品任务，**异步** 触发标题、关键词、属性、等AI预测信息的子任务生成。

### 入参

工具只有 **一个** 入参对象 `request`（类型 `AiLoadingCreateRequest`），调用时需按嵌套结构传入。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `request` | AiLoadingCreateRequest | 是 | 请求对象，字段见下 |

#### `AiLoadingCreateRequest`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `imageUrls` | List&lt;String&gt; | 是 | 商品图片URL列表 |
| `cateId` | Long | 是 | 类目ID |
| `productWords` | String | 否 | 商品文案/补充描述，辅助AI生成 |
| `enableImageOptimization` | Boolean | 否 | 是否开启图片优化节点|

### 出参 `AiLoadingCreateResultDTO`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `taskId` | String | 任务 ID，需保存用于工具 `ggs_image_post_task_result` 查询 |

### Agent 使用建议

- 调用成功立即返回 `taskId`，任务后台异步执行。
- 告知用户"任务已创建"后，按 10~30s 间隔轮询工具 `ggs_image_post_task_result`。

---

## 7. `ggs_image_post_task_result` — 获取图片发品 AI 生成结果

**功能**：轮询获取工具 `ggs_image_post_task_start` 产出的 AI 发品结果
**注意**：**轮询不超过30次**;**轮询不超过30次**;**轮询不超过30次**

### 入参

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `taskId` | String | 是 | 工具 `ggs_image_post_task_start` 返回的 `taskId` |

### 出参 `ResultModel<ImagePostingResultDTO>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | Boolean | 调用是否成功 |
| `errorCode` | String | 错误码 |
| `errorMsg` | String | 错误消息 |
| `data.finished` | Boolean | 任务是否已执行完成，`false` 表示仍在执行 |
| `data.postingResult` | ProductSandboxRecordDTO | 发品结果（完成后有值） |

#### `ProductSandboxRecordDTO`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `productId` | String | 商品 ID |
| `generalProductId` | String | 搬品任务商品 ID |
| `absSummImageUrl` | String | 主图缩略图 URL |
| `isExcluded` | Boolean | 是否被排除（`false`=命中圈品条件纳入处理） |
| `isPotentialCompetitive` | Boolean | 是否潜在竞争力品（存量品有运营簇 或 新发品能图搜定招主题） |
| `status` | String | 执行状态：`PENDING` / `SUCCESS` / `FAILED` |
| `reason` | String | 失败原因（`status=FAILED` 时） |
| `originUrl` | String | 商品原始来源 |
| `before` | ProductSnapshotDTO | 商品快照(优化前) |
| `after` | ProductSnapshotDTO | 商品快照(优化后) |

#### `ProductSnapshotDTO`（`before` / `after`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `productId` | String | 商品 ID |
| `title` | String | 商品标题 |
| `price` | ProductPriceDTO | 商品价格（阶梯 / 区间 / SKU / 固定价） |
| `leadTime` | List&lt;QuantityTieredLeadTime&gt; | 阶梯交期（单位：天） |
| `moq` | Integer | 最小起订量 |
| `unitWeight` | Double | 单件毛重（千克） |
| `unitSize` | String | 包装尺寸（长 X 宽 X 高） |
| `shippingTemplate` | ShippingTemplateDTO | 物流模板（ID + 名称） |
| `category` | CategoryDTO | 类目信息（cateId + catePath） |
| `description` | String | 商品描述（PC / 无线端描述 JSON） |
| `properties` | List&lt;GlobalProductAttribute&gt; | 商品属性 |
| `images` | List&lt;String&gt; | 商品图片列表 |
| `inventory` | String | 库存信息（JSON：发货地 → 可售数量） |
| `pis` | Double | 商品质量分（PIS / 竞争力分） |
| `keywords` | String | 关键词 |
| `currencyCode` | String | 币种 |
| `hsCodeList` | List&lt;HsCodeItem&gt; | HS 编码列表 |

### Agent 使用建议

- `finished=false` 不视为失败，继续轮询；超过约定次数后贴出 `taskId` 让用户后续手动追查。
- `status=SUCCESS` → 使用 `after` 展示最终发品字段。
- `status=FAILED` → 读取 `reason` 告知失败原因。

---


## 8. `ggs_XDataLogger_log` — 打点工具

**功能**：GGS 关键业务动作埋点记录器。

**使用时机**：发品（成功/失败、正式/草稿均算）、商品优化、图片优化等动作结束后立即调用，**每个 productId 调一次**。

### 入参

| 字段 | 类型 | 必填 | 说明                                                                                         |
| --- | --- | --- |--------------------------------------------------------------------------------------------|
| `action` | String | ✅ | 动作枚举，发品固定用 `AccioWorkGgsPublishProduct`                                                    |
| `params` | Object | 否 | 只含一个 key `requestInfo`，值为 JSON 字符串，包含 `publishMode` / `publishAsDraft` / `categoryId` / `productId` 等 |
| `result` | Object | 否 | 结果摘要，至少含 `success: boolean`；失败时附 `errorCode` / `errorMsg`                                  |

### 出参

返回 `boolean`：`true` = 写入成功；失败也不影响主业务。

### 示例

```json
{
  "action": "AccioWorkGgsPublishProduct",
  "params": {
    "requestInfo": "{\"publishMode\":\"imagePublish\",\"publishAsDraft\":true,\"categoryId\":3280501,\"productId\":\"1601784681015\"}"
  },
  "result": {"success": true, "itemId": "1601784681015"}
}
```

### 约束

- N 个 productId = N 次调用，禁止合并。
- 主业务完成后再打点，不要中途调用。
- 返回 `false` 不要重试。
- 禁止传完整商品 JSON、HTML 详情、买家联系方式等大对象 / 敏感数据。