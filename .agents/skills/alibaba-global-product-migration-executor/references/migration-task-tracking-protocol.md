# 搬品任务追踪协议（MANDATORY）

> **🔴 强制阅读说明**：本文件定义了搬品任务从「创建本地 Task」→「cron 后台轮询」→「面板进度反馈」→「自动完结」的端到端追踪协议，含轮询间隔规则、cron Payload 固定格式、面板字段更新规则、终态完结流程及致命红线。
> 接口字段定义（`taskStatus` 枚举、`successPulledCount` 等）见 `./tools-openapi.md`中 `query_ggs_migration_task_status` 章节。

---

## 1. 轮询策略

Agent 需要轮询查询搬品任务状态，直到任务达到终态（`AGGREGATE_SUCCESS` / `SUCCESS` 或 `FAILED`）：

1. **调用查询**：调用 `query_ggs_migration_task_status` 查询任务状态
2. **检查状态**：检查返回的 `data.data.taskStatus` 字段
3. **继续轮询**：如果状态为 `PRE_DATA` / `PRE_DATA_SUCCESS` / `AGGREGATE_DATA`，按轮询间隔等待后继续查询
4. **终态处理**：当状态变为 `AGGREGATE_SUCCESS` / `SUCCESS`（成功）或 `FAILED`（失败）时，停止轮询，进入后续处理
5. **商品数据获取**：任务成功后，调用 `page_query_migration_task_info_product_info`（pageSize=50）分页获取全部商品数据，必须遍历所有页面

**⚠️ 重要**：必须遍历所有页面，确保获取全部商品的解析结果，不能只查询第一页。

---

## 2. 轮询间隔规则（直接查表，固定不变）

每次轮询使用一次性 cron（`deleteAfterRun: true`），间隔**直接查下表**，**全程同间隔，不递增、不推算**。

**间隔表**（对应 cron 工具 `schedule.kind=in` 的 `inMs` 参数）：

| 搬品模式 | 商品数量 | inMs |
|---------|---------|------|
| 文件（Excel/PDF）、URL PDP、Shopify API | ≤ 50 个 | `60000` |
| 文件（Excel/PDF）、URL PDP、Shopify API | 51 ~ 100 个 | `120000` |
| 文件（Excel/PDF）、URL PDP、Shopify API | > 100 个 | `180000` |
| URL Store 整店搬品 | 不限 | `180000` |

**硬约束（违反即失败）**：

1. **单位强制毫秒**：`inMs` 只能填上表中的数值（`60000` / `120000` / `180000`），不得做单位换算。
2. **硬下限**：`inMs` 必须 ≥ `60000`,任何情况下都不允许更小。
3. **全程同间隔**：首次轮询和后续每次轮询都使用同一个 `inMs` 值,不按进度推算、不按次数递增。
4. **不动态计算**：本规则下不存在"动态计算下一次间隔"的逻辑,只查表。

---

## 3. 异步任务后台轮询与面板反馈规则

**在调用 `query_ggs_migration_task_status` 工具时，必须使用以下轮询方式：**

### 3.1 任务创建

调用 `start_ggs_product_migration` 获取 `taskId` 后，立即调用 `task_create` 创建本地任务。

- **⚠️ 语言一致性要求**：Subject 和 Description 中面向用户可见的文案，**必须与用户当前对话使用的语言保持一致**。以下中文模板仅为语义参考，实际输出时必须翻译为用户的语言。技术元数据（如 `[TaskId]`、`[CsvPath]` 等）可保留英文。
- **Subject**（必须使用用户当前语言）：
   - 中文示例：`搬品任务进行中 ⏳`
   - 英文示例：`Product Migration In Progress ⏳`
- **Description**（面向用户的部分必须使用用户当前语言，技术元数据部分可保留英文）：
  ```
  正在为您解析 <商品数量> 个商品数据，请稍候...
  处理完成后会自动通知您查看解析结果。

  ---
  [Skill: ggs-product-migration-executor] </br>
  [Protocol: SKILL.md] </br>
  [TaskId: <taskId>] </br>
  [CsvPath: <CSV文件路径，如已确定>] </br>
  [CurrentInterval: <inMs 数值,取自轮询间隔规则表>] </br>
  [PollCount: 0] </br>
  [Progress: ▓░░░░░░░░░ 0%] </br>

  ## 完结流程（终态触发，按序执行）
  1. task_update → completed/failed（先执行，阻断残留消息）
  2. 分页拉取 page_query_migration_task_info_product_info（pageSize=50）→ parsed_data.json 
  3. python ../scripts/migration_response_to_csv.py parsed_data.json <CsvPath> && cp <CsvPath> <CsvPath>.orig 
  4. 重读 SKILL.md：常规模式 → Step 2 预览菜单；一键搬品模式 → 跳过 Step 2 直接 Step 3（参考 `alibaba-global-product-optimize`）
  ```

### 3.2 启动首次轮询（直接创建，无需用户确认）

创建任务后，**立即**使用 `cron` 工具创建一次性轮询任务，**必须设置 `deleteAfterRun: true`**，`sessionTarget: "main"`。**间隔按上方「轮询间隔规则」的初始间隔设置。** 轮询逻辑完全由 `cron` 后台 Agent 执行，主对话 Agent 不参与轮询过程。**⚠️ 禁止向用户询问"是否创建定时任务"或要求用户说"继续轮询"等引导词，直接创建即可。**

