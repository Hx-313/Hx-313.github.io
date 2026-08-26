# Report Output Template

This document defines the mandatory output format and table templates for each dimension in Report Mode.

---

## Report Header

```
# Store Diagnosis Report ({start_date} to {end_date})

- Store: {store_name}
- Industry: {industry}
- Current rating: {N}★
- Health Status: {Healthy / Unhealthy}
- Data Period: Last 30 days
```

---

## Per-Dimension Output Structure

Each dimension below MUST contain these 3 parts in order:

1. **Data table(s)** — key metrics with MoM changes and industry comparison where available
2. **Diagnostic Conclusion** — numbered paragraphs (1. 2. 3. ...), key figures in **bold**
3. **Improvement Recommendations** — actionable items, clearly separated from the conclusion

---

## ① Star Rating Diagnosis

**Star Rating Overview:**

| Capability | Current Star | Current Value | Next Level Target | Gap |
|-----------|-------------|--------------|-------------------|-----|
| Product star | {★} | {value} | {target} | {gap} |
| Marketing star | {★} | {value} | {target} | {gap} |
| Service star | {★} | {value} | {target} | {gap} |
| Sales star | {★} | {value} | {target} | {gap} |
| **Overall Star rating** | **{★}** | — | — | **Bottleneck: {lowest item}** |

Health Status: {✅ Healthy / 🔴 Unhealthy}

**Diagnostic Conclusion:**
1. {Focus on the bottleneck item (bucket effect) and gap to next level, key figures in **bold**}
2. ...

**Improvement Recommendations:**
- {Be specific, e.g. "Improve {metric} from current {X} to {Y} to upgrade to {N}★"}

---

## ② Buyer Traffic Diagnosis

**Channel Distribution:**

| Source Channel | Store Visitors | Store Share | Industry Share | MoM Change |
|---------------|---------------|-------------|---------------|------------|
| Search | {value} | {%} | {%} | {↑/↓} |
| System Recommendation | {value} | {%} | {%} | {↑/↓} |
| Direct Visit | {value} | {%} | {%} | {↑/↓} |
| In-store | {value} | {%} | {%} | {↑/↓} |
| Inquiries (MC) | {value} | {%} | {%} | {↑/↓} |
| ... | ... | ... | ... | ... |

**Regional Distribution Comparison:**

| Rank | Store Top Region | Share | Industry Top Region | Share |
|------|-----------------|-------|--------------------|----|
| 1 | {region} | {%} | {region} | {%} |
| 2 | {region} | {%} | {region} | {%} |
| 3 | {region} | {%} | {region} | {%} |
| 4 | {region} | {%} | {region} | {%} |
| 5 | {region} | {%} | {region} | {%} |

**Diagnostic Conclusion:**
1. {Numbered paragraphs with key figures in **bold**}
2. ...

**Improvement Recommendations:**
- {Specific traffic and targeting adjustment recommendations}

---

## ③ Business Opportunities Diagnosis

**Core Metrics:**

| Metric | Store (Last 30 Days) | MoM Change | Industry Avg | Industry TOP10 |
|--------|---------------------|------------|--------------|----------------|
| Business Opportunities count | {value} | {↑/↓ %} | {value} | {value} |
| Active Buyer (AB) count | {value} | {↑/↓ %} | {value} | {value} |
| L2 Buyer count | {value} | {↑/↓ %} | {value} | {value} |
| First Reply Rate | {value} | {↑/↓ %} | {value} | {value} |
| Avg Response Time | {value} | {↑/↓} | {value} | {value} |

**Conversion Funnel:**

| Funnel Stage | Last 30 Days | MoM Change |
|-------------|-------------|------------|
| Impressions → Visits | {%} | {↑/↓} |
| Visits → Business Opportunities | {%} | {↑/↓} |
| Business Opportunities → Orders | {%} | {↑/↓} |

**Diagnostic Conclusion:**
1. {Numbered paragraphs with key figures in **bold**}
2. ...

**Improvement Recommendations:**
- {Specific, actionable recommendations}

---

## ④ Product Diagnosis

**Core Metrics:**

| Metric | Current Value | MoM Change |
|--------|--------------|------------|
| Valid Product count | {value} | {↑/↓ %} |
| Newly Published (Last 30 Days) | {value} | {↑/↓ %} |
| Products with Impressions | {value} | {↑/↓ %} |
| Products with Clicks | {value} | {↑/↓ %} |
| Products with AB | {value} | {↑/↓ %} |
| Top & super products count | {value} | {↑/↓ %} |
| Super products count | {value} | {↑/↓ %} |
| Ready To Ship (RTS) product count | {value} | {↑/↓ %} |
| Risk-controlled Product count | {value} | {↑/↓ %} |
| Spam Product count | {value} | {↑/↓ %} |

**Diagnostic Conclusion:**
1. {Numbered paragraphs with key figures in **bold**}
2. ...

