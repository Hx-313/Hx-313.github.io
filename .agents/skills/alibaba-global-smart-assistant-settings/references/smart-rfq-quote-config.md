# Smart RFQ quote Configuration Reference

> 当且仅当用户明确提到 **Smart RFQ quote** 或 RFQ 自动报价设置时，加载本文件。不要因为它属于 RFQ，就扩展为其他 section 的配置说明。

## Purpose

本文件只描述 **Smart RFQ quote 单功能** 的查询、解释与更新规则，确保模型在命中该功能时能稳定使用 RFQ 专属工具与字段映射。

## Hard Scope Rule

| Item | Required Rule |
| --- | --- |
| scope_level | 必须是 `feature` |
| scope_target | 必须是 `Smart RFQ quote` |
| sibling expansion | 不适用；RFQ 当前只覆盖该 feature |
| cross-section expansion | 禁止扩展到 Message、Product、Risk & compliance |

以下问法都应稳定路由到 **Smart RFQ quote**：

| English | Chinese |
| --- | --- |
| show Smart RFQ quote settings | 查看 Smart RFQ quote 配置 |
| check RFQ auto quote config | 看看 RFQ 自动报价怎么配的 |
| turn on Smart RFQ quote | 把 Smart RFQ quote 打开 |
| update RFQ daily quote limit | 修改 RFQ 每日报价上限 |

## Preferred Tools

### 开关状态（功能是否开启）

Smart RFQ quote 的开关状态来源于 `query_ggs_agent_detail` 返回的 **marketing_rfq plan 的 serviceMode**，而非 `query_ggs_auto_quote_setting`。

- `serviceMode = 'captain'` → 开启
- `serviceMode = 'manual'` → 关闭

| Situation | Tool | 说明 |
| --- | --- | --- |
| 查询开关状态 | `query_ggs_agent_detail`（agentType=marketing_ai） | 从返回结果中找到 planCode=marketing_rfq 的 plan，读取其 serviceMode |
| 开启 / 关闭功能 | `update_ggs_agent_detail_list` | 修改 marketing_rfq plan 的 serviceMode 为 captain 或 manual |

### 配置详情（报价上限、匹配模式等）

| Situation | Tool |
| --- | --- |
| 查询配置详情 | `query_ggs_auto_quote_setting` |
| 更新配置字段 | `save_or_update_ggs_auto_quote_setting` |

### 完整查询流程

当用户询问 Smart RFQ quote 当前状态时，**必须同时获取开关和配置**：
1. 调用 `query_ggs_agent_detail`（agentType=marketing_ai）→ 获取 marketing_rfq plan 的 serviceMode（开关）
2. 调用 `query_ggs_auto_quote_setting` → 获取报价上限、匹配模式等配置详情
3. 组合两个结果向用户展示完整状态

## Field Mapping Rule

查询返回字段与更新字段不一致，**更新时必须显式映射**，不要把查询返回直接原样回填。

| Query Field | Update Field |
| --- | --- |
| `dailyQuoteLimit` | `quoteLimit` |
| `matchMode` | `matchType` |
| `allowedBuyerCountries` | `countryRuleList` |
| `allowedRfqTypes` | `rfqLevelList` |

## Output Scope

回答只覆盖 **Smart RFQ quote** 本身，不得顺手补全 Auto reception、Smart buyer reconnect、Product 或 Risk & compliance。

| Correct | Incorrect |
| --- | --- |
| 只说明 RFQ 自动报价当前状态、主要字段和更新结果 | 把 Message 下其他沟通功能一起返回 |
| 说明字段映射后已成功更新 | 直接声称“已更新”却不说明现在的配置 |

## Response Framing

建议先锁定范围，再给配置结果。

> 以下仅为 **Smart RFQ quote** 当前配置，不包含 Message、Product 或 Risk & compliance 的其他设置。
