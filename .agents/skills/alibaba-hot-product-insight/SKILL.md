---
name: 热销爆品洞察
version: "1.0.0"
description: |
  多平台热销品洞察。支持阿里国际站、Amazon、Temu、SHEIN、TikTok Shop、Shopee、1688 等。
  适用查询示例：
  - "当前阿里国际站什么最火？"
  - "亚马逊上最热卖的瑜伽垫有哪些？"
  - "Temu上智能手机哪些规格最热卖"
  - "TikTok Shop上什么美妆最火"
  - "SHEIN美妆爆品有哪些？"
workflow: |
  Step 1: 判断平台 → 决定唯一数据路径
  Step 2: 读取对应路径的 reference 文件并执行
  Step 3: 输出报告
enabled: true
---

# 多平台热品洞察

> ★ **完整报告写入以报告标题为文件名的 .md 文件，对话中仅输出 summary + 追问段。** summary 须包含：报告标题 + 文件路径 + 报告中 关键数据发现（如 Top 产品亮点、竞争格局要点、价格带分布等核心结论）。禁止在对话中输出完整报告内容。
> ★ **交付单元绑定（解决追问段丢失）**：本 skill 的「交付正文 = summary + 追问段」是一个**不可分割的整体**。无论以何种形式封装结果（如被 skill-executor 包装为 `delivery` 字段透传），追问段都**必须与 summary 一起完整放入透传内容**，不得拆分、不得只透传 summary 而把追问段留在自由正文里。若封装为结构化 `delivery` 字段，该字段必须同时包含 summary 与追问段两部分。
> ★ **目标 3 分钟内完成。**
> ★ **禁止搜索 workctl / accio-mcp-cli 工具或二进制路径**——所有可用命令和参数已在 references/ 中列出。如果不确定命令名或参数，先读对应的 reference 文件，不要搜索。两者都 command not found 时，走降级路径，不要搜索文件系统。
> ★ **禁止自己写 python/bash 脚本**——数据处理已由 `scripts/` 下的预置脚本完成，不需要额外脚本。
> ★ **禁止用 head/cat/ls/grep/find/glob/list 探测文件或目录结构**——references/ 和 scripts/ 中的命令直接复制执行，不需要预检。
> ★ **禁止创建 /tmp 临时文件**——数据直接从脚本 stdout 或 tool_call 返回获取。
> ★ **禁止创建 Task**——本 skill 是单轮执行，3 分钟内完成。
> ★ **禁止读取其他 skill 的文件**——本 skill 的所有依赖已在 `references/` 和 `scripts/` 中自包含。
> ★ **禁止编造任何数据**——产品名称、价格、评分、URL、图片地址、日期、ID 必须来自工具返回的原始数据。无数据时写 `-` 或省略该列。即使用户明确要求某数据字段（如上架时间、自定义指标），如果工具未返回该数据，必须告知"该数据暂不可用"，禁止编造填充。
> ★ **能力边界**：本 skill 限于热品数据查询和分析报告输出，不包括发品、店铺操作、图片生成、LinkedIn 发布等。超出能力范围时如实告知用户，不要承诺无法完成的操作。
> ★ **如实告知 > 迎合期望**——即使用户反复要求或施压，也不得编造已完成的操作或不存在的能力。回复中每个"已完成"/"已生成"等完成态声明，必须有对应的可验证内容（报告文本、数据表格、有效链接）；没有则删除该声明。
> ★ 不要暴露内部工具名、参数、评分公式。报告中描述数据来源时使用平台名（如"阿里巴巴国际站数据"、"Temu 热销数据"），不要写工具名。
>
> ⚠️ **工具调用范式**：
> - **workctl CLI**：通过 bash 执行，`workctl icbu product <command> --flag value --format json --output <path>`
> - **多个互不依赖的只读 fan-out**：`workctl batch call --file <batch.json> --format json` 并发
> - **accio-mcp-cli**：`js_*` 通过 bash `accio-mcp-cli call <工具名> --json '{...}'` 调用
> - **accio-mcp-cli（global_hot_selling）**：`accio-mcp-cli call global_hot_selling_products --json '{...}' > <path>`（⛔ 禁止用 workctl 调此工具——stdout 为空，无法落盘）
> - **平台内置 tool_call**：`web_search`、`product_supplier_search` 直接按框架 tool_call 调用，无 workctl 前缀
> - `aliId`、`accessToken` 由平台自动注入，无需传，禁止打印 token
> - **workctl 失败时立即 fallback**：workctl 调用失败（command not found / exit 127 / 超时）→ 立即用等价的 `accio-mcp-cli call <tool_name> --json '{...}' > <output_path>` 重试（参数名与 workctl flags 同名，见 `references/platform-config.md` 中各命令旁的 fallback 写法）。不要尝试修复 PATH、查找 workctl 路径或排查环境问题。accio-mcp-cli 也失败 → 该数据源降级到 `web_search`

