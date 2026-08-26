# 优化预览 Markdown 渲染规范

优化完成后（Step 2 结束），Agent 需基于本地 CSV 中间产物，**直接在对话中以 Markdown 格式**输出 **before / after 对比预览**，让用户直观查看每个商品各字段的优化前后差异，辅助决策是否发布。

> **输出格式为 Markdown**，可在 Markdown 中嵌入 HTML 标签（如 `<span>`、`<div>`、`<img>`、`<table>` 等）以实现样式效果（如绿色高亮、卡片布局）。**不生成独立的 HTML 文件**。
>
> **⚠️ 关键规则：HTML 标签必须直接输出，禁止放在代码块中**。所有 HTML 标签（`<div>`、`<span>`、`<table>`、`<img>` 等）必须作为 Markdown 的一部分直接输出，让渲染引擎将其渲染为实际的样式效果。**绝不能**将 HTML 代码放在 `` ``` `` 代码块或 `` `code` `` 行内代码中，否则 HTML 会被当作纯文本展示，用户看到的将是原始 HTML 源码而非渲染后的效果。

## 触发时机

- **Step 2（批量优化）完成后**，无论是 `AI_SUGGEST` 还是 `USER_PROMPT` 场景，只要 CSV 中存在非空的 `after.*` 列值，就应生成预览。
- 用户主动要求"看看优化结果""预览一下""对比一下"时也应生成。

## 数据来源

从本地 CSV 中间产物中读取，按 `references/csv-schema.md` 定义的表头字段解析。Agent 必须先解析 CSV 第一行表头，通过列名动态定位数据列。仅展示 `after.*` 列中**至少有一个字段非空**的商品行（即实际被优化过的商品）。

> **⚠️ CSV 编码/解码规则**：圈品工具返回的 CSV 中，对于包含换行符的字段（如 `description`），会进行编码处理。Agent 在读取 CSV 后，**必须先解码再渲染**：
>
> **编码规则（写入时）**：
> | 原始字符 | 替换为 | 说明 |
> |----------|--------|------|
> | `\r\n` | `{{NL}}` | Windows 风格换行 |
> | `\n` | `{{NL}}` | Unix 风格换行 |
> | `\r` | `{{CR}}` | 回车符 |
> | `\u2028` | `{{NL}}` | Unicode 行分隔符 |
> | `\u2029` | `{{NL}}` | Unicode 段分隔符 |
> | `"` | `""` | CSV 标准双引号转义 |
>
> **解码规则（读取时）**：
> 1. 先用标准 CSV 解析器（如 RFC4180Parser）解析字段，自动处理双引号转义
> 2. 再调用 `GovernProductFileManager.unescapeCsvNewlines(value)` 还原换行占位符：
>    - `{{NL}}` → `\n`
>    - `{{CR}}` → `\r`
>
> **⚠️ 重要**：在渲染预览时，**必须先解码 CSV 字段**，否则 `description` 等字段会显示 `{{NL}}` 占位符而非实际的换行符。

> **与 `ProductSnapshotDTO` 对齐（解析规则）**：`before.*` / `after.*` 在 CSV 中多为**单元格内的文本**（常为 JSON 字符串）。生成预览前须先按字段反序列化，语义与 `com.alibaba.ggs.nurture.product.dto.agent.ProductSnapshotDTO` 一致：
> - `price` → **`ProductPriceDTO` 对象**（勿把整段价格当不可解析的纯文本直接塞进表格）
> - `leadTime` → **`QuantityTieredLeadTime` 数组**，元素字段为 **`quantity`、`leadTime`（天）**
> - `shippingTemplate` → **`{ id, name }` 对象**
> - `category` → **`{ categoryId, categoryPath }` 对象**
> - `properties` → **`GlobalProductAttribute` 数组**（`attributeId`、`attributeName`、`attributeValue`、`attributeValueId`）
> - `images` → **字符串数组**
> - `description`、`inventory` → 仍为字符串（`inventory` 可为 JSON 对象字符串）
> - `keywords`、`currencyCode` → 字符串（若 CSV 有对应列则参与展示）

## 预览结构

### 整体布局

```
┌─────────────────────────────────────────────────────┐
│  标题：Product Optimization Preview                   │
│  统计摘要：共 N 个商品被优化，涉及 M 个字段              │
├─────────────────────────────────────────────────────┤
│  商品卡片 1（带主图、ID、标题、对比表格）                 │
│  商品卡片 2 ...                                      │
│  商品卡片 N ...                                      │
├─────────────────────────────────────────────────────┤
│  页脚：提示"确认无误后可执行发布"                        │
└─────────────────────────────────────────────────────┘
```

### 头部

- **主标题**：使用 Markdown `##` 标题
- **统计摘要**：优化商品总数 + 涉及优化的字段列表

### 商品卡片

每个被优化的商品渲染为一张卡片，包含：

