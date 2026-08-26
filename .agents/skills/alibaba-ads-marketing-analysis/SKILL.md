---
name: 国际站广告分析
version: "2.0.0"
description: |
  国际站广告全产品管理能力（基于 HATEOAS 统一接口重构）。
  基于 HATEOAS 统一接口，仅需 2 个工具（query + mutate）即可完成全部操作，替代原 17+ 散落工具。
  通过 E-R 导航模型（company → campaign → products/keywords/tags/report/diagnose）自动发现能力。
  覆盖：账户/计划/商品/关键词/定向标签查询，效果报告，智能诊断，全站推+标准推写操作，商品/标签/关键词推荐，反馈提交。
enabled: true

triggers:
  - 广告分析
  - 广告诊断
  - 广告报告
  - 广告计划
  - 广告花费
  - 加品删品
  - 暂停广告
  - 恢复广告
  - 改价改预算
  - 定向标签
  - 全站推
  - 省心版
  - 直通车
  - 标准推
  - P4P
  - CPC推广

examples:
  - 帮我分析下国际站广告本周的投放情况
  - 这个全站推广计划效果不好，帮我诊断一下
  - 把这个广告计划暂停
  - 给这个计划加 3 个商品
  - 最近 30 天直通车商机主要来源于哪些商品？

excludes:
  - skill: alibaba-brand-ads-keyword-recommendation
    when: 用户要品牌广告关键词推荐、推词、问鼎/顶展关键词或关键词预定
  - skill: alibaba-icbu-brand-data-report
    when: 用户要品牌数据报告、品牌投放效果、同行对比、商品效果、关键词效果、达标率或履约 CPC 数据播报
  - skill: alibaba-analysis-brief
    when: 用户要整体店铺经营分析、流量转化、询盘或成交诊断，而不是广告产品内分析
---

# 国际站广告分析 Skill

本 Skill 通过 **2 个工具** + **E-R 导航** 管理国际站直通车广告。

## 1. 两个工具

| 工具 | 用途 |
|:---|:---|
| `icbu_ads_hateoas_query` | 查数据、查可用操作、查导航链接 |
| `icbu_ads_hateoas_mutate` | 执行写操作 |

### query 请求

```json
{
  "entityType": "campaign",           // 实体类型
  "filters": {"id": "375128343"},     // 过滤条件（从 link.invoke.filters 获取）
  "include": "all",                   // data / operations / links / all / 逗号组合
  "page": {"index": 1, "size": 20}   // 分页（默认 1/20）
}
```

### mutate 请求

```json
{
  "entityType": "campaign",           // 从 operation.invoke.entityType 取
  "action": "pause",                  // 从 operation.invoke.action 取
  "targets": {"id": 375128343},       // 从 operation.invoke.targets 取
  "params": {}                        // 按 operation.params 元数据构造
}
```

**targets 结构**：

| 场景 | targets | 示例 |
|:---|:---|:---|
| 操作计划 | `{id: 计划ID}` | 暂停计划 → `{id:375128343}` |
| 操作子实体 | `{parentId: 计划ID}` | 加品 → `{parentId:375128343}` |

## 2. 核心流程

```
用户意图 → query(include=all) → 读 data / 读 operations / 读 links
                                    ↓              ↓              ↓
                              展示数据给用户   写操作入口       导航入口
                                               ↓              ↓
                                 确认 available=true    follow link.invoke
                                 + 按 params 构造       发起下一层 query
                                               ↓
                                    风险分级确认 → mutate → query 回读验证
```

1. **查**：query(include=data) 获取实体数据
2. **看能做什么**：query(include=operations) 获取可用操作 + query(include=links) 获取导航
3. **写**：从 operation.invoke 取 entityType/action/targets → mutate → query 回读
4. **导航**：从 link.invoke 取 entityType/filters → 发起新 query

## 3. 导航方式

1. **从根开始**：query `company`(include=all) → 拿到 links（wholeSiteCampaigns / searchCampaigns / report / diagnose）
2. **follow link**：把 link.invoke 的 `entityType` + `filters` 直接作为下一次 query 的入参
3. **逐层深入**：计划列表 → 选择某计划 query(filters:{id:X}, include=all) → 其 links 带了 campaignId → 查商品/关键词/标签/报告/诊断

**所有导航参数从 link.invoke 获取，不要自己拼。**

## 4. 能做什么

### 账户层（entityType: company）
- 看账户信息、列出全站推/直通车计划
- 账户报告、账户诊断

### 计划层（entityType: campaign）
- 暂停、恢复、删除计划
- 改出价/预算/溢价（setPricing）
- 投放地域（setRegion）、投放时段（setTiming）、多语言站点（setMultiLingual）
- 推广渠道（setChannel，仅标准推）、匹配方式（setMatchType，仅标准推 type=1）
- 生成操作建议页（buildAdvicePage）
- 计划报告、计划诊断
- 提交反馈

