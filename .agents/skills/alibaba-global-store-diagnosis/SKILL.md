---
name: alibaba-global-store-diagnosis
description: >-
  Alibaba.com store diagnosis for GGS paid sellers (serviceType: hkgs/twgs/tp).
  Analyzes 4-5 dimensions (Star Rating, Buyer Traffic, Business Opportunities, Product, Trade)
  to deliver diagnostic conclusions, prioritized action plans, problem product optimization recommendations,
  scheduled periodic diagnosis, and IFM/non-member upgrade guidance.
  Use when sellers ask about store performance, issues, traffic, inquiries, product comparison, or request diagnosis.
  Typical triggers: "How is my store?", "店铺诊断", "Check my shop issue", "Star Rating dropped"
  Workflow: Identify intent → Retrieve data via MCP → Diagnose → Output report → Recommend optimization & scheduling.
  Skip for: single metric queries → data tool; product editing → product tool; order lookup → order tool; platform rules → knowledge base.
trigger_keywords:
  - store diagnosis
  - shop diagnosis
  - business diagnosis
  - operation analysis
  - check my store
  - check my shop
  - shop issue
  - shop problem
  - store issue
  - store problem
  - how to improve
  - performance review
  - what's wrong
  - how to optimize
  - traffic drop
  - store traffic
  - my traffic
  - not enough opportunities
  - new opportunities
  - explore opportunities
  - star rating
  - issues in my shop
  - issues in my store
  - inquiries drop
  - inquiries suddenly
  - my inquiries
  - products compare
  - compare to competitors
  - competitors in my category
  - top-selling products
  - trending products
  - products trending
  - 店铺诊断
  - 店铺问题
  - 星等级
  - 流量下降
  - 商机分析
  - 产品诊断
  - 怎么提升
  - 全面诊断
tools:
  - query_ggs_merchant_info
  - query_store_diagnosis_daily_odps
enabled: true
metadata:
  author: ggs-team
  version: "0.2.1"
---

# Store Diagnosis

## Feature Overview

Two response modes (auto-selected based on user intent):

- **Report Mode** — Full diagnosis report (4 or 5 dimensions depending on region) with data tables, analysis, and prioritized action plan (P0/P1/P2).
- **Q&A Mode** — Targeted 1-2 dimension analysis answering a specific question directly.

**v0.2 New Capabilities:**
- **Problem Product Inventory + Batch Optimization Recommendation**: Identifies problem products by type (3 optimizable categories: high-impression-low-click, clicks-no-AB, zero-exposure), ranks by traffic ROI, and recommends batch optimization with one-click trigger (default 10 products, max 200). Optimization execution is handled by the LLM via conversation context.
- **Scheduled Periodic Diagnosis**: Detects scheduling intent from keywords (每天/每周/每月) or offers after diagnosis via Next Steps.
- **IFM / Non-Member Upgrade Guidance**: For non-GGS merchants, provides targeted upgrade guidance instead of diagnosis.

Diagnosis dimensions (fixed order ① → ⑤):

| # | Dimension | Key Focus |
|---|-----------|----------|
| ① | Star Rating | 4 capability stars, health status, gap to next level |
| ② | Buyer Traffic | Channel distribution, regional sources, MoM trends |
| ③ | Business Opportunities | Opportunities count, buyer engagement, conversion funnel |
| ④ | Product | Valid/exposed/clicked products, Top & Super products, risk items |
| ⑤ | Trade | TA GMV, orders, shipment rate, NR cancellations. *(Transaction-market regions only — full region list in Step 1.)* |

## When to Use

| Question Type | English Examples | 中文示例 |
|--------------|-----------------|---------|
| Overall store diagnosis | "Give me an overview of my store performance", "Check my shop issue", "There are any issues in my shop" | "帮我做个全面店铺诊断", "我的店铺有什么问题吗" |
| Business Opportunities & inquiries | "How are my Business Opportunities?", "Why did my inquiries suddenly drop?" | "我的商机情况怎么样", "为什么询盘突然下降了" |
| Product performance | "What's wrong with my products?", "How do my products compare to competitors?" | "我的产品有什么问题", "我的产品和竞品比怎么样" |
| Star Rating improvement | "How to improve my Star Rating?", "Which category is dragging me down?" | "怎么提升星等级", "哪个维度拖后腿了" |
| Trade & fulfillment | "How is my trade data?", "What about seller-caused cancellations?" | "交易数据怎么样", "有没有卖家原因的取消单" |
| Buyer Traffic analysis | "How was my store's traffic this week?", "Why is my traffic dropping?" | "这周流量怎么样", "流量为什么在下降" |
| Trend comparison | "How does this compare to last month?", "What changed in the last 30 days?" | "和上个月比怎么样", "最近30天有什么变化" |

## When NOT to Use

| User Intent | Recommended Tool |
|-------------|-----------------|
| Query a single metric value (e.g. "How many active products do I have?") | Data query tool |
| Edit product information (e.g. "Help me change the title") | Product editing tool |
| Publish or list a product | Product publishing tool |
| Check a specific order status | Order query tool |
| Edit store basic info (e.g. store name, logo) | Store settings tool |
| Query platform rules or policies (e.g. "How are cross-border taxes calculated?") | Knowledge base / rule query tool |

