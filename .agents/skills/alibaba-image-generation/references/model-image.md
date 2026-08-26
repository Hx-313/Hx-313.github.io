---
name: model-image
description: 通过上传商品原图和模特图（模特图非必填），生成模特展示商品的图片。调用模特图生成服务，让模特来展示对应的商品。当用户需要生成模特展示图、商品上身效果、模特穿扁展示时使用。
---

# 模特图生成功能

## 功能说明

本 Skill 用于将商品与模特结合，生成模特展示商品的图片。支持三种方式：
- **自定义模特**：用户提供模特图，将商品穿在指定模特身上
- **描述生成模特**：用户描述模特特征，根据描述生成对应模特展示商品
- **用户选择模特**：未提供模特图和描述时，根据商品特征推荐最匹配的模特类型供用户选择

适用于电商商品展示、服装上身效果、模特穿搭展示等场景。

## 使用流程

### 1. 准备输入

- **imageUrl**（必填）：商品原图 URL 地址
- **modelImageUrl**（选填）：模特图 URL 地址，如不填则根据用户描述或系统默认生成
- **userPrompt**（选填）：用户对模特的描述（如"亚洲女性，长发，白皙肤色"等）
- **prompt**（系统自动生成）：根据用户输入自动生成
  - **上传了模特图**（`modelImageUrl` 有值）：`请严格参考该模特的外貌特征（脸型、发型、肤色、气质等），保持人物一致性。`
  - **未上传模特图，但用户描述了模特特征**（`modelImageUrl` 为空 + `userPrompt` 有值）：将用户描述与默认 prompt 结合，生成 `"{用户描述}，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。"`
  - **未上传模特图，用户也未描述**（`modelImageUrl` 为空 + `userPrompt` 为空）：**必须先通过 `ask_user` 让用户选择模特类型**（参见步骤 2.5），然后根据用户选择生成 prompt：`"{用户选择的模特类型描述}，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。"`

### 2. 参数校验（前置拦截）

**在调用 workctl 命令之前，必须先校验必传参数。如果参数为空，不发起请求，直接提示用户。**

| 必传参数 | 校验规则 | 缺失时处理 |
|---------|---------|-----------|
| `imageUrl` | 商品原图 URL，不可为空 | 终止流程，提示"请提供需要生成模特图的商品图片" |

> 注：`modelImageUrl` 和 `prompt` 为选填参数，无需校验是否为空。

### 2.5 模特类型选择（条件执行）

**当用户既未提供模特图（`modelImageUrl` 为空）也未描述模特特征（`userPrompt` 为空）时，通过 `ask_user` 工具让用户选择模特类型。用户可选择跳过，跳过时使用系统默认模特。**

触发条件判断：
- **用户已提供模特图** → 无需调用 `ask_user`，直接使用模特图
- **用户已描述模特特征** → 无需调用 `ask_user`，直接使用描述生成 prompt
- **用户未提供模特图且未描述** → 必须调用 `ask_user` 让用户选择

**模特类型模版（8 选 3）：**

从以下 8 个模版中，根据商品图片内容和目标消费人群，**智能选出最符合商品展示的 3 个模特类型**作为 `ask_user` 选项：

| 序号 | 地域 | 性别 | 模特类型标签 |
|------|------|------|-------------|
| 1 | 欧美 | 女 | 欧美女性 |
| 2 | 欧美 | 男 | 欧美男性 |
| 3 | 亚洲 | 女 | 亚洲女性 |
| 4 | 亚洲 | 男 | 亚洲男性 |
| 5 | 非洲 | 女 | 非洲女性 |
| 6 | 非洲 | 男 | 非洲男性 |
| 7 | 拉美 | 女 | 拉美女性 |
| 8 | 拉美 | 男 | 拉美男性 |

**选择逻辑：** 分析商品图片，考虑以下因素选出最匹配的 3 个选项：
- 商品的目标消费人群（如女装 → 优先女性选项）
- 商品风格与地域审美的契合度（如日韩风 → 亚洲，欧美潮牌 → 欧美）
- 商品品类的常见展示惯例（如运动品牌 → 非洲/欧美模特更有力量感）

**`ask_user` 调用格式：**

```
ask_user({
  mode: "form",
  questions: [{
    question: "请选择最符合商品展示的模特类型：",
    header: "模特选择",
    options: [
      { label: "{选项1标签}", description: "{选项1描述，如：适合XX风格商品展示，更贴近XX消费人群审美}" },
      { label: "{选项2标签}", description: "{选项2描述}" },
      { label: "{选项3标签}", description: "{选项3描述}" }
    ],
    recommended: 0,
    allowSkip: true
  }]
})
```

