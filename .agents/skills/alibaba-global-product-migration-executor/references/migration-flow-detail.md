# 搬品执行详细流程参考

本文件包含搬品任务执行阶段的本地兜底搬品、Shopify搬品以及优化策略等细节。

---

## 本地兜底搬品（FILE 模式 — Fallback）

> **FILE 不是首选模式，而是兜底手段。** 当云端解析（`PDP`/`STORE`/`SMART_FILE`）失败时，Agent 可以提示用户降级为 FILE 模式，利用本地解析能力完成搬品。

### 触发条件

| 场景 | 触发条件 | 说明 |
|------|---------|------|
| **云端解析失败降级** | `start_ggs_product_migration` 以 `PDP`/`STORE` 模式创建任务后，在拉取阶段返回失败（目标网站反爬、无 Sitemap、超时等） | Agent 提示用户可改用 FILE 兜底模式，由本地浏览器抓取数据 |
| **非 1688/Amazon URL 且云端无法解析** | 用户提供了 Shopee、Temu、独立站等非 1688/Amazon 平台的 URL，云端解析失败 | Agent 使用本地浏览器工具访问 URL，抓取商品数据，组装 JSON |

> **⚠️ Excel/CSV/PDF 文件统一走 SMART_FILE**：所有文件类型的搬品均使用 `SMART_FILE`（云端解析），不再走 FILE 模式。FILE 模式仅用于 URL 搬品的兜底。

### 云端解析失败时的降级交互

当 `start_ggs_product_migration` 在拉取阶段返回失败时，Agent 必须输出以下提示：
> ⚠️ **云端解析失败**
> 错误信息：[展示完整错误]
> 
> 🔧 **可选方案**
> - **「使用本地解析兜底」** → 我将使用本地浏览器访问该链接，抓取商品数据后重新提交（FILE 模式）
> - **「更换链接重试」** → 提供新的商品链接
> - **「结束搬品」** → 取消本次操作

### 发布价格规则（全局强制约束）

> **⚠️ 发布到国际站时 `priceType` 只接受 `sku` 和 `ladder` 两种**，不存在 `fixed`、`tiered`、`range` 等其他类型。此规则适用于所有搬品模式（SMART_FILE、PDP、STORE、FILE、API），不仅限于 FILE 模式。

| 规则 | 说明 |
|------|------|
| **priceType 限定** | 只允许 `sku` 和 `ladder`，其他类型必须转换 |
| **fixed → ladder 转换** | 若原始数据为 fixed 价格（单一固定价），Agent 必须将其转换为 `ladder` 类型：`ladderPrices` 数组中放一个档位，`minQuantity` 设为 `moq` 的值，`price` 设为原 fixedPrice |
| **moq 默认值** | 若原始数据中无 `moq` 或 `moq` 为空/0，**默认设为 1** |
| **tiered / range → ladder 转换** | 若原始数据为 tiered 或 range 价格，Agent 应将其转换为 `ladder` 类型，保留原有的数量档位和价格 |
| **一档阶梯价合法** | 阶梯价（`ladder`）允许只有一档，即 `ladderPrices` 数组长度为 1，这是合法的 |
| **一档阶梯价 moq 一致性** | **若阶梯价只有一档（`ladderPrices.length == 1`），则 `moq` 与 `ladderPrices[0].minQuantity` 必须相同**。若不一致，以 `moq` 为准，将 `minQuantity` 修正为 `moq` 的值 |

**转换示例（fixed → ladder，一档）**：
```json
// ❌ 原始 fixed 价格（发布不允许）
{"priceType": "fixed", "fixedPrice": "12.50", "currency": "USD"}

// ✅ 转换后的 ladder 价格（一档阶梯价）
{
  "priceType": "ladder",
  "currency": "USD",
  "ladderPrices": [{"minQuantity": 1, "price": 12.50}]
}
// 注：minQuantity 取 moq 的值，moq 无值时默认为 1
// 注：一档阶梯价时，moq 和 ladderPrices[0].minQuantity 必须相同
```

### 执行流程

1. **本地浏览器抓取**（FILE 兜底模式仅用于 URL 搬品）：
   - **非 1688/Amazon URL**：Agent 使用本地浏览器工具访问 URL，抓取网页上的商品数据（标题、价格、图片、描述等）。