## Core Rules

1. **Language**: Default output is **English**. Switch ONLY when the user explicitly requests another language, or writes in a non-English language (then mirror their language). When non-English, translate metric names and headings but keep proper nouns (`Trade Assurance`, `Alibaba.com`, `PIS`, etc.) in English.
2. **Terminology**: Use the standard data-metric names; do not paraphrase.
3. **Tone**: Avoid extreme wording (e.g. "plummeting", "dangerous"). State facts neutrally.
4. **Political sensitivity**: Taiwan and Hong Kong are regions of China — use `China Taiwan` / `China Hong Kong`. Use `region` instead of `country` for origin references.
5. **NEVER fabricate data**: Only analyze data actually returned by tool calls. When a tool call returns empty / error / timeout, or the tool is unavailable, **skip** that dimension and output: *"Data for this dimension is currently unavailable. Please visit https://i.alibaba.com/ for the latest data."* No hypothetical numbers, no estimated ranges, no made-up values — ever.
6. **Tool call discipline**: All tool calls MUST follow the **Appendix: Tool Call Specification** and pass the **Pre-call Checklist** before every invocation. Wrong parameter names, hallucinated enum values, or missing request bodies are critical errors that cause the entire diagnosis to fail.
7. **Data-backed only**: Every conclusion must cite specific numbers from the retrieved data (e.g. "**5,114** opportunities, **+12.3%** MoM"), never vague phrases like "slightly up". If fewer than 2 dimensions have valid data in Report Mode, inform the seller and suggest retrying later.
8. **Data thoroughness**: In Report Mode, each dimension's core metrics table MUST include ALL key fields defined in that dimension's `references/*.md` (last-30-day values, MoM changes, industry averages, TOP10 averages). No available field may be omitted. MoM fields must show both absolute value and change rate/direction.
9. **Clear categorization**: Each dimension is an independent section with its own heading, table, analysis paragraphs, and recommendations. Never mix data from different dimensions in one table. Each recommendation in the Action Plan must label its source dimension.
10. **Internal logic is invisible**: `references/` 文件中标注为"Agent 内部决策逻辑"的内容（如分类表、计算公式、优先级规则、版本号、接口限制说明）**严禁以任何形式出现在商家可见的输出中**。Agent 使用这些逻辑做决策，但输出只展示决策结果。禁止在报告中出现 "v0.2.0"、"圈品接口"、"Optimizable"、"ROI Priority"、"Detection Logic" 等内部术语。

## Step 0.5: Scheduled Task Keyword Detection

- **Input**: User's original query
- **Action**: Before any data retrieval, scan the user's query for scheduling intent keywords.

  **Keyword list**: `每天`, `每周`, `每月`, `定时`, `自动`, `定期`, `每日`, `daily`, `weekly`, `monthly`

  **Processing rules:**
  1. Fuzzy-match keywords (position-independent)
  2. If any keyword matches → set `schedule_on_first_response = true`
  3. Extract frequency intent:
     - "每天" / "每日" / "daily" → `daily`
     - "每周" / "weekly" → `weekly`
     - "每月" / "monthly" → `monthly`
     - "定时" / "自动" / "定期" (no explicit frequency) → default `daily`
  4. This flag will trigger automatic scheduled task creation after the report is generated (see Step 5)
  5. **No keyword match** → set `schedule_on_first_response = false`, proceed normally

  **Examples:**
  - Query: "帮我每周诊断一下店铺" → `schedule_on_first_response = true`, frequency = `weekly`
  - Query: "每天帮我检查下店铺" → `schedule_on_first_response = true`, frequency = `daily`
  - Query: "帮我诊断一下店铺" → `schedule_on_first_response = false`

- **Output**: `schedule_on_first_response` flag + frequency (if applicable)

## Step 1: Identify Intent & Determine Response Mode

