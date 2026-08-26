# Blue Ocean Scoring Model Reference

## Four-Dimension Scoring Framework

| Dimension | Code | Range | Description | Weight |
|-----------|------|-------|-------------|--------|
| Demand Intensity | D | 1-5 | Buyer-side real demand volume | 0.35 |
| Competition Density | C | 1-5 | Supply-side seller count & homogeneity (lower = better) | 0.30 |
| Growth Slope | G | 1-5 | Recent acceleration trend | 0.25 |
| Capability Fit | F | 1-5 | User's factory capability match (Scene D only, default 3.0) | 0.10 |

## Formula

```
Blue Ocean Score = (D × 0.35) + ((6 - C) × 0.30) + (G × 0.25) + (F × 0.10)
```

Note: Competition is inverted via `(6 - C)` so that lower competition yields higher score.

## Score Interpretation

| Score Range | Emoji | Recommendation |
|-------------|-------|----------------|
| ≥ 4.0 | 🟢 | Strong entry recommendation |
| 3.0 – 3.9 | 🟡 | Cautious evaluation, differentiation needed |
| < 3.0 | 🔴 | Hold, wait for better timing |

## Dimension Scoring Guidelines

### Demand Intensity (D)

| Score | Signal |
|-------|--------|
| 5 | Explosive growth: search volume surge, social media viral, BSR top 20 |
| 4 | Strong demand: consistent high inquiry volume, growing search trends |
| 3 | Stable: moderate inquiry volume, flat search trends |
| 2 | Declining: inquiry volume dropping, negative search trends |
| 1 | Shrinking: minimal buyer interest, category contraction |

### Competition Density (C) — Search-Based Estimation

> ⚠️ 当前数据来源为 `product_supplier_search` 搜索结果（非平台排名接口）。
> 搜索结果只返回部分供应商，以下阈值已针对搜索数据校准。

| Score | Signal |
|-------|--------|
| 5 | Saturated: >80 suppliers in search results, price war, minimal price variance |
| 4 | Crowded: 51-80 suppliers in search, high homogeneity, many established players |
| 3 | Moderate: 26-50 suppliers, some differentiation space |
| 2 | Low competition: 11-25 suppliers, price diversity (spread > 0.5), clear differentiation gaps |
| 1 | Near-virgin: ≤10 suppliers, ≤20 products, no standardized offering |

### Growth Slope (G) — Web-Signal-Based

> ⚠️ 当前无平台时序数据（avg_ab_growth），G 维度完全依赖 web 信号。

| Score | Signal |
|-------|--------|
| 5 | Google Trends sharply rising + Amazon BSR new entrants + TikTok/social viral |
| 4 | Google Trends rising OR Amazon BSR growth signals |
| 3 | Google Trends stable, moderate social media presence |
| 2 | Google Trends flat to slightly declining |
| 1 | Google Trends declining, no social buzz |

### Capability Fit (F) — Scene D Only

| Score | Signal |
|-------|--------|
| 5 | Perfect match: all certifications held, MOQ/price/customization fully aligned |
| 4 | Strong match: most requirements met, minor gaps |
| 3 | Partial match: some capabilities align, investment needed |
| 2 | Weak match: significant capability gaps |
| 1 | No match: completely outside factory's capability |
