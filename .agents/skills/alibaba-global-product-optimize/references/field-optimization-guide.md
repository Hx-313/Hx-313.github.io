# 字段优化指南

本文件定义了各字段的 CSV 列映射、数据格式说明和优化优先级。所有字段的详细优化规则（格式要求、调整策略、联动规则等）均由后端批量优化工具（`create_ggs_batch_optimize_main_task` + `submit_ggs_batch_optimize_detail` + `query_ggs_batch_optimize_result`）内部实现，Agent 无需了解具体优化逻辑。

---

## 字段列表

| 字段                      | CSV 列（before → after） | actions field | 支持的策略 |
|-------------------------|--------------------------|---------------|------------|
| Title（标题）               | `before.title` → `after.title` | `TITLE` | AI_SUGGEST, USER_PROMPT |
| Price（价格）               | `before.price` → `after.price` | `PRICE` | AI_SUGGEST, USER_PROMPT |
| Lead Time（交期）           | `before.leadTime` → `after.leadTime` | `LEAD_TIME` | AI_SUGGEST, USER_PROMPT |
| MOQ（最小起订量）              | `before.moq` → `after.moq` | `MOQ` | AI_SUGGEST, USER_PROMPT |
| Unit Weight（单位重量）       | `before.unitWeight` → `after.unitWeight` | `WEIGHT` | AI_SUGGEST, USER_PROMPT |
| Unit Size（单位尺寸）         | `before.unitSize` → `after.unitSize` | `DIMENSION` | AI_SUGGEST, USER_PROMPT |
| Shipping Template（运费模板） | `before.shippingTemplate` → `after.shippingTemplate` | `LOGISTICS_TEMPLATE` | AI_SUGGEST, USER_PROMPT |
| Category（类目）            | `before.category` → `after.category` | `CATEGORY` | AI_SUGGEST, USER_PROMPT |
| Description（详描）         | `before.description` → `after.description` | `DESCRIPTION` | AI_SUGGEST, USER_PROMPT |
| Properties（属性）          | `before.properties` → `after.properties` | `CPV` | AI_SUGGEST, USER_PROMPT |
| Images（图片）              | `before.images` → `after.images` | `IMAGE` | **⚠️ 不通过批量优化工具处理**，通过 Sub Agent 唤起 `ggs-image-generation` Skill 执行。默认使用「一键智能优化」能力。优化图片→替换原列表；生成图片→追加到原列表末尾 |
| Inventory（发货地与库存）       | `before.inventory` → `after.inventory` | `INVENTORY` | AI_SUGGEST, USER_PROMPT |
| Unit Size（单位尺寸）         | `before.unitSize` → `after.unitSize` | `UNIT_SIZE` | **仅 USER_PROMPT**（暂不支持 AI_SUGGEST） |
| Keywords（关键词）           | `before.keywords` → `after.keywords` | `KEYWORD` | AI_SUGGEST, USER_PROMPT |
| Translate（翻译优化）         | 作用于 `title`、`description` 等文本字段 | `TRANSLATE` | AI_SUGGEST, USER_PROMPT |
| Price Exchange（价格汇率换算）  | 作用于 `price` 字段 | `PRICE_EXCHANGE` | AI_SUGGEST, USER_PROMPT |

> **注意**：所有字段均支持 `AI_SUGGEST` 和 `USER_PROMPT` 两种策略。当用户未给出具体修改指令时，默认使用 `AI_SUGGEST`；当用户给出具体指令时，使用 `USER_PROMPT`。

---

## 数据格式说明

### Price（价格）

`before.price` 和 `after.price` 均为 JSON 字符串，包含 `priceType`、`currency` 和对应的价格数据。支持四种价格类型：

- **fixed**（固定价）：`{"priceType":"fixed","currency":"USD","price":10.0}`
- **range**（区间价）：`{"priceType":"range","currency":"USD","minPrice":5.0,"maxPrice":20.0}`
- **ladder**（阶梯价）：`{"priceType":"ladder","currency":"USD","ladderPrices":[{"minQuantity":1,"price":10.0},{"minQuantity":100,"price":8.0}]}`
- **sku**（SKU价）：`{"priceType":"sku","currency":"USD","skuPrices":[{"skuId":123,"skuName":"Red, XL","price":12.0,"saleAttributes":[...]}]}`

