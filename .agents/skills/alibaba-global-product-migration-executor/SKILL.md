---
name: alibaba-global-product-migration-executor
description: 搬品任务执行。负责根据不同搬品模式构造参数、OSS 上传、创建搬品任务、后台轮询、解析数据预览、调用优化 Skill、优化后展示。接收来自 alibaba-global-product-migration-entry 的参数，执行完成后将 CSV 传递给 alibaba-global-product-publish 进行发布。
when-to-use: 搬品入口 Skill 完成预检查和模式判定后，将参数传递到本 Skill 执行实际搬品任务
skip-for: 搬品意图识别/预检查/模式判定 → 使用 alibaba-global-product-migration-entry；发布操作 → 使用 alibaba-global-product-publish
---

# alibaba-global-product-migration-executor

搬品任务执行 Skill。负责执行实际的搬品流程：解析商品数据、数据预览确认、商品优化。

## 核心规则（不可跳过）

1. **异步任务后台轮询与面板反馈规则**：
   - **🔴 强制读取指令（MANDATORY READ — 不可跳过）**：在执行搬品任务追踪逻辑（调用`cron`工具）前，**必须**通过 `read_file` 工具**完整读取 `./references/migration-task-tracking-protocol.md` 全部内容**（该文件是搬品任务追踪的唯一权威协议，涵盖轮询策略、轮询间隔规则、任务创建模板、cron 后台轮询、面板反馈、自动完结流程、5 条致命红线）。**严禁凭记忆、缓存、摘要或推断执行追踪逻辑，必须每次实际读取原文后再执行**。
   - **轮询间隔**：后台轮询间隔 **绝对禁止低于 60,000ms**。
   - **界面与消息语言自适应协议 (Language Auto-Adaptation)**
     - **强制检测与翻译**：在调用任何 UI 类工具（`task_create`, `task_update`, `cron` payload, `question`）前，Agent 必须自动检测当前会话的主导语言，并将 Skill 模板中的用户可见文字动态翻译为该语言。
     - **模板引用原则**：Skill 文档中的中文文案仅作为“语义标准”，Agent 有责任在输出时将其作为翻译源，严禁直接复制粘贴中文示例。
   - **关键约束**：
     - **严禁同步轮询**：禁止在主对话中使用 `sleep`、`bash`、循环、定时器等任何方式同步阻塞等待任务结果。**必须且只能使用 `cron` 工具启动后台异步轮询**。
     - 主对话在创建 `cron` 任务后必须**立即结束当前轮次**，将控制权交还用户，不得继续等待或查询任务状态。
     - 当任务状态变为 `AGGREGATE_SUCCESS` / `SUCCESS`（成功）或 `FAILED`（失败）时，必须严格按以下顺序执行：**① 设置 Task 完成**（cron 已 `deleteAfterRun`，无需手动删除） → **② 分页查询商品数据并写入 CSV** → **③ 备份快照** → **④ 重读 `SKILL.md`** → **⑤ 根据搬品模式决定后续流程**：常规模式进入 Step 2 输出预览结果和菜单；**一键搬品模式跳过 Step 2 预览，直接进入 Step 3 执行默认全部优化**（优化逻辑参考 `alibaba-global-product-optimize` Skill）。
   - **一键搬品模式特别说明**：一键搬品模式下，轮询完成后**不展示预览、不等待用户确认**，直接进入 Step 3 自动执行全部优化。轮询的异步机制、cron 创建规则等仍然完全适用，详见 `./references/migration-task-tracking-protocol.md`。批量商品优化的具体执行逻辑由 `alibaba-global-product-optimize` Skill 承接。

2. **唯一本地 CSV**：全流程只维护**一个** CSV 文件作为核心中间产物，解析写入、优化写回都操作同一个文件，禁止创建多个 CSV 副本。CSV 格式见 `./references/csv-schema.md`。

3. **优化由外部 Skill 承接**：商品优化的意图理解和执行逻辑**完全交由 `alibaba-global-product-optimize` Skill 处理**，本 Skill 不直接调用优化 MCP，Agent **不在本地执行任何优化逻辑**。

4. **所有工具通过 MCP 调用**：参数定义见 `./references/tools-openapi.md`。

