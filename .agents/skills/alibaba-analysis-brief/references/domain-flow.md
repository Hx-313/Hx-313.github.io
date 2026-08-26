# 流量参谋字段参考

本文档包含4个流量参谋工具的入参和返回字段说明。**仅当用户追问流量相关问题时查阅**，非流量问题不调用这些工具。

---

## icbu.advisor.data-advisor-shop-channel - 流量来源

查询店铺的流量来源数据，按渠道展示各流量来源的占比和趋势。

**调用示例：**
```bash
workctl icbu advisor data-advisor-shop-channel \
  --startDate 2026-05-05 \
  --endDate 2026-05-11 \
  --terminalType TOTAL \
  --format json
```

**入参（workctl 扁平参数）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | ✅ | 开始日期，`yyyy-MM-dd` |
| endDate | string | ✅ | 结束日期，`yyyy-MM-dd` |
| statisticsType | string | | 时间周期：`day`（日）/ `week`（周）/ `month`（月） |
| terminalType | string | | 终端类型：`PC` / `WS`（无线端）/ `TOTAL`（全部） |

**返回字段：**

| 字段 | 含义 |
|------|------|
| statDate | 统计时间 |
| channelType | 渠道类型 |
| detailUv | 店铺访问人数 |
| fbUv | 询盘人数 |
| tmUv | TM人数 |
| uvAbRate | 商机转化率 |
| statisticsType | 统计周期 |

---

## icbu.advisor.data-advisor-shop-flow - 流量拆分（流量详情）

查询店铺的流量详情数据，按流量类型和子流量类型拆分展示。

**调用示例：**
```bash
workctl icbu advisor data-advisor-shop-flow \
  --startDate 2026-05-05 \
  --endDate 2026-05-11 \
  --terminalType TOTAL \
  --format json
```

**入参（workctl 扁平参数）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | ✅ | 开始日期，`yyyy-MM-dd` |
| endDate | string | ✅ | 结束日期，`yyyy-MM-dd` |
| terminalType | string | | 终端类型：`PC` / `APP` / `WAP` / `TOTAL`（全部） |

**返回字段：**

| 字段 | 含义 |
|------|------|
| statDate | 统计时间 |
| sourceType | 流量类型 |
| subSourceType | 子流量类型 |
| uv | 店铺访问人数 |
| abRate | 商机转化率 |
| cateTopUvDetail | 行业优秀访问人数 |
| cateTopAbRate | 行业优秀商机转化率 |

---

## icbu.advisor.data-advisor-shop-flow-profile - 流量画像

查询店铺的流量画像数据，包含买家地域偏好、类目偏好、渠道场景偏好。

**调用示例：**
```bash
workctl icbu advisor data-advisor-shop-flow-profile \
  --startDate 2026-05-05 \
  --endDate 2026-05-11 \
  --indexName visitor_country \
  --sourceType total_traffic \
  --terminalType TOTAL \
  --format json
```

**入参（workctl 扁平参数）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | ✅ | 开始日期，`yyyy-MM-dd` |
| endDate | string | ✅ | 结束日期，`yyyy-MM-dd` |
| indexName | string | ✅ | 指标类型（见下方映射表） |
| sourceType | string | | 流量类型（见下方映射表） |
| terminalType | string | | 终端类型：`PC` / `APP` / `WAP` / `TOTAL`（全部） |

**`indexName` 场景映射：**

| 用户问的场景 | indexName 值 |
|:---|:---|
| 流量买家来自哪些国家/地域 | `visitor_country` |
| 流量买家偏好什么类目 | `cate_total` |
| 流量主要通过什么渠道场景来 | `channel_total` |

**`sourceType` 场景映射：**

| 用户问的场景 | sourceType 值 |
|:---|:---|
| 全部/总体流量 | `total_traffic` |
| 搜索流量 | `search_traffic` |
| 场景流量（如系统推荐） | `scenario_traffic` |
| 互动流量（如收藏、分享） | `interaction_traffic` |
| 自然/自增流量 | `increase_traffic` |

**返回字段：**

| 字段 | 含义 |
|------|------|
| indxName | 指标类型（visitor_country / cate_total / channel_total） |
| indxKey | 指标key（国际名称、类目id、渠道名称） |
| indxVal | 指标值（买家规模指数） |
| cateName | 类目名称 |

---

## icbu.advisor.data-advisor-to-product - 流量去向产品

查询店铺的流量去向产品数据，展示哪些产品承接了流量。

**调用示例：**
```bash
workctl icbu advisor data-advisor-to-product \
  --startDate 2026-05-05 \
  --endDate 2026-05-11 \
  --sourceType search_traffic \
  --terminalType TOTAL \
  --format json
```

**入参（workctl 扁平参数）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | ✅ | 开始日期，`yyyy-MM-dd` |
| endDate | string | ✅ | 结束日期，`yyyy-MM-dd` |
| sourceType | string | | 流量类型：`total_traffic` / `search_traffic` / `scenario_traffic` / `interaction_traffic` / `increase_traffic`（映射同上方 shop_flow_profile） |
| terminalType | string | | 终端类型：`PC` / `WS`（无线端）/ `TOTAL`（全部） |

**返回字段：**

| 字段 | 含义 |
|------|------|
| statDate | 统计时间 |
| prodId | 商品id |
| prodName | 商品名称 |
| prodImage | 商品主图 |
| compCnName | 店铺名称 |
| toUvDetail | 流出买家数 |
| toAbuvDetail | 流出AB买家数 |
