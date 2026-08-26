# 首次触发字段参考

本文档包含首次触发所有工具的重要说明和返回字段映射，数据返回后参考本文件进行提取和映射。

---

## 一、经营周报 (icbu crm list)

### 两种请求模式

**模式 A — 首次触发批量查询（基于 receipt）：**

调用 `icbu crm store-diagnose-brief` 时传入 `aiSalesDiagnoseDataQry.reportPageCode`（8 个编码），接口会触发后台数据计算并返回 `receipt`。等待 5 秒后，用 `receipt` 调用本接口，一次获取所有 8 页数据。

调用示例：`{"qry": {"reportAllDataQry": {"receipt": "<icbu crm store-diagnose-brief 返回的 receipt>"}}}`

**模式 B — 追问阶段单页查询（基于 encryptReportId）：**

用首次触发时 `icbu crm store-diagnose-brief` 返回的 `encryptedReportId`，作为 `qry.encryptReportId` 参数 + 指定 reportPageCode 查询单页数据。建议一次只查一页，页数越多可能超时。

调用示例：`{"qry": {"encryptReportId": "<首次保存的 encryptedReportId>", "reportAllDataQry": {"reportPageCode": ["PRODUCT_DATA_OVERVIEW"]}}}`

### invokeStatus 处理

- `invokeStatus = "completed"`：数据就绪，正常处理返回的报告数据
- `invokeStatus = "executing"`：数据尚未计算完成，等待 3 秒后使用相同参数重试一次

**返回数据结构：** `values.reportAllData` 包含按 reportPageCode 分模块的数据。

### 报告页编码总览（reportPageCode 可选值）

| 编码 | 报告页名称 | 报告周期 |
|------|-----------|:--------:|
| STORE_DATA_OVERVIEW | 店铺数据总览 | WEEKLY |
| ACTION_SUGGESTION | 行动建议 | WEEKLY |
| STAR_LEVEL_DATA_OVERVIEW | 星等级数据总览 | ALL |
| STORE_DIAGNOSIS | 店铺诊断 | ALL |
| PRODUCT_DATA_OVERVIEW | 商品数据总览 | ALL |
| EXPOSURE_TOP10_PRODUCT_DATA | 曝光Top10商品数据 | ALL |
| CATEGORY_EXPANSION_SUGGESTION | 品类扩充建议 | ALL |
| HOT_PRODUCT_RECOMMEND | 热门商品推荐 | ALL |
| BULLET_PRODUCT_RECOMMEND | 爆品定招推荐 | ALL |
| BUYER_DISTRIBUTION_DATA | 买家分布数据 | ALL |
| P4P_PLAN_OPTIMIZ_SUGGESTION | 直通车计划优化建议 | ALL |
| P4P_SEARCH_WORD_OPTIMIZ_SUGGESTION | 直通车买家搜索词优化建议 | ALL |
| WENDING_AND_TOP_EXPRESS_EFFECT_DATA | 问鼎&顶展效果数据 | ALL |
| BRAND_AD_EFFECT_DATA | 品牌聚量效果数据 | ALL |
| BRAND_AD_OPPORTUNITY_RENEWAL_WORD | 品牌广告商机-续约词 | ALL |
| BRAND_AD_OPPORTUNITY_NEW_OPPORTUNITY | 品牌广告商机-新商机 | ALL |
| STORE_CONVERSION_RATE_ANALYSIS | 店铺转化率分析 | ALL |
| STORE_COMMUNICATION_CONVERSION_OVERVIEW_WEEKLY | 沟通转化数据总览-周报 | WEEKLY |
| STORE_ACCOUNT_DATA_OVERVIEW | 店铺分账号数据总览 | ALL |
| BUSINESS_ASSISTANT_USAGE_DATA | 生意助手使用概览 | ALL |
| SUPPLY_PRODUCT_INTRODUCTION | 供应链产品介绍 | ALL |
| SUPPLY_MARKETING_INTRODUCTION | 供应链营销活动介绍 | ALL |
| SUPPLY_MARKETING_DRILL_DOWN | 供应链营销活动-钻享计划 | ALL |
| FLOW_SOURCE_CHANNEL_ANALYSIS | 流量来源渠道及分析 | ALL |
| STORE_INFRASTRUCTURE_SITUATION_WEEKLY | 店铺基建情况-周报 | WEEKLY |

