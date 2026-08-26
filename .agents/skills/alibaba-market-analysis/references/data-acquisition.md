# 全维度取数总指引（市场全景分析唯一取数 reference）

> 本 skill **始终跑全维度、出一份全景报告**，不做意图/场景分支。本文件整合全部六个维度的取数步骤；执行时**全维度尽量并发**，任一维空/失败按本文 + SKILL.md「错误处理与降级交付」逐维降级，不阻塞其余维度。

## 📂 路径约定

> **数据文件**：所有 `--output` 和 `accio-mcp-cli` 重定向均写入**当前工作目录**（如 `--output industry.json`）。
> **脚本文件**：`scripts/` 目录位于 **skill 安装路径下**（agent 读取 SKILL.md 时拿到的 `install_path`/scripts/），**不在当前工作目录**。所有脚本调用必须使用 `$SCRIPTS_DIR` 变量。
> 执行前先定义（从 skill 元数据的 `install_path` 获取）：
> ```bash
> SCRIPTS_DIR="<skill_install_path>/scripts"  # agent 从 skill(action=read) 返回的 install_path 拼接
> ```
> 下文所有 `python3 $SCRIPTS_DIR/xxx.py` 中的 `$SCRIPTS_DIR` 均指此变量。
> 下文命令中的 `<filename>` 均指当前工作目录下的文件名。

> ⚠️ **workctl 参数格式**：workctl data-advisor 系列工具使用**平铺参数**（`--cateId <id> --orderBy abCnt`），不支持嵌套 JSON wrapper（如 `--industryRankQueryParam '{...}'`）和 `--json` flag。`accio-mcp-cli` 仍使用 `--json '{"wrapperParam":{...}}'` 嵌套格式作为 fallback。

## 🔧 允许工具
- `data_advisor_industry_cate_rank`（站内行业大盘 · 子类目排名）
- `data_advisor_industry_country_rank`（站内国家需求排名）
- `data_advisor_industry_market_detail`（站内行业大盘数据 · 规模/增速/转化/供需 + 排名）
- `data_advisor_industry_market_trend`（站内行业趋势 · 时间序列规模/增速/转化/供需）
- `data_advisor_industry_seller_portrait`（站内卖家画像 · 星级/询盘/GMV 档位/品类集中度）
- `data_advisor_industry_buyer_profile`（站内买家画像 · 买家类型/优质买家/时段分布）
- `data_advisor_industry_buyer_channel`（站内买家渠道偏好）
- `data_advisor_industry_crowd_insight`（站内人群洞察 · 买家分布/环比）
- `data_advisor_category_infer` + `data_advisor_product_selection`（站内商品排行/价格带/规格）
- `data_advisor_opportunity_discovery`（站内产品机会发现 · 搜索词级供需/趋势）
- `js_product_database_query`（Amazon 需求验证 · **通过 bash `accio-mcp-cli call` 调用，如调用失败则降级 `global_hot_selling_products` + `web_search`**）
- `global_hot_selling_products`（**通过 `accio-mcp-cli call` 调用，禁止用 workctl**——workctl stdout 为空，无法落盘）
- `web_search`（市场规模/CAGR/趋势/季节/买家偏好/行业热点）
- `product_supplier_search`（供给密度兜底；"声称有结果但实际为空/矛盾"等同失败，重试 1 次仍同样 → §7 标注不可用 + 给搜索链接，不再换词重试）
- 脚本：`extract_market.py`、`extract_topn.py`、`extract_demand.py`、`extract_opportunity.py`、`extract_market_detail.py`、`extract_seller.py`、`extract_buyer.py`、`score_market.py`

## ❌ 禁止
- 自写 python/bash、read_file 读结果文件、暴露工具名/评分公式、编造数据、做意图分支。
- **文件写入规则**：
  - ✅ 允许：`--output <path>` 写中间 JSON 到当前工作目录
  - ✅ 允许：最终报告写入以报告标题为文件名的 `.md` 文件
  - ❌ 禁止：创建 `/tmp` 临时文件、自写脚本文件、写其他任何文件