- **cron Payload 参数**：创建 cron 时，Payload 部分**必须**指定 `kind: agent` 和 `agent: main`，确保轮询消息由 Agent 在 main session 中接收和处理。缺少这两个参数会导致轮询消息无法正确路由。
- **cron Payload 消息（固定英文格式，禁止改写）**：
  为了保持对话流整洁、避免与用户输入冲突，Payload 消息**必须严格使用以下单行英文格式**（不分用户语言、不翻译、不增删字段、无换行）：
  ```
  [BACKGROUND_POLL] Migration task status check, ID: <taskId>
  ```
  *合法示例*：`[BACKGROUND_POLL] Migration task status check, ID: 123456`

### 3.3 面板反馈

后台 Agent 每次轮询拿到状态后，**必须立即**调用 `task_update` 同步任务面板，**禁止在静默期向聊天框发送任何进度文本**。

每次更新涉及 3 个字段，**按当前 `taskStatus` 分支处理**：

| 字段 | 进行中态<br>（`PRE_DATA` / `PRE_DATA_SUCCESS` / `AGGREGATE_DATA`） | 成功终态<br>（`AGGREGATE_SUCCESS` / `SUCCESS`） | 失败终态<br>（`FAILED`） |
|------|------------------|----------------|----------------|
| **`[PollCount]`** | 累加 +1 | 累加 +1 | 累加 +1 |
| **`[Progress]`** | 按 `successPulledCount / totalProductCount × 100%` 计算，10 格进度条按 10% 一格渲染 | **强制置为 `▓▓▓▓▓▓▓▓▓▓ 100%`**（无视实际比例，避免"已完成但卡在 90%"的视觉割裂） | **保持当前值不变**（保留失败时刻的真实进度，便于诊断） |
| **`Subject`** | 维持创建时的"进行中 ⏳" | 改为"已完成 ✅" | 改为"失败 ❌" |

**`[Progress]` 计算细则**：

- 进度条始终 10 格，按 10% 一格渲染。如 `30%` → `▓▓▓░░░░░░░ 30%`
- **边界**：`totalProductCount` 为 `null` 或 `0` 时显示 `░░░░░░░░░░ 0%`
- **示例**：`successPulledCount=3, totalProductCount=10` → `[Progress: ▓▓▓░░░░░░░ 30%]`

**`Subject` 文案示例**（必须沿用任务创建时的语言，禁止中英文混用）：

| 状态 | 中文 | 英文 |
|------|------|------|
| 进行中 | `搬品任务进行中 ⏳` | `Product Migration In Progress ⏳` |
| 已完成 | `搬品任务已完成 ✅` | `Product Migration Completed ✅` |
| 失败 | `搬品任务失败 ❌` | `Product Migration Failed ❌` |

### 3.4 自动完结

当任务状态变为 `AGGREGATE_SUCCESS` / `SUCCESS`（成功）或 `FAILED`（失败）时，后台 Agent 读取任务描述中的「完结流程」，按指令顺序执行。核心流程为：**设置 Task 完成**（最先执行，阻断残留消息） → **分页查询商品数据** → **写入 CSV** → **备份快照** → **重读 `SKILL.md`** → **根据搬品模式决定后续流程**：

- **常规模式**：直接进入 Step 2 输出预览结果和菜单
- **一键搬品模式**：跳过 Step 2 预览，直接进入 Step 3 执行默认全部优化（优化逻辑参考 `alibaba-global-product-optimize` Skill）

> **⚠️ 无需手动删除 cron**：由于所有 cron 均设置了 `deleteAfterRun: true`，执行完毕后会自动删除，**无需手动调用 `cron list` + `cron remove`**。

### 3.5 用户主动查询进度

当用户在对话中询问搬品任务的进度或结果（如"搬品进度怎么样了"、"任务完成了吗"）时，Agent 应调用 `query_ggs_migration_task_status` 查询任务状态并返回给用户。若上下文中有 `taskId` 则直接使用；若上下文中无 `taskId`，应询问用户提供。查询到 `AGGREGATE_SUCCESS` / `SUCCESS` 后，自动进入唤回处理流程（3.4 自动完结）。

### 3.6 非阻塞体验

创建任务并启动后台轮询后，Agent 应向用户输出**友好的等待提示**，告知任务已在后台运行。

- **⚠️ 友好文案要求**：面向用户的文案必须简洁温和，**禁止暴露技术细节**（如 `accio-mcp-cli call`、`query_ggs_migration_task_status`、JSON 参数等）。
- **推荐文案示例**（使用用户当前语言）：
  > "解析任务（Task ID: [taskId]）已在后台启动，您可以继续其他店铺操作，进度将在顶部任务面板实时更新。完成后我会第一时间通知您。"
- **⚠️ 语言适配**：以上仅为中文示例，实际输出时必须翻译为用户当前使用的语言。
- **⚠️ 禁止行为**：
   - 禁止要求用户说"继续轮询"、"查看结果"等引导词
   - 禁止在对话中输出定时任务的技术内容（如 cron 指令、MCP 调用命令等）
   - 禁止向用户暴露轮询间隔、重试次数等执行参数

---

## 4. 致命红线

- **🚫 严禁同步轮询**：禁止在主对话中使用 `sleep`、`bash`、循环、定时器等任何方式同步阻塞等待任务结果
- **🚫 严禁跳过 cron 后台轮询**：必须使用一次性 cron（`deleteAfterRun: true`）实现异步追踪
- **🚫 严禁在任务未完成时提前查询商品数据**：必须等待状态变为终态
- **🚫 严禁手写脚本处理 JSON 数据**：必须使用 `../scripts/migration_response_to_csv.py`
- **🚫 严禁创建不设置 deleteAfterRun 的 cron**：所有轮询 cron 必须设置 `deleteAfterRun: true`，确保执行后自动销毁