> **报告周期说明**：`WEEKLY` 表示仅周报可用，`ALL` 表示周报和月报均可用。

---

### STORE_DATA_OVERVIEW - 店铺数据总览

返回类型：对象

| 字段 | 含义 |
|------|------|
| seImpsCntValue | 搜索曝光次数 |
| seImpsCntRivalAvg | 搜索曝光次数-同行平均 |
| seImpsCntRivalGood | 搜索曝光次数-同行优秀 |
| seImpsCntCycleCrc | 搜索曝光次数-环比 |
| seImpsCntVsGood | 搜索曝光次数-较同行优秀 |
| campImpsCntValue | 营销曝光次数 |
| campImpsCntRivalAvg | 营销曝光次数-同行平均 |
| campImpsCntRivalGood | 营销曝光次数-同行优秀 |
| campImpsCntCycleCrc | 营销曝光次数-环比 |
| campImpsCntVsGood | 营销曝光次数-较同行优秀 |
| seClkCntValue | 搜索点击次数 |
| seClkCntRivalAvg | 搜索点击次数-同行平均 |
| seClkCntRivalGood | 搜索点击次数-同行优秀 |
| seClkCntCycleCrc | 搜索点击次数-环比 |
| seClkCntVsGood | 搜索点击次数-较同行优秀 |
| pvCntValue | 店铺访问次数 |
| pvCntRivalAvg | 店铺访问次数-同行平均 |
| pvCntRivalGood | 店铺访问次数-同行优秀 |
| pvCntCycleCrc | 店铺访问次数-环比 |
| pvCntVsGood | 店铺访问次数-较同行优秀 |
| abCntValue | 商机人数 |
| abCntRivalAvg | 商机人数-同行平均 |
| abCntRivalGood | 商机人数-同行优秀 |
| abCntCycleCrc | 商机人数-环比 |
| abCntVsGood | 商机人数-较同行优秀 |
| uvAbRate | 商机转化率 |
| uvAbRateRivalAvg | 商机转化率-同行平均 |
| uvAbRateRivalGood | 商机转化率-同行优秀 |
| uvAbRateCycleCrc | 商机转化率-环比 |
| uvAbRateVsGood | 商机转化率-较同行优秀 |
| sucOrdAmt | 信保实收金额 |
| sucOrdAmtRivalAvg | 信保实收金额-同行平均 |
| sucOrdAmtRivalGood | 信保实收金额-同行优秀 |
| sucOrdAmtCycleCrc | 信保实收金额-环比 |
| sucOrdAmtVsGood | 信保实收金额-较同行优秀 |
| crtOrdCnt | 起草订单个数 |
| crtOrdCntRivalAvg | 起草订单个数-同行平均 |
| crtOrdCntRivalGood | 起草订单个数-同行优秀 |
| crtOrdCntCycleCrc | 起草订单个数-环比 |
| crtOrdCntVsGood | 起草订单个数-较同行优秀 |
| uvPayordRate | 支付转化率 |
| uvPayordRateRivalAvg | 支付转化率-同行平均 |
| uvPayordRateRivalGood | 支付转化率-同行优秀 |
| uvPayordRateCycleCrc | 支付转化率-环比 |
| uvPayordRateVsGood | 支付转化率-较同行优秀 |

---

## 二、店铺诊断 (icbu crm store-diagnose-brief)

调用 `icbu crm store-diagnose-brief`，首次触发时传入 `{"aiSalesDiagnoseDataQry": {"reportPageCode": ["STORE_DATA_OVERVIEW", "ACTION_SUGGESTION", "PRODUCT_DATA_OVERVIEW", "EXPOSURE_TOP10_PRODUCT_DATA", "CATEGORY_EXPANSION_SUGGESTION", "HOT_PRODUCT_RECOMMEND", "BUYER_DISTRIBUTION_DATA", "STORE_CONVERSION_RATE_ANALYSIS"]}}` 触发后台报告计算。不传 reportPageCode 则查全部。

### 返回数据提取

