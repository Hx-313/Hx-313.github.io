---
name: 国际站店铺经营分析
version: "1.0.0"
description: |
  集成国际站店铺经营数据，围绕流量、商品、转化、交易、服务五大维度做客观汇总、归因分析和经营简报/周报。
  数据来源包括经营周报聚合接口、数据参谋原子指标和状态明细数据源，并可按追问下钻渠道、国家、商品、订单、物流、广告等模块。
  不处理市场选品或单一广告/物流操作。
enabled: true

triggers:
  - 店铺经营分析
  - 经营简报
  - 经营周报
  - 店铺诊断
  - 流量分析
  - 转化率分析
  - 询盘分析
  - 订单分析
  - 商品表现
  - 访客数据
  - 经营数据
  - 定时经营报告

examples:
  - 帮我分析一下近 7 天店铺经营情况
  - 生成一份国际站经营周报
  - 最近流量下降是什么原因？
  - 看一下昨天的询盘和转化情况
  - 帮我输出每日经营日报，每天早上 9 点发给我

excludes:
  - skill: alibaba-ads-marketing-analysis
    when: 用户只要普通广告账户/计划诊断、广告写操作、加品删品、暂停恢复或改预算
  - skill: alibaba-icbu-brand-data-report
    when: 用户只要品牌广告数据、同行对比、关键词效果、达标率或履约 CPC
  - skill: alibaba-chat-meta
    when: 用户要查询聊天记录、筛选买家、生成回复话术或服务周报
  - skill: alibaba-market-analysis
    when: 用户要外部行业/市场全景、市场规模、竞争格局或进入策略
  - skill: alibaba-logistics-assistant
    when: 用户要查运费、物流轨迹、发货、HS 编码或关税
workflow: |
  0. ⚠️ 强制执行 `workctl workflow analysis-brief get-date --format json` 获取真实日期（禁止跳过，所有后续日期必须基于此输出；若用户请求非7/30天范围如"最近14天"，需加 `--days 14`）
  0.7. 检测 Query 是否包含定时任务关键词（每天/每周/每月/定时/自动/定期），若包含则标记"首次即建任务"
  0.9. 阅读 references/first-trigger.md 掌握接口字段映射
  1. 运行 `workctl workflow analysis-brief fetch-all-data ... | workctl workflow analysis-brief format-brief` 一次性获取全量数据并分层压缩（format-brief 输出 Tier-1 markdown + Tier-2 详细数据文件）
  1.8. 阅读 references/response-template.md 掌握回答模板与空数据处理规则
  2. 基于 format-brief 输出的 markdown 摘要生成经营简报：以 8 个候选区块为上限（T-2概览、实时看板、流量结构、商品健康度、服务能力、广告投放概览、行动建议、猜你想问），仅输出有数据或强制保留的区块，并按实际展示顺序连续编号；markdown 已包含核心 KPI 表格、实时业务、诊断结论和周报摘要，LLM 据此按 response-template.md 模板扩展为完整首屏简报（含漏斗图、竞争力对比、行动建议、猜你想问）；tier-2 文件供追问时按需 read 加载；转化趋势不在首屏，用户追问时按需下钻；若步骤0.7标记了"首次即建任务"，在简报末尾自动创建定时任务
  3. 进入"等待追问"模式，根据用户提问路由至具体数据模块
  3.5. 每次追问回答后：询问用户是否需要开启「店铺经营分析」定时任务（仅在无激活任务时）
  4. 按需调用 workctl data-advisor 相关命令查询特定时间段经营数据或地域分布（追问下钻时触发；先 schema 校验）
  4.1. 按需调用 data-advisor-shop-product 查询店铺商品效果数据（用户追问具体商品表现、商品排名、商品效果对比时触发）
  4.2. 按需调用 data-advisor-visitor-detail 查询店铺访客列表（用户追问访客明细、买家行为、访客来源国家、访客浏览偏好时触发）
  4.3. 按需调用 data-advisor-account-summary 查询店铺员工数据（用户追问员工表现、子账号业绩、团队数据对比时触发）
  5. 按需调用 workctl icbu trade list-trade-list-mcp 查询交易订单列表（用户追问订单/交易合同时触发）
  6. 按需调用 workctl icbu logistics list 查询物流订单列表（用户追问物流/发货/运输时触发）
  7. 按需调用 workctl icbu ads icbu-ads-account-diagnosis 查询广告账户诊断（用户追问广告问题、投放效果差、为什么花费高时触发）
  8. 按需调用 data-advisor 流量来源/详情/画像/去向产品命令，执行前先用 workctl schema --search 校验真实路径
---

# 阿里国际站店铺经营分析简报

## 设计原则（10 条军规）

> 让商家有每天看的欲望

1. **赚钱为先** — 商家来国际站是为了赚钱，经营分析始终以 **订单** 为北极星指标，所有数据解读围绕"如何多拿订单"展开。
2. **数据逻辑** — 重事实，少分析；先明细，再报表。明细挖细节，报表看大盘。避免空洞总结，让数据自己说话。
3. **统计口径** — 明细数据（订单/IM/物流）为实时，数据参谋为 T-2，需在输出中明确标注；日/周/月报侧重不同：
   - **日报**：侧重实时执行看板（待回复消息、待发货订单、异常预警），明细字段优先
   - **周报**：侧重趋势分析（转化率趋势、流量结构变化、同行竞争力对比），环比分析优先
   - **月报**：侧重战略复盘（商品分层健康度、渠道 ROI、经营阶段判断），长周期指标优先
4. **全经营周期** — 根据商家所处阶段给出差异化复盘与指引：
   - **启动期**（新店 / 低曝光）：聚焦商品发布质量、基础信息完善
   - **成长期**（有流量、转化待提升）：聚焦转化漏斗优化、客户跟进效率
   - **成熟期**（稳定出单）：聚焦竞品分析、新品类拓展、复购提升
5. **日更型** — 索引明细字段（如新增咨询条数、待回复消息、待发货订单），避免只有指标型数据导致每日波动小、结论重复化。
6. **入口级** — 根据数据与复盘，对应推荐下一步的行动 Skill，**Skill 必须用中文名表达**（如「智投优化」「主图诊断」），作为用户可直接点击的行动入口。
7. **可读性** — 优先表格呈现结构化数据，辅以简明 emoji（🔴⚠️🟢🟡）、加粗强调及特殊符号，让关键信息一目了然。
8. **千商千诊** — 基于追问的特定指标情况，针对用户常关注的维度做深度数据分析。
9. **定时任务** — 当用户 Query 包含定时关键词（"每天""每周""每月""定时""自动""定期"）时，**首次回复即创建定时任务**，无需等到追问；其他场景下，基于追问引导"是否设为定时任务"。
10. **业务属性** — 懂行，遵循 B2B 国际贸易平台特性。**严禁出现 B2C 电商词汇**（如"购物车、店铺收藏、下单、加购、好评率、差评、退货率"等），使用对应的 B2B 术语（如"询盘、RFQ、信保订单、交期、起订量"等）。
11. **能力边界** — **禁止推算行业绝对基准**。当前所有广告工具均不支持获取行业优秀/平均值的绝对数值（如花费了多少元、曝光了多少次）。严禁在工具仅返回相对评价（如"高于同行"）时，自行推算并给出具体的伪造绝对值。如遇此类请求，应明确告知用户系统权限限制，并引导用户关注相对诊断结论。

