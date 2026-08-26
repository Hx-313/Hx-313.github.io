"""
从市场参谋结果中提取行业大盘排名或国家需求排名（自动识别两种格式）。

支持：
    - data_advisor_industry_cate_rank   (行业/子类目排名)
    - data_advisor_industry_country_rank (国家/地区需求排名)

Usage:
    python3 scripts/extract_market.py <market_file> [limit]

Output (stdout, JSON):
    - ok / is_empty / partial / warnings : 统一状态字段
    - kind: "category" | "country"
    - rows: 排名列表（标准化字段）
    - summary: 大盘汇总（条数 / 价格区间 / 头部占比 等）
"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from common import validate_status, unwrap_items, make_result, to_num, pick


def detect_kind(item):
    country_keys = ('countryId', 'countryName', 'countryCode', 'country')
    if any(k in item for k in country_keys):
        return 'country'
    return 'category'


def _slim_prod_list(prod_list, top=5):
    """精简各国/各类目热销商品列表，仅保留报告需要的字段。"""
    if not isinstance(prod_list, list):
        return []
    out = []
    for p in prod_list[:top]:
        if not isinstance(p, dict):
            continue
        out.append({
            'id': pick(p, 'id', 'prodId', 'productId'),
            'prodName': pick(p, 'prodName', 'title', 'subject'),
            'prodImage': pick(p, 'prodImage', 'imageUrl', 'image'),
        })
    return out


def extract(market_file, limit=30):
    with open(market_file, encoding='utf-8') as f:
        raw = json.load(f)

    warnings = []

    # #11: 检查 API 业务状态
    status_ok, status_warn = validate_status(raw)
    if not status_ok:
        warnings.append(status_warn)
        return make_result(ok=False, is_empty=True, warnings=warnings,
                           kind='unknown', rows=[], summary={'total': 0})

    # #12: 统一解包
    items, unwrap_warns = unwrap_items(raw)
    warnings.extend(unwrap_warns)

    if not items:
        return make_result(ok=True, is_empty=True, warnings=warnings,
                           kind='unknown', rows=[], summary={'total': 0})

    kind = detect_kind(items[0] if isinstance(items[0], dict) else {})
    rows = []
    inquiry_vals = []
    prices = []

    for item in items:
        if not isinstance(item, dict):
            continue
        # 接口真实字段（实测）：abCnt=市场规模, abCntYoy=同比增速,
        # supplyDemandRate=供需比, dAbRate=转化率。旧别名（abCntIndex/
        # inquiryIndex/recOrdAmtIndex/uvDetailIndex）保留作向后兼容兆底。
        market_size = to_num(pick(item, 'abCnt', 'abCntIndex', 'inquiryIndex'))
        yoy = pick(item, 'abCntYoy', 'yoy', 'yearOnYear')
        supply_demand = pick(item, 'supplyDemandRate', 'supplyNeedsRate')
        conv_rate = pick(item, 'dAbRate', 'conversionRate')
        stat_date = pick(item, 'statDate', 'ds')
        inquiry_vals.append(market_size)

        if kind == 'country':
            row = {
                'country': pick(item, 'countryName', 'countryId', 'country', 'countryCode'),
                'abCnt': market_size,
                'abCntYoy': yoy,
                'supplyDemandRate': supply_demand,
                'dAbRate': conv_rate,
                'statDate': stat_date,
            }
            # 国家榜补提 prodInfoList（各国 Top 热销商品）
            prod_info_list = pick(item, 'prodInfoList')
            if isinstance(prod_info_list, list) and prod_info_list:
                row['prodInfoList'] = _slim_prod_list(prod_info_list)
        else:
            row = {
                'cateId': pick(item, 'cateId', 'categoryId'),
                'cateDesc': pick(item, 'cateCnName', 'cateDesc', 'cateName', 'categoryName'),
                'abCnt': market_size,
                'abCntYoy': yoy,
                'supplyDemandRate': supply_demand,
                'dAbRate': conv_rate,
                'statDate': stat_date,
            }
            av = to_num(pick(item, 'dAbRate', 'avgPrice') or 0)
            if av > 0:
                prices.append(av)

        rows.append(row)

    rows.sort(key=lambda x: x.get('abCnt', 0), reverse=True)
    rows = rows[:limit]

    total_inq = sum(inquiry_vals) or 0
    top5 = sum(sorted(inquiry_vals, reverse=True)[:5])
    summary = {
        'total': len(items),
        'top5_demand_concentration': round(top5 / total_inq, 2) if total_inq > 0 else 0,
    }
    if prices:
        summary['avg_price'] = round(sum(prices) / len(prices), 2)
        summary['price_range'] = f'{min(prices):.1f}-{max(prices):.1f}'

    return make_result(ok=True, is_empty=False, warnings=warnings,
                       kind=kind, rows=rows, summary=summary)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python3 extract_market.py <market_file> [limit]', file=sys.stderr)
        sys.exit(1)
    lim = int(sys.argv[2]) if len(sys.argv) > 2 else 30
    print(json.dumps(extract(sys.argv[1], lim), ensure_ascii=False, indent=2))
