# 店铺商品效果数据 — `data_advisor_shop_product`

> 本文件为 `data_advisor_shop_product` 工具的调用参数和返回字段说明，供追问下钻时阅读。

## 调用参数

### 核心参数

> ⚠️ 排序方向参数名是 **`orderModel`**（不是 ~~orderType~~），排序字段参数名是 **`orderBy`**（取值必须从下方"orderBy 常用取值"中选择，不可自拟值如 ~~exposure~~ 等）。

| 参数 | 必填 | 说明 | 示例 |
|:---|:---:|:---|:---|
| `statisticsType` | 是 | 时间周期：`day`(自然日) / `week`(自然周) / `month`(自然月) | `"day"` |
| `statDate` | 是 | 查询日期（yyyy-MM-dd），近90天内。day=具体日期；week 时忽略；month=当月1号 | `"2026-04-01"` |
| `orderBy` | 否 | 排序字段，默认按曝光排序。**取值见下方"orderBy 常用取值"** | `"views"` |
| `orderModel` | 否 | 排序方向：`"ASC"` / `"DESC"`，默认 `"DESC"` | `"DESC"` |
| `pageNo` / `pageSize` | 否 | 分页，默认第1页20条，最大500 | `1` / `20` |
| `prodLevel` | 否 | 商品分层筛选：`爆品` / `优品` / `潜力优品` / `普通品` / `低质品`，置空则不筛选 | `"爆品"` |
| `productName` | 否 | 产品名称或产品 ID 搜索 | `"LED light"` |

### 筛选参数（值为 `"Y"` 启用，置空则不筛选）

| 参数 | 筛选维度 |
|:---|:---|
| `p4pProd` | P4P/外贸直通车商品 |
| `wendingProd` | 问鼎商品 |
| `intlBwProd` | 顶展商品 |
| `winProd` | 橱窗商品 |
| `tradeProd` | 交易品 |
| `bizProd` | 商机品 |
| `semiMgtProd` | 半托管商品 |
| `starMkProd` | 星等级营销商品 |
| `directProd` | 行业定向商品 |
| `videoProd` | 视频商品 |
| `hasEffect` | 有效果商品 |

### 区间筛选参数（整数，成对使用）

- `minViews` / `maxViews`：搜索曝光范围
- `minClicks` / `maxClicks`：搜索点击范围
- `minInquiries` / `maxInquiries`：询盘范围
- `minClickRate` / `maxClickRate`：点击率百分数范围（如查点击率>12%，传 `minClickRate: 12`）

### `orderBy` 常用取值

`views`(搜索曝光) / `clicks`(搜索点击) / `clicksRates`(搜索点击率) / `visitors`(访问人数) / `inquiries`(询盘个数) / `atmFbUv`(TM咨询人数) / `crtOrd`(起草订单数) / `rtsOnlineAmt`(信保实收金额) / `totalClkCnt`(全店点击) / `totalImpsCnt`(全店曝光) / `qztImpsCnt`(全站推曝光) / `p4pImpsCnt`(标准推广曝光) / `adClkCnt`(营销点击) / `addCartCnt`(加购次数) / `fav`(收藏人数)

### workctl CLI 调用示例

```bash
workctl icbu advisor data-advisor-shop-product --statisticsType day --statDate 2026-05-04 --orderBy views --format json
```

### 适用场景（日期基于步骤 0 输出）

- 用户问"哪些商品曝光最高" → `workctl icbu advisor data-advisor-shop-product --statisticsType day --statDate <yesterday> --orderBy views --orderModel DESC --format json`
- 用户问"爆品表现如何" → `workctl icbu advisor data-advisor-shop-product --statisticsType day --statDate <yesterday> --prodLevel 爆品 --format json`
- 用户问"P4P 商品效果" → `workctl icbu advisor data-advisor-shop-product --statisticsType day --statDate <yesterday> --p4pProd Y --orderBy p4pClkCnt --format json`
- 用户问"低质品有哪些" → `workctl icbu advisor data-advisor-shop-product --statisticsType day --statDate <yesterday> --prodLevel 低质品 --format json`
- 用户问"点击率低于5%的商品" → `workctl icbu advisor data-advisor-shop-product --statisticsType day --statDate <yesterday> --maxClickRate 5 --format json`
- 用户问"本月商品效果" → `workctl icbu advisor data-advisor-shop-product --statisticsType month --statDate <当月1号> --format json`

