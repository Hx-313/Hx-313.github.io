"""
从 data_advisor_industry_seller_portrait 结果中提取卖家竞争画像。

Usage:
    python3 scripts/extract_seller.py <seller_portrait_file>

Output (stdout, JSON):
    - ok / is_empty / partial / warnings : 统一状态字段
    - star_distribution: 卖家星级分布（0-3 星占比）
    - inquiry_tiers: 询盘档位分布（<500 / 500-1000 / 1000-2000 / 2000+）
    - gmv_tiers: GMV 档位分布（<50w / 50-100w / 100-200w / 200w+ 美元）
    - category_concentration: 叶子类目 Top4 集中度
    - product_type: 商品类型分布（RTS / 非 RTS / 有规格 / 无规格）
    - summary: 整体判断（集中度 / 内卷程度 / 供应链成熟度）
"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from common import validate_status, unwrap_single, make_result, to_num, pick


def pct(v):
    """Convert ratio to percentage string."""
    n = to_num(v)
    if n == 0:
        return '0%'
    if n <= 1:
        return f'{n * 100:.1f}%'
    return f'{n:.1f}%'


def extract(seller_file):
    with open(seller_file, encoding='utf-8') as f:
        raw = json.load(f)

    warnings = []

    # #11: 检查 API 业务状态
    status_ok, status_warn = validate_status(raw)
    if not status_ok:
        warnings.append(status_warn)
        return make_result(ok=False, is_empty=True, warnings=warnings,
                           star_distribution={}, inquiry_tiers={}, gmv_tiers={},
                           category_concentration={}, product_type={}, summary={})

    # #12: 统一解包（单对象）
    data, unwrap_warns = unwrap_single(raw)
    warnings.extend(unwrap_warns)

    # 检查是否有有效字段（至少有某个 Ratio 字段）
    if not data or not any(k.endswith('Ratio') or k.startswith('leaf') or k.startswith('star')
                          for k in data if isinstance(data, dict)):
        return make_result(ok=True, is_empty=True, warnings=warnings,
                           star_distribution={}, inquiry_tiers={}, gmv_tiers={},
                           category_concentration={}, product_type={}, summary={})

    star_dist = {
        'star0': pct(pick(data, 'star0CompCntRatio')),
        'star1': pct(pick(data, 'star1CompCntRatio')),
        'star2': pct(pick(data, 'star2CompCntRatio')),
        'star3': pct(pick(data, 'star3CompCntRatio')),
    }

    inquiry_tiers = {
        'lt500': pct(pick(data, 'fb0CompCntRatio')),
        '500_1000': pct(pick(data, 'fb1CompCntRatio')),
        '1000_2000': pct(pick(data, 'fb2CompCntRatio')),
        'gt2000': pct(pick(data, 'fb3CompCntRatio')),
    }

    gmv_tiers = {
        'lt50w_usd': pct(pick(data, 'rcvd0CompCntRatio')),
        '50w_100w': pct(pick(data, 'rcvd1CompCntRatio')),
        '100w_200w': pct(pick(data, 'rcvd2CompCntRatio')),
        'gt200w': pct(pick(data, 'rcvd3CompCntRatio')),
    }

    category_concentration = {
        'top1': {
            'name': pick(data, 'leaf1CateDesc') or '-',
            'share': pct(pick(data, 'leaf1TotalProdCntRatio')),
        },
        'top2': {
            'name': pick(data, 'leaf2CateDesc') or '-',
            'share': pct(pick(data, 'leaf2TotalProdCntRatio')),
        },
        'top3': {
            'name': pick(data, 'leaf3CateDesc') or '-',
            'share': pct(pick(data, 'leaf3TotalProdCntRatio')),
        },
        'top4': {
            'name': pick(data, 'leaf4CateDesc') or '-',
            'share': pct(pick(data, 'leaf4TotalProdCntRatio')),
        },
    }

    product_type = {
        'rts': pct(pick(data, 'rtsProdCntRatio')),
        'non_rts': pct(pick(data, 'nonRtsProdCntRatio')),
        'with_spec': pct(pick(data, 'stdMcProdCntRatio')),
        'without_spec': pct(pick(data, 'norMcProdCntRatio')),
    }

    rts_ratio = to_num(pick(data, 'rtsProdCntRatio'))
    leaf1_ratio = to_num(pick(data, 'leaf1TotalProdCntRatio'))
    low_inquiry_ratio = to_num(pick(data, 'fb0CompCntRatio'))

    summary = {
        'category_concentration': '高度集中' if leaf1_ratio > 0.5 else '中等集中' if leaf1_ratio > 0.3 else '分散',
        'competition_pattern': '长尾竞争' if low_inquiry_ratio > 0.6 else '头部主导' if low_inquiry_ratio < 0.3 else '均衡',
        'supply_chain_maturity': '成熟（现货为主）' if rts_ratio > 0.5 else '发展中' if rts_ratio > 0.2 else '以定制为主',
    }

    return make_result(ok=True, is_empty=False, warnings=warnings,
                       star_distribution=star_dist,
                       inquiry_tiers=inquiry_tiers,
                       gmv_tiers=gmv_tiers,
                       category_concentration=category_concentration,
                       product_type=product_type,
                       summary=summary)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python3 extract_seller.py <seller_portrait_file>', file=sys.stderr)
        sys.exit(1)
    print(json.dumps(extract(sys.argv[1]), ensure_ascii=False, indent=2))
