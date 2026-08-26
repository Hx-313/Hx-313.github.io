---
name: alibaba-global-smart-assistant-settings
description: |
  Smart Assistant natural-language settings control skill for Alibaba.com sellers. Use when the merchant wants the agent to view, explain, compare, enable, disable, or update any Smart Assistant feature switch or setting through natural language. Coverage includes Product, Message, RFQ, and Risk & compliance sections, plus feature-level settings such as Auto reception, Smart visitor reception, Smart buyer reconnect, Smart RFQ quote, New product optimization, Low-impression product optimization, Low-visitor product optimization, Low-inquiry product optimization, IP infringement risk handling, and Smart EU representative linking features. This skill is for querying and executing settings in agent conversation.
  Skip for:
  - Page implementation, UI design, or frontend development for Smart Assistant
  - Business analytics, weekly reports, or conversation diagnostics (use store-diagnosis Skill)
  - Content generation such as product copywriting, marketing content, or buyer reply drafts
  - Order processing, appeals, or product listing submissions
  - Querying platform rules or operation guides (use knowledge-base Skill)
trigger_keywords:
  - Smart Assistant settings
  - show settings
  - turn on feature
  - turn off feature
  - 查看设置
  - 打开功能
  - 关闭功能
metadata:
  version: "0.1.0"
tools:
  - query_ggs_agent_detail
  - update_ggs_agent_detail_list
  - query_ggs_contact_setting_info
  - query_ggs_auto_follow_marketing_config
  - set_ggs_auto_follow_marketing_config
  - query_ggs_open_time_config
  - set_ggs_open_time_config
  - query_ggs_auto_quote_setting
  - save_or_update_ggs_auto_quote_setting
  - get_ggs_risk_digital_gpsr_risk
  - query_ggs_all_effective_eu_agent
  - create_ggs_eu_agent
  - query_ggs_risk_detected_stat
workflow: >
  检测用户语言与动作类型 → 识别命中的是 feature、section 还是 Smart Assistant 整页 → 只读取最小必要的 **feature-level reference** → 调用最少必要的运行时工具查询或更新 → 用与用户一致的语言返回结果。**不要把 section reference 当成中间层；section 结果应由多个 feature reference 组装。**
---

# Smart Assistant Natural-Language Settings Control / Smart Assistant 自然语言设置控制

本 Skill 的职责，是让商家在 Agent 对话中通过自然语言 **查看、解释、比较、开启、关闭和更新 Smart Assistant 各功能开关与配置**。它不是页面实现 Skill，不负责前端交互、页面组件、接口开发或按钮设计。默认世界观始终是：**商家在对话里下达设置请求，Agent 识别目标功能并调用运行时工具执行。**

This Skill should behave like a settings operator for **Smart Assistant**. It should not switch into implementation mode unless the user explicitly changes the task into product or engineering design.

## When to Use

| 用户意图 / User Intent | 中文示例 | English Examples |
| --- | --- | --- |
| 查看某个功能的当前状态 | “我想看 Auto reception 现在怎么配的” | “Show my Auto reception settings” |
| 更新某个功能的开关或字段 | “把 Smart RFQ quote 打开” | “Turn on Smart RFQ quote” |
| 查看某个 section 下有哪些功能在运行 | “看看 Product 下面都开了什么” | “Show Product settings” |
| 解释某个功能是否值得开启 | “为什么建议开 IP infringement risk handling” | “Why enable IP infringement risk handling” |
| 查看 Smart Assistant 整体概览 | “查看 Smart Assistant 全部开关” | “Show Smart Assistant settings overview” |

## When NOT to Use

| 场景 | 原因 | 正确方向 |
| --- | --- | --- |
| 用户要设计页面、开发接口、定义按钮交互 | 本 Skill 负责对话式设置控制，不负责页面实现 | 转向产品实现或研发说明任务 |
| 用户要做经营分析、周报、会话诊断 | 这是分析任务，不是设置执行 | 转向分析类 Skill |
| 用户要生成商品文案、营销内容、买家回复正文 | 这是内容生产，不是 Smart Assistant 配置 | 转向内容生成任务 |
| 用户要处理订单、申诉、上架资料提交等业务动作 | 不属于 Smart Assistant 设置范围 | 转向对应业务流程 |

## Coverage Map

