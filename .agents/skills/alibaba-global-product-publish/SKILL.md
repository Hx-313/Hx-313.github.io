---
name: alibaba-global-product-publish
description: 商品发布（新发+编辑）。负责发布前参数一致性自检（C1-C10）、双重确认、批量发布、发布错误诊断、结果汇总。支持两种模式：① 新发模式（搬品场景，productId 为空）② 编辑模式（存量商品优化场景，productId 非空）。统一使用 publish_ggs_migration_product 接口。
When to use: 搬品任务完成优化后需要发布新品时使用本 Skill；存量商品优化完成后需要发布编辑结果时也使用本 Skill
Skip for: 搬品意图识别 → 使用 alibaba-global-product-migration-entry；搬品任务执行/优化 → 使用 alibaba-global-product-migration-executor；存量商品优化 → 使用 alibaba-global-product-optimize
---

# 商品发布 Skill（新发 + 编辑）

## 核心规则（不可跳过）

1. **发布前双重确认**：必须让用户 ① 知悉风险 ② 确认执行，缺一不可。
2. **所有工具通过 MCP 调用**：参数定义见 `references/tools-openapi.md`。
3. **MCP 调用失败直接终止**：任何 MCP 工具调用失败时，**立即将错误信息返回给用户，不尝试替代方案、不自行重试、不绕道执行**。严格按照本 Skill 定义的流程操作，禁止做流程外的额外动作。
4. **交互效率优先**：每轮对话只传递必要信息，不做冗余解释或重复确认。能合并的步骤合并执行，能自动推断的参数不追问用户。
5. **语言适配**：Agent 输出必须使用用户当前使用的语言。
6. **🚫 严禁重试发布接口**：`publish_ggs_migration_product` 调用失败后，**绝对不允许自动重试**。必须将错误信息完整展示给用户，由用户自行决定是否重新发布。Agent 在任何情况下都不得自行再次调用该接口。
7. **🚫 防私自简化红线（Anti-Simplification Red Line）**：以下行为被**严格禁止**，违反任何一条等同于流程错误：
   - **禁止省略字段构造**：构造 `after` 对象时，必须逐一遍历 ProductSnapshotDTO 全部 15 个字段，不得因"字段为空"或"与 before 相同"而跳过任何字段的取值逻辑
   - **禁止跳过校验步骤**：类目校验、`priceType` 必填校验、`unitSize` 格式校验、`keywords` 格式校验——每一项都必须显式执行，不得以"数据看起来正确"为由跳过
   - **禁止简化错误处理**：MCP 调用失败时必须展示完整错误信息（含工具名、错误码、错误消息），不得简化为"发布失败，请重试"等笼统提示
   - **禁止省略一致性自检**：发布前的参数一致性自检（见下方自检协议）必须完整执行，不得跳过
   - **禁止捏造库存数据**：绝对禁止在发布时私自为商品编造发货地与库存（`inventory`）数量（如默认写 100 或 1000）。若原始数据无库存，必须保持为空，严禁擅自填充。
8. **新发 vs 编辑模式自动识别（Publish Mode Auto-Detection）**：
   - 发布前，Agent 必须检查 CSV 中每个商品的 `productId` 字段，自动识别发布模式：
     - **`productId` 为空**：**新发模式** — `before` 传 `null`，`after` 包含完整商品数据
     - **`productId` 非空**：**编辑模式** — `before` 传优化前的完整快照（从 CSV 的 `before.*` 列构造），`after` 传优化后的完整快照（从 CSV 的 `after.*` 列构造，未优化字段设 `null`）
   - **统一使用 `publish_ggs_migration_product` 接口**，新发和编辑都通过同一个接口提交，后端根据 `productId` 是否存在自动区分语义
   - 双重确认菜单中需向用户明确展示两组商品数量：「新发 X 个 + 编辑更新 Y 个」