5. **MCP 调用失败直接终止**：任何 MCP 工具调用失败时，**立即将错误信息返回给用户，不尝试替代方案、不自行重试、不绕道执行**。严格按照本 Skill 定义的流程操作，禁止做流程外的额外动作。**特别是 `start_ggs_product_migration`（开启任务接口）**：该接口若调用失败，必须**立即中断流程**，将完整错误信息展示给用户，不做任何降级处理。**⚠️ 例外（任务冲突）**：若返回错误码 `ALREADY_HAS_RUNNING_TASK`，说明用户已有正在运行的搬品任务，Agent 必须询问用户是否需要调用 `ggs_cancel_migration_task` 取消老任务。

6. **交互效率优先**：每轮对话只传递必要信息，不做冗余解释或重复确认。能合并的步骤合并执行，能自动推断的参数不追问用户。

7. **originSite 传值规则**：当 `productFrom` 为 `API` (Shopify API 搬品) 时，`originSite` 参数固定传 `SHOPIFY`；其他模式下不传该参数。

8. **语言适配**：Agent 输出必须使用用户当前使用的语言。

9. **优化/发布必须用户确认**：默认情况下，无论商品数量多少（**即使只有 1 个商品**），执行优化（Step 3）前都**必须询问用户并获得明确确认**后才能执行，禁止自动执行。**例外：若用户在 Step 0 开启了「一键搬品模式」，则跳过 Step 2 和 Step 3 的确认，仅保留 Step 4 发布前的最终确认。** 一键搬品模式下的后台轮询规则同样适用（详见 `./references/migration-task-tracking-protocol.md`），轮询完成后直接进入 Step 3 执行默认全部优化，批量优化逻辑由 `alibaba-global-product-optimize` Skill 承接。

10. **🚫 防私自简化红线（Anti-Simplification Red Line）**：以下行为被**严格禁止**，违反任何一条等同于流程错误：
    - **禁止省略字段构造**：Step 4 构造 `after` 对象时，必须逐一遍历 ProductSnapshotDTO 全部 15 个字段，不得因"字段为空"或"与 before 相同"而跳过任何字段的取值逻辑
    - **禁止跳过校验步骤**：类目校验、`priceType` 必填校验、`unitSize` 格式校验、`keywords` 格式校验——每一项都必须显式执行，不得以"数据看起来正确"为由跳过
    - **禁止合并确认点**：除非用户开启了「一键搬品模式」，否则 Step 2 的数据预览确认、Step 3 的优化确认是**独立的用户确认点**，不得合并为一次确认
    - **禁止省略预览渲染**：Step 2 的解析预览和 Step 3 的优化预览必须完整渲染输出，不得以"商品数量少"或"数据简单"为由省略
    - **禁止简化错误处理**：MCP 调用失败时必须展示完整错误信息（含工具名、错误码、错误消息），不得简化为"发布失败，请重试"等笼统提示
    - **禁止跳过物流模版步骤**：Step 0 中物流模版查询和用户选择是必经步骤，不得自动跳过或默认选择
    - **禁止跳过币种确认步骤**：Step 0 中币种推断和用户确认是必经步骤（与物流模版同等强硬），不得自动跳过、不得默认使用推断结果而不经用户确认
    - **禁止捏造库存数据**：绝对禁止在优化或发布时私自为商品编造库存（`inventory`）数量（如默认写 100 或 1000）。若原始数据无库存，必须保持为空，严禁擅自填充。

11. **🚫 OSS 上传严禁携带 Content-Type（FATAL RED LINE）**：使用 `curl PUT` 上传文件到 OSS 预签名 URL 时，**绝对禁止**在 curl 命令中添加 `-H "Content-Type: ..."` 或任何形式的 Content-Type 头。预签名 URL 的签名中不包含 Content-Type，携带会导致 `SignatureDoesNotMatch` 错误。**推荐的 curl 格式**：
    ```bash
    # ✅ 正确（推荐使用 --upload-file 以避免自动添加 Content-Type）
    curl -sS -X PUT "<预签名URL>" --upload-file "/path/to/file"
    
    # ❌ 错误（以下任何一种都会导致 SignatureDoesNotMatch）
    curl -sS -X PUT -H "Content-Type: application/json" "<URL>" --data-binary "@file"
    curl -sS -X PUT -H "Content-Type: application/octet-stream" "<URL>" --upload-file "file"
    curl -sS -X PUT -H "Content-Type: text/plain" "<URL>" --data-binary "@file"
    **Agent 在构造 curl 命令时，必须逐字检查命令中是否包含 `Content-Type` 字样，若包含则必须删除后再执行。**
    ```

