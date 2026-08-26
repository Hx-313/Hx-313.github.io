# 搬品/新发品场景 · 批量优化预设规则

本文件定义了搬品（migration）和新发品（new product）场景下调用批量优化时的预设 actions、策略约束和特殊规则。Agent 在对 `generalProductId` 有值的商品执行批量优化前，**必须先读取本文件**。

---

## 优化任务提交后的轮询规则（HARD RULE — 最高优先级）

Agent 在提交优化任务后，**必须通过 `read_file` 工具完整读取 `./tools-openapi.md` 中的轮询协议**，并严格按照其中定义的后台轮询机制执行结果查询。

> **严禁**在主对话中以任何同步等待方式替代后台轮询，包括但不限于：
> - `bash` 调用 `sleep` / `time.sleep` / `setTimeout` / `wait`
> - `python -c "while ...: time.sleep(...); query(...)"` 等内联轮询脚本
> - 任何在 shell 或脚本中阻塞等待优化结果返回的方式

---

## 场景识别

Agent 在进入 Step 2 批量优化前，必须先判断当前商品的来源场景：

| 场景 | 识别条件 | 预设规则 |
|------|---------|---------|
| **存量优化** | CSV 中 `generalProductId` 为空，`productId` 有值 | 无特殊预设，按用户指令和 `actions-and-presets.md` 正常构造 |
| **搬品优化** | CSV 中 `generalProductId` 有值（由 `alibaba-global-product-migration-executor` 传入） | 见下方「搬品/新发品场景预设」 |
| **新发品优化** | CSV 中 `generalProductId` 有值（由用户提供的 JSON 转化而来） | 见下方「搬品/新发品场景预设」 |

---

## 搬品/新发品场景预设

### ⚠️ 策略统一规则（HARD RULE）

搬品和新发品场景中，**所有优化动作一律使用 `AI_SUGGEST` 策略，禁止使用 `USER_PROMPT`**。

理由：搬品/新发品的商品数据来自外部平台，尚未发布到国际站，不存在用户在国际站上的历史编辑意图，因此统一由 AI 推荐优化方案。

### 首次优化必做项（10 项）

当用户选择「全部优化」或开启「一键搬品模式」时，以下 10 项为**必做优化动作**，Agent 必须全部执行，**缺一不可，不可跳过任何一项**。

| 序号 | 优化动作 | `field` 枚举 | 策略 | 优先级 | 说明 |
|------|----------|-------------|------|--------|------|
| 1 | 类目推断 | `CATEGORY` | **AI_SUGGEST** | 🔴 最小必要 | 根据商品信息推断最合适的国际站类目，类目是发布必要参数 |
| 2 | 属性推断 | `CPV` | **AI_SUGGEST** | P0 | 补全缺失的商品属性字段 |
| 3 | 标题优化 | `TITLE` | **AI_SUGGEST** | P0 | 后端 AI 自动优化标题，使其符合国际站搜索习惯 |
| 4 | 详描优化 | `DESCRIPTION` | **AI_SUGGEST** | P0 | 后端 AI 自动优化商品描述（HTML） |
| 5 | 翻译 | `TRANSLATE` | **AI_SUGGEST** | 🔴 最小必要 | 后端 AI 自动翻译为目标语言（作用于标题、详描等文本字段） |
| 6 | 价格推荐 | `PRICE` | **AI_SUGGEST** | P0 | 调整为适合国际站的价格区间 |
| 7 | 汇率换算 | `PRICE_EXCHANGE` | **AI_SUGGEST** | 🔴 最小必要 | 将源平台币种价格换算为目标币种 |
| 8 | 关键词优化 | `KEYWORD` | **AI_SUGGEST** | 🔴 最小必要 | 提取/生成适合国际站搜索的关键词，关键词是发布必要参数 |
| 9 | 交期优化 | `LEAD_TIME` | **AI_SUGGEST** | P0 | 系统自动推荐合理的交期值 |
| 10 | 图片优化 | `IMAGE` | **AI_SUGGEST** | P0 | 通过 Sub Agent 唤起 `ggs-image-generation` Skill 处理（不走批量优化工具） |

#### actions 数组构造示例

```json
{
  "actions": [
    {"field": "CATEGORY", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "CPV", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "TITLE", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "DESCRIPTION", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "TRANSLATE", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "PRICE", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "PRICE_EXCHANGE", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "KEYWORD", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "LEAD_TIME", "strategy": "AI_SUGGEST", "value": ""}
  ]
}
```

### 最小必要项（4 项）

当用户选择「最小必要项」时，仅执行以下 4 项优化。这 4 项是发布到国际站的最低门槛，缺少任何一项都可能导致发布失败或商品质量极差。Agent **严禁自行推断或替换为其他组合**。

| 序号 | 优化动作 | `field` 枚举 | 策略 |
|------|----------|-------------|------|
| 1 | 翻译 | `TRANSLATE` | **AI_SUGGEST** |
| 2 | 关键词优化 | `KEYWORD` | **AI_SUGGEST** |
| 3 | 汇率换算 | `PRICE_EXCHANGE` | **AI_SUGGEST** |
| 4 | 类目推断 | `CATEGORY` | **AI_SUGGEST** |

