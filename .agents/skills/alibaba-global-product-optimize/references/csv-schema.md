# CSV 中间产物表头规范

本文件定义了商品治理优化流水线中 CSV 中间产物的**表头字段规范**。圈品、优化、发布全链路均基于此格式流转，**列名不可修改**。

> **⚠️ 列位置动态解析（读取和写入都必须遵守）**：CSV 的列顺序**不固定**，实际列顺序以 CSV 文件第一行（表头行）为准。Agent 在**读取和写入** CSV 时，**必须先解析表头行，根据列名动态定位每个字段所在的列索引**，禁止硬编码列序号。写入 `after.*` 列时，必须通过列名匹配到正确的列索引后再写入，**禁止按假设的列顺序写入**，否则会导致数据错位。

## 表头字段

### 基础信息列

| 列名 | 类型 | 说明 |
|------|------|------|
| `productId` | string | 商品 ID，唯一标识 |
| `generalProductId` | string | 通用商品 ID |
| `isExcluded` | boolean | 是否被排除（用户手动排除不参与优化的商品） |
| `status` | string | 当前优化状态（如 `PENDING`、`OPTIMIZED`、`APPLIED`） |
| `reason` | string | 状态说明 / 排除原因 |
| `absSummImageUrl` | string | 商品主图 URL |
| `isPotentialCompetitive` | boolean | 是否为潜在趋势品（优化结果返回后写入，Agent 只读） |

### before 组（优化前原始值）

| 列名 | 类型 | 说明 |
|------|------|------|
| `before.title` | string | 原始标题 |
| `before.price` | string | 原始价格 |
| `before.leadTime` | string | 原始交期 |
| `before.moq` | string | 原始 MOQ（最小起订量） |
| `before.unitWeight` | string | 原始单位重量 |
| `before.unitSize` | string | 原始单位尺寸 |
| `before.shippingTemplate` | string | 原始运费模板 |
| `before.category` | string | 原始类目 |
| `before.description` | string | 原始描述 |
| `before.properties` | string | 原始属性（JSON 或分隔符格式） |
| `before.images` | string | 原始图片列表，**URL 字符串数组**，如 `["https://a.com/1.png","https://a.com/2.png"]` |
| `before.inventory` | string | 原始发货地与库存 |
| `before.keywords` | string | 原始关键词（JSON String list 格式） |
| `before.hsCodeList` | string | 原始 HS 编码列表（JSON 对象数组格式，每项含 `targetCountry` 和 `hsCode`） |
| `before.pis` | string | 优化前商品质量分（PIS），圈品阶段由系统填入 |

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
| `after.inventory` | string | 优化后发货地与库存 |
| `after.keywords` | string | 优化后关键词（JSON String list 格式） |
| `after.hsCodeList` | string | 优化后 HS 编码列表（JSON 对象数组格式，每项含 `targetCountry` 和 `hsCode`） |
| `after.pis` | string | 优化后商品质量分（PIS），优化完成后通过 `queryProductScore` 工具查询并写入 |

## 格式约束（不可违反）

1. **列名不可修改**：`before.*` 和 `after.*` 的命名是前后端约定的协议，改名会导致发布工具无法识别优化字段。
2. **列位置动态解析（读取和写入）**：Agent 读取和写入 CSV 时，必须先解析第一行表头，通过列名匹配来定位数据列，**禁止假设固定的列序号**。写入 `after.*` 列时，必须通过列名匹配到正确的列索引后再写入，**禁止按假设的列顺序写入**，否则会导致数据错位。实际 CSV 中可能存在本文档未列出的额外列，Agent 应忽略未知列，只处理已知列名。
3. **优化操作只写 `after.*` 列**：无论是 `AI_SUGGEST` 还是 `USER_PROMPT` 场景，优化结果只能写入 `after.*` 对应列，`before.*` 列为只读原始值，禁止修改。
4. **未优化字段留空**：若某字段未参与本次优化，其 `after.*` 列保持空值，发布时系统会跳过空值字段。
5. **编码与分隔符**：CSV 使用 UTF-8 编码，逗号分隔，字段值含逗号时用双引号包裹，字段值含双引号（`"`）时必须将其转义为两个连续双引号（`""`）并用双引号包裹整个字段值。
6. **换行符编码规则**：对于包含换行符的字段（如 `description`），圈品工具会进行编码处理：

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

   > **⚠️ 重要**：Agent 在读取 CSV 后，**必须先解码再使用**，否则 `description` 等字段会显示 `{{NL}}` 占位符而非实际的换行符。