### 子实体

从计划 query(include=links) 获取子实体导航。**哪些子实体可用、有哪些操作，全部从 link.available 和子实体 query(include=operations) 的 available 判断**，不要自行猜测。

- **商品**（campaign_product）：查看、加品、删品、暂停/恢复、推荐商品
- **关键词**（campaign_keyword）：查看、添加、删除、改出价、暂停/恢复、推荐关键词
- **定向标签**（campaign_targeting_tag）：查看、添加、删除、推荐标签
- **搜索词**（campaign_search_keyword）：查看、批量添加、批量删除
- **屏蔽商品**（campaign_forbidden_product）：查看、添加、删除
- **降权词**（campaign_forbidden_keyword）：查看已设置的屏蔽搜索词
- **自动选品**（campaign_auto_select_product）：查看、设置开关

### 报告（entityType: report）

**datasource 禁止猜测**——从 report link 的 invoke.filters.datasource 占位符中获取可选值，或从下表查：

| 维度 | 全站推 | 标准推 |
|:-----|:------|:------|
| 账户 | `company_whole_site` | `company_search` |
| 计划 | `campaign_whole_site` | `campaign_search` |
| 商品 | `product_whole_site` | `product_search` |
| 关键词 | — | `keyword_search` |
| 地域 | `region_whole_site` | `region_search` |
| 标签 | `target_tag_whole_site` | `target_tag_search` |
| 分时段 | `hour_whole_site` | `hour_search` |
| 搜索词 | `searchword_whole_site` | `searchword_search` |

**判断用哪列**：计划 type=47 用全站推列，type=1/2/8/23 用标准推列。无对应值的组合表示不支持。

filters 必填：`datasource` + `beginDateTime` + `endDateTime`（格式 `yyyy-MM-dd HH:mm:ss`）；计划级及以下加 `campaignId`

### 诊断（entityType: diagnosis）

从 diagnose link 的 invoke 获取入参模板。filters：
- `endDate`（yyyy-MM-dd）：分析截止日，不传默认今天，系统取前 7 天窗口
- `campaignId`：传则做计划诊断，不传做账户诊断
- `question`：用户具体问题（计划诊断时可传）

## 5. 规则

### 通用规则
- **禁止编造 ID**：所有 ID 必须从 query 返回或用户输入中获取
- **禁止猜测 action**：mutate 的 action 必须从 query(include=operations) 返回的 operations[].invoke.action 获取
- **禁止猜测 datasource**：report 的 datasource 从 link.invoke.filters 取或查上方表格
- **ID 接力**：锁定某计划后追问效果/商品时，必须在 filters 中带上 campaignId
- **时间格式**：report 用 `yyyy-MM-dd HH:mm:ss`；diagnose 用 `yyyy-MM-dd`
- **金额展示加 ¥ 前缀**
- **available 是唯一判据**：操作/链接是否可用，以 query 返回的 available 字段为准，不要根据计划类型自行判断

### 写操作规范

☢️ **写操作两步强制流程（NEVER 跳过任何一步）**：

**Step 1 — 查详情确认可操作**：对目标计划 query(filters:{id:X}, include=all) 拿到 data + operations。MUST 确认 operations 中目标 action 的 available=true。**禁止从列表结果直接拼 mutate——列表不含 operations 元数据。**

**Step 2 — 展示确认摘要等用户回复**：向用户展示操作摘要（见下方风险分级），STOP 并等待用户明确回复"确认"。**用户未确认前 NEVER 调 mutate。**

| 风险 | 操作 | 确认要求 |
|:-----|:-----|:---------|
| **critical** | 删除计划 | 复述计划名+ID+商品数+"不可回滚"，要求用户精确复述完整 campaignId 后执行 |
| **high** | 改出价/改预算、恢复计划 | 复述现值→新值+变化幅度+"立即生效，影响实时花费"，等用户回复"确认" |
| **medium** | 暂停、加品/删品、加/删标签、加/删关键词、恢复商品/关键词 | 复述目标+操作+数量+列表，等用户"确认" |

**写后回读**：mutate 成功后 query(include=data) 回读验证。success=true 但回读不一致时告知用户建议后台核验

**失败处理**：
- success=false → errorMsg 原文告知用户，不自行重试
- 多步操作前一步失败 → 停止后续
- available=false → 引导前往后台（渲染 redirect 链接）

**参数安全**：
- 禁止猜测 adgroupId / tagId / optionValue / 关键词 id，必须从 query 返回提取
- 删标签用 tagId，加标签用 recommend 的 optionValue
- 删关键词用 id（从 query 返回），不用 word
- 列表参数调用前去 null + 去重

### setPricing 出价互斥

