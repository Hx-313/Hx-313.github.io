# AK 配置指南

## AK 检查机制（重要）

**判断 AK 是否已配置，不应仅依据用户消息或对话历史**。正确做法是通过 CLI 命令实际检查：

- 搜索命令（text_search / image_search / link_search）执行时会自动检查 AK，如果未配置会返回 `success: false` 并提示 "AK 未配置"
- 也可主动查询配置状态：`python3 {baseDir}/cli.py configure`（无参数调用）

**禁止以下判断方式**：
- ❌ 仅因当前对话中没有出现过 AK 就认为未配置（AK 可能已持久化在本地配置文件中）
- ❌ 仅因上一轮对话配置过 AK 就认为已配置（AK 可能已过期或被清除）
- ❌ 跳过 CLI 检查直接要求用户提供 AK

**正确做法**：直接执行用户请求的搜索命令，如果 AK 未配置，CLI 会返回明确错误，此时再引导用户配置。

## 获取 AK（引导用户）

当 CLI 返回 AK 未配置错误时，Agent 输出以下引导：

> 请提供您的 AK（Access Key），用于接口调用的鉴权。
> 如果还没有 API_KEY，请前往 https://clawhub.1688.com/ 获取。

## Agent 配置流程（核心）

用户告知 AK 后，Agent 按以下步骤执行：

```
1. 从用户消息中提取 AK 字符串
2. 执行 cli.py configure <AK>
3. 检查输出：success=true → 继续；success=false → 原样输出 markdown 错误信息
4. 配置成功后 AK 已持久化到本地配置文件，后续新会话可直接使用；如同时同步至 Gateway，当前会话也立即生效
5. 继续用户的原始请求（如搜索商品）；若用户仅提供了 AK 没有其他请求，告知"配置成功，您可以开始搜索商品了"
```

## CLI 调用

```bash
# 配置 AK
python3 {baseDir}/cli.py configure YOUR_AK_HERE

# 查看当前配置状态（无参数）
python3 {baseDir}/cli.py configure
```

## 异常处理

| 场景 | Agent 应对 |
|------|-----------|
| configure 输出 success=false | 原样输出 markdown 错误信息 |
| 配置成功但后续命令仍报 AK 未配置 | 提示用户新开会话或执行 `openclaw secrets reload`，必要时再重试 configure |
| 用户问"我的 AK 在哪" | 输出上方获取 AK 引导话术，并引导用户前往 https://clawhub.1688.com/ 获取 |

通用 HTTP 异常（400/401/429/500）处理见 `references/common/error-handling.md`。