12. **🚫 币种确认强制门禁（HARD BLOCKER — 与物流模版同等强硬）**：调用 `start_ggs_product_migration` 前，Agent **必须**完成以下币种确认流程，缺一不可：
    - **快速推断**：根据数据来源（Excel 列名/货币符号、1688→CNY、Amazon 站点→对应币种等）快速推断原始数据币种，耗时不超过 5 秒
    - **用户确认**：将推断结果展示给用户，等待用户明确确认或修正。**禁止跳过确认、禁止默认选择、禁止自动使用推断结果**
    - **格式校验**：币种必须为 **ISO 4217 三位大写字母**（如 `USD`、`CNY`、`EUR`、`JPY`、`GBP`），不接受其他格式
    - **传参**：用户确认后的币种传入 `start_ggs_product_migration` 的 `currency` 参数。**若未传 `currency`，后端默认按 `USD` 处理**，可能导致价格数据错误
    - **禁止跳过**：即使 Agent 认为币种"显而易见"（如 1688 肯定是 CNY），也**必须展示推断结果并等待用户确认**

## 执行协议

- `start_ggs_product_migration` 超时 **120s**，其他工具 30s。
- **MCP 失败处理**：工具返回错误或超时时，直接告知用户失败原因和具体的 MCP 工具名称，由用户决定是否重试。Agent 禁止自行用其他方式（如本地模拟、HTTP 请求、换工具）替代执行。
- **严格按 Step 顺序执行**：不得跳步、合并步骤的确认点、或在流程外自行发起额外操作。
- CSV 列名不可修改，列位置须动态解析，详见 `references/csv-schema.md`。

---

## ▶ 多 SKU 商品处理规范

当 `before.price.priceType = "sku"` 时，该商品为**多 SKU 商品**，SKU 明细存储在 `price.skuPrices` 数组中。

- **预览**：`./scripts/render_parsed_csv_preview.py` 自动从 `price.skuPrices` 渲染 SKU 变体表格（名称、单价）
- **优化**：SKU 数据通过 `before.price` 完整传入后端，后端处理 SKU 级别优化
- **发布**：`build_payload.py` 原样透传 `price` 对象（含 `skuPrices`），确保 `priceType="sku"` 且 `skuPrices` 数组完整
- 禁止在优化或发布时丢弃 SKU 价格数据

---

## ▶ Step 1：解析商品数据

### 支持的数据来源

| 数据来源 | 搬品模式 (`productFrom`) | 说明 |
|---------|------------------------|------|
| Excel/CSV/PDF 文件（行数 ≤ 200） | `SMART_FILE` | 云端解析，用户上传文件后由后端解析 |
| Shopify API（Access Token + 域名） | `API` | 通过 Shopify Admin REST API 拉取商品数据 |
| 1688/Amazon 商品详情页 URL | `PDP` | 云端解析单个商品 |
| 1688/Amazon 店铺首页 URL | `STORE` | 云端解析店铺下多个商品 |
| 其他平台 URL（Shopee/Temu/独立站等） | 先尝试 `PDP`/`STORE`，失败降级 `FILE` | 云端解析失败后走本地兜底模式 |

### Shopify API 搬品流程

当用户提供 Shopify 的 API Key（Access Token）+ 店铺域名时：

1. **拉取商品数据**：使用 Shopify Admin REST API 拉取商品
   ```
   GET https://{shop}.myshopify.com/admin/api/2024-01/products.json
   Headers:
     X-Shopify-Access-Token: {access_token}
   Query: limit=250&status=active
   ```
   - 分页获取：通过 `Link` header 中的 `next` 游标分页，直到获取全部商品
   - 用户可指定筛选条件（如品类、状态、创建时间等），转换为 API query 参数

