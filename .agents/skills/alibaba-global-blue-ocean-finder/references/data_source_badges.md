# Data Source Badges Reference

All badges used in the final report to indicate data provenance.

## Badge Definitions

| Badge | HTML | When to Use |
|-------|------|-------------|
| Amazon | Amazon | Amazon BSR, product data, reviews, pain points |
| Temu | Temu | Temu hot-selling data |
| TikTok Shop | TikTok Shop | TikTok Shop GMV, trending products |
| Alibaba | Alibaba | Alibaba.com supplier data, supply-side analysis |
| Google Trends | Google Trends | Search trend data, regional interest |
| Tariff Search | Tariff Search | Tariff rates, trade barriers |

---

## Badge Placement Rules

1. **Section headers**: Relevant source badge(s) next to the `##` header
2. **Key Data Points table**: Source column uses external platform name with platform name (e.g. Amazon, Alibaba)
3. **Multiple sources**: Each distinct external source gets its own badge
4. **Same source block**: Badge only ONCE at the beginning
5. **Internal tools**: Do NOT expose internal tool names (info_search, web_search, product_supplier_search) — always map to the external platform the data comes from

---

## Usage Examples

### In section header

```markdown
## Blue Ocean Opportunities Amazon Alibaba
```

### Multiple badges inline

```markdown
Amazon Alibaba
```