2. **组装 JSON 数组**：将获取到的商品数据，严格按照 `ProductSnapshotDTO` 的结构（见 `skills/alibaba-global-product-optimize/SKILL.md` 末尾的「ProductSnapshotDTO 完整结构参考」章节）组装成 **`List<ProductSnapshotDTO>`**（即 `ProductSnapshotDTO` 数组）。后端 parse 的就是这个 List。
   > **⚠️ 注意**：这里组装的是 `ProductSnapshotDTO`（即 `before`/`after` 中的那个结构体），**不是** `ProductSandboxRecordDTO`（顶层记录）。不需要包裹 `productId`、`before`、`after` 等外层字段，直接构造 `title`、`price`、`images` 等 15 个字段的对象数组即可。
   
   > **⚠️ 价格约束**：构造 `price` 字段时，必须遵循上方「发布价格规则」，`priceType` 只允许 `sku` 或 `ladder`，`moq` 默认为 1。一档阶梯价时 `moq` 与 `ladderPrices[0].minQuantity` 必须相同。
3. **写入 JSON 文件**：将该 JSON 数组序列化为字符串，写入本地的一个 `.json` 文件中（例如 `ggs_migration_{timestamp}.json`）。
   > **⚠️ 文件名格式必须与 SMART_FILE / Shopify 保持一致**：使用 `.json` 扩展名，文件名建议格式为 `ggs_migration_{timestamp}.json`（如 `ggs_migration_1713456789.json`）。**禁止使用 `.txt` 扩展名**。
4. **上传 OSS**：调用 `get_oss_pre_upload_url`，**传入的 `fileName` 参数必须是带 `.json` 扩展名的文件名**（如 `ggs_migration_1713456789.json`），获取预签名 URL 后上传文件：
   ```bash
   # ✅ 唯一允许的格式（推荐使用 --upload-file 以避免自动添加 Content-Type）
   curl -sS -X PUT "<预签名URL>" --upload-file "/tmp/ggs_migration_1713456789.json"
   ```
   > 详细的 curl 写法规范与错误示例见 SKILL.md 第 11 条「OSS 上传严禁携带 Content-Type」。
5. **提取 OSS 相对路径（🚫 严禁传自定义短文件名）**：从预签名 URL 中提取 OSS 相对路径（去掉域名和 `?` 后的查询参数），**与 SMART_FILE 和 Shopify API 的提取方式完全一致**。
   ```
   预签名 URL 示例：https://oss-bucket.oss-cn-hangzhou.aliyuncs.com/migrate/2024/ggs_migration_1713456789.json?OSSAccessKeyId=xxx&Signature=xxx
   
   ✅ 正确提取的 fileName：migrate/2024/ggs_migration_1713456789.json
   ❌ 错误（自定义短文件名）：ggs_migration_1713456789.json
   ❌ 错误（完整 URL）：https://oss-bucket.oss-cn-hangzhou.aliyuncs.com/migrate/2024/ggs_migration_1713456789.json?OSSAccessKeyId=xxx
   ```
6. **触发任务**：调用 `start_ggs_product_migration`，`productFrom` 设为 **`FILE`**，`fileName` 传上一步提取的 OSS 相对路径。
7. **后续流程**：创建任务后，与常规流程完全一致，进入后台轮询等待 `AGGREGATE_SUCCESS` / `SUCCESS`。

### URL 平台路由规则

| 平台 | 域名特征 | 搬品模式 |
|------|---------|---------|
| **1688** | `1688.com` | 云端：`PDP` 或 `STORE`（不走 FILE） |
| **Amazon** | `amazon.com`、`amazon.co.jp`、`amazon.co.uk`、`amazon.de` 等 | 云端：`PDP` 或 `STORE`（不走 FILE） |
| **Shopee** | `shopee.com`、`shopee.sg` 等 | 先尝试云端，失败则降级 `FILE` 兜底 |
| **Temu** | `temu.com` | 先尝试云端，失败则降级 `FILE` 兜底 |
| **独立站 / 其他** | 不匹配上述域名 | 先尝试云端，失败则降级 `FILE` 兜底 |

---

## Shopify API 搬品详细流程