---

## 返回字段映射

## 商品基础信息

| 返回字段 | 指标描述 | 备注 |
|:---|:---|:---|
| `id` | 商品 ID | 唯一标识 |
| `subject` | 商品标题 | — |
| `prodLevel3` | 商品层级 | 可选值：爆品、优品、潜力优品、普通品、低质品 |
| `firstName` | 员工名 | 商品负责人 |
| `lastName` | 员工姓 | 商品负责人 |
| `fullName` | 员工名称 | 商品负责人全名 |

## 商品属性标记

| 返回字段 | 指标描述 | 取值 |
|:---|:---|:---|
| `isP4pProd` | 是否为 P4P/外贸直通车商品 | Y / N |
| `isWending` | 是否为问鼎商品 | Y / N |
| `isIntlbw` | 是否为顶展/顶级展位商品 | Y / N |
| `isShowcase` | 是否为橱窗商品 | Y / N |
| `isReady2ship` | 商品交易属性 | Y=交易品, N=商机品 |
| `isSemiMgtProd` | 是否为半托管商品 | Y / N |
| `isStarMkProd` | 是否为星等级营销商品 | Y / N |
| `isDirectProdStrategy` | 是否为行业定向/行业定招商品 | Y / N |

## 搜索效果指标

| 返回字段 | 指标描述 | 同环比字段 |
|:---|:---|:---|
| `sumProdShowNum` | 搜索曝光次数 | `sumProdShowNumCoc` |
| `sumProdClickNum` | 搜索点击次数 | `sumProdClickNumCoc` |
| `sumProdClickRate` | 搜索点击率 | — |
| `sumProdVisitorCnt` | 商品访问人数 | `sumProdVisitorCntCoc` |
| `sumProdFbNum` | 询盘个数 | — |
| `sumProdFbRate` | 询盘率 | — |

## 互动与转化指标

| 返回字段 | 指标描述 |
|:---|:---|
| `mcFbUv` | 询盘人数 |
| `atmFbUv` | TM 咨询人数 |
| `crtOrd` | 订单提交数（起草订单数） |
| `rtsOnlineAmt` | 信保实收金额（单位：美元） |
| `byrCntOnlineRts` | RTS 线上买家数 |
| `fav` | 收藏人数 |
| `share` | 分享人数 |
| `cmp` | 对比人数 |
| `addCartCnt` | 加购次数 |
| `addCartByrCnt` | 加购买家数 |

## 营销推广指标

| 返回字段 | 指标描述 |
|:---|:---|
| `totalImpsCnt` | 全店曝光次数 |
| `totalClkCnt` | 全店点击次数 |
| `adImpsCnt` | 营销曝光次数 |
| `adClkCnt` | 营销点击次数 |
| `p4pImpsCnt` | 标准推广曝光次数 |
| `p4pClkCnt` | 标准推广点击次数 |
| `qztImpsCnt` | 全站推曝光次数 |
| `qztClkCnt` | 全站推点击次数 |

## 近30天汇总

| 返回字段 | 指标描述 |
|:---|:---|
| `abCnt30d` | 近30天商机数 |

## 分页信息

| 返回字段 | 指标描述 |
|:---|:---|
| `recordCount` | 商品数量（总记录数） |
| `downloadUrl` | 下载链接 |

## 输出建议

- 商品效果数据以表格形式展示，按用户关注的排序维度排列
- 每个商品标注层级标签（爆品/优品/普通品等）和推广属性（P4P/问鼎/橱窗等）
- 搜索效果指标附带同环比变化（`*Coc` 字段），用状态灯标注趋势
- 信保实收金额以美元为单位展示