9. **⚠️ 同商品多类型优化合并规则（Multi-Type Optimization Merge Rule）**：
    - 当同一商品同时存在「字段优化结果」（如标题、价格、交期等）和「图片优化结果」（来自 `ggs-image-generation` Sub Agent）时，**必须将两者合并到同一次 `publish_ggs_migration_product` 调用的同一个 record 中一次性发布**
    - 即 `after` 对象中同时包含优化后的字段值和优化后的图片列表
    - **严禁对同一商品分多次调用发布接口**，因为前一次发布会触发平台审核，导致后续发布被拒或覆盖前一次的优化结果

## 执行协议

- `publish_ggs_migration_product` 超时 **120s**。
- **MCP 失败处理**：工具返回错误或超时时，直接告知用户失败原因和具体的 MCP 工具名称，由用户决定是否重试。Agent 禁止自行用其他方式（如本地模拟、HTTP 请求、换工具）替代执行。

---

## ▶ Step 4：发布

> **🚫 严禁重试发布接口**：`publish_ggs_migration_product` 调用失败后**绝对不允许自动重试**，必须将完整错误信息展示给用户，由用户自行决定下一步操作。

> **⚠️ 核心原则：`before` 和 `after` 的传值取决于发布模式。**
> - **新发模式**（`productId` 为空）：`before` 固定传 `null`，`after` 包含完整的商品数据
> - **编辑模式**（`productId` 非空）：`before` 传优化前的完整快照（从 CSV 的 `before.*` 列构造），`after` 传优化后的完整快照（从 CSV 的 `after.*` 列构造，未优化字段设 `null`）

### 1. 发布前参数一致性自检协议（C1-C10）
**注：如果是发布草稿品，这些自检项可以忽略。注意仅针对发布为草稿品的情况。其余情况一律不可忽略**。
**注：如果是发布草稿品，这些自检项可以忽略。注意仅针对发布为草稿品的情况。其余情况一律不可忽略**
**注：如果是发布草稿品，这些自检项可以忽略。注意仅针对发布为草稿品的情况。其余情况一律不可忽略**
在调用发布接口前，Agent 必须对 CSV 中的每个商品执行以下 10 项一致性自检。**建议使用 Python 脚本自动化执行**：`python references/build_payload.py <CSV文件路径> publish_payload.json [物流模版ID] [物流模版名称]`

| 自检项 | 检查内容 | 失败处理 |
|--------|---------|---------|
| **C1: 类目必填** | `after.category` 或 `before.category` 至少有一个非空，且包含有效的 `categoryId` 和 `categoryPath` | 阻断发布，提示用户先通过优化补全类目 |
| **C2: priceType 必填且限定** | `after.price.priceType` 不能为 null 或空，**发布只接受 `sku` 和 `ladder` 两种**（小写），其他类型（`fixed`/`tiered`/`range`）必须在发布前转换为 `ladder`。阶梯价允许只有一档（即 `ladderPrices` 数组长度为 1）。**若阶梯价为一档，则 `moq` 与 `ladderPrices[0].minQuantity` 必须相同** | 阻断发布：若 priceType 不是 `sku`/`ladder` 则自动转换为 `ladder`；若一档阶梯价的 `minQuantity` 与 `moq` 不一致则自动修正 `minQuantity = moq` |
| **C3: unitSize 格式** | `after.unitSize` 必须为纯数字 + `x` 分隔符格式（如 `"30x20x15"`），禁止包含单位后缀（如 `cm`、`mm`） | 自动清洗：去除所有非数字和 `x` 的字符 |
| **C4: keywords 格式** | `after.keywords` 必须为 JSON 数组格式的字符串（如 `"[\"electronics\",\"gadget\"]"`），禁止传纯文本 | 自动转换：若为纯文本则转换为 JSON 数组字符串 |
| **C5: currency 一致性** | `after.price.currency` 与 `after.currencyCode` 应保持一致（若两者都存在） | 警告提示，不阻断 |
| **C6: inventory 非捏造** | `after.inventory` 若存在，必须来自原始数据或用户明确输入，**禁止 Agent 自行填充默认值**（如 100、1000） | 若发现疑似捏造，阻断并发布警告 |
| **C7: images 非空** | `after.images` 数组不能为空，至少包含一张有效图片 URL | 阻断发布，提示用户补充图片 |
| **C8: title 非空** | `after.title` 不能为空字符串或 null | 阻断发布，提示用户补充标题 |
| **C9: description 完整性** | `after.description` 若存在，应为完整的 HTML 字符串，标签闭合 | 警告提示，不阻断 |
| **C10: shippingTemplate 优先** | 若用户在 Step 0 选择了物流模版，`after.shippingTemplate` 必须携带该模版信息（`id` 和 `name`） | 自动注入：从用户选择中提取并填充 |

