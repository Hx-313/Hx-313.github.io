# 国际站数据字段映射

## MCP 原始 JSON 结构（read_file 看到的，不要直接用）

```json
{
  "data": [
    {
      "prodName": "...",
      "detailUrl": "...",
      "prodImage": "...",
      "price": "33.0~35.0",
      "minOrdQty": "1",
      "rating": 5.0,
      "commentCnt": 7,
      "supplierCnName": "...",
      "shopUrl": "...",
      "abCntIndex": [{"ds":"20260418","tagValue":5}, ...],   ← 30条时序
      "recOrdAmtIndex": [{"ds":"20260418","tagValue":120}, ...],
      "uvDetailIndex": [...],
      "prepayOrdCntIndex": [...]
    }
  ],
  "success": true
}
```

> ⚠️ 不要直接使用这个 JSON。调用 `python scripts/extract_top15.py <文件路径>` 获得精简版本。

## 字段 → 报告列映射

| 报告用途 | 取值字段 | 填写方式 |
|----------|----------|----------|
| 缩略图 | `thumbnail` | 直接复制（脚本已预组装为 `![img](url)` 格式） |
| 产品名+链接 | `productLink` | 直接复制（脚本已预组装为 `[name](url)` 格式） |
| 价格(USD) | `price` | 原样输出（脚本已转换 `~` → `-`） |
| MOQ | `minOrdQty` | 原样输出 |
| GMV指数 | `gmvIdx` | 脚本已计算的 30d 汇总值，直接输出数字 |
| 询盘指数 | `inquiryIdx` | 同上 |
| UV指数 | `uvIdx` | Section 3 深度分析中可用，Section 2 不展示 |
| 订单指数 | `orderIdx` | Section 3 深度分析中可用，Section 2 不展示 |
| 评分 | `rating` | 无值写 `-` |
| 评论数 | `commentCnt` | 无值写 `-` |
| 供应商 | `supplierCnName` | 原样输出（Section 2）；`[supplierCnName](shopUrl)`（Section 7） |
| 供应商店铺链接 | `shopUrl` | 仅在 Section 7 使用，作为供应商名的超链接 |

## extract_top15.py 输出的 JSON 结构

脚本输出的精简 JSON（agent 实际看到的）：

```json
[
  {
    "prodName": "OEM Red Light Therapy Hat 660nm 850nm",
    "detailUrl": "https://www.alibaba.com/product-detail/xxx_123.html",
    "prodImage": "https://sc04.alicdn.com/kf/xxx.jpg_640x640.jpg",
    "price": "33.0-35.0",
    "minOrdQty": "1",
    "rating": 5.0,
    "commentCnt": 7,
    "supplierCnName": "深圳市xxx有限公司",
    "shopUrl": "http://xxx.en.alibaba.com",
    "inquiryIdx": 5,
    "gmvIdx": 1307,
    "uvIdx": 16,
    "orderIdx": 2,
    "thumbnail": "![img](https://sc04.alicdn.com/kf/xxx.jpg_640x640.jpg)",
    "productLink": "[OEM Red Light Therapy Hat 660nm 850nm](https://www.alibaba.com/product-detail/xxx_123.html)"
  }
]
```

`thumbnail` 和 `productLink` 是脚本预组装的 markdown 格式，agent 直接复制到表格中即可，不需要自己拼接。

## 禁止操作

- ❌ 从 detailUrl 中反向提取产品名称
- ❌ 用 prodId 拼接 URL
- ❌ 修改 prodImage 地址（如裁剪参数、换域名）
- ❌ 对 xxxIndex 时序数组做求和/平均
- ❌ 自己构造任何 URL
- ❌ 自己写 python 脚本处理数据（已有 extract_top15.py）

## 空值处理

字段值为 `null`/`None`/空字符串 → 表格中写 `-`。不猜测、不补全。
