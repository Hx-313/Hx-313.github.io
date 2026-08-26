# 广告投放领域字段参考

本文档包含广告投放数据查询和广告账户诊断相关字段说明。追问广告效果、花费、诊断、优化时查阅。

执行前先用：

```bash
workctl schema --search "ads report" --format json
workctl schema icbu.ads.icbu-ads-report-load-datasource --format json
```

## icbu-ads-report-load-datasource - 广告商机明细元数据

⚠️ **能力边界**：本工具仅支持查询店铺自身广告效果数据，**不支持**获取行业整体或同行优秀值的绝对数值。严禁编造行业绝对水位。

首次经营简报只调用 load datasource，不主动执行 SQL 聚合。该命令会返回 `table_meta`，其中 `total_rows` 可作为近 7 天广告带来商机明细行数，`schema` 可用于说明可下钻维度。

```bash
workctl icbu ads icbu-ads-report-load-datasource \
  --datasource company_whole_site \
  --beginDateTime "2026-05-05 00:00:00" \
  --endDateTime "2026-05-11 23:59:59" \
  --granularity all \
  --tempTableName ADS_BRIEF \
  --format json
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| datasource | string | 是 | 数据源标识符，本 Skill 固定使用 `company_whole_site` |
| beginDateTime | string | 是 | 查询起始时间，格式 `yyyy-MM-dd HH:mm:ss` |
| endDateTime | string | 是 | 查询结束时间，格式 `yyyy-MM-dd HH:mm:ss` |
| granularity | string | 否 | 数据粒度，默认 `all` |
| tempTableName | string | 是 | 临时表名，本 Skill 固定 `ADS_BRIEF` |
| filters | object | 否 | 可选筛选条件 |

返回中的 `table_meta.schema` 以真实 schema 为准。常见字段：

| 字段 | 类型 | 含义 |
|------|------|------|
| 产生商机时间 | DATETIME | 产生商机的时间 |
| 引流商品标题 | STRING | 通过广告引流促成商机的商品标题 |
| 引流商品ID | STRING | 引流商品唯一ID |
| 产生商机的商品标题 | STRING | 买家最终产生商机行为的商品标题 |
| 产生商机的商品ID | STRING | 商机商品唯一ID |
| 买家ID | STRING | 买家唯一标识符 |
| 买家等级 | STRING | 买家等级，L3+ 以上表示优质买家 |
| 买家地域 | STRING | 买家所在国家或地区 |
| 买家来源 | STRING | 买家发现商品的渠道来源 |
| 商机信息 | STRING | 商机类型，如直通车询盘、直通车 TM 咨询、order |

## icbu-ads-report-execute-sql - 广告数据追问下钻

只有用户明确追问广告商机类型、地域、买家等级等细分问题时，才在已经 load datasource 的前提下按 schema 执行 SQL。不要在首次简报里主动堆多条聚合 SQL。

执行前先确认当前 schema：

```bash
workctl schema --search "ads execute sql" --format json
```

## icbu-ads-account-diagnosis - 广告账户诊断

对广告账户做整体诊断，返回账户概览、账户级诊断结论和问题计划列表。用于追问模式下用户询问广告问题时调用。

```bash
workctl icbu ads icbu-ads-account-diagnosis \
  --startDate 2026-05-05 \
  --endDate 2026-05-11 \
  --format json
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | 是 | 诊断开始日期，格式 `yyyy-MM-dd` |
| endDate | string | 是 | 诊断结束日期，格式 `yyyy-MM-dd` |

展示规则：

- 诊断结论按后端语义输出，不自行拼造数据。
- 问题计划以表格形式展示，包含计划名称和问题摘要。
- `actionGuideUrl` 非空时展示为「前往该计划详情页自主优化」链接。
