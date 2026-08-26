import csv
import json
import sys
import os
import re

def decode_csv_value(val):
    if not val:
        return None
    return val.replace('{{NL}}', '\n').replace('{{CR}}', '\r')

def parse_json_safe(val, default=None):
    if not val:
        return default
    try:
        return json.loads(val)
    except:
        return default

def clean_unit_size(val):
    if not val:
        return val
    # Remove all characters except digits and 'x' or 'X'
    cleaned = re.sub(r'[^0-9xX]', '', str(val).lower())
    return cleaned

def restore_sku_names_from_before(after_price, before_price):
    """
    将 after.price.skuPrices 中的 skuName 恢复为 before.price.skuPrices 中的原始值（按 skuId 匹配）。

    原因：TRANSLATE 优化会翻译 skuName（如"颜色:红色"→"Color: Red"），但后端发布时
    使用 skuName 匹配平台已有 SKU。翻译后的英文 skuName 匹配不上，导致后端回退使用
    before 数据（原始 CNY 价格 + 中文 skuName），最终价格显示错误（如本应 7.1 USD
    变成 48 USD）。
    """
    if not after_price or not before_price:
        return after_price
    if after_price.get('priceType') != 'sku':
        return after_price

    after_sku_prices = after_price.get('skuPrices')
    before_sku_prices = before_price.get('skuPrices')
    if not after_sku_prices or not before_sku_prices:
        return after_price

    # 构建 skuId → skuName 映射（从 before 获取原始中文名）
    before_name_map = {}
    for sku in before_sku_prices:
        sku_id = sku.get('skuId')
        if sku_id is not None:
            before_name_map[sku_id] = sku.get('skuName', '')

    # 恢复 after 中每个 SKU 的 skuName 为 before 的原始值
    for sku in after_sku_prices:
        sku_id = sku.get('skuId')
        if sku_id is not None and sku_id in before_name_map:
            sku['skuName'] = before_name_map[sku_id]

    return after_price

def contains_chinese(text):
    if not text:
        return False
    return bool(re.search(r'[\u4e00-\u9fa5]', str(text)))

def build_before_snapshot(row):
    """Construct a complete before snapshot from before.* columns in CSV row."""
    before = {}
    
    # 1. title
    before['title'] = decode_csv_value(row.get('before.title'))
    
    # 2. price
    price_str = decode_csv_value(row.get('before.price'))
    before['price'] = parse_json_safe(price_str)
    
    # 3. leadTime
    lead_time_str = decode_csv_value(row.get('before.leadTime'))
    before['leadTime'] = parse_json_safe(lead_time_str, [])
    
    # 4. moq
    moq_str = decode_csv_value(row.get('before.moq'))
    try:
        before['moq'] = int(moq_str) if moq_str else 1
    except:
        before['moq'] = 1
    
    # 5. unitWeight
    weight_str = decode_csv_value(row.get('before.unitWeight'))
    if weight_str:
        try:
            before['unitWeight'] = float(weight_str)
        except:
            pass
    
    # 6. unitSize
    size_str = decode_csv_value(row.get('before.unitSize'))
    before['unitSize'] = clean_unit_size(size_str) or ""
    
    # 7. shippingTemplate
    ship_str = decode_csv_value(row.get('before.shippingTemplate'))
    before['shippingTemplate'] = parse_json_safe(ship_str, {})
    
    # 8. category
    cat_str = decode_csv_value(row.get('before.category'))
    before['category'] = parse_json_safe(cat_str) or {}
    
    # 9. description
    before['description'] = decode_csv_value(row.get('before.description')) or ""
    
    # 10. properties
    props_str = decode_csv_value(row.get('before.properties'))
    before['properties'] = parse_json_safe(props_str, [])
    
    # 11. images
    imgs_str = decode_csv_value(row.get('before.images'))
    before['images'] = parse_json_safe(imgs_str, [])
    
    # 12. inventory
    before['inventory'] = decode_csv_value(row.get('before.inventory')) or ""
    
    # 13. pis
    pis_str = decode_csv_value(row.get('before.pis'))
    try:
        before['pis'] = float(pis_str) if pis_str else 0.0
    except:
        before['pis'] = 0.0
    
    # 14. keywords
    kw_str = decode_csv_value(row.get('before.keywords'))
    kw_obj = parse_json_safe(kw_str)
    if isinstance(kw_obj, list):
        before['keywords'] = json.dumps(kw_obj)
    else:
        before['keywords'] = "[]"
    
    # 15. currencyCode
    before['currencyCode'] = decode_csv_value(row.get('before.currencyCode')) or "USD"
    
    return before

