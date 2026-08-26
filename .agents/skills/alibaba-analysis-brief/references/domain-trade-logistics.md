# 交易订单与物流领域字段参考

本文档包含交易订单和物流相关的调用参数和返回数据结构说明，追问订单/交易/物流时查阅。

---

## icbu.trade.list-trade-list-mcp — 交易合同列表

调用示例：

```bash
workctl icbu trade list-trade-list-mcp --limit 20 --start 0 --format json
```

### 入参（fieldName_0）

入参为交易合同列表查询条件对象，包含筛选、分页、排序等参数。首次简报拉取时传 `limit=20,start=0`；追问时按需传入筛选条件。

**分页与排序：**

| 参数 | 类型 | 说明 |
|:---|:---|:---|
| `limit` | number | 每页数量 |
| `start` | number | 起始位置（分页偏移） |
| `orderBy` | string | 排序字段 |
| `sortOrder` | string | 排序方式：`ASC`(升序) / `DESC`(降序) |

**状态筛选：**

| 参数 | 类型 | 说明 |
|:---|:---|:---|
| `status` | string | 搜索状态（单个） |
| `statusList` | string[] | 状态列表筛选 |
| `logisticsStatus` | string | 物流状态：`not_shipped`(未发货) / `shipped`(已发货) / `in_transit`(运输中) / `delivered`(已送达) |
| `sellerTodo` | string | 卖家待办事项 |
| `buyerTodo` | string | 买家待办 |

**时间范围：**

| 参数 | 类型 | 说明 |
|:---|:---|:---|
| `createDateFrom` | object | 订单创建时间起始 |
| `createDateTo` | object | 订单创建时间结束 |
| `modifiedFrom` | object | 最后修改时间起始 |
| `modifiedTo` | object | 最后修改时间结束 |
| `firstPayDateFrom` | object | 首次付款时间起始 |
| `firstPayDateTo` | object | 首次付款时间结束 |
| `shipmentDateFrom` | object | 发货日期起始 |
| `shipmentDateTo` | object | 发货日期结束 |

**金额筛选：**

| 参数 | 类型 | 说明 |
|:---|:---|:---|
| `amountFrom` | object | 订单总金额下限 |
| `amountTo` | object | 订单总金额上限 |
| `amountReceivedFrom` | object | 已收金额下限 |
| `amountReceivedTo` | object | 已收金额上限 |
| `currency` | string | 订单币种 |

**搜索与精确匹配：**

| 参数 | 类型 | 说明 |
|:---|:---|:---|
| `fuzzyValue` | string | 模糊搜索关键词 |
| `contractNumber` | string | 合同号精确查询 |
| `tradeId` | number | 单个交易 ID |
| `tradeIds` | number[] | 多个交易 ID |
| `productName` | string | 产品名称搜索 |

**业务类型与渠道：**

| 参数 | 类型 | 说明 |
|:---|:---|:---|
| `businessType` | string | 订单类型 |
| `channelType` | string | 渠道类型（`ORIGINAL`/`RFQ`/`INQUIRY`/`TAD_BUY_NOW`/`QUOTATION`/`PRODUCT_DETAIL` 等） |
| `origin` | string | 订单来源 |
| `tags` | string[] | 订单标签 |

**物流与地域：**

| 参数 | 类型 | 说明 |
|:---|:---|:---|
| `carrier` | string | 承运商 |
| `shipmentMethod` | string | 物流运输方式 |
| `buyerCountry` | string[] | 买家国家 |
| `shippingCountry` | string | 收货地址国家 |
| `dispatchCountry` | string | 发货地址国家 |
| `tradeTerm` | string | 贸易条款 |

**其他筛选：**

| 参数 | 类型 | 说明 |
|:---|:---|:---|
| `exportServiceType` | string | 出口方式 |
| `taxType` | string | 税务类型 |
| `searchDraftOrder` | boolean | 是否搜索草稿订单 |
| `searchLcOrder` | boolean | 是否搜索信用证订单 |