- **Input**: User's question or consultation content
- **Action**:

  0. **Seller eligibility & region check (MUST execute first)**:
     Call `query_ggs_merchant_info` (no parameters needed) to obtain the seller's `serviceType` and `regCountry`.

     ```bash
     accio-mcp-cli call query_ggs_merchant_info --json '{}'
     ```

     Then verify `serviceType`. This skill ONLY applies to GGS paid sellers. Eligible types:

     | serviceType | Description | Action |
     |-------------|-------------|--------|
     | `hkgs` | China Hong Kong paid seller | ✅ Proceed with diagnosis |
     | `twgs` | China Taiwan paid seller | ✅ Proceed with diagnosis |
     | `tp` | GGS (Global Gold Supplier) — overseas paid seller | ✅ Proceed with diagnosis |
     | `ifm` | IFM (International Free Member) — unpaid seller | ⛔ Do NOT diagnose → Go to **IFM Upgrade Guidance** |
     | Other (`cgs`, `free`, unknown, etc.) | Non-Alibaba.com Global Member | ⛔ Do NOT diagnose → Go to **Non-Member Upgrade Guidance** |

     **IFM Upgrade Guidance (serviceType = `ifm`):**

     If `serviceType` is `ifm`, **do NOT proceed with any diagnosis**. Instead, output the following upgrade guidance message (in the user's language):

     > ⚠️ **您当前授权的账号类型为：IFM（International Free Member，国际免费会员）**
     >
     > 由于系统能力限制，诊断服务目前仅能获取 **GGS** 会员店铺的数据并进行分析。
     >
     > **GGS = Global Gold Supplier（全球金牌供应商）**，指在中国大陆以外的国家或地区注册，并在阿里巴巴国际站（Alibaba.com）上进行跨境出口销售的付费高级会员商家。
     >
     > **如需使用诊断服务，请更换 GGS 账号进行授权。**
     >
     > 如果您还不是 GGS 会员，可以访问 **https://seller.alibaba.com/** 了解详情。开通后您将获得：
     > - 无限发品（IFM 有数量限制）
     > - Gold Supplier 信任标识 — 显著提升点击率和询盘转化
     > - RFQ 市场准入 — 主动向全球买家报价
     > - P4P 精准付费推广工具
     > - 完整自定义数字店铺
     > - 专属客户经理支持
     > - AI 智能店铺诊断和批量优化工具的完整权限
     >
     > 如果您对升级或账号切换有疑问，随时可以问我！

     **Do NOT proceed with any subsequent steps after outputting the IFM guidance.**

     **Non-Member Upgrade Guidance (serviceType is NOT `hkgs`, `twgs`, `tp`, or `ifm`):**

     If `serviceType` does not match any known GGS or IFM type, **do NOT proceed with any diagnosis**. Instead, output the following upgrade guidance message (in the user's language):

     > ⚠️ **您当前授权的账号类型为：`{actual_serviceType}`**
     >
     > 由于系统能力限制，诊断服务目前仅能获取 **GGS** 会员店铺的数据并进行分析。
     >
     > **GGS = Global Gold Supplier（全球金牌供应商）**，指在中国大陆以外的国家或地区注册，并在阿里巴巴国际站（Alibaba.com）上进行跨境出口销售的付费高级会员商家。
     >
     > **如需使用诊断服务，请更换 GGS 账号进行授权。**
     >
     > 如果您还不是 GGS 会员，可以访问 **https://seller.alibaba.com/** 了解详情。开通后您将获得：
     > - 无限发品
     > - Gold Supplier 信任标识 — 显著提升点击率和询盘转化
     > - RFQ 市场准入 — 主动向全球买家报价
     > - P4P 精准付费推广工具
     > - 完整自定义数字店铺
     > - 专属客户经理支持
     > - AI 智能店铺诊断和批量优化工具的完整权限
     >
     > 如果您对入会或账号切换有疑问，随时可以问我！

     **Do NOT proceed with any subsequent steps after outputting the Non-Member guidance.**

     Use the returned `regCountry` to determine:
     - **Whether to include Trade dimension**: Trade diagnosis ONLY applies to transaction-market regions: `CN` (China Hong Kong), `TW` (China Taiwan), `PK` (Pakistan), `IN` (India), `VN` (Vietnam), `JP` (Japan), `KR` (South Korea), `IT` (Italy), `ES` (Spain), `DE` (Germany), `FR` (France), `US` (United States), `MX` (Mexico), `TR` (Turkey). **If `regCountry` is NOT in this list (e.g. `MY` Malaysia, `TH` Thailand, `BR` Brazil), skip the Trade dimension entirely** — do NOT call the Trade data tool, do NOT output any Trade section, and do NOT show a "not applicable" message.
     - Other analysis rules (e.g. Star Rating sub-rules)

     > Seller identity is auto-resolved by the server. Do NOT search for other tools, do NOT ask the user for region / `company_id` / `ali_id`.

  1. Determine response mode:

  **Report Mode** — User wants a holistic store overview, triggering a full diagnosis:
  - "Give me a comprehensive review", "How is my store overall?", "Generate a diagnosis report", "Run a health check"
  - "Any issues in my shop?", "Check my shop issue", "There are issues in my store", "What's wrong with my shop?"
  - **Rule: When the user asks about the store/shop broadly WITHOUT specifying a single dimension (e.g. Star Rating, traffic, products), always default to Report Mode.**
  - Execute all applicable dimensions (5 for transaction-market regions, 4 for others — Trade is skipped entirely for non-transaction-market regions), output a complete diagnosis report

  **Q&A Mode** — User asks about a specific issue, triggering on-demand diagnosis:
  - "How to improve my Star Rating?", "What's wrong with my products?", "Why is traffic dropping?"
  - The question must clearly target ONE specific dimension (Star Rating, Product, Traffic, Trade, or Business Opportunities)
  - Execute only the relevant 1-2 dimensions, answer directly in plain text

  2. Determine output language per Core Rule #1.
  3. If user intent is unclear or essential information is missing, proactively ask.

- **Output**: Response mode (Report / Q&A) + dimensions to analyze + seller basic info + output language

## Step 2: Retrieve Operational Data

- **Input**: Dimensions to analyze from Step 1
- **Action**: Call MCP tools using the **call template** below.

### ⚠️ Mandatory Call Template

Every data call MUST use exactly this format — no exceptions:

```bash
accio-mcp-cli call query_store_diagnosis_daily_odps --json '{"dailyScenarioCode": "<ENUM>"}'
```

Where `<ENUM>` is one of the **4 valid values** listed below. **Before sending each call, mentally walk through the 6-item Pre-call Checklist in the Appendix.** If any item fails, fix the call before sending — do NOT invoke and "see what happens".

### Dimension → Scenario Code Mapping

> **Important**: 5 dimensions share **only 4** scenario codes. `AGENTIC_DIAGNOSIS_OPPORTUNITIES_D` covers BOTH Business Opportunities AND Trade in one call — Trade has **no** separate code.

| Dimension | `dailyScenarioCode` |
|-----------|---------------------|
| Star Rating | `AGENTIC_DIAGNOSIS_STAR_RANK_D` |
| Buyer Traffic | `AGENTIC_DIAGNOSIS_TRAFFIC_D` |
| Business Opportunities **+ Trade** | `AGENTIC_DIAGNOSIS_OPPORTUNITIES_D` |
| Product | `AGENTIC_DIAGNOSIS_PRODUCT_D` |

### Query Strategy

- **Latest data**: Omit `dataDay` to get the latest partition (default behavior). Only pass `dataDay` (format `YYYY-MM-DD`) when the user explicitly asks for a specific historical date.
- **Parallel calls**: In Report Mode, issue all 4 calls in a **single message batch** (parallel tool calls), not sequentially.
- **Trade reuses `AGENTIC_DIAGNOSIS_OPPORTUNITIES_D`** — no extra call needed. For non-transaction-market regions, simply skip Trade analysis on that response.

- **Output**: Raw JSON datasets per dimension.

  **Fallback (per Core Rule #5 — never fabricate):**
  - Tool returns empty / error / timeout → mark dimension "data unavailable", proceed with the rest.
  - Tool returns `success: true` but `total: 0` / `aiSalesWeekDiagnoseList: null` → output: *"Store data is currently being updated and will sync automatically once ready. For real-time data, please visit https://i.alibaba.com/."*
  - Record success/failure status and pass to Step 3.

## Step 3: Execute Diagnostic Analysis

- **Input**: Raw data from Step 2 + seller region + response mode
- **Action**: For each dimension to analyze, execute diagnosis per the rules in the corresponding references/ document. **Process dimensions in the same fixed order as the final report (① → ⑤)** to avoid reordering later:
  1. Star Rating → `references/star-rating-diagnosis.md`
  2. Buyer Traffic → `references/buyer-traffic-diagnosis.md`
  3. Business Opportunities → `references/opportunity-diagnosis.md`
  4. Product → `references/product-diagnosis.md`
  5. Trade → `references/trade-diagnosis.md` *(transaction-market regions only)*

  ### Report Mode Additional Steps

  After completing all applicable dimensions (4 or 5), also:
  - Synthesize cross-dimension conclusions for an overall assessment (strengths & weaknesses)
  - Match with strategy knowledge base for precise strategy recommendations (if the knowledge base returns strategies and priorities, defer to them)
  - Prioritize issues into three tiers:

  P0 (Urgent — requires immediate action):
  - Star Rating health status is "Unhealthy"
  - Seller-caused cancellations (NR cancellations) count is too high (>2 orders), risking traffic demotion *(transaction-market regions only)*

  P1 (Important — significant impact on business growth):
  - Star Rating improvement, trade data improvement, Business Opportunities improvement
  - Product optimization, traffic source development, conversion rate optimization

  P2 (Normal — can be optimized later):
  - Marketing automation tool usage, store decoration optimization
  - Event participation, advanced marketing strategies

  ### Q&A Mode Additional Notes

  Focus on completing the analysis for the dimensions the user asked about. However, if P0 risk signals are detected during data retrieval (unhealthy status, NR cancellations > 2), briefly flag them at the end of the response even if they're outside the user's question scope — without expanding into full analysis.

- **Output**: Diagnostic conclusions and recommendations per dimension

## Step 4: Output Results

- **Input**: Diagnostic conclusions from Step 3 + response mode

### Report Mode

> ⚠️ **Mandatory format rules** (violation = critical error):
> 1. The report MUST contain every applicable dimension section, in the fixed order and with the **exact heading names** listed below. Never merge, rename, or replace them with free-form layouts (e.g. "Critical Issue #1").
> 2. Each dimension contains 3 separate parts in this order — see definitions below for the exact part names and content.
> 3. **Data-first**: tables must be populated from real API responses. Show `—` only for fields the API genuinely did not return; never use `—` as a placeholder when data was successfully retrieved.
> 4. **Trade is completely omitted (no heading at all) for non-transaction-market regions** — this is not a "data unavailable" case. For applicable dimensions whose data is missing, show the heading with the standard "data currently unavailable" note (Core Rule #5).

**Report Title & Store Info Header**

The report MUST start with a title line including the data date range, followed by a compact store info block:

```
# Store Diagnosis Report ({start_date} to {end_date})

- Store name: {name}
- Industry: {industry}
- Current rating: {N}★
- Health Status: {Healthy / Unhealthy}
- Data Period: Last 30 days
```

**Dimensions — in this fixed order (use ① ② ③ ④ for non-transaction-market regions, ① ② ③ ④ ⑤ for transaction-market regions)**

Each dimension MUST be a **separate, independent section** with its own heading, containing 3 parts:

1. **Core metrics table** (key data with MoM changes, industry comparison where available)
2. **Diagnostic Conclusion** — numbered paragraphs, key figures in **bold**
3. **Improvement Recommendations** — specific, actionable items separated from the conclusion

| # | Heading format | Key Coverage (high-level) | Reference (authoritative field list) |
|---|---------------|---------------------------|--------------------------------------|
| ① | **Star Rating Diagnosis** | 4 capability stars, overall star, health status | `references/star-rating-diagnosis.md` |
| ② | **Buyer Traffic Diagnosis** | Channel distribution & MoM, regional sources vs industry | `references/buyer-traffic-diagnosis.md` |
| ③ | **Business Opportunities Diagnosis** | Opportunities count, buyer engagement, conversion funnel, industry & TOP10 benchmarks | `references/opportunity-diagnosis.md` |
| ④ | **Product Diagnosis** | Product pool health (valid/exposed/clicked/AB/Top/Super/RTS), risk-controlled & spam products, MoM changes | `references/product-diagnosis.md` |
| ⑤ | **Trade Diagnosis** | TA GMV, orders, fulfillment, cancellations, payment conversion *(transaction-market regions only)* | `references/trade-diagnosis.md` |

> The `Reference` column is the **authoritative source** for the exact field list of each dimension. You MUST load the linked `references/*.md` to get all required fields, and load `references/output-template.md` for the exact table format.

**📋 Action Plan Summary**

At the end of the report, summarize up to 6 action items ranked P0 → P1 → P2, in a table with columns: Priority | Dimension | Action Item | Steps | Expected Outcome.

**Disclaimer (must appear at the very end of the report)**

```
---
> *This report is generated by AI and is for reference only. For detailed data, please visit https://i.alibaba.com/*
```

### Q&A Mode

Answer the user's question directly in plain text:
1. Lead with the conclusion (1-2 sentences addressing the core concern)
2. Support with data (key metrics in a table, compared to industry benchmarks)
3. Close with recommendations (specific, actionable steps)
4. Recommendations must be concrete (e.g. "Reduce average response time from 8 hours to under 4 hours", not "improve response speed")
5. If a P0 risk is detected outside the user's question scope, briefly mention it at the end
6. **If the diagnosed dimension includes Product AND optimizable problem products > 0**: append a compact Next Steps block (场景 A format from `references/output-template.md`, no auto-monitor section)

- **Output**: User-facing diagnostic response (+ optional Next Steps if Product dimension involved)

## Step 5: Problem Product Batch Optimization & Scheduled Diagnosis

This step covers two post-diagnosis capabilities that are triggered via the "⚡ Next Steps" section.

**适用模式：**
- **Report Mode**: 始终在报告末尾输出 Next Steps
- **Q&A Mode**: 当诊断涉及 **Product 维度** 且检测到可优化问题商品 > 0 时，也在回答末尾追加精简版 Next Steps（仅批量优化推荐，不含自动监控）

### ⚡ Next Steps (Proactive Recommendation)

After the Action Plan in Report Mode, output a "Next Steps" section that **推荐行动并引导用户一键确认**。

**核心设计原则：**
- 诊断 Skill 只负责"开处方"（明确告诉用户该优化什么、为什么、多少个）
- 用户回复带有优化意图的短语（如"帮我优化商品"）即可启动后续流程
- **平台根据用户输入的优化意图自动路由到圈品/优化 Skill**，诊断 Skill 无需参与后续执行
- **诊断 Skill 不调用任何圈品或优化工具**；与下游 Skill 为弱关联（通过对话上下文自然衔接，由平台根据用户意图路由到圈品和优化 Skill，不直接调用其工具或传递结构化参数）

**Next Steps 内容规则：**

- **前置条件**：可优化问题商品总数 > 0 才展示批量优化推荐。若三类可优化品类（高曝光低点击 / 有点击无询盘 / 零曝光）计数均为 0，**整个 Next Steps 不输出**。

- **批量优化推荐**（唯一行动点）:
  - **⚠️ 首次推荐永远是 10 个。** 只有用户主动要求更多时才可加量（上限200）
  - **⚠️ 严禁推荐风控商品或 Spam 商品**，只能从3种可优化类别中选择（高曝光低点击 / 有点击无询盘 / 零曝光）
  - 必须包含：问题商品数量 + 类型 + 为什么要优化 + 期望效果
  - 必须包含流程简述（让用户知道会发生什么）
  - 必须包含安全承诺（未经确认不修改线上商品）
  - **末尾触发词**：引导用户回复「**帮我优化商品**」（5字，带优化意图，平台可路由到优化能力）

- **⚠️ 首次报告禁止展示定时任务/自动监控引导**（定时任务引导仅在用户追问后触发，见"Multi-turn Dialogue Handling"）

- **格式规则**:
  - Next Steps 只有一个行动点（批量优化）：**不加编号，不加小标题**，直接写推荐内容
  - 流程说明用分行列表（- 开头），严禁挤成大段落
  - 末尾触发词「帮我优化商品」加粗

See `references/output-template.md` "⚡ Next Steps" section for exact templates.

### User Intent Routing (追问机制)

**正常流程：** 用户看到 Next Steps 后回复「帮我优化商品」→ 平台根据"优化商品"意图自动路由到圈品/优化 Skill → 圈品 Skill 从对话上下文读取诊断结论执行圈品 → 优化 Skill 接收 CSV 执行优化。**诊断 Skill 退出流程，不参与后续执行。**

**兜底规则：** 当用户回复模糊词（如"开始"、"好"、"ok"、"继续"、"1"）时，这些词不含优化意图，平台**无法**路由到优化能力。此时 Agent 应引导用户使用正确的触发短语：

> 收到！请回复「**帮我优化商品**」，我将根据诊断结果自动为您圈品并启动批量优化。

**⚠️ 严禁行为：**
- ❌ 不要自己尝试调用圈品或优化工具（本 Skill 不包含这些工具）
- ❌ 不要搜索文件、grep 代码、查找工具定义
- ❌ 不要告诉用户"工具不存在"或"无法执行"
- ❌ 不要输出任何内部 Skill 名称（如 `alibaba-global-product-optimize`、`alibaba-global-product-select`）
- ✅ 只需引导用户发出含优化意图的短语，平台会自动路由

### Scheduled Diagnosis Configuration

**Trigger 场景：**
1. `schedule_on_first_response = true`（用户在首次 Query 中包含定时关键词）→ 报告输出后静默创建定时任务
2. 用户在追问后回复"开启监控"、"设置定时"、"enable" → 创建定时任务

**Configuration:**
- Create a scheduled task that runs this diagnosis Skill periodically
- Frequency: `daily` (每天 9:00) / `weekly` (每周一 9:00) / `monthly` (每月1日 9:00)
- Task content: Full Report Mode diagnosis with all applicable dimensions

**Rules:**
- If `schedule_on_first_response = true`, the scheduled task is silently created after report output, **无需任何用户确认**
- If user has already declined, do not ask again

**Modification & Cancellation:**
- "Change to weekly" → Update frequency
- "Cancel scheduled diagnosis" → Remove the task
- "When is my next diagnosis?" → Report next run time

## Examples

### Example 1: Report Mode — Full Diagnosis

**User input:** "Help me do a comprehensive store diagnosis"

**Execution:**
1. Intent → Report Mode
2. Call `query_ggs_merchant_info` → `serviceType = hkgs` (eligible), `regCountry = CN` (transaction-market → 5 dimensions)
3. Issue 4 calls **in parallel** (Trade reuses OPPORTUNITIES):
   ```bash
   accio-mcp-cli call query_store_diagnosis_daily_odps --json '{"dailyScenarioCode": "AGENTIC_DIAGNOSIS_STAR_RANK_D"}'
   accio-mcp-cli call query_store_diagnosis_daily_odps --json '{"dailyScenarioCode": "AGENTIC_DIAGNOSIS_TRAFFIC_D"}'
   accio-mcp-cli call query_store_diagnosis_daily_odps --json '{"dailyScenarioCode": "AGENTIC_DIAGNOSIS_OPPORTUNITIES_D"}'
   accio-mcp-cli call query_store_diagnosis_daily_odps --json '{"dailyScenarioCode": "AGENTIC_DIAGNOSIS_PRODUCT_D"}'
   ```
4. Run per-dimension diagnosis → synthesize → prioritize P0/P1/P2 → output report per `references/output-template.md`.

### Example 2: Q&A Mode

**User input:** "My Star Rating dropped, what happened?"

1. Intent → Q&A Mode, Star Rating only.
2. Call once: `--json '{"dailyScenarioCode": "AGENTIC_DIAGNOSIS_STAR_RANK_D"}'`
3. Identify the bottleneck sub-star, compute gap to next level, answer with concrete numbers and one actionable recommendation. Briefly flag any P0 risk found in the response.

### Example 3: Multi-turn Follow-up

User asks dimension by dimension, then "actually, give me the full report" → switch from Q&A to Report Mode, fetch the missing scenario codes, output the complete report.

### Example 4: Wrong Call → Self-Correction (study this carefully)

❌ **Wrong attempt:**
```bash
accio-mcp-cli call query_store_diagnosis_daily_odps --json '{"agentType": "AGENTIC_DIAGNOSIS_PRODUCT_QUALITY_D"}'
```

**Two issues:**
1. Parameter name `agentType` is invalid — the only accepted key is `dailyScenarioCode`.
2. Enum value `AGENTIC_DIAGNOSIS_PRODUCT_QUALITY_D` does NOT exist — the correct one is `AGENTIC_DIAGNOSIS_PRODUCT_D`.

✅ **Corrected call:**
```bash
accio-mcp-cli call query_store_diagnosis_daily_odps --json '{"dailyScenarioCode": "AGENTIC_DIAGNOSIS_PRODUCT_D"}'
```

### Example 5: IFM Seller → Upgrade Guidance (No Diagnosis)

**User input:** "帮我诊断一下店铺"

**Execution:**
1. Call `query_ggs_merchant_info` → `serviceType = ifm`
2. IFM detected → **Do NOT proceed with diagnosis**
3. Output IFM Upgrade Guidance message (Step 1, section 0)

**Key rule:** No subsequent steps are executed. No data is retrieved. No report is generated.

### Example 6: Scheduled Diagnosis (Keyword Detection)

**User input:** "帮我每周诊断一下店铺"

**Execution:**
1. Step 0.5: Detect keyword "每周" → `schedule_on_first_response = true`, frequency = `weekly`
2. Step 1: Intent → Report Mode (full diagnosis)
3. Steps 2-4: Execute full diagnosis and output report
4. Step 5: Silently create scheduled task after report. Next Steps 只展示批量优化（定时任务已自动创建，无需引导）:
   ```
   ⚡ Next Steps

   您的店铺有 {total} 个高曝光低点击商品（近30天有曝光但0点击），
   是当前流量浪费最严重的品类。我先优化其中 ROI 最高的 10 个，提升点击率。

   - 流程：AI 圈品（约30秒）→ 生成优化方案（约2-3分钟）→ 您逐条查看 → 确认后才发布
   - 未经您同意不会修改任何线上商品

   > 回复「**帮我优化商品**」启动优化
   ```

### Example 7: User Intent Routing — 追问机制

**场景 A：用户回复正确触发词**

**User input (after receiving diagnosis report):** "帮我优化商品"

**预期行为：**
- 平台检测到"优化商品"意图 → 自动路由到圈品/优化 Skill
- 圈品 Skill 从对话上下文读取诊断结论（类型=高曝光低点击，数量=327，ROI 最高 10 个）
- 圈品 Skill 执行圈品 → 生成 CSV → 优化 Skill 接管后续流程
- **诊断 Skill 不做任何事**（已完成使命，平台已路由到其他 Skill）

**场景 B：用户回复模糊词**

**User input (after receiving diagnosis report):** "好" / "开始" / "ok"

**Agent 正确行为：**
> 收到！请回复「**帮我优化商品**」，我将根据诊断结果自动为您圈品并启动批量优化。

**⚠️ Agent 错误行为（严禁）：**
- ❌ 自己调用圈品或优化工具（本 Skill 不包含这些工具）
- ❌ 搜索文件或 grep 代码寻找工具
- ❌ 告诉用户"无法执行优化"
- ❌ 输出内部 Skill 名称

## Multi-turn Dialogue Handling

Users may follow up after the initial diagnosis. Handle these scenarios:
- Switch from Q&A to Report: e.g. first asks "How to improve Star Rating?", then "Give me a full overview" → switch to Report Mode, run full diagnosis
- Drill down from Report: e.g. after receiving the report, asks "How exactly should I optimize my products?" → switch to Q&A Mode, deep-dive into the Product dimension
- Reference prior context: e.g. "How do I improve the response time you just mentioned?" → locate the specific metric from conversation history
- Comparison requests: e.g. "How about compared to last month?" → use MoM data (_last_30d / _mom fields) for trend analysis
- Add dimensions: e.g. "What about Buyer Traffic?" → stay in Q&A Mode, supplement with that dimension's diagnosis

### 追问后定时任务引导

**每次回答用户追问后**（不是首次报告），检查是否应引导定时任务：

**前置条件（全部满足才引导）：**
1. `schedule_on_first_response = false`（首次报告未自动创建任务）
2. 执行 `cat "$WORKSPACE_DIR/.accio/cron/jobs.json"` 确认不存在包含 "store-diagnosis" 或 "alibaba-global-store-diagnosis" 的 cron 条目
   - `$WORKSPACE_DIR` 为 Accio 平台标准环境变量
   - 变量未定义 / 文件不存在 / 读取报错 → 视为无已有任务（条件满足）
3. 本次会话中未曾引导过（避免重复打扰）

**满足条件时**，在追问回答末尾追加一句：
> "需要开启定时诊断吗？可以每周自动分析并提醒您新问题。回复「开启监控」即可。"

**不满足条件时**：完全不出现，不展示状态，不引导修改。

## Error Handling

| Scenario | Action |
|----------|--------|
| `serviceType` not in `hkgs / twgs / tp` | If `ifm`: output IFM Upgrade Guidance (Step 1, section 0). Otherwise: output Non-Member Upgrade Guidance (Step 1, section 0). Do NOT proceed with diagnosis. |
| Identity cannot be resolved (401 / session expired) | Ask the user to log in again. Never ask for `company_id` / `ali_id`. |
| **Tool call returns parameter error** | **Re-check against the Pre-call Checklist (Appendix). Retry at most ONCE with the corrected call. If the second attempt still fails, mark the dimension "data unavailable" and proceed.** |
| Tool call returns empty / error / timeout | Mark that dimension "data unavailable" and proceed with the rest. |
| API returns `success: true` but data is empty (e.g. `total: 0`) | Reply: *"Store data is currently being updated and will sync automatically once ready. For real-time data, please visit https://i.alibaba.com/."* — never fabricate. |
| Tool not found in current environment | Skip all dimensions depending on it; output each with the standard "data unavailable" note. |
| All data sources unavailable | Reply: *"Unable to retrieve operational data at this time. Please try again later or visit https://i.alibaba.com/."* — never output a fabricated report. |
| `regCountry` missing from `query_ggs_merchant_info` response | Ask the user for the seller's region (determines Trade applicability). |
| Contradictory data (e.g. totals don't match sub-items) | Skip the contradictory metrics, flag the inconsistency to the seller. |


## Appendix: Tool Call Specification

The **only correct invocation format** is:

```
accio-mcp-cli call <tool_name> --json '<JSON_OBJECT>'
```

Seller identity (`companyId`) is auto-resolved by the server. **Never pass `company_id` / `ali_id` / any identity key** in the JSON.

### Available Tools

| Tool | Parameter | Type | Required | Notes |
|------|-----------|------|----------|-------|
| `query_ggs_merchant_info` | — | — | — | No parameters. Call with `--json '{}'`. Returns `serviceType`, `regCountry`. |
| `query_store_diagnosis_daily_odps` | `dailyScenarioCode` | string | ✅ Yes | Must be exactly one of the 4 enum values below. |
| `query_store_diagnosis_daily_odps` | `dataDay` | string `YYYY-MM-DD` | ❌ No | Omit to get the latest partition (default). Pass only when user requests a specific historical date. |

### Valid `dailyScenarioCode` — EXACTLY 4 Values

- `AGENTIC_DIAGNOSIS_STAR_RANK_D` — Star Rating
- `AGENTIC_DIAGNOSIS_TRAFFIC_D` — Buyer Traffic
- `AGENTIC_DIAGNOSIS_OPPORTUNITIES_D` — Business Opportunities **+** Trade **+** conversion funnel (one call covers all three)
- `AGENTIC_DIAGNOSIS_PRODUCT_D` — Product

### ✅ Correct Calls

```bash
accio-mcp-cli call query_ggs_merchant_info --json '{}'
accio-mcp-cli call query_store_diagnosis_daily_odps --json '{"dailyScenarioCode": "AGENTIC_DIAGNOSIS_OPPORTUNITIES_D"}'
accio-mcp-cli call query_store_diagnosis_daily_odps --json '{"dailyScenarioCode": "AGENTIC_DIAGNOSIS_PRODUCT_D", "dataDay": "2025-04-15"}'
```

### ❌ Wrong Call Patterns — Grouped by Failure Mode

**① Missing / malformed request body**

| Wrong | Why | Fix |
|-------|-----|-----|
| `...daily_odps` *(no `--json`)* | Body missing | Always pass `--json '<JSON>'` |
| `...daily_odps --json '{}'` | Required field missing | `--json '{"dailyScenarioCode": "..."}'` |
| `...daily_odps --dailyScenarioCode "..."` | Params as CLI flags | Wrap inside `--json '{...}'` |
| `...daily_odps --key '{...}'` / `--raw '{...}'` | Wrong flag name | Use `--json` |
| `...query_ggs_merchant_info --json '{"dailyScenarioCode": "..."}'` | This tool takes no params | Use `--json '{}'` |

**② Wrong parameter type**

| Wrong | Why | Fix |
|-------|-----|-----|
| `{"dailyScenarioCode": ["AGENTIC_DIAGNOSIS_PRODUCT_D"]}` | Array, not string | `"dailyScenarioCode": "AGENTIC_DIAGNOSIS_PRODUCT_D"` |
| `{"dailyScenarioCode": {"code": "..."}}` | Object, not string | Plain string |
| `{"dailyScenarioCode": "opportunities_d"}` | Lowercase | Must be uppercase enum |
| `{"dataDay": "2025/04/15"}` or `{"dataDay": 1705276800}` | Wrong date format | Must be `YYYY-MM-DD` string |

**③ Forbidden / invented parameter names**

| Wrong | Why | Fix |
|-------|-----|-----|
| `{"agentType": "..."}` | `agentType` belongs to a different tool | Use `dailyScenarioCode` |
| `{"scenarioCode": "..."}` / `{"scenario": "..."}` / `{"code": "..."}` / `{"type": "..."}` | Invented key | The only accepted key is `dailyScenarioCode` |
| `{"company_id": "..."}` / `{"ali_id": "..."}` / `{"comp_id": "..."}` | Identity params forbidden | Remove — server auto-resolves |

**④ Hallucinated enum values — DO NOT invent**

| Wrong | Fix |
|-------|-----|
| `AGENTIC_DIAGNOSIS_PRODUCT_QUALITY_D` | `AGENTIC_DIAGNOSIS_PRODUCT_D` |
| `AGENTIC_DIAGNOSIS_CONVERSION_D` | `AGENTIC_DIAGNOSIS_OPPORTUNITIES_D` (includes conversion data) |
| `AGENTIC_DIAGNOSIS_TRADE_D` | `AGENTIC_DIAGNOSIS_OPPORTUNITIES_D` (Trade shares this code) |
| `AGENTIC_DIAGNOSIS_FULFILLMENT_D` / `..._INQUIRY_D` / any other suffix | One of the 4 valid enums above |

### ✅ Pre-call Checklist — verify ALL 6 items before every invocation

1. **Flag**: `--json '<JSON>'` — not `--key`, `--raw`, or `--paramName` flags.
2. **Body present**: JSON is non-empty (only `query_ggs_merchant_info` may use `{}`).
3. **Type**: `dailyScenarioCode` is a **string**, `dataDay` (if used) is a `YYYY-MM-DD` string.
4. **Enum valid**: value is **exactly** one of the 4 uppercase codes above — no invented suffixes.
5. **No forbidden keys**: no `agentType`, `scenarioCode`, `scenario`, `code`, `type`, `company_id`, `ali_id`, `comp_id`.
6. **Default behavior**: omit `dataDay` unless the user explicitly asks for a historical date.
