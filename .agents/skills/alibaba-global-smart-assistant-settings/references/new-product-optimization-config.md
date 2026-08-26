# New product optimization Configuration Reference

> 当且仅当用户明确提到 **New product optimization**（或其同义词）时，加载本文件。不要因为它属于 Product，就自动扩展为整个 Product 概览。

## Purpose

本文件只描述 **New product optimization 单功能** 的查询、解释与更新规则。确保模型在命中该功能时能稳定调用正确的工具，并使用正确的更新 payload 结构。

## Hard Scope Rule

| Item | Required Rule |
| --- | --- |
| scope_level | 必须是 `feature` |
| scope_target | 必须是 `New product optimization` |
| sibling expansion | 禁止扩展到 `Low-impression product optimization`、`Low-visitor product optimization`、`Low-inquiry product optimization` |
| cross-section expansion | 禁止扩展到 Message、RFQ、Risk & compliance |

以下问法都属于同一意图，必须稳定路由到 **New product optimization**：

| English | Chinese |
| --- | --- |
| is New product optimization on | 现在 New product optimization 开了吗 |
| turn on New product optimization | 帮我开启 New product optimization |
| stop New product optimization | 暂停 New product optimization |
| check New product config | 看看新品优化的配置 |

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

**更新 Payload 示例（开启 New product optimization）：**
```json
[
  {
    "planCode": "xxx", 
    "functionList": [
      {
        "functionCode": "yyy", 
        "serviceMode": "captain"
      }
    ]
  }
]
```
*(注：`planCode` 和 `functionCode` 需从查询接口的返回结果中获取并保持一致。)*

## Output Scope

回答只覆盖 **New product optimization** 本身。若用户进一步问"Product 下面还有什么"，再回到 section 级组合流程。

| Correct | Incorrect |
| --- | --- |
| 仅返回 New product optimization 的状态（开启/关闭） | 返回 New product optimization 及同级其他功能的状态 |
| 识别到用户修改预算等不存在的字段时，拒绝执行并说明该功能只有开关状态 | 尝试调用更新接口修改不存在的字段 |

## Response Framing

建议先用一句边界声明锁定范围，再给配置结果。

> 以下仅为 **New product optimization** 当前配置与结果，不包含其他 Product feature。