### 返回数据结构
- `totalCount`: 订单总数
- `limit` / `start`: 分页参数
- `tradeList[]`: 订单列表，每条包含：
  - `id`: 订单ID
  - `createDate` / `modifyDate`: 创建/修改时间
  - `status.status`: 订单状态（如 `trade_close`、`wait_buyer_payment` 等）
  - `status.actions[]`: 可执行操作列表
  - `businessType`: 业务类型（如 `trade_assurance`）
  - `buyer`: 买家信息（`companyName`, `country`, `email`, `loginId`, `participantName`）
  - `seller`: 卖家信息
  - `payment`: 支付信息
    - `totalAmount.amount`: 订单总金额
    - `productTotalAmount.amount`: 商品总金额
    - `receivedAmount.amount`: 已收金额
    - `advanceAmount.amount`: 预付金额
  - `logistics`: 物流信息（`shipmentMethod`, `carrier`, `shipmentFee`, `logisticsContact`）
  - `subjectMatter.details[]`: 商品明细（`name`, `quantity`, `unitPrice`, `skuDescription`）
  - `origin`: 订单来源（`sourcing`, `wholesale` 等）
  - `tags[]`: 订单标签（如 `ta`, `semi_manage`, `direct_pay` 等）

适用场景：
- 首次简报拉取 → `--limit 20 --start 0`
- 用户问"最近有哪些订单" / "订单列表" → 不传参数或按时间范围筛选
- 用户问"订单状态" / "有没有待发货的订单" → `--statusList '["wait_seller_ship"]'`
- 用户问"某个合同号的订单" → `--contractNumber "<合同号>"`
- 用户问"某个买家的订单" → `--fuzzyValue "<买家名称>"`
- 用户问"RFQ 渠道的订单" → `--channelType RFQ`
- 用户问"金额超过1000美元的订单" → `--amountFrom '{"amount":1000}'`
- 用户问"交易合同明细" → 不传参数，展示完整订单详情
- 配合首次简报"核心业务执行看板"中的订单交易与物流履约展示

---

## icbu.logistics.list — 物流订单列表

调用示例：

```bash
workctl icbu logistics list \
  --currentPage 1 \
  --pageSize 20 \
  --format json
```

| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `currentPage` | number | 否 | 当前页，默认 1 |
| `pageSize` | number | 否 | 分页大小，默认 20 |
| `number` | string | 否 | ALS 开头的物流订单号，精确查询 |
| `statusList` | array | 否 | 物流状态列表筛选 |
| `tradeBizId` | string | 否 | 信保单 ID，按信保订单关联查询物流 |

返回数据结构：

- `total`: 物流订单总数
- `currentPage` / `pageSize` / `totalPage`: 分页信息
- `dataList[]`: 物流订单列表，每条包含：
  - `orderNumber`: 物流订单号，如 ALS 开头单号
  - `orderStatus`: 物流订单状态
  - `orderStatusDesc`: 物流订单状态中文描述
  - `tradeBizId`: 关联信保单 ID
  - `destinationCountryCode` / `destinationCountryName`: 目的国
  - `solutionName`: 物流方案
  - `warehouseName`: 仓库
  - `cargoList[]`: 货品明细

适用场景：

- 首次简报物流看板 → `--currentPage 1 --pageSize 20`
- 用户问"物流订单" / "发货情况" → `--currentPage 1 --pageSize 20`
- 用户问"某个物流单号的进度" → `--number "<ALS开头的单号>"`
- 用户问"某笔信保订单的物流" → `--tradeBizId "<信保单ID>"`
- 用户问"运输中的订单" / "物流追踪" → 根据 schema 使用 `--statusList '["<物流状态>"]'`

如果物流命令失败，标注该模块暂不可用，不要降级成 `total=0` 的假空数据。