## ⚠️ 步骤 0: 确定当前日期（强制执行，不可跳过）

**在执行任何其他操作之前，必须首先运行以下命令获取当前真实日期：**

```bash
workctl workflow analysis-brief get-date --format json
```

如果用户请求的时间范围不是 7 天或 30 天（如"最近14天"、"最近8天"），需要加 `--days` 参数：
```bash
workctl workflow analysis-brief get-date --days 14 --format json
workctl workflow analysis-brief get-date --days 8,14 --format json
```

**示例输出：**
```
today=2026-04-02
yesterday=2026-04-01
seven_days_ago=2026-03-26
thirty_days_ago=2026-03-03
n_days_ago={"14":"2026-03-19","8":"2026-03-25"}
weekday=Thursday
```

**⚠️ 重要规则：**
1. **必须先执行此命令**，将输出结果作为本次会话的日期基准
2. **"昨天"必须使用命令输出的 `yesterday` 值**，严禁自行计算或猜测
3. **所有报告中显示的日期必须基于命令输出**，例如用户问"昨天的数据"时，报告标题应显示命令返回的 `yesterday` 日期
4. 如果命令未执行或执行失败，**禁止继续后续步骤**
5. **非标准天数（非7/30）必须用 `--days` 参数**，禁止自行计算日期偏移

**时间相关查询的日期映射规则（基于命令输出）：**
| 用户说 | 使用的日期 | 步骤 0 命令 | 步骤 1 命令参数 |
|--------|-----------|------------|----------------|
| "昨天" / "昨日" | 命令输出的 `yesterday` | 默认（不加 --days） | `--yesterday <yesterday>`（不传 start/end） |
| "今天" / "今日" | 命令输出的 `today`（注意 T-2 限制） | 默认 | 同上，简报标注数据实际截止日 |
| "最近7天" / "上周" | `seven_days_ago` 到 `yesterday` | 默认 | `--yesterday <yesterday> --start-date <seven_days_ago> --end-date <yesterday>` |
| "最近30天" / "上月" | `thirty_days_ago` 到 `yesterday` | 默认 | `--yesterday <yesterday> --start-date <thirty_days_ago> --end-date <yesterday>` |
| "最近N天"（N≠7,30） | `n_days_ago[N]` 到 `yesterday` | `--days N` | `--yesterday <yesterday> --start-date <n_days_ago.N> --end-date <yesterday>` |
| 具体日期（如"3月1日"） | 直接使用用户指定的日期 | 默认 | `--yesterday <yesterday> --start-date 2026-03-01 --end-date 2026-03-01` |
| 日期范围（如"5月10日到16日"） | 用户指定的起止日期 | 默认 | `--yesterday <yesterday> --start-date 2026-05-10 --end-date 2026-05-16` |

**⚠️ 正确 vs 错误示例：**

假设命令输出 `yesterday=2026-04-01`，用户问"帮我分析昨天的数据"：

❌ **错误**（使用了错误的日期）：
```
已为您分析店铺昨天的（2026-03-31）访客与运营数据
数据更新至：2026-03-31（昨日）
```

✅ **正确**（使用命令输出的 yesterday）：
```
已为您分析店铺昨日（2026-04-01）的访客与运营数据
数据更新至：2026-04-01（昨日）
```

## 步骤 0.7: 定时任务关键词前置检测

**获取数据之前，扫描用户原始 Query：**

**关键词列表**：`每天`、`每周`、`每月`、`定时`、`自动`、`定期`、`每日`、`每早`、`每晚`、`daily`、`weekly`

**处理规则：**
1. 对用户 Query 做关键词匹配（模糊匹配，不区分位置）
2. 命中任一关键词 → 设置标记 `schedule_on_first_response = true`
3. 从 Query 中提取频率意图：
   - "每天" / "每日" / "每早" / "每晚" / "daily" → `daily`
   - "每周" / "weekly" → `weekly`
   - "每月" → `monthly`
   - "定时" / "自动" / "定期"（无明确频率） → 默认 `daily`
4. 该标记将在步骤 2 的简报生成完成后触发自动创建定时任务（见步骤 2 末尾）
5. **未命中关键词** → 标记为 false，走正常流程（追问后引导）

**示例：**
- Query: "帮我每天生成一份经营简报" → `schedule_on_first_response = true`, 频率 = `daily`
- Query: "每周一给我发经营分析" → `schedule_on_first_response = true`, 频率 = `weekly`
- Query: "帮我看看店铺数据" → `schedule_on_first_response = false`

## ⚠️ 禁止事项清单

**本清单集中管理所有禁止行为，便于后续维护和补充。违反任何一条均视为执行错误。**

### 一、代理与任务委托

| # | 禁止行为 | 说明 |
|---|---------|------|
| 1 | **禁止启动子代理** | 不得创建或调用任何子代理/任务代理（如 `general`、`Analyze Traffic Channels`、`explore-agent` 等） |
| 2 | **禁止委托分析** | workctl 返回数据后，必须由本 Skill 直接处理并生成报告，不得将数据传递给其他代理分析 |
| 3 | **禁止拆分任务** | 即使用户查询涉及多个维度，也必须在本 Skill 内一次性完成 |

### 二、输出内容

| # | 禁止行为 | 说明 |
|---|---------|------|
| 4 | **禁止出现英文 Skill 名称** | 如 `p4p_optimization_skill`，所有建议必须使用中文 Skill 名称（如「智投优化」「主图诊断」），作为用户可点击的行动入口 |
| 5 | **禁止出现系统性说明文字** | 如"智能路由建议 (基于诊断结果动态生成)"，直接输出建议内容 |
| 6 | **禁止使用超链接格式** | "猜你想问"及追问环节的所有引导必须使用纯文本，禁止 `[text](url)` 格式和嵌入 URL |
| 7 | **禁止首次简报展示定时任务引导** | "需要开启定时任务吗"仅在用户追问并回答完成后才触发。**例外**：当用户 Query 本身包含定时关键词（"每天""每周""每月""定时""自动""定期"）时，首次回复即创建定时任务 |
| 8 | **禁止追问回复出现"后续引导"区块** | 禁止输出"需要根据分析结果更新 Skill 配置"等系统性引导文字 |
| 9 | **禁止给出"关键词"相关建议** | 行动建议中不得出现"优化关键词"、"拓词"、"搜索词覆盖"、"关键词出价"等关键词类建议。尤其在广告/P4P/直通车诊断场景中，**一律引导客户转向「智投」或「全站推」**，不推荐任何关键词维度的操作 |

### 三、日期与数据

| # | 禁止行为 | 说明 |
|---|---------|------|
| 10 | **禁止跳过 get-date** | 必须先执行 `workctl workflow analysis-brief get-date --format json` 获取日期基准，未执行则禁止继续后续步骤 |
| 11 | **禁止自行计算或猜测日期** | "昨天"必须使用命令输出的 `yesterday` 值，严禁自行推测 |
| 12 | **禁止"数据更新至"直接填 today** | 必须根据接口返回数据的实际截止日期确定，通常为 `yesterday`（经营数据有 1 天延迟） |

