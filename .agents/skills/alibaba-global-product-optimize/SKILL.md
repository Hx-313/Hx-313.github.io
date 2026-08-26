---
name: alibaba-global-product-optimize
description: |
  对店铺内已有商品进行批量字段优化（标题/价格/MOQ/交期等），或对新发品/素材进行优化建议。
  凡是涉及「优化商品」「修改商品」「编辑商品」的意图，均走本 Skill。
  支持两种模式：
  1. 存量治理：接收本地 CSV 文件（圈品结果），走「优化预览 → 确认发布」流水线。
  2. 新发品优化：接收商品 JSON 信息（含图片），走「JSON 转 CSV → 优化预览 → 导出」流水线。
  支持的优化字段：
    - Title（标题）、Description（详描）、Keywords（关键词）
    - Price（价格）、MOQ（最小起订量）、Lead Time（交期）
    - Images（图片，通过 Sub Agent 唤起 alibaba-global-ai-image-studio 处理）
    - Properties/CPV（属性）、Category（类目）
    - Unit Weight（单位重量）、Unit Size（单位尺寸）
    - Shipping Template（运费模板）、Inventory（发货地与库存）
    - Translate（翻译优化）、Price Exchange（价格汇率换算）
  When to use:
    - 用户要求「优化」「修改」「编辑」商品的任意字段（如"帮我优化标题"、"修改价格"、"编辑商品描述"）
    - 用户已有本地 CSV 中间产物，要继续做批量优化或发布到线上
    - 用户提供新品 JSON 信息（含图片，无 productId），要求提供优化建议（如"帮我写下这个新品的标题和价格"）
  Skip for:
    - 用户需要圈品/筛选商品 → 使用 alibaba-global-product-select
    - **用户指令包含圈品条件但未提供 CSV 文件**（如"帮我优化xxx的商品"、"优化近 90 天无曝光的商品"）→ 先使用 alibaba-global-product-select 圈品，再使用本 Skill 优化
    - 站外搜爆款、趋势调研、询价分析 → 不是店铺治理，不触发本 Skill
    - 纯咨询"标题怎么写好"但无具体商品素材（图片/描述）输入 → 不需要走流水线
workflow: |
  1. 场景识别：根据输入是否存在 productId 判定为「存量治理」或「新发品优化」模式。
  2. 初始化数据：
     - 存量模式：接收本地 CSV 文件（圈品结果）
     - 新发品模式：将用户提供的 JSON 商品信息映射至标准 CSV 格式（productId 为空，before.images 必须）。
  3. 批量优化：调用批量优化工具（`create_ggs_batch_optimize_main_task` + `submit_ggs_batch_optimize_detail` + `query_ggs_batch_optimize_result`）执行字段级优化。
  4. 加载渲染协议：阅读 `references/optimize-preview-html.md`，准备生成预览。
  5. 执行强制动作：按 `references/execution-protocol.md` 执行四个强制动作（写入 CSV → 查询 PIS → 生成 MD 文件 → 对话输出预览）。
  6. 后续处理：
     - 存量模式：双重确认后发布写回线上。
     - 新发品模式：仅提供优化后的 CSV 导出，不执行发布。
enabled: true
metadata:
  author: GGS
  version: "2.0.0"
---

# GGS 商品治理优化 Skill

帮助商家对店铺内已有商品进行批量字段优化。核心价值是将「优化 → 发布」标准化为可重复执行的流水线，确保每次治理都有章可循、结果可预期。

---

## ⚠️ 强制执行协议 (Strict Protocols)

**在执行优化预览和发布时，必须严格遵守以下协议，严禁跳过：**

0. **⚠️ 文档阅读规则（HARD RULE）**：本 Skill 下所有 `references/*.md` 文件在需要阅读时，**必须使用 `read_file` 工具完整读取全文（`should_read_entire_file=true`）**。这些文档均为短文档（< 300 行），包含关键的规则定义和格式约束，任何遗漏都可能导致执行错误。
   - ✅ 必须：`read_file(should_read_entire_file=true)` 读取完整文件
   - ❌ 禁止：使用 `grep`、`codebase_search` 或部分行号范围读取来替代全文阅读
   - **理由**：这些文档中的规则相互关联，grep 只能命中关键词附近的片段，容易遗漏上下文约束、注意事项和例外情况，导致执行偏差

1. **渲染协议**：必须阅读 `references/optimize-preview-html.md`，使用 HTML 样式渲染预览卡片。**禁止使用普通 Markdown 表格**，必须使用 HTML `<table>` 标签渲染 before/after 对比。

2. **执行流程**：必须阅读 `references/execution-protocol.md`，按以下顺序执行：
   - 写入 CSV → 查询 PIS → 生成 MD 文件 → 对话输出预览

3. **文件生成**：必须在工作目录下创建实际的 `.csv` 和 `.md` 文件，并在对话中提供文件链接。

---

## 文档地图 (Document Map)

| 文档 | 用途 | 何时阅读 |
|------|------|----------|
| `references/csv-schema.md` | 解决"CSV 格式是什么" | 初始化数据时 |
| `references/tools-openapi.md` | 解决"怎么调用工具" | 调用 MCP 工具时 |
| `references/field-optimization-guide.md` | 解决"怎么改数据" | 执行优化时 |
| `references/optimize-preview-html.md` | 解决"怎么给用户看" | **生成预览时必须阅读** |
| `references/execution-protocol.md` | 解决"执行顺序是什么" | **执行 Step 2/3 时必须阅读** |
| `references/product-score-rules.md` | 解决"质量分怎么算" | 查询质量分时 |

---

## 核心规则（不可跳过）

1. **自动判定场景**：Agent 接收输入后应根据是否含 `productId` 判定场景：
  - 有 `productId`：**存量品治理**，接收本地 CSV 文件（圈品结果）
  - 无 `productId` + 有图片：**新发品优化**，Agent 手动构建本地 CSV