> **⚠️ 格式一致性**：`after.price` 必须与 `before.price` 的数据结构保持一致（相同的 `priceType`），禁止写成简单的数字字符串。

### AI_SUGGEST 价格调整规则

AI_SUGGEST 策略优化价格时，后端返回的是一个**建议最大价格值 x**（即商品最高档位价格不应超过此值）。Agent 拿到建议值后，需要根据商品当前的 `priceType`，按以下规则调整 `after.price`。

#### 价格类型约束

| 价格类型 | 数学约束 |
|----------|----------|
| 区间价(range) | `0 < minPrice <= maxPrice` |
| 阶梯价(ladder) | 起批量 Q1<Q2<Q3 时，单价必须严格递减 P1>P2>P3>0 |
| SKU价(sku) | 每个 SKU 价格 > 0 |
| 固定价(fixed) | 价格 > 0 |

#### 判断基准

- **区间价**：取 `maxPrice`
- **阶梯价**：取第一阶梯价格（最小起批量对应的最高单价）
- **SKU价**：取所有 SKU 价格中的最大值
- **固定价**：取当前价格

当基准价 > 建议值 x 时，触发降价。

#### 策略A：等比例缩放（默认策略，保持价格体系内部结构）

| 价格类型 | 降价比例 | 调整后价格 |
|----------|----------|------------|
| 区间价 | R = x / maxPrice | maxPrice' = x，minPrice' = minPrice × R |
| 阶梯价 | R = x / P1 | P1' = x，后续各阶梯 Pi' = Pi × R（同乘正数R，保持严格递减） |
| SKU价 | R = x / max(Psku) | 所有 SKU 价格 Pi' = Pi × R |
| 固定价 | — | 直接设为 x |

#### 策略B：截断保留（仅压低超标价格，低于阈值的保持不变）

| 价格类型 | 调整逻辑 |
|----------|----------|
| 区间价 | maxPrice' = x；minPrice' = min(原minPrice, x) |
| 阶梯价 | P1' = x；从第二阶梯起，若 Pi >= Pi-1'（违规）则 Pi' = Pi × (x/P1) 等比例降价，若 Pi < Pi-1' 则保留原价 |
| SKU价 | 逐个判断，超过 x 的设为 x，未超过的保持不变 |
| 固定价 | 直接设为 x |

#### 强制设值与按比例调价

当用户指令为强制设值或按比例调价时：

- **强制设值 y**：区间价抹平为 [y, y]；阶梯价第一阶梯设为 y，后续按原比例 R=y/P1 缩放；SKU价全部设为 y
- **按比例调价 a%**：调整系数 K = 1+a%（上调）或 K = 1-a%（下调），所有价格乘以 K

#### 精度与边界处理

- 所有价格保留两位小数（四舍五入）
- 阶梯价四舍五入后若出现相邻阶梯价格相等，强制将后一阶梯减去 0.01 以确保严格递减
- 任何降价操作后单价不得低于 0.01，低于则取 0.01 作为下限

### Lead Time（交期）

支持两种格式：
- **固定交期**：数字字符串，如 `"7"`
- **阶梯交期**：JSON 数组（`QuantityTieredLeadTime[]`），每项仅含 **`quantity`（数量档）** 和 **`leadTime`（交期天数）**，按数量档升序排列。如 `[{"quantity":1,"leadTime":7},{"quantity":100,"leadTime":12}]`。**禁止**使用 `minQuantity`、`maxQuantity`、`quantityFrom`、`quantityTo`、`leadTimeFrom`、`leadTimeTo` 等已废弃字段名

### MOQ（最小起订量）

正整数字符串，如 `"1"`、`"10"`。

### Unit Weight（单位重量）

数字字符串，单位为 kg，如 `"0.5"`、`"2.0"`。

> **⚠️ 重量值前置拦截**：**重量不能设置为 0**。如果用户要求将重量改为 0kg，**必须拒绝并告知用户重量不能为 0**，建议用户设置一个合理的重量值（如 0.01kg 或根据商品实际情况设置）。

