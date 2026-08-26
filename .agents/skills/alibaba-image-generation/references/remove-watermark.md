---
name: remove-watermark
description: 从图片中移除水印、网站信息、联系方式或二维码，生成干净的图片。调用水印移除服务处理图片，输入一张图片，服务自动检测并移除水印，输出处理后的图片路径。当用户需要去除图片水印、清除网站标识、移除联系方式或二维码时使用。
---

# 图片水印移除

## 功能说明

本 Skill 用于从图片中移除水印、网站信息、联系方式或二维码等不需要的元素，生成干净的图片，适用于电商产品图处理、图片素材净化等场景。

## 支持的移除类型

1. **水印** - 文字水印、图片水印、半透明水印等
2. **网站信息** - 网站URL、网站Logo、来源标识等
3. **联系方式** - 电话号码、微信号、QQ号等
4. **二维码** - 各类二维码图片

## 使用流程

### 1. 准备输入

- 输入：一张待处理的图片（支持常见格式：JPG、PNG、WEBP 等）
- 图片路径：用户提供的图片文件路径
- 服务将自动检测图片中的水印、文字、二维码等元素并移除

### 2. 参数校验（前置拦截）

**在调用 workctl 命令之前，必须先校验必传参数。如果参数为空，不发起请求，直接提示用户。**

| 必传参数 | 校验规则 | 缺失时处理 |
|---------|---------|-----------|
| `abilityCode` | 固定值 `imageOptimize`，不可为空 | 终止流程，提示"系统参数异常，请重试" |
| `imageUrl` | 用户提供的图片 URL，不可为空 | 终止流程，提示"请提供需要去除水印的图片" |

### 3. 调用 workctl CLI（两步调用）

水印移除需要调用两个 workctl 命令，按顺序执行：

#### 步骤 3.1：调用水印移除工具

调用 `workctl icbu product product-ai-image-generate` 工具：

```
命令：workctl icbu product product-ai-image-generate
参数：
  abilityCode: "imageOptimize"
  imageUrl: "<图片URL>"
  prompt: ""
```

**参数说明：**
- `abilityCode`：固定值 `imageOptimize`（水印移除能力代码）
- `imageUrl`：输入图片的URL地址
- `prompt`：固定为空字符串

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
3. **错误处理**：处理失败时检查 `success` 字段和 `errorMsg` 信息
4. **状态检查**：结果中的 `status` 字段表示处理状态，`status: 1` 表示成功
5. **超时处理**：如果 8 次轮询后仍未成功，应向用户报告超时错误
6. **版权注意**：请确保有权处理该图片，移除水印可能涉及版权问题

## 使用示例

**场景1：移除图片水印**

用户："帮我把这张图片上的水印去掉"

执行步骤：
1. 获取用户提供的图片路径
2. 调用 `workctl icbu product product-ai-image-generate` 工具获取 requestKey
3. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果（每15秒一次，最多8次）
4. 返回最终结果

**示例调用：**

第一步 - 调用水印移除：
```
命令：workctl icbu product product-ai-image-generate
参数：
  abilityCode: "imageOptimize"
  imageUrl: "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg"
  prompt: ""
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

**场景2：移除网站标识**

用户："这张图片右下角有个网站地址，帮我删掉"

执行步骤：
1. 获取用户提供的图片路径
2. 调用 `workctl icbu product product-ai-image-generate` 工具（`abilityCode: imageOptimize`）获取 requestKey
3. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果
4. 返回最终结果

**场景3：移除二维码**

用户："帮我清除图片上的二维码"

执行步骤：
1. 获取用户提供的图片路径
2. 调用 `workctl icbu product product-ai-image-generate` 工具（`abilityCode: imageOptimize`）获取 requestKey
3. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果
4. 返回最终结果

## 完整 CLI 调用示例

```bash
# 步骤 1：提交水印移除任务
workctl icbu product product-ai-image-generate \
  --abilityCode "imageOptimize" \
  --imageUrl "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg" \
  --prompt "" \
  --format json

# 步骤 2：轮询获取结果（使用步骤1返回的 data 值作为 requestKey）
workctl icbu product product-ai-image-generate-result \
  --requestKey "c3282371-45d5-493e-a90e-00948eecb342" \
  --format json
```