2. **本地 CSV 是核心中间产物**：无论何种场景，Agent 必须将待优化数据转为标准 CSV 格式（详见 `references/csv-schema.md`）。存量模式下接收本地 CSV 文件；新发品场景中，`productId` 为空（传 `null`），**严禁构造虚拟 ID**，但 `absSummImageUrl` 必须包含图片 URL。CSV 中新增 `generalProductId`（通用商品 ID）列，与 `productId`、`absSummImageUrl` 同级。
3. **商品 ID 渲染规则**：在所有面向用户的预览、发布结果等展示场景中，商品 ID 的渲染遵循以下优先级：**当 `productId` 有值时优先渲染 `productId`，否则渲染 `generalProductId`**。**⚠️ `productId` 与 `generalProductId` 是独立字段，数据语义不相通，严禁将 `generalProductId` 的值填入 `productId` 字段，也严禁将 `productId` 的值填入 `generalProductId` 字段。此规则仅用于展示层面的 fallback，不代表两者可以互相替代。**
4. **CSV 列名不可变更，列位置动态解析**：CSV 中间产物的列名是前后端约定的协议，**不可修改列名**。但列的顺序**不固定**，Agent 读取 CSV 时必须先解析第一行表头，通过列名动态定位数据列，**禁止硬编码列序号**。优化操作只能写入 `after.*` 列，`before.*` 列为只读原始值。完整表头定义见 `references/csv-schema.md`。
5. **所有优化均通过远程工具完成**：无论 `AI_SUGGEST` 还是 `USER_PROMPT` 场景，都通过调用批量优化工具（`create_ggs_batch_optimize_main_task` + `submit_ggs_batch_optimize_detail` + `query_ggs_batch_optimize_result`）完成，Agent **不在本地执行任何优化逻辑**。`AI_SUGGEST` 由后端 AI 模型自动推荐优化值；`USER_PROMPT` 由后端 AI 模型根据用户指令执行优化。新发品场景**强制使用 AI_SUGGEST 模式**，通过图片识别定价/标题。
6. **所有字段均支持 AI_SUGGEST**：现在所有字段（包括 Title、Description 等）都支持 `AI_SUGGEST` 策略。当用户只说"优化 XX"但**未给出具体修改指令**时，默认走 `AI_SUGGEST` 策略；如果用户给出了具体指令（如"标题加上品牌名""价格降低 10%"），则走 `USER_PROMPT` 策略。**⚠️ 图片（IMAGE）字段除外**，图片优化不通过批量优化工具处理，详见下方第 19 条规则。
7. **策略选择规则**：详见 `references/field-optimization-guide.md` 中的字段列表，其中定义了每个字段支持的策略。
8. **属性和物流模板查询由后端自动完成**：属性候选项查询（`listGlobalCategoryAttributes`、`queryAttributeValueList`）和物流模板查询（`querySimplifyFreightTemplate`）均由后端在优化过程中自动调用，Agent **无需单独调用这些工具**。
9. **发布前必须双重确认**：调用发布工具前，必须让用户明确表达两点：① 已知悉批量写回线上的影响与风险；② 确认执行发布。仅凭口头"发布"不可直接调用。
10. **发布限制**：**新发品场景不执行 Step 3 发布动作**。仅在预览后提供 CSV 下载。
11. **⚠️ 搬品/新发品场景路由（HARD RULE）**：当 CSV 中商品的 `generalProductId` 有值时，说明当前处于搬品或新发品场景。Agent 在进入 Step 2 批量优化前，**必须先读取 `references/migration-optimization-presets.md`**，按该文件定义的预设规则构造 actions、选择策略、执行特殊约束（包括：策略统一为 `AI_SUGGEST`、首次必做 10 项优化、最小必要 4 项优化、禁止查询 PIS 分、价格类型校正等）。**不读取该文件直接执行优化视为流程错误。**
12. **所有工具均通过 MCP 调用**：本 Skill 涉及的所有工具（批量优化工具 `create_ggs_batch_optimize_main_task`/`submit_ggs_batch_optimize_detail`/`query_ggs_batch_optimize_result`、`apply_governance` 发布、`query_product_score` 查询质量分）均通过 **MCP 工具调用**方式执行，Agent 直接调用对应的 MCP 工具并传入参数即可，**不再有任何 HTTP POST 请求**。各工具的参数定义见 `references/tools-openapi.md`。
13. **语言适配**：Agent 所有面向用户的输出（对话回复、确认提示、预览文案、错误提示等）**必须使用用户当前使用的语言**。如果用户用英文提问则用英文回复，用中文提问则用中文回复，以此类推。本文件中出现的中文示例文案仅作为语义参考，实际输出时必须翻译为用户的语言。
14. **⚠️ 负向优化绝对拦截**：Agent 在写入 `after` 列前，**必须执行数值逻辑校验**。若 AI_SUGGEST 返回的价格、MOQ 或交期比 `before` 更差（价格更高、MOQ 更大、交期更长），**严禁写入 `after` 列**，且必须在预览中告知用户"当前值优于 AI 建议值，无需调整"。

15. **执行进度输出**：在执行每一步操作时，Agent 必须向用户输出当前正在做什么、准备做什么，以缓解用户的等待焦虑。例如：
   - 创建优化任务前：输出"正在为您创建批量优化任务，请稍候..."
   - 提交商品明细时：输出"正在提交商品数据..."（**不带具体商品数**）
   - 轮询优化结果时：输出"正在查询优化结果，请稍等..."
   - 查询质量分时：输出"正在计算优化后的商品质量分..."
   - 生成预览时：输出"正在生成优化预览..."
   
   **⚠️ 反向约束**：进度文案中**不得包含执行体量**（商品总数、批次数、每批个数、预计耗时等）。商品数等元数据应仅写入本地 task description，由进度面板透出，不在对话中刷屏。

16. **执行前确认范围克制**：批量优化执行前，仅就「优化字段范围」与用户确认一次，**严禁向用户暴露执行体量**（如商品数、批次数、预计耗时、并发数等内部执行细节）。
   - ✅ 允许告知：将优化哪些字段、是否动价格/图片等业务决策项
   - ❌ 禁止告知：商品总数、批次数、每批多少个、预计耗时、轮询间隔等执行参数
   - **理由**：体量与执行节奏属于 Agent 内部调度问题，用户关心的是业务影响（改什么、动不动价），暴露执行细节会让用户产生不必要的决策负担和等待焦虑。