**示例 — 女装连衣裙商品：**
```
ask_user({
  mode: "form",
  questions: [{
    question: "请选择最符合商品展示的模特类型：",
    header: "模特选择",
    options: [
      { label: "亚洲女性", description: "适合亚洲市场审美，贴近国内电商消费人群" },
      { label: "欧美女性", description: "适合欧美市场风格，展现国际化品牌调性" },
      { label: "拉美女性", description: "热情活力风格，适合色彩丰富的商品展示" }
    ],
    recommended: 0,
    allowSkip: true
  }]
})
```

**示例 — 运动鞋商品：**
```
ask_user({
  mode: "form",
  questions: [{
    question: "请选择最符合商品展示的模特类型：",
    header: "模特选择",
    options: [
      { label: "欧美男性", description: "运动力量感强，适合欧美运动品牌展示风格" },
      { label: "非洲男性", description: "体能表现力突出，适合专业运动装备展示" },
      { label: "欧美女性", description: "时尚运动风，适合潮流运动品牌展示" }
    ],
    recommended: 0,
    allowSkip: true
  }]
})
```

**应答处理：**
- 用户选择某个选项 → 将选项的 label 转为模特描述，prompt 生成：`{选项label}，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。`
  - 例：用户选择"亚洲女性" → prompt 为 `亚洲女性，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。`
- 用户选择"Other"并输入自定义描述 → 将自定义描述作为 `userPrompt`，按情况 2 生成 prompt
- 用户跳过（[SKIPPED]）→ 使用系统默认 prompt：`模特符合商品消费人群审美的外貌特征，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。`

**禁止事项：**
- 禁止在未调用 `ask_user` 的情况下自行默认模特类型
- 禁止将全部 8 个选项都放入 `ask_user`（最多 4 个选项，必须智能筛选为 3 个）
- 禁止在用户已提供模特图或已描述模特特征时仍调用 `ask_user`
- 禁止推荐与商品明显不匹配的模特类型（如男装推荐女性模特）

### 3. 调用 workctl CLI（两步调用）

模特图生成需要调用两个 workctl 命令，按顺序执行：

#### 步骤 3.1：调用模特图生成工具

调用 `workctl icbu product product-ai-image-model-generate` 工具：

```
命令：workctl icbu product product-ai-image-model-generate
参数：
  imageUrl: "<商品原图URL>"
  modelImageUrl: "<模特图URL-可选>"
  prompt: "<生成提示词-可选>"
```

**参数说明：**
- 能力由当前 workctl 专用命令路径固定，不额外传 `abilityCode` 参数。
- `imageUrl`：商品原图 URL 地址（必填）
- `modelImageUrl`：模特图 URL 地址（选填，不传则使用系统默认模特）
- `prompt`：生成提示词（系统自动生成，根据是否上传模特图使用不同提示词）

**prompt 生成规则：**
- **情况 1 - 上传了模特图**（`modelImageUrl` 有值）：使用提示词 `"请严格参考该模特的外貌特征（脸型、发型、肤色、气质等），保持人物一致性。"`
- **情况 2 - 未上传模特图，但用户描述了模特特征**（`modelImageUrl` 为空 + `userPrompt` 有值）：将用户描述与情况 3 的默认 prompt 结合，生成 prompt：`"{用户描述}，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。"`
- **情况 3 - 未上传模特图，用户也未描述**（`modelImageUrl` 为空 + `userPrompt` 为空）：**必须先通过 `ask_user` 让用户选择模特类型**（参见步骤 2.5），然后根据用户选择生成 prompt：`"{用户选择的模特类型描述}，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。"`（例：用户选择"亚洲女性" → prompt 为 `"亚洲女性，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。"`）

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

由于图片生成需要时间，第二步需要采用**轮询机制**获取结果：

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
- requestKey：步骤 3.1 中 `workctl icbu product product-ai-image-model-generate` 返回的 `data` 字段值

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

1. **两步调用**：必须先调用 `workctl icbu product product-ai-image-model-generate` 获取 requestKey，再调用 `workctl icbu product product-ai-image-generate-result` 获取结果
2. **轮询机制**：第二步需要轮询获取结果，每 15 秒尝试一次，最多 8 次
3. **模特图可选**：`modelImageUrl` 为选填参数，不传则根据情况处理——有用户描述时直接用描述，无模特图且无描述时**必须通过 `ask_user`（参见步骤 2.5）让用户选择模特类型**
4. **错误处理**：处理失败时检查 `success` 字段和 `errorMsg` 信息
5. **状态检查**：结果中的 `status` 字段表示处理状态，`status: 1` 表示成功
6. **超时处理**：如果 8 次轮询后仍未成功，应向用户报告超时错误

