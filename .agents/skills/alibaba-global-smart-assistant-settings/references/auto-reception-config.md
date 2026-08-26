# Auto reception Configuration Reference

> 当且仅当用户明确提到 **Auto reception / 自动接待** 时，加载本文件。不要因为 Auto reception 属于 Message，就改去加载 Message 概览。

## Purpose

本文件只描述 **Auto reception 单功能** 的查询与修改规则。它的作用不是补全整个 Message 分组，而是保证模型在命中 Auto reception 时，能够稳定地沿着单功能路径执行。

## Hard Scope Rule

| Item | Required Rule |
| --- | --- |
| scope_level | 必须是 `feature` |
| scope_target | 必须是 `Auto reception` |
| sibling expansion | 禁止扩展到 `Smart visitor reception` 或 `Smart buyer reconnect` |
| cross-section expansion | 禁止扩展到 `RFQ`、`Product`、`Risk & compliance` |

以下问法都属于同一意图，必须稳定路由到 **Auto reception**：

| English | Chinese |
| --- | --- |
| how about auto reception | 我现在的自动接待配置是啥样子 |
| show my auto reception settings | 查看自动接待配置 |
| check current auto reception config | 看看自动接待怎么配的 |
| is auto reception on | 自动接待现在开着吗 |

## What Can Be Returned

| Sub-Config | Typical Content | Preferred Tool |
| --- | --- | --- |
| 开关与接待基础规则 | 当前是否启用、主要工作方式 | `query_ggs_contact_setting_info` |
| 自动回复条件 | 买家类型、报价、样品请求、目录请求、目录来源 | `query_ggs_contact_setting_info` |
| FAQ / 买家常见问题 | 自定义回答 | `query_ggs_contact_setting_info` |
| 转人工场景 | 高意向买家、大单门槛、通知方式、留言 | `query_ggs_contact_setting_info` |
| 子账号管理 | 主子账号启停与同步 | `query_ggs_contact_setting_info` |
| 运营时间 | 生效时间段 | `query_ggs_open_time_config` |

## Tool Rule

默认情况下，只调用最小必要工具。不要为了“更完整”主动增加查询。

| Situation | Allowed Tool |
| --- | --- |
| 普通查看自动接待配置 | `query_ggs_contact_setting_info` |
| 用户明确说“完整配置” | `query_ggs_contact_setting_info` + `query_ggs_open_time_config` |
| 用户明确提到“运营时间” | `query_ggs_open_time_config` |

## Forbidden Tool Usage

| Forbidden Action | Reason |
| --- | --- |
| 对 Auto reception 请求调用 `query_ggs_agent_detail` 作为首选 | 容易退化成 Message 概览 |
| 调用 `query_ggs_auto_follow_marketing_config` | 这是 Smart buyer reconnect 的工具 |
| 调用任何 RFQ 相关工具 | 跨分组超范围 |
| 在 shell/bash 中执行工具名 | 运行时工具不是 CLI 命令 |

## Output Rule

回答必须只覆盖 Auto reception 本身，不得出现“顺手补全”行为。

| Correct | Incorrect |
| --- | --- |
| 仅返回 Auto reception 状态与子配置 | 返回 Auto reception、Visitor reception、Buyer reconnect 三项并列状态 |
| 仅在用户要求完整配置时补充运营时间 | 未被要求却主动带出其他功能详情 |

## Response Framing

建议先用一句边界声明锁定范围，再进入配置细节。

> 以下仅为 **Auto reception** 当前配置，不包含 Smart visitor reception、Smart buyer reconnect 或 RFQ 相关设置。
