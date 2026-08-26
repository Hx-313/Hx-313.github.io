---
name: 市场全景分析
version: "2.11.0"
description: |
  针对一个品类/市场，跑全维度（规模+增速+竞争+国家+买家+趋势）出一份市场全景报告，帮商家判断"是否值得介入"和"如何切入"。
  数据来源：站内市场参谋 + 产品参谋 + Amazon + 跨平台热销 + Google Trends/web_search 多源融合。
  适用：给品类/市场要看全局、是否介入、如何切入（含 TopN/国家/买家等单维侧重，仍出全景）。
  不适用：单类目 8 维深度报告、蓝海/供需错配查找、纯多平台热销榜、自有店铺经营分析。
workflow: |
  Step 1: 语言检测 + 抽取品类（仅品类无法确定时追问一次）
  Step 2: 并发跑全维度取数，失败按分层兜底降级
  Step 3: 写入全景报告 .md 文件 + 对话输出 summary + 追问段
enabled: true
---

# 市场全景分析（Market Panorama Analysis）

### 路由表（排他）

以下场景**互斥**，由 description 语义匹配决定路由，不以用户是否提及关键词为准。

| 用户意图 | 走哪个 skill |
|---------|------------|
| 给品类/市场 → 看全局 + 是否介入 + 如何切入（含"列出 TopN""看国家""看买家"等单维侧重，仍出全景） | **本 skill**（市场全景分析） |
| 单类目要 8 维结构化深度报告（规模/竞争/季节性/利润/壁垒/营销/利基/痛点） | alibaba-jungle-scout-deep-dive-analyzer |
| 明确要找蓝海/供需错配/低竞争细分 | alibaba-blue-ocean-finder |
| 只要一张多平台热销榜，无市场分析诉求 | alibaba-hot-product-insight |
| 分析自有店铺经营数据 | alibaba-analysis-brief |

> ★ **始终全景、永远一份报告**：用户给一个品类/市场就**一次性跑全维度**（规模+增速+竞争+国家+买家+趋势），先展开各维度，再给**「是否介入 + 如何切入」决策结论**，最后以行动清单收束全文。**不做意图判定、不做场景分支、不因用户只问某一维就降级为单维**——用户强调的维度只是"重点展开"，其余维度照常覆盖。
> ★ **完整报告写入以报告标题为文件名的 `.md` 文件（如 `《不锈钢保温杯全球市场全景分析》.md`），对话中仅输出简短 summary**（报告标题 + 文件路径 + 报告中关键数据维度发现，如市场规模、增速、供需态势、Top 国家/品类等核心指标）+ 追问段（必须出现，1-3 条快捷指令）。禁止在对话中输出完整报告内容。
> ★ **交付单元绑定（解决追问段丢失）**：本 skill 的「交付正文 = summary + 追问段」是一个**不可分割的整体**。无论以何种形式封装结果（如被 skill-executor 包装为 `delivery` 字段透传），追问段都**必须与 summary 一起完整放入透传内容**，不得拆分、不得只透传 summary 而把追问段留在自由正文里。若封装为结构化 `delivery` 字段，该字段必须同时包含 summary 与追问段两部分。
> ★ **目标 3-5 分钟内完成。**
> ★ **报告交付是唯一目标，数据收集为报告服务。** 执行严格分两阶段：**第一阶段**完成全部工具调用和数据收集（每个维度尝试一轮——成功拿到数据→标记完成；失败/空/报错→按降级路径处理并标记完成）；**第二阶段**一次性写入完整报告文件（以报告标题为文件名的 `.md` 文件），然后在对话中输出 summary。**两阶段严禁穿插**——写入报告文件并输出 summary 后不再发起任何工具调用或流程，缺数据的维度按降级内容写入（降级内容是报告的正常组成部分，不是需要修复的异常）。
> ★ **工具/脚本报错是降级信号，不是待解决的 bug。** 脚本 Traceback、`--output` 未生成文件、工具返回矛盾数据——这些都意味着该维度的数据在当前环境不可用，按对应维度的降级路径处理即可。不要调试脚本、不要检查数据结构、不要尝试绕过平台限制。
> ★ 所有可用 workctl 命令和参数已在 `references/data-acquisition.md` 中列出。workctl 调用报错时（如 unknown flag），**允许运行 `workctl <cmd> --help` 查看正确参数格式**并修正后重试一次，但不要猜测参数。
> ★ **脚本路径**：`scripts/` 位于 skill 安装路径下（agent 读取 SKILL.md 时拿到的 `install_path/scripts/`），**不在当前工作目录**。执行前先定义：`SCRIPTS_DIR="<install_path>/scripts"`。所有脚本调用使用 `python3 $SCRIPTS_DIR/xxx.py`。
> ★ **禁止用 head/cat/ls/grep/find/glob/list 探测文件或目录结构**——references/ 中的命令直接复制执行，不需要预检。
> ★ **禁止自己写 python/bash 脚本**——数据处理已由 `scripts/` 下的预置脚本完成，不需要额外脚本。
> ★ **文件写入白名单**（除此以外一律禁止）：
>   - `--output <path>` 写中间 JSON 数据文件到当前工作目录（禁止 `-o`，禁止 `/tmp`）
>   - 最终报告写入以报告标题为文件名的 `.md` 文件
>   - 禁止在 /tmp 或工作目录外创建临时文件——中间 JSON 数据必须写入当前运行目录（workctl `--output` 落盘路径、accio-mcp-cli 重定向路径均在当前目录），最终报告写入以报告标题为文件名的 .md 文件。
>   - 禁止创建脚本文件、或其他任何文件
> ★ **禁止创建 Task**——本 skill 单轮执行。
> ★ **禁止读取其他 skill 的文件**——本 skill 的所有依赖已在 `references/` 和 `scripts/` 中自包含。
> ★ **禁止编造任何数据**——品类名、价格、销量、评分、URL、图片、国家排名必须来自工具返回原始数据。无数据写 `-` 或省略该列/段，并按「错误处理与降级交付」标注。即使用户明确要求某数据字段，如果工具未返回该数据，必须告知"该数据暂不可用"，禁止编造填充。
> ★ **禁止猜测或探索命令**——所有 workctl 命令名和参数名已在 `references/data-acquisition.md` 中完整列出。不要编造命令/参数。workctl 报错时允许 `--help` 查看格式（见上方规则）。
> ★ 不要暴露内部工具名、参数、评分公式。报告中用平台名（"阿里巴巴国际站市场数据"、"Amazon 销量数据"、"Google 搜索趋势"）。
>
> ⚠️ **工具调用范式**：
> - **workctl CLI**：通过 bash 执行，用**平铺参数**（`--cateId <id> --orderBy abCnt`），统一加 `--format json --output <path>`
> - **多个互不依赖的只读 fan-out**：`workctl batch call --file <batch.json> --format json` 并发
> - **accio-mcp-cli**：`data_advisor_*`、`js_*`、`global_hot_selling_products` 通过 bash `accio-mcp-cli call <工具名> --json '{...}'` 调用
> - **accio-mcp-cli（global_hot_selling）**：`accio-mcp-cli call global_hot_selling_products --json '{...}' > <path>`（⛔ 禁止用 workctl 调此工具——stdout 为空，无法落盘）
> - **平台内置 tool_call**：`web_search`、`product_supplier_search` 直接按框架 tool_call 调用，无 workctl 前缀
> - `aliId`、`accessToken` 由平台自动注入，无需传，禁止打印 token
> - **workctl 失败时立即 fallback**：workctl 调用失败（command not found / exit 127 / 超时）→ 立即用等价的 `accio-mcp-cli call <tool_name> --json '{...}' > <output_path>` 重试（参数名与 workctl flags 同名，见 `data-acquisition.md` 中各命令旁的 fallback 写法）。不要尝试修复 PATH、查找 workctl 路径或排查环境问题。

