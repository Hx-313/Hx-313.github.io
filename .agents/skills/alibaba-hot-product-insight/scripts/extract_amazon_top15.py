"""
从 Jungle Scout js_product_database_query 结果中提取 Top 15 产品。

Usage:
    python scripts/extract_amazon_top15.py <json_file_path> [limit]

Output:
    精简 JSON 到 stdout，按 approximate_30_day_units_sold 降序，
    每条只含报告需要的字段 + 预组装的 markdown 格式。
"""

import json
import sys

MARKETPLACE_URLS = {
    'us': 'https://www.amazon.com/dp/',
    'uk': 'https://www.amazon.co.uk/dp/',
    'de': 'https://www.amazon.de/dp/',
    'fr': 'https://www.amazon.fr/dp/',
    'it': 'https://www.amazon.it/dp/',
    'es': 'https://www.amazon.es/dp/',
    'jp': 'https://www.amazon.co.jp/dp/',
    'ca': 'https://www.amazon.ca/dp/',
    'au': 'https://www.amazon.com.au/dp/',
    'in': 'https://www.amazon.in/dp/',
    'mx': 'https://www.amazon.com.mx/dp/',
}


def extract(filepath: str, limit: int = 15) -> list[dict]:
    with open(filepath, encoding='utf-8') as f:
        raw = json.load(f)

    # JS 返回格式: {"data": [{"id": "us/ASIN", "attributes": {...}}, ...]}
    items = raw.get('data', [])

    # 按 30 天销量降序排序
    items.sort(
        key=lambda x: (x.get('attributes') or {}).get('approximate_30_day_units_sold', 0) or 0,
        reverse=True,
    )

    result = []
    for item in items[:limit]:
        attr = item.get('attributes') or {}
        item_id = item.get('id', '')

        # 提取 ASIN 和 marketplace
        parts = item_id.split('/', 1)
        marketplace = parts[0] if len(parts) == 2 else 'us'
        variant_asin = parts[1] if len(parts) == 2 else item_id

        # 优先使用 parent_asin（variant ASIN 可能无法直接访问）
        parent_asin = attr.get('parent_asin', '')
        asin = parent_asin if parent_asin else variant_asin

        # 构建产品 URL
        base_url = MARKETPLACE_URLS.get(marketplace, MARKETPLACE_URLS['us'])
        product_url = f'{base_url}{asin}'

        # 提取字段
        title = attr.get('title', '-')
        image_url = attr.get('image_url', '')
        price = attr.get('price')
        units_sold = attr.get('approximate_30_day_units_sold', 0) or 0
        revenue = attr.get('approximate_30_day_revenue', 0) or 0
        rating = attr.get('rating')
        reviews = attr.get('reviews')

        # 预组装 markdown
        thumbnail = f'![img]({image_url})' if image_url else '-'
        product_link = f'[{title[:60]}]({product_url})' if title != '-' else '-'

        result.append({
            'title': title,
            'asin': asin,
            'productUrl': product_url,
            'imageUrl': image_url,
            'price': price,
            'unitsSold': units_sold,
            'revenue': round(revenue, 2),
            'rating': rating,
            'reviews': reviews,
            'brand': attr.get('brand', '-'),
            'thumbnail': thumbnail,
            'productLink': product_link,
        })

    return result


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python extract_amazon_top15.py <json_file_path> [limit]', file=sys.stderr)
        sys.exit(1)
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 15
    data = extract(sys.argv[1], limit)
    print(json.dumps(data, ensure_ascii=False, indent=2))
