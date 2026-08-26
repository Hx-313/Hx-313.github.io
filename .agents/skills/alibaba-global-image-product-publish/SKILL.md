---
name: alibaba-global-image-product-publish
version: 2.0.0
description: |
  支持海外商家通过上传图片的方式发布商品到 Alibaba.com 国际站（ICBU）。支持单品及多品并行发布。

  触发场景：
    - 用户上传1张或多张图片，并附带"发品"、"上架"、"发布商品"、"listing"、"post product"、"publish"等语义
    - 用户明确表示"帮我用这张图发品"、"图片发品"、"用图片上架商品"
    - 用户上传图片后说"开始"、"继续"、"发"等确认词
    - 用户说"我要发 ICBU"、"发国际站"并附带图片

  重要特性：
    - 包含多品识别、预检、类目预测、图片质检与优化、AI商品信息生成、CSV导出、预览与发布完整流程
    - 预览/编辑参考 alibaba-global-product-optimize skill 文档执行
    - 商品发布通过 alibaba-global-product-publish skill 执行
    - 支持多品并行处理，所有商品统一写入同一个 CSV 文件
    - **商品信息不全推荐存草稿**

workflow: |
  1. 识别触发条件（图片+发品意图）
  2. AI 视觉识别多品分组 → 展示分组结果 → 用户确认
  3. 调用 ggs_migration_pre_check 执行基础信息预检（productCount=确认后的商品数量）
  4. 类目预测 → 用户确认类目
  5. 图片质检 → 点数校验 → 用户决策是否优化 → 启动 AI 生成任务
  6. 轮询获取结果 → CSV 初始化 → 预览(仅展示before即可) → 编辑/优化 → 二次确认发布方式 → 发布 → 埋点

enabled: true
---

# ICBU 国际站图片发品

在 Alibaba.com 国际站（ICBU）通过图片发布商品，专为海外商家设计。支持单品及多品并行发布。

## 核心原则

- ⛔ 流程严格按步骤顺序执行（多品识别→预检→类目确认→质检启动→获取结果发布），禁止跳步
- ⛔ 商品编辑/预览：参考 `alibaba-global-product-optimize` skill 文档自行执行（共享同一份 CSV）
- ⛔ 商品发布：通过 `alibaba-global-product-publish` skill 执行，禁止直接调用底层 MCP 工具
- ⛔ 所有商品统一写入同一个 CSV 文件，每行一个商品
- ⛔ 任何工具调用失败必须向用户反馈具体原因，不得静默跳过
- ⛔ 用户可随时取消流程，Agent 应立即终止并确认

## 流程概览

```
多品识别 → 预检 → 类目确认 → 图片质检+任务启动 → 获取结果+预览+发布
```

---

## 步骤一：多品识别

AI 利用自身视觉理解能力判断用户上传的多张图片是否属于同一产品：

- **单品**：所有图片属于同一产品，按单品继续。
- **多品**：将图片按产品分组（如：产品A→图1、图2；产品B→图3）。

**多品分组后必须展示结果并等待用户确认**：

- 向用户清晰展示每个分组（产品名+对应图片）
- 用户可调整分组（重新分配图片归属）
- 用户确认后，进入步骤二

---

## 步骤二：预检

调用 `ggs_migration_pre_check` 进行发品基础信息预检（`productCount` = 步骤一确认后的商品数量）。

**本 skill 仅关心"图片银行容量"与"草稿箱容量"两类校验项**，其他错误码（如并发任务数限制）一律忽略，不阻断主流程。

判定规则（仅看 `data.errorCode` 列表中是否包含以下两个错误码）：

| 错误码                | 含义           | 本 skill 行为                                                |
|--------------------|--------------|----------------------------------------------------------|
| `PHOTO_BANK_LIMIT` | 图片银行剩余容量不足   | **阻断**，告知用户「图片银行容量不足」并终止流程                                |
| `DRAFT_NUM_LIMIT`  | 草稿箱剩余数量不足    | **阻断**，告知用户「草稿箱数量不足」并终止流程                                 |
| 其他任意错误码（含 `MCP_RUNNING_TASK_LIMIT`、`SYSTEM_ERROR` 等） | 与图片/草稿箱无关或瞬时异常 | **忽略**，继续进入步骤三                       |

判定逻辑：

1. 工具调用本身失败（`success=false`）→ 视为预检不可用，**忽略并继续**步骤三（不阻断）。
2. `data.errorCode` 为空或不包含上述两个关键错误码 → 进入步骤三。
3. `data.errorCode` 包含 `PHOTO_BANK_LIMIT` 或 `DRAFT_NUM_LIMIT` → 终止流程，向用户反馈对应不足项；可附带 `data.data.photoBankRemain` / `data.data.draftRemain` 数值帮助用户理解。

> ⚠️ 注意：**不要直接以 `data.checkResult=false` 作为阻断依据**，必须进一步检查 `data.errorCode` 是否命中图片银行/草稿箱错误码。任务并发数限制由其它链路统一管控，本 skill 不参与。

---

## 步骤三：类目确认

### 3.1 类目预测

对每个产品分别调用 `ggs_image_predict_category`（传入该产品主图 URL）。