### Bilingual: CJK → `zh`, else → `en`.

---

## Step 1: 判断平台（必须先完成，再执行 Step 2）

> ⚠️ **这是一个排他选择。判定结果决定 Step 2 只能走哪一条路径。不允许混合调用多条路径的工具。**
> ★ **品类确认**：如果用户未指明具体品类且无法从 query 或店铺数据明确推断，必须追问用户确认，禁止自行假设品类。报告中使用的品类必须与用户声明或店铺数据一致。

- **Input**: 用户 query
- **Action**: 从 query 判断平台，确定唯一路径
- **Output**: 读取对应的 reference 文件并执行

| 用户 query 包含 | 执行路径 | 读取文件 |
|-----------------|----------|----------|
| "国际站"、"Alibaba.com"、"询盘"、"B2B" | Step 2A | `references/step2a-alibaba.md` |
| "亚马逊"、"Amazon" | Step 2B | `references/step2b-amazon.md` |
| "Temu" | Step 2C | `references/step2c-global.md` |
| "SHEIN" | Step 2C | `references/step2c-global.md` |
| "1688" | Step 2C | `references/step2c-global.md` |
| "Shopee" | Step 2C | `references/step2c-global.md` |
| "TikTok" | Step 2C | `references/step2c-global.md` |
| "eBay" | Step 2D | `references/step2d-websearch.md` |
| "速卖通"、"AliExpress"、"Lazada" | Step 2D | `references/step2d-websearch.md` |
| 没有提到任何平台 | Step 2A（默认） | `references/step2a-alibaba.md` |

> ⚠️ 1688 ≠ 国际站，禁止走 Step 2A。1688 走 Step 2C（`references/step2c-global.md`）。
> 判定完成后，**只读取对应的一个 reference 文件**，按其中的指令执行。不要读取其他路径的 reference。

---

## Step 2: 按路径执行数据获取

- **Action**: 用 `read_file` 读取 Step 1 路由表中对应的 reference 文件，然后**严格按该文件中的指令执行**。
- 每个 reference 文件开头有 `🔧 允许工具` 和 `❌ 禁止` 清单，**只能使用允许的工具**。
- **不要跳过读取 reference 文件这一步。** 即使你觉得已经知道该怎么做，也必须先读取文件确认。

> ⛔ **Step 2 全程静默**：执行工具调用和脚本时，不输出任何文本。不要解释你在做什么、不要汇报中间结果、不要输出过渡性发言。所有对话内容在 Step 3 报告写入完成后才输出。

---

## Step 3: 输出报告

> ⛔ **执行节奏：三阶段分离，禁止穿插**
> 1. **数据收集阶段（静默）**：完成所有工具调用（数据查询 + 脚本提取 + product_supplier_search），收集全部所需数据。**此阶段禁止输出任何文本**——不要解释进度、不要汇报中间结果、不要过渡性发言。
> 2. **报告写入阶段**：拿到全部数据后，一次性将完整报告写入以报告标题为文件名的 .md 文件。写入期间不穿插任何工具调用或文本输出。
> 3. **对话回复**：报告写入完成后，在对话中输出 summary（报告标题 + 文件路径 + 报告中 关键数据发现，如 Top 产品亮点、竞争格局要点、价格带分布等核心结论）+ 追问段（1-3 条快捷指令，按 `references/next-action-suggestions.md` 的选择规则生成），然后**立即停止**——不再调用任何工具，不再输出任何内容。
> ⚠️ **summary 与追问段必须连续输出、作为同一个交付正文整体提交**。若结果需封装为结构化 `delivery` 字段透传，则该 `delivery` 字段必须**同时包含 summary 与追问段**——禁止只把 summary 写入 `delivery` 而把追问段留在 `delivery` 之外，否则追问段会在透传时丢失。
>
> 🔧 **允许工具：`product_supplier_search`**（仅非国际站平台，用于 Section 7 供应商推荐）**+ `read_file`**（仅用于读取 `references/next-action-suggestions.md`，用于对话追问段）
> 国际站平台（Step 2A）的供应商数据已在 Step 2 中获取，Step 3 不需要额外调用。

