---
name: alibaba-product-recruitment
version: 1.0.0
description: |-
  阿里国际站所有定招相关意图的唯一 Skill。用户只要涉及定招主题，无论是查主题、发品还是其他定招操作，均由本 Skill 接收后在内部做细分路由。

  当前已覆盖能力：
    ① 查定招主题：推荐（无关键词）/ 搜索（关键词或 topicId 精查）/ 筛选（tab、类目、国家、主题标签、上新、市场热卖等）。 
    ② 定招发品：通过 listing_product_by_topic 对已查询主题执行发草稿，从草稿箱直接发布。

  触发关键词：平台征品、定向征品、招品、主题、征品活动；市场热卖、全网热卖、站内热卖、站内稀缺；交易品定招、商机品定招等。

  触发场景： 
    - 用户表达查定招主题意图（如"有什么定向征品主题适合我？""搜主题ID：14900087的主题""查询名称为「xx」的定招主题""找xx类目的定招主题"） 
    - 用户表达定招发品意图（如"帮我发定招品""帮我发主题xx的品""查询xx主题""发草稿"）

  不触发： 
    - "topicId=X 下有哪些商品" → 走商品查询能力
    - 店铺装修 / 佣金 / 订单 / 物流等与定招无关的话题 
    - 和定招要求无关的发品 → 走国际站智能发品能力


workflow: |-
  1. 意图识别 → 场景路由（推荐 / 搜索 / 筛选 / 翻页 / 发品）
  2. 涉及类目 → 调用 query_user_valid_category 做类目鉴权
  3. 反问触发器自检
  4. 构造 16 字段参数 → 调用 farseer_topic_search
  5. 渲染查询表格（固定 7 列） → 根据原始意图决定引导方式（有发品意图：askUser 弹窗；无发品意图：文字引导）
  6. 【发品流程 — 默认草稿链路】用户选择/指定 topicId/序号 → 调用 listing_product_draft_by_topic 发草稿 → 渲染草稿结果表格 → 调用 publish_product_draft_online 正式发布 → 渲染发布结果表格（批量时每批最多 5 个并行调用，每批完成后必须立即独立渲染结果表格，禁止攒到最后统一渲染）
enabled: true
---

# 定招主题查询与发品(Collect Topic Search & Listing)

> 定招(Collect Topic)是 Alibaba.com 平台向商家征集爆品的机制。商家发布符合主题要求的商品即成为"定招品"，获得更多流量曝光。又称"行业定向征品"。English: High-demand products (HDP)。

---

## 1. 意图识别与链路路由

收到用户问题后，**先判意图再调工具**。

| 意图 | 判定条件 | 执行链路 |
|---|---|---|
| **查询**（推荐/搜索/筛选/翻页） | 无发品动词；含关键词/类目/tab/翻页语境 | → [`references/topic-query.md`](references/topic-query.md) |
| **发品** | 含"发品/发布/上架/listing"+ topicId 或指代查询结果 | → [`references/topic-listing.md`](references/topic-listing.md) |
| **能力边界外** | 触发了定招意图但非查询/发品（如"删除定招品""优化标题"） | → 友好拒绝（§3） |

**优先级**：已发品 > 发品意图 > 热卖筛选 > 类目筛选 > 主题名称搜索 > 模糊型 > 搜索 > 翻页 > 筛选 > 推荐。

---

## 2. 工具速查

| 工具名 | 用途 | 何时调用 |
|---|---|---|
| `farseer_topic_search` | 定招主题查询（推荐/搜索/筛选） | 查询链路 |
| `query_user_valid_category` | 查询商家权限类目 | 涉及类目时，发品前无需 |
| `listing_product_draft_by_topic` | 根据定招主题发布草稿品（存入草稿箱） | 发品链路第一步 |
| `publish_product_draft_online` | 将草稿箱中的品正式发布 | 发草稿完成后自动调用 |

**language 格式**：`query_user_valid_category` 传 `"zh"`/`"en"`，`farseer_topic_search` 传 `"zh_CN"`/`"en_US"`，不可混用。

---

## 3. 能力边界识别

本 Skill 当前仅支持**定招主题查询**和**定招发品**。超出范围的定招操作**立即友好拒绝**，不调用任何工具：

> 「当前定招 Skill 仅支持**主题查询**和**发品**操作。你提到的「{用户请求}」能力正在开发中，敬请期待后续版本。如需查询定招主题或发品，可以告诉我关键词或类目。」

详见 [`references/error-cases.md`](references/error-cases.md) E-17。

---

## 4. 跨链路硬性规则

| 规则 | 说明 |
|---|---|
| **工具名称审计（最高优先级）** | 调用工具时，**必须且只能**使用工具注册的原始名称。**严禁**根据 Server 名或插件名推测命名空间前缀（例如：禁止拼接成 `farseer.xxx`）。如果对名称有任何疑虑，**必须**先执行 `search` 核实，禁止臆造。 |
| **语言跟随用户** | 中文问中文答，英文问英文答 |
| **禁止编造** | 字段必须来自工具返回，走 [`references/error-cases.md`](references/error-cases.md) 兜底 |
| **反问优于猜测** | 边界场景宁可多反问，不静默猜测 |
| **默认交易品** | `businessType=HOT_PRODUCT`，仅用户明确提及商机品或连续 3 次指定时切换 |
| **搜索完即停止** | 每种场景搜索结束后立即停止，禁止缩短关键词重搜/退化类目/切业务线；模糊型类目匹配+主题搜索两步均空时，立即报空停止，禁止自由发挥额外查询 |
| **禁止显示总数** | 任何场景下都不在用户可见页面展示"共查到 XX 个主题"等总数信息，仅渲染最多 10 条数据 |
| **搜索关键词小写化** | 构造 `title` 字段时，英文字母**必须**强制转换为小写，严禁直接透传原始大写。 |
| **标题截断展示** | 发品结果表格（草稿/发布）中的商品标题若超过 **60** 字符，必须截取前 60 位并追加 `...`（详见 [`topic-listing.md`](references/topic-listing.md)） |
| **主推国家映射渲染** | 查询结果表格中的国家代码必须根据 `references/topic-query.md` §6.2 映射为国家名称，且语言需跟随用户（中文环境显示中文名，英文环境显示英文名）。 |

---

## 5. 会话状态管理

- **先查后发**：发品必须在本会话执行过查询后才可执行（无查询 + 有 topicId → 先查验再发品）
- **翻页上下文**：会话内维护 `currentPage` 状态，翻页保留全部条件仅 +1，修改条件则重置为 1
- **类目缓存**：`query_user_valid_category` 结果同一会话内可复用
- **草稿上下文**：发草稿成功后，草稿返回的 `categoryId` 和 `draftProductId` 在会话内保持，供后续 `publish_product_draft_online` 使用

---

## 6. 错误处理总则

运行时异常处理：→ [`references/error-cases.md`](references/error-cases.md)

- 网络错误自动重试一次，仍失败则报告用户并终止
- 业务错误（`success=false` / 无权限）不静默重试，先告知根因
- 异常即终止，询问用户处理意见

---

## 7. 渐进式加载规则

**按需读取 references，不要一次性预读所有文件**：

- 查询链路 → 读取 `references/topic-query.md`
- 发品链路 → 读取 `references/topic-listing.md`
- 工具返回异常 → 读取 `references/error-cases.md`
