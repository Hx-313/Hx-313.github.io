---
name: product-scene-display
description: 将商品图片合成到指定场景中展示，结果路径保存在json中。调用商品场景展示服务处理图片，输入一张商品图片和场景描述prompt，输出场景展示后的图片路径。当用户需要在特定场景中展示商品、生成商品场景图、制作产品展示效果图时使用。
---

# 商品场景展示

## 功能说明

本 Skill 用于将商品图片合成到用户指定的场景中，生成商品场景展示图，适用于电商产品展示、营销素材制作、产品效果图生成等场景。

## 使用流程

### 1. 准备输入

- **图片输入**：一张商品图片（支持常见格式：JPG、PNG、WEBP 等）
- **场景描述**：用户提供的场景 prompt，描述希望商品展示的场景

**场景描述示例：**
- "在现代化的客厅沙发上"
- "放在木质餐桌上，周围有鲜花装饰"
- "在阳光明媚的户外草坪上"
- "放在简约风格的办公桌上"

### 2. 参数校验（前置拦截）

**在调用 workctl 命令之前，必须先校验必传参数。如果参数为空，不发起请求，直接提示用户。**

| 必传参数 | 校验规则 | 缺失时处理 |
|---------|---------|-----------|
| `abilityCode` | 固定值 `imageGenerate`，不可为空 | 终止流程，提示"系统参数异常，请重试" |
| `imageUrl` | 用户提供的商品图片 URL，不可为空 | 终止流程，提示"请提供需要场景展示的商品图片" |
| `prompt` | 用户提供的场景描述，不可为空 | 终止流程，提示"请描述您希望商品展示的场景" |

### 3. 调用 workctl CLI（两步调用）

商品场景展示需要调用两个 workctl 命令，按顺序执行：

#### 步骤 3.1：调用场景展示工具

调用 `workctl icbu product product-ai-image-generate` 工具：

```
命令：workctl icbu product product-ai-image-generate
参数：
  abilityCode: "imageGenerate"
  imageUrl: "<图片URL>"
  prompt: "<用户场景描述>"
```

**参数说明：**
- `abilityCode`：固定值 `imageGenerate`（商品场景展示能力代码）
- `imageUrl`：输入商品图片的URL地址
- `prompt`：用户提供的场景描述，应尽量具体清晰

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

1. **两步调用**：必须先调用 `workctl icbu product product-ai-image-generate` 获取 requestKey，再调用 `workctl icbu product product-ai-image-generate-result` 获取结果
2. **轮询机制**：第二步需要轮询获取结果，每 15 秒尝试一次，最多 8 次
3. **场景描述**：prompt 应尽量具体清晰，描述场景的环境、光线、风格等细节
4. **错误处理**：处理失败时检查 `success` 字段和 `errorMsg` 信息
5. **状态检查**：结果中的 `status` 字段表示处理状态，`status: 1` 表示成功
6. **超时处理**：如果 8 次轮询后仍未成功，应向用户报告超时错误

## 使用示例

**场景1：客厅展示**

用户："帮我把这个抱枕放到现代风格的客厅沙发上展示"

执行步骤：
1. 获取用户提供的商品图片路径
2. 获取用户场景描述：现代风格的客厅沙发上
3. 调用 `workctl icbu product product-ai-image-generate` 工具获取 requestKey
4. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果（每15秒一次，最多8次）
5. 返回最终结果

**示例调用：**

第一步 - 调用场景展示：
```
命令：workctl icbu product product-ai-image-generate
参数：
  abilityCode: "imageGenerate"
  imageUrl: "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg"
  prompt: "现代风格的客厅沙发上"
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

**场景2：办公场景**

用户："我想看看这个笔记本放在办公桌上是什么效果"

执行步骤：
1. 获取用户提供的商品图片路径
2. 获取用户场景描述：放在办公桌上
3. 调用 `workctl icbu product product-ai-image-generate` 工具获取 requestKey
4. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果
5. 返回最终结果

**场景3：户外场景**

用户："帮我生成这张户外背包在山间小路上的场景图"

执行步骤：
1. 获取用户提供的商品图片路径
2. 获取用户场景描述：在山间小路上
3. 调用 `workctl icbu product product-ai-image-generate` 工具获取 requestKey
4. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果
5. 返回最终结果

**成功后输出示例：**

已经帮你生成图片

![](https://sc04.alicdn.com/kf/H696151c21a7342229edefd0b3769a579S/200042360/H696151c21a7342229edefd0b3769a579S.png)

## 完整 CLI 调用示例

```bash
# 步骤 1：提交商品场景展示任务
workctl icbu product product-ai-image-generate \
  --abilityCode "imageGenerate" \
  --imageUrl "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg" \
  --prompt "现代风格的客厅沙发上" \
  --format json

# 步骤 2：轮询获取结果（使用步骤1返回的 data 值作为 requestKey）
workctl icbu product product-ai-image-generate-result \
  --requestKey "c3282371-45d5-493e-a90e-00948eecb342" \
  --format json
```