- **Input**: Step 2 输出的产品数据
- **Action**:
  1. **数据收集**（写入报告前完成）：**非国际站平台时**，先调用 `product_supplier_search(query=<用户关键词>)` 获取国际站供应商数据（用于 Section 7）；然后（**所有路径**）`read_file` 读取 `references/next-action-suggestions.md`（用于对话追问段）。所有工具调用到此结束。
  2. **报告写入**（一次性完成，不再调用任何工具）：按 Step 2 reference 文件中的字段组装规则填充报告。报告骨架按平台选择模板：
     - 国际站（Step 2A）→ `assets/report_template_zh.md`
     - Amazon（Step 2B）→ `assets/report_template_zh.md`
     - Temu/SHEIN/1688/Shopee/TikTok（Step 2C）→ `assets/report_template_global_zh.md`
     - eBay/AliExpress/Lazada（Step 2D）→ `assets/report_template_websearch_zh.md`（**无缩略图列**）
  3. **对话追问段生成**（报告写入完成后）：按数据收集阶段已读取的 `references/next-action-suggestions.md` 中的动作目录和选择规则，在对话中输出追问段（1-3 条快捷指令）。追问段包含在对话输出中，不写入报告。报告必含商品 URL，追问段恒输出——不要跳过，也不要凭记忆自由发挥。非 Amazon/1688 平台的商品链接（国际站/Temu/SHEIN/Shopee/TikTok/eBay/AliExpress 等）不具备 URL 发品能力，追问中不提供发品指令。
- **Output**: 完整报告写入以报告标题为文件名的 .md 文件，对话中输出 summary（报告标题 + 文件路径 + 关键数据发现）+ 追问段。**summary 与追问段构成单一交付正文整体**；若封装为 `delivery` 字段透传，二者必须同时进入该字段。

> ⛔ 报告写入完成后，输出 summary + 追问段，然后**立即停止**——不再调用任何工具，不再输出任何内容。

### 报告结构（7 个 Section）

1. 执行摘要
2. 热品排行榜（尽量 15 行，数据不足时有多少写多少，不要编造）
3. Top 5 深度分析
4. 买家需求画像
5. 竞争格局与差异化
6. 风险评估
7. 供应商推荐（≥5 个）

> 追问段（1-3 条快捷指令）在对话中输出，不写入报告，按 `references/next-action-suggestions.md` 的选择规则生成。

> 数据不足的 section 简写即可。

### ⛔ 表格格式规则

1. 每行以 `|` 开头和结尾
2. 分隔行只用 `|`、`-`、空格
3. 表格前后各一个空行
4. 列数必须一致
5. 价格用纯数字，列名标单位，不用 `$`
6. 价格区间用 `-` 不用 `~`

---

**Section 1 — 执行摘要**: 1 段话。

**Section 2 — 热品排行榜**:

表格列定义和示例见 Step 3 中加载的报告模板。不同平台的列不同：
- 国际站 → `assets/report_template_zh.md`：有缩略图、GMV指数、询盘指数
- Amazon → `assets/report_template_zh.md`：有缩略图、月销量
- Temu/SHEIN/1688/Shopee/TikTok → `assets/report_template_global_zh.md`：有缩略图、30天销量、评分、评论数
- eBay 等 → `assets/report_template_websearch_zh.md`：**无缩略图列**

**Section 3 — Top 5 深度分析 (3.1–3.5)**:

从排行榜中选 5 个最具代表性的产品，每个产品按以下结构：

