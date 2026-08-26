"""
从 data_advisor_product_selection 结果中提取站内商品 TopN + 价格带汇总。

Usage:
    python3 scripts/extract_topn.py <rank_file> [limit]

Output (stdout, JSON):
    - ok / is_empty / partial / warnings : 统一状态字段
    - products: TopN 产品列表（字段 + 指数汇总 + 预组装 thumbnail/productLink）
    - price_band: 价格带汇总（min/max/avg/带分布）
    - metrics: total_products / supplier_count / top_concentration
"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from common import validate_status, unwrap_items, make_result, to_num, pick

REPORT_FIELDS = [
    'prodName', 'price',
    'minOrdQty', 'rating', 'commentCnt', 'supplierCnName', 'shopUrl',
]

INDEX_FIELDS = ['abCntIndex', 'recOrdAmtIndex', 'uvDetailIndex', 'prepayOrdCntIndex']
INDEX_NAMES = ['inquiryIdx', 'gmvIdx', 'uvIdx', 'orderIdx']


def sum_index(arr):
    if not arr:
        return 0
    if isinstance(arr, (int, float)):
        return arr
    return sum(to_num(x.get('tagValue', 0)) for x in arr if isinstance(x, dict))


def parse_price_range(price_str):
    """Parse '33.0~35.0' / '33.0-35.0' / '33.0' into (min, max)."""
    if price_str is None or price_str == '':
        return (0.0, 0.0)
    s = str(price_str)
    for sep in ['~', '-']:
        if sep in s:
            parts = s.split(sep)
            try:
                return (float(parts[0].strip()), float(parts[1].strip()))
            except (ValueError, IndexError):
                pass
    try:
        v = float(s)
        return (v, v)
    except ValueError:
        return (0.0, 0.0)


def extract(rank_file, limit=20):
    with open(rank_file, encoding='utf-8') as f:
        raw = json.load(f)

    warnings = []

    # #11: 检查 API 业务状态
    status_ok, status_warn = validate_status(raw)
    if not status_ok:
        warnings.append(status_warn)
        return make_result(ok=False, is_empty=True, warnings=warnings,
                           products=[], price_band={}, metrics={})

    # #12: 统一解包
    items, unwrap_warns = unwrap_items(raw)
    warnings.extend(unwrap_warns)

    if not items:
        return make_result(ok=True, is_empty=True, warnings=warnings,
                           products=[], price_band={}, metrics={})

    products = []
    suppliers = set()
    prices = []
    gmv_vals = []

    for item in items:
        if not isinstance(item, dict):
            continue
        row = {k: item.get(k) for k in REPORT_FIELDS}
        if row.get('price') and '~' in str(row['price']):
            row['price'] = str(row['price']).replace('~', '-')

        # #8: 字段别名归一 — prodImage → imageUrl → image; detailUrl → productUrl → url
        row['prodImage'] = pick(item, 'prodImage', 'imageUrl', 'image') or ''
        row['detailUrl'] = pick(item, 'detailUrl', 'productUrl', 'url') or ''

        for idx_field, idx_name in zip(INDEX_FIELDS, INDEX_NAMES):
            row[idx_name] = sum_index(item.get(idx_field, []))

        img = row.get('prodImage') or ''
        row['thumbnail'] = f'![img]({img})' if img else '-'
        name = (row.get('prodName') or '-')[:50]
        url = row.get('detailUrl') or ''
        row['productLink'] = f'[{name}]({url})' if url else name

        products.append(row)
        if row.get('supplierCnName'):
            suppliers.add(row['supplierCnName'])
        p_min, p_max = parse_price_range(item.get('price', ''))
        if p_min > 0:
            prices.append(p_min)
        if p_max > 0:
            prices.append(p_max)
        gmv_vals.append(row.get('gmvIdx', 0) or 0)

    products.sort(key=lambda x: x.get('gmvIdx', 0), reverse=True)
    products = products[:limit]

    avg_price = round(sum(prices) / len(prices), 2) if prices else 0
    price_band = {
        'min': round(min(prices), 2) if prices else 0,
        'max': round(max(prices), 2) if prices else 0,
        'avg': avg_price,
        'range': f'{min(prices):.1f}-{max(prices):.1f}' if prices else '-',
    }

    total_gmv = sum(gmv_vals) or 0
    top5_gmv = sum(sorted(gmv_vals, reverse=True)[:5])
    top_concentration = round(top5_gmv / total_gmv, 2) if total_gmv > 0 else 0

    metrics = {
        'total_products': len(items),
        'supplier_count': len(suppliers),
        'top5_gmv_concentration': top_concentration,
    }

    return make_result(ok=True, is_empty=False, warnings=warnings,
                       products=products, price_band=price_band, metrics=metrics)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python3 extract_topn.py <rank_file> [limit]', file=sys.stderr)
        sys.exit(1)
    lim = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    print(json.dumps(extract(sys.argv[1], lim), ensure_ascii=False, indent=2))