17. **思考过程打印**：在执行每一步操作时，Agent **必须打印思考过程**，说明当前为什么选择执行这一步、参数为什么选择这么传，方便后续排查。例如：
   - 创建优化任务前：打印"选择调用 create_ggs_batch_optimize_main_task 工具，因为需要创建批量优化任务。参数 total 设置为 10，因为 CSV 中有 10 个商品。参数 actions 设置为 [{'field': 'TITLE', 'strategy': 'AI_SUGGEST'}]，因为用户要求优化标题。"
   - 提交商品明细时：打印"选择调用 submit_ggs_batch_optimize_detail 工具，因为任务已创建，需要提交商品数据。参数 taskId 设置为 'xxx'，这是上一步创建任务时返回的 ID。参数 productInfo 包含 10 个商品记录，每个记录都包含完整的 before 对象。"

18. **⚠️ 输出完整性（HARD RULE）**：思考过程通常会被 UI 隐藏，用户**看不到**思考内容。因此，Agent 最终给用户的输出**必须是完整的、自包含的**，包含用户理解当前状态所需的全部信息。**严禁**将关键结论（如优化结果、质量分变化、文件路径、下一步操作建议等）仅放在思考过程中而不在最终输出中体现。
   - ✅ 正确：思考过程中分析推理，最终输出中给出完整结论（如"已优化 10 个商品的标题，优化前后对比如下..."）
   - ❌ 错误：思考过程中输出了"优化完成，共 10 个商品"，但最终输出只说"优化已完成"，用户看不到具体结果
   - 轮询优化结果时：打印"选择调用 query_ggs_batch_optimize_result 工具，因为需要查询优化结果。参数 taskId 设置为 'xxx'，这是任务 ID。参数 pageNo 设置为 1，pageSize 设置为 10，因为需要获取第一页的 10 条记录。"

18. **质量分查询强制规则 & 反幻觉硬约束**：Step 2 优化完成后，**必须**对每个被优化的商品调用 `query_product_score` 工具查询质量分，并将结果写入 CSV 的 `after.pis` 列。
   - **⚠️ 反幻觉硬约束（HARD RULE）**：**质量分数值只能来自 `query_product_score` 工具的真实返回值 `data.finalScore`，严禁在任何场景下预估、推算、编造质量分**。具体禁止行为包括但不限于：
     - ❌ 在对话中口头预估分数（如"优化后预计质量分可以从 3 分提升到 5 分"）
     - ❌ 在预览中展示未经接口查询的分数
     - ❌ 在 CSV 的 `after.pis` 列写入硬编码数字、注释为"模拟值"等
     - ❌ 根据优化规则或评分规则自行推算分数
     - ✅ **唯一合法来源**：调用 `query_product_score` 工具后，从返回值 `data.finalScore` 中获取
   - **未调用接口前的正确做法**：如果尚未调用 `query_product_score`，在对话中应说"优化完成后我会为您查询最新的质量分"，**绝不能给出任何具体数字**
   - **⚠️ 豁免条件**：当商品的 `generalProductId` 有值时（搬品/新发品场景），该商品尚未发布到国际站，不存在线上记录，调用 `query_product_score` 必定失败。此时必须跳过质量分查询，不写入 `after.pis`，预览中也不展示 PIS 信息
   - **⚠️ Payload 工程化构造规则（HARD RULE）**：**严禁手动拼接 `query_product_score` 的请求参数**。必须使用 `./scripts/build_product_score_payload.py` 脚本从 CSV 中间产物自动构造 payload，确保字段名、嵌套结构、类型转换的准确性。具体调用方式：
     - **禁止用 shell `$()` 或 heredoc 传递含换行的 payload** — 真实 `\n` 在变量传递中会损坏 JSON。必须用 Python `subprocess(args=[...])` 数组传参。
     - **为所有有效商品生成 payload**：`python3 scripts/build_product_score_payload.py <csv_path>`
     - **为指定行生成 payload**：`python3 scripts/build_product_score_payload.py <csv_path> --row <行号>`（行号从 1 开始，不含表头）
     - 脚本固定读取 `after.*` 列数据，`after.*` 为空的字段不写入 payload（后端自动用线上原始值补全）
     - `productId` 从 CSV 的 `productId` 列自动获取，始终写入
     - 脚本会自动跳过 `isExcluded=true`、`generalProductId` 有值、`productId` 为空的商品
     - 脚本输出 JSON 到 stdout，Agent 应捕获输出并直接作为 `query_product_score` 的请求体使用

19. **预览完整性规则**：生成的 MD 预览文件必须包含**所有**优化过的商品，不得省略或截断。对话框中展示的预览可以限制数量（如前 10 个），但 MD 文件必须完整。

20. **迭代优化规则**：当用户指定了目标质量分（`targetScore`）时，必须执行迭代优化循环：
   - 逐商品对比 `after.pis` 与 `targetScore`
   - 未达标→读取 `scoreDetails` 中 `false` 项，分析原因
   - **Agent 可处理的项**（title/description/properties/leadTime等）→ 自动发起新一轮优化
   - **需用户提供数据的项**（price为空、主图不足等）→ 明确告知用户缺什么
   - 终止条件：全部达标 / 连续3轮无提升 / 已迭代3轮
   - 放弃时如实说明当前分数、未达标原因，不伪造结果

21. **MCP 工具参数规范**：调用 MCP 工具时，必须严格按照 `references/tools-openapi.md` 中定义的参数格式传入。特别是分页参数：`pageNo` 必须从 1 开始，`pageSize` 必须大于 0。调用前必须自检参数是否正确。