> **脚本输出**：自检脚本会生成 `publish_payload.json`，其中包含 `has_errors` 布尔值和 `errors` 数组。Agent 读取该文件，若 `has_errors` 为 true，则阻断发布，向用户展示 `errors` 数组中的具体失败原因，提示用户修改 CSV 后重试。只有当 `has_errors` 为 false 时，才能继续发布。

### 2. 双重确认交互菜单

在完成自检且无错误后，Agent 必须向用户展示以下确认菜单，**等待用户明确回复后才能执行发布**：

> 📦 **发布前确认**
> 
> 即将发布 **X** 个商品到 Alibaba 国际站（新发 **A** 个 + 编辑更新 **B** 个）。
> 
> ⚠️ **风险提示**：
> - 发布操作不可逆，一旦成功将在国际站上线
> - 若发布失败，需根据错误信息手动修正后重新发布
> - 新发商品将直接上线，编辑商品将覆盖当前线上版本
> 
> 🔧 **请选择下一步操作**
> - **「确认发布」** → 执行批量发布
> - **「取消发布」** → 结束本次任务，保留 CSV 供后续使用
> - **「查看商品详情」** → 渲染发布前的商品预览表格

### 3. 批量发布执行

> **⚠️ 分批限制**：每次调用 `publish_ggs_migration_product` 接口，`records` 数组**最多包含 5 个商品**。商品数量超过 5 个时必须分批调用，避免超出平台上下文限制导致调用失败。

用户确认后，Agent 执行以下步骤：

1. **构造发布 Payload**：
   - 调用 `python references/build_payload.py <CSV文件路径> publish_payload.json [物流模版ID] [物流模版名称]` 生成 `publish_payload.json`
   - 读取该文件，提取 `records` 数组。脚本会自动根据 `productId` 是否有值决定 `before` 的构造方式（新发传 `null`，编辑传完整快照）

2. **调用发布接口**：
   - 使用 `accio-mcp-cli call publish_ggs_migration_product --json "$(cat final_payload.json)"` 调用发布接口
   - **⚠️ 核心注意**：`final_payload.json` 必须包含完整的 JSON 结构：`{"records": [...]}` （搬品场景下可附加 `"taskId": <任务ID>`）
   - **防转义报错最佳实践**：先用 Python 或 `jq` 将完整 JSON 写入临时文件，再调用 CLI，避免命令行转义问题

3. **保存响应结果**：
   - 将接口返回的 JSON 结果保存为本地文件 `publish_response.json`

4. **更新 CSV 状态**：
   - 执行 `python references/update_publish_result.py <CSV文件路径> publish_response.json`
   - 该脚本会自动将发布状态（SUCCESS/FAILED）、商品链接（URL）和失败原因写回 CSV 文件

### 4. 发布错误诊断指引

#### 整体调用失败诊断表

若 `publish_ggs_migration_product` 接口本身调用失败（非单商品失败），参考以下诊断：

| 错误现象 | 可能原因 | 解决方案 |
|---------|---------|---------|
| `Error: null` | **Payload 格式错误** | 检查 JSON payload 结构是否正确，`records` 数组是否非空 |
| `SignatureDoesNotMatch` | curl 上传 OSS 时携带了 `Content-Type` 头 | 检查 curl 命令，移除 `-H "Content-Type: ..."` |
| `ALREADY_HAS_RUNNING_TASK` | 用户已有正在运行的搬品任务 | 询问用户是否调用 `ggs_cancel_migration_task` 取消老任务 |
| 超时（120s） | 网络问题或后端处理缓慢 | 建议用户稍后重试，或联系技术支持 |
| MCP 连接失败 | MCP 服务不可用 | 检查 MCP 配置，重启 IDE 或联系平台支持 |

