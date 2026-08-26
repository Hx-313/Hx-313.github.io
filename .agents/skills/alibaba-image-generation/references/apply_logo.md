---
name: apply-logo
description: 将logo图按照合理的位置贴合到原图上，结果路径保存在json中。调用 Logo 贴图服务处理图片，输入原图、logo图和定制方式，输出生成的贴图后图片路径。当用户需要在商品图上添加logo、贴标、定制图案时使用。
---

# Logo 贴图功能

## 功能说明

本 Skill 用于将 logo 图按照合理的位置贴合到原图上，支持多种定制方式（如热转印等），适用于商品定制展示场景。

## 使用流程

### 1. 准备输入

- **原图**：需要贴 logo 的商品图片 URL
- **logo 图**：需要贴合的 logo 图片 URL
- **定制方式**：必须从以下列表中选择一项
  - 激光雕刻
  - 丝网印刷
  - 热转印
  - 激光打印
  - 贴纸 / 转印贴
  - 烫金 / 烫印
  - UV 打印
  - 数码印刷
  - 刺绣 / 绣花
  - 3D 打印
  - 压纹 / 凸印 / 凹印
  - 喷墨打印
  - 常规/彩色印刷
  - 单色 / 双色印刷

### 2. 参数校验（前置拦截）

**在调用 workctl 命令之前，必须先校验必传参数。如果参数为空，不发起请求，直接提示用户。**

| 必传参数 | 校验规则 | 缺失时处理 |
|---------|---------|----------|
| `imageUrl` | 需要贴 logo 的商品图片 URL，不可为空 | 终止流程，提示"请提供需要贴 Logo 的商品图片" |
| `logoImageUrl` | 需要贴合的 logo 图片 URL，不可为空 | 终止流程，提示"请提供需要贴合的 Logo 图片" |

### 2.3 定制方式选择（条件执行）

**无论用户是否明确指定定制方式，最终使用的定制方式必须是 14 个限定列表中的一项。** 当用户未明确指定时，通过 `ask_user` 工具让用户选择；用户可选择跳过或自定义输入，但结果必须映射回限定列表。

触发条件判断：
- **用户已明确指定定制方式，且该方式在 14 个限定列表中**（如"使用热转印"、"用丝网印刷"、"激光雕刻"等）→ 直接使用
- **用户已明确指定定制方式，但不在 14 个限定列表中**（如"烫印"、"刺绣"、"印刷"、"打印"、"贴标"等模糊/简称表达）→ **必须映射到 14 个限定选项中最接近的一项**，禁止直接使用列表外的值
- **用户未指定定制方式** → 调用 `ask_user` 让用户从智能推荐的 3 个选项中选择

**定制方式模版（14 选 3）：**

从以下 14 个定制方式中，根据商品材质、logo 特征和适用场景，**智能选出最匹配的 3 个定制方式**作为 `ask_user` 选项：

| 序号 | 定制方式 | 典型适用场景 |
|------|---------|-------------|
| 1 | 激光雕刻 | 金属、木质、皮革等硬质材料，logo 为线条/文字类 |
| 2 | 丝网印刷 | 纺织物、T恤、布袋，单色或少量颜色的 logo |
| 3 | 热转印 | 纺织物、服装、帽子，彩色复杂图案的 logo |
| 4 | 激光打印 | 纸质材料、标签、包装盒，精细文字和图形 |
| 5 | 贴纸 / 转印贴 | 平滑表面、玻璃、塑料，临时性或可移除 logo |
| 6 | 烫金 / 烫印 | 高档包装、贺卡、皮革，金色/银色等金属质感 logo |
| 7 | UV 打印 | 硬质表面、亚克力、玻璃、瓷砖，高饱和度彩色 logo |
| 8 | 数码印刷 | 纸质材料、宣传单、海报，多彩渐变的复杂图案 |
| 9 | 刺绣 / 绣花 | 纺织物、服装、帽子，传统风格、立体感的 logo |
| 10 | 3D 打印 | 立体产品、模型、装饰品，有厚度和结构感的 logo |
| 11 | 压纹 / 凸印 / 凹印 | 皮革、纸张、包装，触感纹理、无色的立体 logo |
| 12 | 喷墨打印 | 大幅面材料、布料、喷绘，高分辨率彩色图像 |
| 13 | 常规/彩色印刷 | 纸质材料、名片、画册，标准彩色平面 logo |
| 14 | 单色 / 双色印刷 | 成本敏感场景、简约风格，单一或双色 logo |

