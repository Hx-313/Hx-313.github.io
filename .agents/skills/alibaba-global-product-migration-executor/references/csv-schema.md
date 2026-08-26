# CSV 中间产物表头规范

本文件定义了商品搬品流水线中 CSV 中间产物的**表头字段规范**。解析、优化、发布全链路均基于此格式流转，**列名不可修改**。格式与 alibaba-global-product-optimize 的 CSV 规范保持一致。

> **列位置动态解析**：CSV 的列顺序**不固定**，Agent 读取和写入 CSV 时必须先解析表头行，根据列名动态定位字段所在的列索引，**禁止硬编码列序号**。

## 表头字段

### 基础信息列

| 列名 | 类型 | 说明 |
|------|------|------|
| `productId` | string | 商品 ID，唯一标识 |
| `generalProductId` | string | 通用商品 ID |
| `isExcluded` | boolean | 是否被排除 |
| `status` | string | 当前状态（`PENDING`、`SUCCESS`、`FAILED`） |
| `reason` | string | 状态说明 / 失败原因 |
| `publishUrl` | string | 发布成功后的商品线上链接 |
| `absSummImageUrl` | string | 商品主图 URL |

### before 组（解析出的原始值）

| 列名 | 类型 | 说明 |
|------|------|------|
| `before.title` | string | 原始标题 |
| `before.price` | string | 原始价格（JSON） |
| `before.leadTime` | string | 原始交期 |
| `before.moq` | string | 原始 MOQ |
| `before.unitWeight` | string | 原始单位重量 |
| `before.unitSize` | string | 原始单位尺寸 |
| `before.shippingTemplate` | string | 原始运费模板 |
| `before.category` | string | 原始类目 |
| `before.description` | string | 原始描述 |
| `before.properties` | string | 原始属性 |
| `before.images` | string | 原始图片列表，**URL 字符串数组**，如 `["https://a.com/1.png","https://a.com/2.png"]` |
| `before.inventory` | string | 原始库存 |
| `before.pis` | string | 原始商品质量分（PIS） |
| `before.keywords` | string | 原始关键词（JSON 数组字符串，如 `["kw1","kw2"]`） |
| `before.currencyCode` | string | 原始币种 |

### after 组（优化后目标值）

| 列名 | 类型 | 说明 |
|------|------|------|
| `after.title` | string | 优化后标题 |
| `after.price` | string | 优化后价格 |
| `after.leadTime` | string | 优化后交期 |
| `after.moq` | string | 优化后 MOQ |
| `after.unitWeight` | string | 优化后单位重量 |
| `after.unitSize` | string | 优化后单位尺寸 |
| `after.shippingTemplate` | string | 优化后运费模板 |
| `after.category` | string | 优化后类目 |
| `after.description` | string | 优化后描述 |
| `after.properties` | string | 优化后属性 |
| `after.images` | string | 优化后图片列表，**URL 字符串数组**，如 `["https://a.com/1.png","https://a.com/2.png"]` |
| `after.inventory` | string | 优化后库存 |
| `after.pis` | string | 优化后商品质量分 |
| `after.keywords` | string | 优化后关键词（JSON 数组字符串，如 `["kw1","kw2"]`） |
| `after.currencyCode` | string | 优化后币种 |

## 格式约束

1. **列名不可修改**：`before.*` 和 `after.*` 的命名是前后端协议，改名会导致发布工具无法识别。
2. **列位置动态解析**：读取和写入都必须先解析表头行，通过列名匹配定位，禁止假设固定列序号。
3. **优化只写 `after.*` 列**：Step 3 优化阶段，`before.*` 列为只读原始值，禁止修改。**例外**：Step 2 数据预览确认阶段，若用户提出修改需求，允许直接编辑 `before.*` 字段。
4. **未优化字段留空**：未参与优化的字段 `after.*` 列保持空值。
5. **编码与分隔符**：UTF-8 编码，逗号分隔，字段值含逗号时用双引号包裹，字段值含双引号（`"`）时必须将其转义为两个连续双引号（`""`）并用双引号包裹整个字段值。
6. **换行符编码规则**：对于包含换行符的字段（如 `description`），写入 CSV 时必须进行编码处理，读取时必须解码还原。此规则与 `alibaba-global-product-optimize` 的 CSV 规范保持一致。

   **编码规则（写入时）**：
   | 原始字符 | 替换为 | 说明 |
   |----------|--------|------|
   | `\r\n` | `{{NL}}` | Windows 风格换行 |
   | `\n` | `{{NL}}` | Unix 风格换行 |
   | `\r` | `{{CR}}` | 回车符 |
   | `\u2028` | `{{NL}}` | Unicode 行分隔符 |
   | `\u2029` | `{{NL}}` | Unicode 段分隔符 |
   | `"` | `""` | CSV 标准双引号转义 |
   | `,` | 用双引号包裹整个字段值 | 字段值含逗号时，必须用 `"` 包裹整个值，防止列错位 |

   **解码规则（读取时）**：
   1. 先用标准 CSV 解析器（如 RFC4180Parser）解析字段，自动处理双引号转义
   2. 然后还原换行占位符：
      - `{{NL}}` → `\n`
      - `{{CR}}` → `\r`

   > **⚠️ 重要**：Agent 在读取 CSV 后，**必须先解码再使用**，否则 `description` 等字段会显示 `{{NL}}` 占位符而非实际的换行符。写入 CSV 前，**必须先编码再写入**，否则原始换行符会导致 CSV 行断裂。

## before / after 对照关系

`before.*` 与 `after.*` 的 15 个子字段一一对应：title、price、leadTime、moq、unitWeight、unitSize、shippingTemplate、category、description、properties、images、inventory、pis、keywords、currencyCode。