### Properties（属性）

JSON 数组，每个元素包含四个字段：
```json
[
  {"attributeId": 1001, "attributeName": "Material", "attributeValue": "Stainless Steel", "attributeValueId": 2001}
]
```

> **注意**：属性分为**商品属性**（存储在 `before.properties` / `after.properties`）和**销售属性**（嵌套在 SKU 价格的 `saleAttributes` 中）。

### Shipping Template（运费模板）

JSON 对象字符串，包含模板 ID 和名称：`{"id":2099322001,"name":"Smart Template"}`

### Keywords（关键词）

纯文本字符串，多个关键词之间以空格分隔，如 `"electronics gadget wholesale high quality"`。

- **AI_SUGGEST**：后端根据商品标题、类目和属性自动推荐高相关性关键词，补充或替换现有关键词
- **USER_PROMPT**：根据用户指令修改关键词，如"加上 wholesale 关键词"、"把关键词改成 xxx"

> **注意**：关键词直接影响商品在搜索结果中的曝光率，优化时应确保关键词与商品实际内容高度相关，避免堆砌无关关键词。

### Inventory（发货地与库存）

String 类型（JSON 字符串），分为 **SKU 库存**和 **SPU 库存**两种类型。`actions` 中使用 `INVENTORY` 字段，同时覆盖**库存数量**和**发货地**的优化。

#### SKU 库存结构

```json
{
  "type": "sku",
  "skuInventories": [
    {
      "skuId": 12345,
      "items": [
        {"dispatchLocation": "CN", "warehouseCode": "WH001", "quantity": 30}
      ]
    },
    {
      "skuId": 12346,
      "items": [
        {"dispatchLocation": "CN", "warehouseCode": "WH001", "quantity": 70}
      ]
    }
  ]
}
```

#### SPU 库存结构

```json
{
  "type": "spu",
  "items": [
    {"dispatchLocation": "CN", "warehouseCode": "WH001", "quantity": 100},
    {"dispatchLocation": "US", "quantity": 50}
  ]
}
```

#### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | String | 是 | 库存类型：`sku`（按 SKU 管理库存）或 `spu`（按 SPU 整体管理库存） |
| `skuInventories` | Array | 条件必填 | 仅 `type=sku` 时存在。每项含 `skuId`（SKU ID）和 `items`（该 SKU 的库存明细数组） |
| `items` | Array | 是 | 库存明细数组。`type=spu` 时直接在顶层；`type=sku` 时嵌套在每个 skuInventory 内 |
| `dispatchLocation` | String | 是 | 发货地国家/地区代码，如 `"CN"`、`"US"`、`"DE"` |
| `warehouseCode` | String | 否 | 仓库编码，如 `"WH001"`。可选字段 |
| `quantity` | Integer | 是 | 可售库存数量 |

#### 优化策略

- **`AI_SUGGEST`**：后端根据商品信息自动推荐合理的库存配置（发货地、数量等）
- **`USER_PROMPT`**：根据用户指令修改库存或发货地，如"把库存改为 500"、"增加美国发货地"、"删除 US 的发货地"

#### 发货地优化

发货地（`dispatchLocation`）的增删改通过 `INVENTORY` 字段的 `USER_PROMPT` 策略实现：

| 操作 | 本地构造逻辑 |
|------|-------------|
| **添加发货地** | 在 `items` 数组中新增一个 item，设置 `dispatchLocation` 和 `quantity` |
| **删除发货地** | 从 `items` 数组中移除对应 `dispatchLocation` 的 item |
| **修改发货地库存** | 找到对应 `dispatchLocation` 的 item，修改其 `quantity` |

> **⚠️ 注意**：修改发货地时，SKU 类型需要对**每个 SKU** 的 items 都进行相应的增删改操作；SPU 类型只需修改顶层 items 数组。

#### 库存数量约束

- 库存数量必须为**非负整数**
- 每个 SKU/SPU 的库存数量（各发货地 quantity 之和）应 **≥ MOQ**（`product-score-rules.md` 中 `inventory` 扣分项要求）
- **严禁捏造库存数据**：若原始数据无库存，必须保持为空，严禁擅自填充

### Translate（翻译优化）