22. **⚠️ 中间产物命名隔离规则（HARD RULE）**：本 Skill 产生的所有中间产物（CSV 文件、MD 预览文件、JSON 结果文件、脚本等）的文件名**必须包含当前会话的唯一标识符（`sessionId`）**，确保不同会话之间的中间产物互不干扰。
   - **命名格式**：`<用途描述>_<sessionId>_<timestamp>.<扩展名>`
   - **示例**：
     - CSV 文件：`optimization_result_sess7a3b_20260421_1830.csv`
     - MD 预览文件：`optimization_preview_sess7a3b_20260421_1830.md`
     - JSON 结果文件：`optimize_result_sess7a3b.json`
     - 发布结果文件：`publish_result_sess7a3b_20260421_1900.md`
   - **sessionId 获取**：使用当前会话 ID 的前 8 位（或其他可区分的唯一片段）作为 `sessionId`。如果无法获取会话 ID，则使用随机生成的 8 位字符串
   - **⚠️ 禁止行为**：
     - ❌ 使用不含 `sessionId` 的通用文件名（如 `optimization_result.csv`、`preview.md`）
     - ❌ 在新会话中读取或引用旧会话产生的中间产物文件
   - **目的**：避免新会话误读旧会话的中间产物，导致数据错乱或使用过期数据

23. **⚠️ 图片优化委托规则（IMAGE 字段特殊处理）**：图片优化**不通过批量优化工具**（`create_ggs_batch_optimize_main_task` + `submit_ggs_batch_optimize_detail`）处理，而是**通过 Sub Agent 唤起 `alibaba-global-ai-image-studio` Skill** 单独执行。具体规则如下：
   - **拆分 actions**：当用户的优化任务同时包含图片和其他字段时，将 `IMAGE` 从 `actions` 数组中拆出。其余字段（如 `TITLE`、`DESCRIPTION`、`PRICE` 等）正常走批量优化工具，图片通过 Sub Agent 唤起 `alibaba-global-ai-image-studio` 处理。**两者并行执行**，互不阻塞。
   - **默认能力**：当用户说"优化图片"但未指定具体操作时，默认使用 `alibaba-global-ai-image-studio` 的「一键智能优化 (intelligent-optimization)」能力。
   - **图片回写规则**：
     - **优化图片**（如"优化图片"、"提升图片质量"等）：用 `alibaba-global-ai-image-studio` 返回的图片 URL **替换** CSV 中 `after.images` 的原有列表
     - **生成图片**（如"生成场景图"、"生成模特图"、"加个白底图"等）：将 `alibaba-global-ai-image-studio` 返回的图片 URL **追加**到 CSV 中 `after.images` 的原有列表末尾
   - **禁止行为**：禁止将 `IMAGE` 作为 `field` 传入批量优化工具的 `actions` 数组。详见 `references/actions-and-presets.md`。

## 🛠 执行协议 (Execution Protocol) - 重要！

**1. 超时参数注入 (Timeout Parameter Injection):**
   - ⚠️ **强制要求**：本 Skill 涉及的所有 MCP 工具调用均为长耗时操作（批量优化、发布、查询质量分），**每个 MCP 工具调用的超时时间为 600s（10 分钟）**。Agent 在调用 MCP 工具时需确保超时设置不低于 600s。
   - **禁止行为**：禁止使用默认的短超时（如 120s）调用本 Skill 的 MCP 工具，否则可能导致长耗时操作被中断。

**2. 逻辑闭环校验 (Logic Sanity Check):**
   - ⚠️ **强制要求**：在展示预览前，Agent **必须自问**：这次优化是否真的提升了商品竞争力？
   - **校验项**：
     - 若 PIS 分数下降，应重新检查 `after` 数据（**豁免：`generalProductId` 有值时跳过 PIS 校验**）
     - 若核心指标变差（价格升高、MOQ 增大、交期延长），应重新检查 `after` 数据
     - 若发现异常，**禁止展示预览**，需重新执行优化或向用户说明情况

## Step 1：数据初始化（接收 CSV 或 JSON 转化）

### 存量模式（接收 CSV）

- **Input**：本地 CSV 文件（圈品结果，由 `alibaba-global-product-select` 生成）
- **Action**：Agent 读取本地 CSV 文件，按 `references/csv-schema.md` 定义的表头字段解析
- **Output**：解析后的商品数据，作为后续 Step 2 的输入

### 新发品模式（JSON 转化）

- **Input**：用户提供的商品信息 JSON 数组（含 `images` 属性）。
- **Action**：Agent 在本地工作目录创建一个初始化 CSV。
  - **字段映射规则**：
    - `json.images` (JSON 字符串) -> `before.images`(字符串数组)
    - `json.title` -> `before.title`
    - `json.price` -> `before.price`
  - 其他 CSV 列字段中未提供的部分填充为 `null`。
- **Output**：生成的本地初始化 CSV，作为后续 Step 2 的输入。

## Step 2：批量优化 (Mandatory)

### ⚠️ 执行前确认协议（Pre-Execution Confirmation）

进入 Step 2 前，与用户的最后一次确认**只能涉及业务决策项**：

| 允许确认 | 禁止确认 |
|---------|---------|
| 优化哪些字段（标题/描述/属性/关键词等） | 商品总数 |

确认后立即进入执行流程，不再就执行体量做二次确认。

### 协议嵌入 (Protocol Enforcement)

**在生成任何预览之前，必须调用 read 工具读取 `references/optimize-preview-html.md`。禁止使用基础 Markdown 表格，必须严格执行协议中的 HTML 渲染要求。**

**禁止对 PIS（质量分）进行任何形式的预估。展示 PIS 前，必须调用 `query_product_score` 工具获取实时结果。未获取真实分数的预览视为无效交付。**

