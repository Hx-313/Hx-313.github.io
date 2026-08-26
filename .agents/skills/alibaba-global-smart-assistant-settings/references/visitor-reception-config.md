# Smart Visitor Reception Configuration Reference

> 当且仅当用户明确提到 **Smart visitor reception / visitor reception / 访客接待** 时，加载本文件。

## Purpose

本文件用于处理 **Smart visitor reception** 单功能查询或修改，确保模型不会把它误并入 Auto reception 或整个 Message 概览。

## Scope Rule

| Item | Required Rule |
| --- | --- |
| scope_level | 必须是 `feature` |
| scope_target | 必须是 `Smart visitor reception` |
| sibling expansion | 禁止扩展到 Auto reception 或 Smart buyer reconnect |

## Typical Queries

| English | Chinese |
| --- | --- |
| show visitor reception settings | 看看访客接待配置 |
| how about visitor reception | 访客接待现在怎么样 |
| check smart visitor reception | 查看智能访客接待设置 |

## Query Rule

| Situation | Tool |
| --- | --- |
| 查看访客接待当前状态或配置 | `query_ggs_agent_detail`，但输出必须只提取 visitor reception 部分 |
| 修改访客接待开关或配置 | `update_ggs_agent_detail_list` |

## Output Rule

| Correct | Incorrect |
| --- | --- |
| 只回答 visitor reception 本身 | 顺带返回 Auto reception |
| 只在用户追加要求时扩展 | 默认列出 Message 下三个功能 |

## Runtime Reminder

GGS 工具是运行时能力，不是 shell 命令。禁止用 bash 直接执行工具名。
