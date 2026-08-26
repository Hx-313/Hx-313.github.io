---
name: 多分镜视频生成
version: 1.0.0
description: 根据用户的文本描述或图文输入，生成多分镜视频文案与视频。先推荐多套分镜方案，由用户确认选择后再解析为可用于视频生成的分镜数据，最后生成分镜视频并调起画布展示结果，支持文生视频与图文生视频两种模式, 未提供图片时执行文生视频模式，提供图片时执行图文生视频模式。
---

# 多分镜视频生成

本 Skill 用于多分镜视频的生成。执行时必须严格按照下文定义的工作流顺序执行每一步，不得跳过、合并或自行简化。

## 工作流概览

1. **阶段一：视频描述推荐** → 根据用户输入，调用分镜视频描述推荐MCP工具获取推荐方案
2. **阶段二：用户选择** → 将阶段一获取的推荐方案通过 `ask_user` 工具展示给用户，等待用户选择
3. **阶段三：分镜视频文案解析** → 将阶段二中用户选择的推荐文案传入分镜文案解析MCP工具获取解析结果
4. **阶段四：多分镜视频生成** → 将阶段三获取的分镜文案列表传入多分镜视频生成MCP工具，获取 `requestKey`
5. **阶段五：调起画布** → 将前序阶段获取的 `inputImgUrls`、`storyboardList`、`requestKey`、`ratio` 传入画布渲染脚本，调起画布展示视频生成结果

---

## DAG 结构与任务执行协议

本 Skill 的工作流由 **DAG (Directed Acyclic Graph) 任务系统** 驱动。任务按 ID 顺序迭代执行，每个任务须等待其 `blockedBy` 依赖完成后方可执行。

### DAG Structure

```
T1 (视频描述推荐) → T2 (用户选择方案) → T3 (分镜视频文案解析) → T4 (多分镜视频生成) → T5 (调起画布)
```

- **T1 — 视频描述推荐**：blockedBy: none → Produces: recommendPrompts（推荐方案列表）
- **T2 — 用户选择方案**：blockedBy: T1 → Produces: 用户选定的推荐文案
- **T3 — 分镜视频文案解析**：blockedBy: T2 → Produces: storyboardList（分镜列表）
- **T4 — 多分镜视频生成**：blockedBy: T3 → Produces: requestKey（视频生成请求标识）
- **T5 — 调起画布**：blockedBy: T4 → Produces: 画布渲染输出（:::slot 标记）

### Step 1: Plan — 一次性创建完整 DAG

在第一个 response 中并行调用所有 `task_create`，使用 `blockedBy` 内联声明依赖。**禁止分批创建、禁止后续补插任务。**

```
task_create({ subject: "视频描述推荐", description: "调用 command_video_prompt_recommend 获取推荐方案", blockedBy: [] })
task_create({ subject: "用户选择方案", description: "通过 ask_user 展示推荐方案并等待用户选择", blockedBy: ["1"] })
task_create({ subject: "分镜视频文案解析", description: "调用 command_video_generate_storyboard 解析用户选定的方案", blockedBy: ["2"] })
task_create({ subject: "多分镜视频生成", description: "调用 command_video_generate 生成视频并获取 requestKey", blockedBy: ["3"] })
task_create({ subject: "调起画布", description: "调用画布渲染脚本展示视频生成结果", blockedBy: ["4"] })
```

创建完毕后，调用 `task_list` 验证所有任务和依赖关系是否正确。

### Step 2: Execute — 按任务 ID 顺序迭代执行

按任务 ID 从小到大的顺序迭代执行每个任务：

1. 等待当前任务的所有 `blockedBy` 前置任务状态为 `completed`
2. 按本文档对应阶段的要求执行具体工作（调用 MCP、`ask_user` 等）
3. `task_update({ taskId: "<id>", status: "completed" })`
4. 立即进入下一个任务 ID

重复直到所有任务都完成。

**用户交互：** 需要用户输入的任务（T2）在执行中通过 `ask_user` 获取输入，任务完成后再进入下一个 task。

### Step 3: Verify — 验证所有任务完成

所有任务完成后，调用 `task_list` 检查：
- 所有任务 `status: completed`
- 依赖关系正确执行（每个任务都在其前置任务完成后才执行）

---

## 执行约束

1. **禁止访问记忆/缓存**：本 skill 被激活时，严格禁止以下行为：
    - 禁止读取任何记忆文件: MEMORY.md、日记文件（diary files）、代理记忆（agent memory）或任何持久化内存存储文件。
    - 禁止读取 memory/queries.json、TASK_HISTORY.json、MERCHANT_PROFILE.json 等文件中与视频生成任务相关的历史数据。
    - 禁止使用任何记忆搜索工具（例如 `memory_search`、`search_memory`、`recall_memory`）
