# 转化领域字段参考

本文档包含转化分析和行动建议模块的字段说明，追问转化率/行动建议时查阅。

---

## ACTION_SUGGESTION - 行动建议

返回类型：对象

| 字段 | 含义 |
|------|------|
| busCount | 本周商机量 |
| busCountRivalAvg | 行业均值 |
| busCountRivalGood | 行业优秀 |
| shopSellData | 近期每日商机与成交数据列表 |
| shopSellData[].statDate | 统计日期 |
| shopSellData[].busCount | 商机个数（我的效果） |
| shopSellData[].busCountRivalAvg | 商机个数-同行平均 |
| shopSellData[].busCountRivalGood | 商机个数-同行优秀 |
| shopSellData[].orderCount | 成交个数（我的效果） |
| shopSellData[].orderCountRivalAvg | 成交个数-同行平均 |
| shopSellData[].orderCountRivalGood | 成交个数-同行优秀 |
| warningMaTask | 行动建议任务列表 |
| warningMaTask[].title | 任务标题（建议内容） |
| warningMaTask[].status | 任务完成状态：`DONE`=已完成，`DOING`=未完成 |
| warningMaTask[].actionUrl | 跳转链接 |
| warningMaTask[].coreTask | 是否核心任务 |

---

## STORE_CONVERSION_RATE_ANALYSIS - 店铺转化率分析

返回类型：列表（按日期，近30天每日数据）

| 字段 | 含义 |
|------|------|
| statDate | 统计日期 |
| shopPv | 访问次数（我的效果） |
| shopPvRivalAvg | 访问次数-行业平均 |
| shopPvRivalGood | 访问次数-同行优秀 |
| impsToVisitorRate | 访问转化率（我的效果） |
| impsToVisitorRateRivalAvg | 访问转化率-行业平均 |
| impsToVisitorRateRivalGood | 访问转化率-同行优秀 |
| busCount | 商机个数（我的效果） |
| busCountRivalAvg | 商机个数-行业平均 |
| busCountRivalGood | 商机个数-同行优秀 |
| visitorToBusRate | 商机个数转化率（我的效果） |
| visitorToBusRateRivalAvg | 商机个数转化率-行业平均 |
| visitorToBusRateRivalGood | 商机个数转化率-同行优秀 |
| orderCount | 成交个数（我的效果） |
| orderCountRivalAvg | 成交个数-行业平均 |
| orderCountRivalGood | 成交个数-同行优秀 |
| busToOrdRate | 订单转化率（我的效果） |
| busToOrdRateRivalAvg | 订单转化率-行业平均 |
| busToOrdRateRivalGood | 订单转化率-同行优秀 |