1. **商品主图**：取 `absSummImageUrl` 列，使用 `<img>` 标签渲染（`width: 80px`，圆角），若为空则不展示
2. **商品标识**：商品 ID + `before.title`（原始标题）。**商品 ID 渲染规则**：当 `productId` 有值时优先渲染 `productId`，否则渲染 `generalProductId`
3. **PIS 质量分**：在商品标识（ID 行）下方展示质量分信息，**预览卡片和发布结果卡片的展示样式不同**：

#### 预览卡片 PIS 样式（Step 2 优化预览）

仅展示优化后的质量分 + 提升标签，不展示 before → after 箭头对比。

- **ID 行**：`ID: {productId}`
- **PIS 行**：展示为绿色圆角标签 `PIS: {afterScore}`，若分数提升则在标签右侧显示 `↑ Improved` 绿色文字

**预览卡片 PIS 展示示例**：
```html
<div style="color:#888;font-size:12px;margin-top:2px;">ID: {{productId || generalProductId}}</div>
<div style="margin-top:4px;">
  <span style="display:inline-block;background:#E3FCEF;color:#00875A;font-size:12px;font-weight:600;padding:2px 8px;border-radius:10px;">PIS: 4.89</span>
  <span style="color:#00875A;font-size:12px;margin-left:6px;">↑ Improved</span>
</div>
```

> **说明**：
> - `afterScore` 取自 CSV 的 `after.pis` 列（通过 `queryProductScore` 查询后写入）
> - 判断是否 Improved：比较 `after.pis` 与 `before.pis`，若 `after.pis` > `before.pis` 则显示 `↑ Improved`
> - 若 `after.pis` ≤ `before.pis` 或 `before.pis` 为空，则不显示 `↑ Improved` 标签

#### 发布结果卡片 PIS 样式（Step 3 发布结果）

展示 before → after 的分数对比，afterScore 使用绿色高亮。

**发布结果卡片 PIS 展示示例**：
```html
<div style="color:#888;font-size:12px;margin-top:2px;">
  ID: {{productId || generalProductId}} | PIS: 3.2 → <span style="color:#00875A;font-weight:600;">5.2</span>
</div>
```

> **说明**：
> - `beforeScore` 取自 CSV 的 `before.pis` 列（圈品阶段由系统填入）
> - `afterScore` 取自 CSV 的 `after.pis` 列（优化后通过 `queryProductScore` 查询写入）
> - `afterScore` 始终使用绿色高亮（`color:#00875A;font-weight:600;`）

4. **潜在趋势品标签**：当 CSV 中 `isPotentialCompetitive` 为 `true` 时，在 PIS 行下方展示橙色徽章标签。当为 `false` 或为空时，**不展示任何标签**。

**潜在趋势品标签展示示例**：
```html
<div style="margin-top:4px;">
  <span style="display:inline-block;background:#FFF3E0;color:#E65100;font-size:12px;font-weight:600;padding:2px 8px;border-radius:10px;">🏆 Potential Trending Product</span>
</div>
```

> **说明**：
> - `isPotentialCompetitive` 由后端在优化完成后自动填充，Agent 只读不写
> - 仅 `true` 时展示标签，`false` 或空值时不展示任何内容
> - 标签文案跟随用户语言：英文为 `🏆 Potential Trending Product`，中文为 `🏆 潜在趋势品`

5. **对比内容**：分为"简单字段"和"复杂字段"两种渲染方式

### 对比渲染规则

> **⚠️ 核心规则：统一使用 HTML `<table>` 渲染所有字段**
>
> 所有字段（包括简单字段和复杂字段）必须统一放在同一个 HTML `<table>` 表格内渲染。**禁止使用 Markdown 表格**（`| Field | Before | After |` 格式），因为 Markdown 表格不支持 `<div>` 块级元素，会导致复杂字段无法正确渲染。
>
> 绝不能将未解析的 JSON 原文直接作为文本放在表格单元格内显示（须先解析再按下列规则渲染）。

- **仅展示有变化的字段**：`after.*` 为空的字段不出现在表格中
- **差异高亮**：`After` 列使用 `<span>` 标签加绿色样式标记变化
- **Before 列不添加删除线**：`before.*` 列的值直接显示，不使用 `~~` 删除线标记
- **字段名映射**：表格中使用可读的字段名而非原始列名
- **价格特殊渲染**：`price` 字段需要根据价格类型进行特殊渲染，详见下方"价格渲染规则"
- **交期特殊渲染**：`leadTime` 字段可能包含阶梯式交期数据，需要按阶梯格式渲染，详见下方"交期渲染规则"
- **物流模板特殊渲染**：`shippingTemplate` 解析为对象后取 **`name`** 展示，详见下方「物流模板渲染规则」
- **类目渲染**：`category` 解析为对象后优先展示 **`categoryPath`**（必要时附带 `categoryId`）
- **属性特殊渲染**：`properties` 解析为属性对象数组后，按「属性名: 属性值」逐行展示，详见下方「属性渲染规则」

#### HTML 表格基础结构

