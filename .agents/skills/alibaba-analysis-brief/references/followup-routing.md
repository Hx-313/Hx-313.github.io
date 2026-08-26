# 追问数据路由参考

> 本文件在追问模式下阅读，用于确定追问方向对应的工具和参数。

> **数据压缩**：所有追问 workctl 命令的输出必须 pipe 到 `workctl workflow analysis-brief format-followup` 以减少 LLM context 占用。格式：`workctl ... --format json | workctl workflow analysis-brief format-followup --type <type>`。type 映射：周报=`weekly`、商品=`product`、访客=`visitor`、员工=`account`、广告=`ads`、流量=`flow`、数据参谋=`advisor`、订单=`trade`、物流=`logistics`。

## 周报接口路由表

首次触发已通过 `icbu crm store-diagnose-brief` 传入 8 个 reportPageCode 触发计算，并用 `receipt` 批量获取了数据。进入追问模式后，使用步骤 1 保存的 `encryptedReportId` + 单个 reportPageCode 调用 `icbu crm list` 查询指定报告页（建议一次只查一页，页数越多耗时越久）。阅读对应 domain-*.md 获取字段说明。

| 用户追问方向 | 追加的 reportPageCode | 参考文件 |
|:---|:---|:---|
| 行动建议 / 优化建议 | `ACTION_SUGGESTION` | domain-conversion.md |
| 星等级 / 星级数据 | `STAR_LEVEL_DATA_OVERVIEW` | domain-store-supply.md |
| 店铺诊断 / 经营诊断 | `STORE_DIAGNOSIS` | domain-store-supply.md |
| 商品数据 / 商品分层 / 产品分析 | `PRODUCT_DATA_OVERVIEW` | domain-product.md |
| 曝光Top商品 / 热门商品表现 | `EXPOSURE_TOP10_PRODUCT_DATA` | domain-product.md |
| 品类扩充 / 品类建议 | `CATEGORY_EXPANSION_SUGGESTION` | domain-product.md |
| 热门商品推荐 | `HOT_PRODUCT_RECOMMEND` | domain-product.md |
| 爆品推荐 / 爆品定招 | `BULLET_PRODUCT_RECOMMEND` | domain-product.md |
| 买家分布 / 买家国家 | `BUYER_DISTRIBUTION_DATA` | domain-traffic-buyers.md |
| 直通车计划 / P4P优化 | `P4P_PLAN_OPTIMIZ_SUGGESTION` | domain-advertising.md |
| 直通车搜索词 / 搜索词优化 | `P4P_SEARCH_WORD_OPTIMIZ_SUGGESTION` | domain-advertising.md |
| 问鼎 / 顶展效果 | `WENDING_AND_TOP_EXPRESS_EFFECT_DATA` | domain-advertising.md |
| 品牌广告 / 品牌聚量 | `BRAND_AD_EFFECT_DATA` | domain-advertising.md |
| 品牌续约词 | `BRAND_AD_OPPORTUNITY_RENEWAL_WORD` | domain-advertising.md |
| 品牌新商机 | `BRAND_AD_OPPORTUNITY_NEW_OPPORTUNITY` | domain-advertising.md |
| 转化率 / 转化趋势 / 转化分析 | `STORE_CONVERSION_RATE_ANALYSIS` | domain-conversion.md |
| 沟通转化 / 服务能力 / 回复率 | `STORE_COMMUNICATION_CONVERSION_OVERVIEW_WEEKLY` | domain-service.md |
| 子账号数据 / 分账号 | `STORE_ACCOUNT_DATA_OVERVIEW` | domain-service.md |
| 生意助手 / AI使用情况 | `BUSINESS_ASSISTANT_USAGE_DATA` | domain-service.md |
| 供应链产品 | `SUPPLY_PRODUCT_INTRODUCTION` | domain-store-supply.md |
| 供应链营销 | `SUPPLY_MARKETING_INTRODUCTION` | domain-store-supply.md |
| 钻享计划 | `SUPPLY_MARKETING_DRILL_DOWN` | domain-store-supply.md |
| 流量来源 / 渠道分析 | `FLOW_SOURCE_CHANNEL_ANALYSIS` | domain-traffic-buyers.md |
| 店铺基建 | `STORE_INFRASTRUCTURE_SITUATION_WEEKLY` | domain-store-supply.md |

**调用示例：** 用户追问"帮我看看商品数据" →
```bash
workctl icbu crm list --encryptReportId "<首次保存的 encryptedReportId>" --reportAllDataQry '{"reportPageCode":["PRODUCT_DATA_OVERVIEW"]}' --format json | workctl workflow analysis-brief format-followup --type weekly
```

---

## 商品效果数据路由（使用 `data-advisor-shop-product`）

当用户追问涉及**具体商品效果明细**时，优先使用 `data-advisor-shop-product` 而非周报 reportPageCode。两者区别：
- 周报接口（`PRODUCT_DATA_OVERVIEW` / `EXPOSURE_TOP10_PRODUCT_DATA`）：提供商品分层统计和 Top10 曝光排名，适合宏观概览
- `data-advisor-shop-product`：提供商品粒度的效果明细（支持排序、筛选、分页），适合具体商品下钻

