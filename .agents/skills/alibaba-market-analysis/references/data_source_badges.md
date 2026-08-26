# 数据来源标注规范

> 报告**必须**在标题下方第一行用 `> 数据来源：...` 标注，并在涉及具体数据的 section 末尾用脚注标注来源。
> 目的：让卖家清楚每个结论的可信度，区分"实测数据"与"AI 推断"。

---

## 报告顶部摘要行（强制）

格式：
```
> 数据来源：<来源1（统计周期）> + <来源2（统计周期）> + ... | 分析方式：<数据 / 数据+AI推断> ，统计于 <YYYY-MM-DD>
```

示例：
```
> 数据来源：阿里巴巴国际站市场参谋（统计 2026-05）+ 国际站产品参谋近30天 + Amazon 销量近30天 + Google 搜索趋势 | 分析方式：数据+AI推断，统计于 2026-06-02
```

> ⚠️ 只列**实际成功调用且为报告贡献了数据的来源**。失败的来源直接不写，不写“（失败）”“（降级）”等后缀。
> 多维度降级时，在「决策结论」之前列「未覆盖项 + 重试引导」说明哪些维度暂缺。

---

## 对外平台名（不暴露内部工具名）

| 内部工具 | 报告中写 |
|----------|---------|
| `data_advisor_industry_cate_rank` / `data_advisor_industry_country_rank` | 阿里巴巴国际站市场参谋 |
| `data_advisor_industry_market_detail` / `data_advisor_industry_market_trend` | 阿里巴巴国际站市场参谋 |
| `data_advisor_industry_seller_portrait` | 阿里巴巴国际站市场参谋·卖家分析 |
| `data_advisor_industry_buyer_profile` / `data_advisor_industry_buyer_channel` / `data_advisor_industry_crowd_insight` | 阿里巴巴国际站市场参谋·买家分析 |
| `data_advisor_product_selection` | 阿里巴巴国际站产品参谋 |
| `js_product_database_query` | Amazon 销量数据 |
| `global_hot_selling_products` | 跨平台热销数据（Temu/SHEIN/TikTok 等，按实际平台写） |
| `web_search` (Google Trends) | Google 搜索趋势 |
| `web_search` (市场报告/新闻) | 公开市场报告 / 行业资讯 |
| `product_supplier_search` | 阿里巴巴国际站供给数据 |

---

## section 级脚注

- 站内大盘数据表后：`> 数据来源：阿里巴巴国际站市场参谋，统计周期 <statDate>`
- 站内榜单表后：`> 数据来源：阿里巴巴国际站产品参谋，统计周期近30天`
- 国家需求表后：`> 数据来源：阿里巴巴国际站市场参谋·查国家，统计 2026-05`
- 卖家画像段后：`> 数据来源：阿里巴巴国际站市场参谋·卖家分析`
- 买家画像段后：`> 数据来源：阿里巴巴国际站市场参谋·买家分析`
- AI 研判段落：`> 以上为基于公开数据的 AI 推断，仅供参考`
- 降级估算段落：`> ⚠️ 本段为估算（行业大盘命令暂不可用），请以官方数据为准`

---

## 可信度分级（可选，复杂报告用）

| 标记 | 含义 |
|------|------|
| 🟢 实测 | 直接来自平台数据工具 |
| 🟡 交叉验证 | 多源数据相互印证 |
| 🟠 AI 推断 | 基于数据的逻辑推断 |
| 🔴 降级估算 | 主数据源不可用时的近似 |