```html
<table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:13px;">
  <tr style="border-bottom:1px solid #EEE;">
    <th style="text-align:left;padding:8px 0;color:#696969;width:20%;">Field</th>
    <th style="text-align:left;padding:8px 0;color:#696969;width:40%;">Before</th>
    <th style="text-align:left;padding:8px 0;color:#696969;width:40%;">After</th>
  </tr>
  <!-- 简单字段行 -->
  <tr style="border-bottom:1px solid #F5F5F5;">
    <td style="padding:8px 0;">MOQ</td>
    <td style="padding:8px 0;">100</td>
    <td style="padding:8px 0;"><span style="color:#00875A;font-weight:600;">1</span></td>
  </tr>
  <!-- 复杂字段行（如价格） -->
  <tr style="border-bottom:1px solid #F5F5F5;">
    <td style="padding:8px 0;vertical-align:top;">Price</td>
    <td style="padding:8px 0;vertical-align:top;">
      <div style="margin-bottom:4px;"><span style="background:#E6F7ED;color:#00875A;padding:2px 6px;border-radius:4px;font-size:12px;">Tiered</span></div>
      <div style="margin-bottom:2px;"><span style="color:#696969;">≥100 pieces</span> <span style="color:#8B5CF6;font-weight:600;">USD 2.52</span></div>
      <div style="margin-bottom:2px;"><span style="color:#696969;">≥500 pieces</span> <span style="color:#8B5CF6;font-weight:600;">USD 2.34</span></div>
    </td>
    <td style="padding:8px 0;vertical-align:top;">
      <div style="margin-bottom:4px;"><span style="background:#E6F7ED;color:#00875A;padding:2px 6px;border-radius:4px;font-size:12px;">Tiered</span></div>
      <div style="margin-bottom:2px;"><span style="color:#696969;">≥100 pieces</span> <span style="color:#00875A;font-weight:600;">USD 2.27</span></div>
      <div style="margin-bottom:2px;"><span style="color:#696969;">≥500 pieces</span> <span style="color:#00875A;font-weight:600;">USD 2.11</span></div>
    </td>
  </tr>
</table>
```

> **关键点**：复杂字段的单元格使用 `vertical-align:top;` 确保内容顶部对齐，单元格内使用 `<div>` 实现多行渲染。

| CSV 列名 | 显示名 |
|----------|--------|
| `title` | Title |
| `price` | Price |
| `leadTime` | Lead Time |
| `moq` | MOQ |
| `unitWeight` | Unit Weight |
| `unitSize` | Unit Size |
| `shippingTemplate` | Shipping Template |
| `category` | Category |
| `description` | Description |
| `properties` | Properties |
| `images` | Images |
| `inventory` | Inventory |

### 长文本处理

- `description`、`inventory` 等可能包含长文本的字段，默认截断显示前 100 字符，末尾加 `...`。
- `properties` 为数组时：先解析为对象列表，再对每个属性的展示文本分别截断（不要对整段 JSON 字符串一刀切截断导致无法解析）。

### 交期渲染规则

`leadTime` 为 **`QuantityTieredLeadTime` 数组**（CSV 中常为该数组的 JSON 字符串）。每项含 **`quantity`（数量档）**、**`leadTime`（交期天数）**。按数量档升序渲染。**Before 列和 After 列都不得直接显示原始 JSON 字符串**。

#### 1. 阶梯交期（数组格式）

**数据格式**（与 `ProductSnapshotDTO` 注释一致）：
```json
[
  {"quantity": 1, "leadTime": 12},
  {"quantity": 100, "leadTime": 30},
  {"quantity": 200, "leadTime": 38}
]
```

**展示文案**：按 `quantity` 从小到大排序后，每一档可渲染为 **`≥{quantity} pieces, {leadTime} days`**（或中文「≥{quantity} 件，{leadTime} 天」）。若业务上需要「区间」观感，可在相邻两档之间推导区间（例如下一档 `quantity` 为 100 时，上一档可展示为「1–99 pieces」），但**数据模型以 `quantity` + `leadTime` 为准**，不要使用已废弃的 `minQuantity` / `maxQuantity` / `processPeriod` 等字段名作为解析依据。

**Before 列渲染方式**：
```html
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#696969;font-size:13px;">≥1 pieces, 12 days</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#696969;font-size:13px;">≥100 pieces, 30 days</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#696969;font-size:13px;">≥200 pieces, 38 days</span>
</div>
```

**After 列渲染方式**（有变化的行用绿色高亮，无变化的行用紫色）：
```html
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#00875A;font-size:13px;font-weight:600;">≥1 pieces, 7 days</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#00875A;font-size:13px;font-weight:600;">≥100 pieces, 20 days</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#8B5CF6;font-size:13px;">≥200 pieces, 38 days</span>
</div>
```

> **差异高亮规则**：按**同一数量档**（`quantity` 对齐）对比 Before / After 的 `leadTime`；若该档交期变化，该行使用绿色 `#00875A` 加粗；若未变化，使用紫色 `#8B5CF6` 正常显示。

#### 2. 简单交期（兼容旧 CSV）