翻译优化是一种跨字段的优化动作，作用于商品的文本类字段（如 `title`、`description` 等），将其翻译为目标语言。

- **AI_SUGGEST**：后端自动检测商品文本语言，并根据目标市场推荐翻译
- **USER_PROMPT**：用户在 `userPrompt` 中指定目标语言，如"把标题翻译成西班牙语"、"将描述翻译为法语"
- **actions 配置**：`{"field": "TRANSLATE", "strategy": "USER_PROMPT", "value": ""}`

> **注意**：翻译优化由后端统一处理，Agent 只需在 `actions` 中传入 `TRANSLATE` 并在 `userPrompt` 中说明目标语言即可。

### Price Exchange（价格汇率换算）

价格汇率换算用于将商品价格从当前币种转换为目标币种，后端会根据实时汇率自动完成换算。

- **AI_SUGGEST**：后端根据目标市场自动推荐币种并完成汇率换算
- **USER_PROMPT**：用户在 `userPrompt` 中指定目标币种，如"把价格换算成欧元"、"将价格从 USD 转为 GBP"
- **actions 配置**：`{"field": "PRICE_EXCHANGE", "strategy": "USER_PROMPT", "value": ""}`

> **注意**：汇率换算由后端统一处理，换算后的价格会保持原有的 `priceType` 结构不变，仅更新价格数值和 `currency` 字段。

### Images（图片）

JSON 数组，包含图片 URL 列表。`after.images` 必须包含完整的图片列表（优化后的 + 未优化的），不能只写入被优化的图片。

---

## 本地构造 vs 调用优化接口

**核心规则**：
- **`AI_SUGGEST`** → **必须调用批量优化接口**（建议值来自后端模型/算法）
- **`USER_PROMPT`** → 如果是**纯公式/算术计算**，Agent 可**直接在本地构造 `after` 值**写入 CSV，无需调用优化接口；如果需要**语义理解/NLP/AI 生成**，仍需调用优化接口

### 可本地构造的 USER_PROMPT 操作

以下操作为确定性算术或纯字符串变换，Agent 可直接读取 `before.*` 值，本地计算后写入 `after.*`，**跳过批量优化接口调用**：

| 操作 | 对应扣分项 / 场景 | 本地构造逻辑 |
|------|-------------------|-------------|
| **标题首字母大写** | `name_capitalize_first_letter` | 对 `before.title` 每个单词首字母转大写 |
| **标题去重复词** | `title_repeat` | 对 `before.title` 按空格分词 → 去重 → 重新拼接 |
| **关键词去重** | `keyword_repeat` | 对 `before.keywords` 按空格分词 → 去重 |
| **区间价转阶梯价** | `range_price` / 转 RTS | 将 `priceType: range` 转为 `priceType: ladder`，用 minPrice/maxPrice 构造阶梯价数组 |
| **价格按公式调整** | 用户指令（如"降价 10%"） | 按本文「AI_SUGGEST 价格调整规则」中的等比缩放/截断保留公式计算 |
| **交期调整** | `lead_time_exist` / `lead_time` | 修改 `before.leadTime` 数组中对应档位的 `leadTime` 值（如设为 ≤ 7 或 ≤ 30） |
| **MOQ 设值** | 用户指令（如"把 MOQ 改为 2"） | 直接赋值 `after.moq = 用户指定值` |
| **重量设值** | 用户指令（如"把重量改为 0.5kg"） | 直接赋值 `after.unitWeight = 用户指定值` |
| **库存 ≥ MOQ** | `inventory` | 解析 inventory JSON，若各 item 的 quantity < moq 则调整为 moq |
| **物流模板绑定** | `logistics_incomplete` / `shipping_cal` | 先调用 `query_ggs_merchant_shipping_template` 查询已有模板 → 选择合适模板 → 直接写入 `after.shippingTemplate` |

### 必须调用优化接口的操作

以下操作需要语义理解、NLP 生成或平台数据支持，**必须通过批量优化工具执行**：

