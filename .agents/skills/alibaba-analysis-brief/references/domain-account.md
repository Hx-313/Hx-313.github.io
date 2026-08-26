# 员工数据领域字段参考

本文档包含员工/子账号经营数据相关的字段说明。追问员工表现/子账号业绩/团队数据时查阅。

---

## icbu.advisor.data-advisor-account-summary - 员工数据查询

查询店铺的员工数据，提供员工粒度的经营表现明细。

**调用示例：**
```bash
workctl icbu advisor data-advisor-account-summary \
  --startDate 2026-05-01 \
  --endDate 2026-05-11 \
  --statisticsType day \
  --format json
```

**入参（workctl 扁平参数）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | | 查询起始时间，格式 yyyy-mm-dd |
| endDate | string | | 查询截止时间，格式 yyyy-mm-dd |
| statisticsType | string | | 统计周期：day(日) / week(周) / month(月) |

**返回字段：**

| 字段 | 含义 |
|------|------|
| fullName | 员工名称（值为"全部账号"时表示店铺所有员工的汇总数据） |
| totalProductCount | 产品数 |
| notOnesiteItmCntStd | 有效产品数 |
| newProductCount | 新发品数 |
| alterProductCount | 修改产品数 |
| reviewedRfq | 审核通过报价量 |
| impression | 产品搜索曝光 |
| clicks | 产品搜索点击 |
| fbPv | 询盘数/商机数 |
| uvFbAtm | TM咨询客户数 |
| fst5minReplyRate30d | 极速回复率（5分钟回复率） |
| replyRate | 回复率/及时回复率 |
| replyAvgTime | 平均回复时间（单位：小时） |
| prepayMordCnt | 实收信保订单数 |
| rcvdAmt | 实收信保金额/成交金额/GMV（单位：美元） |
| busToOrdRate | 订单转化率 |
| statDate | 统计日期，yyyy-MM-dd 格式 |
| statisticsType | 统计周期类型（day/week/month） |
| loginDays | 最近登录网站天数 |
| onlineTime | 最近在线时长 |
| opPcTime | 最近PC操作时间 |
| opAppTime | 最近APP操作时间 |
| avatarUrl | 账号头像 |
| replyRfqRate | RFQ回复率 |
| marketingCnt | 营销次数 |
| drawupMordCnt | 创建订单数 |