### Bilingual: CJK（U+4E00–U+9FFF）→ `zh`，否则 → `en`。报告语言跟随用户 query 语言。

---

## When to Use / When NOT to Use

| ✅ 适用（本 skill） | ❌ 改用其他 skill |
|------|------|
| 给品类/市场要"看清全局 + 是否值得介入 + 如何切入" | 单类目 8 维结构化深度报告 → jungle-scout-deep-dive |
| 综合行业/市场规模 + 增速调研、外贸情况总结 | 纯多平台热销榜（无分析诉求）→ hot-product-insight |
| 热销 TopN + 国家需求 + 买家画像 + 趋势（任意侧重，仍出全景） | 找蓝海/供需错配/低竞争细分 → blue-ocean-finder |
| 单品/赛道在国际站的优势潜力评估 | 自有店铺经营数据分析 → analysis-brief |

> 本期**不做竞品/标杆店铺逐店拆解**。用户给店铺链接要求"拆这家店"时，告知暂不支持逐店分析，转为按其主营品类做市场全景分析。

---

## Step 1: 槽位抽取（最小追问）

> ★ **核心原则：能不问就不问。** 只有「品类」是出报告的硬前提；市场、周期等一律用默认值静默填充，**绝不向用户追问**。

| 槽位 | 是否必填 | 取值顺序 | 缺失处理 |
|------|---------|---------|---------|
| `category`（品类/单品） | ✅ 唯一必填 | ① query 中的品类词 → ② 画像 `merchant_profile.categories` | 两者都拿不到 → **追问一次**（且仅此一种情况可以追问） |
| `target_market`（目标市场） | ❌ 可选 | ① query 指定国家 → ② 画像 `merchant_profile.target_markets` → ③ 默认全球（国家维度跑 Top 国家分布） | **静默默认，绝不追问** |
| `period`（统计周期） | ❌ 可选 | query 指定 → 否则默认 30d / 近30天 | **静默默认，绝不追问** |

**追问判定（唯一允许追问的分支）：**
- 若 query 已含品类词 → **直接执行，不追问**。
- 若 query 无品类词，但画像有主营品类 → **用画像品类直接执行，不追问**（可在报告开头一句话说明"已按您的主营品类 X 分析"）。
- 若 query 无品类词且画像也无 → 这是**唯一**需要追问的情况，用一句话问品类即可，例如："请问您想分析哪个品类/产品的市场？"

> ⚠️ 除"连品类都无法确定"外，**任何情况都不得追问**（不得问市场、不得问周期、不得问"想看哪个方向/维度"）。用户只问某一维时，把该维当作重点展开，其余维度仍按默认跑全。
> ⚠️ 已由 Hook slot-filling 注入的槽位直接使用，不重复追问。

---

## Step 2: 多源数据获取（全维度并发）

> ★ **始终跑全维度**，不读取/不依赖任何 `scene-*` 场景分支。全部取数步骤已整合进 `references/data-acquisition.md`。

1. **读取 `references/data-acquisition.md`**（唯一入口文档，已整合全部六个维度的命令、参数、脚本、并发分组、降级路径，以及工具参数速查、徽章定义、评分模型——正常流程所需全部信息都在这一个文件中，无需额外参考其他文件）。⚡ **务必遵守其中「取数执行纪律」**：站内多命令用 `;` 隔离（绝不用 `&&`）、每命令独立 `--output` 并先清旧文件、拿到 cateId 后先校验关键链路再并发、站外接口重试 1 次即降级。
2. **类目预测只做一次**：`data_advisor_category_infer` 取第一次返回的 `cateId` 直接用于后续全部维度查询，不要反复预测不同品类词、不要深入探索子类目层级。将 `cateId` 和 `cateDesc` 记录后，后续所有维度命令**直接复用该 cateId**，不再调用 `category-infer`。
   - **泛关键词处理**：如果 `category_infer` 返回的类目明显过于宽泛（如用户说"厨房用品"返回一级大类）或不相关，先尝试**联想扩词**（同义词、下位词、英文变体，如"厨房用品"→"kitchen organizer / cutting board / spice rack"）重新预测一次；仍无法定位到有意义的类目 → 用 `ask_user` 追问用户缩窄范围（如"'厨房用品'涵盖面较广，请问您更关注哪类产品？例如收纳、刀具、小家电……"），拿到具体品类后再继续。
3. **并发执行**六大维度取数（尽量 `workctl batch call` 或并行 tool_call，不要串行等待）：

   | 维度 | 数据落点 | 主工具 |
   |------|---------|--------|
   | ① 行业规模 + 大盘增速 | web_search 宏观结论（主体）+ 市场参谋大盘数据 + 趋势序列（平台侧补充） | `web_search` + `data_advisor_industry_market_detail` + `data_advisor_industry_market_trend` + `data_advisor_industry_cate_rank` |
   | ② 竞争格局 + 热销 TopN + 价格带 + 卖家画像 | 产品参谋商品排行 + 卖家竞争画像 | `data_advisor_category_infer` + `data_advisor_product_selection` + `data_advisor_industry_seller_portrait` |
   | ③ 目标国家需求分布 | 市场参谋查国家 + 站外验证 | `data_advisor_industry_country_rank` + `web_search` |
   | ④ 买家画像 / 痛点 / 偏好 | 站内买家数据（画像/渠道/人群）+ 站外评论补充 | `data_advisor_industry_buyer_profile` + `data_advisor_industry_buyer_channel` + `data_advisor_industry_crowd_insight` + `web_search` + `js_product_database_query` |
   | ④½ 产品机会发现 | 站内搜索词级供需/蓝海信号 | `data_advisor_opportunity_discovery` |
   | ⑤ 站外需求交叉验证 | Amazon 月销 + 跨平台热销 | `js_product_database_query` + `global_hot_selling_products` |
   | ⑥ 热点趋势 / 行业资讯 | 公开资讯 + 搜索趋势 | `web_search` |