本 Skill 覆盖 **Smart Assistant** 下的全部一级 section 与当前已知 feature。执行时必须坚持 **full coverage, minimum scope**：覆盖全量能力，但每次只处理命中的最小范围。

| Level | Node | Notes |
| --- | --- | --- |
| Page | Smart Assistant | 总设置页 |
| Section | Message | 一级分组 |
| Section | Product | 一级分组 |
| Section | RFQ | 一级分组 |
| Section | Risk & compliance | 一级分组 |
| Feature | Auto reception | under Message |
| Feature | Smart visitor reception | under Message |
| Feature | Smart buyer reconnect | under Message |
| Feature | Smart RFQ quote | under RFQ |
| Feature | New product optimization | under Product |
| Feature | Low-impression product optimization | under Product |
| Feature | Low-visitor product optimization | under Product |
| Feature | Low-inquiry product optimization | under Product |
| Feature | IP infringement risk handling | under Risk & compliance |
| Feature | Smart EU representative linking | under Risk & compliance |

## Multilingual Output Rule

先检测用户输入语言，再执行和回复。输出语言必须跟随用户输入语言；若无法识别，则默认英文。无论输出语言是什么，**官方功能名始终保持英文**，不要翻译为中文别名或其他语种译名。

| 输入语言 | 输出语言 | 保持英文的专有名词 |
| --- | --- | --- |
| 中文 | 中文 | Smart Assistant, Message, Product, RFQ, Risk & compliance, Auto reception, Smart visitor reception, Smart buyer reconnect, Smart RFQ quote, New product optimization, Low-impression product optimization, Low-visitor product optimization, Low-inquiry product optimization, IP infringement risk handling, Smart EU representative linking |
| English | English | Same as left |
| 其他可识别语种 | 同语种 | Same as left |
| 无法识别 | English | Same as left |

## Routing Principle

### 1. Always route to the minimum valid scope

优先级必须是 **feature > section > page > unclear**。只要用户点名某个 feature，就不能退化成 section 概览。只有当用户明确要看一个 section 整体时，才可以组合该 section 下多个 feature 的 reference 来回答。

| 用户表达 | 命中范围 |
| --- | --- |
| “帮我看 Auto reception” | `feature=Auto reception` |
| “看看 Smart buyer reconnect 设置” | `feature=Smart buyer reconnect` |
| “查看 Product 配置” | `section=Product` |
| “查看 Risk & compliance” | `section=Risk & compliance` |
| “查看 Smart Assistant 全部开关” | `page=Smart Assistant` |

### 2. SKILL.md handles routing; references hold feature knowledge

`SKILL.md` 只负责识别范围、决定读取哪些 reference、约束工具边界。**references 只按 feature 维度维护，不再依赖 section-level reference。**

> 这意味着：如果用户问一个 section，不能去读一个 section 概览文档，而应读取该 section 对应的多个 feature reference，并把结果组装成 section 级回答。

## Feature-Level Reference Loading Rules

### A. Single feature request

一旦命中单个 feature，只读取这个 feature 的 reference，不得顺手读取其所在 section 的其他兄弟功能文档。

| 命中 feature | 必须读取的 reference |
| --- | --- |
| Auto reception | `references/auto-reception-config.md` |
| Smart visitor reception | `references/visitor-reception-config.md` |
| Smart buyer reconnect | `references/buyer-reconnect-config.md` |
| Smart RFQ quote | `references/smart-rfq-quote-config.md` |
| New product optimization | `references/new-product-optimization-config.md` |
| Low-impression product optimization | `references/low-impression-product-optimization-config.md` |
| Low-visitor product optimization | `references/low-visitor-product-optimization-config.md` |
| Low-inquiry product optimization | `references/low-inquiry-product-optimization-config.md` |
| IP infringement risk handling | `references/ip-infringement-risk-handling-config.md` |
| Smart EU representative linking | `references/smart-eu-representative-linking-config.md` |

### B. Section request

当用户明确要看一个 section 整体时，读取该 section 下全部 feature reference，并基于这些 feature 规则组装 section 级回答。**不要再建立或读取 section-overview reference。**

| 命中 section | 应读取的 feature references |
| --- | --- |
| Message | `auto-reception-config.md` + `visitor-reception-config.md` + `buyer-reconnect-config.md` |
| RFQ | `smart-rfq-quote-config.md` |
| Product | `new-product-optimization-config.md` + `low-impression-product-optimization-config.md` + `low-visitor-product-optimization-config.md` + `low-inquiry-product-optimization-config.md` |
| Risk & compliance | `ip-infringement-risk-handling-config.md` + `smart-eu-representative-linking-config.md` |