`ProductSnapshotDTO` 以**数组**为准；若个别历史 CSV 单元格为**纯数字字符串**（如 `"7"`、`"15"`），无法解析为数组时，可降级为单行展示：

**Before 列**：
```html
<span style="color:#696969;font-size:13px;">15 days</span>
```

**After 列**：
```html
<span style="color:#00875A;font-size:13px;font-weight:600;">7 days</span>
```

### 物流模板渲染规则

`shippingTemplate` 为 **`ShippingTemplateDTO` 对象**（CSV 中常为 JSON 字符串），**禁止直接显示原始 JSON 字符串**，解析后提取 **`name`** 展示。

**数据格式**：
```json
{"id": 2099322001, "name": "Smart Template"}
```

**Before 列渲染方式**：
- 若单元格为 JSON 字符串，先解析为对象再取 `name`
- 若为空或无模板，显示 `-`

```html
<span style="color:#696969;font-size:13px;">Smart Template</span>
```

或无模板时：
```html
<span style="color:#696969;font-size:13px;">-</span>
```

**After 列渲染方式**：
- 提取 `name` 字段显示，使用绿色加粗标记变化

```html
<span style="color:#00875A;font-size:13px;font-weight:600;">Alibaba logistic template</span>
```

> **注意**：物流模板属于简单字段，可以放在 Markdown 表格内渲染，但必须提取 `name` 字段显示，不能直接显示原始 JSON 或 `id (name)` 格式。

### 类目渲染规则

`category` 为 **`CategoryDTO` 对象**（CSV 中常为 JSON 字符串）。解析后表格内优先展示 **`categoryPath`**；若需区分同名类目，可写 **`{categoryId} · {categoryPath}`**。

### 属性渲染规则

`properties` 为 **`GlobalProductAttribute` 数组**（CSV 中常为 JSON 数组字符串）。展示时使用 **`attributeName` + `attributeValue`**（可酌情展示 `attributeId` / `attributeValueId`），**每个属性一行**，禁止用分号 `;` 拼成单行。

**数据格式**：
```json
[
  {
    "attributeId": 1001,
    "attributeName": "Heating System",
    "attributeValue": "Electric",
    "attributeValueId": 20001
  },
  {
    "attributeId": 1002,
    "attributeName": "Material",
    "attributeValue": "Anti-flammable PC and ABS",
    "attributeValueId": 20002
  }
]
```

**Before 列渲染方式**：
```html
<div style="margin-bottom:4px;"><span style="color:#696969;font-size:13px;">Heating System: Electric</span></div>
<div style="margin-bottom:4px;"><span style="color:#696969;font-size:13px;">Material: Anti-flammable PC and ABS</span></div>
```

**After 列渲染方式**（有变化的属性用绿色加粗，无变化的属性用灰色）：
```html
<div style="margin-bottom:4px;"><span style="color:#00875A;font-size:13px;font-weight:600;">Heating System: Solar</span></div>
<div style="margin-bottom:4px;"><span style="color:#00875A;font-size:13px;font-weight:600;">Material: PC</span></div>
```

> **差异高亮规则**：逐个对比 Before 和 After 的每个属性，若属性值发生变化，该行使用绿色 `#00875A` 加粗；若未变化，使用灰色 `#696969` 正常显示。

### Images 字段渲染

`images` 为 **URL 字符串数组**（CSV 中常为 JSON 数组字符串），须先解析再渲染为图片预览。

**数据格式**：
```json
["https://example.com/image1.jpg", "https://example.com/image2.jpg", "https://example.com/image3.jpg"]
```

**渲染方式**：
```html
<div style="display:flex;flex-wrap:wrap;gap:8px;">
  <img src="https://example.com/image1.jpg" width="60" height="60" style="border-radius:4px;object-fit:cover;border:1px solid #DDD;" />
  <img src="https://example.com/image2.jpg" width="60" height="60" style="border-radius:4px;object-fit:cover;border:1px solid #DDD;" />
  <img src="https://example.com/image3.jpg" width="60" height="60" style="border-radius:4px;object-fit:cover;border:1px solid #DDD;" />
</div>
```

**Before 列**：显示原始图片预览
**After 列**：显示优化后的图片预览

```html
<div style="display:flex;flex-wrap:wrap;gap:8px;">
  <img src="https://example.com/optimized1.jpg" width="60" height="60" style="border-radius:4px;object-fit:cover;border:1px solid #DDD;" />
  <img src="https://example.com/optimized2.jpg" width="60" height="60" style="border-radius:4px;object-fit:cover;border:1px solid #DDD;" />
</div>
```

### Description 字段渲染

`description` 为 **HTML 字符串**（CSV 中常为编码后的字符串）。**必须先解码 CSV 字段**（将 `{{NL}}` 还原为 `\n`，`{{CR}}` 还原为 `\r`），然后按以下方式渲染：

> **⚠️ 重要**：在渲染 `description` 字段前，**必须先调用 `GovernProductFileManager.unescapeCsvNewlines(value)` 解码**，否则预览中会显示 `{{NL}}` 占位符而非实际的换行符。

