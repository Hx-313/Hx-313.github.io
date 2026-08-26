import csv
import json
import sys
import os

def decode_csv_value(val):
    if not val:
        return ""
    return val.replace('{{NL}}', '\n').replace('{{CR}}', '\r')

def parse_json_safe(val, default=None):
    if not val:
        return default
    try:
        return json.loads(val)
    except:
        return default

def render_price(price_str):
    price_obj = parse_json_safe(price_str, {})
    if not price_obj:
        return "N/A"
    
    p_type = (price_obj.get("priceType") or "").strip().lower()
    currency = price_obj.get("currency", "USD")

    # 尝试按 priceType 渲染；若 priceType 为空则自动探测数据结构
    skus = price_obj.get("skuPrices") or []
    ladders = price_obj.get("ladderPrices") or []
    min_price = price_obj.get("minPrice", 0)
    max_price = price_obj.get("maxPrice", 0)
    fixed_price = price_obj.get("fixedPrice", "")

    if p_type == "sku" or (not p_type and skus):
        if skus:
            prices = [s.get("price", 0) for s in skus if s.get("price") is not None]
            if prices:
                min_p, max_p = min(prices), max(prices)
                if min_p == max_p:
                    return f"{currency} {min_p}"
                return f"{currency} {min_p} - {max_p}"
    
    if p_type in ("ladder", "tiered") or (not p_type and ladders):
        if ladders:
            prices = [l.get("price", 0) for l in ladders if l.get("price") is not None]
            if prices:
                min_p, max_p = min(prices), max(prices)
                if min_p == max_p:
                    return f"{currency} {min_p}"
                return f"{currency} {min_p} - {max_p}"
    
    if p_type == "range" or (not p_type and (min_price or max_price)):
        if min_price or max_price:
            if min_price == max_price:
                return f"{currency} {min_price}"
            return f"{currency} {min_price} - {max_price}"
    
    if p_type == "fixed" or (not p_type and fixed_price):
        if fixed_price:
            return f"{currency} {fixed_price}"

    return "N/A"

def generate_html(csv_path, output_path):
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        sys.exit(1)

    html_content = """
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <title>商品解析预览 (Product Preview)</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; background: #f5f7fa; color: #333; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { margin-bottom: 20px; }
            .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; gap: 20px; }
            .img-container { flex-shrink: 0; width: 120px; }
            .img-container img { width: 100%; height: auto; border-radius: 4px; border: 1px solid #e2e8f0; object-fit: cover; }
            .info-container { flex-grow: 1; }
            .title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1e293b; }
            .id-badge { display: inline-block; background: #e2e8f0; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-bottom: 12px; }
            .grid { display: grid; grid-template-columns: 100px 1fr; gap: 8px 16px; font-size: 14px; }
            .label { color: #64748b; font-weight: 500; }
            .value { color: #334155; }
            .properties { font-size: 13px; color: #475569; background: #f8fafc; padding: 8px; border-radius: 4px; margin-top: 4px; }
            .sku-section { margin-top: 12px; }
            .sku-section h4 { font-size: 13px; color: #475569; margin: 0 0 6px 0; }
            .sku-table { width: 100%; border-collapse: collapse; font-size: 13px; }
            .sku-table th { background: #f1f5f9; color: #475569; padding: 6px 8px; text-align: left; border: 1px solid #e2e8f0; }
            .sku-table td { padding: 6px 8px; border: 1px solid #e2e8f0; color: #334155; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📦 商品解析预览 (Parsed Product Preview)</h2>
                <p id="summary">正在加载...</p>
            </div>
            <div id="product-list">
    """

    count = 0
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            count += 1
            
            # Extract fields
            product_id = row.get('generalProductId') or row.get('productId', 'N/A')
            title = decode_csv_value(row.get('before.title', ''))
            img_url = row.get('absSummImageUrl', '')
            
            # If no main image, try to get first from images array
            if not img_url:
                images = parse_json_safe(row.get('before.images', '[]'), [])
                if images and len(images) > 0:
                    img_url = images[0]

            price_str = decode_csv_value(row.get('before.price', ''))
            price_display = render_price(price_str)
            
            props_str = decode_csv_value(row.get('before.properties', ''))
            props = parse_json_safe(props_str, [])
            props_html = ""
            if props:
                props_html = "<div class='properties'>" + "<br>".join([f"• {p.get('attributeName', '')}: {p.get('attributeValue', '')}" for p in props[:10]])
                if len(props) > 10:
                    props_html += f"<br>• ... 等共 {len(props)} 个属性"
                props_html += "</div>"

            # SKU variant table (read from price.skuPrices)
            sku_html = ""
            price_obj = parse_json_safe(price_str, {}) if price_str else {}
            if price_obj.get('priceType') == 'sku':
                sku_prices = price_obj.get('skuPrices') or []
                if sku_prices:
                    currency = price_obj.get('currency', 'USD')
                    sku_rows = ""
                    for sp in sku_prices[:20]:
                        sku_rows += f"<tr><td>{sp.get('skuName', '')}</td><td>{currency} {sp.get('price', 'N/A')}</td></tr>"
                    more_note = f"<p style='font-size:12px;color:#94a3b8;'>... 共 {len(sku_prices)} 个 SKU，仅展示前 20 个</p>" if len(sku_prices) > 20 else ""
                    sku_html = f"""
                    <div class="sku-section">
                        <h4>SKU 变体 (共 {len(sku_prices)} 个)</h4>
                        <table class="sku-table">
                            <tr><th>名称</th><th>单价</th></tr>
                            {sku_rows}
                        </table>
                        {more_note}
                    </div>"""

            html_content += f"""
                <div class="card">
                    <div class="img-container">
                        <img src="{img_url}" alt="Product Image" onerror="this.src='https://via.placeholder.com/120?text=No+Image'">
                    </div>
                    <div class="info-container">
                        <div class="id-badge">ID: {product_id}</div>
                        <div class="title">{title}</div>
                        <div class="grid">
                            <div class="label">价格 (Price)</div>
                            <div class="value" style="color: #059669; font-weight: 600;">{price_display}</div>
                            
                            <div class="label">核心属性</div>
                            <div class="value">{props_html or '<span style="color:#94a3b8;">无属性数据</span>'}</div>
                        </div>
                        {sku_html}
                    </div>
                </div>
            """

    html_content += f"""
            </div>
            <script>
                document.getElementById('summary').innerText = '共解析出 {count} 个商品。请检查以下核心信息（标题、价格、图片、属性）。';
            </script>
        </div>
    </body>
    </html>
    """

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Successfully generated preview HTML at {output_path} with {count} products.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python render_parsed_csv_preview.py <input_csv_path> <output_html_path>")
        sys.exit(1)
    
    generate_html(sys.argv[1], sys.argv[2])
