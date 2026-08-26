#!/usr/bin/env python3
"""
build_product_score_payload.py

从本地 CSV 中间产物中读取商品数据，构造 query_product_score 工具所需的
扁平化 ProductSnapshotDTO 请求 payload（JSON 格式）。

用法：
    # 为所有有效商品生成 payload（输出 JSON 数组）
    python3 scripts/build_product_score_payload.py <csv_path>

    # 为指定行号的商品生成 payload（行号从 1 开始，不含表头）
    python3 scripts/build_product_score_payload.py <csv_path> --row 3

    # 输出到文件
    python3 scripts/build_product_score_payload.py <csv_path> --output payload.json

输出：
    将构造好的 JSON payload 打印到 stdout，Agent 可直接将其作为
    query_product_score 的请求体使用。

设计原则：
    - 字段名、嵌套结构、类型严格对齐 ProductSnapshotDTO 定义
    - 固定读取 CSV 中 after.* 列的数据（对齐 Payload 复用规则）
    - after.* 列为空的字段不写入 payload（后端会自动用线上原始值补全）
    - 不会从 before.* 列回填数据，也不会编造或填充任何默认值
    - productId 从 CSV 的 productId 列自动读取，不需要外部传入
    - 从 CSV 中按列名动态定位（禁止硬编码列序号）
    - 自动处理 CSV 换行占位符解码（{{NL}} -> \\n, {{CR}} -> \\r）
    - keywords 保留为 JSON 数组格式字符串（不做二次序列化）
    - 嵌套对象（price / leadTime / shippingTemplate / category / properties）
      从 CSV 的 JSON 字符串解析为原生对象
"""

import argparse
import csv
import json
import sys
from typing import Any, Optional


# ---------------------------------------------------------------------------
# CSV 换行占位符解码
# ---------------------------------------------------------------------------

def decode_csv_newlines(value: str) -> str:
    """将 CSV 中的换行占位符还原为真实换行符。"""
    if not value:
        return value
    return value.replace("{{NL}}", "\n").replace("{{CR}}", "\r")


# ---------------------------------------------------------------------------
# 安全类型转换
# ---------------------------------------------------------------------------

def safe_int(value: Optional[str]) -> Optional[int]:
    """安全转换为 int，空值或无效值返回 None。"""
    if value is None or value.strip() == "":
        return None
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return None


def safe_float(value: Optional[str]) -> Optional[float]:
    """安全转换为 float，空值或无效值返回 None。"""
    if value is None or value.strip() == "":
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def safe_json_parse(value: Optional[str]) -> Any:
    """安全解析 JSON 字符串，失败或空值返回 None。"""
    if value is None or value.strip() == "":
        return None
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return None


# ---------------------------------------------------------------------------
# 嵌套对象构造
# ---------------------------------------------------------------------------

def build_price_object(raw_price: Optional[str]) -> Optional[dict]:
    """
    从 CSV 的 price 列（JSON 字符串）解析并构造 ProductPriceDTO。

    确保：
    - priceType 为小写枚举值
    - 按 priceType 选用对应的价格字段
    - 未使用的价格字段保留（空数组/0/空字符串），与 DTO 对齐
    """
    parsed = safe_json_parse(raw_price)
    if parsed is None:
        return None

    price_type = parsed.get("priceType", "")
    if isinstance(price_type, str):
        price_type = price_type.lower()

    return {
        "priceType": price_type,
        "currency": parsed.get("currency", ""),
        "skuPrices": parsed.get("skuPrices", []),
        "ladderPrices": parsed.get("ladderPrices", []),
        "minPrice": parsed.get("minPrice", 0),
        "maxPrice": parsed.get("maxPrice", 0),
        "fixedPrice": parsed.get("fixedPrice", ""),
    }