**渲染方式**：
- **Before 列**：显示原始描述，截断至 100 字符，末尾加 `...`
- **After 列**：显示优化后的描述，截断至 100 字符，末尾加 `...`

```html
<!-- Before 列 -->
<div style="color:#696969;font-size:13px;white-space:pre-wrap;overflow:hidden;text-overflow:ellipsis;max-height:100px;">
  <span style="color:#696969;">This premium product is designed for professional use, ensuring top-tier performance...</span>
</div>

<!-- After 列 -->
<div style="color:#00875A;font-size:13px;font-weight:600;white-space:pre-wrap;overflow:hidden;text-overflow:ellipsis;max-height:100px;">
  <span style="color:#00875A;font-weight:600;">This premium product is designed for professional use, ensuring top-tier performance with enhanced durability...</span>
</div>
```

> **注意**：
> - 使用 `white-space:pre-wrap` 保留换行符
> - 使用 `max-height:100px` 限制显示高度
> - 使用 `overflow:hidden` 和 `text-overflow:ellipsis` 处理超长内容
> - **必须先解码 CSV 字段**，否则 `{{NL}}` 占位符会直接显示

### 多语言适配

固定页面模板（标题、统计摘要、页脚提示等）需要根据用户当前输入的语言进行适配：

| 元素 | 英文 | 中文 |
|------|------|------|
| 主标题 | `## Product Optimization Preview` | `## 商品优化预览` |
| 统计摘要 | `N products optimized · Fields: Title, Price, MOQ` | `共 N 个商品被优化 · 涉及字段：标题、价格、MOQ` |
| 页脚提示 | `Review changes above. If everything looks good, confirm to proceed with publishing.` | `请检查以上变更。如果一切正常，请确认发布。` |
| 表格表头 | `Field | Before | After` | `字段 | 优化前 | 优化后` |
| 字段名 | `Title, Price, MOQ, Lead Time, Images, Properties, Description, Category, Unit Weight, Unit Size, Shipping Template, Inventory, PIS, Keywords, Currency` | `标题、价格、MOQ、交期、图片、属性、描述、类目、单位重量、单位尺寸、运费模板、发货地与库存、质量分、关键词、币种` |

**语言检测规则**：
- 如果用户输入包含中文字符，使用中文模板
- 如果用户输入为纯英文，使用英文模板
- 商品的具体信息（如 `productId`、`before.title`、价格等）保持原始数据，不进行翻译

### 价格渲染规则

`price` 为 **`ProductPriceDTO` 对象**（CSV 中常为 JSON 字符串），根据 **`priceType`** 分支渲染。**Before / After 均须先解析再渲染**，禁止在表格中展示转义后的整段 JSON 原文。

#### 1. SKU 价格（`priceType: "sku"`）

当解析后的 `priceType` 为 `"sku"` 时，使用 **`skuPrices`** 列表渲染：

**Before 列渲染**：显示 SKU 价格列表
**After 列渲染**：显示优化后的 SKU 价格列表

**数据格式**：
```json
{
  "skuPrices": [
    {"skuName": "Xxs, Red", "price": 1.0, "skuId": 107473546692},
    {"skuName": "M, Lavender", "price": 2.0, "skuId": 107869507058}
  ],
  "priceType": "sku",
  "currency": "USD"
}
```

**Before 列渲染方式**：
```html
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="background:#E6F7ED;color:#00875A;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;margin-right:8px;">SKU</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#696969;font-size:13px;margin-right:16px;">Xxs, Red</span>
  <span style="color:#8B5CF6;font-size:16px;font-weight:600;">USD 1.00</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#696969;font-size:13px;margin-right:16px;">M, Lavender</span>
  <span style="color:#8B5CF6;font-size:16px;font-weight:600;">USD 2.00</span>
</div>
```

**After 列渲染方式**：
```html
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="background:#E6F7ED;color:#00875A;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;margin-right:8px;">SKU</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#696969;font-size:13px;margin-right:16px;">Xxs, Red</span>
  <span style="color:#00875A;font-size:16px;font-weight:600;">USD 0.90</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#696969;font-size:13px;margin-right:16px;">M, Lavender</span>
  <span style="color:#00875A;font-size:16px;font-weight:600;">USD 1.80</span>
</div>
```

> **注意**：After 列的价格文字使用绿色 `#00875A` 加粗，以标记变化。Before 列的价格文字使用紫色 `#8B5CF6` 加粗。

#### 2. 阶梯价格（`priceType: "ladder"` 或 `"tiered"`）

`ProductPriceDTO` 中 **`priceType` 为 `"ladder"` 或 `"tiered"` 时均使用 `ladderPrices` 数组**（元素为 **`minQuantity`、`price`**，无 `maxQuantity` 字段）。按 `minQuantity` 升序渲染；相邻两档之间可用区间文案（如 `1-10 pieces`），最后一档使用 `≥{minQuantity} pieces`。