### 四、业务属性与术语

| # | 禁止行为 | 说明 |
|---|---------|------|
| 13 | **禁止使用 B2C 电商词汇** | 如"购物车、店铺收藏、下单、加购、好评率、差评、退货率、物流签收"等，必须使用 B2B 国际贸易对应术语（如"询盘、RFQ、信保订单、交期、起订量、PI、放款"等） |
| 14 | **禁止脱离订单北极星** | 所有数据解读和建议必须围绕"如何多拿订单"展开，不得偏离核心目标 |

### 五、数据真实性

| # | 禁止行为 | 说明 |
|---|---------|------|
| 15 | **禁止使用 Mock / 静态假数据** | 简报中所有数值必须来自 workctl 实时返回，严禁编造、硬编码或使用示例数据填充模板 |
| 16 | **禁止保留空表格** | 若某模块数据数组长度为 0，必须移除该区块或替换为一句话兜底提示，严禁输出只有表头没有数据行的空表格。**例外：流量结构分析、商品健康度分析、服务能力评估为首屏强制区块，只要接口成功就必须展示，数值为 0 或极低不算"空数据"** |

### 六、序号与格式

| # | 禁止行为 | 说明 |
|---|---------|------|
| 17 | **禁止序号跳变** | 输出结果中大写序号必须连续（一、二、三……），严禁出现跳号（如从二直接到四）。不要把"行动建议"固定成"八"，不要把"猜你想问"固定成"九"；如果前面只展示到"三"，则"猜你想问"必须是"四"。子章节编号的第一个数字必须与父章节序号一致。**输出前必须自检**：① 大写序号是否从一开始连续递增？② 每个子章节 N.x 的 N 是否等于父章节实际序号？不通过则修正后再输出 |

## workctl 命令速查表

**执行前以 `workctl schema --search <关键词> --format json` 和 `workctl schema <path> --format json` 为准。**
**首次简报必须通过 `workctl workflow analysis-brief fetch-all-data` 统一拉取；追问时按需调用单个 workctl 命令。**

> ⚠️ 下表「命令路径」列为 `workctl batch call` 的 JSON spec `path` 字段格式（dot-notation）；直接 CLI 调用时需转为空格分隔格式，如 `icbu.ads.xxx` → `workctl icbu ads xxx`。

| workctl path / 命令 | 用途 | 业务入参 |
|----------|------|------|
| `icbu.crm.store-diagnose-brief` | 店铺经营数据分析及店铺诊断 | `{"aiSalesDiagnoseDataQry": {"reportPageCode": ["PAGE_CODE_1", ...]}}` |
| `icbu.crm.list` | 查询商家服务周报详细完整数据 | `--reportAllDataQry @{"receipt":"<receipt>"} --token ""` |
| `icbu.advisor.data-advisor-shop-summary` | 查询店铺经营数据（数据参谋） | `{"statisticsType": "day", "startDate": "2026-04-01", "endDate": "2026-04-01"}` |
| `icbu.trade.list-trade-list-mcp` | 查询交易合同列表（筛选/分页/排序） | `{"limit": 20, "start": 0}`；追问筛选详见 domain-trade-logistics.md |
| `icbu.logistics.list` | 查询商家物流订单列表 | `{"currentPage": 1, "pageSize": 20}`；支持 `number/statusList/tradeBizId` |
| `icbu.member.list` | 获取成员 aliId，用于 IM 必填参数 | 无 |
| `icbu.tm.list-conversation` | 查询会话（以时间点向后查询，最多1000条） | `{"limitTimeStamp": 9999999999999, "selfAliId": "<成员aliId>", "count": 20, "domain": "icbu"}` |
| `icbu.ads.icbu-ads-report-load-datasource` | 加载广告报告数据源（全站推/标准推） | `{"datasource": "company_whole_site", "beginDateTime": "2026-05-01 00:00:00", "endDateTime": "2026-05-11 23:59:59", "granularity": "all", "tempTableName": "ADS_BRIEF"}`；format-brief 已自动聚合 data 行，输出商机类型/买家地域/买家等级分布到 markdown |
| `icbu.ads.icbu-ads-account-diagnosis` | 广告账户整体诊断（追问广告问题时调用） | `{"startDate": "2026-05-05", "endDate": "2026-05-11"}` |
| 流量/商品/访客/员工追问命令 | 查询下钻明细 | 先用 `workctl schema --search "<旧工具名或业务关键词>" --format json` 校验真实 path，再按 schema 传扁平参数 |
| `workflow analysis-brief format-brief` | 将 fetch-all-data JSON 转为 Tier-1 markdown + Tier-2 详细数据文件 | 从 stdin 读取 fetch-all-data 输出，输出 `{markdown, tier2_paths, receipt, ...}` |
| `workflow analysis-brief format-followup` | 追问数据管道压缩 | `workctl ... --format json \| workctl workflow analysis-brief format-followup --type <type>` |

## 工作流

流程为严格顺序执行，每一步依赖上一步的结果。

### 步骤 1: 获取全量数据并分层压缩（workctl OneShot + format-brief）

**运行数据采集命令并 pipe 到 format-brief 进行分层压缩：**

```bash
workctl workflow analysis-brief fetch-all-data --yesterday <步骤0的yesterday值> [--start-date <起始日期> --end-date <结束日期>] --format json | workctl workflow analysis-brief format-brief --format json
```

**日期参数说明：**
- `--yesterday`（必填）：步骤 0 输出的 yesterday 值，用于广告、环比等固定周期计算
- `--start-date` / `--end-date`（可选）：用户指定的查询日期范围，传入后 advisor 使用该范围查询；不传则默认=yesterday（单日）
- 命令自动根据日期范围长度选择 `statisticsType`：1天=day，2~7天=7d，8~30天=30d

**LLM 日期映射：**

| 用户表达 | `--yesterday` | `--start-date` | `--end-date` | 效果 |
|:---|:---|:---|:---|:---|
| "昨天" / 默认 | yesterday | *(不传)* | *(不传)* | advisor 查单日 |
| "最近7天" / "上周" | yesterday | seven_days_ago | yesterday | advisor 查 7 天汇总 |
| "最近30天" / "上月" | yesterday | thirty_days_ago | yesterday | advisor 查 30 天汇总 |
| "5月10号到16号" | yesterday | 2026-05-10 | 2026-05-16 | advisor 查指定范围 |
| 具体日期如"6月1号" | yesterday | 2026-06-01 | 2026-06-01 | advisor 查指定单日 |