```
### 3.X [产品名称简写]

**竞争评估**: 🟢低竞争 / 🟡中等 / 🔴高竞争

**关键数据表**：

| 指标 | 数值 |
|------|------|
| [根据实际数据填写] | [实际值] |

**热销驱动力**（从以下维度推断，不需要额外数据源）：
- 价格定位：与同类产品相比是否有价格优势
- 规格亮点：从产品标题中提取核心卖点
- 评分/评论：高评分或大量评论说明产品口碑好
- 外观/品牌：是否复刻知名品牌外观、是否有独特设计

**利润链估算**：
- FOB: $X → 零售参考: $X → 预估毛利空间: X%

**结论**：[一句话总结该产品的机会或风险]
```

> 关键数据表的可用指标按平台不同：
> - 国际站：价格、MOQ、GMV指数(30d)、询盘指数(30d)、评分、评论数
> - Amazon：价格、月销量、月营收、评分、评论数
> - Temu/SHEIN/1688/Shopee/TikTok：价格、30天销量、评分、评论数、正面标签、负面标签、TikTok 视频数
> - web_search：价格、评分（通常只有这两项）
>
> **只填你实际拥有的数据，不要编造没有的指标。**

> ⛔ **表格渲染铁律**：
> 1. 表格前必须有一个空行
> 2. 表格后必须有一个空行
> 3. `|` 和内容之间必须有空格
> 4. 分隔行格式：`|------|------|`

**Section 4 — 买家需求画像**:

| 维度 | 分析内容 |
|------|----------|
| 主力买家地区 | 从数据中的 region 或搜索趋势推断 |
| 采购偏好 | 价格敏感型 vs 品质导向型 |
| 功能需求 | 从热销品标题/卖点中提取高频关键词 |
| 痛点 | 从评论/负面标签中提取买家未被满足的需求 |

**Section 5 — 竞争格局与差异化**:

| 维度 | 分析内容 |
|------|----------|
| 价格带分布 | 低/中/高价格带各有多少产品 |
| 同质化程度 | 产品名称/卖点是否高度雷同 |
| 差异化机会 | 基于以上分析，给出 2-3 个可切入的差异化方向 |

**Section 6 — 风险评估**:

| 风险类型 | 需评估内容 |
|----------|-----------|
| 合规风险 | 是否涉及认证（FDA/CE/FCC）、专利、品牌授权 |
| 价格战风险 | 低价产品占比是否过高 |
| 季节性风险 | 该品类是否有明显淡旺季 |

**Section 7 — 供应商推荐（≥5 个）**:

供应商数据来源和表格格式见对应的报告模板：
- 国际站 → `assets/report_template_zh.md` 的 Section 7（从 Top 15 提取供应商）
- 非国际站 → 对应模板的 Section 7（从 `product_supplier_search` 结果提取）
- ⚠️ 所有 URL 必须使用工具返回的原始值，禁止拼接或猜测

### 错误处理与降级交付

- **workctl + accio-mcp-cli 双失败**（`data_advisor_category_infer`、`data_advisor_product_selection` 等）：workctl 失败（command not found / exit 127 / 超时）→ 立即用 `accio-mcp-cli call <tool_name> --json '{...}' > <output_path>` 重试。accio-mcp-cli 也失败 → 跳过该数据源对应的 Section，在报告中标注"该模块数据暂时无法获取"，其余已成功的 Section 正常输出。禁止搜索二进制路径、尝试修复 PATH 或探索其他工具链
- **`scripts/extract_*.py` 脚本执行失败**：检查 stderr 错误信息。若为数据格式问题，手动从工具返回的原始 JSON 中提取 Top 15 数据；若为脚本缺失或权限问题，告知用户并展示已获取的原始数据摘要
- **数据不足**：某 Section 可用数据少于 3 条时，如实展示已有数据并标注"当前数据量有限，仅供参考"，禁止编造凑数
- **供应商搜索（Section 7）失败**：其余 6 个 Section 正常输出，Section 7 标注"供应商推荐数据暂时不可用，建议前往国际站搜索"并提供链接 `https://www.alibaba.com/trade/search?SearchText=<关键词>`
- **执行超时或中断**（Step 2 数据获取超时、会话即将结束）：用已获取的数据立即进入 Step 3，将简化报告写入以报告标题为文件名的 .md 文件并在对话中输出 summary。宁可报告数据不完整，也必须在当前轮次交付可用内容——禁止以"正在处理"/"请稍候"等进行时态结束对话

### 自检

