"""
从 global_hot_selling_products 结果中提取 Top 15 产品。

Usage:
    python scripts/extract_global_top15.py <json_file_path> [limit]

Output:
    精简 JSON 到 stdout，按 sales_cnt_30d 降序，
    每条只含报告需要的字段 + 预组装的 markdown 格式。
"""

import json
import sys


def extract(filepath: str, limit: int = 15) -> list[dict]:
    with open(filepath, encoding='utf-8') as f:
        raw = json.load(f)

    # 接口返回格式可能是 {"payload": {"result": [...]}} 或 {"data": [...]} 或直接是 [...]
    if isinstance(raw, dict):
        if 'payload' in raw and isinstance(raw['payload'], dict) and 'result' in raw['payload']:
            items = raw['payload']['result']
        else:
            items = raw.get('data', raw)
    else:
        items = raw
    if not isinstance(items, list):
        items = []

    # 按 30 天销量降序
    items.sort(
        key=lambda x: (x.get('sales_cnt_30d') or 0),
        reverse=True,
    )

    result = []
    for item in items[:limit]:
        prod_url = item.get('prod_url', '')
        # 去掉 URL 中的跟踪参数，只保留干净的产品页链接
        if '?' in prod_url:
            prod_url = prod_url.split('?')[0]
        prod_img = item.get('prod_main_img', '')
        title = item.get('title') or item.get('prod_name') or item.get('name') or '-'
        price = item.get('price')
        sales = item.get('sales_cnt_30d', 0) or 0
        rating = item.get('rating_score')
        reviews = item.get('review_cnt')

        # 预组装 markdown
        thumbnail = f'![img]({prod_img})' if prod_img else '-'
        product_link = f'[{str(title)[:60]}]({prod_url})' if prod_url else str(title)[:60]

        result.append({
            'title': title,
            'prodUrl': prod_url,
            'prodImg': prod_img,
            'price': price,
            'salesCnt30d': sales,
            'rating': rating,
            'reviewCnt': reviews,
            'positiveTag': item.get('positive_tag', ''),
            'negativeTag': item.get('negative_tag', ''),
            'ttRelateVideo': item.get('tt_relate_video'),
            'ttRelateAuthor': item.get('tt_relate_author'),
            'prodAttribute': item.get('prod_attribute', ''),
            'prodId': item.get('prod_id', ''),
            'source': item.get('source', ''),
            'thumbnail': thumbnail,
            'productLink': product_link,
        })

    return result


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python extract_global_top15.py <json_file_path> [limit]', file=sys.stderr)
        sys.exit(1)
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 15
    data = extract(sys.argv[1], limit)
    print(json.dumps(data, ensure_ascii=False, indent=2))
