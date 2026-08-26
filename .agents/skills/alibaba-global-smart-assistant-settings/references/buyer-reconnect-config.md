# Smart Buyer Reconnect Configuration Reference

> 当且仅当用户明确提到 **Smart buyer reconnect / buyer reconnect / 主动跟进** 时，加载本文件。

## Purpose

本文件用于处理 **Smart buyer reconnect** 单功能查询或修改，确保模型不会把它误并入 Auto reception、Visitor reception 或整个 Message 概览。

## Scope Rule

| Item | Required Rule |
| --- | --- |
| scope_level | 必须是 `feature` |
| scope_target | 必须是 `Smart buyer reconnect` |
| sibling expansion | 禁止扩展到 Auto reception 或 Smart visitor reception |

## Typical Queries

| English | Chinese |
| --- | --- |
| show buyer reconnect settings | 看看主动跟进配置 |
| how about buyer reconnect | 主动跟进现在怎么样 |
| check smart buyer reconnect | 查看智能主动跟进设置 |

## Query Rule

| Situation | Tool |
| --- | --- |
| 查看主动跟进当前状态或配置 | `query_ggs_auto_follow_marketing_config` |
| 修改主动跟进配置 | `set_ggs_auto_follow_marketing_config` |

## Output Rule

| Correct | Incorrect |
| --- | --- |
| 只回答 buyer reconnect 本身 | 顺带返回 Auto reception |
| 只在用户追加要求时扩展 | 默认列出 Message 下三个功能 |

## Runtime Reminder

GGS 工具是运行时能力，不是 shell 命令。禁止用 bash 直接执行工具名。