def build_lead_time_array(raw_lead_time: Optional[str]) -> Optional[list]:
    """
    从 CSV 的 leadTime 列解析 QuantityTieredLeadTime 数组。

    确保只使用 quantity / leadTime 两个字段（废弃字段会被丢弃）。
    """
    parsed = safe_json_parse(raw_lead_time)
    if parsed is None or not isinstance(parsed, list):
        return None

    result = []
    for item in parsed:
        entry = {
            "quantity": item.get("quantity"),
            "leadTime": item.get("leadTime"),
        }
        if entry["quantity"] is not None and entry["leadTime"] is not None:
            result.append(entry)

    return result if result else None


def build_shipping_template(raw_template: Optional[str]) -> Optional[dict]:
    """从 CSV 的 shippingTemplate 列解析 ShippingTemplateDTO。"""
    parsed = safe_json_parse(raw_template)
    if parsed is None:
        return None
    return {
        "id": parsed.get("id"),
        "name": parsed.get("name"),
    }


def build_category(raw_category: Optional[str]) -> Optional[dict]:
    """从 CSV 的 category 列解析 CategoryDTO。"""
    parsed = safe_json_parse(raw_category)
    if parsed is None:
        return None
    return {
        "categoryId": parsed.get("categoryId"),
        "categoryPath": parsed.get("categoryPath"),
    }


def build_properties(raw_properties: Optional[str]) -> Optional[list]:
    """
    从 CSV 的 properties 列解析 GlobalProductAttribute 数组。

    确保每项只包含 attributeId / attributeName / attributeValue / attributeValueId。
    """
    parsed = safe_json_parse(raw_properties)
    if parsed is None or not isinstance(parsed, list):
        return None

    result = []
    for item in parsed:
        result.append({
            "attributeId": item.get("attributeId"),
            "attributeName": item.get("attributeName"),
            "attributeValue": item.get("attributeValue"),
            "attributeValueId": item.get("attributeValueId"),
        })

    return result if result else None


def build_images(raw_images: Optional[str]) -> Optional[list]:
    """从 CSV 的 images 列解析图片 URL 数组。"""
    parsed = safe_json_parse(raw_images)
    if parsed is None or not isinstance(parsed, list):
        return None
    return parsed


# ---------------------------------------------------------------------------
# 核心：构造完整 payload
# ---------------------------------------------------------------------------

def build_payload(row: dict) -> dict:
    """
    从 CSV 行数据构造 query_product_score 的扁平化请求体。

    - 固定读取 after.* 列
    - after.* 列为空的字段不写入（后端自动用线上原始值补全）
    - productId 从 CSV 行的 productId 列获取（始终写入，禁止漏传）
    """

    def get_after_field(field_name: str) -> Optional[str]:
        """从 CSV 行中获取 after.* 前缀的字段值。"""
        raw = row.get(f"after.{field_name}", "")
        if raw is None or (isinstance(raw, str) and raw.strip() == ""):
            return None
        return decode_csv_newlines(str(raw))

    payload: dict[str, Any] = {}

    # productId：从 CSV 的 productId 列读取，始终写入
    product_id = row.get("productId", "").strip()
    payload["productId"] = product_id

    # 简单字段（after.* 为空则不写入）
    title = get_after_field("title")
    if title is not None:
        payload["title"] = title

    description = get_after_field("description")
    if description is not None:
        payload["description"] = description

    moq = safe_int(get_after_field("moq"))
    if moq is not None:
        payload["moq"] = moq

    unit_weight = safe_float(get_after_field("unitWeight"))
    if unit_weight is not None:
        payload["unitWeight"] = unit_weight

    unit_size = get_after_field("unitSize")
    if unit_size is not None:
        payload["unitSize"] = unit_size

    pis = safe_float(get_after_field("pis"))
    if pis is not None:
        payload["pis"] = pis

    currency_code = (
        get_after_field("currencyCode")
        or row.get("currencyCode", "").strip()
        or None
    )
    if currency_code:
        payload["currencyCode"] = currency_code

    # keywords：保留为 JSON 数组格式字符串
    keywords = get_after_field("keywords")
    if keywords is not None:
        try:
            parsed_keywords = json.loads(keywords)
            if isinstance(parsed_keywords, list):
                payload["keywords"] = json.dumps(parsed_keywords)
            else:
                payload["keywords"] = keywords
        except (json.JSONDecodeError, TypeError):
            payload["keywords"] = keywords

    # 嵌套对象字段
    price = build_price_object(get_after_field("price"))
    if price is not None:
        payload["price"] = price

    lead_time = build_lead_time_array(get_after_field("leadTime"))
    if lead_time is not None:
        payload["leadTime"] = lead_time

    shipping_template = build_shipping_template(get_after_field("shippingTemplate"))
    if shipping_template is not None:
        payload["shippingTemplate"] = shipping_template

    category = build_category(get_after_field("category"))
    if category is not None:
        payload["category"] = category

    properties = build_properties(get_after_field("properties"))
    if properties is not None:
        payload["properties"] = properties

    images = build_images(get_after_field("images"))
    if images is not None:
        payload["images"] = images

    inventory = get_after_field("inventory")
    if inventory is not None:
        payload["inventory"] = inventory

    return payload


