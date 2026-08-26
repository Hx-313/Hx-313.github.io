---
name: 商品场景视频生成
version: 1.0.0
description: 根据提供的商品图片生成一个商品的动态场景展示视频。输入为一张商品图片和用户输入的生成视频描述，输出视频URL。当用户需要使用图片生成商品视频时使用。
---

# 商品视频生成

## 功能说明

本 Skill 用于将提供的商品图片转化为视频，适用于8秒内的电商产品动态视频展示、生成产品互动视频、商品图场景动效视频生成、以及商品与人物模特的互动视频等商品视频生成。

## 执行约束

1. **不复用历史结果**：即使用户会话与之前会话相似，也必须重新执行完整流程，不得跳步或复用之前的解析/预测结果。
2. **禁止访问记忆/缓存**：本 skill 被激活时，严格禁止以下行为：
   - 禁止读取任何记忆文件: MEMORY.md、日记文件（diary files）、代理记忆（agent memory）或任何持久化内存存储文件。
   - 禁止读取 memory/queries.json、TASK_HISTORY.json、MERCHANT_PROFILE.json 等文件中与视频生成任务相关的历史数据。
   - 禁止使用任何记忆搜索工具（例如 `memory_search`、`search_memory`、`recall_memory`）。
   - 本 skill 的所有输入只能来自用户当前消息和当前会话中上游步骤的返回值。
3. **严格执行本 skill 中的流程**：必须严格按照本 skill 定义的步骤顺序执行，不得跳过、合并、简化或自行推断任何步骤，也不得引入本 skill 未定义的额外流程。

---

## MCP 工具调用方式（重要）

调用 MCP 工具时，你**必须**遵循以下确切格式：

1. **使用 `accio-mcp-cli call` 命令**并直接跟工具名称
2. **使用 `--json` 标志传递 JSON 参数**
3. **无需额外的服务器规范** — 工具名称本身即为调用标识符

**正确调用示例**：
```bash
accio-mcp-cli call product_scene_video_generate_v2 --json '{
  "abilityCode": "sceneVideoGenerate",
  "image": "<图片URL>",
  "prompt": "<视频描述>"
}'
```

**错误调用示例**（禁止使用这些命令）：
```bash
# 不要使用这些命令 - 它们是被禁止的
accio-mcp-cli keyword ...
accio-mcp-cli search ...
```

### 总结：
1. **始终使用 `accio-mcp-cli call <tool_name> --json '<params>'`** 格式进行工具调用
2. **绝不使用 `accio-mcp-cli keyword`** — 此命令被禁止
3. **绝不使用 `accio-mcp-cli search`** — 此命令被禁止
4. **此规则适用于所有 MCP 工具调用** — 贯穿整个执行过程

---

## 路径判定

收到用户视频生成请求后，**必须先判定路径，再执行对应流程**：

1. 检查用户指令中是否**明确包含**以下关键词：`画布生成商品场景视频`、`创意工坊商品图生成场景视频`、`画布生商品视频`、`创意工坊生商品视频`
2. 根据判定结果执行对应路径：

- ❌ **不包含**上述关键词 → 走 **路径 A：MCP 视频生成**
  - 调用 MCP 工具生成视频并返回视频链接

- ✅ **包含**上述关键词 → 走 **路径 B：画布生视频**
  - 不调用 MCP 工具，直接唤起画布入口

---

## 路径 A：MCP 视频生成

### 1. 准备输入

- **图片输入**：一张商品图片URL（支持常见格式：JPG、PNG、WEBP 等），以字符串形式传入
- **商品视频描述**：用户提供的生成视频描述，描述如何将图片转化为动态视频

**商品视频描述示例:**
- "生成这个商品的电商展示视频"
- "将画面中背景更换为高级的白色大理石展示台，旁边点缀少量极简的植物叶片。商品静态平放在台面上，镜头缓慢拉远，展现商品整体构图"
- "镜头缓慢拉远，展示商品在阳光下的纹理细节和原木框架的质感"

### 2. 调用 MCP 服务（两步调用）

商品视频生成需要调用两个 MCP 工具，按顺序执行：

#### 步骤 2.1：调用商品视频生成工具

调用 `product_scene_video_generate_v2` 工具：

```bash
accio-mcp-cli call product_scene_video_generate_v2 --json '{
  "abilityCode": "sceneVideoGenerate",
  "image": "<图片URL>",
  "prompt": "<视频描述>"
}'
```

**参数说明：**
- `abilityCode`：固定值 `sceneVideoGenerate`（商品场景视频能力代码）
- `image`：输入商品图片的URL地址字符串。
- `prompt`：用户提供的视频描述。

**返回示例：**
```json
{
  "success": true,
  "data": "c3282371-45d5-493e-a90e-00948eecb342"
}
```

从返回结果中获取 `data` 字段作为 `requestKey`，用于下一步查询结果。

#### 步骤 2.2：获取处理结果（轮询机制）

由于图片处理需要时间，第二步需要采用**轮询机制**获取结果：

- **轮询间隔**：每 60 秒尝试一次
- **最大尝试次数**：10 次（最长等待 600 秒）

