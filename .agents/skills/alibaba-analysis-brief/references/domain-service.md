# 沟通服务领域字段参考

本文档包含沟通服务、子账号和生意助手相关模块的字段说明，以及 IM 工具参数。追问沟通/服务/子账号/生意助手时查阅。

---

## STORE_ACCOUNT_DATA_OVERVIEW - 店铺分账号数据总览

返回类型：列表（每个子账号一条）

| 字段 | 含义 |
|------|------|
| firstName | 名 |
| lastName | 姓 |
| loginId | 登录ID |
| statsDate | 统计日期 |
| newBuyerNum | 新商机沟通买家数 |
| buyerAb3Rate | 商机转化率 |
| fiveMinReplyRate | 极速回复率 |
| replyTime | 平均回复时长（单位：小时） |
| evaluationScore | 服务力评价分 |
| buyerRnrRate | 买家已读未回率 |

---

## BUSINESS_ASSISTANT_USAGE_DATA - 生意助手使用概览

返回类型：对象

| 字段 | 含义 |
|------|------|
| dateRange | 统计日期范围 |
| usageConsumption | 使用消耗情况列表 |
| usageConsumption[].benefitCategory | 权益分类（如"i豆数"） |
| usageConsumption[].benefitType | 权益类型（如"套餐内充值"） |
| usageConsumption[].usedPoints | 已使用数量 |
| usageConsumption[].remainingPoints | 剩余数量 |
| functionUsageList | 功能使用情况列表 |
| functionUsageList[].abilityCode | AI能力名称（如"访客接待"、"自动接待"、"主动跟进"等） |
| functionUsageList[].usageCount | 调用次数 |
| functionUsageList[].adoptionRate | 采纳率（百分比，无数据时为"--"） |
| functionUsageList[].useRatio | 使用率（小数） |

---

## IM 工具详细参数

### query_contact — 联系人列表

- `type`: `0`=好友
- `startVersion`: 传 `0` 获取全量

### query_recent_conversation — 查询会话列表

- `request`: 必填嵌套对象，包含以下字段：
  - `limitTimeStamp`: 查询游标，传极大值获取最新会话
  - `count`: 单次查询数量
  - `domain`: 默认 `icbu`，支持 `accio`

### query_conversation_msg — 查询会话消息

**依赖 query_recent_conversation 返回的 `conversationId`。**

- `conversationId`: 从会话列表返回中获取
- `forward`: `false`=向过去查询，`true`=向未来查询
- `count`: 查询消息条数
- `domain`: 默认 `icbu`

### get_im_card_info — 查询沟通卡片信息

- `language`: 用户语言（如 `zh`、`en`）
- `baseRequest.cardTypeValue`: 卡片类型值
- `baseRequest.toLoginId`: 接收者的 loginId
- `baseRequest.paramsMap`: 卡片解析必要参数
- `baseRequest.useAgentDescription`: 建议设为 `true`，返回 AI 可理解描述