当用户提供 Shopify 的 API Key（Access Token）+ 店铺域名时：

### 1. 拉取商品数据

使用 Shopify Admin REST API 拉取商品：

```
GET https://{shop}.myshopify.com/admin/api/2024-01/products.json
Headers:
  X-Shopify-Access-Token: {access_token}
Query: limit=250&status=active
```

- 分页获取：通过 `Link` header 中的 `next` 游标分页，直到获取全部商品
- 用户可指定筛选条件（如品类、状态、创建时间等），转换为 API query 参数

### 2. 转换为 ShopifyMcpProductDTO 数组 JSON

将拉取到的商品数据**按 `references/shopify-dto-schema.md` 定义的 `ShopifyMcpProductDTO` 结构转换**，序列化为 **JSON 数组**写入本地临时文件（如 `shopify_products_{timestamp}.json`）。

> **⚠️ 关键**：所有字段名使用 Java 驼峰命名（camelCase）。Shopify API 返回的 snake_case 字段需转换：`body_html` → `descriptionHtml`，`product_type` → `productType`，`updated_at` → `updatedAt`，`src` → `url`，`alt` → `altText`，`inventory_quantity` → `inventoryQuantity`。完整结构和示例见 `references/shopify-dto-schema.md`。

### 3. 上传至 OSS

调用 `get_oss_pre_upload_url` MCP 工具获取预签名 URL，然后上传文件：

```bash
# ✅ 唯一允许的格式（推荐使用 --upload-file 以避免自动添加 Content-Type）
curl -sS -X PUT "<预签名URL>" --upload-file "shopify_products_{timestamp}.json"
```

> **🚫 致命红线**：严禁携带任何形式的 `-H "Content-Type: ..."`，会导致 `SignatureDoesNotMatch`。完整的 curl 写法规范与错误示例见 SKILL.md 第 11 条「OSS 上传严禁携带 Content-Type」。

### 4. 触发解析

调用 `start_ggs_product_migration`：
- `productFrom` 设为 **`API`**
- `fileName` 填从预签名 URL 中提取的 **OSS 相对路径**（去掉域名和查询参数，如 `migrate/2024/shopify_products.json`）。**🚫 严禁传自定义短文件名**（如 `shopify_products.json`）
- `originSite` 固定传 **`SHOPIFY`**

---

## 优化策略详细规则

### 策略选择

> **⚠️ 搬品场景统一规则：所有优化字段一律使用 `AI_SUGGEST` 策略，禁止使用 `USER_PROMPT`。**

| 策略 | 适用场景 | 说明 |
|------|----------|------|
| **AI_SUGGEST** | **搬品优化的唯一策略** | 后端 AI 自动推荐，所有字段均使用此策略 |
| ~~USER_PROMPT~~ | **搬品场景禁止使用** | 仅在 alibaba-global-product-optimize Skill 中由用户明确给出指令时使用 |

### 搬品场景优化项优先级

| 优先级 | 字段 | `field` 枚举 | 策略 | 说明 |
|--------|------|-------------|------|------|
| **P0（首次必做）** | Category | `CATEGORY` | **AI_SUGGEST** | 推断最合适的国际站类目，**类目是发布必要参数** |
| **P0（首次必做）** | CPV（属性） | `CPV` | **AI_SUGGEST** | 补全缺失属性 |
| **P0（首次必做）** | Title | `TITLE` | **AI_SUGGEST** | 优化标题 |
| **P0（首次必做）** | Description | `DESCRIPTION` | **AI_SUGGEST** | 优化详描 |
| **P0（首次必做）** | Translate | `TRANSLATE` | **AI_SUGGEST** | 翻译为目标语言 |
| **P0（首次必做）** | Price | `PRICE` | **AI_SUGGEST** | 调整为适合国际站的价格区间 |
| **P0（首次必做）** | Price Exchange | `PRICE_EXCHANGE` | **AI_SUGGEST** | 汇率换算 |
| **P0（首次必做）** | Keywords | `KEYWORD` | **AI_SUGGEST** | 生成适合国际站搜索的关键词 |
| **P0（首次必做）** | Lead Time | `LEAD_TIME` | **AI_SUGGEST** | 系统自动推荐合理交期 |
| **P0（首次必做）** | Images | `IMAGE` | **AI_SUGGEST** | 优化主图和详情图 |
| P1 | MOQ | `MOQ` | **AI_SUGGEST** | 系统自动推荐合理 MOQ |
| P2 | Unit Weight | `WEIGHT` | **AI_SUGGEST** | 补全重量信息 |
| P2 | Shipping Template | `LOGISTICS_TEMPLATE` | **AI_SUGGEST** | 补全物流相关信息 |