#### 单商品发布失败诊断表

若接口调用成功但部分商品发布失败，`errorMsgList` 中包含失败原因：

| 错误消息 | 可能原因 | 解决方案 |
|---------|---------|---------|
| `Category ID is invalid` | 类目 ID 不存在或已废弃 | 通过优化重新推断类目，或手动指定有效类目 ID |
| `Price type is missing` | `priceType` 字段为空或 null | 检查 CSV 中 `after.price.priceType`，确保为有效枚举值 |
| `Unit size format error` | `unitSize` 格式不符合要求 | 执行 C3 自检，自动清洗为单位后缀 |
| `Keywords format error` | `keywords` 不是 JSON 数组字符串 | 执行 C4 自检，转换为 JSON 数组格式 |
| `Image URL is invalid` | 图片 URL 无法访问或格式错误 | 检查图片 URL 有效性，重新上传或替换 |
| `Title is empty` | 商品标题为空 | 补充标题后重新发布 |
| `Inventory data is invalid` | 库存数据格式错误 | 检查 `inventory` 字段是否为合法的 JSON 字符串 |

#### 诊断报告输出格式

发布完成后，Agent 必须输出以下格式的总结：

```markdown
## 📊 发布结果汇总

| 指标 | 数值 |
|------|------|
| 成功发布 | X 个 |
| 发布失败 | Y 个 |
| 跳过（已发布） | Z 个 |

### ✅ 成功商品列表

| 商品ID | 商品链接 |
|--------|---------|
| 123456789 | [查看商品](https://www.alibaba.com/product-detail/...) |
| 987654321 | [查看商品](https://www.alibaba.com/product-detail/...) |

### ❌ 失败商品列表

| 商品ID | 失败原因 |
|--------|---------|
| 111222333 | Category ID is invalid |
| 444555666 | Price type is missing |

> 💡 **建议**：针对失败商品，可根据上述诊断表修正后重新发布。
```

### 5. 发布结果汇总菜单

发布完成后，Agent 输出以下交互菜单：

> 🔧 **后续操作建议**
> 请选择：
> - **「修复失败商品并重试」** → 告诉我具体修复方案，我帮您修改后重新发布失败的商品
> - **「结束搬品」** → 结束本次任务
> 
> 🚀 **进阶运营建议（获取更多流量）**
> 恭喜您成功发布新品！建议您趁热打铁，将它们转化为高流量的"定招品"：
> - **「发掘潜力定招品」** → 帮我分析这批新品中哪些具备成为"定招品"的潜力
> - **「一键优化为定招品」** → 针对这批新品，执行定招品专属优化策略，获取平台专属流量扶持

---

## Dependencies

- **MCP 工具**：`publish_ggs_migration_product`（统一发布接口，支持新发+编辑）、`ggs_cancel_migration_task`（用于取消冲突的搬品任务）
- **上游 Skill**：
  - `alibaba-global-product-migration-executor`（搬品场景，提供新发商品的优化 CSV）
  - `alibaba-global-product-optimize`（存量商品优化场景，提供编辑商品的优化 CSV）
- **本地能力**：CSV 读写、JSON 序列化、Python 脚本执行（`build_payload.py`、`update_publish_result.py`）

## ProductSnapshotDTO 完整结构参考

本章节是 `ProductSnapshotDTO` 及其所有嵌套类型的**权威结构定义**，所有构造 `before`/`after` 参数、`publish_ggs_migration_product` 等工具调用时，**必须严格遵循本文档的字段名、类型和嵌套结构**。

---

### 类型层级总览