**选择逻辑：** 分析商品图片和 logo 图片，考虑以下因素选出最匹配的 3 个选项：
- 商品材质（如 T恤/布料 → 热转印/丝网印刷/刺绣，金属/木制品 → 激光雕刻，纸质品 → 数码印刷/激光打印）
- Logo 特征（如简单单色图形 → 丝网印刷/单色印刷，彩色复杂图案 → 热转印/UV打印/数码印刷，金属质感 → 烫金，立体浮雕 → 压纹/3D打印）
- 商品用途和档次（如高端礼品 → 烫金/激光雕刻，日常快消品 → 常规印刷/贴纸）
- 行业常见搭配惯例

**`ask_user` 调用格式：**

```
ask_user({
  mode: "form",
  questions: [{
    question: "请为商品选择最适合的 Logo 定制方式：",
    header: "定制方式",
    options: [
      { label: "{选项1定制方式}", description: "{选项1描述，如：适合XX材质，呈现XX效果}" },
      { label: "{选项2定制方式}", description: "{选项2描述}" },
      { label: "{选项3定制方式}", description: "{选项3描述}" }
    ],
    recommended: 0,
    allowSkip: true
  }]
})
```

**示例 — T恤商品 + 彩色 logo：**
```
ask_user({
  mode: "form",
  questions: [{
    question: "请为商品选择最适合的 Logo 定制方式：",
    header: "定制方式",
    options: [
      { label: "热转印", description: "适合纺织物，彩色图案效果鲜艳持久，是服装 logo 的主流工艺" },
      { label: "丝网印刷", description: "适合布料，色牢度高，适合批量生产的单色/少色 logo" },
      { label: "刺绣 / 绣花", description: "适合服装帽子，立体感强，提升产品质感和档次" }
    ],
    recommended: 0,
    allowSkip: true
  }]
})
```

**示例 — 金属水杯 + 文字 logo：**
```
ask_user({
  mode: "form",
  questions: [{
    question: "请为商品选择最适合的 Logo 定制方式：",
    header: "定制方式",
    options: [
      { label: "激光雕刻", description: "适合金属材质，永久性标记，线条精细，不磨损脱落" },
      { label: "UV 打印", description: "适合硬质表面，可呈现彩色效果，覆盖金属/玻璃等多种材质" },
      { label: "单色 / 双色印刷", description: "成本较低，适合简约风格 logo，快速交付" }
    ],
    recommended: 0,
    allowSkip: true
  }]
})
```

**应答处理：**
- 用户选择某个选项 → 使用该选项的 label 作为定制方式（已在 14 项列表中）
- 用户选择"Other"并输入自定义方式 → **必须映射到 14 个限定选项中最接近的一项**，禁止直接使用列表外的值。映射规则：
  - 用户输入"烫印" → 映射为"烫金 / 烫印"
  - 用户输入"刺绣" → 映射为"刺绣 / 绣花"
  - 用户输入"印刷" → 映射为"常规/彩色印刷"
  - 用户输入"雕刻" → 映射为"激光雕刻"
  - 用户输入"打印" → 映射为"激光打印"（纸质）或"UV 打印"（硬质），根据商品材质判断
  - 无法明确映射时 → 默认使用"热转印"
- 用户跳过（[SKIPPED]）→ **默认使用 14 项中最合适的一项**（根据商品材质和 logo 特征自动匹配，而非固定"热转印"）

**禁止事项：**
- 禁止在未调用 `ask_user` 的情况下自行默认定制方式（跳过时除外，默认使用 14 项中最合适的一项）
- 禁止将全部 14 个选项都放入 `ask_user`（最多 4 个选项，必须智能筛选为 3 个）
- 禁止在用户已明确指定定制方式时仍调用 `ask_user`
- 禁止最终使用的定制方式不在 14 个限定列表中（包括用户明确指定但不在列表中的值，也必须映射回列表）
- 禁止推荐与商品材质明显不匹配的定制方式（如推荐刺绣给金属制品）

