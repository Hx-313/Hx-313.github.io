import csv
import json
import sys
import os
import re


def extract_product_id_from_url(url):
    """Extract productId from publishUrl.
    
    Supports URL formats like:
    https://i.alibaba.com/products/list-manage#/product/all/1-10/gmtModified=desc&size=10&productId=1601737818706
    """
    if not url:
        return None
    match = re.search(r'productId=(\d+)', url)
    return match.group(1) if match else None


def update_results(csv_path, response_json_path):
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        sys.exit(1)
    if not os.path.exists(response_json_path):
        print(f"Error: Response JSON file not found at {response_json_path}")
        sys.exit(1)

    with open(response_json_path, 'r', encoding='utf-8') as f:
        try:
            resp = json.load(f)
        except json.JSONDecodeError:
            print("Error: Failed to parse response JSON.")
            sys.exit(1)
    
    # Extract data from response (handle both direct object and wrapped in "data")
    data = resp.get('data', resp) if isinstance(resp, dict) else resp
    
    success_urls = data.get('successUrls', {})
    error_msgs = data.get('errorMsgList', {})
    
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames)
        if 'publishUrl' not in fieldnames:
            fieldnames.append('publishUrl')
            
        for row in reader:
            pid = row.get('productId', '')
            general_pid = row.get('generalProductId', '')
            # Use productId as match key; fallback to generalProductId when productId is empty
            match_key = pid if pid else general_pid
            if match_key in success_urls:
                row['status'] = 'SUCCESS'
                row['publishUrl'] = success_urls[match_key]
                row['reason'] = ''
                # Extract productId from publishUrl and update CSV
                extracted_pid = extract_product_id_from_url(success_urls[match_key])
                if extracted_pid:
                    row['productId'] = extracted_pid
            elif match_key in error_msgs:
                row['status'] = 'FAILED'
                row['reason'] = error_msgs[match_key]
            rows.append(row)
            
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    # Generate Markdown summary
    summary = "### 📊 发布结果总结\n\n"
    summary += f"**总计**: 成功 {data.get('successCount', 0)} 个，失败 {data.get('failCount', 0)} 个，跳过 {data.get('skippedAlreadyPostedCount', 0)} 个\n\n"
    summary += "| 商品 ID | 状态 | 商品链接 | 失败原因 |\n"
    summary += "|---|---|---|---|\n"
    
    for r in rows:
        pid = r.get('productId', '')
        general_pid = r.get('generalProductId', '')
        display_id = pid if pid else general_pid
        status = r.get('status', 'PENDING')
        url = r.get('publishUrl', '')
        reason = r.get('reason', '')
        
        if status == 'SUCCESS':
            status_icon = "✅ 成功"
            link = f"[查看商品]({url})" if url else "-"
        elif status == 'FAILED':
            status_icon = "❌ 失败"
            link = "-"
        else:
            status_icon = "⏸️ 未处理/跳过"
            link = "-"
            
        summary += f"| {display_id} | {status_icon} | {link} | {reason} |\n"
        
    print(summary)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python update_publish_result.py <csv_path> <response_json_path>")
        sys.exit(1)
    
    update_results(sys.argv[1], sys.argv[2])