使用上一步返回的 `requestKey` 调用 `product_ai_video_generate_result` 工具：

```bash
accio-mcp-cli call product_ai_video_generate_result --json '{
  "requestKey": "<步骤2.1返回的data值>"
}'
```

**参数说明：**
- `requestKey`：步骤 2.1 返回的 `data` 字段值

**轮询逻辑：**

1. 首次调用后检查 `data.status` 字段
2. 如果 `status: 1` 且 `success: true`，返回结果
3. 如果仍在处理中，等待 60 秒后再次调用
4. 重复步骤 2-3，最多尝试 10 次
5. 如果 10 次后仍未成功，返回超时错误

**返回示例：**
```json
{
  "data": {
    "videoUrlList": ["https://play.video.alibaba.com/play/6000328388466.mp4"],
    "status": 1
  },
  "errorCode": null,
  "errorMsg": null,
  "success": true
}
```

生成的视频 URL 为 `data.videoUrlList[0]`。

### 3. 输出结果

**重要：获取到处理结果后，按照以下格式向用户展示，不要直接返回原始 JSON。**

从 `product_ai_video_generate_result` 返回结果中提取：
- 视频 URL：`data.videoUrlList[0]`

**输出格式：**

```
已经帮你生成视频

视频链接：[视频URL](视频URL)
```

**输出示例：**

已经帮你生成视频

视频链接：[https://play.video.alibaba.com/play/6000328388466.mp4](https://play.video.alibaba.com/play/6000328388466.mp4)


- ✅ 正确：严格按上述格式输出视频链接（使用 Markdown 超链接格式），不要输出额外信息
- ❌ 错误：直接返回原始 JSON

### 注意事项

1. **两步调用**：必须先调用 `product_scene_video_generate_v2` 获取 requestKey，再调用 `product_ai_video_generate_result` 获取结果
2. **轮询机制**：第二步需要轮询获取结果，每 60 秒尝试一次，最多 10 次
3. **错误处理**：处理失败时检查 `success` 字段和 `errorMsg` 信息
4. **状态检查**：结果中的 `status` 字段表示处理状态，`status: 1` 表示成功
5. **超时处理**：如果 10 次轮询后仍未成功，应向用户报告超时错误

### 使用示例

用户："生成这个玻璃杯的电商展示视频"

执行步骤：
1. 获取用户提供的商品图片URL
2. 获取用户输入的商品视频描述：生成这个玻璃杯的电商展示视频
3. 调用 `product_scene_video_generate_v2` 工具获取 requestKey
4. 轮询调用 `product_ai_video_generate_result` 工具获取处理结果（每60秒一次，最多10次）
5. 返回最终结果

**示例调用：**

第一步 - 调用商品视频生成：
```bash
accio-mcp-cli call product_scene_video_generate_v2 --json '{
  "abilityCode": "sceneVideoGenerate",
  "image": "https://sc01.alicdn.com/kf/H5b56916614944dafaa06ea9f03aff8979.jpg",
  "prompt": "生成这个玻璃杯的电商展示视频"
}'
```

第二步 - 轮询获取结果（使用第一步返回的 data 值）：
```bash
# 最多尝试 10 次，每次间隔 60 秒
for attempt in range(1, 11):
  accio-mcp-cli call product_ai_video_generate_result --json '{
    "requestKey": "c3282371-45d5-493e-a90e-00948eecb342"
  }'

  # 检查结果
  if success == true and status == 1:
    # 成功，返回 videoUrlList[0]
    break
  else:
    # 等待 60 秒后重试
    wait(60 seconds)
```

**成功后输出示例：**

已经帮你生成视频

视频链接：[https://play.video.alibaba.com/play/6000328388466.mp4](https://play.video.alibaba.com/play/6000328388466.mp4)

---

## 路径 B：画布生视频

### 1. 准备输入

从用户输入收集以下数据：

- **abilityCode**：固定值 `"sceneVideoGenerate"`
- **image**：一张商品图片URL（必填，不可为空）
- **prompt**：用户提供的视频描述

> 若图片URL为空，立即返回提示："请提供需要处理的图片"，不执行后续步骤。

### 2. 调用画布渲染脚本

使用 `bun` 执行画布渲染脚本，传入 JSON 格式的 payload：

```bash
bun <skill_dir>/references/scripts/render.ts '{"abilityCode":"sceneVideoGenerate","image":"<图片URL>","prompt":"<视频描述>"}'
```

**参数说明：**
- `abilityCode`：必须为 `"sceneVideoGenerate"`
- `image`：输入商品图片的 URL 地址字符串，必填不可为空
- `prompt`：用户提供的视频描述

### 3. 输出画布

脚本执行后会输出结构化数据，包含 `:::slot[...]` 标记。将该标记**原样放置**在回复中，不得添加任何额外文本或修改标记内容。

**输出规则（必须严格遵守）：**
- **禁止修改**：不得对脚本输出的 `:::slot[...]` 标记做任何修改、包装或重新格式化
- **禁止省略**：必须完整输出脚本返回的全部内容
- **禁止添加额外内容**：在 `:::slot[...]` 标记之外不得添加任何解释性文字或其他内容