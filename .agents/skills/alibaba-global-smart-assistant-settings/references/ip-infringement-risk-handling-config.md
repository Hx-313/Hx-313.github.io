# IP infringement risk handling Configuration Reference

> 当且仅当用户明确提到 **IP infringement risk handling** 时，加载本文件。不要自动扩展为整个 Risk & compliance 概览。

## Purpose

本文件只描述 **IP infringement risk handling** 单功能的查询、解释与更新规则。

## Hard Scope Rule

| Item | Required Rule |
| --- | --- |
| scope_level | 必须是 `feature` |
| scope_target | 必须是 `IP infringement risk handling` |
| sibling expansion | 禁止扩展到 `Smart EU representative linking` |
| cross-section expansion | 禁止扩展到 Message、Product、RFQ |

## Preferred Tools

| Situation | Tool |
| --- | --- |
| 查询当前状态或配置 | `query_ggs_agent_detail`（agentType=risk_ai） |
| 用户明确要求看风险统计或解释开启价值 | `query_ggs_risk_detected_stat` |
| 更新开关状态 | `update_ggs_agent_detail_list` |

## Output Scope

回答只覆盖 **IP infringement risk handling** 当前状态、相关风险统计与必要说明。

## Response Framing

> 以下仅为 **IP infringement risk handling** 当前配置与风险情况，不包含 Smart EU representative linking。
