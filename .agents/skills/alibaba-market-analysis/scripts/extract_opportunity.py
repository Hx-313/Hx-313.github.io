"""
从 data_advisor_opportunity_discovery 结果中提取产品机会词 + 供需信号。

Usage:
    python3 scripts/extract_opportunity.py <opportunity_file> [limit] [--keywords "smart curtain,curtain,blind"]

Output (stdout, JSON):
    - ok / is_empty / partial / warnings : 统一状态字段
    - opportunities: 机会词列表（子类目 / 需求指数 / 供给指数 / 供需比 / 商机产品占比 / 热搜词）
    - summary: total / avg_supply_needs_rate / top_blue_ocean（供需比最高的 3 个 = 竞争最小）
    - relevance: 相关性校验结果（仅在传入 --keywords 时）
        { checked, matched, total, irrelevant_ratio, verdict } verdict ∈ passed|failed
      verdict=failed 表示 cateId 过滤疑似失效（返回大量无关品类），调用方应 sceneName 重查或丢弃该维度

    supplyNeedsRate  = 供需比，越高 → 需求相对供给越旺盛 = 竞争越小 = 蓝海信号
    busProdRate      = 商机产品占比（商机商品数 / 在线商品数），越高 → 真实需求验证越强
    supplyDemandRate = 供需比（另一字段名，语义同 supplyNeedsRate），不应与 supplyIndex 混淆
"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from common import validate_status, unwrap_items, make_result, to_num, pick


def extract(opp_file, limit=20, keywords=None):
    with open(opp_file, encoding='utf-8') as f:
        raw = json.load(f)

    warnings = []

    # #11: 检查 API 业务状态
    status_ok, status_warn = validate_status(raw)
    if not status_ok:
        warnings.append(status_warn)
        return make_result(ok=False, is_empty=True, warnings=warnings,
                           opportunities=[], summary={'total': 0})

    # #12: 统一解包
    items, unwrap_warns = unwrap_items(raw)
    warnings.extend(unwrap_warns)

    if not items:
        return make_result(ok=True, is_empty=True, warnings=warnings,
                           opportunities=[], summary={'total': 0})

    opportunities = []
    ratios = []  # 只收集 known ratio

    for item in items:
        if not isinstance(item, dict):
            continue
        needs = to_num(pick(item, 'needsIndex', 'searchIndex', 'demandIndex'))
        supply = to_num(pick(item, 'supplyIndex', 'supplierIndex'))
        raw_ratio = pick(item, 'supplyNeedsRate', 'supplyDemandRate')
        bus_prod_rate = pick(item, 'busProdRate')

        # #10: 区分 known vs missing ratio
        # 只有明确提供了 ratio 值（或可通过 needs/supply 计算），才视为 known
        ratio_status = 'known'
        supply_needs_rate = None

        if raw_ratio is not None:
            supply_needs_rate = to_num(raw_ratio)
            if supply_needs_rate == 0 and raw_ratio != 0 and raw_ratio != '0':
                # to_num 解析失败退化为 0，实际是缺失
                supply_needs_rate = None
                ratio_status = 'missing'
        elif needs > 0 and supply > 0:
            supply_needs_rate = round(needs / supply, 4)
        else:
            ratio_status = 'missing'

        bus_prod_rate = to_num(bus_prod_rate)

        hot_kws_raw = pick(item, 'hotKws', 'hotKeywords', 'keywords')
        if isinstance(hot_kws_raw, list):
            hot_kws = [kw.get('keyword', kw) if isinstance(kw, dict) else str(kw) for kw in hot_kws_raw[:5]]
        elif isinstance(hot_kws_raw, str):
            hot_kws = [k.strip() for k in hot_kws_raw.split('|') if k.strip()][:5]
        else:
            hot_kws = []

        row = {
            'cateLeafDesc': pick(item, 'cateLeafDesc', 'cateDesc', 'categoryName') or '-',
            'cateLeafCnDesc': pick(item, 'cateLeafCnDesc', 'cateCnDesc') or '-',
            'needsIndex': needs,
            'supplyIndex': supply,
            'supplyNeedsRate': supply_needs_rate,  # None if missing
            'ratioStatus': ratio_status,           # #10: "known" | "missing"
            'busProdRate': bus_prod_rate,
            'supplyNeedsRateQoq': pick(item, 'supplyNeedsRateQoq'),
            'busProdRateQoq': pick(item, 'busProdRateQoq'),
            'hotKeywords': hot_kws,
            'imageUrl': pick(item, 'expImgUrl', 'imageUrl', 'image') or '',
        }
        opportunities.append(row)

        # #10: 只对 known ratio 参与统计和排序
        if supply_needs_rate is not None and supply_needs_rate > 0:
            ratios.append(supply_needs_rate)

    # #10: 排序时 missing 排最后，known 按值降序
    opportunities.sort(
        key=lambda x: (0 if x['ratioStatus'] == 'known' else 1,
                       -(x['supplyNeedsRate'] or 0)),
    )
    opportunities = opportunities[:limit]

    avg_ratio = round(sum(ratios) / len(ratios), 4) if ratios else 0

    # top_blue_ocean 只取 known ratio 的条目
    blue_ocean = [
        {'name': o['cateLeafCnDesc'] or o['cateLeafDesc'],
         'supplyNeedsRate': o['supplyNeedsRate'],
         'busProdRate': o['busProdRate'],
         'needs': o['needsIndex']}
        for o in opportunities
        if o['ratioStatus'] == 'known' and o['supplyNeedsRate'] is not None
    ][:3]

    missing_count = sum(1 for o in opportunities if o['ratioStatus'] == 'missing')
    if missing_count > 0:
        warnings.append(f'ratio_missing: {missing_count} items have no supplyNeedsRate, excluded from ranking')

    summary = {
        'total': len(items),
        'known_ratio_count': len(ratios),
        'missing_ratio_count': missing_count,
        'avg_supply_needs_rate': avg_ratio,
        'top_blue_ocean': blue_ocean,
    }
    result = make_result(ok=True, is_empty=False, warnings=warnings,
                       opportunities=opportunities, summary=summary)

    # 相关性校验
    if keywords:
        result['relevance'] = check_relevance(opportunities, keywords)

    return result


def check_relevance(opportunities, keywords):
    """对返回的机会词做品类词面相关性校验。

    keywords: 目标品类关键词列表（小写），如 ['smart curtain','curtain','blind','窗帘']。
    判定：每条机会的中英文品类名是否包含任一关键词。无关占比过半 → verdict=failed
    （typically cateId 过滤失效，返回了全站无关榜）。
    """
    kws = [k.strip().lower() for k in keywords if k.strip()]
    if not kws or not opportunities:
        return None
    matched = 0
    for o in opportunities:
        name = f"{o.get('cateLeafDesc','')} {o.get('cateLeafCnDesc','')}".lower()
        if any(k in name for k in kws):
            matched += 1
    total = len(opportunities)
    irrelevant_ratio = round(1 - matched / total, 2) if total else 1.0
    # 匹配数为 0 或无关占比 > 50% 判定过滤失效
    verdict = 'passed' if (matched > 0 and irrelevant_ratio <= 0.5) else 'failed'
    return {
        'checked': True,
        'matched': matched,
        'total': total,
        'irrelevant_ratio': irrelevant_ratio,
        'verdict': verdict,
    }


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Extract opportunity discovery data')
    parser.add_argument('opp_file', help='Path to opportunity JSON file')
    parser.add_argument('limit', nargs='?', type=int, default=20, help='Max items (default 20)')
    parser.add_argument('--keywords', type=str, default='', help='Comma-separated target category keywords for relevance check')
    args = parser.parse_args()
    kw_list = [k.strip() for k in args.keywords.split(',') if k.strip()] if args.keywords else None
    print(json.dumps(extract(args.opp_file, args.limit, keywords=kw_list), ensure_ascii=False, indent=2))