#### actions 数组构造示例

```json
{
  "actions": [
    {"field": "TRANSLATE", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "KEYWORD", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "PRICE_EXCHANGE", "strategy": "AI_SUGGEST", "value": ""},
    {"field": "CATEGORY", "strategy": "AI_SUGGEST", "value": ""}
  ]
}
```

### 优化确认范围（三种选择）

搬品/新发品场景下，用户在数据预览确认后可选择以下优化范围：

1. **全部优化**：执行上述 10 项首次必做优化
2. **最小必要项**：仅执行上述 4 项最小必要优化
3. **自定义优化**：用户指定需要优化的字段（仍必须使用 `AI_SUGGEST` 策略）

> **一键搬品模式**：若用户在搬品入口开启了「一键搬品模式」，则**自动执行全部优化**，无需再次确认。

---

## 搬品/新发品场景特殊约束

### 1. 禁止查询 PIS 分

搬品/新发品场景下商品尚未发布到国际站，不存在线上商品记录，调用 `query_product_score` 查询 PIS 分必定失败。因此：
- **严禁在搬品/新发品优化流程中调用 `query_product_score`**
- 跳过 `execution-protocol.md` 中的「强制动作 2：查询商品质量分」
- 预览中不展示 PIS 信息

> 此规则与 `execution-protocol.md` 中的豁免条件一致：`generalProductId` 有值的商品跳过 PIS 查询。

### 2. 价格类型校正（写回后必做）

优化结果写回 CSV 后，Agent 必须检查每个商品的 `after.price.priceType`。**发布只接受 `sku` 和 `ladder` 两种**：
- 若存在 `fixed`/`tiered`/`range` 等其他类型，必须自动转换为 `ladder`
- 阶梯价允许只有一档
- **若阶梯价为一档，则 `moq` 与 `ladderPrices[0].minQuantity` 必须相同**，不一致时以 `moq` 为准修正

### 3. 进度安抚（预期管理）

在调起批量优化之前，Agent 必须检查待优化的商品数量。若**商品数量 > 10 个**，必须先向用户输出预期管理提示（按每个商品约 2 分钟估算总耗时）：

> ⏳ *本次需要深度优化 X 个商品，AI 正在逐一处理标题、翻译、图片等核心内容。预计需要 Y 分钟（约 2分钟/商品），请您稍作等待，期间您可以处理其他工作...*

### 4. 禁止捏造库存数据

绝对禁止在优化时私自为商品编造库存（`inventory`）数量（如默认写 100 或 1000）。若原始数据无库存，必须保持为空，严禁擅自填充。

### 5. 负向优化拦截

Agent 在写入 `after` 列前，**必须执行数值逻辑校验**。若 AI_SUGGEST 返回的价格、MOQ 或交期比 `before` 更差（价格更高、MOQ 更大、交期更长），**严禁写入 `after` 列**，且必须在预览中告知用户"当前值优于 AI 建议值，无需调整"。

> 此规则同样适用于存量优化场景，详见 `SKILL.md` 第 13 条。

### 6. 优化失败禁止自行降级（HARD RULE）

当平台优化工具调用失败时，Agent **严禁自行降级处理或捏造优化结果**。具体要求：

- **严禁使用 LLM 自行生成替代结果**：不得用 LLM 凭空编造 categoryId、属性值、关键词等字段来替代平台工具的返回
- **严禁沿用原始数据并声称"已优化"**：不得将 `before` 数据原样复制到 `after` 列却标记为优化完成
- **严禁静默跳过失败项**：不得在预览中隐瞒某些字段的优化失败，必须明确告知用户哪些字段优化失败
- **必须向用户如实报告失败**：将失败的字段、失败原因清晰展示给用户，由用户决定后续处理方式（如手动填写、重试等）

> 此规则的核心原则：**宁可暴露失败，也不可伪造成功**。捏造优化结果会导致用户发布质量极差甚至无效的商品，后果远比一次失败更严重。

### 7. 优化预览渲染约束（HARD RULE）

优化完成后的预览**必须**使用 before/after 双栏对比布局（三列表格：Field / Before / After），按 `optimize-preview-html.md` 规范渲染。

- **严禁复用解析阶段的 `render_parsed_csv_preview.py` 脚本**：该脚本仅读取 `before.*` 列，不包含任何 `after.*` 数据的读取和对比逻辑，产出的 HTML 无法体现优化差异
- **交付物自检**：Agent 在输出预览前，必须确认产出的 HTML/Markdown 中包含 `After` 列且展示了 `after.*` 数据。若产出物中不存在 `after.*` 数据的展示，视为无效交付，必须重新生成
- **场景意识**：每次生成预览时，Agent 必须先判断当前处于哪个阶段（解析 vs 优化），再选择对应的渲染方式。不得因为"有现成脚本可用"就跳过场景判断