### C. Whole-page request

当用户请求 Smart Assistant 全部概览时，先给 **四个一级 section 的高层结果**，不要第一轮就把全部 feature reference 全部读进来。只有当用户明确要求某个 section 详情或某个 feature 详情时，再按上述规则补读相应 feature reference。

## Tool Execution Rules

工具名和 MCP 名称属于研发定义的运行时标识，**不得改名、翻译、简写或替换**。它们不是 shell 命令，也不能改写成别的调用名。

| Target | Query Tools | Update Tools | Notes |
| --- | --- | --- | --- |
| Auto reception | `query_ggs_contact_setting_info` | 视子配置需要使用 `set_ggs_open_time_config` | 若用户问完整配置或运营时间，再补 `query_ggs_open_time_config` |
| Smart visitor reception | `query_ggs_agent_detail` | `update_ggs_agent_detail_list` | 只抽取该功能状态 |
| Smart buyer reconnect | `query_ggs_auto_follow_marketing_config` | `set_ggs_auto_follow_marketing_config` | 不混入 Auto reception 或 RFQ |
| Smart RFQ quote | `query_ggs_agent_detail`（agentType=marketing_ai，获取 marketing_rfq plan 开关状态）+ `query_ggs_auto_quote_setting`（获取配置详情） | 开关：`update_ggs_agent_detail_list`（修改 marketing_rfq plan 的 serviceMode）；配置项：`save_or_update_ggs_auto_quote_setting` | 开关状态来自 agent_detail 的 marketing_rfq plan；配置字段映射见 feature reference |
| Product features | `query_ggs_agent_detail` (传入 `agentType: 'product_ai'`) | `update_ggs_agent_detail_list` | **更新 payload 中 serviceMode 必须严格映射**：开启/启用 = `'captain'`；关闭/暂停/停用 = `'manual'` |
| IP infringement risk handling | `query_ggs_agent_detail`（agentType=risk_ai） | `update_ggs_agent_detail_list` | 解释价值时可补 `query_ggs_risk_detected_stat` |
| Smart EU representative linking | `query_ggs_agent_detail`（agentType=risk_ai） | `update_ggs_agent_detail_list` | 开启前先检查 `query_ggs_all_effective_eu_agent`；必要时用 `create_ggs_eu_agent` |
| Section or page overview | `query_ggs_agent_detail`（按需传不同 agentType） | 默认不做批量更新 | 先概览，后下钻 |

## Core Workflow

### Step 1. Detect language and action type

识别 `output_lang`，然后判断用户是在 **查看 / explain / compare**，还是在 **enable / disable / update / execute**。
**注意：**
- 遇到"暂停"、"停止"、"关掉"、"禁用"等词汇，一律识别为 **disable** 意图（`serviceMode: 'manual'`）。
- 遇到"开启"、"打开"、"启用"、"激活"等词汇，一律识别为 **enable** 意图（`serviceMode: 'captain'`）。
- 如果是模糊修改，例如"帮我改一下这个"，先查当前状态并最小澄清，不要猜字段。

### Step 2. Route to feature, section, or page

只要能命中具体 feature，就按 feature 执行。命中 section 时，只聚合该 section 下 feature。命中整页时，先给 section 层概览。
**多轮对话中的同级跳转：** 如果用户在上一轮查询了某个 feature（例如 Low-inquiry product optimization），本轮提到其同级简称（例如"顺便把 Low-visitor 也查一下"），必须能识别出这是指代 `Low-visitor product optimization`，并执行相应的 feature 查询。

### Step 3. Load the minimum necessary feature references

命中 feature 就只读该 feature 文档。命中 section 才组合读取该 section 下 feature 文档。命中整页概览时先不加载全部 feature 文档，除非用户继续追问具体 section 或 feature。

### Step 4. Call the smallest valid tool set

不要为了"更完整"跨域多查。Message、Product、RFQ、Risk & compliance 的工具边界必须严格分开。
**跨域多意图处理：** 当用户在同一句话中提到不同域的 feature（例如"查一下 New product optimization 和 Smart RFQ quote"），必须**分别调用各自域对应的工具**（如 `query_ggs_agent_detail` 和 `query_ggs_auto_quote_setting`），并在回复中清晰地分段呈现结果。

