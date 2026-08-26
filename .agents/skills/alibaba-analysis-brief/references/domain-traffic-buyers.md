# 流量与买家地域字段参考

本文档包含流量渠道和买家地域分布相关模块的字段说明，追问流量来源/渠道分析/买家地域时查阅。

---

## FLOW_SOURCE_CHANNEL_ANALYSIS - 流量来源渠道与分析

返回类型：列表（每个渠道一条）

| 字段 | 含义 |
|------|------|
| statDate | 统计日期 |
| channelType | 渠道名称（中文，如"搜索"、"系统推荐"、"直接访问"等） |
| channelTypeRoot | 渠道根分类（用于分组） |
| detailUv | 访问人数 |
| detailUvCycleCrc | 访问人数-环比 |
| tmUv | TM咨询人数 |
| tmUvCycleCrc | TM咨询人数-环比 |
| fbUv | 询盘人数 |
| fbUvCycleCrc | 询盘人数-环比 |
| uvAbRate | 商机转化率 |
| uvAbRateCycleCrc | 商机转化率-环比 |

主要渠道类型：搜索、系统推荐、会场、询盘、信保、站内收藏、直接访问、店内、站外、其他，以及各营销频道（Saving spotlight、Weekly Deals、Top-Ranking Products/Suppliers、New Arrival等）。

---

## BUYER_DISTRIBUTION_DATA - 买家分布数据

返回类型：对象，包含三个维度的买家地区分布列表

| 字段 | 含义 |
|------|------|
| impsCnt | 曝光买家地区分布（Top10） |
| clickCnt | 进店买家地区分布（Top10） |
| businessLeadsCnt | 询单买家地区分布（Top10） |
| 各列表[].region | 国家/地区名称 |
| 各列表[].cnt | 对应数量 |

---

## data-advisor-shop-region - 地域分布查询参数

**`dimensionType` 取值说明：**

| 用户问的场景 | dimensionType 值 |
|:---|:---|
| 搜索曝光的国家/大洲分布 | `comp_imps_cnt` |
| 搜索点击的国家/大洲分布 | `comp_clk_cnt` |
| 访客的国家/大洲分布 | `shop_uv` |
| TM咨询的国家/大洲分布 | `comp_atm_uv` |
| 全站曝光的国家/大洲分布 | `total_imps_cnt` |
| 全站点击的国家/大洲分布 | `total_clk_cnt` |
| 全站商机的国家/大洲分布 | `total_bus_cnt` |
| 询盘人数的国家/大洲分布 | `comp_fb_uv` |
| 询盘个数的国家/大洲分布 | `comp_fb_cnt` |
| 半托管曝光的国家/大洲分布 | `semi_mgt_imps_cnt` |

**`terminalType` 取值说明：** `PC`（PC端）/ `WS`（无线端）/ `TOTAL`（全端，默认推荐）

**返回数据结构：** `returnValue[]` 每项包含：
- `regionName`: 大洲名称
- `countryName`: 国家名称
- `countryUv`: 国家维度数值
- `countryUvRate`: 国家维度占比
- `uv`: 大洲维度数值
- `uvRate`: 大洲维度占比

---

## icbu.advisor.data-advisor-visitor-detail - 访客明细查询

查询店铺的访客列表，提供访客粒度的行为明细数据。

**调用示例：**
```bash
workctl icbu advisor data-advisor-visitor-detail \
  --startDate 2026-05-04 \
  --endDate 2026-05-10 \
  --format json
```

**入参（workctl 扁平参数）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | ✅ | 查询起始时间，格式 yyyy-mm-dd，默认最近7天起始 |
| endDate | string | ✅ | 查询截止时间，格式 yyyy-mm-dd，默认最近7天截止 |
| buyerCountry | string | | 买家国家名称，如 "France"、"Burkina Faso" |
| buyerRegion | string | | 买家大洲名称，如 "Africa"、"Asia"、"Europe"、"Middle East"、"North America"、"Oceania"、"South America" |
| isMcFb | boolean | | 过滤有询盘访客，true 为仅询盘访客 |
| isAtmFb | boolean | | 过滤有TM咨询访客，true 为仅TM访客 |
| hasRemarks | boolean | | 查询有备注的访客 |
| searchKeyword | string | | 按访客偏好关键词搜索 |
| orderBy | string | | 排序列：sortIndex(访客id) / buyerCountry(国家) / visitPv(浏览次数) / staySecond(停留时长) |
| orderModel | string | | 排序方向：asc(升序) / desc(降序) |
| pageNO | number | | 页码，从1开始 |
| pageSize | number | | 每页条数 |
| subMemberSeq | string | | 产品负责人账号id（accountId） |

**返回字段：**

| 字段 | 含义 |
|------|------|
| visitorId | 访客ID |
| buyerCountryId | 买家国家，两位国家编码 |
| visitPv | 浏览次数 |
| staySecond | 停留时长，单位：秒 |
| serKeywords | 全站偏好关键词，逗号分割 |
| levelTag | 买家层级 |
| totalVisitSellerCnt | 浏览供应商数 |
| totalVisitPv | 总浏览量 |
| totalAtmFbCnt | TM咨询数 |
| totalAtmSellerCnt | TM咨询商家数 |
| totalRfqCnt | 发布RFQ数 |
| isVisitHomepage | 是否访问旺铺首页 |
| isVisitProfilePage | 是否访问店铺Profile页 |
| isVisitContactPage | 是否访问店铺沟通页 |
| isMcFb | 是否询盘访客 |
| isAtmFb | 是否TM访客 |
| isAddInquiryCart | 是否加购物车访客 |
| isVisitCertifiedInfo | 是否访问证书访客 |
| totalMcFbCnt | 访客询盘数 |
| isClickPlaceOrder | 是否点击下单 |
| totalMcSellerCnt | 询盘供应商数 |
| logTime | 访问时间 |
| isViewContactInformation | 是否查看联系方式 |