4. **数据处理**统一交给 `$SCRIPTS_DIR/` 预置脚本（`extract_market.py` / `extract_topn.py` / `extract_demand.py` / `extract_market_detail.py` / `extract_seller.py` / `extract_buyer.py`），把 `--output` 路径直接喂给脚本，**不要 read_file 读结果文件**。脚本 stdout 输出的 JSON 即为报告所需数据，直接用于报告写入。
5. **汇总评分**（⚠️ 必须执行，不可跳过）：全部维度取数 + extract 脚本执行完成后，调用 `$SCRIPTS_DIR/score_market.py`（输入各维度原始 JSON 文件路径），脚本 stdout 输出 `label` + `reasoning`，直接用于§6 决策结论。**禁止跳过此步**——§6 结论必须基于脚本输出，不可由 agent 散文推导。

数据层与来源对照（速查表，`data-acquisition.md` 已包含全部取数信息、工具参数和来源标注规范）：

| 数据层 | 来源 | 用途 |
|--------|------|------|
| 站内行业大盘 | 市场参谋 `data_advisor_industry_cate_rank` | 子类目排名、价格区间 |
| 站内大盘数据 | 市场参谋 `data_advisor_industry_market_detail` | 行业规模、增速、转化率、供需比 + 各指标排名 |
| 站内行业趋势 | 市场参谋 `data_advisor_industry_market_trend` | 时间序列规模/增速/转化/供需 |
| 站内卖家画像 | 市场参谋 `data_advisor_industry_seller_portrait` | 卖家星级分布、询盘/GMV 档位、品类集中度、RTS 占比 |
| 站内买家画像 | 市场参谋 `data_advisor_industry_buyer_profile` / `buyer_channel` / `crowd_insight` | 买家类型分布、渠道偏好、人群规模及环比 |
| 站内国家需求 | 市场参谋 `data_advisor_industry_country_rank` | 国家/地区需求排名、热销背景 |
| 站内商品排行 | 产品参谋 `data_advisor_product_selection`（+ `data_advisor_category_infer`） | 在架商品 TopN、询盘/GMV 指数、价格带 |
| 站内机会发现 | 产品参谋 `data_advisor_opportunity_discovery` | 搜索词级供需比、增长趋势、蓝海信号 |
| 站外需求 | `js_product_database_query`（Amazon） | 跨平台需求、月销、价格 |
| 跨平台热销 | `global_hot_selling_products`（Temu/SHEIN/TikTok/Shopee/1688） | 站外热销品验证 |
| 趋势/资讯 | `web_search`（Google Trends、行业报告、海关统计） | 搜索趋势、行业热点、季节性、买家偏好 |
| 供应商兜底 | `product_supplier_search` | 站内供给密度/价格兜底 |

> ⚠️ 市场参谋命令若调用返回"命令不存在/未发布"，按 `data-acquisition.md` 的**降级路径**处理（A/B 命令降级用 `product_selection` + `web_search`；F-K 新工具降级回退到原有 web_search 路径）。**任一维度数据为空或失败都不阻塞其余维度**——按下方「错误处理与降级交付」逐维降级。

> ### 何时进入 Step 3（报告输出）
>
> **判定标准**：六大维度（①行业规模 ②竞争格局 ③国家需求 ④买家画像 ④½机会发现 ⑤站外验证 ⑥趋势热点）是否都已有了结果？——"结果"包括：成功拿到数据、返回空/报错后已标记为待降级、或工具不可用已确认降级路径。**全部维度都有了结果 → 数据收集阶段结束，进入报告写入阶段（写入以报告标题为文件名的 `.md` 文件并输出 summary 后流程结束，不再发起任何工具调用）。**
>
> 🔴 **④买家画像维度的"有结果"特判**：买家维度仅当满足以下之一才算"有结果"，否则**不得进入 Step 3**：① `fetch_buyer.py` 返回 `source_granularity="self"`（本品类有数据）；② 返回 `source_granularity="parent"`（已自动回退父类目）；③ `is_empty=true` 且脚本已确认无父类目可回退、已转 web_search 定性推断。**严禁在"手工散调三工具判空、未走 `fetch_buyer.py`"的状态下把④标记为"已降级"并进入 Step 3**——这是绕过父类目回退的违规态。
>
> **每个维度只尝试一轮**：主工具调用一次 → 成功则该维度完成；失败/空/报错 → 按降级路径调用一次备选 → 成功或再次失败都算该维度完成。不要为同一维度换关键词反复尝试、不要深入探索子类目、不要调试脚本或绕过平台限制。
>
> **报告不需要等到所有数据都“完美”**——降级标注本身就是报告的一部分。宁可报告数据不完整（标注降级），也必须在当前会话交付一份完整结构的全景报告。

#### 降级状态机（工具调用视角）

| 当前状态 | 事件 | 守卫条件 | 动作 | 下一状态 |
|---------|------|---------|------|----------|
| 主工具调用 | 成功 | 数据非空 | 记录数据，标记该维度完成 | 维度完成 |
| 主工具调用 | 失败/空 | 重试次数<1 | 重试主工具 1 次 | 主工具重试 |
| 主工具重试 | 成功 | 数据非空 | 记录数据，标记该维度完成 | 维度完成 |
| 主工具重试 | 失败/空 | 有 fallback 工具 | 调用 fallback 工具 1 次 | fallback 调用 |
| fallback 调用 | 成功 | 数据非空 | 记录数据，标记该维度完成 | 维度完成 |
| fallback 调用 | 失败/空 | 有 web_search | web_search 定性补充 | 降级完成(🟠) |
| fallback 调用 | 失败/空 | 无 web_search | 标记“数据暂缺” | 降级完成(🔴) |

---

## Step 3: 汇总 + 写入全景报告