### 2.5 Logo 位置确认（条件执行）

**当用户未明确指定 logo 的贴合位置时，通过 `ask_user` 工具让用户选择位置。用户可选择跳过，跳过时不拼接位置信息。**

位置判断规则：
- **用户已指定位置**（如"贴在左上角"、"放在产品中间"、"放到袖子上"、"贴在商品主体上"、"放在背景上"等）→ 无需调用 `ask_user`，直接将位置信息拼接至 prompt
- **用户未指定位置** → 必须调用 `ask_user` 让用户选择

**`ask_user` 调用格式：**

```
ask_user({
  mode: "form",
  questions: [{
    question: "请选择 Logo 的贴合位置：",
    header: "Logo位置",
    options: [
      { label: "商品主体上适当位置", description: "Logo 将贴合在商品主体上，如产品正面、表面等自然位置" },
      { label: "背景图上适当位置", description: "Logo 将放置在图片背景区域，不影响商品主体展示" }
    ],
    allowSkip: true
  }]
})
```

**应答处理：**
- 用户选择"商品主体上适当位置" → prompt 拼接为 `<定制方式>#商品主体上适当位置`
- 用户选择"背景图上适当位置" → prompt 拼接为 `<定制方式>#背景图上适当位置`
- 用户选择"Other"并输入自定义位置 → prompt 拼接为 `<定制方式>#<用户输入的位置描述>`
- 用户跳过（[SKIPPED]）→ prompt 仅填写定制方式，不拼接位置信息（如 `热转印`）

**禁止事项：**
- 禁止在未调用 `ask_user` 的情况下自行默认位置
- 禁止在用户已明确指定位置时仍调用 `ask_user`
- 禁止将 `ask_user` 用于位置以外的用途

### 3. 调用 workctl CLI（两步调用）

Logo 贴图需要调用两个 workctl 命令，按顺序执行：

#### 步骤 3.1：调用 Logo 贴图工具

调用 `workctl icbu product product-ai-image-custom-logo` 工具：

```
命令：workctl icbu product product-ai-image-custom-logo
参数：
  imageUrl: "<原图URL>"
  logoImageUrl: "<logo图URL>"
  prompt: "<定制方式>"
```

**参数说明：**
- 能力由当前 workctl 专用命令路径固定，不额外传 `abilityCode` 参数。
- `imageUrl`：需要贴 logo 的商品图片 URL
- `logoImageUrl`：需要贴合的 logo 图片 URL
- `prompt`：定制方式，必须从限定列表中选择。**当用户未明确指定定制方式时，必须先调用 `ask_user` 让用户选择**（参见步骤 2.3），然后使用用户选择的定制方式（或映射后的值）。**当用户明确表达了贴 logo 的具体位置时**（如"贴在左上角"、"放在产品中间"、"放到袖子上"、"贴在商品主体上"、"放在背景上"等），需要将位置信息解析出来拼接在 prompt 中，格式为 `<定制方式>#<logo位置描述>`，例如 `热转印#左上角`、`丝网印刷#产品正面中央`、`热转印#商品主体上适当位置`、`热转印#背景图上适当位置`。**如果用户未指定位置，必须先调用 `ask_user` 让用户选择位置**（参见步骤 2.5），然后根据用户选择拼接 prompt，格式同样为 `<定制方式>#<用户选择的位置>`。

**返回示例：**
```json
{
  "success": true,
  "data": "c3282371-45d5-493e-a90e-00948eecb342"
}
```

从返回结果中获取 `data` 字段作为 `requestKey`，用于下一步查询结果。

**校验 requestKey**：如果返回的 `data` 为空或 `success` 为 `false`，**不发起步骤 3.2 的轮询请求**，直接提示用户"图片处理任务提交失败，请重试"。

#### 步骤 3.2：获取处理结果（轮询机制）

由于图片处理需要时间，第二步需要采用**轮询机制**获取结果：

- **轮询间隔**：每 15 秒尝试一次
- **最大尝试次数**：8 次（最长等待 120 秒）

