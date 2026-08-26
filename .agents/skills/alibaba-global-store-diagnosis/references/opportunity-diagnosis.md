# Business Opportunities Diagnosis

## Role

Alibaba.com traffic and Business Opportunities diagnosis expert, focusing on buyer traffic volume and quality, conversion rates across traffic funnel stages, Business Opportunities volume and quality, and Business Opportunities handling efficiency, to help sellers identify optimization opportunities for traffic acquisition and conversion.

## Analysis Objectives

1. Summarize the seller's overall performance in Business Opportunities acquisition and handling, incorporating data such as Business Opportunities volume, high-quality L2 buyer share, industry average and industry TOP benchmarks, and produce analytical conclusions.
2. Based on traffic conversion data, analyze the "Impressions → Clicks/Visits → Business Opportunities → Orders" funnel, identifying conversion bottlenecks and improvement recommendations.

## Analysis Rules

1. Must state the total Business Opportunities volume, Active buyer (AB) count, and Month-over-month (MoM) trends for the last 30 days, with comparison to industry averages.
2. Must describe the First reply rate and Response time for the last 30 days, compared to industry average and industry TOP10.
3. Must analyze the Impressions-to-Clicks conversion rate and Business Opportunities conversion rate. For regions with transaction markets (Pakistan, India, Vietnam, China Hong Kong, China Taiwan, Germany, Italy, France, Spain, Turkey, Japan, South Korea, United States, Mexico), the payment conversion rate must also be analyzed; for other regions, payment conversion rate analysis is not required.
4. Must clearly indicate whether the issue relates to traffic volume and precision issues, product display conversion issues, or reception efficiency issues, and provide targeted optimization actions.
5. Action recommendations must include specific operational steps: keyword and advertising strategies for optimizing search traffic, adjusting advertising regional targeting, optimizing product titles/main images/detail pages, improving response speed and communication quality, using AI-assisted tools, etc.

## Data Fields

Data table: `dwd_en_ggs_agentic_business_diagnosis_opportunities_d`

### Business Opportunities Data

| Field Name | Description |
|--------|------|
| bus_cnt_30d | Business Opportunities count - last 30 days |
| bus_cnt_last_30d | Business Opportunities count - previous 30 days |
| avg_bus_cnt_30d | Business Opportunities count - primary L1 category site-wide average - last 30 days |
| top10_avg_bus_cnt_30d | Business Opportunities count - primary L1 category TOP10 average - last 30 days |

### Inquiries (MC) Data

| Field Name | Description |
|--------|------|
| fb_cnt_30d | Inquiries (MC) count - last 30 days |
| fb_cnt_last_30d | Inquiries (MC) count - previous 30 days |
| avg_fb_cnt_30d | Inquiries (MC) count - primary L1 category site-wide average - last 30 days |
| top10_avg_fb_cnt_30d | Inquiries (MC) count - primary L1 category TOP10 average - last 30 days |

### Active Buyer (AB) Data

| Field Name | Description |
|--------|------|
| ab_cnt_30d | Active buyer (AB) count - last 30 days (service report metric) |
| ab_cnt_last_30d | Active buyer (AB) count - previous 30 days (service report metric) |
| avg_ab_cnt_30d | Active buyer (AB) count - primary L1 category site-wide average - last 30 days |
| top10_avg_ab_cnt_30d | Active buyer (AB) count - primary L1 category TOP10 average - last 30 days |

### L2 Buyer Data

| Field Name | Description |
|--------|------|
| l2_ab_cnt_30d | L2 buyer count - last 30 days |
| l2_ab_cnt_last_30d | L2 buyer count - previous 30 days |
| avg_l2_ab_cnt_30d | L2 buyer count - primary L1 category site-wide average - last 30 days |
| top10_avg_l2_ab_cnt_30d | L2 buyer count - primary L1 category TOP10 average - last 30 days |

### Quality Buyers

| Field Name | Description |
|--------|------|
| good_byr_cnt | Quality buyer count |

### First Reply Rate

| Field Name | Description |
|--------|------|
| fst_reply_rate_30d_lst30d | First reply rate - last 30 days |
| fst_reply_rate_30d_last_lst30d | First reply rate - previous 30 days |
| avg_fst_reply_rate_30d_lst30d | First reply rate - primary L1 category site-wide average - last 30 days |
| top10_avg_fst_reply_rate_30d_lst30d | First reply rate - primary L1 category TOP10 average - last 30 days |

### Average Response Time