> **⚠️ 强制动作 1**：执行优化前，必须先 Read `references/field-optimization-guide.md` 确认字段优化规则和 actions 枚举。
> **⚠️ 强制动作 2**：若 CSV 中存在 `generalProductId` 有值的商品（搬品/新发品场景），必须先 Read `references/migration-optimization-presets.md` 确认该场景的预设 actions、策略约束和特殊规则。
> **⚠️ 强制动作 3**：生成预览前，必须先 Read `references/optimize-preview-html.md` 确认 HTML 渲染规范。
> **⚠️ 强制动作 4**：必须调用 `query_product_score` 获取测算分，严禁人工预估 PIS。
> **⚠️ 强制动作 5**：调用 `query_product_score` 前，**必须先通过 `launch-process` 执行 `scripts/build_product_score_payload.py` 脚本构造请求 payload**，严禁手动拼接参数。脚本输出的 JSON 即为工具调用的请求体，Agent 直接使用，不得修改字段名或结构。
> **⚠️ 强制动作 6**：构造 `submit_ggs_batch_optimize_detail` 或通过 alibaba-global-product-publish Skill 的 `publish_ggs_migration_product` 接口发布的 `productInfo`/`record` 参数前，必须先阅读本文件末尾的「ProductSnapshotDTO 完整结构参考」章节，确认 ProductSnapshotDTO 的完整字段结构、嵌套类型和格式约束。
> **⚠️ 输出要求**：严禁仅使用基础 Markdown 表格，必须按协议使用卡片式 HTML 布局。

> **各字段的 CSV 列名映射、actions field 枚举、字段优化优先级见 `references/field-optimization-guide.md`。** 所有优化规则（格式要求、调整策略、联动规则等）均由后端工具内部实现，Agent 无需了解具体的优化逻辑。

所有优化均通过调用远程批量优化工具（`create_ggs_batch_optimize_main_task` + `submit_ggs_batch_optimize_detail` + `query_ggs_batch_optimize_result`）完成，Agent **不在本地执行任何优化逻辑**。

> **策略选择规则**：详见 `references/field-optimization-guide.md` 中的字段列表，其中定义了每个字段支持的策略（AI_SUGGEST / USER_PROMPT）。

### 统一调用流程

> **批量优化调用流程**：详见 `references/tools-openapi.md` 中的批量优化工具定义（`create_ggs_batch_optimize_main_task`、`submit_ggs_batch_optimize_detail`、`query_ggs_batch_optimize_result`）。

### 异步任务后台轮询与面板反馈规则

> **完整的轮询规则详见 `references/tools-openapi.md` 中的「异步任务后台轮询与面板反馈规则」章节。** 包括任务创建、后台轮询（建议通过 Sub Agent 方式执行）、面板反馈、自动完结与后续处理的完整流程。
>
> **⚠️ 关键流程**：当所有商品状态变为 `SUCCESS` 或 `FAILED` 时，必须严格按以下顺序执行：**① 删除 `cron` 任务** → **② 保存优化结果并写入 CSV** → **③ 重读 `SKILL.md` 获取最新规范** → **④ 按规范决策并执行后续强制动作**。


> **AI_SUGGEST 价格调整规则**：详见 `references/field-optimization-guide.md` 中的「AI_SUGGEST 价格调整规则」章节。

> **字段优化优先级**：详见 `references/field-optimization-guide.md` 中的字段优化优先级章节。

### ⚠️ Step 2 完成后的四个强制动作（不可跳过）

无论是 `AI_SUGGEST` 还是 `USER_PROMPT` 场景，优化执行完毕后，**必须依次完成以下四个动作**，缺一不可：

> **四个强制动作详情**：详见 `references/execution-protocol.md` 中的"Step 2 强制动作"章节，包括：
> - 强制动作 1：将优化结果写入 CSV 的 `after.*` 列并保存
> - 强制动作 2：查询商品质量分（PIS）并写入 CSV（**⚠️ 当商品 `generalProductId` 有值时跳过此步骤**）
> - 强制动作 3：生成并保存本地预览文件
> - 强制动作 4：输出 Markdown 格式的 before/after 对比预览并提供文件链接

阶段 2 可多轮迭代——用户查看预览后可要求调整，**每次调整都必须重复执行上述四个强制动作**，确保用户每次都能看到最新的中间产物、质量分和预览结果。

### 可选：可视化审阅（用户要求查看或排除商品时提供）

> **可视化审阅详情**：详见 `references/execution-protocol.md` 中的"可视化审阅"章节。

## Step 3：后续处理（发布或导出）

> **Step 3 详情**：详见 `references/execution-protocol.md` 中的"Step 3 发布或导出"章节，包括：
> - 存量模式（发布）
> - 新发品模式（仅导出）
> - Step 3 完成后的强制动作

> **CSV 行数据到 ProductSandboxRecordDTO 的转换规则**：详见 `references/csv-schema.md` 中的"DTO 转换规则"章节。

## ProductSnapshotDTO 完整结构参考

本文档是 `ProductSnapshotDTO` 及其所有嵌套类型的**权威结构定义**，对齐 Java 类 `com.alibaba.ggs.nurture.product.dto.agent.ProductSnapshotDTO`。所有构造 `before`/`after` 参数、`submit_ggs_batch_optimize_detail`、`apply_governance`、`publish_ggs_migration_product`、`query_product_score` 等工具调用时，**必须严格遵循本文档的字段名、类型和嵌套结构**。

---

## 类型层级总览