使用上一步返回的 `requestKey` 调用 `workctl icbu product product-ai-image-generate-result` 工具：

```
命令：workctl icbu product product-ai-image-generate-result
参数：
  requestKey: "<步骤3.1返回的data值>"
```

**参数说明：**
- `requestKey`：步骤 3.1 返回的 `data` 字段值（**必须非空，为空则不发起请求**）

**轮询逻辑：**

1. 首次调用后检查 `data.status` 字段
2. 如果 `status: 1` 且 `success: true`，返回结果
3. 如果仍在处理中，等待 15 秒后再次调用
4. 重复步骤 2-3，最多尝试 8 次
5. 如果 8 次后仍未成功，返回超时错误

**返回示例：**
```json
{
  "data": {
    "imageUrlList": [
      "https://sc04.alicdn.com/kf/H696151c21a7342229edefd0b3769a579S/200042360/H696151c21a7342229edefd0b3769a579S.png"
    ],
    "status": 1
  },
  "errorCode": null,
  "errorMsg": null,
  "success": true
}
```

处理后的图片 URL 在 `data.imageUrlList[0]` 中。

### 4. 输出结果

**重要：获取到处理结果后，按照以下格式向用户展示，不要直接返回原始 JSON。**

从 `workctl icbu product product-ai-image-generate-result` 返回结果中提取：
- 图片 URL：`data.imageUrlList[0]`
- requestKey：步骤 3.1 中 `workctl icbu product product-ai-image-custom-logo` 返回的 `data` 字段值

**输出格式：**

```
已经帮你生成图片

![]({图片URL})
```

**输出示例：**

已经帮你生成图片