- **搜索 workctl / accio-mcp-cli 二进制路径**：两者都 command not found 时，该环境没有可用工具链，走降级路径。花 bash 调用搜索文件系统是纯浪费。

## ⚡ 取数执行纪律

- 站内多条 bash 命令用 `;` 隔离（绝不用 `&&`——一条失败不应跳过后续命令）
- 每条命令独立 `--output <path>`，执行前先清旧文件（`rm -f <path>; workctl ...`——此处 `rm -f` 是清理中间文件的必要操作，不属于“禁止删除文件”的范畴）
- 拿到 `cateId` 后先校验关键链路（`cateDesc` 相关性）再并发展开全维度
- 站外接口（`js_product_database_query` / `global_hot_selling_products`）失败 → 重试 1 次即降级，不反复尝试
- **workctl / accio-mcp-cli 双失败 → 立即降级，禁止搜索**：
  - workctl 失败（command not found / exit 127 / 超时）→ 试 `accio-mcp-cli call <tool_name> --json '{...}' > <output_path>`
  - accio-mcp-cli 也失败 → **该维度直接降级到 web_search，禁止花时间搜索二进制路径、尝试修复 PATH、或探索其他工具链**
  - 降级不是 bug——skill 的降级路径已设计好，走降级路径比修环境更重要
  - 各命令的 fallback 写法见下方代码块旁注

## 📌 错误即降级信号

工具/脚本在执行过程中遇到的任何异常，都是**该维度数据不可用**的信号——按对应维度的降级路径处理即可，不需要排查原因：

| 现象 | 含义 | 处理 |
|------|------|------|
| workctl + accio-mcp-cli 都 command not found | 工具链环境不可用 | **全部站内维度降级**到 web_search + product_supplier_search，不搜索二进制 |
| 脚本 Traceback / KeyError / 解析失败 | 输入数据格式与脚本预期不匹配 | 该维度降级（跳过脚本，用 web_search 定性补充） |
| `--output` 未生成文件 / 文件为空 | 该命令在当前环境不可用 | 该维度降级 |
| 工具返回矛盾数据（"Found N" + "No products"） | 等同调用失败 | 重试 1 次，仍同样则该维度降级 |
| `workctl --help` 以外的 stderr 警告 | 不影响执行的平台日志 | 忽略，看 stdout / `--output` 结果 |

以上每种情况都是数据层面的信息（"这个维度的数据当前不可用"），不是需要解决的技术问题。

---

## Phase 0 · 类目预测（只做一次，全维度复用）

> ★ **类目预测全生命周期只调一次**。拿到 `cateId` 后写入 `category_context.json`，后续所有维度直接复用，**不再重复调用 `category-infer`**。

```bash
rm -f infer.json ; workctl icbu product data-advisor-category-infer --categoryDesc "<品类>" --format json --output infer.json
```
> **fallback**：`accio-mcp-cli call data_advisor_category_infer --json '{"categoryDesc":"<品类>"}' > infer.json`

校验 `cateDesc` 相关性（不相关重试，最多 2 次；仍不相关改用 `product_supplier_search`）。拿到 cateId 后：

```bash
# 写入 category_context.json 供后续全部维度复用
echo '{"cateId":<id>,"cateDesc":"<品类>","cateLevel":"<level>"}' > category_context.json
```

---

## 并发分组（站内块 A 与站外块 B 并行）

### 维度 ① 行业规模 + 大盘增速（站外块 B + 站内块 A 并行）

> ★ **§1 的主体是 web_search 宏观结论（行业规模 USD、CAGR、季节性），站内市场参谋数据为补充。** 站内市场参谋提供平台内询盘/UV 指数，不等于行业规模。

