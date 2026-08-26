"""
从站外需求数据中提取标准化产品列表 + 需求汇总。

支持来源：
    - amazon  : js_product_database_query 返回
    - global  : global_hot_selling_products 返回 (Temu/SHEIN/TikTok/Shopee/1688)

Usage:
    python3 scripts/extract_demand.py <result_file> <source>   # source = amazon | global

Output (stdout, JSON):
    - ok / is_empty / partial / warnings : 统一状态字段
    - products: 标准化列表（thumbnail/productLink/price/units/source）
    - demand_metrics: total / price_range / median_units
"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from common import validate_status, unwrap_items, make_result, to_num, pick


def extract(result_file, source):
    with open(result_file, encoding='utf-8') as f:
        raw = json.load(f)

    warnings = []

    # #11: 检查 API 业务状态
    status_ok, status_warn = validate_status(raw)
    if not status_ok:
        warnings.append(status_warn)
        return make_result(ok=False, is_empty=True, warnings=warnings,
                           products=[], demand_metrics={'total': 0, 'source': source})

    # #12: 统一解包
    items, unwrap_warns = unwrap_items(raw)
    warnings.extend(unwrap_warns)

    if not items:
        return make_result(ok=True, is_empty=True, warnings=warnings,
                           products=[], demand_metrics={'total': 0, 'source': source})

    products = []
    units_list = []
    price_list = []

    for item in items:
        if not isinstance(item, dict):
            continue
        title = (pick(item, 'title', 'name', 'prodName') or '-')
        link = pick(item, 'productLink', 'link', 'url', 'detailUrl') or ''
        img = pick(item, 'imageUrl', 'image', 'img', 'prodImage') or ''
        price = pick(item, 'price', 'salePrice')
        if price and '~' in str(price):
            price = str(price).replace('~', '-')
        units = pick(item, 'unitsSold', 'sales', 'monthlySales', 'soldCount')
        platform = pick(item, 'platform') or ('Amazon' if source == 'amazon' else '-')

        row = {
            'title': str(title)[:60],
            'price': price,
            'units': units,
            'rating': pick(item, 'rating', 'star'),
            'reviews': pick(item, 'reviews', 'commentCnt', 'reviewCount'),
            'platform': platform,
            'thumbnail': f'![img]({img})' if img else '-',
            'productLink': f'[{str(title)[:50]}]({link})' if link else str(title)[:50],
        }
        products.append(row)
        u = to_num(units)
        if u > 0:
            units_list.append(u)
        p = to_num(price)
        if p > 0:
            price_list.append(p)

    units_list.sort()
    median_units = units_list[len(units_list) // 2] if units_list else 0

    demand_metrics = {
        'total': len(items),
        'price_range': f'{min(price_list):.1f}-{max(price_list):.1f}' if price_list else '-',
        'median_units': median_units,
        'source': source,
    }
    return make_result(ok=True, is_empty=False, warnings=warnings,
                       products=products[:30], demand_metrics=demand_metrics)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: python3 extract_demand.py <result_file> <amazon|global>', file=sys.stderr)
        sys.exit(1)
    print(json.dumps(extract(sys.argv[1], sys.argv[2]), ensure_ascii=False, indent=2))