| # | 检查项 |
|---|-------|
| 1 | 7 个 Section 都有 |
| 2 | Section 2 尽量 15 行，数据不足时有多少写多少（禁止编造凑数） |
| 3 | Section 2 表格列与实际数据匹配 |
| 4 | Section 3 有 5 个深度分析 |
| 5 | Section 7 有 ≥ 5 个供应商推荐 |
| 6 | 表格前后有空行 |
| 7 | 没有暴露内部工具名/参数 |
| 8 | 没有全是 `-` 的列（如果某列所有行都是 `-`，直接删除该列） |
| 9 | 数据来源与 Step 1 判定的平台一致（1688 数据不应来自 alibaba.com） |
| 10 | 国际站缩略图使用了 `scripts/extract_top15.py` 输出的 thumbnail 字段 |
| 11 | web_search 路径（Step 2D）的表格没有缩略图列 |
| 12 | 产品链接使用了原始值或脚本预组装值（禁止自己拼接） |
| 13 | 没有自己写 python/bash 脚本（只调用了 `scripts/` 预置脚本） |
| 14 | 没有用 read_file 读取 workctl / accio-mcp-cli 结果原始文件（用了对应的 extract 脚本） |
| 15 | 逐字段溯源：回复中每个数据值（URL、ID、日期、价格、评分）能追溯到工具返回？用户请求了但工具未返回的字段，是否已标注"该数据暂不可用"而非编造？ |
| 16 | Step 2 中只使用了对应 reference 文件中 🔧 允许的工具 |
| 17 | 回复中每个完成态声明（"已完成"/"已生成"/"已发送"）是否有对应的可验证内容？没有则删除该声明 |
| 18 | 报告品类与用户声明或店铺数据一致？若均未获取到，是否已追问？ |
| 19 | 完整报告已写入以报告标题为文件名的 .md 文件，对话中仅输出 summary（标题 + 文件路径 + 关键数据发现）+ 追问段 |
| 20 | 数据收集阶段没有输出任何文本（无进度汇报、无中间解释）；写入报告期间没有穿插任何工具调用；回复 summary + 追问段后没有再做任何操作 |
| 21 | 报告含追问/进一步探索/下一步行动建议模块时，summary 追问段是否与报告内容保持一致？ |
| 22 | 追问段是否与 summary 一起放入同一交付正文（若封装为 `delivery` 字段，二者是否都在该字段内）？禁止只透传 summary 而遗漏追问段 |

> ⚠️ **报告-追问一致性**：如果报告中包含追问/进一步探索/下一步行动建议等模块，summary 中的追问段须与报告中的相关内容保持一致（不能报告推荐 A 而追问推荐 B）。

> ⚠️ **STOP RULE**: summary + 追问段输出后立即停止——不再调用任何工具，不再输出任何内容。

---

## Dependencies

| Tool | Purpose |
|------|---------|
| `data_advisor_category_infer` | 国际站类目预测（Step 2A） |
| `data_advisor_product_selection` | 国际站排行数据（Step 2A） |
| `js_product_database_query` | Amazon 产品数据（Step 2B） |
| `global_hot_selling_products` | Temu/SHEIN/1688/Shopee/TikTok 热销数据（Step 2C） |
| `web_search` | 其他站外平台搜索（Step 2D） |
| `product_supplier_search` | 国际站供应商搜索（Step 2A 品牌词 / Step 3 供应商） |
| `scripts/extract_top15.py` | 国际站数据提取（Step 2A） |
| `scripts/extract_amazon_top15.py` | Amazon 数据提取（Step 2B） |
| `scripts/extract_global_top15.py` | Temu/SHEIN/1688/Shopee/TikTok 数据提取（Step 2C） |

> 工具参数速查：
> - 国际站 → `references/platform-config.md`
> - Amazon → `references/amazon-tools.md`
> - Temu/SHEIN/1688/Shopee/TikTok → `references/global-hot-selling.md`

---

## Examples

**"猫粮市场有什么热品？"**（Step 1 → 默认国际站 → 读取 `references/step2a-alibaba.md`）