# ---------------------------------------------------------------------------
# CSV 读取
# ---------------------------------------------------------------------------

def read_all_rows(csv_path: str) -> list[dict]:
    """读取 CSV 中所有行，按列名动态定位。"""
    with open(csv_path, "r", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        return list(reader)


def is_valid_for_score_query(row: dict) -> bool:
    """
    判断该行是否可以进行质量分查询。

    跳过条件：
    - isExcluded 为 true
    - generalProductId 有值（搬品/新发品场景，调用必定失败）
    - productId 为空
    """
    product_id = row.get("productId", "").strip()
    general_product_id = row.get("generalProductId", "").strip()
    is_excluded = row.get("isExcluded", "").strip().lower()

    if is_excluded == "true":
        return False
    if general_product_id:
        return False
    if not product_id:
        return False
    return True


# ---------------------------------------------------------------------------
# 入口
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="从 CSV 中间产物构造 query_product_score 请求 payload"
    )
    parser.add_argument("csv_path", help="CSV 文件路径")
    parser.add_argument(
        "--row",
        type=int,
        default=None,
        help="指定数据行号（从 1 开始，不含表头行）。不指定则为所有有效商品生成 payload",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="输出文件路径（不指定则输出到 stdout）",
    )

    args = parser.parse_args()
    rows = read_all_rows(args.csv_path)

    if args.row is not None:
        # 单行模式
        row_index = args.row - 1
        if row_index < 0 or row_index >= len(rows):
            print(
                f"Error: row {args.row} out of range "
                f"(CSV has {len(rows)} data rows)",
                file=sys.stderr,
            )
            sys.exit(1)

        target_row = rows[row_index]
        if not is_valid_for_score_query(target_row):
            general_id = target_row.get("generalProductId", "").strip()
            product_id = target_row.get("productId", "").strip()
            if general_id:
                print(
                    f"Warning: row {args.row} has generalProductId "
                    f"'{general_id}', query_product_score will likely fail.",
                    file=sys.stderr,
                )
            elif not product_id:
                print(
                    f"Error: row {args.row} has no productId.",
                    file=sys.stderr,
                )
                sys.exit(1)

        payload = build_payload(target_row)
        result = json.dumps(payload, ensure_ascii=False, indent=2)
    else:
        # 批量模式：为所有有效商品生成 payload
        payloads = []
        for row in rows:
            if is_valid_for_score_query(row):
                payloads.append(build_payload(row))

        if not payloads:
            print(
                "Warning: No valid products found for score query.",
                file=sys.stderr,
            )
            sys.exit(0)

        result = json.dumps(payloads, ensure_ascii=False, indent=2)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as outfile:
            outfile.write(result)
        print(f"Payload written to {args.output}", file=sys.stderr)
    else:
        print(result)


if __name__ == "__main__":
    main()