```
ProductSandboxRecordDTO                    // 沙盒记录（顶层）
 ├── productId: String                     // 商品 ID
 ├── generalProductId: String              // 通用商品 ID（搬品/新品场景有值）
 ├── absSummImageUrl: String               // 商品主图缩略图 URL
 ├── isExcluded: Boolean                   // 是否排除
 ├── status: String                        // 状态：PENDING / SUCCESS / FAILED
 ├── reason: String                        // 失败原因
 ├── before: ProductSnapshotDTO            // 优化前快照
 └── after: ProductSnapshotDTO             // 优化后快照

ProductSnapshotDTO                         // 商品快照
 ├── title: String
 ├── price: ProductPriceDTO                // ⬇️ 嵌套对象
 │    ├── priceType: String                // 枚举：sku / ladder / tiered / range / fixed
 │    ├── currency: String
 │    ├── skuPrices: SkuPriceItem[]
 │    │    ├── skuName: String
 │    │    ├── price: Double
 │    │    └── skuId: Long
 │    ├── ladderPrices: LadderPriceItem[]
 │    │    ├── minQuantity: Integer
 │    │    └── price: Double
 │    ├── minPrice: Double
 │    ├── maxPrice: Double
 │    └── fixedPrice: String
 ├── leadTime: QuantityTieredLeadTime[]    // ⬇️ 嵌套数组
 │    ├── quantity: Integer                // 数量档
 │    └── leadTime: Integer               // 交期天数
 ├── moq: Integer
 ├── unitWeight: Double
 ├── unitSize: String
 ├── shippingTemplate: ShippingTemplateDTO // ⬇️ 嵌套对象
 │    ├── id: Long
 │    └── name: String
 ├── category: CategoryDTO                // ⬇️ 嵌套对象
 │    ├── categoryId: Long
 │    └── categoryPath: String
 ├── description: String
 ├── properties: GlobalProductAttribute[] // ⬇️ 嵌套数组
 │    ├── attributeId: Long
 │    ├── attributeName: String
 │    ├── attributeValue: String
 │    └── attributeValueId: Long
 ├── images: String[]
 ├── inventory: String
 ├── pis: Double
 ├── keywords: String                     // JSON 数组字符串
 └── currencyCode: String
```

---

## 各类型字段详细说明

### ProductSandboxRecordDTO（顶层记录）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `productId` | String | 条件必填 | 商品 ID，字符串格式。存量商品必填；新发品/搬品场景商家未提供时传 `null`，**严禁构造虚拟 ID** |
| `generalProductId` | String | 否 | 通用商品 ID（搬品/新品场景有值，存量商品通常为空） |
| `absSummImageUrl` | String | 否 | 商品主图缩略图 URL |
| `isExcluded` | Boolean | 是 | 是否已被排除，默认 `false` |
| `status` | String | 否 | 状态枚举：`PENDING` / `SUCCESS` / `FAILED` |
| `reason` | String | 否 | 失败原因（仅 status=FAILED 时有值） |
| `before` | ProductSnapshotDTO | 是 | 优化前的商品快照，**必须完整传入所有有值字段** |
| `after` | ProductSnapshotDTO | 条件必填 | 优化后的商品快照（提交优化时可为空，发布时必须完整） |
| `isPotentialCompetitive` | Boolean | 否 | 是否为潜在趋势品。由后端在优化完成后自动填充（`query_ggs_batch_optimize_result` 返回），Agent **只读不写**。`true` 表示该商品经过优化后有机会成为趋势竞争力品 |

### ProductSnapshotDTO（商品快照）

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| `title` | String | 是 | 非空字符串 | 商品标题 |
| `price` | ProductPriceDTO | 是 | 嵌套对象，非字符串 | 商品价格，详见下文 |
| `leadTime` | QuantityTieredLeadTime[] | 是 | 嵌套数组，按 quantity 升序 | 阶梯交期 |
| `moq` | Integer | 是 | 正整数 | 最小起订量 |
| `unitWeight` | Double | 否 | 正数，单位：千克 | 单件毛重 |
| `unitSize` | String | 否 | 纯数字+`x`分隔，如 `"30x20x15"` | 包装尺寸（长x宽x高），**禁止包含 cm/mm 等单位后缀** |
| `shippingTemplate` | ShippingTemplateDTO | 否 | 嵌套对象，非字符串 | 物流模板 |
| `category` | CategoryDTO | 条件必填 | 嵌套对象，非字符串 | 类目信息，**发布时必须有值** |
| `description` | String | 否 | HTML 字符串，保留所有标签 | 商品描述 |
| `properties` | GlobalProductAttribute[] | 否 | 嵌套数组 | 商品属性列表 |
| `images` | String[] | 否 | URL 字符串数组 | 商品图片 URL 列表 |
| `inventory` | String | 否 | JSON 字符串，分 SKU/SPU 两种类型 | 库存信息（JSON 字符串），分为 SKU 库存和 SPU 库存两种类型。SKU 类型含 skuInventories 数组，每项含 skuId 和 items；SPU 类型含 items 数组。每个 item 含 dispatchLocation、warehouseCode（可选）、quantity |
| `pis` | Double | 否 | 0-6 分 | 商品质量分 |
| `keywords` | String | 否 | **必须为 JSON 数组格式字符串** | 关键词，如 `"[\"keyword1\",\"keyword2\"]"`，**禁止传纯文本** |
| `currencyCode` | String | 否 | ISO 4217 货币代码 | 币种，如 `"USD"` |

### ProductPriceDTO（价格对象）

**priceType 为必填字段，必须为小写枚举值。** 根据 priceType 不同，选用对应的价格字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `priceType` | String | **是** | **必填**，枚举值（**小写**）：`sku` / `ladder` / `tiered` / `range` / `fixed` |
| `currency` | String | 是 | 币种，如 `"USD"` |
| `skuPrices` | SkuPriceItem[] | priceType=`sku` 时必填 | SKU 价格列表 |
| `ladderPrices` | LadderPriceItem[] | priceType=`ladder`/`tiered` 时必填 | 阶梯价格列表 |
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

### SkuPriceItem（SKU 价格子项）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `skuName` | String | 是 | SKU 名称，如 `"Xxs, Red"` |
| `price` | Double | 是 | SKU 单价 |
| `skuId` | Long | 是 | SKU ID |

### LadderPriceItem（阶梯价格子项）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `minQuantity` | Integer | 是 | 起始数量档 |
| `price` | Double | 是 | 对应价格 |

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

---

## 常见错误与正确对照

### 错误 1：leadTime 使用废弃字段名

```json
// ❌ 错误 — 使用了废弃字段名
"leadTime": [
  {"quantityFrom": 1, "quantityTo": 99, "leadTimeFrom": 5, "leadTimeTo": 7}
]

// ✅ 正确 — 只用 quantity 和 leadTime
"leadTime": [
  {"quantity": 1, "leadTime": 5},
  {"quantity": 100, "leadTime": 7}
]
```

### 错误 2：priceType 使用大写或缺失