```
ProductSandboxRecordDTO                    // 沙盒记录（顶层）
 ├── productId: String                     // 商品 ID
 ├── generalProductId: String              // 通用商品 ID（搬品/新品场景有值）
 ├── absSummImageUrl: String               // 商品主图缩略图 URL
 ├── isExcluded: Boolean                   // 是否排除
 ├── status: String                        // 状态：PENDING / SUCCESS / FAILED
 ├── reason: String                        // 失败原因
 ├── before: ProductSnapshotDTO            // 优化前快照
 └── after: ProductSnapshotDTO             // 优化后快照

ProductSnapshotDTO                         // 商品快照
 ├── title: String
 ├── price: ProductPriceDTO                // ⬇️ 嵌套对象
 │    ├── priceType: String                // 枚举：sku / ladder / tiered / range / fixed
 │    ├── currency: String
 │    ├── skuPrices: SkuPriceItem[]
 │    │    ├── skuName: String
 │    │    ├── price: Double
 │    │    └── skuId: Long
 │    ├── ladderPrices: LadderPriceItem[]
 │    │    ├── minQuantity: Integer
 │    │    └── price: Double
 │    ├── minPrice: Double
 │    ├── maxPrice: Double
 │    └── fixedPrice: String
 ├── leadTime: QuantityTieredLeadTime[]    // ⬇️ 嵌套数组
 │    ├── quantity: Integer                // 数量档
 │    └── leadTime: Integer               // 交期天数
 ├── moq: Integer
 ├── unitWeight: Double
 ├── unitSize: String
 ├── shippingTemplate: ShippingTemplateDTO // ⬇️ 嵌套对象
 │    ├── id: Long
 │    └── name: String
 ├── category: CategoryDTO                // ⬇️ 嵌套对象
 │    ├── categoryId: Long
 │    └── categoryPath: String
 ├── description: String
 ├── properties: GlobalProductAttribute[] // ⬇️ 嵌套数组
 │    ├── attributeId: Long
 │    ├── attributeName: String
 │    ├── attributeValue: String
 │    └── attributeValueId: Long
 ├── images: String[]
 ├── inventory: String
 ├── pis: Double
 ├── keywords: String                     // JSON 数组字符串
 └── currencyCode: String
```

---

### 各类型字段详细说明

#### ProductSandboxRecordDTO（顶层记录）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `productId` | String | 条件必填 | 商品 ID，字符串格式。存量商品必填；新发品/搬品场景商家未提供时传 `null`，**严禁构造虚拟 ID** |
| `generalProductId` | String | 否 | 通用商品 ID（搬品/新品场景有值，存量商品通常为空） |
| `absSummImageUrl` | String | 否 | 商品主图缩略图 URL |
| `isExcluded` | Boolean | 是 | 是否已被排除，默认 `false` |
| `status` | String | 否 | 状态枚举：`PENDING` / `SUCCESS` / `FAILED` |
| `reason` | String | 否 | 失败原因（仅 status=FAILED 时有值） |
| `before` | ProductSnapshotDTO | 是 | 优化前的商品快照，**必须完整传入所有有值字段** |
| `after` | ProductSnapshotDTO | 条件必填 | 优化后的商品快照（提交优化时可为空，发布时必须完整） |
| `isPotentialCompetitive` | Boolean | 否 | 是否为潜在趋势品。由后端在优化完成后自动填充，Agent **只读不写**。`true` 表示该商品经过优化后有机会成为趋势竞争力品 |

#### ProductSnapshotDTO（商品快照）

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| `title` | String | 是 | 非空字符串 | 商品标题 |
| `price` | ProductPriceDTO | 是 | 嵌套对象，非字符串 | 商品价格，详见下文 |
| `leadTime` | QuantityTieredLeadTime[] | 是 | 嵌套数组，按 quantity 升序 | 阶梯交期 |
| `moq` | Integer | 是 | 正整数 | 最小起订量 |
| `unitWeight` | Double | 否 | 正数，单位：千克 | 单件毛重 |
| `unitSize` | String | 否 | 纯数字+`x`分隔，如 `"30x20x15"` | 包装尺寸（长x宽x高），**禁止包含 cm/mm 等单位后缀** |
| `shippingTemplate` | ShippingTemplateDTO | 否 | 嵌套对象，非字符串 | 物流模板 |
| `category` | CategoryDTO | 条件必填 | 嵌套对象，非字符串 | 类目信息，**发布时必须有值** |
| `description` | String | 否 | HTML 字符串，保留所有标签 | 商品描述 |
| `properties` | GlobalProductAttribute[] | 否 | 嵌套数组 | 商品属性列表 |
| `images` | String[] | 否 | URL 字符串数组 | 商品图片 URL 列表 |
| `inventory` | String | 否 | JSON 字符串，分 SKU/SPU 两种类型 | 库存信息（JSON 字符串），分为 SKU 库存和 SPU 库存两种类型。SKU 类型含 skuInventories 数组，每项含 skuId 和 items；SPU 类型含 items 数组。每个 item 含 dispatchLocation、warehouseCode（可选）、quantity |
| `pis` | Double | 否 | 0-6 分 | 商品质量分 |
| `keywords` | String | 否 | **必须为 JSON 数组格式字符串** | 关键词，如 `"[\"keyword1\",\"keyword2\"]"`，**禁止传纯文本** |
| `currencyCode` | String | 否 | ISO 4217 货币代码 | 币种，如 `"USD"` |

