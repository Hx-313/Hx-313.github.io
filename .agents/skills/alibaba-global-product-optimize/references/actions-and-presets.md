# 批量优化 · actions 与 strategy 参考

本文件供 Agent 在构造批量优化工具（`create_ggs_batch_optimize_main_task`）的 `actions`、`userPrompt` 时查阅。

**⚠️ 重要规则：调用批量优化 MCP 工具时，必须严格遵守本文件定义的 `field` 枚举值，严禁使用 DTO 字段名（如 `keywords`、`title`、`images`）代替。**

## 与后端批量优化入口的对应关系

服务端商品治理批量优化会委托到  
`com.alibaba.ggs.product.center.biz.productgrowth.service.product.governance.strategy.AiSuggestOptimizeStrategy#optimizeBatch(java.util.List<com.alibaba.ggs.nurture.product.dto.agent.ProductSandboxRecordDTO>, java.lang.String, java.lang.String, java.lang.String, java.lang.String)`  
等方法链：其中 **`List<ProductSandboxRecordDTO>`** 对应 MCP 的 **`productInfo`**；若干 **String** 入参对应场景、用户指令、扩展路由等（由网关 / 服务组装）。**Agent 侧只需按 MCP schema 传参**；下表中的 **`field` 枚举**须与上述策略类中识别的「优化域」一致，以便路由到正确的优化子链路。

| MCP 顶层参数 | 典型后端语义（便于理解，非调用名） |
|--------------|-----------------------------------|
| `productInfo` | `List<ProductSandboxRecordDTO>` |
| `presetActionGroup` | 预设场景 / 治理场景（与下方 preset 枚举对齐） |
| `userPrompt` | 用户自然语言指令；**仅当存在 `USER_PROMPT` 的 action 时必填** |
| `actions` | 本次要执行的字段级动作列表（每项 `field` + `strategy` + `value`） |
| `webhookUrl` | 异步回调（可选） |

---

## strategy 枚举

每个 action 的 **`strategy`** 只能是以下之一（与 `field-optimization-guide.md`、MCP 工具说明一致）：

| strategy | 使用场景 |
|----------|----------|
| `AI_SUGGEST` | 未给出具体改法时，由系统/模型自动推荐（默认） |
| `USER_PROMPT` | 用户在 `userPrompt` 中给出了明确改法（如「标题加品牌」「价格降 10%」） |

**规则摘要**：

- 任一条 action 为 `USER_PROMPT` 时，**必须**同时传非空 **`userPrompt`（纯文本）**。
- 全部为 `AI_SUGGEST` 时，`userPrompt` 可省略或传空（勿把指令塞进 JSON 对象）。

---

## 单条 action 结构

```json
{ "field": "<下表 field 枚举>", "strategy": "AI_SUGGEST | USER_PROMPT", "value": "" }
```

- **`value`**：当前批量链路一般为占位 `""`；具体语义以网关注册的 tool schema 为准。
- **多字段**：在 `actions` 数组中**多条**并列，每条一个 `field`。

---

## field 枚举（与 `ProductSnapshotDTO` 域对应）

下列 **`field` 字符串**为批量优化唯一合法取值（与治理策略中的优化域一一对应）；**禁止**使用列名如 `title`、`leadTime` 等代替。

| field | 含义 | 主要写回的 `ProductSnapshotDTO` / CSV 域 |
|-------|------|----------------------------------------|
| `TITLE` | 标题 | `title` |
| `PRICE` | 价格 | `price` |
| `LEAD_TIME` | 交期 | `leadTime` |
| `MOQ` | 最小起订量 | `moq` |
| `WEIGHT` | 单位重量 | `unitWeight` |
| `DIMENSION` | 单位尺寸 | `unitSize` |
| `LOGISTICS_TEMPLATE` | 运费模板 | `shippingTemplate` |
| `CATEGORY` | 类目 | `category` |
| `DESCRIPTION` | 商品详描（HTML） | `description` |
| `CPV` | 属性（CPV） | `properties` |
| `IMAGE` | ~~主图/附图列表~~ | ~~`images`~~ | **⚠️ 已废弃：不再作为 `actions` 数组的合法值传入批量优化工具。** 图片优化改为通过 Sub Agent 唤起 `alibaba-global-ai-image-studio` Skill 处理。详见 `SKILL.md` 第 19 条规则 |
| `INVENTORY` | 发货地与库存 | `inventory` |
| `KEYWORD` | 关键词 | `keywords` |
| `TRANSLATE` | 翻译类优化（跨字段，作用于标题、详描等文本） | `title` / `description` 等（由后端按指令落域） |
| `PRICE_EXCHANGE` | 价格币种/汇率换算（跨字段，作用于价格结构） | `price`（`currency` / 数值等由后端换算） |

> **跨字段动作**：`TRANSLATE`、`PRICE_EXCHANGE` 仍须在 `actions` 中显式声明；自然语言细节写在 **`userPrompt`**（如目标语言、目标币种）。

---

## preset_action_group（可选）

与圈品侧 **`preset_scenario`** 同一套口径，对应 `optimizeBatch` 侧「预设治理场景」的 **String** 之一；可与 `actions` 组合使用（**即使传了 preset，仍建议传非空 `actions`**，除非产品文档明确允许仅 preset）。

| 取值 | 含义 |
|------|------|
| `UPGRADE_TO_TRADE` | 转交易品 |
| `BOOST_PRICE_POWER` | 提升价格力 |
| `BOOST_SERVICE_POWER` | 提升服务力 |
| `BOOST_TREND_POWER` | 提升趋势力 |
| `BOOST_QUALITY_SCORE` | 提升质量分 |
| `OPTIMIZE_ZERO_EXPOSURE` | 优化无曝光品 |
| `OPTIMIZE_IPV_ZERO_CONVERSION` | 优化有 IPV 但 0 转化商品 |

未列出的取值以**线上圈品/治理配置**为准；Agent 若收到业务方固定枚举，原样传入 `presetActionGroup` 即可。

---

## 调用示例（片段）

**仅 AI 建议、多字段：**

```json
"actions": [
  { "field": "TITLE", "strategy": "AI_SUGGEST", "value": "" },
  { "field": "PRICE", "strategy": "AI_SUGGEST", "value": "" },
  { "field": "LOGISTICS_TEMPLATE", "strategy": "AI_SUGGEST", "value": "" }
]
```

**用户指令驱动：**

```json
"userPrompt": "标题加上品牌名 Acme，详描第一段改成强调 CE 认证",
"actions": [
  { "field": "TITLE", "strategy": "USER_PROMPT", "value": "" },
  { "field": "DESCRIPTION", "strategy": "USER_PROMPT", "value": "" }
]
```

> **⚠️ `field` 必须使用上表枚举值，严禁使用 DTO 字段名（如 `keywords`、`title`、`images`）代替。**