- **`receipt`** — ⚠️ 必须提取，等 5 秒后作为 `icbu crm list` 模式 A 的请求输入
- **`encryptedReportId`**（位于 `values.aiSalesWeekDiagnoseList[0].encryptedReportId`）— ⚠️ 必须保存，追问阶段作为模式 B 的请求输入；同时用于生成周报链接（缺失时静默跳过）
- `values.aiSalesWeekDiagnoseList[]` — 多周诊断数据数组（新结构），每周包含：
  - `scope`: 时间范围（如"近7天"、"上周"）
  - `encryptedReportId`: 周报ID（仅第一个元素有）
  - `indicatorList[]`: 该周的指标数组，每项包含：
    - `name`: 指标名称
    - `value`: 数值
    - `cycleCRC`: 环比变化（如 "+11.1%"）
    - `valueVsAvg`: 较同行平均变化（如 "-98.6%"）
  - `maTaskList[]`: 行动任务数组（可选），每项包含：
    - `taskName`: 任务名称
    - `taskDesc`: 任务描述
    - `taskStatus`: 任务状态
- `values.diagnoseSummary` — 诊断摘要文本
- `values.diagnoseTitle` — 诊断标题

> **兼容说明**：旧接口返回 `values.weekDiagnose[]`（扁平数组，每项自带 scope），新接口返回 `values.aiSalesWeekDiagnoseList[]`（嵌套结构，scope 在父级）。fetch-all-data 命令已做兼容处理。

### 数据映射（API 字段 → 简报指标）

- **曝光量 (PV)**: 取 `aiSalesWeekDiagnoseList` 中 `scope="近7天"` 的 `indicatorList` 里 `name="搜索曝光"` 的 `value`
- **点击量 (Clicks)**: 取 `scope="近7天"` 的 `indicatorList` 里 `name="点击量"` 的 `value`
- **商机数 (Inquiry)**: 取 `scope="近7天"` 的 `indicatorList` 里 `name="商机数"` 的 `value`

### 错误处理

- `success` 为 false 或 `errorMsg` 非空：提示"数据获取失败"并展示 errorMsg
- `values` 为空：提示"暂无经营数据，请检查店铺是否已开通相关服务"
- `encryptedReportId` 缺失：静默跳过周报链接生成，不中断主流程

---

## 通用说明

- **环比字段**（cycleCrc / CycleCrc）：正数表示增长，负数表示下降，如 `0.35` 表示环比增长35%，`-0.2` 表示环比下降20%。
- **较同行优秀字段**（vsGood）：负数表示低于同行优秀水平，如 `-0.9992` 表示比同行优秀低约99.9%。
- **null 值**：部分字段在数据不足或不适用时返回 null，分析时需做空值判断，不展示或标注"暂无数据"。
- **同行对比基准**：所有同行平均（RivalAvg/peerAverage）和同行优秀（RivalGood/peerTop）均基于商家所在主营二级行业的同期数据。

---

## 三、数据参谋 (data-advisor-shop-summary)

`data-advisor-shop-summary` 返回的 `returnValue[0]` 对象包含以下字段的完整清单。

### 完整字段清单