| 工具 | 调用参数 | 用途 |
|------|---------|------|
| `workctl batch call` | 并发执行 advisor/orders 2 个核心只读步骤，完整结果落 artifact | 首批核心数据 |
| `icbu.crm.store-diagnose-brief` | `{"aiSalesDiagnoseDataQry": {"reportPageCode": ["STORE_DATA_OVERVIEW","FLOW_SOURCE_CHANNEL_ANALYSIS","BUYER_DISTRIBUTION_DATA","PRODUCT_DATA_OVERVIEW","EXPOSURE_TOP10_PRODUCT_DATA","STORE_CONVERSION_RATE_ANALYSIS","ACTION_SUGGESTION","STORE_COMMUNICATION_CONVERSION_OVERVIEW"]}}` | 店铺诊断 + 触发 8 页报告计算，**返回 `receipt`** |
| `icbu.advisor.data-advisor-shop-summary` | `{"statisticsType": "<auto:day/7d/30d>", "startDate": "<start-date或yesterday>", "endDate": "<end-date或yesterday>"}` | 数据参谋 T-2 指标（日期由 --start-date/--end-date 控制） |
| `icbu.trade.list-trade-list-mcp` | `{"limit": 20, "start": 0}` | 交易订单数据 |
| `icbu.logistics.list` | `{"currentPage": 1, "pageSize": 20}` | 物流履约数据 |
| `icbu.member.list` → `icbu.tm.list-conversation` | 先取成员 aliId，再传 `selfAliId/limitTimeStamp/count/domain` | IM 沟通数据 |
| `icbu.ads.icbu-ads-report-load-datasource` | `{"datasource": "company_whole_site", "beginDateTime": "<seven_days_ago> 00:00:00", "endDateTime": "<yesterday> 23:59:59", "granularity": "all", "tempTableName": "ADS_BRIEF"}` | 广告商机明细元数据；format-brief 自动聚合 data 行输出商机类型/地域/等级分布到 markdown |
| `icbu.crm.list` | `--reportAllDataQry @{"receipt": "<提取的 receipt>"} --token ""` | 获取首次触发的 8 个报告页全量数据 |
命令内部自动完成：
- 并发调用数据参谋、订单 2 个核心只读命令
- 若某个核心步骤失败，命令会在 `errors` 中返回具体失败项
- 诊断（store-diagnose-brief）、广告 load datasource、成员列表、物流列表、周环比（advisor 本周/上周）随后在 extra_tasks 波次并发执行，诊断不与 advisor 并发
- 从 `store-diagnose-brief` 提取 receipt，调用 `icbu crm list` 获取周报；若 `invokeStatus=executing` 最多重试 3 次
- 从 `icbu member list` 提取成员 aliId 后调用 IM 会话命令；IM 与周报在依赖满足后并发执行
- stdout 输出精简多行 JSON，只保留简报首屏所需字段；完整结果落盘到 `full_result_path`
- `full_result_path` 是命令调用工作目录下的绝对路径，主 Agent 需要补充读取原始数据时必须直接读取该绝对路径，不要按当前目录重新拼接相对路径


**`format-brief` 输出为 JSON，包含以下顶层 key：**

| Key | 内容 | 用途 |
|-----|------|------|
| `markdown` | Tier-1 精简 markdown 摘要（~3-5K chars），包含核心 KPI 表格、实时业务看板、诊断结论、周报摘要 | 直接作为 LLM 生成简报的数据基础 |
| `tier2_paths` | 详细数据文件路径映射（`advisor_detail.json` / `weekly_report.json` / `orders_logistics.json`） | 追问时按需 read 加载 |
| `status` | 数据状态（success/partial_success/failed/no_data_found） | 判断数据完整性 |
| `receipt` | 追问阶段备用 | 追问路由 |
| `full_result_path` | workctl 原始结果落盘路径（含 fetch-all-data 全部数据源） | 需要更深字段时读取 |
| `data_paths` | 常用数据位置指引 | 追问时快速定位 |
| `errors` / `warnings` | 接口失败和警告信息 | 标注"暂无数据" |

**数据源 → 简报区块 → Tier-2 文件映射：**

`fetch-all-data` 内部采集的各数据源经 `format-brief` 分层压缩后，分布如下：

| fetch-all-data 数据源 | markdown 中的摘要内容 | Tier-2 文件 | 对应简报区块 |
|-----|------|------|------|
| `advisor`（数据参谋 T-2 全量指标 + 同行对比） | 核心 KPI 表格（曝光/点击/商机/订单 + 环比 + 同行均值/优秀 + 水位灯） | `tier2_paths.advisor_detail` | 一、核心经营数据概览（主数据源）+ 1.1 漏斗 + 1.2 竞争力 + **四、商品健康度分析** |
| `diagnose`（weekDiagnose 诊断摘要 + 行动任务） | KPI 表格（与 advisor 合并）+ 诊断结论（diagnoseTitle/diagnoseSummary）+ 待办事项（maTaskList） | — | 一、核心经营数据概览（诊断结论补充）|
| `orders`（订单状态分组统计） | 实时业务看板（订单笔数/待付款/待发货） | `tier2_paths.orders_logistics` | 二、核心业务执行看板 |
| `logistics`（物流状态统计） | 实时业务看板（物流单数/在途/异常） | `tier2_paths.orders_logistics` | 二、核心业务执行看板 |
| `im`（会话统计 total/unread） | 实时业务看板（IM 消息总条数/未读数） | — | 二、核心业务执行看板 |
| `ads`（广告商机明细元数据） | 实时业务看板（广告报表行数） | — | 七、广告投放概览 |
| `weekly_report`（周报各模块摘要数据） | 周报摘要（店铺概览/渠道 TOP5/产品分层/转化漏斗/行动建议/曝光 Top10） | `tier2_paths.weekly_report` | **三、流量结构分析**（`FLOW_SOURCE_CHANNEL_ANALYSIS` + `BUYER_DISTRIBUTION_DATA`）+ **五、服务能力评估** + 追问补充 |

⚠️ 命令执行失败或部分接口失败时，输出中会包含 `errors` 数组，说明哪些接口失败。LLM 基于已有数据生成简报，缺失部分标注"暂无数据"。
⚠️ `format-brief` 已将核心数据压缩到 markdown 中（KPI 表格含数值、环比、同行对比），LLM 直接基于 markdown 生成首屏简报即可，无需再处理原始 JSON。追问需要更细字段时，read 对应 `tier2_paths` 中的文件或读取 `full_result_path`。

### 步骤 2: 生成经营分析简报

基于步骤 1 `format-brief` 输出的 `markdown` 摘要和 tier-2 详细数据文件，生成 Markdown 简报。下方是候选区块，不是固定输出序号；按实际展示顺序重新编号。`markdown` 已包含核心 KPI 表格（含数值、环比趋势、同行对比、水位灯）、实时业务看板、诊断结论（含待办事项）、周报摘要（含渠道 TOP5、买家地域分布、产品分层、转化漏斗、服务能力指标）、广告商机摘要（含商机类型/买家地域/买家等级分布），LLM 据此按 response-template.md 模板扩展为完整首屏简报，补充流量转化漏斗图、竞争力分析、流量结构、商品健康度、服务能力评估、广告投放概览、行动建议和猜你想问。追问需要更细数据时，read `tier2_paths` 中对应文件。