**主体取数（站外 · web_search）——与站内并发执行：**
```
web_search "<品类> global market size 2025 2026 USD"
web_search "<品类> market CAGR forecast"
web_search "<品类> seasonality demand trend"
```
- 提取：行业规模（USD）、增速（CAGR）、增长驱动因素、季节性高低峰月份。
- 优先近 1 年的行业报告（Statista / Grand View / Mordor / Technavio 等）。

**补充取数（站内 · 市场参谋）：**
> ⚠️ `industry-cate-rank` 需要数字 `cateId`，**不接受品类描述**。复用 Phase 0 的 `category_context.json` 中的 cateId，**不要再次调用 category-infer**。

```bash
# 用 Phase 0 的 cateId 查行业大盘
workctl icbu product data-advisor-industry-cate-rank --cateId <id> --orderBy abCnt --orderModel desc --rankType 1 --format json --output industry.json
python3 $SCRIPTS_DIR/extract_market.py industry.json
```
> **fallback**：`accio-mcp-cli call data_advisor_industry_cate_rank --json '{"industryRankQueryParam":{"cateId":<id>,"orderBy":"abCnt","orderModel":"desc","rankType":"1"}}' > industry.json`
- 看大盘增速时并发再拉一次 `--orderBy abCntYoy`；看蓝海机会用 `--rankType 3`。
- **行业大盘数据 + 趋势**（与上方并发，复用 Phase 0 cateId）：

```bash
# 行业大盘指标（规模/增速/转化/供需 + 各指标排名）
workctl icbu product data-advisor-industry-market-detail --cateId <id> --format json --output market-detail.json
# 行业趋势时间序列
workctl icbu product data-advisor-industry-market-trend --cateId <id> --format json --output market-trend.json
# ⚠️ 脚本必须在两个文件都生成后才执行（不要与上方并发）
python3 $SCRIPTS_DIR/extract_market_detail.py market-detail.json market-trend.json
```
> **fallback**：`accio-mcp-cli call data_advisor_industry_market_detail --json '{"cateId":<id>}' > market-detail.json`
> **fallback**：`accio-mcp-cli call data_advisor_industry_market_trend --json '{"cateId":<id>}' > market-trend.json`
- market_detail 返回 `abCnt`(市场规模)、`abCntYoy`(增速)、`supplyDemandRate`(供需)、`dAbRate`(转化率) + 各指标排名，直接用于§1 站内数据表格。
- market_trend 返回时间序列（每个 `statDate` 对应一组规模/增速/供需/转化），用于§1 增速趋势描述和§5 趋势信号。
- 失败/空 → 降级到 `industry_cate_rank`（A 节仍有子类目排名）+ `web_search`。
- 站内失败/空 → 重试 1 次 → 仍失败/空：§1 仍以 web_search 宏观结论为主体输出，省略站内补充表格。
- web_search 也无结果 → 降级：用 `data_advisor_product_selection`（商品排行近似行业热度 + 价格带）+ `web_search`（"<品类> market size"）定性估算；报告标注"⚠️ 行业大盘基于商品排行+公开来源估算"。

### 维度 ② 竞争格局 + 热销 TopN + 价格带（站内块 A）

> ⚠️ **复用 Phase 0 的 `category_context.json`**，不要再次调用 `category-infer`。

校验 `cateDesc` 相关性（不相关重试，最多 2 次；仍不相关改用 `product_supplier_search`）。拿 cateId 后（用 Phase 0 结果，不 read_file）：