#### ProductPriceDTO（价格对象）

**priceType 为必填字段，必须为小写枚举值。** 根据 priceType 不同，选用对应的价格字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `priceType` | String | **是** | **必填**，枚举值（**小写**）：`sku` / `ladder` / `tiered` / `range` / `fixed` |
| `currency` | String | 是 | 币种，如 `"USD"` |
| `skuPrices` | SkuPriceItem[] | priceType=`sku` 时必填 | SKU 价格列表 |
| `ladderPrices` | LadderPriceItem[] | priceType=`ladder`/`tiered` 时必填 | 阶梯价格列表 |
| `minPrice` | Double | priceType=`range` 时必填 | 最低价 |
| `maxPrice` | Double | priceType=`range` 时必填 | 最高价 |
| `fixedPrice` | String | priceType=`fixed` 时必填 | 固定价格（注意是 String 类型） |

**priceType 与字段对应关系：**

| priceType | 必用字段 | 其余字段 |
|-----------|---------|---------|
| `sku` | `skuPrices` | 其余可为空数组/0/空字符串 |
| `ladder` / `tiered` | `ladderPrices` | 其余可为空数组/0/空字符串 |
| `range` | `minPrice` + `maxPrice` | 其余可为空数组/0/空字符串 |
| `fixed` | `fixedPrice` | 其余可为空数组/0/空字符串 |

#### SkuPriceItem（SKU 价格子项）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `skuName` | String | 是 | SKU 名称，如 `"Xxs, Red"` |
| `price` | Double | 是 | SKU 单价 |
| `skuId` | Long | 是 | SKU ID |

#### LadderPriceItem（阶梯价格子项）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `minQuantity` | Integer | 是 | 起始数量档 |
| `price` | Double | 是 | 对应价格 |

#### QuantityTieredLeadTime（阶梯交期）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `quantity` | Integer | 是 | 数量档（如 1, 100, 500） |
| `leadTime` | Integer | 是 | 交期天数 |

**禁止使用已废弃字段名**：`quantityFrom`、`quantityTo`、`leadTimeFrom`、`leadTimeTo` 均已废弃，严禁使用。

#### ShippingTemplateDTO（物流模板）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | 是 | 物流模板 ID |
| `name` | String | 是 | 物流模板名称 |

#### CategoryDTO（类目信息）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `categoryId` | Long | 是 | 类目 ID |
| `categoryPath` | String | 是 | 类目路径，如 `"Apparel & Accessories > Men's Clothing > Men's T-Shirts"` |

#### GlobalProductAttribute（商品属性）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `attributeId` | Long | 是 | 属性 ID |
| `attributeName` | String | 是 | 属性名称，如 `"Material"` |
| `attributeValue` | String | 是 | 属性值，如 `"100% Cotton"` |
| `attributeValueId` | Long | 是 | 属性值 ID（自定义值时传 `-1`） |

---

### 常见错误与正确对照

#### 错误 1：leadTime 使用废弃字段名