| 操作 | 原因 |
|------|------|
| 所有 `AI_SUGGEST` 策略的操作 | 建议值来自后端模型/算法 |
| 标题语义优化（补核心词、删不当信息、语义改写） | 需要 NLP 理解商品语义 |
| 描述优化 | HTML 富文本改写需要 AI |
| 属性补全 (`attribute_less_or_repeat`) | 需要类目知识库推荐属性 |
| 关键词补充 (`keyword_length` / `keyword_core_less`) | 需要语义分析推荐相关关键词 |
| 图片优化 | 通过 Sub Agent 唤起 `ggs-image-generation` |
| 翻译 (`TRANSLATE`) | 需要翻译模型 |
| 价格汇率换算 (`PRICE_EXCHANGE`) | 需要实时汇率 |
| 卖点属性冲突 (`selling_point_attribute_conflict`) | 需要语义理解 |
| 类目不一致 (`category`) | 需要判断根因 |
| 图文不一致 (`imageText`) | 需要多模态理解 |

> **⚠️ 本地构造注意事项**：
> 1. 本地构造的 `after` 值仍需遵守本文档中的所有校验规则（单向调整性、二次确认规则、格式合理性检测等）
> 2. 本地构造完成后，仍需执行 `execution-protocol.md` 中的四个强制动作（写入 CSV → 查询质量分 → 生成预览文件 → 输出预览）
> 3. 如果一次优化中**既有可本地构造的操作，又有需要调接口的操作**，可以先本地构造确定性部分，再调接口处理 AI 部分，最后统一写入 CSV

---

## 字段优化优先级

当用户未明确指定优化哪些字段时，按以下优先级推荐：

| 优先级 | 字段 | 原因 |
|--------|------|------|
| **P0** | Title（标题）、Price（价格） | 直接影响搜索排名、点击率和转化率 |
| **P1** | Images（图片）、MOQ、Lead Time（交期） | 影响质量分（详见 `product-score-rules.md`）、买家试单意愿和决策速度 |
| **P2** | Description（详描）、Properties（属性） | 影响质量分（详见 `product-score-rules.md`）和买家信任度 |
| **P3** | Keywords（关键词）、Unit Weight / Unit Size / Shipping Template / Inventory / Category | 影响搜索曝光、运费估算和信息完整度 |

---

## ⚠️ 字段单向调整性（AI_SUGGEST 场景）

在 AI_SUGGEST 策略下，以下字段遵循**单向优化原则**，Agent 必须执行负向拦截校验：

| 字段 | 优化方向 | 说明 |
|------|----------|------|
| **Price（价格）** | **只降不升** | 除非用户显式要求提价，否则价格只能降低。若 AI 建议值 ≥ 当前值，禁止写入 `after` 列 |
| **MOQ（最小起订量）** | **只降不升** | 提升价格力通常意味着降低起订门槛。若 AI 建议值 ≥ 当前值，禁止写入 `after` 列 |
| **Lead Time（交期）** | **只缩短不延长** | 提升服务力意味着缩短交期。若 AI 建议值 ≥ 当前值，禁止写入 `after` 列 |

> **⚠️ 负向拦截强制要求**：Agent 在写入 `after` 列前，**必须**对比 `before` 与 AI 建议值。若建议值比当前值更差（价格更高、MOQ 更大、交期更长），**严禁写入 `after` 列**，且必须在预览中告知用户"当前值优于 AI 建议值，无需调整"。

---

## ⚠️ 用户指令二次确认规则

当用户通过 `USER_PROMPT` 方式指定修改值时，Agent **必须**在写入 `after` 列前进行合理性校验。如果检测到以下情况，**必须反问用户进行二次确认**，不能直接执行：

### 差异过大检测

| 字段 | 检测规则 | 示例 |
|------|----------|------|
| **价格** | 修改值与当前值差异超过 50%（绝对值或百分比） | 当前价格 $10，用户要求改为 $50（差异 400%） |
| **MOQ** | 修改值与当前值差异超过 10 倍 | 当前 MOQ 1，用户要求改为 100（差异 100 倍） |
| **交期** | 修改值与当前值差异超过 30 天 | 当前交期 7 天，用户要求改为 45 天（差异 38 天） |
| **重量** | 修改值与当前值差异超过 10 倍 | 当前重量 0.5kg，用户要求改为 10kg（差异 20 倍） |