```json
// ❌ 错误 — priceType 使用大写
"price": {
  "priceType": "SKU",
  ...
}

// ❌ 错误 — priceType 缺失
"price": {
  "currency": "USD",
  "skuPrices": [...]
}

// ✅ 正确 — priceType 小写且必填
"price": {
  "priceType": "sku",
  "currency": "USD",
  "skuPrices": [...]
}
```

### 错误 3：keywords 传纯文本

```json
// ❌ 错误 — 传纯文本
"keywords": "cotton shirt men casual"

// ❌ 错误 — 传 JSON 数组对象（非字符串）
"keywords": ["cotton", "shirt", "men"]

// ✅ 正确 — JSON 数组格式的字符串
"keywords": "[\"cotton\",\"shirt\",\"men\",\"casual\"]"
```

### 错误 4：unitSize 包含单位后缀

```json
// ❌ 错误 — 包含 cm 单位
"unitSize": "30x20x15cm"

// ✅ 正确 — 纯数字 + x
"unitSize": "30x20x15"
```

### 错误 5：嵌套对象传为字符串

```json
// ❌ 错误 — shippingTemplate 传为字符串
"shippingTemplate": "{\"id\": 100001, \"name\": \"Standard\"}"

// ✅ 正确 — shippingTemplate 传为 JSON 对象
"shippingTemplate": {
  "id": 100001,
  "name": "Standard"
}
```

### 错误 6：before 对象省略字段

```json
// ❌ 错误 — before 只传了部分字段
"before": {
  "title": "Some Title",
  "price": {...}
}

// ✅ 正确 — before 必须传入 CSV 中有值的所有字段
"before": {
  "title": "...",
  "price": {...},
  "leadTime": [...],
  "moq": 2,
  "unitWeight": 0.5,
  "unitSize": "10x10x10",
  "shippingTemplate": {...},
  "category": {...},
  "description": "...",
  "properties": [...],
  "images": [...],
  "inventory": "...",
  "pis": 3.5,
  "keywords": "[...]",
  "currencyCode": "USD"
}
```

---

## 完整 JSON 样例

### 样例 1：SKU 定价商品的完整 ProductSandboxRecordDTO

```json
{
  "productId": "1601653380590",
  "generalProductId": "",
  "absSummImageUrl": "https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J.png_100x100.png",
  "isExcluded": false,
  "status": "",
  "reason": "",
  "before": {
    "title": "Test 100% Cotton Anti-Wrinkle Casual Regular Fit Printed Shirt",
    "price": {
      "priceType": "sku",
      "currency": "USD",
      "skuPrices": [
        {"skuName": "Xxs, Red", "price": 0.9, "skuId": 107473546692},
        {"skuName": "M, Lavender", "price": 1.8, "skuId": 107869507058},
        {"skuName": "Xxs, Lavender", "price": 1.8, "skuId": 107869507057},
        {"skuName": "M, Red", "price": 0.9, "skuId": 107869507056}
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
    "shippingTemplate": {
      "id": 2106539053,
      "name": "12121122"
    },
    "category": {
      "categoryId": 127734143,
      "categoryPath": "Apparel & Accessories > Men's Clothing > Men's T-Shirts"
    },
    "description": "High quality 100% cotton shirt with anti-wrinkle technology.",
    "properties": [
      {"attributeId": 191284014, "attributeName": "Material", "attributeValue": "100% Cotton", "attributeValueId": 26389775},
      {"attributeId": 191284183, "attributeName": "Sleeve Style", "attributeValue": "Long Sleeve", "attributeValueId": 12373461},
      {"attributeId": 200000277, "attributeName": "Fit Type", "attributeValue": "Regular Fit", "attributeValueId": 18110138}
    ],
    "images": [
      "https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J.png"
    ],
    "inventory": "{\"dispatchLocation\":\"CN\",\"quantity\":1000}",
    "pis": 2.3,
    "keywords": "[\"cotton shirt men casual printed anti-wrinkle\"]",
    "currencyCode": "USD"
  },
  "after": {
    "title": "Men's Cotton Printed Casual Shirt Long Sleeve Regular Fit Anti-Wrinkle",
    "price": {
      "priceType": "sku",
      "currency": "USD",
      "skuPrices": [
        {"skuName": "Xxs, Red", "price": 0.85, "skuId": 107473546692},
        {"skuName": "M, Lavender", "price": 1.75, "skuId": 107869507058},
        {"skuName": "Xxs, Lavender", "price": 1.75, "skuId": 107869507057},
        {"skuName": "M, Red", "price": 0.85, "skuId": 107869507056}
      ],
      "ladderPrices": [],
      "minPrice": 0,
      "maxPrice": 0,
      "fixedPrice": ""
    },
    "leadTime": [
      {"quantity": 1, "leadTime": 5},
      {"quantity": 100, "leadTime": 7}
    ],
    "moq": 1,
    "unitWeight": 0.45,
    "unitSize": "10x10x10",
    "shippingTemplate": {
      "id": 2106539053,
      "name": "12121122"
    },
    "category": {
      "categoryId": 127734143,
      "categoryPath": "Apparel & Accessories > Men's Clothing > Men's T-Shirts"
    },
    "description": "<div>Premium 100% cotton shirt with anti-wrinkle technology.</div>",
    "properties": [
      {"attributeId": 191284014, "attributeName": "Material", "attributeValue": "100% Cotton", "attributeValueId": 26389775},
      {"attributeId": 191284183, "attributeName": "Sleeve Style", "attributeValue": "Long Sleeve", "attributeValueId": 12373461},
      {"attributeId": 200000277, "attributeName": "Fit Type", "attributeValue": "Regular Fit", "attributeValueId": 18110138}
    ],
    "images": [
      "https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J.png"
    ],
    "inventory": "{\"dispatchLocation\":\"CN\",\"quantity\":1000}",
    "pis": 4.5,
    "keywords": "[\"men cotton shirt casual printed anti-wrinkle long sleeve\"]",
    "currencyCode": "USD"
  }
}
```