**Improvement Recommendations:**
- {Specific recommendations}

---

## ⑤ Trade Diagnosis

> Only output for regions with transaction markets. For regions without, state "This region does not require Trade assessment" and move on.

**Core Metrics:**

| Metric | Last 30 Days | MoM Change | Risk Flag |
|--------|-------------|------------|-----------|
| TA GMV | {value} | {↑/↓ %} | — |
| TA Order count | {value} | {↑/↓ %} | — |
| On-time Shipment Rate | {%} | {↑/↓} | < 80% ⚠️ |
| NR Cancellations count | {value} | {↑/↓} | > 0 ⚠️ / > 2 🚨 |
| Payment Conversion Rate | {%} | {↑/↓} | — |

**Diagnostic Conclusion:**
1. {Numbered paragraphs with key figures in **bold**}
2. ...

**Improvement Recommendations:**
- {Specific recommendations}

---

## 📋 Action Plan Summary

Ranked P0 → P1 → P2, maximum **6 items**:

| Priority | Dimension | Action Item | Steps | Expected Outcome |
|----------|-----------|-------------|-------|-----------------|
| 🔴 P0 | {dimension} | {title} | {how to do it} | {expected result} |
| 🟠 P1 | {dimension} | {title} | {how to do it} | {expected result} |
| 🟡 P2 | {dimension} | {title} | {how to do it} | {expected result} |

If strategy knowledge base returns matched strategies, append the corresponding recommendations.

---

## ⚡ Next Steps

> 诊断 Skill 只负责"开处方"— 明确告诉用户该优化什么、为什么、多少个。用户回复带优化意图的短语（「帮我优化商品」），平台自动路由到圈品/优化能力执行。
> 
> **⚠️ 首次报告 Next Steps 只有批量优化一个行动点，禁止展示定时任务/自动监控引导。**

**Output structure (adapt based on context):**

### 场景 A：问题商品 > 10（推荐前10个）

```
---
⚡ Next Steps

您的店铺有 {total} 个{highest_priority_category}（{problem_description}），
是当前{why_priority}。我先优化其中 ROI 最高的 10 个，{expected_outcome}。

- 流程：AI 圈品（约30秒）→ 生成优化方案（约2-3分钟）→ 您逐条查看 → 确认后才发布
- 未经您同意不会修改任何线上商品

> 回复「**帮我优化商品**」启动优化
---
```

### 场景 B：问题商品 ≤ 10（全部优化）

```
---
⚡ Next Steps

您的店铺有 {N} 个{highest_priority_category}，我帮您全部优化，{expected_outcome}。

- 流程：AI 圈品（约30秒）→ 生成优化方案（约2-3分钟）→ 您逐条查看 → 确认后才发布
- 未经您同意不会修改任何线上商品

> 回复「**帮我优化商品**」启动优化
---
```

**Generation rules:**

0. **前置判断** — 可优化问题商品总数 (`optimizable_problem_products`) 为 0 时：
   - **整个 ⚡ Next Steps 区块不输出**

1. **批量优化推荐** — Always present when **可优化的** problem products are detected:
   - **⚠️ `{highest_priority_category}` 严禁使用风控商品或 Spam 商品**:
     - 只能从3种可优化类别中选择：高曝光低点击 / 有点击无询盘 / 零曝光
     - ❌ FORBIDDEN: "风控商品" / "Spam 商品" / 任何不可圈品的类别
   - **⚠️ 首次推荐必须是 10 个**（total > 10 时）:
     - 只有用户主动要求「多做点」时才可加量，上限 200
   - When total ≤ 10, state actual count directly（如"我帮您全部优化"）
   - `{problem_description}` 用括号补充说明让商家理解这类商品是什么（如"近30天有曝光但0点击"）
   - `{why_priority}` 用一句话说明为什么要优先处理这类（如"流量浪费最严重的品类"、"全店流量冰封的核心原因"）
   - `{expected_outcome}` 期望效果（如"提升点击率"、"激活沉默商品获得基础曝光"）

2. **格式规则 (⚠️ MANDATORY)**:
   - **不加编号，不加小标题**，直接写推荐内容
   - 流程说明用分行列表（- 开头），严禁挤成大段落
   - **末尾触发词固定为「帮我优化商品」**（5字，带优化意图），加粗+书名号显示
   - 触发词必须含"优化"+"商品"关键词（平台路由依赖这些词）

3. **定时任务/自动监控** — **首次报告禁止展示**:
   - 定时任务引导仅在用户追问后触发（详见 SKILL.md "Multi-turn Dialogue Handling"）
   - Next Steps 中永远不出现"开启监控"相关内容

4. **语言规则:**
   - 与报告正文语言一致
   - 简洁、对话式语气
   - 每个行动点 2-3 行描述 + 流程列表，不要写成论文

---

> *This report is generated by AI and is for reference only. For detailed data, please visit https://i.alibaba.com/*
