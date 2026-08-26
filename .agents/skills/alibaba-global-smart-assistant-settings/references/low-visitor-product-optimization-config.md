# Low-visitor product optimization Configuration Reference

> 当且仅当用户明确提到 **Low-visitor product optimization**（或其同义词/简称如 Low-visitor）时，加载本文件。

## Purpose

本文件只描述 **Low-visitor product optimization 单功能** 的查询、解释与更新规则。确保模型在命中该功能时能稳定调用正确的工具，并使用正确的更新 payload 结构。

## Hard Scope Rule

| Item | Required Rule |
| --- | --- |
| scope_level | 必须是 `feature` |
| scope_target | 必须是 `Low-visitor product optimization` |
| sibling expansion | 禁止扩展到其他 Product feature |
| cross-section expansion | 禁止扩展到 Message、RFQ、Risk & compliance |

以下问法都属于同一意图，必须稳定路由到 **Low-visitor product optimization**：

| English | Chinese |
| --- | --- |
| turn off Low-visitor product optimization | 把 Low-visitor product optimization 关掉吧 |
| check Low-visitor config | 顺便把 Low-visitor 也查一下 |
| is Low-visitor on | 零访客商品优化开启了吗 |

## Preferred Tools

| Situation | Tool | Notes |
| --- | --- | --- |
| 查询当前开关状态 | `query_ggs_agent_detail` | 必须传入 `agentType: "product_ai"` |
| 更新开关状态 | `update_ggs_agent_detail_list` | Payload 中 `serviceMode` 必须严格映射 |

## Field Mapping Rule

更新时，必须严格按照以下规则构建 payload。**禁止使用命令行工具执行。**

| 动作意图 | 映射的 serviceMode 值 |
| --- | --- |
| 开启 / 打开 / 启用 / 激活 | `"captain"` |
| 关闭 / 关掉 / 暂停 / 停止 / 禁用 | `"manual"` |

**更新 Payload 示例（关闭 Low-visitor product optimization）：**
```json
[
  {
    "planCode": "xxx", 
    "functionList": [
      {
        "functionCode": "yyy", 
        "serviceMode": "manual"
      }
    ]
  }
]
```
*(注：`planCode` 和 `functionCode` 需从查询接口的返回结果中获取并保持一致。)*

## Output Scope

回答只覆盖 **Low-visitor product optimization** 本身。

| Correct | Incorrect |
| --- | --- |
| 仅返回 Low-visitor product optimization 的状态（开启/关闭） | 返回同级其他功能的状态 |
| 明确回复该功能已成功关闭的状态 | 回复"已修改"但不说明当前是关闭状态 |

## Response Framing

建议先用一句边界声明锁定范围，再给配置结果。

> 以下仅为 **Low-visitor product optimization** 当前配置与结果，不包含其他 Product feature。