**数据格式**：
```json
{
  "ladderPrices": [
    {"minQuantity": 1, "price": 635.0},
    {"minQuantity": 11, "price": 535.0},
    {"minQuantity": 21, "price": 435.0}
  ],
  "priceType": "ladder",
  "currency": "USD"
}
```

**渲染方式**（与上表结构一致，`tiered` 仅标签文案可仍显示为 `Tiered`）：
```html
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="background:#E6F0FF;color:#3B82F6;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;margin-right:8px;">Tiered</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#696969;font-size:13px;margin-right:16px;">1-10 pieces</span>
  <span style="color:#8B5CF6;font-size:16px;font-weight:600;">USD 635.00</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#696969;font-size:13px;margin-right:16px;">11-20 pieces</span>
  <span style="color:#8B5CF6;font-size:16px;font-weight:600;">USD 535.00</span>
</div>
<div style="display:flex;align-items:center;margin-bottom:4px;">
  <span style="color:#696969;font-size:13px;margin-right:16px;">≥21 pieces</span>
  <span style="color:#8B5CF6;font-size:16px;font-weight:600;">USD 435.00</span>
</div>
```

#### 3. 区间价格（`priceType: "range"`）

当 `priceType` 为 `"range"` 时，按以下方式渲染：

**数据格式**：
```json
{
  "minPrice": 50.0,
  "maxPrice": 70.0,
  "priceType": "range",
  "currency": "USD"
}
```

**渲染方式**：
```html
<div style="display:flex;align-items:center;">
  <span style="background:#FEF3C7;color:#D97706;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;margin-right:8px;">Range</span>
  <span style="color:#8B5CF6;font-size:16px;font-weight:600;">USD 50.00 - 70.00</span>
</div>
```

#### 4. 固定价格（无 `priceType` 或 `priceType: "fixed"`）

使用 **`fixedPrice`（字符串）** 与 **`currency`** 展示固定价，例如：

**数据格式**：
```json
{
  "priceType": "fixed",
  "currency": "USD",
  "fixedPrice": "99.00"
}
```

**渲染方式**：
```html
<span style="color:#696969;font-size:13px;">USD 99.00</span>
```

**样式说明**：
- **SKU 标签**：浅绿色背景 `#E6F7ED` + 绿色文字 `#00875A`，圆角，内边距 4px 8px
- **Tiered 标签**：浅蓝色背景 `#E6F0FF` + 蓝色文字 `#3B82F6`，圆角，内边距 4px 8px
- **Range 标签**：浅黄色背景 `#FEF3C7` + 橙色文字 `#D97706`，圆角，内边距 4px 8px
- **价格文字**：紫色 `#8B5CF6`，加粗 `font-weight: 600`，16px
- **SKU 名称/数量范围**：灰色 `#696969`，13px
- **标签与价格间距**：标签右侧 margin 8px，标签与价格在同一行显示

## 样式规范

在 Markdown 中通过嵌入 HTML 标签实现以下样式效果：

### 色彩

| 用途 | 色值 | 实现方式 |
|------|------|----------|
| After 变化文字 | `#00875A`（绿色加粗） | `<span style="color:#00875A;font-weight:600">` |
| Before 文字 | `#696969` | `<span style="color:#696969">` |
| 次要文字 | `#696969` | `<span style="color:#696969;font-size:12px">` |

> **注意**：After 列**不使用背景色**（`background`），仅通过绿色文字 + 加粗来标记变化。使用背景色的 `<span>` 在部分 Markdown 渲染器中会产生多余的色块伪影。

### 卡片布局

使用 `<div>` 标签实现卡片效果：

```html
<div style="background:#FFF;border:1px solid #DDD;border-radius:8px;padding:20px;margin-bottom:16px;">
  <!-- 卡片内容 -->
</div>
```

### 商品主图

```html
<img src="{{absSummImageUrl}}" width="80" height="80" style="border-radius:4px;object-fit:cover;float:left;margin-right:16px;" />
```

## 输出要求

1. **直接在对话中输出 Markdown**：不生成独立文件，直接作为 Agent 回复内容输出
2. **可嵌入 HTML 标签**：使用内联 `style` 属性实现样式，确保在支持 HTML 渲染的 Markdown 环境中展示效果与纯 HTML 页面一致
3. **降级兼容**：即使 Markdown 渲染器不支持 HTML 标签，纯 Markdown 表格和文本仍可读

## 示例 Markdown 输出

以下为 Agent 应输出的 Markdown 格式示例（`{{...}}` 为占位符，表示从 CSV 对应列取值）：

````markdown
## Product Optimization Preview

<span style="color:#696969;font-size:13px">3 products optimized · Fields: Title, Price, MOQ</span>

---

<div style="background:#FFF;border:1px solid #DDD;border-radius:8px;padding:20px;margin-bottom:16px;">

<img src="{{absSummImageUrl}}" width="80" height="80" style="border-radius:4px;object-fit:cover;float:left;margin-right:16px;" />

**ID: {{productId || generalProductId}}**
**{{before.title}}**