```bash
workctl icbu product data-advisor-product-selection --cateId <id> --statisticsType 30d --orderBy rec_ord_amt --order desc --format json --output rank.json
python3 $SCRIPTS_DIR/extract_topn.py rank.json
```
> **fallback**：`accio-mcp-cli call data_advisor_product_selection --json '{"productSelectionParam":{"cateId":<id>,"statisticsType":"30d","orderBy":"rec_ord_amt","order":"desc"}}' > rank.json`
- 用户要 TopN（如 Top10）→ 取脚本输出前 N 条。
- 排序：默认 GMV `rec_ord_amt`；"询盘多"用 `ab_cnt`；可并发两种排序（`workctl batch call --file <batch.json> --format json`，batch spec：`{"steps":[{"name":"rank_inquiry","path":"icbu.product.data-advisor-product-selection","params":{"cateId":<id>,"statisticsType":"30d","orderBy":"ab_cnt","order":"desc"}},{"name":"rank_gmv","path":"...","params":{...,"orderBy":"rec_ord_amt"}}]}`）。
- 用户加筛选 → 加对应 flag：`--countryId`(string)、`--moqMin/Max`(number)、`--abCntMin/Max`、`--uvDetailMin/Max`、`--prepayOrdCntMin/Max`；价格/GMV 上下限 `--moqPriceMin/Max`、`--recOrdAmtMin/Max`（传 JSON object 字符串）。
- 提取：在架商品密度、价格带集中度、头部集中度（红海/蓝海信号）。
- **卖家竞争画像**（与上方并发，复用 cateId）：

```bash
workctl icbu product data-advisor-industry-seller-portrait --cateId <id> --format json --output seller-portrait.json
python3 $SCRIPTS_DIR/extract_seller.py seller-portrait.json
```
> **fallback**：`accio-mcp-cli call data_advisor_industry_seller_portrait --json '{"cateId":<id>}' > seller-portrait.json`
- 返回卖家星级分布（`star0-3CompCntRatio`）、询盘档位（`fb0-3`）、GMV 档位（`rcvd0-3`）、叶子类目 Top4 集中度（`leaf1-4TotalProdCntRatio`）、RTS 占比（`rtsProdCntRatio`）。
- 用于§2 竞争格局的卖家侧分析：头部集中度判断（leaf1 占比高 = 品类集中）、内卷程度（低星级/低询盘占比高 = 长尾竞争为主）、供应链成熟度（RTS 占比高 = 现货供应链成熟）。
- 失败/空 → 降级：§2 仅用 product_selection 商品排行 + `web_search` 定性描述竞争强度，省略卖家画像段落。

### 维度 ③ 目标国家需求分布（站内块 A）

> ⚠️ `industry-country-rank` 也需要数字 `cateId`（复用维度①/②的 `cateId`），**本命令无 `--countryId`**——它返回的就是各国需求排名。

```bash
workctl icbu product data-advisor-industry-country-rank --cateId <id> --orderBy abCnt --orderModel desc --rankType 1 --format json --output country.json
python3 $SCRIPTS_DIR/extract_market.py country.json
```
> **fallback**：`accio-mcp-cli call data_advisor_industry_country_rank --json '{"industryRankQueryParam":{"cateId":<id>,"orderBy":"abCnt","orderModel":"desc","rankType":"1"}}' > country.json`
- `extract_market.py` 输出字段（类目榜 & 国家榜统一）：`abCnt`(市场规模指数)、`abCntYoy`(同比增速)、`supplyDemandRate`(供需比)、`dAbRate`(转化率)、`statDate` ；类目榜额外有 `cateDesc`(类目名)、国家榜额外有 `country`(国家编码)。**不要再用旧字段名 `inquiryIdx/gmvIdx/uvIdx/demandShare/yoy/mom`，接口实际不返回这些。**
- **国家榜补提 `prodInfoList`**：每个国家附带该国 Top 热销商品（`prodName`/`id`/`prodImage`），§3 国家需求章节应展示"各国具体在卖的热销智能窗帘品"，不要只写国家+指数。
- 命令返回全部国家排名；**报告 §3 超过 10 个国家时只展示 Top 10**（表格截断到前 10 行），**少于 10 个则展示实际返回数量**（标题写 Top N）。🟢 **用户明确要"全部国家/全量/某排名区间"（如"列出所有有需求的国家""第 11-20 名"）时不截断**，按用户要求展示对应范围。用户指定国家（如 RU/MX）→ 在脚本输出里筛对应国家，不传 country flag。
- 失败/空 → 重试 1 次 → 降级：用 `data-advisor-product-selection --cateId <id> --countryId <国家>` 分国家拉排行近似需求；规格款式/文化/季节背景用 `web_search` 补**文字定性**，不编造排名数字。
- 该国热销规格/款式（用户问"哪些款/规格"时）：复用 Phase 0 cateId → `product-selection --cateId <id> --countryId <国家>` → `extract_topn.py`。