### 格式合理性检测

| 字段 | 格式要求 | 不合理示例 |
|------|----------|------------|
| **价格** | 最多两位小数 | `10.123`（三位小数） |
| **重量** | 最多两位小数 | `0.123`（三位小数） |
| **MOQ** | 必须为正整数 | `1.5`（小数）、`-1`（负数）、`0`（零） |
| **交期** | 必须为正整数 | `7.5`（小数）、`-1`（负数）、`0`（零） |

### 商品匹配度检测

| 场景 | 检测规则 | 示例 |
|------|----------|------|
| **重量与商品类型不匹配** | 根据商品标题、类目判断重量是否合理 | 手机类目商品重量 50kg（明显不合理） |
| **价格与商品类型不匹配** | 根据商品标题、类目判断价格是否合理 | 手机类目商品价格 $0.01（明显不合理） |
| **MOQ 与商品类型不匹配** | 根据商品标题、类目判断 MOQ 是否合理 | 定制类商品 MOQ 1（可能不合理） |

### 二次确认话术示例

```
检测到您要求将价格从 $10 改为 $50，差异较大（400%）。请确认是否确实需要修改为 $50？

检测到您要求将 MOQ 改为 1.5，但 MOQ 必须为正整数。请确认正确的 MOQ 值？

检测到您要求将重量改为 50kg，但根据商品标题"手机"，这个重量似乎不合理。请确认正确的重量值？
```

> **⚠️ 强制要求**：Agent 在检测到上述情况时，**必须**先向用户确认，得到用户明确回复后才能执行修改。不能直接写入 `after` 列。

---

## 综合场景指令拆解

当用户发出以下预设指令时，Agent 需要将综合指令**拆解为具体的圈品条件 + 原子优化项**，按 Step 1 → Step 2 的流程依次执行。如果用户在指令中**额外指定了圈品条件**（如"帮我把 3C 品类的商品转交易品"），则以用户指定的圈品条件为准；如果用户**未指定圈品条件**，则使用下表中的默认圈品条件。

| 指令关键词                  | 默认圈品条件（用户未指定时） | 优化项（原子能力拆解）                                                                                                                                                                                                                             |
|------------------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **转交易品（RTS）**          | 圈选「GGS商品质量信息完整度缺乏」的商品 | ① 区间价转阶梯价（`USER_PROMPT`）② 交期第一阶梯的 quantity 必须 ≥ MOQ，不满足则调整（`USER_PROMPT`）③ 交期第一阶梯对应的天数必须 < 30 天，不满足则调整，已满足不修改（`USER_PROMPT`）④ 先调用 `query_ggs_merchant_shipping_template` 查询用户已有物流模板，然后告知用户选一个物流模板，用户选择后写入 `after.shippingTemplate` ⑤ 根据商品信息设置合适的重量（`USER_PROMPT`）⑥ MOQ（`AI_SUGGEST`） |
| **提升商品质量分** / **商品分层** | 圈选质量分小于 5 分的商品 | ① 图片（通过 Sub Agent 唤起 `ggs-image-generation`，详见下方图片优化详细规则）② 标题（`USER_PROMPT`）③ 详描（`USER_PROMPT`）④ CPV/属性（`AI_SUGGEST` + `USER_PROMPT`）⑤ 价格（`AI_SUGGEST`）⑥ MOQ（`AI_SUGGEST`）⑦ 重量（`AI_SUGGEST`）⑧ 交期（`AI_SUGGEST`）                          |
| **提升商品价格力**            | 圈选「GGS商品价格力缺乏」的商品 | ① 价格（`AI_SUGGEST`）② MOQ（`AI_SUGGEST`）                                                                                                                                                                                                   |
| **提升商品服务力**            | 圈选「GGS商品服务力缺乏」的商品 | ① 交期（`AI_SUGGEST`）② 重量（`AI_SUGGEST`）③ 体积（`USER_PROMPT`，结合标题、图片、详描、属性等推断）④ 物流模板为空时关联一个（`USER_PROMPT`）⑤ MOQ（`AI_SUGGEST`）                                                                                                                 |
| **提升商品趋势力**            | 圈选「GGS商品趋势力缺乏」的商品 | ① CPV/属性（`AI_SUGGEST`）                                                                                                                                                                                                                  |
| **优化无曝光商品**            | 圈选「近 90 天没有曝光」的商品 | ① 标题（`USER_PROMPT`）② 图片（`AI_SUGGEST`）③ 价格（`AI_SUGGEST`）④ MOQ（`AI_SUGGEST`）                                                                                                                                                              |