## before / after 对照关系

`before.*` 与 `after.*` 的 13 个子字段一一对应，形成优化前后的对比：

| 字段 | before 列 | after 列 | 说明 |
|------|-----------|----------|------|
| 标题 | `before.title` | `after.title` | 商品标题 |
| 价格 | `before.price` | `after.price` | 商品价格 |
| 交期 | `before.leadTime` | `after.leadTime` | 发货交期 |
| MOQ | `before.moq` | `after.moq` | 最小起订量 |
| 单位重量 | `before.unitWeight` | `after.unitWeight` | 单位重量 |
| 单位尺寸 | `before.unitSize` | `after.unitSize` | 单位尺寸 |
| 运费模板 | `before.shippingTemplate` | `after.shippingTemplate` | 运费模板 |
| 类目 | `before.category` | `after.category` | 商品类目 |
| 描述 | `before.description` | `after.description` | 商品描述 |
| 属性 | `before.properties` | `after.properties` | 商品属性 |
| 图片 | `before.images` | `after.images` | 商品图片 |
| 发货地与库存 | `before.inventory` | `after.inventory` | 商品发货地与库存 |
| 关键词 | `before.keywords` | `after.keywords` | 商品关键词（JSON String list 格式） |
| HS 编码列表 | `before.hsCodeList` | `after.hsCodeList` | 商品 HS 编码列表（JSON 对象数组格式，每项含 `targetCountry` 和 `hsCode`） |
| 质量分 | `before.pis` | `after.pis` | 商品质量分（PIS），`before.pis` 由圈品阶段系统填入，`after.pis` 由优化后调用 `queryProductScore` 查询写入 |

---

## CSV 行数据到 ProductSandboxRecordDTO 的转换规则

从本地 CSV 中间产物的每一行数据，按以下规则构造 `ProductSandboxRecordDTO`：

| DTO 字段 | CSV 列来源 |
|----------|-----------|
| `productId` | `productId` 列（为空时传 `null`，**严禁用 `generalProductId` 填充，严禁构造虚拟 ID**） |
| `generalProductId` | `generalProductId` 列（为空时传 `null`，**严禁用 `productId` 填充**） |
| `absSummImageUrl` | `absSummImageUrl` 列 |
| `isExcluded` | 固定为 `false` |
| `before.title` | `before.title` 列 |
| `before.price` | `before.price` 列 |
| `before.leadTime` | `before.leadTime` 列 |
| `before.moq` | `before.moq` 列（转为 Integer） |
| `before.unitWeight` | `before.unitWeight` 列（转为 Double） |
| `before.unitSize` | `before.unitSize` 列 |
| `before.shippingTemplate` | `before.shippingTemplate` 列 |
| `before.category` | `before.category` 列 |
| `before.description` | `before.description` 列 |
| `before.properties` | `before.properties` 列 |
| `before.images` | `before.images` 列 |
| `before.inventory` | `before.inventory` 列 |
| `before.keywords` | `before.keywords` 列 |
| `before.hsCodeList` | `before.hsCodeList` 列 |
| `after.*` | 对应的 `after.*` 列（未优化的字段设为 `null`） |
| `status` | 固定为 `"PENDING"` |
| `reason` | 固定为 `null` |
| `isPotentialCompetitive` | `isPotentialCompetitive` 列（优化结果返回后由后端填充） |