> ⛔ **工具调用与报告写入严格分离——先收齐数据，再一次写完。** 进入本步骤后**禁止发起任何工具调用**（搜索、数据获取、read_file 等一切 tool_call）。所有数据在第一阶段已收集完毕，缺数据的维度用降级内容填充（降级内容是报告的正常组成部分）。**报告写入以报告标题为文件名的 `.md` 文件必须是一次性连续输出，中间不穿插工具调用。** 对话中仅输出简短 summary（报告标题 + 文件路径 + 关键数据维度发现）+ 追问段（必须出现），**summary 输出后立即停止，不再发起任何工具调用或流程**。
> ⚠️ **summary 与追问段必须连续输出、作为同一个交付正文整体提交**。若结果需封装为结构化 `delivery` 字段透传，则该 `delivery` 字段必须**同时包含 summary 与追问段**——禁止只把 summary 写入 `delivery` 而把追问段留在 `delivery` 之外，否则追问段会在透传时丢失。
> 报告结构已在下方内联定义，按下方结构直接写入即可。不存在其他报告模板。

### 全景报告输出结构（决策结论先行于行动清单，二者收束全文）

```
# 《[品类][市场]市场全景分析》
> 数据来源：[公开数据源 + 时间] | 分析方式：[数据/AI推断]

## 1. 行业规模 & 大盘增速
   web_search 宏观结论（市场规模 USD / CAGR / 季节性）为主体文字段落 + 站内数据表格补充

## 2. 竞争格局
   在架商品数/供给密度 / TopN 榜单 / 价格带分布 / 集中度判断

## 3. 目标国家需求分布（Top N）
   ★ N = country_rank 实际返回的国家数量，最多取前 10 个。例如返回 7 个则写 "Top 7"，返回 15 个则截断为 "Top 10"。
   国家/地区需求排名 + 规格偏好 + 文化/季节背景

## 4. 买家画像 & 痛点
   买家类型 / 采购场景 / 核心痛点 / 选择驱动因素

## 5. 机会与切入路径
   细分蓝海方向 / 差异化空间 / 拓品方向 / 热点趋势
   ★ 本节只做"市场存在哪些机会"的分析，不做决策判断（归§6）、不列行动步骤（归§7）

## 6. 决策结论（必有，承接前 5 维数据定调）
   ▶ 是否介入：值得 / 谨慎 / 不建议（一句话定调 + 1 句核心理由）
   ▶ 如何切入：推荐切入的细分方向 + 目标国家 + 价格带 + 差异化抓手（2-4 条可执行）
   ▶ 一句话风险提示

## 7. 行动清单（作为报告结尾收束）
   编号行动项（选品→发品→运营下一步）
   + 「推荐商品/供应商」表格（缩略图 | 商品+链接 | 参考价 | MOQ，复用 Step 2 的 product_selection 数据）
   + 关联下游技能入口
```

> - **标题格式**：报告主标题统一为 `《[品类][市场]市场全景分析》`，不得含 `—`、`@`、`/` 等特殊连接符（如"不锈钢保温杯全球市场全景分析"）；市场为全球时可省略市场词或写"全球"。
> - **七大 section 全部保留**，不因用户侧重某维而删段。用户强调的维度（如国家、买家、榜单）在对应 section **重点展开**（更细的表/更多解读），其余 section 仍如实给出可得信息。
> - 「6. 决策结论」必须基于前面各维度的真实数据推导，不得脱离数据空谈；数据不足时结论须降级为"信息不足，建议补充 X 后再判断"。
> - 某 section 数据完全缺失时，按「错误处理与降级交付」降级（web_search 估算并标注，或写 `-` / 简写），**不得编造填充，也不得整段删除**——至少保留标题 + 一句"该维度数据暂缺/为估算"的说明。

### 各 Section 输出规则

- **§1 行业规模以 web_search 宏观结论为主体**：先通过 web_search 搜索行业规模（USD）、增速（CAGR）、季节性等宏观结论，以文字段落呈现核心发现；再附站内市场参谋数据表格（有数据时）作为平台侧补充佐证。`market_detail` 有数据时，表格应包含市场规模(abCnt)、同比增速(abCntYoy)、供需比(supplyDemandRate)、转化率(dAbRate)及各项排名；`market_trend` 有数据时，在表格后补一段趋势走势描述。站内市场参谋提供的是平台内数据，不等于行业规模 USD 和 CAGR——不可将站内数据当作行业规模。
- **§5 只分析机会，不含决策和行动**：列出蓝海方向、差异化空间、趋势信号，回答"市场存在哪些机会及为什么"；不做"是否值得介入"的判断（归§6），不列具体行动步骤（归§7）。§5 与§6 的边界：§5 说"有什么机会"，§6 说"要不要做、怎么做"。
- **§2 TopN 表格必须含缩略图 + 链接**：用 `data_advisor_product_selection` 返回的 `imageUrl` 和 `productUrl` 填充——缩略图 `![img](imageUrl)`，商品名 `[名称](productUrl)`；无图/无链接的行该列填 `-`。`seller_portrait` 有数据时，TopN 表格后附「卖家竞争画像」段落，覆盖品类集中度、供应链成熟度（RTS 占比）、竞争格局（星级+询盘+GMV 档位综合判断）。
- **§3 国家需求必须为表格**：按模板 5 列（`# | 国家/地区 | 需求强度 | 规格/款式偏好 | 文化/季节背景`）输出，不得降级为 bullet list。
- **§4 买家画像以站内数据为主**：`buyer_profile` + `buyer_channel` + `crowd_insight` 有数据时，作为§4 主体（买家类型分布、渠道偏好、人群规模及环比），`web_search` 仅补充痛点和选择驱动因素等定性信息。**买家维度参数硬约束：`nd` 只能 30d/7d （禁 90d，实测会空）、`crowd_insight` 的 `industryId` 必须传具体类目 id（禁 TOTAL，实测永远空）。** 🟢 用户要 90d/近半年等超范围时间 → 用 30d 取数但 §4 须明确告知用户"平台买家维度仅提供近 7/30 天数据"，不静默降级。
  - 🔴 **强制走脚本（不可绕过）**：买家维度数据**必须**通过 `python3 $SCRIPTS_DIR/fetch_buyer.py <cateId> --nd 30d --dump-dir .` 获取，**严禁手工散调** `buyer_profile`/`buyer_channel`/`crowd_insight` 三工具后自行判空。脚本已内置 nd 白名单、重试、**窄类目父类目自动回退**，手工散调会绕过回退逻辑、把"本可父类目补全"的窄类目错误判成"数据不可用"。
  - 🔴 **§4 准入门禁（出报告前强制自检，违规不得出报告）**：读取 `fetch_buyer.py` 输出的 `source_granularity` 字段，§4 必须命中以下之一：
    - `source_granularity="self"` → 本品类有数据，正常输出。
    - `source_granularity="parent"` → 已回退父类目，§4 **必须**含标注「买家画像基于父类目〈父类目名〉，非本品类精确数据」。
    - `is_empty=true` 且无 parent 数据（父类目仍空/未找到父类目）→ 已走 `web_search` 定性推断，§4 **必须**标注 🟠 AI 推断。
    - ⛔ **违规态（直接拦截）**：§4 写"买家画像数据不可用/暂不可用/返回为空"且未提供 `source_granularity` 证据 → 视为**未完成回退流程**，不得据此出报告，必须回到 `fetch_buyer.py` 重取。
  - **正反例对照**（L4 窄类目取空时）：
    - ❌ 反例：L4 取空 → §4 直接写"买家画像数据暂不可用"（绕过了父类目回退）。
    - ✅ 正例：L4 取空 → `fetch_buyer.py` 自动反查并回退父类目（如"床头柜"→"卧室家具"）→ §4 标注"买家画像基于父类目 卧室家具，非本品类精确数据"。
  - 详见 `data-acquisition.md` 维度④。