> **⚠️ 转交易品（RTS）适用场景说明**：转交易品的指令只需要在用户圈品条件是询盘品的情况下才需要。如果商品本身就已经是交易品了，自然不需要再转成交易品。

> **⚠️ 提升商品质量分说明**：提升商品质量分就是优化基础问题（标题/图片/cpv/详描)、趋势力、价格力、服务力。优化质量分的优先级：**基础问题 > 趋势力+价格力 > 服务力**。详细的质量分评分规则（基础分扣分项、加分项规则、不同国家/地区的评分差异等）请参见 `product-score-rules.md`。

> **⚠️ 提升质量分 — 图片优化详细规则**（通过 Sub Agent 唤起 `ggs-image-generation` Skill 执行）：
> 1. **最低数量要求**：商品图片至少需要 **3 张**。如果当前图片不足 3 张，需通过生图能力补齐至 3 张
> 2. **补齐类型判断**：补齐前先分析现有图片的类型（白底图 / 场景图 / 其他），按需补充缺失类型：
>    - 若现有图片中**没有白底图** → 优先生成 1 张白底图
>    - 若现有图片中**没有场景图** → 优先生成 1 张场景图
>    - 若白底图和场景图都已有，则根据商品特性生成其他角度/风格的补充图
>    - 最终目标：确保图片总数 ≥ 3 张，且尽量包含白底图和场景图各至少 1 张
> 3. **图片排序**：所有图片（原有 + 新生成）按**质量从高到低排序**，质量最高的图片作为主图（列表第一张）
> 4. **回写规则**：补齐的图片属于"生图"操作，应**追加**到原图片列表末尾，排序后再写入 `after.images`

> **⚠️ 质量分优化迭代逻辑**：如果用户的指令是优化质量分，优化后需要检查当前质量分是否满足用户的诉求。如果不满足，需要查看 `query_product_score` 返回的 `extendProblemMap` 中哪些细项扣分了（true 表示存在此项问题），然后针对扣分的问题再次尝试优化。例如：如果 `category` 为 true（类目不一致），则需要优化类目；如果 `imageQualityBad` 为 true（图片质量不佳），则需要优化图片。每次优化后都需要重新查询质量分，确认是否已达到目标。
>
> **⚠️ 迭代轮数硬限制**：自动优化轮数**不超过 3 轮**。如果经过 3 轮自动优化后质量分仍未达到目标，Agent 必须**停止自动迭代**，并向用户说明以下信息：
> 1. 当前已执行 3 轮自动优化，质量分从 X 分提升到 Y 分
> 2. 剩余未解决的扣分项及其分类（A/B/C 类）
> 3. A 类剩余项：建议用户确认后手动指定优化方向，再发起新一轮优化
> 4. B 类剩余项：需要用户在后台手动操作（如上传认证、开启服务等）
> 5. C 类剩余项：平台算法判定，无法干预

> **执行规则**：
> 1. Agent 识别到用户指令匹配上述关键词后，**无需再向用户确认优化项**，直接按表中定义的优化项执行
> 2. 每个优化项的具体执行方式仍遵循优化策略（`AI_SUGGEST` 或 `USER_PROMPT`），以及 `field-optimization-guide.md` 中的字段优化规范
> 3. 如果某个优化项标注为 `AI_SUGGEST`，则通过批量优化工具获取系统建议值；标注为 `USER_PROMPT` 的，若属于「本地构造 vs 调用优化接口」章节中列出的**可本地构造操作**，则直接在本地计算 `after` 值，无需调用优化接口；否则仍通过批量优化工具执行，需传入 `userPrompt`
> 4. 所有优化项执行完毕后，统一走批量优化的四个强制动作（写入 CSV → 查询质量分 → 生成预览文件 → 输出预览）