| 用户追问方向 | 使用工具 | 参考文件 |
|:---|:---|:---|
| 商品效果排名 / 哪些商品曝光/点击最高 | `data-advisor-shop-product`（orderBy 排序） | domain-product-effect.md |
| 爆品/优品/低质品表现 | `data-advisor-shop-product`（prodLevel 筛选） | domain-product-effect.md |
| P4P/直通车商品效果 | `data-advisor-shop-product`（p4pProd: "Y"） | domain-product-effect.md |
| 问鼎/顶展/橱窗商品效果 | `data-advisor-shop-product`（对应筛选参数） | domain-product-effect.md |
| 某个具体商品的数据 | `data-advisor-shop-product`（productName 搜索） | domain-product-effect.md |
| 点击率低/曝光低的商品 | `data-advisor-shop-product`（区间筛选） | domain-product-effect.md |
| 半托管商品 / 交易品 / 商机品效果 | `data-advisor-shop-product`（对应筛选参数） | domain-product-effect.md |

**调用示例：** 用户追问"哪些商品曝光最高" →
```bash
workctl icbu advisor data-advisor-shop-product --statDate <yesterday> --orderBy sumProdShowNum --order desc --format json | workctl workflow analysis-brief format-followup --type product
```

---

## 访客明细路由（使用 `data-advisor-visitor-detail`）

当用户追问涉及**访客行为明细**时，使用 `data-advisor-visitor-detail` 查询店铺访客列表。与周报/数据参谋的区别：
- 周报接口（`BUYER_DISTRIBUTION_DATA`）：提供买家地区分布统计，适合宏观概览
- `data-advisor-shop-region`：提供地域维度的流量汇总，适合看国家/大洲趋势
- `data-advisor-visitor-detail`：提供访客粒度的行为明细（来源国家、浏览偏好、是否询盘/TM），适合具体访客下钻

| 用户追问方向 | 使用工具 | 参考文件 |
|:---|:---|:---|
| 访客列表 / 今天有哪些访客 | `data-advisor-visitor-detail` | domain-traffic-buyers.md |
| 买家行为明细 / 买家浏览了什么 | `data-advisor-visitor-detail` | domain-traffic-buyers.md |
| 访客来源国家 / 哪些国家的买家来过 | `data-advisor-visitor-detail` | domain-traffic-buyers.md |
| 询盘访客 / 哪些访客发了询盘 | `data-advisor-visitor-detail`（isMcFb 筛选） | domain-traffic-buyers.md |
| TM咨询访客 / 哪些买家发了消息 | `data-advisor-visitor-detail`（isAtmFb 筛选） | domain-traffic-buyers.md |
| 访客偏好关键词 / 买家搜索了什么 | `data-advisor-visitor-detail`（serKeywords 字段） | domain-traffic-buyers.md |
| 高意向访客 / 高浏览量买家 | `data-advisor-visitor-detail`（按 visitPv 排序） | domain-traffic-buyers.md |

**调用示例：** 用户追问"昨天有哪些访客" →
```bash
workctl icbu advisor data-advisor-visitor-detail --startDate <yesterday> --endDate <yesterday> --format json | workctl workflow analysis-brief format-followup --type visitor
```

---

## 员工数据路由（使用 `data-advisor-account-summary`）

当用户追问涉及**员工/子账号业绩**时，使用 `data-advisor-account-summary` 查询店铺员工数据。与周报接口的区别：
- 周报接口（`STORE_ACCOUNT_DATA_OVERVIEW`）：提供子账号的服务维度数据（回复率、服务力评分），适合服务能力评估
- `data-advisor-account-summary`：提供员工粒度的全面经营数据（产品/询盘/订单/GMV/回复等），适合团队业绩对比和个人表现下钻

| 用户追问方向 | 使用工具 | 参考文件 |
|:---|:---|:---|
| 员工表现 / 子账号业绩 | `data-advisor-account-summary` | domain-account.md |
| 团队数据对比 / 谁的业绩最好 | `data-advisor-account-summary` | domain-account.md |
| 某员工的询盘/订单/产品情况 | `data-advisor-account-summary` | domain-account.md |
| 员工回复率 / 响应速度 | `data-advisor-account-summary` | domain-account.md |
| 新发品/修改产品统计 | `data-advisor-account-summary` | domain-account.md |
| 员工GMV / 成交金额对比 | `data-advisor-account-summary` | domain-account.md |

**调用示例：** 用户追问"最近一周每个员工的业绩" →
```bash
workctl icbu advisor data-advisor-account-summary --startDate <seven_days_ago> --endDate <yesterday> --statisticsType day --format json | workctl workflow analysis-brief format-followup --type account
```

---

## 广告诊断路由（使用 `icbu-ads-account-diagnosis`）