<div style="clear:both"></div>

> **商品 ID 渲染规则**：当 `productId` 有值时渲染 `productId`，否则渲染 `generalProductId`。

<!-- 统一使用 HTML table 渲染所有字段 -->
<table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:13px;">
  <tr style="border-bottom:1px solid #EEE;">
    <th style="text-align:left;padding:8px 0;color:#696969;width:20%;">Field</th>
    <th style="text-align:left;padding:8px 0;color:#696969;width:40%;">Before</th>
    <th style="text-align:left;padding:8px 0;color:#696969;width:40%;">After</th>
  </tr>
  <tr style="border-bottom:1px solid #F5F5F5;">
    <td style="padding:8px 0;">Title</td>
    <td style="padding:8px 0;"><span style="color:#696969;">{{before.title}}</span></td>
    <td style="padding:8px 0;"><span style="color:#00875A;font-weight:600;">{{after.title}}</span></td>
  </tr>
  <tr style="border-bottom:1px solid #F5F5F5;">
    <td style="padding:8px 0;">MOQ</td>
    <td style="padding:8px 0;">{{before.moq}}</td>
    <td style="padding:8px 0;"><span style="color:#00875A;font-weight:600;">{{after.moq}}</span></td>
  </tr>
  <tr style="border-bottom:1px solid #F5F5F5;">
    <td style="padding:8px 0;vertical-align:top;">Price</td>
    <td style="padding:8px 0;vertical-align:top;">
      <div style="margin-bottom:4px;"><span style="background:#E6F7ED;color:#00875A;padding:2px 6px;border-radius:4px;font-size:12px;">SKU</span></div>
      <div style="margin-bottom:2px;"><span style="color:#696969;">Xxs, Red</span> <span style="color:#8B5CF6;font-weight:600;">USD 1.00</span></div>
      <div style="margin-bottom:2px;"><span style="color:#696969;">M, Lavender</span> <span style="color:#8B5CF6;font-weight:600;">USD 2.00</span></div>
    </td>
    <td style="padding:8px 0;vertical-align:top;">
      <div style="margin-bottom:4px;"><span style="background:#E6F7ED;color:#00875A;padding:2px 6px;border-radius:4px;font-size:12px;">SKU</span></div>
      <div style="margin-bottom:2px;"><span style="color:#696969;">Xxs, Red</span> <span style="color:#00875A;font-weight:600;">USD 0.90</span></div>
      <div style="margin-bottom:2px;"><span style="color:#696969;">M, Lavender</span> <span style="color:#00875A;font-weight:600;">USD 1.80</span></div>
    </td>
  </tr>
</table>

</div>

<div style="background:#FFF;border:1px solid #DDD;border-radius:8px;padding:20px;margin-bottom:16px;">

**ID: {{productId_2 || generalProductId_2}}**
**{{before.title_2}}**

<!-- 统一使用 HTML table 渲染所有字段 -->
<table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:13px;">
  <tr style="border-bottom:1px solid #EEE;">
    <th style="text-align:left;padding:8px 0;color:#696969;width:20%;">Field</th>
    <th style="text-align:left;padding:8px 0;color:#696969;width:40%;">Before</th>
    <th style="text-align:left;padding:8px 0;color:#696969;width:40%;">After</th>
  </tr>
  <tr style="border-bottom:1px solid #F5F5F5;">
    <td style="padding:8px 0;">Title</td>
    <td style="padding:8px 0;"><span style="color:#696969;">{{before.title_2}}</span></td>
    <td style="padding:8px 0;"><span style="color:#00875A;font-weight:600;">{{after.title_2}}</span></td>
  </tr>
  <tr style="border-bottom:1px solid #F5F5F5;">
    <td style="padding:8px 0;vertical-align:top;">Lead Time</td>
    <td style="padding:8px 0;vertical-align:top;">
      <div style="margin-bottom:2px;"><span style="color:#696969;">≥1 pieces, 12 days</span></div>
      <div style="margin-bottom:2px;"><span style="color:#696969;">≥100 pieces, 30 days</span></div>
      <div style="margin-bottom:2px;"><span style="color:#696969;">≥200 pieces, 38 days</span></div>
    </td>
    <td style="padding:8px 0;vertical-align:top;">
      <div style="margin-bottom:2px;"><span style="color:#00875A;font-weight:600;">≥1 pieces, 7 days</span></div>
      <div style="margin-bottom:2px;"><span style="color:#00875A;font-weight:600;">≥100 pieces, 20 days</span></div>
      <div style="margin-bottom:2px;"><span style="color:#8B5CF6;">≥200 pieces, 38 days</span></div>
    </td>
  </tr>
</table>

</div>

---

<span style="color:#696969;font-size:12px">Review changes above. If everything looks good, confirm to proceed with publishing.</span>
````