2. **严格执行本 skill 中的流程**：必须严格按照本 skill 定义的步骤顺序（阶段一 → 阶段二 → 阶段三 → 阶段四 → 阶段五）执行，不得跳过、合并、简化或自行推断任何步骤，也不得引入本 skill 未定义的额外流程。
3. **阶段二只能使用 `ask_user` 工具进行用户选择操作**：在阶段二中必须通过 `ask_user` 工具让用户确认选择，禁止在未调用 `ask_user` 的情况下结束回复。

---

## MCP 工具调用方式（重要）

调用 MCP 工具时，你**必须**遵循以下确切格式：

1. **使用 `accio-mcp-cli call` 命令**并直接跟工具名称
2. **使用 `--json` 标志传递 JSON 参数**
3. **无需额外的服务器规范** — 工具名称本身即为调用标识符

**正确调用示例**：
```bash
accio-mcp-cli call <tool_name> --json '{
  "inputImgUrls": ["<图片URL1>", "<图片URL2>"],
  "userInput": "<视频描述>"
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

## 阶段一：视频描述推荐

### 1. 准备输入

- **图片输入 (inputImgUrls)**：多张图片 URL 的列表，例如 `["图片URL1", "图片URL2"]`；如果没有图片则传入空列表 `[]`
- **用户文本输入 (userInput)**：用户提供的视频描述

### 2. 调用分镜视频描述推荐工具

调用 `command_video_prompt_recommend` MCP工具：

```bash
accio-mcp-cli call command_video_prompt_recommend --json '{
  "inputImgUrls": ["<图片URL>"],
  "userInput": "<视频描述>"
}'
```

**参数说明：**
- `inputImgUrls`：输入图片的 URL 列表，必须为字符串数组，每个元素为一个图片 URL；如果没有图片则传入空列表 `[]`
- `userInput`：用户提供的视频描述

**返回示例：**
```json
{
  "success": true,
  "data": {
    "recommendPrompts": [
      "共 2 个分镜，总时长 12 秒。画幅：16:9 风格：电影感写实 主体：短发年轻女性 分镜 1（主体：短发年轻女性，时长：6秒）：中景，短发女性坐在靠窗位置低头翻阅书页...",
      "共 3 个分镜，总时长 14 秒。画幅：16:9 风格：日系清新 主体：短发年轻女性与拿铁咖啡...",
      "共 4 个分镜，总时长 22 秒。画幅：16:9 风格：电影叙事感 主体：短发年轻女性的咖啡馆午后 ..."
    ]
  }
}
```

从返回结果中获取 `data.recommendPrompts` 数组作为阶段二用户选择的输入。

---

## 阶段二：用户选择

### 1. 准备输入

- **推荐方案列表 (recommendPrompts)**：阶段一分镜视频描述推荐工具返回的 `data.recommendPrompts` 数组

### 2. 通过 `ask_user` 展示结果并请求用户确认

将 `recommendPrompts` 数组中每个元素作为一个方案**逐字原样**通过 `ask_user` 工具展示给用户，并等待用户选择。

**输出规则（必须严格遵守）：**
- **禁止改写**：不得对 `recommendPrompts` 中的文案做任何修改、缩写、摘要、润色或重新组织。
- **禁止省略**：每个方案的完整文本必须全部展示，包括画幅、风格、时长、每个分镜的全部描述细节。
- **禁止拆解重组**：不得把原文拆成表格、要点列表或其他结构化格式，直接以原文文本形式输出。
- **必须使用 `ask_user`**：展示方案并请求用户选择时，必须通过 `ask_user` 工具完成。

**`ask_user` 交互内容格式：**

> 为您生成了以下 3 条视频分镜推荐方案：
>
> ---
>
> **方案一：**
>
> {recommendPrompts[0] 的完整原文，一字不改}
>
> ---
>
> **方案二：**
>
> {recommendPrompts[1] 的完整原文，一字不改}
>
> ---
>
> **方案三：**
>
> {recommendPrompts[2] 的完整原文，一字不改}
>
> ---
>
> 请选择您想使用的方案：

**`ask_user` 选项（只有以下 4 个选项）：**

- **选项 1**：使用方案一 — 共 N 个分镜，总时长 X 秒。关键分镜概要
- **选项 2**：使用方案二 — 共 N 个分镜，总时长 X 秒。关键分镜概要
- **选项 3**：使用方案三 — 共 N 个分镜，总时长 X 秒。关键分镜概要
- **选项 4**：重新生成 — 重新生成全新的推荐方案

**选项内容规则：**
- 每个方案选项的描述需根据实际返回的 `recommendPrompts` 内容提炼出分镜数量、总时长和关键分镜概要

### 3. 处理用户反馈

- **选择某个方案**：将用户选定的文案作为阶段三 `userInput` 的输入，进入阶段三。
- **重新生成**：回到阶段一步骤 2 重新调用 `command_video_prompt_recommend` MCP 工具，获取新的推荐结果，再次通过 `ask_user` 展示并请求用户选择

---

## 阶段三：分镜视频文案解析

### 1. 准备输入

- **图片输入 (inputImgUrls)**：多张图片 URL 的列表，例如 `["图片URL1", "图片URL2"]`；如果没有图片则传入空列表 `[]`
- **文案输入 (userInput)**：阶段二中用户选定的文案

### 2. 调用分镜视频文案解析工具

调用 `command_video_generate_storyboard` MCP工具：

```bash
accio-mcp-cli call command_video_generate_storyboard --json '{
  "inputImgUrls": ["<图片URL>"],
  "userInput": "<用户选定的推荐文案>"
}'
```

**参数说明：**
- `inputImgUrls`：输入图片的 URL 列表，必须为字符串数组，每个元素为一个图片 URL；如果没有图片则传入空列表 `[]`
- `userInput`：阶段二中用户选定的文案

**返回示例：**
```json
{
  "success": true,
  "data": {
    "inputImgUrls": ["<图片URL>"],
    "ratio": "16:9",
    "storyboardList": [
      {
        "seconds": "4",
        "storyboard": "分镜1视频描述"
      },
      {
        ...
      }
    ]
  }
}
```

从返回结果中获取 `data.storyboardList` 字段中的列表，同时获取`data.ratio`字段中的比例，作为阶段四多分镜视频生成MCP工具和阶段五画布渲染的输入。

---

## 阶段四：多分镜视频生成

### 1. 准备输入

- **图片输入 (inputImgUrls)**：多张图片 URL 的列表，例如 `["图片URL1", "图片URL2"]`；如果没有图片则传入空列表 `[]`
- **画幅比例 (ratio)**：阶段三分镜视频文案解析工具返回的 `data.ratio`
- **多分镜文案列表 (storyboardList)**：阶段三分镜视频文案解析工具获取的`data.storyboardList`中的列表结果


### 2. 调用多分镜视频生成工具

调用 `command_video_generate` MCP工具：

```bash
accio-mcp-cli call command_video_generate --json '{
  "inputImgUrls": ["<图片URL>"],
  "ratio": "<ratio>",
  "storyboardList": [{"seconds": "4", "storyboard": "分镜1视频描述"}, {...}, ...]
  
}'
```

**参数说明：**
- `inputImgUrls`：输入图片的 URL 列表，必须为字符串数组，每个元素为一个图片 URL；如果没有图片则传入空列表 `[]`
- `ratio`：阶段三分镜视频文案解析工具返回的 `data.ratio`，值为 `"16:9"` 或 `"9:16"`
- `storyboardList`：阶段三分镜视频文案解析工具返回的 `data.storyboardList` 列表

**返回示例：**
```json
{
  "success": true,
  "data": "c3282371-45d5-493e-a90e-00948eecb342"
}
```

从返回结果中获取 `data` 字段作为 **`requestKey`**，用于阶段五画布渲染的输入。

---

## 阶段五：调起画布

### 1. 准备输入

从前序阶段收集以下数据：

- **abilityCode**：固定值 `"commandVideoGenerate"`
- **inputImgUrls**：多张图片 URL 的列表，例如 `["图片URL1", "图片URL2"]`，如果没有图片则传入空列表 `[]`
- **storyboardList**：阶段三分镜视频文案解析工具返回的 `data.storyboardList` 列表
- **ratio**：阶段三分镜视频文案解析工具返回的 `data.ratio` （如 `"16:9"` 或 `"9:16"`）
- **requestKey**：阶段四多分镜视频生成工具得到的 `requestKey`

### 2. 调用画布渲染脚本

使用 `bun` 执行画布渲染脚本，传入 JSON 格式的 payload：

```bash
bun <skill_dir>/references/scripts/render.ts '{"abilityCode":"commandVideoGenerate","inputImgUrls":["<图片URL1>","<图片URL2>"],"storyboardList":[{"storyboard":"分镜1视频描述","seconds":"4"},{"storyboard":"分镜2视频描述","seconds":"6"}],"requestKey":"<requestKey>","ratio":"<ratio>"}'
```

**参数说明：**
- `abilityCode`：必须为 `"commandVideoGenerate"`
- `inputImgUrls`：输入图片的 URL 列表，必须为字符串数组；如果没有图片则传入空列表 `[]`
- `storyboardList`：阶段三返回的 `data.storyboardList` 列表，每个元素包含 `storyboard`（分镜描述）和 `seconds`（时长）字段
- `ratio`：画幅比例，阶段三返回的 `data.ratio` 字段值，为 `"16:9"` 或 `"9:16"`
- `requestKey`：阶段四得到的 `requestKey`

### 3. 输出画布

脚本执行后会输出结构化数据，包含 `:::slot[...]` 标记。将该标记**原样放置**在回复中，不得添加任何额外文本或修改标记内容。

**输出规则（必须严格遵守）：**
- **禁止修改**：不得对脚本输出的 `:::slot[...]` 标记做任何修改、包装或重新格式化
- **禁止省略**：必须完整输出脚本返回的全部内容
- **禁止添加额外内容**：在 `:::slot[...]` 标记之外不得添加任何解释性文字或其他内容