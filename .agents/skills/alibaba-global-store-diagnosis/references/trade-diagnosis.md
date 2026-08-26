# Trade Diagnosis

## Role

Alibaba.com store trade data analysis and diagnosis expert, focusing on Gross Merchandise Volume (GMV) and order volume, order conversion, and shipment fulfillment performance, to help sellers identify weaknesses and growth opportunities in the trade process.

## Analysis Objectives

1. Summarize the seller's overall performance in order transactions and fulfillment, incorporating trade order volume and fulfillment performance data, and highlight key issues and advantages.
2. Identify problem dimensions and provide actionable recommendations.

## Applicable Regions

> **CRITICAL — REGION GATE**: Before performing ANY Trade analysis, check the seller's `regCountry` from `query_ggs_merchant_info`. This diagnosis ONLY applies to the following transaction-market regions:
>
> `CN` (China Hong Kong), `TW` (China Taiwan), `PK` (Pakistan), `IN` (India), `VN` (Vietnam), `JP` (Japan), `KR` (South Korea), `IT` (Italy), `ES` (Spain), `DE` (Germany), `FR` (France), `US` (United States), `MX` (Mexico), `TR` (Turkey)
>
> **If the seller's region is NOT in this list, skip Trade diagnosis entirely — do NOT output any Trade section, heading, or "not applicable" message. Proceed as if this dimension does not exist.**

## Analysis Rules

1. Must cover the following key metrics: Trade Assurance (TA) booked amount, Trade Assurance (TA) order count and Month-over-month (MoM) trends; Business Opportunities to order conversion rate analysis; On-time shipment rate; abnormal fulfillment rate (Seller-caused cancellations / NR cancellations order count).
2. When On-time shipment rate falls below 80%, prominently alert the seller to focus on improvement to avoid traffic reduction penalties.
3. When Seller-caused cancellations (NR cancellations) count in the last 30 days is greater than 0, prominently alert the seller to focus on improvement to avoid traffic reduction penalties.
4. Action recommendations must include specific operational steps.

### Focus Areas

- When On-time shipment rate is 100%, verify in conjunction with order count (if order count is 0, the rate is meaningless).

## Data Fields

Data table: `dwd_en_ggs_agentic_business_diagnosis_opportunities_d`

### Trade Assurance (TA) Booked Orders (Last 30 Days)

| Field Name | Description |
|--------|------|
| suc_ord_cnt_30d | Completed order count - last 30 days |
| suc_ord_cnt_30d_last_30d | Completed order count - previous 30 days |
| suc_ord_cnt_30d_mom | Completed order count - MoM change rate vs. previous 30 days |

### Trade Assurance (TA) Booked GMV (Last 30 Days)

| Field Name | Description |
|--------|------|
| suc_ord_amt_30d | Completed Gross Merchandise Volume (GMV) - last 30 days |
| suc_ord_amt_30d_last_30d | Completed Gross Merchandise Volume (GMV) - previous 30 days |
| suc_ord_amt_30d_mom | Completed Gross Merchandise Volume (GMV) - MoM change rate vs. previous 30 days |

### Trade Assurance (TA) Order On-time Shipment Rate

| Field Name | Description |
|--------|------|
| on_time_rate_30d | On-time shipment rate - last 30 days |
| on_time_rate_30d_last_30d | On-time shipment rate - previous 30 days |
| on_time_rate_30d_mom | On-time shipment rate - change vs. previous 30 days |

### Seller-caused Cancellations (NR Cancellations) Orders

| Field Name | Description |
|--------|------|
| nr_ord_cnt_30d | NR cancellations count - last 30 days |
| nr_ord_cnt_30d_last_30d | NR cancellations count - previous 30 days |
| nr_ord_cnt_30d_mom | NR cancellations count - MoM change rate vs. previous 30 days |

### Conversion Rate Analysis

| Field Name | Description |
|--------|------|
| uv_ab_rate_30d | Business Opportunities conversion rate - last 30 days |
| uv_ab_rate_30d_last_30d | Business Opportunities conversion rate - previous 30 days |
| uv_ab_rate_30d_mom | Business Opportunities conversion rate - change vs. previous 30 days |
| ab_payord_rate_30d | Payment conversion rate - last 30 days |
| ab_payord_rate_30d_last_30d | Payment conversion rate - previous 30 days |
| ab_payord_rate_30d_mom | Payment conversion rate - change vs. previous 30 days |
| uv_payord_rate_30d | Overall conversion rate - last 30 days |
| uv_payord_rate_30d_last_30d | Overall conversion rate - previous 30 days |
| uv_payord_rate_30d_mom | Overall conversion rate - change vs. previous 30 days |