def build_payload(csv_path, output_json_path, logistics_template_id=None, logistics_template_name=None):
    if not os.path.exists(csv_path):
        print(json.dumps({"success": False, "error": f"CSV file not found at {csv_path}"}))
        sys.exit(1)

    records = []
    errors = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            # Skip if already successfully published
            if row.get('status') == 'SUCCESS':
                continue
                
            row_num = idx + 1
            product_id = row.get('productId', '')
            general_product_id = row.get('generalProductId', '')
            title = row.get('before.title', f'Row {row_num}')
            
            # Determine mode: new publish (productId empty) or edit (productId non-empty)
            is_edit_mode = bool(product_id and product_id.strip())
            
            # Helper to get after value with fallback to before (for new publish mode)
            def get_val_with_fallback(field):
                after_val = decode_csv_value(row.get(f'after.{field}'))
                if after_val is not None and after_val.strip() != "":
                    return after_val
                return decode_csv_value(row.get(f'before.{field}'))
            
            # Helper to get after value only (for edit mode, no fallback)
            def get_after_val_only(field):
                return decode_csv_value(row.get(f'after.{field}'))

            row_errors = []
            
            if is_edit_mode:
                # Edit mode: before is complete snapshot, after only contains optimized fields
                before = build_before_snapshot(row)
                
                # Construct after object with only optimized fields (after.* columns with values)
                after = {}
                
                # 1. title
                title_val = get_after_val_only('title')
                if title_val is not None and title_val.strip() != "":
                    after['title'] = title_val
                    if contains_chinese(after['title']):
                        row_errors.append("title contains Chinese characters, please execute translation optimization first")
                
                # 2. price
                price_str = get_after_val_only('price')
                if price_str is not None and price_str.strip() != "":
                    price_obj = parse_json_safe(price_str)
                    if not price_obj or not isinstance(price_obj, dict):
                        row_errors.append("price structure is incomplete or not valid JSON")
                    else:
                        p_type = price_obj.get('priceType')
                        if p_type not in ['sku', 'ladder', 'tiered', 'range', 'fixed']:
                            row_errors.append(f"price.priceType is invalid: {p_type}")
                        # 恢复 skuName 为 before 原始值，防止翻译后的英文名导致后端 SKU 匹配失败
                        after['price'] = restore_sku_names_from_before(price_obj, before.get('price'))

                # 3. leadTime
                lead_time_str = get_after_val_only('leadTime')
                if lead_time_str is not None and lead_time_str.strip() != "":
                    lead_time = parse_json_safe(lead_time_str, [])
                    if not isinstance(lead_time, list):
                        row_errors.append("leadTime must be an array")
                    after['leadTime'] = lead_time
                
                # 4. moq
                moq_str = get_after_val_only('moq')
                if moq_str is not None and moq_str.strip() != "":
                    try:
                        after['moq'] = int(moq_str)
                    except:
                        row_errors.append("moq must be an integer")
                    
                # 5. unitWeight
                weight_str = get_after_val_only('unitWeight')
                if weight_str is not None and weight_str.strip() != "":
                    try:
                        after['unitWeight'] = float(weight_str)
                    except:
                        pass
                    
                # 6. unitSize
                size_str = get_after_val_only('unitSize')
                if size_str is not None and size_str.strip() != "":
                    cleaned_size = clean_unit_size(size_str)
                    if cleaned_size and not re.match(r'^\d+x\d+x\d+$', cleaned_size):
                        row_errors.append(f"unitSize format is invalid: {size_str} -> {cleaned_size}")
                    after['unitSize'] = cleaned_size
                
                # 7. shippingTemplate
                if logistics_template_id and logistics_template_name:
                    after['shippingTemplate'] = {
                        "id": int(logistics_template_id),
                        "name": logistics_template_name
                    }
                else:
                    ship_str = get_after_val_only('shippingTemplate')
                    if ship_str is not None and ship_str.strip() != "":
                        after['shippingTemplate'] = parse_json_safe(ship_str, {})
                    
                # 8. category
                cat_str = get_after_val_only('category')
                if cat_str is not None and cat_str.strip() != "":
                    cat_obj = parse_json_safe(cat_str)
                    if not cat_obj or not cat_obj.get('categoryId'):
                        row_errors.append("category cannot be empty and must contain categoryId")
                    after['category'] = cat_obj
                
                # 9. description
                desc_val = get_after_val_only('description')
                if desc_val is not None and desc_val.strip() != "":
                    after['description'] = desc_val
                    if contains_chinese(after['description']):
                        row_errors.append("description contains Chinese characters, please execute translation optimization first")
                
                # 10. properties
                props_str = get_after_val_only('properties')
                if props_str is not None and props_str.strip() != "":
                    after['properties'] = parse_json_safe(props_str, [])
                    if contains_chinese(json.dumps(after['properties'], ensure_ascii=False)):
                        row_errors.append("properties contains Chinese characters, please execute translation optimization first")
                
                # 11. images
                imgs_str = get_after_val_only('images')
                if imgs_str is not None and imgs_str.strip() != "":
                    imgs = parse_json_safe(imgs_str, [])
                    if not imgs or not isinstance(imgs, list) or len(imgs) == 0:
                        row_errors.append("images cannot be an empty array")
                    after['images'] = imgs
                
                # 12. inventory
                inv_val = get_after_val_only('inventory')
                if inv_val is not None and inv_val.strip() != "":
                    after['inventory'] = inv_val
                
                # 13. pis
                pis_str = get_after_val_only('pis')
                if pis_str is not None and pis_str.strip() != "":
                    try:
                        after['pis'] = float(pis_str)
                    except:
                        after['pis'] = 0.0
                    
                # 14. keywords
                kw_str = get_after_val_only('keywords')
                if kw_str is not None and kw_str.strip() != "":
                    kw_obj = parse_json_safe(kw_str)
                    if not isinstance(kw_obj, list):
                        row_errors.append("keywords must be a JSON array string")
                        after['keywords'] = "[]"
                    else:
                        after['keywords'] = json.dumps(kw_obj)
                    
                # 15. currencyCode
                currency_val = get_after_val_only('currencyCode')
                if currency_val is not None and currency_val.strip() != "":
                    after['currencyCode'] = currency_val
                else:
                    after['currencyCode'] = "USD"
                
                record = {
                    "productId": product_id,
                    "generalProductId": general_product_id,
                    "absSummImageUrl": row.get('absSummImageUrl', ''),
                    "isExcluded": row.get('isExcluded', 'false').lower() == 'true',
                    "status": "PENDING",
                    "reason": None,
                    "before": before,
                    "after": after
                }
            else:
                # New publish mode: before is None, after contains complete data with fallback
                after = {}
                
                # 1. title
                after['title'] = get_val_with_fallback('title')
                if not after['title']:
                    row_errors.append("title cannot be empty")
                elif contains_chinese(after['title']):
                    row_errors.append("title contains Chinese characters, please execute translation optimization first")
                    
                # 2. price
                price_str = get_val_with_fallback('price')
                price_obj = parse_json_safe(price_str)
                if not price_obj or not isinstance(price_obj, dict):
                    row_errors.append("price structure is incomplete or not valid JSON")
                else:
                    p_type = price_obj.get('priceType')
                    if p_type not in ['sku', 'ladder', 'tiered', 'range', 'fixed']:
                        row_errors.append(f"price.priceType is invalid: {p_type}")
                    # 恢复 skuName 为 before 原始值，防止翻译后的英文名导致后端 SKU 匹配失败
                    before_price_str = decode_csv_value(row.get('before.price'))
                    before_price_obj = parse_json_safe(before_price_str)
                    after['price'] = restore_sku_names_from_before(price_obj, before_price_obj)

                # 3. leadTime
                lead_time_str = get_val_with_fallback('leadTime')
                lead_time = parse_json_safe(lead_time_str, [])
                if not isinstance(lead_time, list):
                    row_errors.append("leadTime must be an array")
                after['leadTime'] = lead_time
                
                # 4. moq
                moq_str = get_val_with_fallback('moq')
                try:
                    after['moq'] = int(moq_str) if moq_str else 1
                except:
                    row_errors.append("moq must be an integer")
                    after['moq'] = 1
                    
                # 5. unitWeight
                weight_str = get_val_with_fallback('unitWeight')
                if weight_str:
                    try:
                        after['unitWeight'] = float(weight_str)
                    except:
                        pass
                    
                # 6. unitSize
                size_str = get_val_with_fallback('unitSize')
                cleaned_size = clean_unit_size(size_str)
                if cleaned_size and not re.match(r'^\d+x\d+x\d+$', cleaned_size):
                    row_errors.append(f"unitSize format is invalid: {size_str} -> {cleaned_size}")
                after['unitSize'] = cleaned_size or ""
                
                # 7. shippingTemplate
                if logistics_template_id and logistics_template_name:
                    after['shippingTemplate'] = {
                        "id": int(logistics_template_id),
                        "name": logistics_template_name
                    }
                else:
                    ship_str = get_val_with_fallback('shippingTemplate')
                    after['shippingTemplate'] = parse_json_safe(ship_str, {})
                    
                # 8. category
                cat_str = get_val_with_fallback('category')
                cat_obj = parse_json_safe(cat_str)
                if not cat_obj or not cat_obj.get('categoryId'):
                    row_errors.append("category cannot be empty and must contain categoryId")
                after['category'] = cat_obj or {}
                
                # 9. description
                after['description'] = get_val_with_fallback('description') or ""
                if contains_chinese(after['description']):
                    row_errors.append("description contains Chinese characters, please execute translation optimization first")
                
                # 10. properties
                props_str = get_val_with_fallback('properties')
                after['properties'] = parse_json_safe(props_str, [])
                if contains_chinese(json.dumps(after['properties'], ensure_ascii=False)):
                    row_errors.append("properties contains Chinese characters, please execute translation optimization first")
                
                # 11. images
                imgs_str = get_val_with_fallback('images')
                imgs = parse_json_safe(imgs_str, [])
                if not imgs or not isinstance(imgs, list) or len(imgs) == 0:
                    row_errors.append("images cannot be an empty array")
                after['images'] = imgs
                
                # 12. inventory
                after['inventory'] = get_val_with_fallback('inventory') or ""
                
                # 13. pis
                pis_str = get_val_with_fallback('pis')
                try:
                    after['pis'] = float(pis_str) if pis_str else 0.0
                except:
                    after['pis'] = 0.0
                    
                # 14. keywords
                kw_str = get_val_with_fallback('keywords')
                kw_obj = parse_json_safe(kw_str)
                if not isinstance(kw_obj, list):
                    row_errors.append("keywords must be a JSON array string")
                    after['keywords'] = "[]"
                else:
                    after['keywords'] = json.dumps(kw_obj)
                    
                # 15. currencyCode
                after['currencyCode'] = get_val_with_fallback('currencyCode') or "USD"

                record = {
                    "productId": product_id,
                    "generalProductId": general_product_id,
                    "absSummImageUrl": row.get('absSummImageUrl', ''),
                    "isExcluded": row.get('isExcluded', 'false').lower() == 'true',
                    "status": "PENDING",
                    "reason": None,
                    "before": None,
                    "after": after
                }
            
            if row_errors:
                errors.append({
                    "productId": product_id,
                    "title": title,
                    "errors": row_errors
                })
            else:
                records.append(record)

    result = {
        "success": len(errors) == 0,
        "total": len(records) + len(errors),
        "valid_count": len(records),
        "error_count": len(errors),
        "records": records,
        "errors": errors
    }

    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
        
    print(json.dumps({
        "success": True,
        "message": f"Payload built. Valid: {len(records)}, Errors: {len(errors)}, Skipped (Already Published): {idx + 1 - len(records) - len(errors)}",
        "output_file": output_json_path,
        "has_errors": len(errors) > 0
    }))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python build_payload.py <input_csv_path> <output_json_path> [logistics_template_id] [logistics_template_name]")
        sys.exit(1)
        
    csv_p = sys.argv[1]
    out_p = sys.argv[2]
    tpl_id = sys.argv[3] if len(sys.argv) > 3 else None
    tpl_name = sys.argv[4] if len(sys.argv) > 4 else None
    
    build_payload(csv_p, out_p, tpl_id, tpl_name)
