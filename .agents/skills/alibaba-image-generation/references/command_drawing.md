---
name: command-drawing
description: 根据用户的输入指令和一张图片重新生成新的图像。调用指令生图能力，输入一张图片和用户指令，输出按照用户指令生成的图。当用户的需求不能命中任何图像相关的 skill（如背景消除、水印移除、商品换色、Logo贴图、场景图生成、细节生成、清晰度增强、模特图生成、图片翻译等）时，执行此 skill。
---

# 指令绘图

## 功能说明

本 Skill 用于根据用户的自然语言指令和参考图片，生成符合指令描述的新图像。作为图像生成能力的兜底方案，当用户的图像处理需求无法被其他专项能力覆盖时，通过本能力实现灵活的图像生成。

**执行判定条件**：当用户的需求不能命中以下任何图像相关 skill 时，执行此 skill：
- 背景消除 (remove-bg)
- 水印移除 (remove-watermark)
- 商品换色 (sku-color-change)
- Logo贴图 (apply-logo)
- 场景图生成 (product-scene-display)
- 细节生成 (generate-detail)
- 清晰度增强 (enhance-resolution)
- 模特图生成 (model-image)
- 图片翻译 (image-translation)

## 使用流程

### 1. 准备输入

- **用户指令**：描述期望生成图像的自然语言文本（如"把这张图片中的猫换成狗"、"给这个人物加上墨镜"、"将背景换成海滩"等）
- **参考图片**：用户提供的原始图片 URL 地址

### 2. 参数校验（前置拦截）

**在调用 workctl 命令之前，必须先校验必传参数。如果参数为空，不发起请求，直接提示用户。**

| 必传参数 | 校验规则 | 缺失时处理 |
|---------|---------|-----------|
| `abilityCode` | 固定值 `commandGeneratePic`，不可为空 | 终止流程，提示"系统参数异常，请重试" |
| `imageUrl` | 用户提供的参考图片 URL，不可为空 | 终止流程，提示"请提供参考图片" |
| `prompt` | 用户的自然语言指令，不可为空 | 终止流程，提示"请描述您希望对图片进行的操作" |

### 3. 调用 workctl CLI（两步调用）

指令绘图需要调用两个 workctl 命令，按顺序执行：

#### 步骤 3.1：调用指令绘图工具

调用 `workctl icbu product product-ai-image-generate` 工具：

```
命令：workctl icbu product product-ai-image-generate
参数：
  abilityCode: "commandGeneratePic"
  imageUrl: "<参考图片URL>"
  prompt: "<用户指令>"
```

**参数说明：**
- `abilityCode`：固定值 `commandGeneratePic`（指令绘图能力代码）
- `imageUrl`：输入参考图片的 URL 地址
- `prompt`：用户的自然语言指令，描述期望生成的图像效果

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

由于图像生成需要时间，第二步需要采用**轮询机制**获取结果：

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

生成后的图像 URL 在 `data.imageUrlList[0]` 中。

### 4. 输出结果

**重要：获取到处理结果后，按照以下格式向用户展示，不要直接返回原始 JSON。**

从 `workctl icbu product product-ai-image-generate-result` 返回结果中提取：
- 图片 URL：`data.imageUrlList[0]`
- requestKey：步骤 3.1 中 `workctl icbu product product-ai-image-generate` 返回的 `data` 字段值

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

1. **执行判定**：仅在用户图像需求无法命中其他专项 skill 时执行
2. **两步调用**：必须先调用 `workctl icbu product product-ai-image-generate` 获取 requestKey，再调用 `workctl icbu product product-ai-image-generate-result` 获取结果
3. **轮询机制**：第二步需要轮询获取结果，每 15 秒尝试一次，最多 8 次
4. **错误处理**：处理失败时检查 `success` 字段和 `errorMsg` 信息
5. **状态检查**：结果中的 `status` 字段表示处理状态，`status: 1` 表示成功
6. **超时处理**：如果 8 次轮询后仍未成功，应向用户报告超时错误

## 使用示例

**场景：根据指令修改图像**

用户："帮我把这张图片里的红色汽车改成蓝色"

执行步骤：
1. 判断需求：用户要求"改颜色"，但此需求涉及自由指令而非标准 SKU 换色流程
2. 获取用户提供的图片 URL
3. 获取用户指令："帮我把图片里的红色汽车改成蓝色"
4. 调用 `workctl icbu product product-ai-image-generate` 工具获取 requestKey
5. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果（每15秒一次，最多8次）
6. 返回最终结果

**示例调用：**

第一步 - 调用指令绘图：
```
命令：workctl icbu product product-ai-image-generate
参数：
  abilityCode: "commandGeneratePic"
  imageUrl: "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg"
  prompt: "帮我把图片里的红色汽车改成蓝色"
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
# 步骤 1：提交指令绘图任务
workctl icbu product product-ai-image-generate \
  --abilityCode "commandGeneratePic" \
  --imageUrl "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg" \
  --prompt "帮我把图片里的红色汽车改成蓝色" \
  --format json

# 步骤 2：轮询获取结果（使用步骤1返回的 data 值作为 requestKey）
workctl icbu product product-ai-image-generate-result \
  --requestKey "c3282371-45d5-493e-a90e-00948eecb342" \
  --format json
```

## 适用场景示例

- "把这张图片中的猫换成狗"
- "给这个人物加上墨镜"
- "将背景换成海滩日落"
- "把这张图片变成油画风格"
- "在图片中添加一只蝴蝶"
- "把白天场景改成夜晚"
