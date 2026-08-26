"""
从买家相关工具结果中提取买家画像 / 渠道偏好 / 人群洞察。

支持三种数据源（通过 --type 区分）：
    - profile: data_advisor_industry_buyer_profile (买家画像)
    - channel: data_advisor_industry_buyer_channel (渠道偏好)
    - crowd:   data_advisor_industry_crowd_insight  (人群洞察)

Usage:
    python3 scripts/extract_buyer.py <file> [--type profile|channel|crowd]

Output (stdout, JSON):
    - ok / is_empty / partial / warnings : 统一状态字段
    - type: "profile" | "channel" | "crowd"
    - segments/channels/crowds: 数据列表
    - summary: 汇总
"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from common import validate_status, unwrap_items, make_result, to_num, pick


def detect_type(items):
    """Auto-detect data type from field presence."""
    if not items:
        return 'profile'
    sample = items[0]
    if 'cateEnName' in sample:
        return 'crowd'
    if 'indxName' in sample and pick(sample, 'indxKey') in ('PC', 'APP', 'WAP', 'pc', 'app', 'wap'):
        return 'channel'
    return 'profile'


def extract_profile(items):
    segments = []
    total_buyers = 0
    total_quality = 0

    for item in items:
        if not isinstance(item, dict):
            continue
        buyers = to_num(pick(item, 'indxVal'))
        quality = to_num(pick(item, 'highQualityIndxValue'))
        total_buyers += buyers
        total_quality += quality

        segments.append({
            'cateName': pick(item, 'cateName') or '-',
            'indicator': pick(item, 'indxName') or '-',
            'indicatorKey': pick(item, 'indxKey') or '-',
            'buyers': buyers,
            'qualityBuyers': quality,
            'qualityRatio': round(quality / buyers, 3) if buyers > 0 else 0,
            'momChange': pick(item, 'indxValRate'),
            'extra': pick(item, 'extraInfo'),
        })

    segments.sort(key=lambda x: x['buyers'], reverse=True)

    return {
        'type': 'profile',
        'segments': segments,
        'summary': {
            'total_buyers': total_buyers,
            'total_quality_buyers': total_quality,
            'quality_ratio': round(total_quality / total_buyers, 3) if total_buyers > 0 else 0,
            'top_segments': [s['indicator'] for s in segments[:5]],
        },
    }


def extract_channel(items):
    channels = []
    total_buyers = 0

    for item in items:
        if not isinstance(item, dict):
            continue
        buyers = to_num(pick(item, 'indxVal'))
        total_buyers += buyers

        channels.append({
            'channel': pick(item, 'indxKey', 'indxName') or '-',
            'buyers': buyers,
            'momChange': pick(item, 'indxValRate'),
        })

    channels.sort(key=lambda x: x['buyers'], reverse=True)

    for ch in channels:
        ch['share'] = round(ch['buyers'] / total_buyers, 3) if total_buyers > 0 else 0

    return {
        'type': 'channel',
        'channels': channels,
        'summary': {
            'total_buyers': total_buyers,
            'dominant_channel': channels[0]['channel'] if channels else '-',
            'channel_count': len(channels),
        },
    }


def extract_crowd(items):
    crowds = []
    total_value = 0

    for item in items:
        if not isinstance(item, dict):
            continue
        value = to_num(pick(item, 'idxValue', 'indxVal'))
        total_value += value

        crowds.append({
            'cateEnName': pick(item, 'cateEnName') or '-',
            'cateCnName': pick(item, 'cateCnName') or '-',
            'dimension': pick(item, 'idxType', 'indxType') or '-',
            'key': pick(item, 'idxKey', 'indxKey') or '-',
            'value': value,
            'momChange': pick(item, 'idxRate', 'indxValRate'),
        })

    crowds.sort(key=lambda x: x['value'], reverse=True)

    return {
        'type': 'crowd',
        'crowds': crowds,
        'summary': {
            'total_value': total_value,
            'dimensions': list(set(c['dimension'] for c in crowds)),
            'top_crowds': [{'name': c.get('cateCnName') or c['key'], 'value': c['value']} for c in crowds[:5]],
        },
    }


def main():
    if len(sys.argv) < 2:
        print('Usage: python3 extract_buyer.py <file> [--type profile|channel|crowd]', file=sys.stderr)
        sys.exit(1)

    data_file = sys.argv[1]
    data_type = None
    for i, arg in enumerate(sys.argv):
        if arg == '--type' and i + 1 < len(sys.argv):
            data_type = sys.argv[i + 1]

    with open(data_file, encoding='utf-8') as f:
        raw = json.load(f)

    warnings = []

    # #11: 检查 API 业务状态
    status_ok, status_warn = validate_status(raw)
    if not status_ok:
        warnings.append(status_warn)
        print(json.dumps(make_result(ok=False, is_empty=True, warnings=warnings,
                                     type=data_type or 'profile', segments=[], summary={}),
                         ensure_ascii=False, indent=2))
        return

    # #12: 统一解包
    items, unwrap_warns = unwrap_items(raw)
    warnings.extend(unwrap_warns)

    if not data_type:
        data_type = detect_type(items)

    if not items:
        print(json.dumps(make_result(ok=True, is_empty=True, warnings=warnings,
                                     type=data_type, segments=[], summary={}),
                         ensure_ascii=False, indent=2))
        return

    if data_type == 'channel':
        result = extract_channel(items)
    elif data_type == 'crowd':
        result = extract_crowd(items)
    else:
        result = extract_profile(items)

    # 用 make_result 包装统一输出
    print(json.dumps(make_result(ok=True, is_empty=False, warnings=warnings, **result),
                     ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
