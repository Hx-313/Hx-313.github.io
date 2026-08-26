# 站内数据工具速查表（市场参谋 + 产品参谋）

> `aliId`、`accessToken` 由平台自动注入，调用时无需传递，禁止打印 token。
> ⛔ 禁止用旧搜索工具发现命令；命令名已在本文档列全，通过 `workctl icbu product <命令名> ... --format json --output <path>` 调用。
> ⚠️ **workctl 不可用时的 fallback**：workctl 调用失败（command not found / exit 127 / 超时）→ 用 `accio-mcp-cli call <tool_name> --json '{...}' > <output_path>` 替代（tool_name 用下划线）。各命令的 fallback 写法见下方代码块旁注。
> ⛔ 保存结果只用长参数 `--output <path>`，禁止短参数 `-o`。
> ⛔ 禁止 read_file 读取结果文件，直接把 `--output` 路径喂给 `$SCRIPTS_DIR/` 脚本（路径定义见 data-acquisition.md）。
> ⚠️ **workctl 参数格式**：data-advisor 工具使用**平铺参数**（`--cateId <id> --orderBy abCnt`），不支持嵌套 JSON wrapper。`accio-mcp-cli` 仍用 `--json '{"wrapperParam":{...}}'` 嵌套格式作为 fallback。

---

## A. 市场参谋 · 查行业 — data_advisor_industry_cate_rank

站内行业大盘 / 子类目排名（需求强度、增长信号、蓝海度）。

> ⚠️ 本命令**需要数字 `cateId`，不接受品类描述**——先用 C 节 `category-infer` 拿 `cateId`。参数见下方代码块和参数表。

```bash
workctl icbu product data-advisor-industry-cate-rank \
  --cateId 100007073 --orderBy abCnt --orderModel desc --rankType 1 \
  --format json \
  --output industry-cate-rank.json
```

> **fallback**：`accio-mcp-cli call data_advisor_industry_cate_rank --json '{"industryRankQueryParam":{"cateId":100007073,"orderBy":"abCnt","orderModel":"desc","rankType":"1"}}' > industry-cate-rank.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cateId` | number | ✅ | 类目数字 ID（来自 C 节 `category-infer`） |
| `orderBy` | string | 可选 | `abCnt`(市场规模)/`abCntYoy`(规模增速)/`supplyDemandRate`(供需)/`dAbRate`(转化) |
| `orderModel` | string | 可选 | `desc`/`asc` |
| `rankType` | string | 可选 | `1`人气榜 / `2`飙升榜 / `3`蓝海榜 / `4`效果榜 |

- 看大盘增速：再并发一次 `--orderBy abCntYoy`；找蓝海机会：`--rankType 3`。
- ⚠️ 无 `statisticsType`/`order`/`industryDesc`/`countryId` flag（旧契约已废弃）。

**返回（提取交给 `$SCRIPTS_DIR/extract_market.py`）**：行业/子类目排名列表，每项含类目、询盘/GMV/UV 指数、价格区间、供给数、增长信号等。

---

## B. 市场参谋 · 查国家 — data_advisor_industry_country_rank

站内某行业在各国家/地区的需求排名（全景报告「目标国家需求」维度核心）。

> ⚠️ 同 A 节，需要数字 `cateId`（复用 A/C 节的 `cateId`）；**本命令无 `--countryId`**，返回的就是各国排名。

```bash
workctl icbu product data-advisor-industry-country-rank \
  --cateId 100007073 --orderBy abCnt --orderModel desc --rankType 1 \
  --format json \
  --output industry-country-rank.json
```

> **fallback**：`accio-mcp-cli call data_advisor_industry_country_rank --json '{"industryRankQueryParam":{"cateId":100007073,"orderBy":"abCnt","orderModel":"desc","rankType":"1"}}' > industry-country-rank.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cateId` | number | ✅ | 类目数字 ID（来自 C 节 `category-infer`） |
| `orderBy` | string | 可选 | `abCnt`(市场规模)/`abCntYoy`(规模增速)/`supplyDemandRate`(供需)/`dAbRate`(转化) |
| `orderModel` | string | 可选 | `desc`/`asc` |
| `rankType` | string | 可选 | `1`人气榜 / `2`飙升榜 / `3`蓝海榜 / `4`效果榜 |

- 命令直接返回全部国家排名；要看某国就在 `scripts/extract_market.py` 输出里筛，**不传国家 flag**。
- ⚠️ 无 `statisticsType`/`order`/`industryDesc`/`countryId` flag。