- **§7 行动清单附推荐商品表**：编号行动项之后，附「推荐商品/供应商」表格（缩略图 / 商品名+链接 / 参考价 / MOQ），数据取自 Step 2 的 `product_selection` 或 `product_supplier_search` 返回；无数据时省略该表。
- **§1-§4 逐段来源标注**：每个数据维度 section 末尾必须附 `> 数据来源：{该维度实际使用的数据源}` 行；§5-§7 为 AI 推断/汇总段，按模板已有标注即可。

### ⛔ 表格格式规则

1. 每行 `|` 开头结尾；2. 分隔行只用 `|` `-` 空格；3. 表格前后各一空行；4. 列数一致；5. 价格用纯数字、列名标单位、不用 `$`；6. 价格区间用 `-` 不用 `~`；7. 全是 `-` 的列直接删除。

### 数据来源摘要（强制）

报告顶部 `> 数据来源：` 行**只列实际成功调用、且为报告提供了数据的来源** + 统计时间，例如：
`> 数据来源：阿里巴巴国际站市场参谋（统计 2026-05）+ Amazon 销量近30天 + Google 搜索趋势 | 分析方式：数据+AI推断，统计于 2026-06-02`

> ⛔ **不展示失败/未成功调用的过程**：数据来源行（及顶部摘要区）**禁止**出现"某接口调用失败/超时/为空""某维度降级""已用 X 替代 Y"之类的过程性说明。调用失败、空返回、降级都属于内部执行细节，对用户不可见。
> - 来源行只保留**最终真正贡献了数据的来源名**；某来源没成功就**直接不写它**，不写"（失败）""（降级）"等后缀。
> - 单维降级后，该 section 内的来源徽章（🟡/🟠）仍正常标注数据可信度——这是对"数据本身可信度"的标注，**不是对"调用过程失败"的暴露**，两者区别：徽章贴在数据/结论上，过程性失败描述则一律不出现。
> - 若发生**多维降级或全量降级**（第 2/3 层），仍按对应层级要求在正文（决策结论之前 / 顶部 ⚠️）给出"未覆盖项 + 重试引导"——这是为保证结论可信必需的披露，**与"不展示单次调用失败过程"不冲突**：前者讲"哪些维度信息暂缺、怎么补"，后者禁止的是"逐条罗列某命令调用失败"的噪音。

> ⛔ **对话中输出 summary 后立即停止**——不再发起任何工具调用或流程。

### 对话追问（必须出现）

> 输出 summary 后，**必须**在对话末尾追加追问段，然后停止。追问段始终输出，不以链接有无作为是否输出的条件。

> ⛔ **单一来源（SSOT）原则**：追问段**只生成一次**，同步写两处——报告文件末尾 + 对话 summary 末尾，两处**逐字相同**（包括标点、空行、引号、表情符号）。

**输出格式**：

---

> 💡 **进一步探索**
>
> 基于本次分析，你还可以：
> - "{followup_1}"
> - "{followup_2}"
> - "{followup_3}"（可选）