setPricing 的 params 含 budget/maxPrice/bidType/optimizeTarget/premiumTagOperationDTOList，但**不能随意组合**。

query 返回的 params 已含 `rules`（如 `when:{bidType:4} → then:{requirement:required}`），**严格按 rules 传参**：
- bidType=1（智能出价）→ maxPrice **forbidden**，只传 budget
- bidType=2（手动，标准推）→ maxPrice **required**
- bidType=4（商机成本，全站推）→ maxPrice **required**
- 改 budget 不改出价时：bidType=4 类**必须回传现有 maxPrice**（从 params.current 取），否则报错
- premiumTagOperationDTOList：params.values 列出当前可用溢价标签

### buildAdvicePage（操作建议页）

**何时用**：诊断后有**多项建议**需要用户确认 → 打包为采纳页（返回 landingUrl），用户在页面逐项确认。
**何时不用**：用户给**明确单一指令**（"预算改 500"）→ 直接 mutate。

**流程**：
1. query(include=operations) → 确认 buildAdvicePage available=true
2. params.actions.values 列出所有 type 及必填字段
3. 构造 actions 数组，每项必含 `type` + `reason`（中文理由，引用具体数据）
4. mutate → 返回 `{intentId, landingUrl, operationResults}`
5. 展示建议 + `[前往后台确认 →](landingUrl)`；checkResult.allowed=false 的项翻译 reason 告知用户

**构造要点**：
- `addProducts`/`addCrowdTags`/`addTerminalTags` 必须先 query recommend 拿 ID/optionValue，无数据不传该 type
- `setBid`/`setBudget` 遵循 setPricing 出价互斥规则
- `reason` 引用数据（"日预算300元连续3天触顶"），禁模糊建议（~~"建议提升预算"~~）

## 6. 响应模型

### query 返回

```json
{
  "success": true,
  "data": [{...}],                    // include=data
  "total": 42,
  "page": {"index": 1, "size": 20},
  "operations": [Operation],          // include=operations
  "links": [Link]                     // include=links
}
```

**Operation**：
```json
{
  "name": "pause",
  "desc": "暂停计划",
  "available": true,                  // ★ 唯一判据
  "reason": "计划已暂停",             // available=false 时的原因
  "redirect": {"url": "...", "label": "前往后台"},  // 不可用时的跳转
  "invoke": {                         // ★ 直接用于构造 mutate
    "entityType": "campaign",
    "action": "pause",
    "targets": {"id": "375128343"}
  },
  "params": [Param]                   // 参数元数据
}
```

**Param**：
```json
{
  "name": "budget",
  "desc": "日预算(元)",
  "type": "number",                   // string / number / boolean / enum / array
  "requirement": "required",          // required / optional
  "current": 500,                     // 当前值
  "range": [100, 99999],              // 数值范围
  "values": [{"value": "1", "label": "智能出价"}],  // 枚举选项
  "rules": [{"when": {"bidType": 4}, "then": {"requirement": "required"}}]
}
```

**Link**：
```json
{
  "name": "products",
  "desc": "推广商品列表",
  "available": true,
  "invoke": {                         // ★ 直接用于构造下次 query
    "entityType": "campaign_product",
    "include": "data",
    "filters": {"campaignId": "375128343"}
  }
}
```

### mutate 返回

```json
{
  "success": true,
  "errorMsg": null,
  "data": {}                          // 操作结果
}
```

## 7. 意图速查

| 用户说... | 做什么 |
|:---|:---|
| 看花费/效果/商机/趋势 | follow report link → datasource 从 invoke 取，**禁止猜** |
| 为什么/怎么优化/诊断 | follow diagnose link → query(entityType=diagnosis) |
| 列出/查计划 | query(entityType=campaign) |
| 暂停/恢复/删除计划 | query(include=operations) 确认 available → mutate |
| 改出价/预算/溢价 | mutate(action=setPricing)，按 params rules 传参 |
| 改投放地域/分时/多语言 | mutate(action=setRegion/setTiming/setMultiLingual) |
| 改推广渠道/匹配方式 | mutate(action=setChannel/setMatchType)，仅标准推 |
| 查/加/删商品 | follow products link → query/mutate(campaign_product) |
| 查/加/删关键词 | follow keywords link → query/mutate(campaign_keyword) |
| 推荐商品/标签 | follow recommend link → query |
| 加/删标签 | mutate(campaign_targeting_tag, action=create/delete) |
| 诊断后批量优化 | mutate(action=buildAdvicePage)，返回 landingUrl |

## 8. 能力边界

- **不支持品牌广告**（顶展/问鼎等）
- **不支持新建/克隆计划**（available=false 时会返回后台跳转链接）
- **不支持跨账户操作**
- **操作是否可用以 query 返回的 available 为准**，不要根据计划类型硬判断