| 英文指标名 | 中文指标名 |
|-----------|-----------|
| seImpsCnt | 搜索曝光次数 |
| seImpsCntRivalAvg | 同行平均搜索曝光次数 |
| seImpsCntRivalGood | 同行优秀搜索曝光次数 |
| seClkCnt | 搜索点击次数 |
| seClkCntRivalAvg | 同行平均搜索点击次数 |
| seClkCntRivalGood | 同行优秀搜索点击次数 |
| seCtr | 搜索点击率 |
| seCtrRivalAvg | 同行平均搜索点击率 |
| seCtrRivalGood | 同行优秀搜索点击率 |
| campImpsCnt | 营销曝光次数（包含P4P直通车和全站推） |
| campImpsCntRivalAvg | 同行平均营销曝光次数（包含P4P直通车和全站推） |
| campImpsCntRivalGood | 同行优秀营销曝光次数（包含P4P直通车和全站推） |
| campClkCnt | 营销点击次数 |
| campClkCntRivalAvg | 同行平均营销点击次数 |
| campClkCntRivalGood | 同行优秀营销点击次数 |
| p4pImpsCnt | p4p曝光次数、标准推广曝光次数、直通车曝光次数 |
| p4pImpsCntRivalAvg | 同行平均p4p曝光次数、同行平均标准推广曝光次数、同行平均直通车曝光次数 |
| p4pImpsCntRivalGood | 同行优秀p4p曝光次数、同行优秀标准推广曝光次数、同行优秀直通车曝光次数 |
| p4pClkCnt | p4p点击次数、标准推广点击次数、直通车点击次数 |
| p4pClkCntRivalAvg | 同行平均p4p点击次数、同行平均标准推广点击次数、同行平均直通车点击次数 |
| p4pClkCntRivalGood | 同行优秀p4p点击次数、同行优秀标准推广点击次数、同行优秀直通车点击次数 |
| qztImpsCnt | 全站推曝光次数 |
| qztImpsCntRivalAvg | 同行平均全站推曝光次数 |
| qztImpsCntRivalGood | 同行优秀全站推曝光次数 |
| qztClkCnt | 全站推点击次数 |
| qztClkCntRivalAvg | 同行平均全站推点击次数 |
| qztClkCntRivalGood | 同行优秀全站推点击次数 |
| pvCnt | 店铺访问次数 |
| pvCntRivalAvg | 同行平均店铺访问次数 |
| pvCntRivalGood | 同行优秀店铺访问次数 |
| uvCnt | 店铺访问人数 |
| uvCntRivalAvg | 同行平均店铺访问人数 |
| uvCntRivalGood | 同行优秀店铺访问人数 |
| fbCnt | 询盘个数、商机数 |
| fbCntRivalAvg | 同行平均询盘个数、同行平均商机数 |
| fbCntRivalGood | 同行优秀询盘个数、同行优秀商机数 |
| fbUv | 询盘人数、询盘客户数 |
| fbUvRivalAvg | 同行平均询盘人数 |
| fbUvRivalGood | 同行优秀询盘人数 |
| fbTmUv | TM咨询人数 |
| fbTmUvRivalAvg | 同行平均TM咨询人数 |
| fbTmUvRivalGood | 同行优秀TM咨询人数 |
| abCnt | AB客户数、商机人数 |
| abCntRivalAvg | 同行平均AB客户数、同行平均商机人数 |
| abCntRivalGood | 同行优秀AB客户数、同行优秀商机人数 |
| abProdCnt | AB商品数 |
| addCartByrCnt | 加购买家数、收藏买家数 |
| addCartCnt | 加购次数 |
| uvAbRate | 商机转化率 |
| uvAbRateRivalAvg | 同行平均商机转化率 |
| uvAbRateRivalGood | 同行优秀商机转化率 |
| uvPayordRate | 总转化率、订单转化率（访客->支付） |
| uvPayordRateRivalAvg | 同行平均总转化率、同行订单转化率、同行平均订单转化率（访客->支付） |
| uvPayordRateRivalGood | 同行优秀总转化率、同行优秀总订单转化率（访客->支付） |
| sucOrdCnt | 信保订单数、订单数、销量 |
| sucOrdCntRivalAvg | 同行平均信保订单数、同行平均订单数、同行平均销量 |
| sucOrdCntRivalGood | 同行优秀信保订单数、同行优秀订单数、同行优秀销量 |
| sucOrdAmt | 信保交易金额（销售额、营业额、GMV、实收GMV、成交金额，单位：美元） |
| sucOrdAmtRivalAvg | 同行平均信保交易额（销售额、营业额） |
| sucOrdAmtRivalGood | 同行优秀信保交易额（销售额、营业额） |
| sucByrCnt | 信保挂账买家数 |
| sucByrCntRivalAvg | 同行平均信保挂账买家数 |
| sucByrCntRivalGood | 同行优秀信保挂账买家数 |
| crtOrdCnt | 起草订单数 |
| crtOrdCntRivalAvg | 同行平均起草订单数 |
| crtOrdCntRivalGood | 同行优秀起草订单数 |
| validProdCnt | 有效商品数、产品数 |
| validProdCntRivalAvg | 同行平均有效商品数、同行平均产品数 |
| validProdCntRivalGood | 同行优秀有效商品数、同行优秀产品数 |
| crtProdCnt | 90天新发品数 |
| crtProdCntRivalAvg | 同行平均新发品数 |
| crtProdCntRivalGood | 同行优秀新发品数 |
| goodProdCnt | 优品数、实力优品数 |
| goodProdCntRivalAvg | 同行平均优品数 |
| goodProdCntRivalGood | 同行优秀优品数 |
| topProdCnt | 爆品数 |
| topProdCntRivalAvg | 同行平均爆品数 |
| topProdCntRivalGood | 同行优秀爆品数 |
| fstReplyRate30d | 及时回复率 |
| fstReplyRate30dRivalAvg | 同行平均及时回复率 |
| fstReplyRate30dRivalGood | 同行优秀及时回复率 |
| fst5minReplyRate30d | 极速回复率 |
| fst5minReplyRate30dRivalAvg | 同行平均极速回复率 |
| fst5minReplyRate30dRivalGood | 同行优秀极速回复率 |
| avgReplyTime30d | 平均回复时长（单位：小时） |
| avgReplyTime30dRivalAvg | 同行平均平均回复时长（单位：小时） |
| avgReplyTime30dRivalGood | 同行优秀平均回复时长（单位：小时） |
| statDate | 统计日期，yyyy-MM-dd格式 |
| statisticsType | 统计周期类型 |
| zhDisplay | 对标行业中文名称 |
| enDisplay | 对标行业英文名称 |
| cateId | 对标行业id |