**⚠️ 首屏强制展示规则：** 以下 8 个区块中，前 6 个为**强制展示区块**（只要对应接口成功就必须输出，数值低或为 0 不算"无数据"）；后 2 个为**始终保留区块**：
1. 核心经营数据概览 — 强制（advisor 成功即展示）
2. 核心业务执行看板 — 强制（orders/im 任一成功即展示）
3. 流量结构分析 — 强制（周报成功即展示）
4. 商品健康度分析 — 强制（advisor 成功即展示）
5. 服务能力评估 — 强制（周报成功即展示）
6. 广告投放概览 — 强制（广告接口成功即展示）
7. 行动建议 — 始终保留
8. 猜你想问 — 始终保留

**简报候选结构（最多 8 个区块，实际输出需动态编号）：**
- **核心经营数据概览（T-2）** — 优先来自 `data-advisor-shop-summary`（含周环比 `cycleCrc`），weekDiagnose 补充诊断结论/行动任务
- **1.1 流量转化漏斗** — 由上述数据计算各环节转化率，ASCII 漏斗图
- **1.2 核心指标同行竞争力** — advisor 的 RivalAvg/RivalGood 字段 + weekDiagnose 的 valueVsAvg 补充，vs 同行对比
- **核心业务执行看板（实时）** — 来自 `icbu.trade.list-trade-list-mcp` + `icbu.tm.list-conversation`，展示待办明细和异常
- **流量结构分析** — 来自周报 `FLOW_SOURCE_CHANNEL_ANALYSIS`（渠道）+ `BUYER_DISTRIBUTION_DATA`（地域），markdown 含渠道 TOP5 + 买家地域 TOP10 摘要
- **商品健康度分析** — 来自 `data-advisor-shop-summary`（商品分层/效果数据）
- **服务能力评估** — 主数据源为周报 `STORE_COMMUNICATION_CONVERSION_OVERVIEW`（部分店铺可能未返回）；无数据时自动降级为 advisor 服务指标（`fst5minReplyRate30d` 极速回复率、`avgReplyTime30d` 平均回复时长，含环比和同行对比），markdown 已含核心指标摘要
- **广告投放概览** — 来自 `icbu-ads-report-load-datasource`（全站推商机明细），markdown 已含商机总量、商机类型分布、买家地域 TOP5、买家等级分布摘要；追问细分时再按 schema 调用广告诊断或 SQL 能力
- **行动建议** — 综合以上诊断结论，按 P0-P3 优先级排列，推荐中文 Skill 入口
- **猜你想问** — 动态生成引导追问

**⚠️ 转化趋势不在首屏展示**，用户追问时按需调用数据参谋子接口下钻：
- 转化趋势 → `data-advisor-shop-flow`

**⚠️ 日/周/月报区块侧重：**
- **日报**（用户问"今天/昨天"）：区块二（实时看板）为核心，区块一（同行业竞争力指标）/三～五(流量结构/商品健康度/服务能力)简化为关键指标摘要
- **周报**（用户问"本周/近7天"）：区块三~五(流量结构/商品健康度/服务能力)为核心，完整展开
- **月报**（用户问"本月/近30天"）：区块四（商品健康度）+行动建议为核心，侧重战略复盘

**⚠️ 日期显示规则（强制）：**
- `"数据更新至"` 的日期**必须根据接口返回数据中实际的数据截止日期确定**，而非直接使用 today
- 通常经营数据有 1 天延迟，实际数据更新至 `yesterday`。以接口返回的 `scope` 或数据时间戳为准
- 如果接口返回的数据中包含明确的数据截止日期字段，直接使用该值
- 如果接口未返回明确的截止日期，默认使用步骤 0 命令输出的 `yesterday` 值（因为经营数据通常更新至前一日）
- 用户问"昨天的数据" → 报告标题显示 `昨日（步骤0的yesterday值）`
- 用户问"今天的数据" → 报告标题显示 `今日（步骤0的today值）`，但"数据更新至"仍根据接口实际情况填写

**⚠️ 正确 vs 错误示例（数据更新至）：**

假设命令输出 `today=2026-04-03`，`yesterday=2026-04-02`，接口数据实际截止到 4 月 2 日：

**状态灯逻辑：**
- 🟢 绿灯: 周环比增长（`advisor.cycleCrc` 对应字段为正）且高于同行平均
- 🟡 黄灯: 数据持平或略低于同行
- 🔴 红灯: 周环比下降且远低于同行（差距超过 50%）

**行动建议生成逻辑：** 基于数据对比，判断店铺当前核心瓶颈，直接给出切实可行的行动方案（参见"动态 Action 路由决策表"）。

**输出模板：** 详见 [response-template.md](references/response-template.md)

**模板数据源映射：**

| 简报区块 | 数据来源 |
|:---|:---|
| 一、核心经营数据概览 | `data-advisor-shop-summary`（主数据源，含周环比 `cycleCrc`）+ `store-diagnose-brief` weekDiagnose（诊断结论/行动任务） |
| 1.1 流量转化漏斗 | 由上述数据计算各环节转化率 |
| 1.2 核心指标同行竞争力 | `data-advisor-shop-summary` RivalAvg/RivalGood + weekDiagnose valueVsAvg 补充 |
| 二、核心业务执行看板 | `icbu.trade.list-trade-list-mcp`（订单）+ `icbu.logistics.list`（物流）+ `icbu.tm.list-conversation`（IM） |
| 三、流量结构分析 | 周报 `FLOW_SOURCE_CHANNEL_ANALYSIS`（渠道）+ `BUYER_DISTRIBUTION_DATA`（地域），markdown 含渠道 TOP5 + 买家地域 TOP10 摘要 |
| 四、商品健康度分析 | `data-advisor-shop-summary`（商品分层/效果数据）|
| 五、服务能力评估 | 周报 `STORE_COMMUNICATION_CONVERSION_OVERVIEW`（主）+ advisor 服务指标兜底（`fst5minReplyRate30d`/`avgReplyTime30d`），markdown 已含核心指标摘要 |
| 六、广告投放概览 | `icbu-ads-report-load-datasource`（company_whole_site 商机明细），markdown 含商机总量 + 商机类型/买家地域/买家等级分布摘要 |
| 行动建议 | 综合以上诊断结论，参见"动态 Action 路由决策表" |
| 猜你想问 | 动态生成，序号由实际位置决定 |

**⚠️ 实时看板数据提取逻辑（区块二）：**

所有实时看板数据**必须从 workctl 实时返回中提取**，严禁编造：

| 看板字段 | 数据来源 | 提取逻辑 |
|:---|:---|:---|
| 待回复消息数 | `icbu.tm.list-conversation` | 统计返回会话中 `hasUnread/unreadMessageCount` |
| 新增咨询数 | `icbu.tm.list-conversation` | 统计返回会话总数（按时间范围过滤） |
| 待支付订单 | `icbu.trade.list-trade-list-mcp` | 过滤 `status.status == 'wait_buyer_payment'`，累计 `totalAmount.amount` |
| 待发货订单 | `icbu.trade.list-trade-list-mcp` | 过滤 `status.status == 'wait_seller_ship'`，统计笔数和商品件数 |
| 订单超时预警 | `icbu.trade.list-trade-list-mcp` | 根据 `createDate` 计算是否接近 24h 支付时限 |
| 物流运输中 | `icbu.logistics.list` | 统计物流订单中运输/揽收/发货相关状态 |
| 物流异常预警 | `icbu.logistics.list` | 筛选异常/exception/abnormal 相关状态 |

