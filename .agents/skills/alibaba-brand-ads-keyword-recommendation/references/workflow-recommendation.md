# 关键词推荐流程

本文档定义关键词推荐能力的完整入口流程。收到推荐意图后，按以下步骤执行：

```
Step 1.1 前置校验（产品线确认）
  → Step 1.2 场景识别（秒杀 / 打标）
  → Step 1.3 画像生成（画像完成）
  → 加载对应场景 workflow，按 workflow 步骤执行至报告生成
```

必须严格按此顺序执行，禁止跳过或乱序。

---

## Step 1：场景识别与画像生成

### 1.1 前置校验

品牌广告关键词推荐必须要明确推词的品牌广告业务线（问鼎/顶展）。
首先需要从用户的问题中识别出推词的品牌广告业务线，如果未识别到，礼貌询问："请问您希望推荐的是问鼎关键词还是顶展关键词？"

> 业务线未确认前，禁止进入后续任何步骤。

### 1.2 场景识别

确认产品线后，立即识别推词场景：

| 场景 | 路由条件 |
|------|---------|
| **秒杀场景**（默认） | 用户未明确提及打标相关诉求时，默认走此场景 |
| **打标场景** | 用户表述包含"打标词推荐"、"次月释放打标词"、"下个月可竞拍的打标词"、"提前打标跟进"等明确打标诉求 |

**打标场景识别规则：** 仅当客户表达中包含打标/竞拍相关动作词 + 次月/下个月/释放等时间/来源限定词时，才路由到打标场景。其他所有情况均走秒杀场景。

### 1.3 画像生成

用 `workctl batch call` 并发调用 `search-customer-shop` 和 `get-behaviors-semantic-for`，获取客户全面信息，然后按 [画像生成规则](profile-generation.md) 进行分析，生成客户画像：

> `search-customer-shop` 和 `get-behaviors-semantic-for` 未调用或画像分析未完成前，禁止进入后续推词步骤。

**batch spec 示例**：
```json
{
  "steps": [
    {"name": "shop_info", "path": "icbu.ads.search-customer-shop", "params": {}},
    {"name": "behavior_semantic", "path": "icbu.ads.get-behaviors-semantic-for", "params": {}}
  ]
}
```

```bash
workctl batch call --file keyword-profile-batch.json --format json
```

## 场景路由

画像生成完成后，加载对应场景的工作流程文档：

| 场景 | 加载文档 |
|------|---------|
| 秒杀场景（默认） | [秒杀推词流程](workflow-seckill.md) |
| 打标场景 | [打标推词流程](workflow-tagging.md) |

## 禁止行为

- **禁止**跳过画像生成直接进入搜词