### 维度 ④½ 产品机会发现（站内块 A · 可与①②③并发）

> 复用维度①/②的 `cateId`，查搜索词级别的供需信号，输出喂给报告§5「机会与切入路径」。

```bash
workctl icbu product data-advisor-opportunity-discovery --cateId <id> --sceneName "<英文品类关键词>" --statCycle 30d --terminalType TOTAL --currentPage 1 --pageSize 20 --format json --output opportunity.json
python3 $SCRIPTS_DIR/extract_opportunity.py opportunity.json 20 --keywords "<英文品类>,<中文品类>,<近义词>"
```
> **fallback**：`accio-mcp-cli call data_advisor_opportunity_discovery --json '{"sceneTermQueryParam":{"cateId":<id>,"sceneName":"<英文品类关键词>","statCycle":"30d","terminalType":"TOTAL","currentPage":1,"pageSize":20}}' > opportunity.json`
> 🔴 **cateId 过滤对 L3/L4 细分类目失效（实测）**，必须 **cateId + sceneName 双传**，sceneName 传品类英文关键词（如 `smart curtain`）。仅传 cateId 时 L4 类目会返回"5G手机/汽车轮毂"等全站无关榜或空。
> 🟠 **相关性校验 + 重查兜底**：脚本 `--keywords` 传目标品类中英文关键词，输出 `relevance.verdict`：
> - `passed` → 正常用于 §5。
> - `failed`（返回大量无关品类，cateId 过滤失效）→ **改用纯 sceneName 重查一次**（去掉 cateId，仅 `sceneName="<品类>"`，实测最精准），重查结果再校验：仍 `failed` → 处理分两种场景：
>   - **蓝海/机会发现是用户主诉求**（如"帮我找镜子的蓝海细分""哪些子类竞争小"）→ **不得直接跳过**，必须用 `web_search`（"<品类> emerging niche / underserved segments / low competition"）+ 维度②热销 TopN 规格差异兆底，给出定性机会方向，标注 🟠 AI 推断。
>   - **蓝海仅为报告顺带维度**（用户只是要整体市场全景）→ 丢弃该维度并在报告 §5 标注"蓝海数据过滤失效已跳过"，绝不把无关品类写入报告。
> - ⚠️ 禁止在 sceneName 缺失时裸传 `countryId`（实测会放大乱序，返回麻将桌等）。
- 默认拉全局机会词；如维度③有明显 Top 国家，可并发加 `--countryId <国家>` 拉分国机会（**前提是 sceneName 已传**）。
- 提取：高搜索热度 + 低供给数的词 = 蓝海信号；高增长词 = 趋势信号。脚本输出 `summary.top_blue_ocean`（供需比最高的 3 个子类目 = 竞争最小）可直接用于§5。高需求指数 + 高供需比 = 蓝海信号；高 busProdRate = 真实需求验证。
- 失败/空 → 降级：用维度②热销 TopN 规格差异 + `web_search` 推断机会方向。
- 汇入§5时与维度⑥的趋势/热点信息交叉，形成"数据支撑的机会路径"。

### 维度 ④ 买家画像 / 痛点 / 偏好（站内买家数据为主 + 站外补充）

- **站内买家数据**（主力，复用 cateId，与站外并发）：