### 样例 2：阶梯价定价（priceType = "ladder"）

```json
{
  "price": {
    "priceType": "ladder",
    "currency": "USD",
    "skuPrices": [],
    "ladderPrices": [
      {"minQuantity": 1, "price": 12.50},
      {"minQuantity": 100, "price": 10.00},
      {"minQuantity": 500, "price": 8.50}
    ],
    "minPrice": 0,
    "maxPrice": 0,
    "fixedPrice": ""
  }
}
```

### 样例 3：区间价定价（priceType = "range"）

```json
{
  "price": {
    "priceType": "range",
    "currency": "USD",
    "skuPrices": [],
    "ladderPrices": [],
    "minPrice": 5.00,
    "maxPrice": 15.00,
    "fixedPrice": ""
  }
}
```

### 样例 4：固定价定价（priceType = "fixed"）

```json
{
  "price": {
    "priceType": "fixed",
    "currency": "USD",
    "skuPrices": [],
    "ladderPrices": [],
    "minPrice": 0,
    "maxPrice": 0,
    "fixedPrice": "9.99"
  }
}
```

### 样例 5：query_product_score 的扁平化请求体

注意：`query_product_score` 的请求体是**扁平的 ProductSnapshotDTO + productId**，不嵌套在 `before`/`after` 中。

```json
{
  "productId": "1601653380590",
  "title": "Men's Cotton Printed Casual Shirt",
  "price": {
    "priceType": "sku",
    "currency": "USD",
    "skuPrices": [
      {"skuName": "Xxs, Red", "price": 0.85, "skuId": 107473546692}
    ],
    "ladderPrices": [],
    "minPrice": 0,
    "maxPrice": 0,
    "fixedPrice": ""
  },
  "leadTime": [
    {"quantity": 1, "leadTime": 5},
    {"quantity": 100, "leadTime": 7}
  ],
  "moq": 1,
  "unitWeight": 0.45,
  "unitSize": "10x10x10",
  "shippingTemplate": {
    "id": 2106539053,
    "name": "12121122"
  },
  "category": {
    "categoryId": 127734143,
    "categoryPath": "Apparel & Accessories > Men's Clothing > Men's T-Shirts"
  },
  "description": "<div>Premium cotton shirt.</div>",
  "properties": [
    {"attributeId": 191284014, "attributeName": "Material", "attributeValue": "100% Cotton", "attributeValueId": 26389775}
  ],
  "images": ["https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J.png"],
  "pis": 4.5,
  "keywords": "[\"cotton\",\"shirt\",\"men\"]",
  "currencyCode": "USD"
}
```

## Dependencies

- **工具**：批量优化工具（`create_ggs_batch_optimize_main_task`、`submit_ggs_batch_optimize_detail`、`query_ggs_batch_optimize_result`，支持 AI_SUGGEST 和 USER_PROMPT 两种策略）、`query_product_score`（查询质量分）。**所有工具均通过 MCP 方式调用**，完整的参数定义、请求/响应格式见 `references/tools-openapi.md`，跨平台移植时按该文件注册工具即可。属性查询和物流模板查询已由后端在优化过程中自动完成，Agent 无需单独调用
- **Skill 依赖**：商品发布需依赖 `alibaba-global-product-publish` Skill，通过其 `publish_ggs_migration_product` 接口执行发布操作。发布时需遵循"编辑模式：before 传完整快照，after 传优化后快照（未优化字段设 null）"的规则。
- **本地能力**：Agent 客户端需具备 CSV 文件读写、按条件筛选和分批的能力
- **数据**：实时候选量、预览行内容等均由工具返回，不写入 Skill 正文

## Next Steps（按需阅读）

| 主题                                                                    | 文件 |
|-----------------------------------------------------------------------|------|
| CSV 中间产物的固定表头格式与字段说明                                                  | `references/csv-schema.md` |
| 三个 MCP 工具的参数定义、请求/响应格式                                                | `references/tools-openapi.md` |
| `actions` 字段枚举与 `strategy` 说明                                         | `references/actions-and-presets.md` |
| 各字段的 CSV 列映射、数据格式说明、字段优化优先级、综合场景：转交易品（RTS）、价格力、服务力、趋势力、竞争力、质量分、无曝光品优化 | `references/field-optimization-guide.md` |
| **搬品/新发品场景的优化预设规则**（预设 actions、策略约束、价格校正、PIS 豁免等）                     | **`references/migration-optimization-presets.md`** |
| 优化预览 Markdown 渲染规范（before/after 对比，可嵌入 HTML 标签）                       | `references/optimize-preview-html.md` |
| 发布成功后的结果卡片 JSON 协议                                                    | `references/publish-result-file-reference.md` |
| 商品质量分评分规则（基础分、加分项、不同国家/地区规则）                                          | `references/product-score-rules.md` |

---

## 执行自检 (Self-Check)

**在输出预览前，必须检查以下项目：**

- [ ] 预览是否使用了 `optimize-preview-html.md` 定义的 HTML 卡片样式？
- [ ] **（搬品/新发品场景）预览是否包含 before/after 双栏对比？是否错误复用了仅展示 before 的解析预览脚本（如 `alibaba-global-product-migration-executor/scripts/render_parsed_csv_preview.py`）？**
- [ ] 阶梯价格是否按协议进行了 HTML 转换而非展示原始 JSON？
- [ ] 物流模板是否提取了 `name` 字段而非展示完整 JSON？
- [ ] 属性是否逐个换行展示而非展示原始 JSON？
- [ ] 是否在本地生成了对应的 `.md` 和 `.csv` 文件？
- [ ] 是否在对话中提供了文件链接？
- [ ] 是否查询了每个优化商品的质量分（PIS）？（**豁免：`generalProductId` 有值的商品跳过 PIS 查询**）
- [ ] 是否按 `execution-protocol.md` 的顺序执行了四个强制动作？
- [ ] 是否禁止了任何形式的预测、估算、占位或伪造质量分？
- [ ] 当用户指定了目标质量分时，是否执行了迭代优化循环？