**返回（提取交给 `$SCRIPTS_DIR/extract_market.py`）**：国家需求排名列表，每项含国家、询盘/GMV/UV 指数、需求占比、同环比等。脚本自动识别行业排名 or 国家排名格式。

---

## C. 类目预测 — data_advisor_category_infer

```bash
workctl icbu product data-advisor-category-infer --categoryDesc "men's jacket" --format json --output category-infer.json
```

> **fallback**：`accio-mcp-cli call data_advisor_category_infer --json '{"categoryDesc":"men'\''s jacket"}' > category-infer.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `categoryDesc` | string | ✅ | 类目关键词 |

返回：`cateId` `cateDesc` `cateLevel`。检查 `cateDesc` 与用户关键词是否相关，不相关重试 1 次（最多 2 次），仍不相关改用 `product_supplier_search`。

---

## D. 产品参谋 · 商品排行 — data_advisor_product_selection

类目内热门商品排行（TopN/询盘/GMV/价格带）。

```bash
workctl icbu product data-advisor-product-selection \
  --cateId 100007073 --statisticsType 30d --orderBy rec_ord_amt --order desc \
  --format json \
  --output rank_gmv.json
```

> **fallback**：`accio-mcp-cli call data_advisor_product_selection --json '{"productSelectionParam":{"cateId":100007073,"statisticsType":"30d","orderBy":"rec_ord_amt","order":"desc"}}' > rank_gmv.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cateId` | number | ✅ | 类目预测返回 ID |
| `statisticsType` | string | ✅ | `1d`/`7d`/`30d` |
| `orderBy` | string | ✅ | `ab_cnt`(询盘)/`rec_ord_amt`(GMV)/`uv_detail`(UV)/`prepay_ord_cnt`(挂账订单) |
| `order` | string | ✅ | `desc`/`asc` |

可选筛选 flag：`--countryId`(string)、`--moqMin/--moqMax`(number)、`--abCntMin/--abCntMax`(number)、`--uvDetailMin/--uvDetailMax`(number)、`--prepayOrdCntMin/--prepayOrdCntMax`(number)；价格/GMV 上下限 `--moqPriceMin/--moqPriceMax`、`--recOrdAmtMin/--recOrdAmtMax` 传 **JSON object 字符串**（支持 `@file`/`@-`）。

### 只读 fan-out 并发（拿到 cateId 后）

```json
{
  "steps": [
    {"name": "rank_inquiry", "path": "icbu.product.data-advisor-product-selection", "params": {"productSelectionParam": {"cateId": 100007073, "statisticsType": "30d", "orderBy": "ab_cnt", "order": "desc"}}},
    {"name": "rank_gmv", "path": "icbu.product.data-advisor-product-selection", "params": {"productSelectionParam": {"cateId": 100007073, "statisticsType": "30d", "orderBy": "rec_ord_amt", "order": "desc"}}}
  ]
}
```

```bash
workctl batch call --file rank-batch.json --format json
```

> `batch call` 不支持引用前一步输出；先单独拿 `cateId` 再生成 batch spec。

---

## E. 产品参谋 · 机会发现 — data_advisor_opportunity_discovery

行业内产品机会发现（搜索词级别的供需/趋势信号，全景报告「机会路径」维度核心）。

> ⚠️ 同 A 节，需要数字 `cateId`（复用 A/C 节的 `cateId`）。

```bash
workctl icbu product data-advisor-opportunity-discovery \
  --cateId 100007073 --statCycle 30d --terminalType TOTAL --currentPage 1 --pageSize 20 \
  --format json \
  --output opportunity.json
```

> **fallback**：`accio-mcp-cli call data_advisor_opportunity_discovery --json '{"sceneTermQueryParam":{"cateId":100007073,"statCycle":"30d","terminalType":"TOTAL","currentPage":1,"pageSize":20}}' > opportunity.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cateId` | number | ✅ | 类目数字 ID（来自 C 节 `category-infer`） |
| `statCycle` | string | 可选 | `30d`(近30天) / `90d`(近90天) |
| `terminalType` | string | 可选 | `PC`/`APP`/`WAP`/`TOTAL` |
| `currentPage` | number | 可选 | 页号，从 1 开始 |
| `pageSize` | number | 可选 | 每页条数 |

可选顶层 flag：`--countryId`(string)、`--sceneName`(string)。

- 默认不传 `sceneName` 拿行业下全部机会词；传了则按关键词过滤。
- 可并发：不传 `countryId`（全球）+ 传 Top 国家的 `countryId`（分国对比）。
- 失败/空 → 降级：用维度②热销 TopN + `web_search` 推断机会方向。

**返回**：机会词列表，每项含搜索词、搜索热度、供给数、供需比、增长趋势等。

---

## F. 市场参谋 · 行业大盘 — data_advisor_industry_market_detail

行业级大盘数据（市场规模、增速、转化率、供需比及各指标排名）。比 A 节 `industry_cate_rank` 提供更完整的市场指标体系。

> ⚠️ 需要数字 `cateId`（复用 C 节 `category-infer` 的 `cateId`）。参数见下方代码块和参数表。

```bash
workctl icbu product data-advisor-industry-market-detail \
  --cateId 100007073 \
  --format json \
  --output market-detail.json