2. **转换为 ShopifyMcpProductDTO 数组 JSON**：将拉取到的商品数据**按 `./references/shopify-dto-schema.md` 定义的 `ShopifyMcpProductDTO` 结构转换**，序列化为 **JSON 数组**写入本地临时文件（如 `shopify_products_{timestamp}.json`）。
   > **⚠️ 关键**：所有字段名使用 Java 驼峰命名（camelCase）。Shopify API 返回的 snake_case 字段需转换：`body_html` → `descriptionHtml`，`product_type` → `productType`，`updated_at` → `updatedAt`，`src` → `url`，`alt` → `altText`，`inventory_quantity` → `inventoryQuantity`。

3. **上传至 OSS**：调用 `get_oss_pre_upload_url` MCP 工具获取预签名 URL，然后上传文件：
   ```bash
   # ✅ 唯一允许的格式（推荐使用 --upload-file 以避免自动添加 Content-Type）
   curl -sS -X PUT "<预签名URL>" --upload-file "shopify_products_{timestamp}.json"
   ```
   > 详细的 curl 写法规范与错误示例见 SKILL.md 第 11 条「OSS 上传严禁携带 Content-Type」。

4. **触发解析**：调用 `start_ggs_product_migration`：
   - `productFrom` 设为 **`API`**
   - `fileName` 填从预签名 URL 中提取的 **OSS 相对路径**（去掉域名和查询参数，如 `migrate/2024/shopify_products.json`）。**🚫 严禁传自定义短文件名**
   - `originSite` 传 **`SHOPIFY`**（仅 `API` 模式需要）

### 触发 → 后台追踪 → 自动唤回 → 写入 CSV

1. **调用 `start_ggs_product_migration`**：根据搬品模式构造参数，调用 MCP 工具创建搬品任务。
   - **超时设置**：120s
   - **失败处理**：
     > **🚨 致命红线（FATAL RED LINE）：`start_ggs_product_migration` 调用失败时的强制行为**
     > - 若返回 `ALREADY_HAS_RUNNING_TASK`：
     >   > 🚫 **任务冲突**
     >   > 您正在运行的搬品任务已经达到阈值，无法再开启新任务。
     >   > - **「取消老任务并继续」** → 告诉我老任务的 ID，我将调用 `ggs_cancel_migration_task` 取消它并重新创建新任务。
     >   > - **「暂不处理」** → 结束本次操作。
     > - **绝对禁止盲目重试**（禁止在未取消老任务前再次调用该接口）
     > - **绝对禁止尝试其他工具**
     > - **绝对禁止自行修改参数盲猜**
     > - 其他错误直接终止流程，展示完整错误信息

2. **初始化追踪与后台轮询**：
   - **🔴 强制读取指令（MANDATORY READ — 不可跳过）**：Agent 在执行搬品任务追踪逻辑前，**必须**通过 `read_file` 工具**完整读取 `./references/migration-task-tracking-protocol.md` 全部内容**（该文件是搬品任务追踪的唯一权威协议）。**严禁凭记忆、缓存、摘要或推断执行追踪逻辑，必须每次实际读取原文后再执行。** 该文档包含：轮询策略、轮询间隔规则（按搬品模式和商品数量查表）、任务创建模板、cron 后台轮询机制（含 Payload 固定英文格式）、面板反馈、自动完结流程、5 条致命红线。
   - **⚠️ 主对话到此必须立即结束当前轮次**，将控制权交还用户。严禁在主对话中继续执行 `sleep`、`bash`、循环等方式查询任务状态。后续轮询完全由 `cron` 后台 Agent 负责。
   - **cron 创建失败降级**：若 `cron` 工具调用失败，告知用户"后台自动轮询启动失败，您可以随时发送「查询搬品进度」来手动查询任务状态"，并在回复中明确展示 `taskId`，确保用户后续能引用。

3. **用户主动查询进度**：当用户在对话中询问搬品任务的进度或结果时，Agent 应调用 `query_ggs_migration_task_status` 查询任务状态并返回给用户。若上下文中有 `taskId` 则直接使用；若上下文中无 `taskId`，应询问用户提供。查询到 `AGGREGATE_SUCCESS` / `SUCCESS` 后，自动进入唤回处理流程（第 4 步）。