| Field Name | Description |
|--------|------|
| avg_rplay_time_30d_lst30d | Average Response time (hours) - last 30 days |
| avg_rplay_time_30d_last_lst30d | Average Response time (hours) - previous 30 days |
| avg_avg_rplay_time_30d_lst30d | Average Response time (hours) - primary L1 category site-wide average - last 30 days |
| top10_avg_avg_rplay_time_30d_lst30d | Average Response time (hours) - primary L1 category TOP10 average - last 30 days |

### Impressions and Visits (7-day / 30-day)

| Field Name | Description |
|--------|------|
| total_imps_cnt_7d | Total store Impressions count - last 7 days |
| pv_cnt_7d | Visits count - last 7 days |
| bus_cnt_7d | Business Opportunities count - last 7 days |
| suc_ord_cnt_7d | Completed order count - last 7 days |
| suc_ord_amt_7d | Completed Gross Merchandise Volume (GMV) - last 7 days |

### Conversion Rate Analysis (30-day)

| Field Name | Description |
|--------|------|
| imps_to_visitor_rate_30d | Impressions → Visits conversion rate - last 30 days |
| imps_to_visitor_rate_30d_last_30d | Impressions → Visits conversion rate - previous 30 days |
| imps_to_visitor_rate_30d_mom | Impressions → Visits conversion rate - change vs. previous 30 days |
| visitor_to_bus_rate_30d | Visits → Business Opportunities conversion rate - last 30 days |
| visitor_to_bus_rate_30d_last_30d | Visits → Business Opportunities conversion rate - previous 30 days |
| visitor_to_bus_rate_30d_mom | Visits → Business Opportunities conversion rate - change vs. previous 30 days |
| bus_to_ord_rate_30d | Business Opportunities → Completed order conversion rate - last 30 days |
| bus_to_ord_rate_30d_last_30d | Business Opportunities → Completed order conversion rate - previous 30 days |
| bus_to_ord_rate_30d_mom | Business Opportunities → Completed order conversion rate - change vs. previous 30 days |
| uv_ab_rate_30d | Business Opportunities conversion rate - last 30 days |
| uv_ab_rate_30d_last_30d | Business Opportunities conversion rate - previous 30 days |
| uv_ab_rate_30d_mom | Business Opportunities conversion rate - change vs. previous 30 days |
| ab_payord_rate_30d | Payment conversion rate - last 30 days (transaction-market regions only) |
| ab_payord_rate_30d_last_30d | Payment conversion rate - previous 30 days |
| ab_payord_rate_30d_mom | Payment conversion rate - change vs. previous 30 days |

### Conversion Rate Analysis (7-day)

| Field Name | Description |
|--------|------|
| imps_to_visitor_rate_7d | Impressions → Visits conversion rate - last 7 days |
| visitor_to_bus_rate_7d | Visits → Business Opportunities conversion rate - last 7 days |
| bus_to_ord_rate_7d | Business Opportunities → Completed order conversion rate - last 7 days |
| uv_ab_rate_7d | Business Opportunities conversion rate - last 7 days |
| ab_payord_rate_7d | Payment conversion rate - last 7 days |
| uv_payord_rate_7d | Overall conversion rate - last 7 days |

### Other Business Opportunities Buyer Data

| Field Name | Description |
|--------|------|
| bus_byr_cnt_30d | Business Opportunities buyer count - last 30 days |
| bus_byr_cnt_30d_last_30d | Business Opportunities buyer count - previous 30 days |
| bus_byr_cnt_30d_mom | Business Opportunities buyer count - MoM change rate vs. previous 30 days |
| ab_cnt_30d_vip | Active buyer (AB) count - last 30 days (VIP operation report metric) |
| ab_cnt_30d_vip_last_30d | Active buyer (AB) count - previous 30 days (VIP operation report metric) |
| ab_cnt_30d_vip_mom | Active buyer (AB) count - MoM change rate vs. previous 30 days (VIP operation report metric) |
| mc_uv_cnt_30d | Inquiries (MC) buyer count - last 30 days |
| mc_uv_cnt_30d_last_30d | Inquiries (MC) buyer count - previous 30 days |
| mc_uv_cnt_30d_mom | Inquiries (MC) buyer count - MoM change rate vs. previous 30 days |
| uv_mc_rate_30d | Visitor → Inquiries (MC) conversion rate - last 30 days |
| uv_mc_rate_30d_last_30d | Visitor → Inquiries (MC) conversion rate - previous 30 days |
| uv_mc_rate_30d_mom | Visitor → Inquiries (MC) conversion rate - change vs. previous 30 days |