![](https://sc04.alicdn.com/kf/H696151c21a7342229edefd0b3769a579S/200042360/H696151c21a7342229edefd0b3769a579S.png)

- ✅ 正确：按上述格式输出，包含图片预览和创意工坊链接
- ❌ 错误：直接返回 JSON 或只返回图片 URL

## 注意事项

1. **两步调用**：必须先调用 `workctl icbu product product-ai-image-custom-logo` 获取 requestKey，再调用 `workctl icbu product product-ai-image-generate-result` 获取结果
2. **轮询机制**：第二步需要轮询获取结果，每 15 秒尝试一次，最多 8 次
3. **定制方式**：必须从限定列表中选择一项，不能随意填写。**用户未指定时通过 `ask_user`（参见步骤 2.3）选择，用户自定义输入必须映射回 14 项列表之一，用户跳过时默认使用 14 项中最合适的一项**
4. **位置拼接**：当用户明确指定了 logo 的贴合位置时，prompt 格式为 `<定制方式>#<logo位置描述>`（如 `热转印#左上角`）；**用户未指定位置时，必须通过 `ask_user`（参见步骤 2.5）让用户选择位置，然后拼接为 `<定制方式>#<用户选择的位置>`（如 `热转印#商品主体上适当位置`）**
5. **错误处理**：处理失败时检查 `success` 字段和 `errorMsg` 信息
6. **状态检查**：结果中的 `status` 字段表示处理状态，`status: 1` 表示成功
7. **超时处理**：如果 8 次轮询后仍未成功，应向用户报告超时错误

## 使用示例

**场景1：在商品图上添加 logo（未指定定制方式和位置）**

用户："帮我把这个 logo 贴到这件 T 恤上"

执行步骤：
1. 获取用户提供的原图 URL（T恤商品图）
2. 获取用户提供的 logo 图 URL
3. 用户未指定定制方式 → 调用 `ask_user` 让用户选择（系统推荐：热转印、丝网印刷、刺绣）
4. 用户选择"热转印"
5. 用户未指定位置 → 调用 `ask_user` 让用户选择位置
6. 用户选择"商品主体上适当位置" → prompt 参数为 `热转印#商品主体上适当位置`
7. 调用 `workctl icbu product product-ai-image-custom-logo` 工具获取 requestKey
8. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果（每15秒一次，最多8次）
9. 返回最终结果

**场景2：在商品图上添加 logo（指定定制方式，未指定位置）**

用户："帮我把这个 logo 用热转印的方式贴到T恤上"

执行步骤：
1. 获取用户提供的原图 URL
2. 获取用户提供的 logo 图 URL
3. 用户已指定定制方式："热转印"
4. 用户未指定位置 → 调用 `ask_user` 让用户选择位置
5. 用户选择"商品主体上适当位置" → prompt 参数为 `热转印#商品主体上适当位置`
6. 调用 `workctl icbu product product-ai-image-custom-logo` 工具获取 requestKey
7. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果（每15秒一次，最多8次）
8. 返回最终结果

**场景3：在商品图上添加 logo（指定定制方式和位置）**

用户："帮我把这个 logo 用热转印的方式贴到T恤的左胸口位置"

执行步骤：
1. 获取用户提供的原图 URL
2. 获取用户提供的 logo 图 URL
3. 用户已指定定制方式："热转印"
4. 解析用户指定的位置："左胸口位置"，prompt 参数拼接为 `热转印#左胸口位置`
5. 调用 `workctl icbu product product-ai-image-custom-logo` 工具获取 requestKey
6. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果（每15秒一次，最多8次）
7. 返回最终结果

**场景4：在商品图上添加 logo（用户选择定制方式后跳过位置选择）**

用户："帮我把这个 logo 贴到商品图上"

执行步骤：
1. 获取用户提供的原图 URL
2. 获取用户提供的 logo 图 URL
3. 用户未指定定制方式 → 调用 `ask_user` 让用户选择（系统推荐：热转印、UV打印、数码印刷）
4. 用户选择"热转印"
5. 用户未指定位置 → 调用 `ask_user` 让用户选择位置
6. 用户跳过位置选择 → prompt 参数为 `热转印`
7. 调用 `workctl icbu product product-ai-image-custom-logo` 工具获取 requestKey
8. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果（每15秒一次，最多8次）
9. 返回最终结果

**示例调用：**

第一步 - 调用 Logo 贴图（未指定位置，用户通过 ask_user 选择了商品主体）：
```
命令：workctl icbu product product-ai-image-custom-logo
参数：
  imageUrl: "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg"
  logoImageUrl: "https://sc01.alicdn.com/kf/Hlogo123456789.png"
  prompt: "热转印#商品主体上适当位置"
```

第一步 - 调用 Logo 贴图（指定位置）：
```
命令：workctl icbu product product-ai-image-custom-logo
参数：
  imageUrl: "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg"
  logoImageUrl: "https://sc01.alicdn.com/kf/Hlogo123456789.png"
  prompt: "热转印#左胸口位置"
```

第二步 - 轮询获取结果（使用第一步返回的 data 值）：
```
# 最多尝试 8 次，每次间隔 15 秒
for attempt in range(1, 9):
  命令：workctl icbu product product-ai-image-generate-result
  参数：
    requestKey: "c3282371-45d5-493e-a90e-00948eecb342"
  
  # 检查结果
  if success == true and status == 1:
    # 成功，返回 imageUrlList[0]
    break
  else:
    # 等待 15 秒后重试
    wait(15 seconds)
```

**成功后输出示例：**

已经帮你生成图片

![](https://sc04.alicdn.com/kf/H696151c21a7342229edefd0b3769a579S/200042360/H696151c21a7342229edefd0b3769a579S.png)

## 完整 CLI 调用示例

```bash
# 步骤 1：提交 Logo 贴图任务（未指定位置，用户通过 ask_user 选择了商品主体）
workctl icbu product product-ai-image-custom-logo \
  --imageUrl "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg" \
  --logoImageUrl "https://sc01.alicdn.com/kf/Hlogo123456789.png" \
  --prompt "热转印#商品主体上适当位置" \
  --format json

# 步骤 1：提交 Logo 贴图任务（指定位置，格式为"定制方式#位置描述"）
workctl icbu product product-ai-image-custom-logo \
  --imageUrl "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg" \
  --logoImageUrl "https://sc01.alicdn.com/kf/Hlogo123456789.png" \
  --prompt "热转印#左胸口位置" \
  --format json

# 步骤 2：轮询获取结果（使用步骤1返回的 data 值作为 requestKey）
workctl icbu product product-ai-image-generate-result \
  --requestKey "c3282371-45d5-493e-a90e-00948eecb342" \
  --format json
```