4. **自动完结与展示（无需等待用户回复）**：
   > 详见 `./references/migration-task-tracking-protocol.md` 第 3.4 节「自动完结」的完整流程。核心流程为：**设置 Task 完成**（cron 已 `deleteAfterRun`，无需手动删除） → **分页查询商品数据** → **写入 CSV（禁止手写脚本，必须使用 `./scripts/migration_response_to_csv.py`）** → **备份快照** → **重读 `SKILL.md`** → **根据搬品模式决定后续流程**：
   > - **常规模式**：直接进入 Step 2 输出预览结果和菜单
   > - **一键搬品模式**：跳过 Step 2 预览，直接进入 Step 3 执行默认全部优化（优化逻辑参考 `alibaba-global-product-optimize` Skill）

---

## ▶ Step 2：数据预览确认

### 门禁规则

- **必须生成预览**：无论商品数量多少，都必须渲染 HTML 表格展示解析结果
- **必须用户确认**：除非用户开启了「一键搬品模式」，否则必须等待用户明确确认后才能进入 Step 3
- **预览内容**：展示商品标题、价格、图片、类目等关键信息的解析结果

### 生成本地预览文件（极速渲染）

禁止在对话框中直接打印商品表格。Agent 必须使用 `bash` 工具执行 `python ./scripts/render_parsed_csv_preview.py <CSV文件路径> preview.html`。

> **⚠️ 适用范围**：`./scripts/render_parsed_csv_preview.py` 是 **Step 2 解析预览专用脚本**，仅读取 `before.*` 列，生成单边视图。**严禁在 Step 3 优化预览阶段使用此脚本**。

### 提供访问链接与确认

Agent 输出以下内容：

> 📊 **数据解析完成**
> 
> 共解析 **{商品数量}** 个商品，以下是预览：
> 
> [HTML 预览表格或链接]
> 
> 🔧 **请选择下一步操作**
> - **「全部优化」** → 执行首次必做的 10 项优化（类目、属性、标题、详描、翻译、价格、汇率、关键词、交期、图片）
> - **「最小必要项」** → 仅执行 4 项最小必要优化（翻译 + 关键词 + 价格换算 + 类目推断）
> - **「自定义优化」** → 指定需要优化的字段
> - **「跳过优化」** → 直接使用解析结果进入发布环节
> - **「修改数据」** → 用户编辑 CSV 后重新预览

### 一键搬品模式跳过确认

若用户在 Step 0 开启了「一键搬品模式」，则**跳过 Step 2 的确认环节**，直接进入 Step 3 执行默认全部优化。

> **⚠️ 一键搬品模式流程要点**：
> - 后台轮询完成后（轮询规则详见 `./references/migration-task-tracking-protocol.md`），**不展示预览、不等待用户确认**，直接进入 Step 3
> - 批量商品优化的具体执行逻辑由 `alibaba-global-product-optimize` Skill 承接，本 Skill 不直接调用优化 MCP

### 用户编辑数据

若用户选择「修改数据」，Agent 应：
1. 告知用户 CSV 文件路径
2. 等待用户编辑完成后，重新调用 `./scripts/render_parsed_csv_preview.py` 生成 **Step 2 解析预览**（注意：此处仍处于 Step 2 阶段，使用 `render_parsed_csv_preview.py` 是正确的）
3. 再次输出确认菜单

---

## ▶ Step 3：商品优化

### 确认范围

#### 常规模式三种选择

1. **全部优化**：执行首次必做的 10 项优化（见下方「首次优化必做项」）
2. **最小必要项**：仅执行 4 项最小必要优化（翻译 + 关键词 + 价格换算 + 类目推断）
3. **自定义优化**：用户指定需要优化的字段

#### 一键搬品模式

若用户开启了「一键搬品模式」，则**自动执行全部优化**，无需再次确认。搬品结果后台轮询完成后直接进入商品优化步骤（轮询规则详见 `./references/migration-task-tracking-protocol.md`），批量优化的具体执行逻辑由 `alibaba-global-product-optimize` Skill 承接。