### 查询参数

| 参数 | 类型 | 说明 |
|------|------|------|
| statisticsType | string | `day`(日) / `7d`(7天汇总) / `30d`(30天汇总) |
| startDate | string | 开始日期 `yyyy-MM-dd`（时间范围查询时使用） |
| endDate | string | 结束日期 `yyyy-MM-dd`（时间范围查询时使用） |

**首次触发参数：** `statisticsType: "day"`，`startDate`/`endDate` 均设为当日命令输出的 `yesterday`。

---

## 四、实时明细工具

### icbu.trade.list-trade-list-mcp — 交易订单列表

首次触发参数：`{"limit": 20, "start": 0}`。返回数据结构：
- `totalCount`: 订单总数
- `tradeList[]`: 订单列表，每条包含：
  - `id`: 订单ID
  - `createDate` / `modifyDate`: 创建/修改时间
  - `status.status`: 订单状态（`trade_close`、`wait_buyer_payment`、`wait_seller_ship` 等）
  - `status.actions[]`: 可执行操作列表
  - `buyer`: 买家信息（`companyName`, `country`, `email`, `loginId`）
  - `payment.totalAmount.amount`: 订单总金额
  - `payment.receivedAmount.amount`: 已收金额
  - `subjectMatter.details[]`: 商品明细（`name`, `quantity`, `unitPrice`）
  - `tags[]`: 订单标签（`ta`, `semi_manage`, `direct_pay` 等）

**简报提取逻辑：**
- 待支付订单：过滤 `status.status == "wait_buyer_payment"`，累计 `totalAmount.amount`
- 待发货订单：过滤 `status.status == "wait_seller_ship"`，统计笔数
- 订单超时预警：根据 `createDate` 计算是否接近 24h 支付时限

### icbu.logistics.list — 物流订单列表

首次触发参数：`{"currentPage": 1, "pageSize": 20}`。返回 `total/currentPage/pageSize/totalPage/dataList[]`。

**简报提取逻辑：**
- 物流订单总数：读取 `total`
- 运输中/揽收/发货相关：根据 `dataList[].orderStatus/orderStatusDesc` 统计
- 异常预警：筛选 `orderStatus/orderStatusDesc` 中包含异常、exception、abnormal 的记录
- 若命令失败，物流模块标注暂不可用，不要降级成 0 值空数据

### icbu.tm.list-conversation — IM 沟通会话

**首次触发参数：** 先用 `icbu.member.list` 获取成员 aliId，再调用 `{"limitTimeStamp": 9999999999999, "selfAliId": "<aliId>", "count": 20, "domain": "icbu"}`。

**简报提取逻辑：**
- 待回复消息数：统计返回会话中 `unreadCount > 0` 的条数
- 新增咨询数：统计返回会话总数（按时间范围过滤）

---

## 追问领域路由索引

追问时按需阅读对应领域文件：

| 追问方向 | 参考文件 |
|:---|:---|
| 商品数据 / 品类 / 爆品 / 热门商品 | domain-product.md |
| 流量来源 / 渠道分析 / 买家地域 | domain-traffic-buyers.md |
| 转化率 / 行动建议 | domain-conversion.md |
| 直通车 / P4P / 问鼎 / 顶展 / 品牌广告 | domain-advertising.md |
| 沟通服务 / 子账号 / 生意助手 / IM | domain-service.md |
| 店铺诊断 / 星等级 / 供应链 | domain-store-supply.md |
| 交易订单 / 物流 | domain-trade-logistics.md |
