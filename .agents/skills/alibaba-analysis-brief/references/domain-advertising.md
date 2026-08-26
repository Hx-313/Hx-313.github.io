# 广告领域字段参考

本文档包含直通车/P4P、问鼎、顶展、品牌广告相关模块的字段说明，追问广告效果/投放优化时查阅。

---

## P4P_PLAN_OPTIMIZ_SUGGESTION - 直通车计划优化建议

返回类型：列表

| 字段 | 含义 |
|------|------|
| campaignTitle | 计划名称 |
| campaignTypeName | 计划类型（如：搜索-爆品助推、搜索-关键词推广） |
| impressionCnt | 曝光量 |
| fiClickCnt | 点击量 |
| ctr | 点击率 |
| cpc | 平均点击成本 |
| onlineBudget | 花费 |
| businessLeadsCnt | 意向商机量 |
| fiGrowthClickRate | L1+点击占比 |

---

## P4P_SEARCH_WORD_OPTIMIZ_SUGGESTION - 直通车买家搜索词优化建议

返回类型：对象，包含三类搜索词列表

| 字段 | 含义 |
|------|------|
| HIGH_EXPOSURE_LOW_CLICK | 高曝光低点击搜索词列表 |
| LOW_EXPOSURE_HIGH_CLICK | 低曝光高点击搜索词列表 |
| LOW_RELEVANCE | 低相关度搜索词列表 |
| 各列表[].keyword | 关键词 |
| 各列表[].impressionCnt | 曝光量 |
| 各列表[].fiClickCnt | 点击量 |
| 各列表[].ctr | 点击率 |
| 各列表[].cpc | 平均点击成本 |
| 各列表[].cost | 花费 |
| 各列表[].businessLeadsCnt | 意向商机量 |
| 各列表[].fiGrowthClickRate | L1+点击占比 |

---

## WENDING_AND_TOP_EXPRESS_EFFECT_DATA - 问鼎&顶展效果数据

返回类型：对象，包含两个子对象

| 字段 | 含义 |
|------|------|
| wendingEffectData | 问鼎效果数据 |
| topEffectData | 顶展效果数据 |

两个子对象字段相同（WendingAndTopBrandDataDto）：

| 字段 | 含义 |
|------|------|
| impsCnt | 曝光次数 |
| clkCnt | 点击次数 |
| dpvCnt | 到店次数 |
| browsedCnt | 产品详情浏览次数 |
| browsedProdCnt | 浏览产品数量 |
| onlineWords | 在投关键词数 |
| yearPaymentAmount | 近12月投入 |
| compareRatioImpsCnt | 曝光次数-月环比 |
| compareRatioClkCnt | 点击次数-月环比 |
| compareRatioDpvCnt | 到店次数-月环比 |
| compareRatioBrowsedCnt | 产品详情浏览次数-月环比 |
| compareRatioBrowsedProdCnt | 浏览产品数量-月环比 |
| compareRatioOnlineWords | 在投关键词数-月环比 |
| peerAverageImpsCnt | 曝光次数-同行平均 |
| peerAverageClkCnt | 点击次数-同行平均 |
| peerAverageDpvCnt | 到店次数-同行平均 |
| peerAverageBrowsedCnt | 产品详情浏览次数-同行平均 |
| peerAverageBrowsedProdCnt | 浏览产品数量-同行平均 |
| peerAverageOnlineWords | 在投关键词数-同行平均 |
| peerAverageYearPaymentAmount | 近12月投入-同行平均 |
| peerTopImpsCnt | 曝光次数-同行优秀 |
| peerTopClkCnt | 点击次数-同行优秀 |
| peerTopDpvCnt | 到店次数-同行优秀 |
| peerTopBrowsedCnt | 产品详情浏览次数-同行优秀 |
| peerTopBrowsedProdCnt | 浏览产品数量-同行优秀 |
| peerTopOnlineWords | 在投关键词数-同行优秀 |
| peerTopYearPaymentAmount | 近12月投入-同行优秀 |

---

## BRAND_AD_EFFECT_DATA - 品牌聚量效果数据

结构与 WENDING_AND_TOP_EXPRESS_EFFECT_DATA 相同，字段含义一致。

| 字段 | 含义 |
|------|------|
| wendingBrandEffectData | 问鼎品牌聚量效果数据 |
| topBrandEffectData | 顶展品牌聚量效果数据 |

---

## BRAND_AD_OPPORTUNITY_RENEWAL_WORD - 品牌广告商机-续约词

返回类型：对象

| 字段 | 含义 |
|------|------|
| wendingRenewWordVo | 问鼎续约词数据 |
| topCanRenewWordVo | 顶展续约词数据 |

两个子对象字段相同：

| 字段 | 含义 |
|------|------|
| canRenewStatisticsDesc | 续约词统计描述（如"当前立即续约词8个,次月开始可续约词7个"） |
| currentCanRenewStatisticsInfo | 当前可立即续约词数量 |
| nextMonthCanRenewStatisticsInfo | 次月开始可续约词数量 |
| canRenewWordList | 续约词列表 |
| canRenewWordList[].keyword | 关键词 |
| canRenewWordList[].channel | 投放终端（PC端/无线端） |
| canRenewWordList[].renewDesc | 续约状态（可立即续约/次月开始可续约） |
| canRenewWordList[].canRenewDeadlineCn | 续约截止时间 |
| canRenewWordList[].localPrice | 折扣后价格 |
| canRenewWordList[].baseLocalPrice | 原价 |
| canRenewWordList[].discount | 折扣 |
| canRenewWordList[].currency | 币种 |

---

## BRAND_AD_OPPORTUNITY_NEW_OPPORTUNITY - 品牌广告商机-新商机

返回类型：对象

| 字段 | 含义 |
|------|------|
| wendingNewOpportunityInfoVoList | 问鼎新词列表 |
| topRankingInfoVoList | 顶展新词列表 |

两个列表元素字段相同：

| 字段 | 含义 |
|------|------|
| keyword | 关键词 |
| channel | 投放终端 |
| purchaseAdvice | 购买建议（如"可预定"） |
| recReasons | 推荐理由列表（如"询盘量排名前30%"） |
| localPrice | 折扣后价格 |
| baseLocalPrice | 基准价格 |
| discount | 折扣 |
| currency | 币种 |
