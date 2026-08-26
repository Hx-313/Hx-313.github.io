---
name: image-translation
description: 通过上传图片和目标语言代码，将图片中的文本翻译为对应的语言。调用图片翻译服务，输入图片和目标语言代码，输出翻译后的图片。当用户需要将图片中的文字翻译成其他语言时使用。
---

# 图片翻译功能

## 功能说明

本 Skill 用于识别图片中的文本内容，并将其翻译为指定的目标语言，生成翻译后的图片。适用于商品图翻译、海报翻译、文档图片翻译等场景。

## 使用流程

### 1. 准备输入

- **imageUrl**（必填）：需要翻译的图片 URL 地址
- **targetLang**（必填）：目标语言代码或语言名称（如 `vi` 或"越南语"）

**支持的语言映射表：**

| 语言代码 | 语言名称 |
|---------|---------|
| de | 德语 |
| es | 西班牙语 |
| fr | 法语 |
| it | 意大利语 |
| pt | 葡萄牙语 |
| ru | 俄语 |
| ja | 日语 |
| ko | 韩语 |
| en | 英语 |
| zh | 中文 |
| vi | 越南语 |
| th | 泰语 |
| ms | 马来语 |
| ar | 阿拉伯语 |
| id | 印尼语 |

**语言输入处理逻辑：**
1. 接收用户输入的语言（可以是语言代码如 `vi`，也可以是语言名称如"越南语"）
2. 根据映射表将语言名称转换为对应的语言代码
3. 调用 workctl CLI时，统一使用语言代码进行请求

### 2. 参数校验（前置拦截）

**在调用 workctl 命令之前，必须先校验必传参数。如果参数为空，不发起请求，直接提示用户。**

| 必传参数 | 校验规则 | 缺失时处理 |
|---------|---------|-----------|
| `imageUrl` | 用户提供的图片 URL，不可为空 | 终止流程，提示"请提供需要翻译的图片" |
| `targetLang` | 目标语言代码，不可为空 | 终止流程，提示"请提供目标翻译语言（如英语、vi）" |

### 3. 调用 workctl CLI（两步调用）

图片翻译需要调用两个 workctl 命令，按顺序执行：

#### 步骤 3.1：调用图片翻译工具

调用 `workctl icbu product product-ai-image-translate` 工具：

```
命令：workctl icbu product product-ai-image-translate
参数：
  imageUrl: "<图片URL>"
  targetLang: "<目标语言代码>"
```

**参数说明：**
- 能力由当前 workctl 专用命令路径固定，不额外传 `abilityCode` 参数。
- `imageUrl`：需要翻译的图片 URL 地址（必填）
- `targetLang`：目标语言代码（必填，如 `en`、`ja`、`vi` 等）

**注意**：调用 workctl CLI时，`targetLang` 必须是语言代码。如果用户输入的是语言名称（如"越南语"），需要先根据映射表转换为语言代码（如 `vi`）再调用。

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
- requestKey：步骤 3.1 中 `workctl icbu product product-ai-image-translate` 返回的 `data` 字段值

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

## 语言映射处理

**支持用户输入语言代码或语言名称。**

系统会自动识别用户输入并进行转换：
- 如果用户输入语言代码（如 `vi`），直接使用
- 如果用户输入语言名称（如"越南语"），根据映射表转换为语言代码（`vi`）

**语言映射表（代码 ↔ 名称）：**

```python
lang_code = {
    'de': '德语',
    'es': '西班牙语',
    'fr': '法语',
    'it': '意大利语',
    'pt': '葡萄牙语',
    'ru': '俄语',
    'ja': '日语',
    'ko': '韩语',
    'en': '英语',
    'zh': '中文',
    'vi': '越南语',
    'th': '泰语',
    'ms': '马来语',
    'ar': '阿拉伯语',
    'id': '印尼语'
}
```

**转换逻辑：**
1. 检查用户输入是否在 `lang_code.keys()` 中（语言代码）→ 直接使用
2. 检查用户输入是否在 `lang_code.values()` 中（语言名称）→ 查找对应代码使用
3. 如果都不匹配 → 返回语言映射表提示用户

## 注意事项

1. **两步调用**：必须先调用 `workctl icbu product product-ai-image-translate` 获取 requestKey，再调用 `workctl icbu product product-ai-image-generate-result` 获取结果
2. **轮询机制**：第二步需要轮询获取结果，每 15 秒尝试一次，最多 8 次
3. **语言处理**：支持用户输入语言代码（如 `vi`）或语言名称（如"越南语"），系统会自动转换
4. **workctl 调用**：调用 workctl CLI时，`targetLang` 必须是语言代码
5. **错误处理**：处理失败时检查 `success` 字段和 `errorMsg` 信息
6. **状态检查**：结果中的 `status` 字段表示处理状态，`status: 1` 表示成功
7. **超时处理**：如果 8 次轮询后仍未成功，应向用户报告超时错误

## 使用示例

### 示例 1：用户输入语言代码

用户："帮我把这张图片翻译成越南语"

执行步骤：
1. 获取用户提供的图片 URL
2. 获取用户输入："越南语"
3. 根据映射表转换为语言代码：`vi`
4. 调用 `workctl icbu product product-ai-image-translate` 工具（使用转换后的语言代码 `vi`）获取 requestKey
5. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果（每15秒一次，最多8次）
6. 按格式输出结果

### 示例 2：用户直接输入语言代码

用户："帮我把这张图片翻译成 vi"

执行步骤：
1. 获取用户提供的图片 URL
2. 获取用户输入：`vi`（已经是语言代码，无需转换）
3. 调用 `workctl icbu product product-ai-image-translate` 工具（直接使用 `vi`）获取 requestKey
4. 轮询调用 `workctl icbu product product-ai-image-generate-result` 工具获取处理结果
5. 按格式输出结果

**示例调用：**

第一步 - 调用图片翻译：
```
命令：workctl icbu product product-ai-image-translate
参数：
  imageUrl: "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg"
  targetLang: "vi"
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

### 示例 3：语言输入无效

用户："帮我把这张图片翻译成外星语"

执行步骤：
1. 获取用户提供的图片 URL
2. 获取用户输入："外星语"
3. 检查映射表，"外星语"不在支持的语言列表中
4. 返回语言映射表，提示用户输入有效的语言代码或语言名称

**返回给用户的提示：**

请输入有效的语言代码或语言名称，支持的语言如下：

| 语言代码 | 语言名称 |
|---------|---------|
| de | 德语 |
| es | 西班牙语 |
| fr | 法语 |
| it | 意大利语 |
| pt | 葡萄牙语 |
| ru | 俄语 |
| ja | 日语 |
| ko | 韩语 |
| en | 英语 |
| zh | 中文 |
| vi | 越南语 |
| th | 泰语 |
| ms | 马来语 |
| ar | 阿拉伯语 |
| id | 印尼语 |

请使用语言代码（如 vi）或语言名称（如越南语）。

## 完整 CLI 调用示例

```bash
# 步骤 1：提交图片翻译任务
workctl icbu product product-ai-image-translate \
  --imageUrl "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg" \
  --targetLang "vi" \
  --format json

# 步骤 2：轮询获取结果（使用步骤1返回的 data 值作为 requestKey）
workctl icbu product product-ai-image-generate-result \
  --requestKey "c3282371-45d5-493e-a90e-00948eecb342" \
  --format json
```
