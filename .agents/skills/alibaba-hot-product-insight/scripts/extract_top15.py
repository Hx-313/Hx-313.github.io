"""
从 MCP 结果 JSON 中提取 Top 15 产品的报告字段。

Usage:
    python scripts/extract_top15.py <json_file_path> [limit]

Output:
    精简 JSON 到 stdout，每条只含报告需要的字段 + 指数汇总值。
"""

import json
import sys

REPORT_FIELDS = [
    'prodName', 'detailUrl', 'prodImage', 'price',
    'minOrdQty', 'rating', 'commentCnt', 'supplierCnName', 'shopUrl'
]

INDEX_FIELDS = ['abCntIndex', 'recOrdAmtIndex', 'uvDetailIndex', 'prepayOrdCntIndex']
INDEX_NAMES = ['inquiryIdx', 'gmvIdx', 'uvIdx', 'orderIdx']


def sum_index(arr: list) -> int:
    """对时序数组求和，返回 30d 汇总值。"""
    if not arr:
        return 0
    return sum(x.get('tagValue', 0) or 0 for x in arr)


def extract(filepath: str, limit: int = 15) -> list[dict]:
    with open(filepath, encoding='utf-8') as f:
        raw = json.load(f)

    items = raw.get('data', [])[:limit]
    result = []
    for item in items:
        row = {k: item.get(k) for k in REPORT_FIELDS}
        # 价格区间 ~ → -
        if row.get('price') and '~' in str(row['price']):
            row['price'] = str(row['price']).replace('~', '-')
        # 指数汇总（30d 求和，由脚本完成，agent 不需要自己算）
        for idx_field, idx_name in zip(INDEX_FIELDS, INDEX_NAMES):
            row[idx_name] = sum_index(item.get(idx_field, []))
        # 预组装 markdown 格式（agent 直接复制，零组装成本）
        img = row.get('prodImage') or ''
        row['thumbnail'] = f'![img]({img})' if img else '-'
        name = (row.get('prodName') or '-')[:50]
        url = row.get('detailUrl') or ''
        row['productLink'] = f'[{name}]({url})' if url else name
        result.append(row)
    return result


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python extract_top15.py <json_file_path> [limit]', file=sys.stderr)
        sys.exit(1)
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 15
    data = extract(sys.argv[1], limit)
    print(json.dumps(data, ensure_ascii=False, indent=2))