### 解析结果到 ProductSandboxRecordDTO 的映射

将 `page_query_migration_task_info_product_info` 返回的商品数据按如下规则转换：

| DTO 字段 | 数据来源 |
|----------|---------|
| `productId` | 解析结果的 `productId` |
| `generalProductId` | 解析结果的 `generalProductId` |
| `absSummImageUrl` | 解析结果的主图 URL |
| `isExcluded` | 固定 `false` |
| `status` | 固定 `PENDING` |
| `reason` | 固定 `null` |
| `before.title` | 解析结果的 `title` |
| `before.price` | 解析结果的 `price`（保持原始 JSON 结构） |
| `before.moq` | 解析结果的 `moq`（转为 Integer） |
| `before.leadTime` | 解析结果的 `leadTime` |
| `before.unitWeight` | 解析结果的 `unitWeight`（转为 Double） |
| `before.unitSize` | 解析结果的 `unitSize` |
| `before.shippingTemplate` | 解析结果的 `shippingTemplate` |
| `before.category` | 解析结果的 `category` |
| `before.description` | 解析结果的 `description` |
| `before.properties` | 解析结果的 `properties` |
| `before.images` | 解析结果的 `images` |
| `before.inventory` | 解析结果的 `inventory` |
| `before.pis` | 解析结果的 `pis`（转为 Double） |
| `before.keywords` | 解析结果的 `keywords` |
| `before.currencyCode` | 解析结果的 `currencyCode` |
| `after.*` | 初始全部为 `null`，由 `alibaba-global-product-optimize` Skill 返回后填充 |

> **提交优化时必须传入完整的 `before` 结构**：在调用 `submit_ggs_batch_optimize_detail` 时，每个商品记录必须包含完整的 before 对象（含所有字段），禁止只传部分字段，否则后端优化逻辑无法正确执行。

---

### 与外部 Skill 的分工

> **本 Skill 只负责搬品执行流水线**（解析 → 预览 → 优化），**优化的意图理解和执行逻辑由 `alibaba-global-product-optimize` Skill 负责**。

具体分工：
- **alibaba-global-product-migration-executor（本 Skill）**：在 Step 3 中感知到"用户需要优化"时，**将以下信息透传给 `alibaba-global-product-optimize` Skill**：① 必做优化项列表（见上表 10 项的 `field` 枚举）、② 策略约束（一律 `AI_SUGGEST`）、③ 当前 CSV 文件路径（供优化 Skill 读取商品数据），并将优化结果写回 CSV
- **alibaba-global-product-optimize（外部 Skill）**：接收上述指令后，负责具体的优化执行（MCP 调用、参数构造、结果返回）

当搬品流程进入 Step 3 且用户未指定具体优化内容时，Agent 应**默认执行上述 10 项首次必做优化**。用户后续可通过追加指令进行微调，微调部分的意图理解交由 alibaba-global-product-optimize 处理。

---

## 发布前数据清洗规则

在构造 `after` 数据提交发布时，Agent 必须对以下字段执行数据清洗：

| 字段 | 清洗规则 | 正确示例 | 错误示例 |
|------|----------|----------|----------|
| `unitSize` | 去除所有非数字和 `x` 分隔符的字符（如单位后缀 `cm`、`mm`、`in`、空格等），确保最终值仅包含数字和 `x` | `"30x20x15"` | `"30x20x15cm"`、`"30cmx20cmx15cm"` |
| `shippingTemplate` | 若用户在入口 Skill 选择了物流模版，**必须**将其写入 `after.shippingTemplate`（格式：`{"id": <templateId>, "name": "<模版名称>"}`），优先级高于 before 值 | `{"id": 100001, "name": "Standard"}` | 用户已选模版但 after 中未携带 |