```

> **fallback**：`accio-mcp-cli call data_advisor_industry_market_detail --json '{"cateId":100007073}' > market-detail.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cateId` | number | ✅ | 类目数字 ID（来自 C 节 `category-infer`） |

**返回（提取交给 `$SCRIPTS_DIR/extract_market_detail.py`）**：行业大盘指标，含 `abCnt`(市场规模)、`abCntYoy`(增速)、`supplyDemandRate`(供需)、`dAbRate`(转化率)、各指标排名(`abCntCrank`/`abCntYoyCrank`/`supplyDemandRateCrank`/`dAbRateCrank`)、`cateLevel`、`statDate`。

---

## G. 市场参谋 · 行业趋势 — data_advisor_industry_market_trend

行业级时间序列趋势数据（市场规模/增速/转化率/供需比随时间变化）。

> ⚠️ 同 F 节，需要数字 `cateId`。

```bash
workctl icbu product data-advisor-industry-market-trend \
  --cateId 100007073 \
  --format json \
  --output market-trend.json
```

> **fallback**：`accio-mcp-cli call data_advisor_industry_market_trend --json '{"cateId":100007073}' > market-trend.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cateId` | number | ✅ | 类目数字 ID（来自 C 节 `category-infer`） |

**返回**：时间序列列表，每项含 `abCnt`(市场规模)、`abCntYoy`(增速)、`supplyDemandRate`(供需比)、`dAbRate`(转化率)、`statDate`(统计时间)。

---

## H. 市场参谋 · 卖家画像 — data_advisor_industry_seller_portrait

行业卖家竞争画像（星级分布、询盘/GMV 档位、品类集中度、RTS 占比）。

> ⚠️ 同 A 节，需要数字 `cateId`。

```bash
workctl icbu product data-advisor-industry-seller-portrait \
  --cateId 100007073 \
  --format json \
  --output seller-portrait.json
```

> **fallback**：`accio-mcp-cli call data_advisor_industry_seller_portrait --json '{"cateId":100007073}' > seller-portrait.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cateId` | number | ✅ | 类目数字 ID（来自 C 节 `category-infer`） |

**返回（提取交给 `$SCRIPTS_DIR/extract_seller.py`）**：卖家画像比例数据，含：
- 品类集中度：`leaf1-4CateDesc` + `leaf1-4TotalProdCntRatio`（Top4 叶子类目卖家数占比）
- 商品类型：`rtsProdCntRatio`(RTS 占比) / `nonRtsProdCntRatio` / `norMcProdCntRatio`(无规格) / `stdMcProdCntRatio`(有规格)
- 星级分布：`star0-3CompCntRatio`（0-3 星商家占比）
- 询盘档位：`fb0-3CompCntRatio`（<500 / 500-1000 / 1000-2000 / 2000+ 年询盘）
- GMV 档位：`rcvd0-3CompCntRatio`（<50w / 50-100w / 100-200w / 200w+ 美元年实收）

---

## I. 市场参谋 · 买家画像 — data_advisor_industry_buyer_profile

行业买家画像（买家类型分布、优质买家占比、平台时段分布）。

> ⚠️ 需要数字 `cateId`。**`indexName` 必填**——决定返回哪种画像维度。

```bash
workctl icbu product data-advisor-industry-buyer-profile \
  --cateId 100007073 --indexName cate_total --nd 30d --terminalType TOTAL \
  --format json \
  --output buyer-profile.json
