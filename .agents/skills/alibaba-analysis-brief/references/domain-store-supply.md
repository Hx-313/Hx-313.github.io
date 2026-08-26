# 诊断与供应链领域字段参考

本文档包含店铺诊断、星等级和供应链相关模块的字段说明，追问店铺诊断/星等级/供应链时查阅。

---

## STORE_DIAGNOSIS - 店铺诊断

返回类型：对象（StarLevelConclusionDto）

| 字段 | 含义 |
|------|------|
| conclusion | 整体结论（如：当前评定星等级、预测星等级、是否有降星风险） |
| advice | 保星/升星建议概述 |
| type | 所用星等级类型：`custom`=商机星等级，`rts`=交易星等级 |
| starAdviceVOList | 建议细化措施列表 |
| starAdviceVOList[].indicatorName | 指标名称 |
| starAdviceVOList[].adviceDetails | 该指标的优化建议列表 |
| starAbilityVOList | 能力项及指标值列表 |
| starAbilityVOList[].abilityItem | 能力项名称（如：商品力、营销力、交易力、服务力） |
| starAbilityVOList[].abilityItemValue | 能力项得分（含单位，如"96分"） |
| starAbilityVOList[].abilityItemPureValue | 能力项得分（纯数字） |
| starAbilityVOList[].abilityStarLevel | 该能力项对应的星等级 |
| starAbilityVOList[].starIndicatorVOList | 该能力项下的具体指标列表 |
| starAbilityVOList[].starIndicatorVOList[].indicatorName | 指标名称 |
| starAbilityVOList[].starIndicatorVOList[].indicatorValue | 店铺表现（含单位） |
| starAbilityVOList[].starIndicatorVOList[].indicatorPureValue | 店铺表现（纯数字） |
| starAbilityVOList[].starIndicatorVOList[].indicatorNextLevelAvgValue | 下一级平均（含单位） |
| starAbilityVOList[].starIndicatorVOList[].indicatorNextLevelAvgPureValue | 下一级平均（纯数字） |

> 备注：STAR_LEVEL_DATA_OVERVIEW 和 STORE_INFRASTRUCTURE_SITUATION_WEEKLY 无独立字段详解，数据结构参见接口返回。

---

## SUPPLY_PRODUCT_INTRODUCTION - 供应链产品介绍

返回类型：Map

| 字段 | 含义 |
|------|------|
| ta_ord_amt_3m | 近30天交易规模（USD） |
| is_ta_cust | 是否开通资金及交易保障服务基础版（Y/N） |
| is_taplus_admit | 是否符合资金及交易保障服务升级版条件（Y/N） |
| taplus_suggestion | 升级版建议列表（字符串数组） |
| taplus_action | 升级版行动建议列表（字符串数组） |

> 渲染逻辑：`is_ta_cust=N` 时展示开通基础版引导；`is_ta_cust=Y` 时展示基础版使用建议；`is_taplus_admit=Y` 时额外展示升级版建议。

---

## SUPPLY_MARKETING_INTRODUCTION - 供应链营销活动介绍

返回类型：Map，取 `service_fee_right` 字段（列表，展示前两条）

| 字段 | 含义 |
|------|------|
| fwffd_target_data | 近90天目标实收（USD） |
| fwffd_current_data | 当前实收（USD） |
| fwffd_quantity | TA基础版服务费封顶金额 |
| fwffd_start_time | 近90天开始时间 |
| fwffd_end_time | 近90天结束时间 |

> 差值可通过 `fwffd_target_data - fwffd_current_data` 计算。

---

## SUPPLY_MARKETING_DRILL_DOWN - 供应链营销活动-钻享计划

返回类型：Map

| 字段 | 含义 |
|------|------|
| zx_target_data | 年度在线交易目标（USD） |
| zx_current_data | 当前完成值（USD） |

> 财年周期：每年4月1日至次年3月31日。差值可通过 `zx_target_data - zx_current_data` 计算。