```bash
# 统一入口：一条命令取全 profile + channel + crowd，内置参数硬约束/重试/父类目回退
python3 $SCRIPTS_DIR/fetch_buyer.py <cateId> [--nd 30d] [--parent <父类目id>] [--retries 2]
```
> ⚡ **并发执行（关键性能约束）**：`fetch_buyer.py` 必须与其它维度（①规模 ②竞争 ③国家 ④½机会 ⑤站外 ⑥趋势）**并发发起**，不串行等待。脚本内部的父类目回退（窄类目取空时多跑一轮买家查询）发生在该并行窗口内，被其它维度的耗时吸收，对用户**几乎零感知增量**。
> - 本品类一次命中数据 → 回退分支不进入，**零增量**。
> - 仅 L4 窄类目取空时才触发回退，回退**只重跑买家三件套**（不重跑整份分析），范围最小化。
> - 回退用结构化接口（比 web_search 定性推断更快更稳），实际是把"取空后的慢速 web_search 降级"替换为"快速父类目重查"，净增量很小甚至更快。
> 🟢 **统一走 `fetch_buyer.py`，不要再手拼 workctl/accio-mcp-cli 命令**。脚本已把以下踩坑约束用代码固化（子代理无法绕过）：
> - `nd` 白名单：仅 `7d`/`30d` 放行；传 `90d`/超范围 → 自动降级 `30d` 并在 `warnings` 输出 `nd_downgraded`（报告 §4 须如实告知用户"平台买家维度仅提供近 7/30 天数据"）。用户指定 `7d`/`30d` 时透传 `--nd`。
> - `crowd_insight` 的 `industryId` 强制传具体 cateId（禁 TOTAL）。
> - buyer_profile 自动轮询 `visitor_country→buyers_identity→cate_total`，取到一个有数据的即用。
> - 接口偶发 HTML 错误页/空壳 `[{}]` → 自动重试（默认 2 次）。
> - **窄类目（L3/L4）三工具全空 → 自动回退父类目重查**：输出 `source_granularity:"parent"` + `source_cate_id`，报告 §4 须标注"买家画像基于父类目，非本品类精确数据"。
> **输出字段**：`source_granularity`(self/parent)、`nd_used`/`nd_requested`、`profile`/`channel`/`crowd`（结构同 `extract_buyer.py`）、`warnings`。`is_empty=true` 且无 parent 数据时才降级 web_search。
- buyer_profile：`indxName`(指标类型) + `indxVal`(买家数) + `highQualityIndxValue`(优质买家数) + `indxValRate`(环比) + `extraInfo`(平台时段分布) → 用于§4 买家类型分布、采购规模判断。
- buyer_channel：`indxKey`(渠道名) + `indxVal`(买家数) → 用于§4 渠道偏好分析（PC/APP/WAP 等）。
- crowd_insight：`idxType`(维度) + `idxValue`(买家数) + `idxRate`(环比) → 用于§4 人群规模及增长判断。
- 站内信号：复用维度②的 `rank.json`，从热销款价格带/规格/卖点共性反推偏好。
- **站外补充**（并行多轮，补充痛点/偏好等站内无法覆盖的定性信息）：
  - `web_search "<品类> buyer preferences <市场>"`
  - `web_search "<品类> common complaints / problems reviews"`
  - `web_search "<品类> what customers look for <市场>"`
  - `accio-mcp-cli call js_product_database_query --json '{"include_keywords":["<英文品类>"],"marketplace":"<市场>","page_size":50}'` 看评分/评论数分布、价格敏感段。marketplace 可选 `us`/`uk`/`de`/`jp`，默认 `us`；关键字段：`title`/`price`/`unitsSold`/`revenue`/`rating`/`reviews`/`imageUrl`/`productLink`。如调用失败，用 `global_hot_selling_products` + `web_search` 评论替代。
- 归纳：采购角色 / 采购量级 / 价格敏感度 / 关注认证 / 复购倾向 + Top 痛点（每条配卖家应对动作）。
- 站内买家三工具（buyer_profile / buyer_channel / crowd_insight）全部失败/空 → **先确认 `fetch_buyer.py` 已尝试父类目回退**（`source_granularity` 仍为 `self` 且 `is_empty=true`，即父类目也空或未找到父类目）→ 才降级为纯 `web_search` 定性推断（原有降级路径），标注 🟠 AI 推断。⛔ 未经 `fetch_buyer.py` 父类目回退、仅凭手工散调判空就降级 web_search 或写"数据不可用"，属违规，须回到脚本重取。