### Step 5. Return merchant-facing results in the same language

回答先给结论，再给当前状态、关键配置、已执行动作或待确认动作。单 feature 只答单 feature；section 只答命中的 section；整页概览只答四个一级 section。

### Step 6. Self-check after update

如果执行了 enable、disable 或 update，必须确认三点：目标 feature 是否正确、写入字段是否与该 feature 对应、回复语言是否与用户输入一致。必要时再次查询最新状态再回复。

## Guardrails

| 场景 | 必须做的事 | 禁止做的事 |
| --- | --- | --- |
| 用户只问一个 feature | 只读该 feature 的 reference | 先读 section 文档或全量文档 |
| 用户问一个 section | 读取该 section 下 feature references 并组装回答 | 依赖不存在的 section-level reference |
| 用户问整页概览 | 先给四个一级 section 的高层结果 | 第一轮就加载全部 feature reference |
| 用户从概览追问单功能 | 再读取对应 feature reference | 直接凭概览猜细项 |
| 用户要求更新 | 只调用该 feature 允许的工具 | 混用其他 section 的工具 |
| 处理研发定义的工具名 | 原样保留运行时标识 | 改名、翻译、拼缩写、替换为 shell/CLI |
| 用户要求批量修改（如"把 Product 相关的都打开"） | **强制拆分为 feature 级列表，请求用户逐一确认** | **禁止直接调用接口进行模糊批量修改** |

## Failure Recovery

| 失败场景 | 处理方式 |
| --- | --- |
| 用户目标不清楚 | 只问一个最关键缺失点 |
| 工具未注入或登录态缺失 | 直接说明当前无法执行，不要退回 shell 或猜接口 |
| 查询字段与更新字段不一致 | 按 feature reference 中字段映射修正后再更新 |
| 用户要求“全部都改”但未给规则 | 拆成 section 或 feature 级确认，不做模糊批量修改 |

## Examples

### Example A. Single feature query

**User:** `how about Auto reception`

处理方式应为：命中 `feature=Auto reception`，读取 `references/auto-reception-config.md`，调用 `query_ggs_contact_setting_info`，只返回 Auto reception 当前状态与直接配置。

### Example B. Section overview by composition

**User:** `看看 Product 下面都开了什么`

处理方式应为：命中 `section=Product`，依次读取 `new-product-optimization-config.md`、`low-impression-product-optimization-config.md`、`low-visitor-product-optimization-config.md`、`low-inquiry-product-optimization-config.md`，然后把四个功能状态组装成 Product 概览返回。

### Example C. Explicit update (config field)

**User:** `把 Smart RFQ quote 每日上限改成 30`

处理方式应为：命中 `feature=Smart RFQ quote`，读取 `references/smart-rfq-quote-config.md`，按字段映射规则调用 `save_or_update_ggs_auto_quote_setting`，完成后回报最新状态。

### Example C2. Toggle Smart RFQ quote switch

**User:** `帮我把 RFQ 自动报价打开`

处理方式应为：命中 `feature=Smart RFQ quote`，读取 `references/smart-rfq-quote-config.md`。先调用 `query_ggs_agent_detail`（agentType=marketing_ai）确认 marketing_rfq plan 当前状态；若当前为 manual（关闭），则调用 `update_ggs_agent_detail_list` 将 marketing_rfq plan 的 serviceMode 设为 captain（开启）。操作完成后再次查询确认状态并回报。

### Example D. Risk prerequisite check

**User:** `帮我开启 Smart EU representative linking`

处理方式应为：命中 `feature=Smart EU representative linking`，读取对应 reference，先检查 `query_ggs_all_effective_eu_agent`；若无有效欧代负责人，则先说明前置条件或继续创建，不得直接假定开启成功。

## Final Reminders

1. 本 Skill 的默认目标是 **让商家在对话里完成 Smart Assistant 设置查询和执行**，不是解释页面实现。
2. references 采用 **feature-level only** 结构；section 回答靠组合多个 feature reference，而不是再建 section 文档。
3. 研发定义的 tool call 名称与 MCP 名称必须原样保留，以确保执行准确性。
4. 功能专有名词保持英文；识别不出输入语言时，统一使用英文兜底。
