# Smart EU representative linking Configuration Reference

> 当且仅当用户明确提到 **Smart EU representative linking** 时，加载本文件。不要自动扩展为整个 Risk & compliance 概览。

## Purpose

本文件只描述 **Smart EU representative linking** 单功能的查询、解释、前置检查与更新规则。

## Hard Scope Rule

| Item | Required Rule |
| --- | --- |
| scope_level | 必须是 `feature` |
| scope_target | 必须是 `Smart EU representative linking` |
| sibling expansion | 禁止扩展到 `IP infringement risk handling` |
| cross-section expansion | 禁止扩展到 Message、Product、RFQ |

## Preferred Tools

| Situation | Tool |
| --- | --- |
| 查询当前状态 | `query_ggs_agent_detail`（agentType=risk_ai） |
| 查询欧代缺失风险 | `get_ggs_risk_digital_gpsr_risk` |
| 查询当前有效欧代负责人 | `query_ggs_all_effective_eu_agent` |
| 创建欧代负责人 | `create_ggs_eu_agent` |
| 更新开关状态 | `update_ggs_agent_detail_list` |

## Mandatory Prerequisite

在开启 **Smart EU representative linking** 之前，必须先调用 `query_ggs_all_effective_eu_agent` 检查是否存在有效欧代负责人。若不存在，则先说明前置条件或继续创建；不要直接宣称功能已成功开启。

## Required Creation Fields

| Field | Meaning |
| --- | --- |
| companyName | 公司名称 |
| contactName | 联系人姓名 |
| email | 邮箱地址 |
| euAddress | 欧盟境内地址 |

## Output Scope

回答只覆盖 **Smart EU representative linking** 本身，以及与欧代负责人和欧代风险直接相关的信息。

## Response Framing

> 以下仅为 **Smart EU representative linking** 当前配置、欧代负责人状态与前置条件，不包含其他 Risk & compliance feature。