> ⚠️ **summary 与追问段必须连续输出、作为同一个交付正文整体提交**。若结果需封装为结构化 `delivery` 字段透传，则该 `delivery` 字段必须**同时包含 summary 与追问段**——禁止只把 summary 写入 `delivery` 而把追问段留在 `delivery` 之外。
>
> **追问内容**：1-3 条快捷指令，每条包含**粗体动作标题** + 一句话说明（引用报告中的具体数据）+ 用户可直接复制的快捷指令。追问内容按以下规则分场景生成：
>
> #### URL 发品白名单（核心约束）
>
> 目前生意助手**只具备 Amazon 和 1688 链接的 URL 发品能力**。其他平台链接**不得**触发 URL 发品追问，避免空头承诺。
>
> | 链接来源 | URL 发品支持 | 在追问段中的处理 |
> |---------|------------|----------------|
> | Amazon（amazon.com / amazon.*） | ✅ 支持 | 触发 URL 发品追问 |
> | 1688（detail.1688.com / 1688.com / m.1688.com） | ✅ 支持 | 触发 URL 发品追问 |
> | 阿里巴巴国际站（alibaba.com） | ❌ 不支持 | **禁止**触发 URL 发品追问 |
> | Temu / SHEIN / Shopee / TikTok Shop / eBay / AliExpress / Lazada | ❌ 不支持 | **禁止**触发 URL 发品追问 |
>
> ##### ⚠️ 强制前置判定（生成发品追问前必须执行，不可跳过）
>
> 场景判定**只看链接域名，不看"表格里有没有链接"**。生成任何发品追问前，先对该商品链接执行域名检查：
> 1. 逐字符提取链接的域名部分。
> 2. 仅当域名命中 `amazon.*` **或** `1688.com / detail.1688.com / m.1688.com` 时，才允许生成发品追问。
> 3. 域名为 `alibaba.com`（含 `*.alibaba.com`）或其他任何平台 → **一律禁止发品追问**，直接走场景 B。
>
> > 🔴 **本 skill 默认走场景 B**：§2 TopN 表格与 §7 推荐商品表的数据来自产品参谋 / 站内供给搜索，返回的链接**100% 是 `alibaba.com` 国际站链接**，属于黑名单。因此"§2/§7 表格里有商品链接"**不是**场景 A 的触发条件——这些链接**永远不能**用于发品追问。只有当报告正文（如 §5/§6 引用）中**显式出现了 Amazon 或 1688 域名链接**时，才进入场景 A。
>
> **场景 A：报告正文中显式出现了 Amazon（amazon.*）或 1688（*.1688.com）域名的商品链接**
> - 触发条件 = 通过上方"强制前置判定"、域名确认为 amazon/1688 的链接（**不以"§2/§7 表格有链接"为依据**）
> - **发品保底**：仅当存在已通过域名校验的 Amazon/1688 链接时，"帮我把第 X 个商品发到国际站"才作为第 1 条
> - 其余 1-2 条从以下自选："帮我在 1688 找第 X 个商品的同款"、"帮我深入分析第 X 个产品的竞争情况"
> - 每条引用报告中的具体数据（商品名、排名、链接）
>
> **场景 B（本 skill 默认场景）：报告中的商品链接均为国际站/Temu/SHEIN/Shopee/TikTok/eBay/AliExpress 等不具备 URL 发品能力的平台（无任何通过域名校验的 Amazon/1688 链接）**
> - 追问内容改为基于报告数据的后续探索建议，1-3 条
> - 推荐选项（按报告实际数据选取 1-3 条）：
>   - "帮我深入分析 [报告中提及的某个品类/细分] 的竞争情况"
>   - "帮我找 [报告中提及的某个市场/国家] 的蓝海机会"
>   - "帮我看看 [报告中提及的某个品类] 在 1688 上的供货情况"
>   - 其他基于报告§5 机会路径或§7 行动清单中具体建议的后续动作
> - **不提供发品指令**：国际站/Temu/SHEIN/Shopee/TikTok/eBay/AliExpress 等平台的商品链接不具备 URL 发品能力，不生成发品相关追问
>
> **选择规则**：
> - **不重复维度**：3 条建议覆盖不同动作类型。
> - **不推荐自己**：不要建议"再查一次市场"。
> - **不硬凑**：如果可选动作不足 3 条，输出 2 条即可。
> - **报告追问一致性**：如果报告中包含"进一步探索""下游技能入口""关联分析"等模块（如§7 行动清单中的下游技能推荐），追问段中的建议须与报告中的相关内容保持一致（相同的下游技能/动作方向），不得出现报告中推荐了某下游技能但追问段完全忽略、或追问段推荐了报告中未提及的方向的情况。
>
> **输出格式**：
> ```
> 基于以上分析，您可能感兴趣的下一步：
>
> 1. **[动作标题]**
>    [一句话说明为什么推荐，引用报告中的具体数据]
>    > 💬 您可以直接说："[快捷指令]"
>
> 2. **[动作标题]**
>    [一句话说明为什么推荐，引用报告中的具体数据]
>    > 💬 您可以直接说："[快捷指令]"
>
> 3. **[动作标题]**（可选）
>    [一句话说明为什么推荐，引用报告中的具体数据]
>    > 💬 您可以直接说："[快捷指令]"
> ```

---

## 错误处理与降级交付

> ★ **核心原则**：工具失败/空返回/报错 = 该维度数据不可用的信号，走降级路径即可。不调试、不修 PATH、不编造数据。始终交付完整结构的全景报告。
> ★ **"返回为空"等同"调用失败"**——`rows=[] / products=[] / summary.total=0`、矛盾数据（"Found N" + "No products"），均视为失败。

### 状态机：每个维度的生命周期

每个维度独立走以下状态机，互不阻塞：

```
[调用主工具] ──成功──→ ✅ 完成（数据入报告）
     │
     失败/空
     ↓
[重试 1 次] ──成功──→ ✅ 完成
     │
     仍失败/空
     ↓
[调用该维降级路径] ──成功──→ ✅ 完成（标降级徽章）
     │
     仍失败/空
     ↓
[web_search 定性补充] ──有结果──→ ✅ 完成（标 🟠/🔴）
     │
     无结果
     ↓
[写"该维度数据暂缺" + 保留 section 标题] → ✅ 完成
```

### 降级路径速查表（按维度）

| 维度 | 主工具 | 降级路径 1 | 降级路径 2 | 降级路径 3（兜底） | 报告标注 |
|------|--------|-----------|-----------|------------------|---------|
| ① 行业大盘 | `market_detail` + `market_trend` | `industry_cate_rank`（子类目排名） | `product_selection` 定性估算 | `web_search`（市场规模/CAGR） | "⚠️ 行业大盘基于商品排行+公开来源估算" |
| ② 竞争/TopN | `product_selection` | `product_supplier_search` | `web_search` 定性 | — | "⚠️ 竞争格局基于供给数据/公开来源估算" |
| ② 卖家画像 | `seller_portrait` | 省略画像段落，仅用商品排行 | `web_search` 定性描述 | — | "⚠️ 竞争格局基于公开来源" |
| ③ 国家需求 | `industry_country_rank` | `product_selection --countryId` | `web_search`（海关/热销）**不编造排名** | — | "⚠️ 国家需求为公开来源定性推断" |
| ④ 买家画像 | **`fetch_buyer.py`（禁手工散调三工具，nd=30d，禁90d/TOTAL）**| 脚本内置：窄类目空→**自动反查并回退父类目重查**（source_granularity=parent，§4 标注"基于父类目"）| 父类目仍空→`web_search`（偏好/痛点）+ 热销规格反推 | — | "🟠 基于公开数据的 AI 推断" |
| ④½ 机会发现 | `opportunity_discovery`（cateId+sceneName 双传）| 相关性校验失败→sceneName 重查；仍无关→**蓝海是主诉求则 web 兜底**，仅顺带维度才丢弃标注 | `web_search` 推断 | — | "🟠 AI 推断" |
| ⑤ 站外验证 | `js_product_database_query` + `global_hot_selling`（点名平台必全试；未点名限2个）| 互换工具重试 | `web_search` 需求量级 | — | "⚠️ 站外需求基于公开来源估算" |
| ⑥ 趋势热点 | `web_search` | 不强凑 | 写"本周期无显著公开热点" | — | 据实说明 |
| ⑦ 推荐商品 | `product_supplier_search` | 标注"暂不可用" + 给搜索链接 | — | — | 链接 `alibaba.com/trade/search?SearchText=<品类>` |

### 全局降级层（跨维度统计）

| 层 | 触发条件 | 报告处理 |
|----|---------|---------|
| **L1 单维降级** | 1-2 个维度失败 | 该维走上方状态机，其余维度照常。section 照常输出，不删段不留空 |
| **L2 多维降级** | ≥3 个维度失败（仍有部分数据） | 保留全部 7 个 section 标题；缺数据写"暂缺（已降级）"；§6 之前列「未覆盖项 + 重试引导」；结论置信度下调 |
| **L3 全量降级** | 站内+站外全空/全失败 | 用 `web_search` 出"行业热点+通用策略"填充全景结构；顶部标"⚠️ 站内外结构化数据暂不可用"；§6 降级为"信息不足" |