- 返回至多 **Top 3** 类目（含 `cateId` + `catePath`）。
- **返回为空时**：自动调用 `ggs_category_query`（以产品关键词为 keyword）兜底检索。

### 3.2 用户确认类目

向用户展示每个产品的候选类目，支持多品一次性确认。

**分支 A：用户从候选中选择** → 记录 `cateId`。

**分支 B：用户手动输入关键词搜索**

- 调用 `ggs_category_query` 传入用户关键词，返回至多 Top 10 类目。
- 展示结果供用户选择。
- **搜索结果为空**：提示用户换关键词重试。

> 所有产品类目确认完成后，自动进入步骤四。

---

## 步骤四：图片质检与发品任务启动

本流程支持单品和多品任务处理，但是多品任务不支持并行处理，需逐个启动，每个品任务启动间隔至少20秒。

### 4.1 图片质量检测

针对每个产品调用 `ggs_image_quality_check`（传入主图 URL）。

- **调用失败**：按"主图无问题"分支继续（不优化），不阻塞主流程。
- **`data.pass=true`（主图无问题）**：`enableImageOptimization=false`，直接进入 4.3。
- **`data.pass=false`（主图有问题）**：进入 4.2 点数校验。

### 4.2 商业化点数校验（仅主图有问题时）

调用 `ggs_ai_assistant_ability_check_point`：

- `ability` 固定为 `ggsAiCopilotImageOptimization`
- `number` = 当前需要优化的产品数量

**`data=false`**：`enableImageOptimization=false`，直接进入 4.3。

**`data=true`**：询问用户是否优化主图：

1. **优化主图后发品** → `enableImageOptimization=true`
2. **不优化直接发品** → `enableImageOptimization=false`

### 4.3 启动 AI 生成任务

对每个产品调用 `ggs_image_post_task_start`，传入：

- `imageUrls`：该产品的图片列表
- `cateId`：用户确认的类目 ID
- `enableImageOptimization`：根据上述逻辑决定
- `productWords`（可选）：用户提供的补充描述

> 任务启动成功后（获得 `taskId`），自动进入步骤五。

---

## 步骤五：商品信息获取与预览发布

### 5.1 轮询获取生成结果

调用 `ggs_image_post_task_result`（传入 `taskId`）轮询：

| 约束                                 | 值                    |
|------------------------------------|----------------------|
| 轮询间隔                               | 10~30 秒              |
| 最大轮询次数                             | **30 次**             |
| `finished=false`                   | 继续轮询，非失败             |
| `finished=true` + `status=SUCCESS` | 获取结果，进入 5.2          |
| `finished=true` + `status=FAILED`  | 读取 `reason` 告知用户失败原因 |

**超时处理（轮询超过 30 次仍 `finished=false`）**：

- 告知用户"任务超时未完成"
- 询问用户是否重新发起任务（回到步骤四重新启动）

> **结果完整性约束**：`ggs_image_post_task_result` 返回的所有字段必须**完整、原样**地用于后续发布流程（写入 CSV 及最终发布），禁止丢失或擅自篡改任何返回值。若用户明确要求优化或修改某些字段，则以用户确认后的修改结果为准。
> **结果完整性约束**：`ggs_image_post_task_result` 返回的所有字段必须**完整、原样**地用于后续发布流程（写入 CSV 及最终发布），禁止丢失或擅自篡改任何返回值。若用户明确要求优化或修改某些字段，则以用户确认后的修改结果为准。
> **结果完整性约束**：`ggs_image_post_task_result` 返回的所有字段必须**完整、原样**地用于后续发布流程（写入 CSV 及最终发布），禁止丢失或擅自篡改任何返回值。若用户明确要求优化或修改某些字段，则以用户确认后的修改结果为准。
> **⚠️反幻觉硬约束**：如果未成功获取到 `ggs_image_post_task_result` 的任务结果（包括任务超时、任务失败、轮询中断等任何场景），**严禁捣造、推测或虚构任何商品信息**（包括但不限于标题、描述、价格、属性、关键词等）。正确做法：明确告知用户“未获取到任务结果”，询问是否重新发起任务，不得继续后续写入 CSV 或发布流程。
> **⚠️反幻觉硬约束**：如果未成功获取到 `ggs_image_post_task_result` 的任务结果（包括任务超时、任务失败、轮询中断等任何场景），**严禁捣造、推测或虚构任何商品信息**（包括但不限于标题、描述、价格、属性、关键词等）。正确做法：明确告知用户“未获取到任务结果”，询问是否重新发起任务，不得继续后续写入 CSV 或发布流程。
> **⚠️反幻觉硬约束**：如果未成功获取到 `ggs_image_post_task_result` 的任务结果（包括任务超时、任务失败、轮询中断等任何场景），**严禁捣造、推测或虚构任何商品信息**（包括但不限于标题、描述、价格、属性、关键词等）。正确做法：明确告知用户“未获取到任务结果”，询问是否重新发起任务，不得继续后续写入 CSV 或发布流程。

### 5.2 本地 CSV 初始化

