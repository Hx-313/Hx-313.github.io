import json
import csv
import sys
import os

def encode_csv_value(val):
    if val is None:
        return ""
    if isinstance(val, (dict, list)):
        val = json.dumps(val, ensure_ascii=False)
    # Replace newlines with {{NL}} to avoid breaking CSV structure
    return str(val).replace('\n', '{{NL}}').replace('\r', '{{CR}}')

def convert(json_path, csv_path):
    if not os.path.exists(json_path):
        print(f"Error: JSON file not found at {json_path}")
        sys.exit(1)

    with open(json_path, 'r', encoding='utf-8') as f:
        try:
            resp = json.load(f)
        except json.JSONDecodeError:
            print("Error: Failed to parse JSON.")
            sys.exit(1)
        # Extract product list from MCP response: handle multiple structures
        data_list = None
        if isinstance(resp, list):
            data_list = resp
        elif isinstance(resp, dict):
            # 1. Try full nesting: data.data.records
            try:
                data_list = resp['data']['data']['records']
            except:
                pass

            # 2. Try simple nesting: records
            if data_list is None:
                data_list = resp.get('records')

            # 3. Try direct nesting under data: data.records or data (as list)
            if data_list is None and 'data' in resp:
                d = resp['data']
                if isinstance(d, list):
                    data_list = d
                elif isinstance(d, dict):
                    data_list = d.get('records')
        if not isinstance(data_list, list):
            print("Error: Unexpected response structure. Could not find product list (list or records).")
            sys.exit(1)

    fieldnames = [
        'productId', 'generalProductId', 'isExcluded', 'status', 'reason', 'publishUrl', 'absSummImageUrl',
        'before.title', 'before.price', 'before.leadTime', 'before.moq', 'before.unitWeight', 
        'before.unitSize', 'before.shippingTemplate', 'before.category', 'before.description', 
        'before.properties', 'before.images', 'before.inventory', 'before.pis', 'before.keywords', 'before.currencyCode',
        'after.title', 'after.price', 'after.leadTime', 'after.moq', 'after.unitWeight',
        'after.unitSize', 'after.shippingTemplate', 'after.category', 'after.description',
        'after.properties', 'after.images', 'after.inventory', 'after.pis', 'after.keywords', 'after.currencyCode'
    ]

    rows = []
    for item in data_list:
        before = item.get('before', {}) or {}

        row = {
            'productId': item.get('productId', ''),
            'generalProductId': item.get('generalProductId', ''),
            'isExcluded': str(item.get('isExcluded', 'false')).lower() if item.get('isExcluded') is not None else 'false',
            'status': item.get('status', 'PENDING'),
            'reason': item.get('reason', '') or '',
            'publishUrl': '',
            'absSummImageUrl': item.get('absSummImageUrl', '') or '',
            
            'before.title': encode_csv_value(before.get('title', '')),
            'before.price': encode_csv_value(before.get('price', '')),
            'before.leadTime': encode_csv_value(before.get('leadTime', [])),
            'before.moq': encode_csv_value(before.get('moq', '')),
            'before.unitWeight': encode_csv_value(before.get('unitWeight', '')),
            'before.unitSize': encode_csv_value(before.get('unitSize', '')),
            'before.shippingTemplate': encode_csv_value(before.get('shippingTemplate', {})),
            'before.category': encode_csv_value(before.get('category', {})),
            'before.description': encode_csv_value(before.get('description', '')),
            'before.properties': encode_csv_value(before.get('properties', [])),
            'before.images': encode_csv_value(before.get('images', [])),
            'before.inventory': encode_csv_value(before.get('inventory', '')),
            'before.pis': encode_csv_value(before.get('pis', '')),
            'before.keywords': encode_csv_value(before.get('keywords', [])),
            'before.currencyCode': encode_csv_value(before.get('currencyCode', '')),
        }
        # Initialize after fields as empty
        for key in fieldnames:
            if key.startswith('after.'):
                row[key] = ""
        rows.append(row)

    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Successfully converted {len(rows)} products to {csv_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python migration_response_to_csv.py <input_json> <output_csv>")
        sys.exit(1)
    convert(sys.argv[1], sys.argv[2])