### 降级铁律（5 条）

| # | 规则 |
|---|------|
| 1 | **部分交付 > 全有或全无**——某维缺失，其余照常 |
| 2 | **降级后仍要交付**——不能以"正在处理"结束 |
| 3 | **禁止搜索修复**——不搜 PATH、不调试脚本、不探索文件系统，直接走 fallback |
| 4 | **禁止编造**——拿不到就 `-` 或文字定性，不造数字 |
| 5 | **每维只试一轮**——主工具 → 重试 1 次 → 降级路径 → 完成。不换关键词反复尝试 |

---

## 报告导出（可选）

仅当用户**明确要求**导出 Excel/Word/PDF 时，告知用户当前环境暂不支持自动导出，建议手动复制报告内容。
未拿到文件真实路径前不得声称“已导出”。

---

## 自检

| # | 检查项 |
|---|-------|
| 1 | **未做任何意图/场景判定**，直接跑全维度、出一份全景报告；路由由 description 语义匹配决定，不以用户是否提及关键词为准 |
| 2 | **最小追问**：仅在"query 无品类且画像无品类"时追问；市场/周期均静默默认，未追问 |
| 3 | Step 2 只用了 `references/data-acquisition.md` 允许的工具，全维度尽量并发 |
| 4 | 报告顶部"数据来源 + 时间"摘要**只列成功贡献数据的来源**，未出现接口失败/超时/空/降级等过程性说明 |
| 5 | 报告 7 个 section 齐全（缺数据维度已降级标注，未删段、未留空） |
| 6 | 主标题为《[品类][市场]市场全景分析》无特殊连接符；「6. 决策结论」在「5. 机会与切入路径」之后、「7. 行动清单」之前，含「是否介入 + 如何切入」 |
| 7 | 空数据/失败已按状态机流程降级处理并标注来源徽章 |
| 8 | 表格前后有空行、列数一致、价格纯数字、无全 `-` 列 |
| 9 | 没有暴露内部工具名/参数/评分公式 |
| 10 | 链接/图片用原始值或脚本预组装值，未自己拼接 |
| 11 | 没有自己写 python/bash 脚本；没有 read_file 读 workctl 结果文件 |
| 12 | 没有编造任何数据；降级处已标注 |
| 12.5 | **类目预测只做一次**：cateId 在第一次 `category-infer` 后复用至所有维度，未重复调用 |
| 13 | Section 7（报告结尾）有编号行动清单 + 下游技能入口 |
| 14 | §2 TopN 表格含缩略图 (`![img]`) 和产品链接 (`[名称](url)`) 列 |
| 15 | §3 国家需求为 5 列表格（非 bullet list） |
| 16 | §7 行动清单后附推荐商品/供应商表格（有数据时） |
| 17 | §1-§4 每段末尾有 `> 数据来源：` 标注行 |
| 18 | 完整报告已写入以报告标题为文件名的 `.md` 文件，对话中仅输出 summary（标题 + 文件路径 + 关键数据维度发现），**summary 输出后未再发起任何工具调用** |
| 19 | **工具调用与报告写入严格分离**——写入报告文件的过程中未穿插任何工具调用（搜索、数据获取、read_file 等），summary 输出后流程已终止 |
| 20 | 对话末尾已输出追问段（1-3 条快捷指令）；**发品追问前已对链接做域名校验**——仅当域名为 amazon.* 或 *.1688.com 时才出现发品指令；§2/§7 的 alibaba.com 链接**未**触发发品追问（本 skill 默认场景 B，追问为基于报告数据的后续探索建议，无发品指令）；追问段与报告中§7 行动清单/下游技能入口保持一致 |
| 21 | 追问段是否与 summary 一起放入同一交付正文（若封装为 `delivery` 字段，二者是否都在该字段内）？禁止只透传 summary 而遗漏追问段 |
| 22 | 报告导出：未调用 `sessions_spawn` 或声称已导出 Excel/Word/PDF；用户要求导出时已告知当前环境不支持自动导出 |
| 23 | **评分脚本已执行**：`score_market.py` 在全部维度取数完成后被调用，§6 决策结论使用了脚本输出的 `label` + `reasoning`（非 agent 散文推导） |

---

## Dependencies

| Tool | Purpose |
|------|---------|
| `data_advisor_industry_cate_rank` | 站内行业大盘/子类目排名（市场参谋·查行业） |
| `data_advisor_industry_country_rank` | 站内国家/地区需求排名（市场参谋·查国家） |
| `data_advisor_industry_market_detail` | 站内行业大盘数据：规模/增速/转化/供需 + 排名 |
| `data_advisor_industry_market_trend` | 站内行业趋势：时间序列规模/增速/转化/供需 |
| `data_advisor_industry_seller_portrait` | 站内卖家画像：星级/询盘/GMV 档位/品类集中度/RTS 占比 |
| `data_advisor_industry_buyer_profile` | 站内买家画像：买家类型/优质买家占比/平台时段分布 |
| `data_advisor_industry_buyer_channel` | 站内买家渠道偏好 |
| `data_advisor_industry_crowd_insight` | 站内人群洞察：买家分布/环比 |
| `data_advisor_category_infer` | 类目预测（拿 cateId） |
| `data_advisor_product_selection` | 站内商品排行（TopN/询盘/GMV/价格带） |
| `data_advisor_opportunity_discovery` | 站内产品机会发现（搜索词级供需/蓝海信号） |
| `js_product_database_query` | Amazon 需求侧数据 |
| `global_hot_selling_products` | Temu/SHEIN/TikTok/Shopee/1688 热销 |
| `web_search` | 趋势/资讯/季节性/海关统计/买家偏好 fallback |
| `product_supplier_search` | 站内供给密度/价格兜底 |
| `$SCRIPTS_DIR/extract_market.py` | 行业/国家排名提取 + 大盘汇总 |
| `$SCRIPTS_DIR/extract_market_detail.py` | 行业大盘指标提取（规模/增速/转化/供需） |
| `$SCRIPTS_DIR/extract_topn.py` | 商品排行 TopN 提取 + 价格带汇总 |
| `$SCRIPTS_DIR/extract_demand.py` | 站外需求（Amazon/全平台热销）提取 |
| `$SCRIPTS_DIR/extract_opportunity.py` | 产品机会词提取 + 供需比 + 蓝海信号 |
| `$SCRIPTS_DIR/extract_seller.py` | 卖家画像提取（星级/询盘/GMV 档位/品类集中度） |
| `$SCRIPTS_DIR/extract_buyer.py` | 买家画像提取（买家类型/渠道偏好/人群洞察） |
| `$SCRIPTS_DIR/score_market.py` | 4D 市场机会评分（D/C/G/F → label + reasoning，供§6 决策结论） |