**⚠️ 商品健康度数据提取逻辑（区块四，强制展示）：**

商品健康度数据来自 `data-advisor-shop-summary`，只要接口成功返回就必须展示，**数值低或为 0 不是跳过理由**：

| 提取字段 | advisor 字段名（参考） | 同行对比字段 | 说明 |
|:---|:---|:---|:---|
| 全店商品总数 | `productCount` / `totalProductCount` | `rivalAvgProductCount` / `rivalGoodProductCount` | 即使值很大也必须展示 |
| 爆品数 | `topProductCount` / `hotProductCount` | 同行平均/优秀 | 为 0 也必须展示，标注🔴 |
| 实力优品数 | `goodProductCount` / `highQualityProductCount` | 同行平均/优秀 | 为 0 也必须展示 |
| 潜力优品数 | `potentialProductCount` | — | 若无则不显示该行 |
| 普通品数 | `normalProductCount` | — | 由总数 - 优品 - 爆品计算 |
| 低质品数 | `lowQualityProductCount` | — | 若无则不显示该行 |

⚠️ **即使爆品=0、优品=2，也必须正常渲染商品金字塔图和分层表格，不得跳过。**

**⚠️ 流量结构数据提取逻辑（区块三，强制展示）：**

流量结构数据来自**周报**（不是 advisor），markdown 已包含摘要，追问详细数据时读 tier-2：

| 数据层 | 内容 | 字段 | 说明 |
|:---|:---|:---|:---|
| markdown（直接可用） | "流量渠道 TOP5" 摘要 | `channelType` + `detailUv` + 环比 + `fbUv` | 已在 markdown "周报摘要" 段落中，可直接引用 |
| markdown（直接可用） | "买家地域分布" 摘要 | `impsCnt`/`clickCnt`/`businessLeadsCnt` 各维度 TOP10 | 已在 markdown "周报摘要" 段落中，可直接引用 |
| tier-2 `weekly_report.json`（追问时 read） | `FLOW_SOURCE_CHANNEL_ANALYSIS` 完整数据 | `channelType`/`detailUv`/`detailUvCycleCrc`/`fbUv`/`tmUv`/`uvAbRate`/`uvAbRateCycleCrc` | 用户追问完整渠道表格时加载 |

⚠️ **强制展示规则：只要周报接口成功返回（`invokeStatus` 为 completed/success），流量结构区块就必须展示（含渠道分布 + 买家地域两个子区块）。渠道/地域数组为空时，以"暂无渠道分布数据"/"暂无买家地域数据"一句话兜底，不得跳过整个区块。**

**⚠️ 服务能力评估数据提取逻辑（区块五，强制展示）：**

服务能力评估优先使用周报 `STORE_COMMUNICATION_CONVERSION_OVERVIEW`，但该模块**部分店铺不返回**（实际 API 可能仅返回 7 个模块）。当周报无此模块时，自动降级为 advisor 服务指标。markdown 已包含摘要，直接使用：

| 提取字段 | 数据来源 | 说明 |
|:---|:---|:---|
| 极速回复率（5分钟内） | markdown "服务能力指标" 段落 | advisor 兜底字段 `fst5minReplyRate30d`，含环比和同行均值 |
| 平均回复时长 | markdown "服务能力指标" 段落 | advisor 兜底字段 `avgReplyTime30d`，含环比、同行均值和同行优秀 |
| 商机转化率（沟通） | 周报有则引用，无则标注"暂无数据" | 仅周报 `STORE_COMMUNICATION_CONVERSION_OVERVIEW` 提供 |
| 买家已读未回率 | 周报有则引用，无则标注"暂无数据" | 仅周报 `STORE_COMMUNICATION_CONVERSION_OVERVIEW` 提供 |
| 服务满意度 | 周报有则引用，无则标注"暂无数据" | 仅周报 `STORE_COMMUNICATION_CONVERSION_OVERVIEW` 提供 |
| 异常接待预警 | tier-2 `weekly_report.json` | 追问时 read |

⚠️ **周报或 advisor 任一有服务指标就必须渲染服务能力评估区块，不得跳过。仅当两者都无数据时才跳过。**

**⚠️ ASCII 可视化规则：**
- 漏斗图、条形图、趋势线图使用纯 ASCII 字符绘制（`┃▼█░─┤`等）
- 每个图表附带简短的文字洞察（1-2句事实性描述）
- 条形图用于占比分布（渠道、大洲、服务对标），趋势线图用于时序数据（转化率、商机数）

**⚠️ 交互语态约束（强制）：**
- 追问环节的所有引导**必须使用纯文本**，禁止使用 `[text](url)` 超链接格式
- 每个问题必须是自然语言问句，用户可以直接复制粘贴发送
- 禁止在问题中嵌入任何 URL 或 Markdown 链接标记

**⚠️ 定时任务前置引导（当步骤 0.7 标记 `schedule_on_first_response = true` 时）：**

在简报输出完毕后，追加定时任务创建意图，交由对话系统处理：

1. 根据步骤 0.7 提取的频率（daily/weekly/monthly），在简报末尾输出：
   > 我已记录您要创建「店铺经营分析」{{频率}}定时任务的需求，接下来由系统创建；创建成功后以系统返回的任务信息为准。
2. 将任务需求整理为结构化描述，交由对话系统自动创建定时任务。没有拿到系统返回的 jobId/下次执行时间前，禁止说"已创建定时任务"。
3. **不再额外询问"是否创建定时任务"** — 用户已在 Query 中明确表达了定时意图

### 追问数据路由

进入追问模式后，先阅读 [followup-routing.md](references/followup-routing.md) 确定路由方向和工具选择，再阅读对应 domain-*.md 获取字段说明。

**⚠️ 追问数据压缩（强制）：** 所有追问 workctl 命令的输出必须 pipe 到 `workctl workflow analysis-brief format-followup` 以减少 context 占用。格式：`workctl ... --format json | workctl workflow analysis-brief format-followup --type <type>`。type 映射见 followup-routing.md 顶部说明。

### 步骤 3: 按需查询数据参谋

追问下钻时按不同时间粒度或自定义日期范围调用 `icbu.advisor.data-advisor-shop-summary` 或通过 `workctl schema --search "shop region"` 查找地域分布命令。输出须 pipe 到 `workctl workflow analysis-brief format-followup --type advisor`。

**重要：所有日期参数必须基于步骤 0 获取的真实日期计算，严禁自行推测当前日期。**

**详细参数和适用场景：** 详见 [followup-routing.md](references/followup-routing.md) 中"数据参谋路由"章节。

### 步骤 3.5: 按需查询店铺商品效果数据

当用户追问涉及具体商品表现、商品效果排名、某类商品数据对比时，调用 `data-advisor-shop-product`。输出须 pipe 到 `workctl workflow analysis-brief format-followup --type product`。

**详细参数、筛选条件和适用场景：** 详见 [domain-product-effect.md](references/domain-product-effect.md)。

### 步骤 3.6: 按需查询店铺访客明细