当用户追问涉及**广告问题或投放优化**时，使用 `icbu-ads-account-diagnosis` 进行账户诊断。与简报中广告概览区块的区别：
- 简报中的广告概览（`icbu-ads-report-load-datasource`）：展示近7天花费/曝光/点击/商机等汇总数据，适合快速了解投放情况
- `icbu-ads-account-diagnosis`：深度诊断账户问题，返回问题结论和问题计划列表，适合定位具体问题和优化方向

| 用户追问方向 | 使用工具 | 参考文件 |
|:---|:---|:---|
| 广告有什么问题 / 账户诊断 | `icbu-ads-account-diagnosis` | domain-ads.md |
| 为什么花费高 / 商机成本高 | `icbu-ads-account-diagnosis` | domain-ads.md |
| 哪些计划有问题 / 效果差的计划 | `icbu-ads-account-diagnosis` | domain-ads.md |
| 广告怎么优化 / 投放建议 | `icbu-ads-account-diagnosis` | domain-ads.md |
| 广告花了多少钱 / 广告数据详情 | `icbu-ads-report-load-datasource` | domain-ads.md |

**调用示例：** 用户追问"帮我诊断一下广告账户" →
```bash
workctl icbu ads icbu-ads-account-diagnosis --startDate <seven_days_ago> --endDate <yesterday> --format json | workctl workflow analysis-brief format-followup --type ads
```

---

## 流量数据路由（使用 data_advisor 流量工具）

**⚠️ 仅当用户追问流量相关问题时才使用以下工具，非流量问题不得触发。**

当用户追问涉及**流量来源/详情/画像/去向产品**时，使用 data_advisor 流量系列工具。与周报接口的区别：
- 周报接口（`FLOW_SOURCE_CHANNEL_ANALYSIS`）：提供渠道维度的汇总统计，适合宏观概览
- `data-advisor-shop-channel`：提供各流量来源渠道的详细数据，支持日/周/月粒度
- `data-advisor-shop-flow`：提供分终端的流量详情趋势
- `data-advisor-shop-flow-profile`：提供买家画像（地域偏好/类目偏好/渠道偏好），支持按流量类型筛选
- `data-advisor-to-product`：提供流量去向产品数据，展示哪些商品承接了流量

| 用户追问方向 | 使用工具 | 参考文件 |
|:---|:---|:---|
| 流量来源 / 各渠道占比 / 渠道数据 | `data-advisor-shop-channel` | domain-flow.md |
| 流量详情 / 流量趋势 / 分终端流量 | `data-advisor-shop-flow` | domain-flow.md |
| 流量画像 / 买家地域偏好 / 买家类目偏好 / 渠道偏好 | `data-advisor-shop-flow-profile` | domain-flow.md |
| 流量去向 / 哪些产品承接了流量 / 引流产品 | `data-advisor-to-product` | domain-flow.md |
| 搜索流量的来源/画像/去向 | `data_advisor_*`（sourceType: `search_traffic`） | domain-flow.md |
| 场景流量的来源/画像/去向 | `data_advisor_*`（sourceType: `scenario_traffic`） | domain-flow.md |
| 自然流量的来源/画像/去向 | `data_advisor_*`（sourceType: `increase_traffic`） | domain-flow.md |

---

## 数据参谋路由

`data-advisor-shop-summary` 已在步骤 1 中以 `"statisticsType": "day"` 首次调用。追问下钻时按不同时间粒度或自定义日期范围再次调用。

**`statisticsType` 取值（3选1）：** `"day"`(日维度) / `"7d"`(7天汇总) / `"30d"`(30天汇总)

**适用场景（日期基于步骤 0 输出）：**
- 用户问“昨天的数据” → `workctl icbu advisor data-advisor-shop-summary --statisticsType day --startDate <yesterday> --endDate <yesterday> --format json | workctl workflow analysis-brief format-followup --type advisor`
- 用户问“今天的数据” → `workctl icbu advisor data-advisor-shop-summary --statisticsType day --startDate <today> --endDate <today> --format json | workctl workflow analysis-brief format-followup --type advisor`
- 用户问“最近7天汇总” → `workctl icbu advisor data-advisor-shop-summary --statisticsType 7d --format json | workctl workflow analysis-brief format-followup --type advisor`
- 用户问“最近30天汇总” → `workctl icbu advisor data-advisor-shop-summary --statisticsType 30d --format json | workctl workflow analysis-brief format-followup --type advisor`
- 用户问“3月1日到3月15日的数据” → `workctl icbu advisor data-advisor-shop-summary --statisticsType day --startDate 2026-03-01 --endDate 2026-03-15 --format json | workctl workflow analysis-brief format-followup --type advisor`

地域分布数据使用 `data-advisor-shop-region`，详细参数见 [domain-traffic-buyers.md](domain-traffic-buyers.md)。

返回数据中 `returnValue[0]` 包含自身数据，每个指标字段附带 `RivalAvg`（行业平均）和 `RivalGood`（行业优秀）对照值。
