# 全球热销产品数据工具速查表

**通过 `accio-mcp-cli call global_hot_selling_products` 调用。**

> ⛔ 正确：`accio-mcp-cli call global_hot_selling_products --json '{...}'`
> ❌ 错误：`workctl icbu product global-hot-selling-products ...`（不要用 workctl 调用此工具——stdout 为空，无法落盘）

## 调用示例

```bash
accio-mcp-cli call global_hot_selling_products --json '{"query":"yoga mat","platform":"temu","region":"US","sorting_rule":"sales","type":"hot_selling"}'
```

## 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | string | ✅ | 搜索关键词，建议使用英文 |
| `platform` | string | ✅ | 目标平台，小写：`temu`、`shein`、`1688`、`shopee`、`tiktok` |
| `region` | string | ❌ | ISO 2 字母国家代码：`US`、`AE`、`DE`、`CA`、`GB`、`CN` 等 |
| `sorting_rule` | string | ❌ | 固定传 `sales`（按销量排序） |
| `type` | string | ❌ | 固定传 `hot_selling`（热销查询） |

> ⚠️ `sorting_rule` 和 `type` 固定为 `sales` 和 `hot_selling`，不要传其他值。
> ⚠️ `platform` 必须小写。只允许使用 `temu`、`shein`、`1688`、`shopee`、`tiktok`。
> ⚠️ **Shopee 特殊规则**：`region` 必须传空字符串 `""`，不能传国家代码（如 `"ID"`、`"TH"`）。
> ⚠️ **1688 特殊规则**：`region` 必须传 `"CN"`。
> ⚠️ 只允许使用本文档中列出的参数，不要自己发明参数。

## 返回字段

| 字段 | 说明 |
|------|------|
| `sales_cnt_30d` | 近 30 天预估销量 |
| `price` | 商品当前售价 |
| `rating_score` | 商品评分 |
| `review_cnt` | 评价总数 |
| `prod_id` | 商品在平台上的唯一标识符 |
| `prod_url` | 商品详情页原始链接 |
| `prod_main_img` | 商品主图链接 |
| `prod_attribute` | 商品深度属性（Amazon 返回变体 ASIN，SHEIN 返回材质等） |
| `positive_tag` | 基于评论提取的正面标签 |
| `negative_tag` | 基于评论提取的负面标签 |
| `tt_relate_video` | TikTok 相关视频数量 |
| `tt_relate_author` | TikTok 相关达人数量 |
| `source` | 数据来源平台标识 |
| `webcode` | 站点唯一编码（如 `TEMU_US`） |