当用户追问涉及访客列表、买家行为明细、访客来源国家、访客浏览偏好、访客是否询盘/TM咨询等场景时，调用 `data-advisor-visitor-detail`。输出须 pipe 到 `workctl workflow analysis-brief format-followup --type visitor`。

**详细参数、筛选条件和返回字段：** 详见 [domain-traffic-buyers.md](references/domain-traffic-buyers.md) 中"访客明细"章节。

### 步骤 3.7: 按需查询店铺员工数据

当用户追问涉及员工表现、子账号业绩、团队数据对比、某个员工的产品/询盘/订单情况等场景时，调用 `data-advisor-account-summary`。输出须 pipe 到 `workctl workflow analysis-brief format-followup --type account`。

**详细参数和返回字段：** 详见 [domain-account.md](references/domain-account.md)。

### 步骤 4: 按需查询沟通与IM数据

当用户追问涉及联系人、会话记录、卡片信息等场景时，调用 `icbu.tm` 相关 workctl 命令；执行前用 `workctl schema --search` 校验 path 和必填参数。

**各工具详细参数：** 详见 [domain-service.md](references/domain-service.md)。

### 步骤 5: 按需查询交易订单列表

当用户追问涉及订单列表、交易合同、订单明细、订单状态等场景时，调用 `icbu.trade.list-trade-list-mcp`。输出须 pipe 到 `workctl workflow analysis-brief format-followup --type trade`。

**返回数据结构与适用场景：** 详见 [domain-trade-logistics.md](references/domain-trade-logistics.md)。

### 步骤 6: 按需查询物流订单列表

当用户追问涉及物流订单、发货状态、物流追踪、运输进度等场景时，调用 `icbu.logistics.list`。输出须 pipe 到 `workctl workflow analysis-brief format-followup --type logistics`。

**详细参数和返回字段：** 详见 [domain-trade-logistics.md](references/domain-trade-logistics.md)。

### 步骤 7: 按需查询广告账户诊断

当用户追问涉及广告问题、投放效果差、花费高商机少、广告优化方向等场景时，调用 `icbu-ads-account-diagnosis`。输出须 pipe 到 `workctl workflow analysis-brief format-followup --type ads`。

**详细参数和返回字段：** 详见 [domain-ads.md](references/domain-ads.md)。

### 步骤 8: 按需查询流量数据

**⚠️ 仅当用户追问流量相关问题时才调用以下工具，非流量问题不得触发。** 详细参数和返回字段见 [domain-flow.md](references/domain-flow.md)。

- **8.1 流量来源** — data-advisor-shop-channel：使用 --startDate --endDate --terminalType --format json 平铺传参，输出须 pipe 到 `workctl workflow analysis-brief format-followup --type flow`
- **8.2 流量详情** — data-advisor-shop-flow：使用 --startDate --endDate --terminalType --format json 平铺传参，输出须 pipe 到 `workctl workflow analysis-brief format-followup --type flow`
- **8.3 流量画像** — data-advisor-shop-flow-profile：使用 --startDate --endDate --indexName --sourceType --terminalType --format json 平铺传参，`indexName` 决定画像维度（`visitor_country`/`cate_total`/`channel_total`），`sourceType` 决定流量类型，输出须 pipe 到 `workctl workflow analysis-brief format-followup --type flow`
- **8.4 流量去向产品** — data-advisor-to-product：使用 --startDate --endDate --sourceType --terminalType --format json 平铺传参，输出须 pipe 到 `workctl workflow analysis-brief format-followup --type flow`

---

## 其他要求

1. **文档导出**：当且仅当用户明确要求要 PDF / Word / Excel / PPT等格式时，将结果传给 office-suite SubAgent 导出为文档格式。
2. **大文件治理 (Prevent 600s Timeout)**：
   - **规模标注**：若明细条数 > 30，在调用 `office-suite` 的任务描述中明确注明规模（如"包含 100 条记录"），激活其大数据处理模式。
   - **数据解耦**：大数据量（> 5KB）禁止直接粘贴在 `task` 字符串中。应先通过 `Write` 工具将数据写入本地 `content.json`，在 `task` 中指令子 Agent 读取该文件。
   - **分流/降级**：Excel 导出默认上限 200 行。超过 200 行时，应主动向用户建议：① 仅导出核心前 50 条；② 拆分为多个文件；③ 降级为直接提供 CSV 代码块。

## 追问后处理

**每次回答用户追问后，阅读并遵循 [followup-rules.md](references/followup-rules.md) 中的后处理规范**（静默更新 Memory、追问回复规范、定时任务引导）。

## 数据源路由策略

**核心原则**: 步骤 1 中所有数据源（诊断+周报+数据参谋+实时明细）**必须全部请求**，确保数据齐备。但在**生成简报时**，使用数据遵循以下优先级：

1. **优先级 1 — 数据参谋 `data-advisor-shop-summary`（首屏主数据源）**: 核心经营概览（含漏斗、竞争力）、商品健康度均使用数据参谋。`format-brief` 已将 advisor 核心 KPI 和同行对比压缩到 markdown 的 KPI 表格中，详细数据存放在 tier-2 的 `advisor_detail.json`。日期可控、可对账，避免与周报的口径冲突（周报用PV访问次数 vs advisor用UV访问人数）。转化趋势不在首屏展示，用户追问时调用数据参谋子接口（shop-flow）按需下钻。**注意：流量结构（渠道/地域分布）数据来自周报，非 advisor。**
2. **优先级 2 — 经营周报接口（诊断结论+行动任务+沟通转化）**: `icbu.crm.store-diagnose-brief` 的 weekDiagnose 提供诊断摘要（diagnoseSummary）、行动任务（maTaskList）。环比由 advisor 自算周环比（命令取本周和上周各7天汇总相减，输出在 `advisor.cycleCrc`），不依赖周报。`icbu.crm.list` 的周报模块用于 advisor 不覆盖的字段（如沟通转化数据 `STORE_COMMUNICATION_CONVERSION_OVERVIEW`）。store-diagnose-brief 不与 advisor 并发调用，advisor 优先返回后再调用。

**决策树：**
- 首屏数值指标（曝光/点击/商机/转化率/订单等聚合值）？
  - → 使用数据参谋 `data-advisor-shop-summary`
- 诊断结论 / 行动任务？
  - → 使用周报 weekDiagnose（diagnoseSummary / maTaskList）
  - → 输出时标注："以下诊断基于系统周报周期，可能与您选择的时间范围不同"
- 环比？
  - → 从 `advisor.cycleCrc` 取（命令已用本周/上周7天汇总自算，不依赖周报）
- 流量结构首屏？
  - → 使用周报 `FLOW_SOURCE_CHANNEL_ANALYSIS` + `BUYER_DISTRIBUTION_DATA`（markdown 含渠道 TOP5 + 买家地域 TOP10 摘要）
- 用户追问转化趋势？
  - → 调用数据参谋子接口 `data-advisor-shop-flow` 下钻
- 用户追问流量/商品更细粒度？
  - → 调用 `data-advisor-shop-channel` / `data-advisor-shop-product` 下钻
- 用户追问需要特定时间粒度或地域下钻？
  - → 使用数据参谋接口（调整 statisticsType / 日期范围）

## 动态 Action 路由决策表

