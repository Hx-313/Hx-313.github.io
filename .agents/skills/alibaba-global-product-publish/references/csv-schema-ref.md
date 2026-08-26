# CSV Schema 引用说明

本文件引用的完整 CSV 表头规范定义位于：

**原始路径**: `skills/alibaba-global-product-migration-executor/references/csv-schema.md`

## 关键信息摘要

搬品流程中维护的唯一本地 CSV 文件包含以下列（动态解析列位置，但列名不可修改）：

### 核心列

| 列名前缀 | 说明 |
|---------|------|
| `productId` | 商品 ID |
| `generalProductId` | 通用商品 ID |
| `absSummImageUrl` | 商品主图 URL |
| `before.*` | 解析后的原始商品数据（15 个字段） |
| `after.*` | 优化后的商品数据（15 个字段），**发布时以此为准** |
| `publishStatus` | 发布状态（SUCCESS/FAILED/PENDING） |
| `publishUrl` | 发布成功后的商品链接 |
| `publishError` | 发布失败原因 |

### before/after 包含的 15 个字段

- `title` - 商品标题
- `price` - 价格对象（JSON）
- `leadTime` - 交期（JSON 数组）
- `moq` - 最小起订量
- `unitWeight` - 单件毛重
- `unitSize` - 包装尺寸
- `shippingTemplate` - 物流模板（JSON 对象）
- `category` - 类目（JSON 对象）
- `description` - 商品描述（HTML）
- `properties` - 商品属性（JSON 数组）
- `images` - 图片列表，**URL 字符串数组**，如 `["https://a.com/1.png","https://a.com/2.png"]`
- `inventory` - 发货地与库存信息（JSON 字符串）
- `pis` - 商品质量分
- `keywords` - 关键词（JSON 数组字符串）
- `currencyCode` - 币种

## 重要说明

1. **唯一 CSV 原则**：全流程只维护一个 CSV 文件，解析写入、优化写回、发布读取都操作同一个文件
2. **列名不可修改**：CSV 列名必须严格遵循规范，列位置可动态解析
3. **发布前数据源**：发布时优先读取 `after.*` 列，若为空则兜底读取 `before.*` 列
4. **特殊字符编码/解码规则**：CSV 中的 `description`、`properties`、`title` 等富文本字段可能包含换行符、逗号、双引号等特殊字符，读写时必须遵循以下规则：
   - **读取时解码**：先用标准 CSV 解析器处理双引号转义，再将占位符还原为实际字符（`{{NL}}` → `\n`、`{{CR}}` → `\r`）
   - **写入时编码**：先将换行符替换为占位符（`\n` → `{{NL}}`、`\r` → `{{CR}}`），再将双引号转义为 `""`，含逗号的字段值用双引号包裹
   - **不执行转义的后果**：未转义的换行符会导致 CSV 行断裂，未转义的逗号会导致列错位，未转义的双引号会导致解析报错，直接影响发布
   - 完整规则见 `skills/alibaba-global-product-migration-executor/references/csv-schema.md` 中的"换行符编码规则"

## 完整定义查阅

如需查看完整的 CSV 表头规范、列顺序、数据类型和示例数据，请查阅原始文件：

```
skills/alibaba-global-product-migration-executor/references/csv-schema.md
```