#### 最小必要项 HARD RULE 定义

搬品发布的最小必要优化项为 **翻译（TRANSLATE）+ 关键词（KEYWORD）+ 价格换算（PRICE_EXCHANGE）+ 类目推断（CATEGORY）**，共 4 项。这 4 项是发布到国际站的最低门槛，缺少任何一项都可能导致发布失败或商品质量极差。Agent **严禁自行推断或替换为其他组合**。

### 读取 CSV 构造入参与备份快照

1. **⚠️ 优化前快照备份**：在每次执行优化（无论是调 MCP 还是本地修改）**之前**，Agent 必须先执行 `cp <CSV文件路径> <CSV文件路径>.bak`，将当前状态备份，以便用户随时撤销
2. 从本地 CSV 文件读取当前商品数据（含用户在 Step 2 可能编辑过的内容），转为 `ProductSandboxRecordDTO` 列表
3. 构造优化请求参数，调用 `alibaba-global-product-optimize` Skill

### 交由 alibaba-global-product-optimize Skill 执行优化与进度安抚

- **⏳ 进度安抚（预期管理）**：在调起外部优化 Skill 之前，Agent 必须检查待优化的商品数量。若**商品数量 > 10 个**，必须先向用户输出预期管理提示（按每个商品约 2 分钟估算总耗时）：
  > ⏳ *本次需要深度优化 X 个商品，AI 正在逐一处理标题、翻译、图片等 10 项核心内容。预计需要 Y 分钟（约 2分钟/商品），请您稍作等待，期间您可以处理其他工作...*
- **透传信息**：调起优化 Skill 时，必须将以下要求作为指令透传：
  - ① 必做优化项列表（`field` 枚举，10 项缺一不可）
  - ② 策略约束（一律 `AI_SUGGEST`，禁止 `USER_PROMPT`）
  - ③ 当前 CSV 文件路径（优化 Skill 从 CSV 读取 `ProductSandboxRecordDTO`）
- **⚠️ 禁止查询 PIS 分**：搬品场景下商品尚未发布到国际站，不存在线上商品记录，调用 `query_product_score` 查询 PIS 分必定失败。因此**严禁在搬品优化流程中调用 `query_product_score`**，跳过所有 PIS 分查询步骤

### 写回 CSV 与价格类型校正

优化完成后，`alibaba-global-product-optimize` Skill 将优化结果（`after.*` 列）写回唯一本地 CSV 文件。

> **⚠️ 价格类型校正（写回后必做）**：写回 CSV 后，Agent 必须检查每个商品的 `after.price.priceType`。**发布只接受 `sku` 和 `ladder` 两种**，若存在 `fixed`/`tiered`/`range` 等其他类型，必须按 `./references/migration-flow-detail.md` 中的「发布价格规则」自动转换为 `ladder`。阶梯价允许只有一档。**若阶梯价为一档，则 `moq` 与 `ladderPrices[0].minQuantity` 必须相同**，不一致时以 `moq` 为准修正。

### ⚠️ 预览渲染职责归属（HARD RULE）

> **优化完成后预览渲染由 `alibaba-global-product-optimize` Skill 全权负责，executor 不得重复渲染。**
>
> `alibaba-global-product-optimize` Skill 在优化完成后会按其内部的四个强制动作（`execution-protocol.md`）依次执行：写入 CSV → 查询 PIS（搬品场景跳过）→ 生成本地预览文件 → 在对话中输出 Markdown 格式的 before/after 对比预览。**预览的生成和展示已包含在 optimize Skill 的执行流程中，且该预览使用的是 `optimize-preview-html.md` 规范，会直接在对话中输出 before/after 双栏对比卡片。**
>
> **🚫 禁止行为**：
> - 禁止在 optimize Skill 返回后，executor 再次调用本 Skill 中的任何渲染工具或脚本（如 `./scripts/render_parsed_csv_preview.py`）重新生成预览
> - 禁止用 executor 本地的渲染逻辑覆盖或替代 optimize Skill 已输出的预览结果
>
> **✅ executor 在 optimize Skill 返回后只需做以下事情**：
> 1. 价格类型校正（见上方）
> 2. 输出智能诊断与处理建议菜单（见下方）
> 3. 等待用户选择下一步操作