```json
// ❌ 错误 — 使用了废弃字段名
"leadTime": [
  {"quantityFrom": 1, "quantityTo": 99, "leadTimeFrom": 5, "leadTimeTo": 7}
]

// ✅ 正确 — 只用 quantity 和 leadTime
"leadTime": [
  {"quantity": 1, "leadTime": 5},
  {"quantity": 100, "leadTime": 7}
]
```

#### 错误 2：priceType 使用大写或缺失

```json
// ❌ 错误 — priceType 使用大写
"price": {
  "priceType": "SKU",
  ...
}

// ❌ 错误 — priceType 缺失
"price": {
  "currency": "USD",
  "skuPrices": [...]
}

// ✅ 正确 — priceType 小写且必填
"price": {
  "priceType": "sku",
  "currency": "USD",
  "skuPrices": [...]
}
```

#### 错误 3：keywords 传纯文本

```json
// ❌ 错误 — 传纯文本
"keywords": "cotton shirt men casual"

// ❌ 错误 — 传 JSON 数组对象（非字符串）
"keywords": ["cotton", "shirt", "men"]

// ✅ 正确 — JSON 数组格式的字符串
"keywords": "[\"cotton\",\"shirt\",\"men\",\"casual\"]"
```

#### 错误 4：unitSize 包含单位后缀

```json
// ❌ 错误 — 包含 cm 单位
"unitSize": "30x20x15cm"

// ✅ 正确 — 纯数字 + x
"unitSize": "30x20x15"
```

#### 错误 5：嵌套对象传为字符串

```json
// ❌ 错误 — shippingTemplate 传为字符串
"shippingTemplate": "{\"id\": 100001, \"name\": \"Standard\"}"

// ✅ 正确 — shippingTemplate 传为 JSON 对象
"shippingTemplate": {
  "id": 100001,
  "name": "Standard"
}
```

#### 错误 6：before 对象省略字段

```json
// ❌ 错误 — before 只传了部分字段
"before": {
  "title": "Some Title",
  "price": {...}
}

// ✅ 正确 — before 必须传入 CSV 中有值的所有字段
"before": {
  "title": "...",
  "price": {...},
  "leadTime": [...],
  "moq": 2,
  "unitWeight": 0.5,
  "unitSize": "10x10x10",
  "shippingTemplate": {...},
  "category": {...},
  "description": "...",
  "properties": [...],
  "images": [...],
  "inventory": "...",
  "pis": 3.5,
  "keywords": "[...]",
  "currencyCode": "USD"
}
```

---

### 完整 JSON 样例

#### 样例 1：SKU 定价商品的完整 ProductSandboxRecordDTO