### 维度 ⑤ 站外需求交叉验证（站外块 B）

- Amazon 需求：`accio-mcp-cli call js_product_database_query --json '{"include_keywords":["<英文品类>"],"marketplace":"us","page_size":50}' > amazon_demand.json` → `python3 $SCRIPTS_DIR/extract_demand.py amazon_demand.json amazon`
- 跨平台热销：`accio-mcp-cli call global_hot_selling_products --json '{"query":"<英文品类>","platform":"<平台>","region":"US","sorting_rule":"sales","type":"hot_selling"}' > global_hot.json` → `python3 $SCRIPTS_DIR/extract_demand.py global_hot.json global`。
> 🔴 **平台选择与限制轮询（实测）**：
> - **首选平台**：用户 query **未指定**参考平台 → 首选 `amazon`（实测数据最丰富，含月销量趋势）；用户 query **指定**了倾向平台 → 以**用户给定平台为首选**。
> - **限制轮询深度**：首选平台返回空/失败 → **仅再试 1 个备选平台（共最多 2 个），不试满全部**。备选顺序：未指定时 `amazon→temu`；用户指定时 `用户平台→amazon→temu`（取前 2 个）。
> - **单次调用设超时上限**，避免慢平台拖累整体报告生成时间；备选也空 → 该维度降级 `web_search`，不再继续轮询。
> - **空壳判定**：返回 `result:null`（即使 success）或 `total>0 但字段全空` → 视为"空，需切换平台"，不算取数成功。
> - **平台黑名单**：`aliexpress` 实测稳定返回 `failed`，**禁用**；`shein` 窄品类常空，**降权**（不作首选/备选，仅用户显式指定时才用）。可选平台：`amazon`/`temu`/`1688`（`1688` region 传 `CN`）。
- 失败/频控/tool 不可用 → 降级 `web_search` 提取需求量级，标注来源。

### 维度 ⑥ 热点趋势 / 行业资讯 + 搜索趋势（站外块 B）

- ~~`web_search "<品类> global market size ..."`~~ → 已移入维度①作为主体取数，此处不再重复
- `web_search "<品类> google trends"`、`web_search "<品类> demand trend 2026"`（趋势/季节）
- `web_search "<行业> industry news trends 2026"`、`web_search "<行业> latest developments / regulations"`（热点）
- 去重归类成 4-6 个热点主题；每条写"是什么 + 为什么重要 + 对国际站卖家意味着什么"；引用标来源平台 + 日期，优先近 6 个月；拿不到权威信息不强凑。

---

## 汇总评分（4D 内部定性判断 · 脚本化）

> ★ **评分由 `$SCRIPTS_DIR/score_market.py` 自动完成**，agent 不要自行散文推导评分。将各维度的脚本输出喂给评分脚本，直接拿到结构化结论。

```bash
python3 $SCRIPTS_DIR/score_market.py \
  --detail market-detail.json \
  --trend market-trend.json \
  --topn rank.json \
  --seller seller-portrait.json \
  --opportunity opportunity.json \
  --buyer-profile buyer-profile.json \
  --buyer-channel buyer-channel.json \
  --crowd crowd-insight.json \
  --amazon amazon_demand.json \
  --category-context category_context.json
```
- **输入**：各维度的原始 JSON 文件（缺失的文件自动跳过，对应维度标 `no_data`）
- **输出**（stdout JSON）：
  ```json
  {
    "scores": { "demand": 4, "competition": 3, "growth": 4, "fit": 3 },
    "total": 14,
    "label": "🟡 中等机会 — 选准细分进入",
    "missing_dimensions": [],
    "confidence": "high",
    "reasoning": "需求侧旺盛（站内询盘指数靠前 + Amazon 月销稳定），竞争中等，趋势温和上行"
  }
  ```