```

> **fallback**：`accio-mcp-cli call data_advisor_industry_buyer_profile --json '{"industryPortraitQueryParam":{"cateId":100007073,"indexName":"cate_total","nd":"30d","terminalType":"TOTAL"}}' > buyer-profile.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cateId` | number | ✅ | 类目数字 ID（来自 C 节 `category-infer`） |
| `indexName` | string | ✅ | `cate_total`(偏好类目) / `visitor_country`(访客国家) / `buyers_identity`(买家身份画像) |
| `nd` | string | 可选 | `7d` / `30d`(默认) / `90d` |
| `prodAction` | string | 可选 | `visit`(访问买家) / `fb`(询盘买家) / `trd`(交易买家) |
| `terminalType` | string | 可选 | `APP` / `WAP` / `PC` / `TOTAL`(默认) |

- 默认用 `indexName=cate_total` 拿偏好类目画像；如需访客国家分布用 `visitor_country`；买家身份画像用 `buyers_identity`。
- 可并发多种 `indexName`（`workctl batch call`）。

**返回（提取交给 `$SCRIPTS_DIR/extract_buyer.py`）**：买家画像指标列表，每项含 `cateName`、`indxKey`(指标 key)、`indxName`(指标类型)、`indxVal`(买家数)、`highQualityIndxValue`(优质买家数)、`indxValRate`(环比)、`extraInfo`(平台时段分布)。

---

## J. 市场参谋 · 买家渠道偏好 — data_advisor_industry_buyer_channel

行业买家渠道偏好画像。

> ⚠️ 需要数字 `cateId`。**`indexName` 必填**——固定为 `channel_total`。

```bash
workctl icbu product data-advisor-industry-buyer-channel \
  --cateId 100007073 --indexName channel_total --nd 30d --terminalType TOTAL \
  --format json \
  --output buyer-channel.json
```

> **fallback**：`accio-mcp-cli call data_advisor_industry_buyer_channel --json '{"industryPortraitQueryParam":{"cateId":100007073,"indexName":"channel_total","nd":"30d","terminalType":"TOTAL"}}' > buyer-channel.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cateId` | number | ✅ | 类目数字 ID（来自 C 节 `category-infer`） |
| `indexName` | string | ✅ | 固定 `channel_total`（买家渠道偏好） |
| `nd` | string | 可选 | `7d` / `30d`(默认) / `90d` |
| `prodAction` | string | 可选 | `visit`(访问买家) / `fb`(询盘买家) / `trd`(交易买家) |
| `terminalType` | string | 可选 | `APP` / `WAP` / `PC` / `TOTAL`(默认) |

**返回**：买家渠道偏好指标列表（结构同 I 节，`indxKey` 为渠道名称如 PC/APP/WAP）。

---

## K. 市场参谋 · 人群洞察 — data_advisor_industry_crowd_insight

行业人群洞察（买家人群分布及环比，按国家/品类等维度）。

> ⚠️ 同 A 节，需要数字 `cateId`。

```bash
workctl icbu product data-advisor-industry-crowd-insight \
  --industryId 100007073 --nd 30d \
  --format json \
  --output crowd-insight.json
```

> **fallback**：`accio-mcp-cli call data_advisor_industry_crowd_insight --json '{"crowdInsightQueryParam":{"industryId":"100007073","nd":"30d"}}' > crowd-insight.json`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `industryId` | string | ✅ | 类目 ID 的**字符串**形式（来自 C 节 `category-infer`） |
| `nd` | string | 可选 | `7d` / `30d`(默认) / `90d` |

**返回（提取交给 `$SCRIPTS_DIR/extract_buyer.py`）**：人群指标列表，每项含 `cateEnName`、`cateCnName`、`idxKey`、`idxType`(指标类型)、`idxValue`(买家数)、`idxRate`(环比)。

---

## 降级路径（市场参谋命令不可用时）

当 A/B 命令返回"命令不存在/未发布/调用失败"（自动重试 1 次仍失败）：

1. **行业大盘维度**：改用 `data_advisor_category_infer` → `data_advisor_product_selection`（站内商品排行近似行业热度 + 价格带）+ `web_search`（"<品类> market size / global market 2026"）补市场规模与增长。
2. **国家需求维度**：改用 `data_advisor_product_selection --countryId <国家>` 分国家拉排行近似需求；规格款式/文化/季节背景用 `web_search` 补。
3. 报告数据来源摘要标注："⚠️ 行业/国家大盘命令暂不可用，本报告基于站内商品排行 + 公开来源估算"。
4. **禁止编造行业/国家排名数字**——拿不到就写 `-` 或改用文字定性描述。

当 F-K 命令（market_detail / market_trend / seller_portrait / buyer_profile / buyer_channel / crowd_insight）调用失败（重试 1 次仍失败）：

5. **F/G（大盘/趋势）**：降级到 A 节 `industry_cate_rank`（仍有子类目排名数据）+ `web_search` 宏观结论。
6. **H（卖家画像）**：§2 竞争格局仅用 D 节 `product_selection` 商品排行 + `web_search` 定性描述竞争强度，省略卖家侧画像段落。
7. **I/J/K（买家画像/渠道/人群）**：§4 买家画像降级为 `web_search` 定性推断（现有降级路径），标注 🟠 AI 推断。
