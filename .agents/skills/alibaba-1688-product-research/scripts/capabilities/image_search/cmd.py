#!/usr/bin/env python3
"""图片搜索 CLI入口"""

COMMAND_NAME = "image_search"
COMMAND_DESC = "图片搜索1688商品"

import os
import sys
import argparse

sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..')))

from _auth import get_ak_from_env
from _output import print_output, print_error, format_products_table

from capabilities.image_search.service import image_search


def main():
    ak_id, _ = get_ak_from_env()
    if not ak_id:
        print_output(False,
                     "❌ AK 未就绪。请先执行 `cli.py configure` 检查配置状态；如确认未配置，再执行 `cli.py configure YOUR_AK` 完成配置。\n\n获取 AK: https://clawhub.1688.com/",
                     {"data": {}, "action": "run_configure"})
        return

    parser = argparse.ArgumentParser(description="图片搜索 - 以图搜图找同款商品")
    parser.add_argument("--image", "-i", required=True, help="图片本地路径或 URL")
    parser.add_argument("--platform", "-p", default="1688", help="目标平台，默认 1688")
    parser.add_argument("--limit", "-l", type=int, default=10, help="返回数量，默认 10")
    parser.add_argument("--threshold", "-t", type=float, default=0.7, help="相似度阈值，默认 0.7")
    args = parser.parse_args()

    try:
        image_input = args.image

        # 区分 URL 和本地文件路径
        if image_input.startswith(("http://", "https://")):
            # URL 直接传给 service 层处理
            image_path = image_input
        else:
            # 本地路径：转为绝对路径并验证存在性
            image_path = os.path.abspath(image_input)
            if not os.path.exists(image_path):
                print_output(False,
                             f"❌ 图片路径无效：`{image_input}`\n\n展开后路径为：`{image_path}`\n\n请确认文件存在，建议使用绝对路径。",
                             {"data": {}})
                return

        result = image_search(
            image_path=image_path,
            platform=args.platform,
            limit=args.limit,
            similarity_threshold=args.threshold
        )
        
        # 构建输出消息
        total = result.get("total_results", 0)
        products = result.get("similar_products", [])
        
        if total > 0:
            header = f"✅ 找到 {total} 个匹配商品"
            message = format_products_table(products, header)
        else:
            message = "未找到匹配商品"
        
        print_output(True, message, {"data": result})
    except Exception as e:
        print_error(e, {"data": {}})


if __name__ == "__main__":
    main()