- 缺失的文件对应的维度标 `null`，`missing_dimensions` 列出缺失维度名，`confidence` 降为 `medium` 或 `low`
- ⛔ **报告只呈现 `label` 和 `reasoning`，不展示 scores 数字/权重/公式。**

## 汇总到全景报告

各维度数据汇入报告文件的对应 section（① → §1，② → §2，③ → §3，④ → §4，④½+⑥ → §5机会路径/趋势，⑤ → 并入§1/§2交叉验证）。**不为任何单维单独出报告。** 缺维度按 SKILL.md 三层兜底降级标注，不删段、不留白。

---

## 数据来源标注（报告用）

### 来源标注 SSOT（三层分离）

| 层级 | 位置 | 规则 | 示例 |
|------|------|------|------|
| **顶部来源行** | 报告 `> 数据来源：` | 只列**成功贡献数据**的来源 + 统计时间 | `阿里巴巴国际站市场参谋（统计 2026-05）+ Amazon 销量近30天` |
| **section 内徽章** | 每个数据段落内 | 按可信度标注（🟢实测/🟡交叉验证/🟠AI推断/🔴降级估算） | `🟢 实测` 贴在平台数据表后 |
| **未覆盖项** | 决策结论之前 | 列出缺失维度 + 重试引导 | `⚠️ 买家画像维度数据暂缺，建议稍后重试`（仅当 `fetch_buyer.py` 父类目回退后仍 `is_empty=true` 才适用；回退成功则不算未覆盖，按"基于父类目"正常出§4） |

> 三层互不冲突：顶部只写成功来源、section 内标可信度、缺失维度在未覆盖项说明。

### 对外平台名（不暴露内部工具名）

| 内部工具 | 报告中写 |
|----------|---------|
| `data_advisor_industry_cate_rank` / `data_advisor_industry_country_rank` / `data_advisor_industry_market_detail` / `data_advisor_industry_market_trend` | 阿里巴巴国际站市场参谋 |
| `data_advisor_industry_seller_portrait` | 阿里巴巴国际站市场参谋·卖家分析 |
| `data_advisor_industry_buyer_profile` / `data_advisor_industry_buyer_channel` / `data_advisor_industry_crowd_insight` | 阿里巴巴国际站市场参谋·买家分析 |
| `data_advisor_product_selection` | 阿里巴巴国际站产品参谋 |
| `js_product_database_query` | Amazon 销量数据 |
| `global_hot_selling_products` | 跨平台热销数据（按实际平台写） |
| `web_search` (Google Trends) | Google 搜索趋势 |
| `web_search` (报告/新闻) | 公开市场报告 / 行业资讯 |
| `product_supplier_search` | 阿里巴巴国际站供给数据 |

### 可信度徽章

| 标记 | 含义 |
|------|------|
| 🟢 实测 | 直接来自平台数据工具 |
| 🟡 交叉验证 | 多源数据相互印证 |
| 🟠 AI 推断 | 基于数据的逻辑推断 |
| 🔴 降级估算 | 主数据源不可用时的近似 |

### section 级脚注模板

- 站内大盘数据表后：`> 数据来源：阿里巴巴国际站市场参谋，统计周期 <statDate>`
- 站内榜单表后：`> 数据来源：阿里巴巴国际站产品参谋，统计周期近30天`
- 国家需求表后：`> 数据来源：阿里巴巴国际站市场参谋·查国家，数据周期 <YYYY-MM>`
- 卖家画像段后：`> 数据来源：阿里巴巴国际站市场参谋·卖家分析`
- 买家画像段后：`> 数据来源：阿里巴巴国际站市场参谋·买家分析`
- AI 研判段落：`> 以上为基于公开数据的 AI 推断，仅供参考`
- 降级估算段落：`> ⚠️ 本段为估算（行业大盘命令暂不可用），请以官方数据为准`