## 使用示例

### 示例 1：使用自定义模特

用户："帮我把这件衣服穿在这个模特身上"

执行步骤：
1. 获取用户提供的商品原图 URL
2. 获取用户提供的模特图 URL
3. 自动生成 prompt：`"请严格参考该模特的外貌特征（脸型、发型、肤色、气质等），保持人物一致性。"`
4. 调用 `workctl icbu product product-ai-image-model-generate` 工具获取 requestKey
5. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果（每15秒一次，最多8次）
6. 按格式输出结果

**示例调用：**

第一步 - 调用模特图生成：
```
命令：workctl icbu product product-ai-image-model-generate
参数：
  imageUrl: "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg"
  modelImageUrl: "https://sc01.alicdn.com/kf/Hmodel123456789.jpg"
  prompt: "请严格参考该模特的外貌特征（脸型、发型、肤色、气质等），保持人物一致性。"
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
    # 成功，按格式输出结果
    break
  else:
    # 等待 15 秒后重试
    wait(15 seconds)
```

### 示例 2：用户描述模特特征

用户："帮这件商品生成一张模特展示图，模特要亚洲女性，长发，白皙肤色"

执行步骤：
1. 获取用户提供的商品原图 URL
2. 未上传 modelImageUrl
3. 获取用户描述的模特特征：`"亚洲女性，长发，白皙肤色"`
4. 将用户描述与默认 prompt 结合，生成最终 prompt：`"亚洲女性，长发，白皙肤色，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。"`
5. 调用 `workctl icbu product product-ai-image-model-generate` 工具获取 requestKey
6. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果
7. 按格式输出结果

**示例调用：**

第一步 - 调用模特图生成（用户描述结合默认 prompt）：
```
命令：workctl icbu product product-ai-image-model-generate
参数：
  imageUrl: "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg"
  prompt: "模特形象为亚洲女性，长发，白皮肤色，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。"
```

### 示例 3：用户选择模特类型（未提供模特图和描述）

用户："帮这件商品生成一张模特展示图"

执行步骤：
1. 获取用户提供的商品原图 URL
2. 未提供 modelImageUrl，用户也未描述模特特征
3. 根据商品图片分析，从 8 个模特模版中选出最匹配的 3 个选项
4. 调用 `ask_user` 让用户选择模特类型
5. 用户选择"亚洲女性" → 生成 prompt：`"亚洲女性，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。"`
6. 调用 `workctl icbu product product-ai-image-model-generate` 工具获取 requestKey
7. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果
8. 按格式输出结果

**示例调用：**

第一步 - 调用模特图生成（用户通过 ask_user 选择了亚洲女性）：
```
命令：workctl icbu product product-ai-image-model-generate
参数：
  imageUrl: "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg"
  prompt: "亚洲女性，肤色、发型和体型合理，表情自然、姿态舒展，避免夸张动作或僵硬姿势，整体呈现真实、健康的视觉感受。"
```

**成功响应示例：**
```json
{
  "data": {
    "imageUrlList": [
      "https://sc04.alicdn.com/kf/H696151c21a7342229edefd0b3769a579S/200042360/H696151c21a7342229edefd0b3769a579S.png"
    ],
    "status": 1
  },
  "success": true
}
```

**成功后输出示例：**

已经帮你生成图片

![](https://sc04.alicdn.com/kf/H696151c21a7342229edefd0b3769a579S/200042360/H696151c21a7342229edefd0b3769a579S.png)

## 完整 CLI 调用示例

```bash
# 步骤 1：提交模特图生成任务
workctl icbu product product-ai-image-model-generate \
  --imageUrl "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg" \
  --modelImageUrl "https://sc01.alicdn.com/kf/Hmodel123456789.jpg" \
  --prompt "请严格参考该模特的外貌特征（脸型、发型、肤色、气质等），保持人物一致性。" \
  --format json

# 步骤 2：轮询获取结果（使用步骤1返回的 data 值作为 requestKey）
workctl icbu product product-ai-image-generate-result \
  --requestKey "c3282371-45d5-493e-a90e-00948eecb342" \
  --format json
```