```json
{
  "productId": "1601653380590",
  "generalProductId": "",
  "absSummImageUrl": "https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J.png_100x100.png",
  "isExcluded": false,
  "status": "",
  "reason": "",
  "before": {
    "title": "Test 100% Cotton Anti-Wrinkle Casual Regular Fit Printed Shirt",
    "price": {
      "priceType": "sku",
      "currency": "USD",
      "skuPrices": [
        {"skuName": "Xxs, Red", "price": 0.9, "skuId": 107473546692},
        {"skuName": "M, Lavender", "price": 1.8, "skuId": 107869507058},
        {"skuName": "Xxs, Lavender", "price": 1.8, "skuId": 107869507057},
        {"skuName": "M, Red", "price": 0.9, "skuId": 107869507056}
      ],
      "ladderPrices": [],
      "minPrice": 0,
      "maxPrice": 0,
      "fixedPrice": ""
    },
    "leadTime": [
      {"quantity": 1, "leadTime": 7},
      {"quantity": 100, "leadTime": 12}
    ],
    "moq": 2,
    "unitWeight": 0.5,
    "unitSize": "10x10x10",
    "shippingTemplate": {
      "id": 2106539053,
      "name": "12121122"
    },
    "category": {
      "categoryId": 127734143,
      "categoryPath": "Apparel & Accessories > Men's Clothing > Men's T-Shirts"
    },
    "description": "High quality 100% cotton shirt with anti-wrinkle technology.",
    "properties": [
      {"attributeId": 191284014, "attributeName": "Material", "attributeValue": "100% Cotton", "attributeValueId": 26389775},
      {"attributeId": 191284183, "attributeName": "Sleeve Style", "attributeValue": "Long Sleeve", "attributeValueId": 12373461},
      {"attributeId": 200000277, "attributeName": "Fit Type", "attributeValue": "Regular Fit", "attributeValueId": 18110138}
    ],
    "images": [
      "https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J.png"
    ],
    "inventory": "{\"dispatchLocation\":\"CN\",\"quantity\":1000}",
    "pis": 2.3,
    "keywords": "[\"cotton shirt men casual printed anti-wrinkle\"]",
    "currencyCode": "USD"
  },
  "after": {
    "title": "Men's Cotton Printed Casual Shirt Long Sleeve Regular Fit Anti-Wrinkle",
    "price": {
      "priceType": "sku",
      "currency": "USD",
      "skuPrices": [
        {"skuName": "Xxs, Red", "price": 0.85, "skuId": 107473546692},
        {"skuName": "M, Lavender", "price": 1.75, "skuId": 107869507058},
        {"skuName": "Xxs, Lavender", "price": 1.75, "skuId": 107869507057},
        {"skuName": "M, Red", "price": 0.85, "skuId": 107869507056}
      ],
      "ladderPrices": [],
      "minPrice": 0,
      "maxPrice": 0,
      "fixedPrice": ""
    },
    "leadTime": [
      {"quantity": 1, "leadTime": 5},
      {"quantity": 100, "leadTime": 7}
    ],
    "moq": 1,
    "unitWeight": 0.45,
    "unitSize": "10x10x10",
    "shippingTemplate": {
      "id": 2106539053,
      "name": "12121122"
    },
    "category": {
      "categoryId": 127734143,
      "categoryPath": "Apparel & Accessories > Men's Clothing > Men's T-Shirts"
    },
    "description": "<div>Premium 100% cotton shirt with anti-wrinkle technology.</div>",
    "properties": [
      {"attributeId": 191284014, "attributeName": "Material", "attributeValue": "100% Cotton", "attributeValueId": 26389775},
      {"attributeId": 191284183, "attributeName": "Sleeve Style", "attributeValue": "Long Sleeve", "attributeValueId": 12373461},
      {"attributeId": 200000277, "attributeName": "Fit Type", "attributeValue": "Regular Fit", "attributeValueId": 18110138}
    ],
    "images": [
      "https://sc04.alicdn.com/kf/A370c869edfaf44a891cf6c4b8d319018J.png"
    ],
    "inventory": "{\"dispatchLocation\":\"CN\",\"quantity\":1000}",
    "pis": 4.5,
    "keywords": "[\"men cotton shirt casual printed anti-wrinkle long sleeve\"]",
    "currencyCode": "USD"
  }
}
```

#### 样例 2：阶梯价定价（priceType = "ladder"）

```json
{
  "price": {
    "priceType": "ladder",
    "currency": "USD",
    "skuPrices": [],
    "ladderPrices": [
      {"minQuantity": 1, "price": 12.50},
      {"minQuantity": 100, "price": 10.00},
      {"minQuantity": 500, "price": 8.50}
    ],
    "minPrice": 0,
    "maxPrice": 0,
    "fixedPrice": ""
  }
}
```

#### 样例 3：区间价定价（priceType = "range"）

```json
{
  "price": {
    "priceType": "range",
    "currency": "USD",
    "skuPrices": [],
    "ladderPrices": [],
    "minPrice": 5.00,
    "maxPrice": 15.00,
    "fixedPrice": ""
  }
}
```

#### 样例 4：固定价定价（priceType = "fixed"）

```json
{
  "price": {
    "priceType": "fixed",
    "currency": "USD",
    "skuPrices": [],
    "ladderPrices": [],
    "minPrice": 0,
    "maxPrice": 0,
    "fixedPrice": "9.99"
  }
}
```

## Next Steps（按需阅读）

| 主题 | 文件 |
|------|------|
| MCP 工具参数定义 | `references/tools-openapi.md` |
| CSV 中间产物表头规范 | 参见原 `skills/ggs-product-migration/references/csv-schema.md` |