> **注意**：
> - 以上为示例模板，实际输出时需根据 CSV 数据动态填充商品卡片和对比字段行。
> - 每个商品一个 `<div>` 卡片。
> - **所有字段统一使用 HTML `<table>` 渲染**，禁止使用 Markdown 表格。复杂字段（price、leadTime、properties 等）在 `<td>` 单元格内使用 `<div>` 实现多行渲染，并设置 `vertical-align:top;` 确保顶部对齐。
> - **绝不能将未解析的 JSON 原文直接作为文本放在表格单元格内显示**。
> - 仅展示 `after.*` 非空的字段行，无变化的字段不出现。
> - **必须展示所有被优化的商品**，不得限制显示数量。若商品数量较多，应完整展示所有商品卡片，让用户能够查看完整的优化结果。

---

## 发布结果渲染规则

Step 3（发布）完成后，Agent 需要渲染每个商品的发布结果。每个商品渲染为一张卡片，包含发布状态和商品信息。

### 成功卡片

发布成功的商品使用绿色状态标签：

```html
<div style="background:#FFF;border:1px solid #DDD;border-radius:8px;padding:16px;margin-bottom:12px;">
  <div style="display:flex;align-items:flex-start;gap:12px;">
    <img src="{{absSummImageUrl}}" width="48" height="48" style="border-radius:4px;object-fit:cover;" />
    <div style="flex:1;">
      <div style="margin-bottom:4px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#00875A;margin-right:6px;vertical-align:middle;"></span>
        <span style="color:#00875A;font-size:13px;font-weight:500;">Apply successful</span>
      </div>
      <div style="color:#333;font-size:14px;margin-bottom:4px;">{{before.title}}</div>
      <div style="color:#888;font-size:12px;margin-top:2px;">
        ID: {{productId || generalProductId}} | PIS: {{before.pis}} → <span style="color:#00875A;font-weight:600;">{{after.pis}}</span>
      </div>
    </div>
  </div>
</div>
```

### 失败卡片

发布失败的商品使用红色状态标签，并展示失败原因（`reason` 字段）：

```html
<div style="background:#FFF;border:1px solid #DDD;border-radius:8px;padding:16px;margin-bottom:12px;">
  <div style="display:flex;align-items:flex-start;gap:12px;">
    <img src="{{absSummImageUrl}}" width="48" height="48" style="border-radius:4px;object-fit:cover;" />
    <div style="flex:1;">
      <div style="margin-bottom:4px;padding:4px 8px;background:#FEE2E2;border-radius:4px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#DC2626;margin-right:6px;vertical-align:middle;"></span>
        <span style="color:#DC2626;font-size:13px;font-weight:500;">Apply failed：{{reason}}</span>
      </div>
      <div style="color:#333;font-size:14px;margin-bottom:4px;">{{before.title}}</div>
      <div style="color:#696969;font-size:12px;">
        ID: {{productId || generalProductId}}
      </div>
    </div>
  </div>
</div>
```

### 多语言适配

| 元素 | 英文 | 中文 |
|------|------|------|
| 成功状态 | `Apply successful` | `发布成功` |
| 失败状态 | `Apply failed：{{reason}}` | `发布失败：{{reason}}` |

### 示例 Markdown 输出

````markdown
## Publish Result

<span style="color:#696969;font-size:13px">3 products published · 2 successful, 1 failed</span>

---

<div style="background:#FFF;border:1px solid #DDD;border-radius:8px;padding:16px;margin-bottom:12px;">
  <div style="display:flex;align-items:flex-start;gap:12px;">
    <img src="https://example.com/image1.jpg" width="48" height="48" style="border-radius:4px;object-fit:cover;" />
    <div style="flex:1;">
      <div style="margin-bottom:4px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#00875A;margin-right:6px;vertical-align:middle;"></span>
        <span style="color:#00875A;font-size:13px;font-weight:500;">Apply successful</span>
      </div>
      <div style="color:#333;font-size:14px;margin-bottom:4px;">Premium Quality Natural Dried Green Raisins - Sultana Variety</div>
      <div style="color:#696969;font-size:12px;">
        ID: {{productId || generalProductId}}
      </div>
    </div>
  </div>
</div>

<div style="background:#FFF;border:1px solid #DDD;border-radius:8px;padding:16px;margin-bottom:12px;">
  <div style="display:flex;align-items:flex-start;gap:12px;">
    <img src="https://example.com/image2.jpg" width="48" height="48" style="border-radius:4px;object-fit:cover;" />
    <div style="flex:1;">
      <div style="margin-bottom:4px;padding:4px 8px;background:#FEE2E2;border-radius:4px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#DC2626;margin-right:6px;vertical-align:middle;"></span>
        <span style="color:#DC2626;font-size:13px;font-weight:500;">Apply failed：Price format invalid</span>
      </div>
      <div style="color:#333;font-size:14px;margin-bottom:4px;">Premium Quality Natural Dried Green Raisins - Sultana Variety</div>
      <div style="color:#696969;font-size:12px;">
        ID: {{productId || generalProductId}}
      </div>
    </div>
  </div>
</div>

---

<span style="color:#696969;font-size:12px">Published 2 of 3 products successfully. 1 product failed.</span>
````