> 以下文件的核心内容已整合到 `data-acquisition.md`（工具参数、降级路径、徽章定义、评分模型），正常流程无需打开：`references/platform-config.md`、`references/global-tools.md`、`references/data_source_badges.md`、`references/scoring_model.md`。

---

## Examples

> 以下所有问法**都走同一条全景主线**：跑全维度 → 写入以报告标题为文件名的 `.md` 文件。差别仅在"用户强调的维度重点展开"，绝不裁剪其余维度、绝不追问方向。
> 命令全部来自 `references/data-acquisition.md` 代码块——直接复制执行，不要自造参数。

**"竹家具这个市场值不值得做，帮我做个市场全景分析"**（标准全景）

```
[Phase 1 · 类目预测]
workctl icbu product data-advisor-category-infer --categoryDesc "竹家具" --format json --output infer.json

[Phase 1 · 全维度并发（复用 cateId）]
workctl icbu product data-advisor-industry-cate-rank --cateId 100007073 --orderBy abCnt --orderModel desc --rankType 1 --format json --output industry.json ; python3 $SCRIPTS_DIR/extract_market.py industry.json
workctl icbu product data-advisor-industry-market-detail --cateId 100007073 --format json --output market-detail.json
workctl icbu product data-advisor-industry-market-trend --cateId 100007073 --format json --output market-trend.json
python3 $SCRIPTS_DIR/extract_market_detail.py market-detail.json market-trend.json
workctl icbu product data-advisor-product-selection --cateId 100007073 --statisticsType 30d --orderBy rec_ord_amt --order desc --format json --output rank.json ; python3 $SCRIPTS_DIR/extract_topn.py rank.json
workctl icbu product data-advisor-industry-seller-portrait --cateId 100007073 --format json --output seller-portrait.json ; python3 $SCRIPTS_DIR/extract_seller.py seller-portrait.json
workctl icbu product data-advisor-industry-country-rank --cateId 100007073 --orderBy abCnt --orderModel desc --rankType 1 --format json --output country.json ; python3 $SCRIPTS_DIR/extract_market.py country.json
workctl icbu product data-advisor-opportunity-discovery --cateId 100007073 --sceneName "bamboo furniture" --statCycle 30d --terminalType TOTAL --currentPage 1 --pageSize 20 --format json --output opportunity.json ; python3 $SCRIPTS_DIR/extract_opportunity.py opportunity.json 20 --keywords "bamboo furniture,bamboo,furniture,竹,家具"
python3 $SCRIPTS_DIR/fetch_buyer.py 100007073 --nd 30d --dump-dir . > buyer.json   # 一条命令取全 profile+channel+crowd，内置 nd白名单/重试/父类目回退；用户要7d传 --nd 7d；--dump-dir 额外落盘 buyer-profile/buyer-channel/crowd-insight.json 供 score_market.py 使用；输出含 source_granularity/nd_used/profile/channel/crowd
accio-mcp-cli call js_product_database_query --json '{"include_keywords":["bamboo furniture"],"marketplace":"us","page_size":50}' > amazon_demand.json ; python3 $SCRIPTS_DIR/extract_demand.py amazon_demand.json amazon
accio-mcp-cli call global_hot_selling_products --json '{"query":"bamboo furniture","platform":"amazon","region":"US","sorting_rule":"sales","type":"hot_selling"}' > global_hot.json ; python3 $SCRIPTS_DIR/extract_demand.py global_hot.json global   # 首选amazon(未指定平台时)；空则仅再试1个备选temu；aliexpress禁用,shein降权
web_search "bamboo furniture global market size 2025 2026 USD CAGR"
web_search "bamboo furniture market seasonality buyer preferences"
product_supplier_search(query="竹家具")

[Phase 1 · 汇总评分]
python3 $SCRIPTS_DIR/score_market.py --detail market-detail.json --trend market-trend.json --topn rank.json --seller seller-portrait.json --opportunity opportunity.json --buyer-profile buyer-profile.json --buyer-channel buyer-channel.json --crowd crowd-insight.json --amazon amazon_demand.json --category-context category_context.json

[Phase 2 · 一次性写入]
报告文件：1.规模&增速 2.竞争格局 3.国家分布 4.买家画像 5.切入路径 6.决策结论 7.行动清单
```

**"列出近一个月国际站男士夹克销量 Top10"**（用户侧重榜单 → 仍出全景，§2 重点展开）

```
[Phase 1] 同上全维度并发；product-selection 取 Top10（orderBy rec_ord_amt）
[Phase 2] 报告文件：完整 7 段，§2 给出 Top10 榜单（缩略图/售价/指数/价格带/热销原因）
```

**"近一个月俄罗斯、墨西哥最畅销的工程机械零件"**（用户侧重国家 → 仍出全景，§3 重点展开）

```
[Phase 1] 同上全维度 + 额外拉分国家机会：
workctl icbu product data-advisor-opportunity-discovery --cateId <id> --statCycle 30d --terminalType TOTAL --currentPage 1 --pageSize 20 --countryId RU --format json --output opportunity-ru.json
web_search "construction machinery parts best selling Russia Mexico cultural background"
[Phase 2] 报告文件：§3 国家需求分布给出 RU/MX 排名 + 规格偏好 + 文化季节解读
```

**"欧美市场晚礼服的买家偏好"**（用户侧重买家 → 仍出全景，§4 重点展开）

```
[Phase 1] 同上全维度；buyer-profile + buyer-channel + crowd-insight 为 §4 主料
[Phase 2] 报告文件：§4 买家画像给出人群/偏好/痛点/决策因素
```

**任一维度数据为空/失败**（兜底）

```
[Phase 1] industry-cate-rank unknown_flag / 返回空 → 核对 data-acquisition.md 代码块一次 → 仍失败 → 立即降级 web_search
[Phase 2] 报告文件：第 1 节照常写入（标"⚠️ 行业大盘基于公开来源估算"），其余维度正常；
       若多维为空，保留全部 7 段标题，缺数据段写"数据暂缺（已降级）"，末尾列未覆盖项+重试引导
```