Action 建议完全由诊断结论决定。**输出时必须使用中文 Skill 名称作为行动入口，用户可直接点击触发。**

| 诊断结论特征 | 推荐行动（用户看到） | 推荐 Skill（中文名） |
| :--- | :--- | :--- |
| 曝光/点击低 | 开启智投或全站推自动化投放，提升精准流量覆盖 | 「智投优化」/「全站推」 |
| 点击率低 | 检查商品主图是否突出卖点，提升视觉吸引力 | 「主图诊断」/「标题优化」 |
| 商机/转化率低 | 优化商品详情页承接能力，提升客服首次响应速度 | 「详情页优化」/「沟通效率提升」 |
| 交易/退款异常 | 排查售后服务流程，评估商品定价策略合理性 | 「售后服务检查」/「定价策略分析」 |
| 数据健康/增长 | 分析同行竞品策略，寻找新品类增长机会 | 「竞品分析」/「市场趋势报告」 |
| 新店/启动期 | 完善商品基础信息，提升上品质量 | 「商品发布优化」/「店铺基建检查」 |
| 询盘跟进不及时 | 提升询盘回复速度，设置自动接待卡片 | 「沟通效率提升」/「自动接待配置」 |

## 异常处理

| 场景 | 处理方式 |
| :--- | :--- |
| 登录态过期 | 检测到跳转至登录页面或接口报错，提示"检测到登录态过期，请重新登录后再试" |
| 接口返回空数据 | 提示"暂无经营数据，请检查店铺是否已开通相关服务" |
| 部分字段缺失 | 仅展示可用数据，缺失部分标注"暂无数据" |
| `weekDiagnose` 缺失 | 核心数据概览显示为空，提示"本期暂无经营诊断数据" |

| 新店/冷启动 | 若 `advisor.cycleCrc` 为空（上周无数据），提示"开店新手期，数据积累中，建议重点关注商品发布质量" |
| 数据延迟 | 在数据概览下方增加提示"数据更新至前日" |
| invokeStatus=executing | 等待 3 秒后使用相同参数重试一次，仍为 executing 则提示"数据正在计算中，请稍后再试" |
| 用户问"今天/实时"数据 | 经营数据为 T-2 口径，明确告知"经营数据更新至前日，暂无法提供实时数据"，不 fallback、不编造 |
| 用户查>30天历史 | 数据参谋支持范围有限，明确告知"当前数据参谋最长支持近30天查询，更早数据暂不可得"，不编造 |

## 深度下钻参考

当用户追问需要更详细的字段说明时，按需阅读对应 references/ 下的领域文件。路由索引见 [followup-routing.md](references/followup-routing.md)，首次触发字段映射见 [first-trigger.md](references/first-trigger.md)。

## 范围越界请求识别（首轮强制）

本技能聚焦"店铺经营数据汇总与分析"。在执行步骤 0 之前，先做一次范围自检：用户原始 Query 命中以下任一信号即视为"部分越界"，**禁止假装能在本技能内完成**，必须先回应边界与降级路径：

| 越界信号关键词 | 正确处理 |
|--------------|---------|
| 域名解析 / DNS / SSL 证书 / 备案 / Whois / 域名指向 | 不属于经营数据分析；告知"本技能不诊断域名/证书问题，请在卖家中心 → 店铺装修 → 域名设置 自助检查或联系卖家服务" |
| 浏览器自动化 / UI 自动化 / 替我点 / 替我下载 / 替我上传 | 不属于本技能能力；明确说明本技能仅做数据查询与简报输出，UI 操作请人工进入 [crm.alibaba.com](https://crm.alibaba.com) |
| 系统级定时任务 / 操作系统调度 / 邮件外发 | 仅本插件 skill 自动触发支持；外部邮件/系统级 cron 请在卖家中心 → 消息通知设置中开启 |
| 创建多智能体编排 / 调度 @xxx 助理 / 部署架构 / 安装智能体 | 不属于本技能能力；列出本插件实际支持的 SubAgent 清单，让用户选择 |
| 星级查询 / 等级体系咨询 | 路由到 alibaba-cco-rag（国际站知识库问答），本技能不输出会员体系判定 |
| 跨平台聊天关联 / 邮箱同步 / 第三方 CRM | 越界声明，不接受默默执行；建议用户在国际站后台导出后再分析 |
| 帮我提现 / 结汇 / 收款 / 付款 / 转账 / 充值 | 不属于经营分析范围；告知"本技能仅查询经营数据，资金/结汇操作请在卖家中心 → 交易 → 资金管理自助处理" |
| 帮我下架 / 上架商品 / 删除商品 / 修改价格 / 改标题 | 属于写操作，非本技能范围；建议使用「商品信息优化」技能执行修改操作 |
| 查竞品店铺 / 查对手数据 / 查别人的流量 / 同行分析 | 本技能仅支持查询自己店铺数据；告知"暂不支持竞品店铺数据查询，建议在数据参谋 → 行业大盘查看行业趋势" |
| 帮我回复买家 / 代我发消息 / 自动回复 | 不属于本技能能力；建议使用「询盘聊天分析」查看沟通数据，或「回复建议」生成话术 |
| 实时流量 / 现在的曝光 / 刚才的点击 / 当前在线人数 | 数据参谋为 T-2 延迟（数据比当前晚 2 天）；告知"当前可查最新数据为前天（T-2），实时数据请在卖家中心 → 数据参谋首页查看" |

**自检处理流程：**
1. 命中任一信号 → 在调用任何业务工具/workctl 前，输出一段边界说明 + 提供平台手动入口或建议路由
2. 用户的请求中如有"可做项"（如"先帮我看看店铺数据，再确认域名"），应先完成可做项并交付凭证，再在结尾标注越界项的人工处理路径
3. 用户坚持要求越界项时，第二次重申边界并请求改写需求，**绝不在没有交付凭证的情况下输出"已完成"**

## 无凭证不交付（强制）

本技能涉及多源数据整合 + 文档导出 (PDF/Excel)，最易出现"声称生成但未交付"问题。本节规则覆盖此类失败模式：

- **本轮必须 emit 实际内容**：每一轮回复必须包含至少一项可验证产出 — markdown 表格、数据数字、文件链接、明确失败原因。禁止仅以"正在为您分析 / 报告生成中 / 数据一到位立即评估 / 完成利润模型穿透"作为本轮终态。
- **office-suite 失败时 STOP RULE**：若 PDF / Excel 导出失败（沙箱超时 / 模块维护 / 接口异常），不得回复"无法生成 PDF" 即结束。必须立即降级为：① 完整 markdown 表格直接展示在对话；② 关键诊断结论文字版；③ 末尾标注"原计划 .pdf 因 X 暂不可用，已先以表格交付，需稍后重试导出请告知"。
- **文件交付链接强制**：导出成功时，最终回复必须以 `[文件名](file:///绝对路径)` 形式 emit 链接；仅写"已为您生成 xx 报告"而无可点击链接，等同于未交付。
- **多步任务部分失败**：若某些数据接口超时，已采集成功的部分必须正常入报告，超时部分末尾列清单（接口名 + 失败原因），不得整体放弃也不得伪造数据。
