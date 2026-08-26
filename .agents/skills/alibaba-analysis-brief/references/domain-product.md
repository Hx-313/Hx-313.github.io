# 商品领域字段参考

本文档包含商品相关模块的字段说明，追问商品数据/品类/爆品/热门商品时查阅。

---

## PRODUCT_DATA_OVERVIEW - 商品数据总览

返回类型：对象

**productLayer - 产品分层**（列表）

| 字段 | 含义 |
|------|------|
| stageCode | 产品层级：`PLATFORM_SUPER`=平台爆品，`PLATFORM_GOOD`=平台优品，`POTENTIAL`=潜力优品，`NORMAL`=普通品，`LOW_QUALITY`=低质品 |
| prodCnt | 该层级商品数量 |
| prodCntRatio | 店铺该层级商品占比 |
| cateAvgProdCntRatio | 同行平均该层级商品占比 |
| mainCateAvgProdCntRatio | 同行优秀该层级商品占比 |
| avgDuvCnt30d | 近30天品池品均访问量 |
| avgWideFbUv90d | 近90天品池品TM+询盘人数 |
| avgPbCnt90d | 近90天品池品支付人数 |

**top5Category - 产品分类Top5**（列表）

| 字段 | 含义 |
|------|------|
| type | 产品分类（三级路径） |
| total | 产品数 |
| views | 总搜索曝光 |
| clicks | 总搜索点击 |
| visitors | 总访问人数 |
| inquiries | 总询盘数 |
| inquiriesRate | 总询盘率 |

---

## EXPOSURE_TOP10_PRODUCT_DATA - 曝光Top10商品数据

返回类型：列表

| 字段 | 含义 |
|------|------|
| subject | 商品名称 |
| prodImage | 商品主图URL |
| sumProdShowNum | 搜索曝光量 |
| sumProdFbNum | 询盘个数 |
| sumProdFbRate | 询盘率 |
| atmFbUv | TM咨询人数 |
| isShowcase | 是否加入橱窗（Y/N） |

---

## CATEGORY_EXPANSION_SUGGESTION - 品类扩充建议

返回类型：列表

| 字段 | 含义 |
|------|------|
| sceneName | 场景名称（英文） |
| sceneNameCn | 场景名称（中文，即叶子类目） |
| sceneId | 场景ID |
| statDate | 统计日期 |
| top3HotKw | 机会品类热门关键词（前3，竖线分隔） |
| expImgUrl | 展示图片URL |
| needsIndex | 需求指数 |
| needsIndexQoq | 需求指数-环比 |
| needsIndexDayList | 需求指数-每日数据（格式：日期:值\|日期:值） |
| supplyIndex | 供给指数 |
| supplyIndexQoq | 供给指数-环比 |
| supplyIndexDayList | 供给指数-每日数据 |
| cateLv1Id / cateLv2Id / cateLv3Id / cateLeafId | 类目ID（一级/二级/三级/叶子） |
| cateLeafDesc | 叶子类目名称（英文） |
| cateLeafCnDesc | 叶子类目名称（中文） |

---

## HOT_PRODUCT_RECOMMEND - 热门商品推荐

返回类型：列表（按场景分组）

| 字段 | 含义 |
|------|------|
| sceneId | 场景ID |
| sceneNameCn | 场景名称（中文） |
| hotProductList | 该场景下的热门商品列表 |
| hotProductList[].prodName | 商品名称 |
| hotProductList[].prodImage | 商品图片URL |
| hotProductList[].priceRange | 商品价格范围（如"4.68~4.98"，单位USD） |
| hotProductList[].statDate | 统计日期 |

---

## BULLET_PRODUCT_RECOMMEND - 爆品定招推荐

返回类型：列表

| 字段 | 含义 |
|------|------|
| topicId | 话题ID |
| topicName | 话题名称（中文） |
| priceTo | 最高价格（USD） |
| topicExpImgUrl | 话题展示图片URL |