```
[Step 2] workctl icbu product data-advisor-category-infer --categoryDesc "猫粮" --format json --output infer.json → cateId
[Step 2] workctl icbu product data-advisor-product-selection --cateId X --statisticsType 30d --orderBy rec_ord_amt --order desc --format json --output rank.json
[Step 2] python3 scripts/extract_top15.py rank.json → 精简 15 条
[Step 3] read_file references/next-action-suggestions.md
[Step 3] 写入报告文件（Sections 1-7）+ 输出 summary + 追问段（国际站数据已含供应商，不需要额外调用）
```

**"亚马逊上最热卖的瑜伽垫"**（Step 1 → Amazon → 读取 `references/step2b-amazon.md`）

```
[Step 2] accio-mcp-cli call js_product_database_query --json '{"include_keywords":["yoga mat"],"marketplace":"us","page_size":50}'
[Step 2] python3 scripts/extract_amazon_top15.py <结果文件> → 精简 15 条
[Step 3] product_supplier_search(query="yoga mat") → 国际站供应商（Section 7 用）
[Step 3] read_file references/next-action-suggestions.md
[Step 3] 写入报告文件（Sections 1-7）+ 输出 summary + 追问段
```

**"Temu上最热卖的智能手机"**（Step 1 → Temu → 读取 `references/step2c-global.md`）

```
[Step 2] accio-mcp-cli call global_hot_selling_products --json '{"query":"smartphone","platform":"temu","sorting_rule":"sales","type":"hot_selling"}'
[Step 2] python3 scripts/extract_global_top15.py <结果文件> → 精简 15 条
[Step 3] product_supplier_search(query="smartphone") → 国际站供应商（Section 7 用）
[Step 3] read_file references/next-action-suggestions.md
[Step 3] 写入报告文件（Sections 1-7）+ 输出 summary + 追问段（使用 assets/report_template_global_zh.md）
```

**"SHEIN美妆爆品有哪些？"**（Step 1 → SHEIN → 读取 `references/step2c-global.md`）

```
[Step 2] accio-mcp-cli call global_hot_selling_products --json '{"query":"beauty cosmetics","platform":"shein","sorting_rule":"sales","type":"hot_selling"}'
[Step 2] python3 scripts/extract_global_top15.py <结果文件> → 精简 15 条
[Step 3] product_supplier_search(query="beauty cosmetics") → 国际站供应商（Section 7 用）
[Step 3] read_file references/next-action-suggestions.md
[Step 3] 写入报告文件（Sections 1-7）+ 输出 summary + 追问段（使用 assets/report_template_global_zh.md）
```

**"TikTok上什么最火？"**（Step 1 → TikTok → 读取 `references/step2c-global.md`）

```
[Step 2] accio-mcp-cli call global_hot_selling_products --json '{"query":"<关键词>","platform":"tiktok","sorting_rule":"sales","type":"hot_selling"}'
[Step 2] python3 scripts/extract_global_top15.py <结果文件>
[Step 3] product_supplier_search(query="<关键词>") → 国际站供应商（Section 7 用）
[Step 3] read_file references/next-action-suggestions.md
[Step 3] 写入报告文件（Sections 1-7）+ 输出 summary + 追问段（使用 assets/report_template_global_zh.md）
```

---

## Version Log

### v1.2.0 (HP-017, 2026-06-23)

- 修复追问段在 skill-executor 透传时丢失的问题：追问段曾被写在子代理自由正文中、未进入 `delivery` 字段，主 Agent 原文透传 `delivery` 时追问段被截在字段外
- 新增「交付单元绑定」规则：明确「summary + 追问段」是不可分割的交付正文整体，若封装为结构化 `delivery` 字段，必须同时包含 summary 与追问段两部分
- 在 Step 3 对话回复、Output 定义、自检表（新增第 22 项）三处同步强化该约束

### v1.1.0 (HP-016, 2026-06-23)

- 丰富 summary 内容定义：从"报告标题 + 核心结论 1-2 句 + 文件路径"改为"报告标题 + 文件路径 + 报告中 关键数据发现（Top 产品亮点、竞争格局要点、价格带分布等核心结论）"
- 确认追问段"恒输出"设计，非 Amazon/1688 平台（国际站/Temu/SHEIN/Shopee/TikTok/eBay/AliExpress 等）的商品链接不具备 URL 发品能力，追问中不提供发品指令
- 新增报告-追问一致性规则：如果报告中包含追问/进一步探索/下一步行动建议模块，summary 中的追问段须与报告内容保持一致