### 输出智能诊断与处理建议（交互引导菜单）

Agent 输出以下内容：

> ✅ **优化完成**
> 
> 共优化 **{商品数量}** 个商品，以下是优化前后对比：
> 
> [HTML 预览表格或链接，展示 before/after 对比]
> 
> 📋 **智能诊断**
> - 类目匹配度：{高/中/低}
> - 关键词覆盖率：{百分比}
> - 价格合理性：{合理/偏高/偏低}
> 
> 🔧 **处理建议**
> 请选择：
> - **「修正问题后发布」** → 由我（本地 Agent）直接为您修复上述问题（修改本地 CSV），然后进入发布
> - **「确认发布 / 按现状发布」** → 忽略警告，直接进入发布环节（交由 `alibaba-global-product-publish` 处理）
> - **「重新优化」** → 重新将数据提交给 AI 优化接口（MCP）再跑一次（重新调用 `alibaba-global-product-optimize` Skill，预览由该 Skill 负责生成）
> - **「撤销上一步」** → 恢复到本次优化前的状态（执行 `cp <CSV>.bak <CSV>`），然后使用 `./scripts/render_parsed_csv_preview.py` 生成 **Step 2 解析预览**（因为 `after.*` 列已被清空，回到了解析完成状态）
> - **「重置为初始状态」** → 彻底清空优化，回到刚解析完的原始状态（执行 `cp <CSV>.orig <CSV>`），然后使用 `./scripts/render_parsed_csv_preview.py` 生成 **Step 2 解析预览**（因为 `after.*` 列已被清空，回到了解析完成状态）
> - **「我自己改」** → 您可以直接打开本地 CSV 文件修改 `after.*` 列，改完告诉我。用户改完后，Agent 必须重新调用 `alibaba-global-product-optimize` Skill 的强制动作 3+4 生成 before/after 对比预览（因为 `after.*` 列有值，属于优化预览场景）

用户可多轮调整。**预览方式判断规则**：检查 CSV 中 `after.*` 列是否有值——有值则属于优化预览场景（由 `alibaba-global-product-optimize` Skill 负责渲染 before/after 对比）；全为空则属于解析预览场景（使用 `./scripts/render_parsed_csv_preview.py` 渲染单边视图）。确认无误后进入发布环节（交由 `alibaba-global-product-publish` 处理）。

---

## 附录：首次优化必做项

当用户首次对搬品商品执行优化时，以下 10 项为**必做优化动作**，必须全部执行，**缺一不可，不可跳过任何一项**。

> **⚠️ 策略统一规则：搬品场景中所有优化动作一律使用 `AI_SUGGEST` 策略，禁止使用 `USER_PROMPT`。**

| 序号 | 优化动作 | `field` 枚举 | 优先级 | 说明 |
|------|----------|-------------|--------|------|
| 1 | 类目推断 | `CATEGORY` | **🔴 最小必要** | 根据商品信息推断最合适的国际站类目，**类目是发布必要参数** |
| 2 | 属性推断 | `CPV` | P0 | 补全缺失的商品属性字段 |
| 3 | 标题优化 | `TITLE` | P0 | 后端 AI 自动优化标题，使其符合国际站搜索习惯 |
| 4 | 详描优化 | `DESCRIPTION` | P0 | 后端 AI 自动优化商品描述（HTML） |
| 5 | 翻译 | `TRANSLATE` | **🔴 最小必要** | 后端 AI 自动翻译为目标语言（作用于标题、详描等文本字段） |
| 6 | 价格推荐 | `PRICE` | P0 | 调整为适合国际站的价格区间 |
| 7 | 汇率换算 | `PRICE_EXCHANGE` | **🔴 最小必要** | 将源平台币种价格换算为目标币种 |
| 8 | 关键词优化 | `KEYWORD` | **🔴 最小必要** | 提取/生成适合国际站搜索的关键词，**关键词是发布必要参数** |
| 9 | 交期优化 | `LEAD_TIME` | P0 | 系统自动推荐合理的交期值 |
| 10 | 图片优化 | `IMAGE` | P0 | 优化商品主图和详情图 |
