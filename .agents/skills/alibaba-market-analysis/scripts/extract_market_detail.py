"""
从 data_advisor_industry_market_detail 结果中提取行业大盘指标。

支持：
    - data_advisor_industry_market_detail (行业大盘：规模/增速/转化/供需 + 排名)
    - data_advisor_industry_market_trend  (行业趋势：时间序列)

Usage:
    python3 scripts/extract_market_detail.py <market_detail_file> [trend_file]

Output (stdout, JSON):
    - ok / is_empty / partial / warnings : 统一状态字段
    - market: 大盘指标（规模/增速/转化率/供需 + 各指标排名）
    - trend: 时间序列列表（如有 trend_file）
    - summary: 整体判断（高增长/稳定/下滑）
"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from common import validate_status, unwrap_items, unwrap_single, make_result, to_num, pick


def extract_detail(data):
    return {
        'marketSize': to_num(pick(data, 'abCnt')),
        'marketSizeRank': pick(data, 'abCntCrank'),
        'growthRate': to_num(pick(data, 'abCntYoy')),
        'growthRateRank': pick(data, 'abCntYoyCrank'),
        'conversionRate': to_num(pick(data, 'dAbRate')),
        'conversionRank': pick(data, 'dAbRateCrank'),
        'supplyDemandRate': to_num(pick(data, 'supplyDemandRate')),
        'supplyDemandRank': pick(data, 'supplyDemandRateCrank'),
        'cateLevel': pick(data, 'cateLevel'),
        'statDate': pick(data, 'statDate'),
    }


def extract_trend(trend_file):
    with open(trend_file, encoding='utf-8') as f:
        raw = json.load(f)
    items, _ = unwrap_items(raw)
    trend = []
    for item in items:
        if not isinstance(item, dict):
            continue
        trend.append({
            'statDate': pick(item, 'statDate'),
            'marketSize': to_num(pick(item, 'abCnt')),
            'growthRate': to_num(pick(item, 'abCntYoy')),
            'conversionRate': to_num(pick(item, 'dAbRate')),
            'supplyDemandRate': to_num(pick(item, 'supplyDemandRate')),
        })
    trend.sort(key=lambda x: x.get('statDate', ''))
    return trend


def judge_growth(growth_rate):
    if growth_rate > 20:
        return '高速增长'
    elif growth_rate > 5:
        return '稳定增长'
    elif growth_rate > 0:
        return '缓慢增长'
    elif growth_rate > -5:
        return '基本持平'
    else:
        return '下滑'


def main():
    if len(sys.argv) < 2:
        print('Usage: python3 extract_market_detail.py <market_detail_file> [trend_file]', file=sys.stderr)
        sys.exit(1)

    detail_file = sys.argv[1]
    trend_file = sys.argv[2] if len(sys.argv) > 2 else None

    with open(detail_file, encoding='utf-8') as f:
        raw = json.load(f)

    warnings = []

    # #11: 检查 API 业务状态
    status_ok, status_warn = validate_status(raw)
    if not status_ok:
        warnings.append(status_warn)
        print(json.dumps(make_result(ok=False, is_empty=True, warnings=warnings,
                                     market={}, trend=[], summary={}), ensure_ascii=False, indent=2))
        return

    # #12: 统一解包（单对象）
    data, unwrap_warns = unwrap_single(raw)
    warnings.extend(unwrap_warns)

    # 检查是否拿到了有效数据
    if not data or not any(data.get(k) for k in ('abCnt', 'abCntYoy', 'dAbRate', 'supplyDemandRate')):
        print(json.dumps(make_result(ok=True, is_empty=True, warnings=warnings,
                                     market={}, trend=[], summary={}), ensure_ascii=False, indent=2))
        return

    market = extract_detail(data)

    trend = []
    if trend_file:
        trend = extract_trend(trend_file)

    growth = market.get('growthRate', 0)
    summary_payload = {
        'growth_label': judge_growth(growth),
        'has_rankings': any(v is not None for v in [
            market.get('marketSizeRank'), market.get('growthRateRank'),
            market.get('conversionRank'), market.get('supplyDemandRank'),
        ]),
    }

    print(json.dumps(make_result(ok=True, is_empty=False, warnings=warnings,
                                 market=market, trend=trend, summary=summary_payload),
                     ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