在本地工作目录创建 CSV（如 `result/products_info.csv`），**所有商品写入同一个文件，每行一个商品**。

- 字段映射：返回 JSON 中所有非空字段映射到 `before.*` 列
- `after.*` 列全部为空（初始化时不填充）
- JSON 中为空的字段，CSV 对应列也保持为空
- CSV 格式规范参见 `alibaba-global-product-optimize` skill 的 `csv-schema.md`

### 5.3 结果预览展示

参考 `alibaba-global-product-optimize` skill 的 `optimize-preview-html.md` 执行预览。

**特殊规则**：发品首次预览**只展示 `before` 视图**（因为此时 `after.*` 列为空，无对比内容）。

### 5.4 用户选择后续操作

**分支 A：编辑商品信息**

- 用户提出修改/优化需求 → 参考 `alibaba-global-product-optimize` skill 文档执行
- 该 skill 会自动处理 before/after 对比预览
- 编辑完成后回到本步骤等待用户下一步指令

**分支 B：确认发布**

- **必须二次确认发布方式**：
    1. 存为草稿（稍后在后台编辑发布）
    2. 直接发布（立即上架）
- 多品时支持为不同商品分别指定方式

### 5.5 执行发布

调用 `alibaba-global-product-publish` skill 执行发布（支持多品批量）。

- 无论草稿还是直接发布，均通过该 skill 完成
- 发布结果展示、编辑链接、引导文案遵循该 skill 定义

### 5.6 埋点记录（静默执行，不向用户暴露）

发布/存草稿完成后，Agent 默认调用 `ggs_XDataLogger_log` 记录埋点，无需告知用户或等待用户确认。

| 参数                   | 值                            | 说明                                                           |
|----------------------|------------------------------|--------------------------------------------------------------|
| `action`             | `AccioWorkGgsPublishProduct` | 固定值                                                          |
| `params.requestInfo` | JSON 字符串                     | 包含 `publishMode`/`publishAsDraft`/`categoryId`/`productId` 等 |
| `result.success`     | true/false                   | 发布是否成功                                                       |
| `result.errorCode`   | 错误码                          | 失败时附带                                                        |
| `result.itemId`      | 商品id/草稿品id                   | 成功时附带                                                        |

**约束**：

- 每个 productId 单独调用一次，禁止合并
- 成功和失败都必须埋点
- 主业务完成后再打点
- 埋点失败不影响主流程，不向用户报错
- 图片发品限定publishMode为imagePublish

> 埋点完成后，本次发品任务正式结束。

---

## CSV 中间产物规范

CSV 格式规范统一维护在 `alibaba-global-product-optimize` skill 的 `csv-schema.md` 中，本 skill 不重复定义。

核心约束提示：

- 本 skill 初始化 CSV 时**仅填充 `before.*` 列，`after.*` 列全部为空**
- 列位置动态解析，禁止硬编码列序号
- 换行符需编解码（`{{NL}}` ↔ `\n`）
- 多品场景所有商品在同一个 CSV 文件中，每行一个商品

---

## MCP 工具速查

所有工具通过 MCP 工具名直接调用，aliId 由框架自动注入无需声明。

详细参数规范：[reference/MCP_Tools.md](reference/MCP_Tools.md)

| 工具名                                    | 用途         | 关键约束                                         |
|----------------------------------------|------------|----------------------------------------------|
| `ggs_migration_pre_check`              | 发品基础信息预检   | `productCount`=预计发品数                         |
| `ggs_image_predict_category`           | 图片类目预测     | 结果为空时用 `ggs_category_query` 兜底               |
| `ggs_category_query`                   | 类目名称搜索     | 结果为空提示用户换词重试                                 |
| `ggs_image_quality_check`              | 图片质量检测     | 调用失败按"无问题"继续                                 |
| `ggs_ai_assistant_ability_check_point` | 商业化点数校验    | `ability`固定=`ggsAiCopilotImageOptimization`  |
| `ggs_image_post_task_start`            | AI 生成任务启动  | `enableImageOptimization`取决于质检+用户选择          |
| `ggs_image_post_task_result`           | 获取 AI 生成结果 | 轮询上限 **30次**，间隔10~30s                        |
| `ggs_XDataLogger_log`                  | 埋点记录       | `action`固定=`AccioWorkGgsPublishProduct`，每品一次 |

**依赖的外部 Skill：**

| Skill 名称                          | 用途               | 集成方式            |
|-----------------------------------|------------------|-----------------|
| `alibaba-global-product-optimize` | 编辑/优化、CSV规范、预览渲染 | 参考其文档自行执行，共享CSV |
| `alibaba-global-product-publish`  | 发布/存草稿、结果展示      | 直接调用该 skill     |

---

## 全局规范

- **流程顺序**：严格按步骤一→二→三→四→五执行，禁止跳步
- **用户取消**：用户可随时取消流程，Agent 立即终止当前操作并向用户确认
- **多品并行**：识别到多品时，后续步骤以产品维度并行处理
- **多语言处理**：根据用户当前对话使用的语言自动适配所有交互文案（如用户用英文则英文回复）
- **错误处理**：任何工具调用失败时向用户反馈具体原因，不得静默跳过
