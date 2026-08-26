# Shopify API 拉取数据 → OSS 文件 DTO 转换规范

本文件定义了 Shopify API 搬品场景中，从 Shopify Admin API 拉取商品数据后，**转换为 `ShopifyMcpProductDTO` 数组并序列化为 JSON 文件上传到 OSS** 的完整转换规范。

> **核心要求**：上传到 OSS 的 JSON 文件内容必须是 `ShopifyMcpProductDTO[]`（JSON 数组），每个元素严格遵循本文件定义的结构。所有字段名使用 **Java 驼峰命名**（camelCase），无 `@JSONField` 别名映射。

---

## ShopifyMcpProductDTO（主结构）

继承自 `ProductDTO`，表示一个 Shopify 商品。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `originProductId` | String | 否 | 来源商品 ID（继承自 ProductDTO） |
| `rawId` | String | 否 | 原始 ID（继承自 ProductDTO） |
| `originSource` | String | 否 | 来源平台标识（继承自 ProductDTO） |
| `id` | String | 是 | Shopify 商品 ID |
| `title` | String | 是 | 商品标题 |
| `handle` | String | 否 | Shopify URL handle |
| `description` | String | 否 | 纯文本描述 |
| `descriptionHtml` | String | 否 | HTML 格式描述 |
| `vendor` | String | 否 | 供应商/品牌 |
| `productType` | String | 否 | 商品类型 |
| `status` | String | 否 | 商品状态（`active` / `draft` / `archived`） |
| `updatedAt` | String | 否 | 最后更新时间（ISO 8601） |
| `currencyCode` | String | 否 | 币种代码 |
| `options` | ShopifyOption[] | 否 | 商品选项列表（如颜色、尺码） |
| `images` | ShopifyMcpImageDTO[] | 否 | 商品图片列表 |
| `variants` | ShopifyMcpVariantDTO[] | 否 | SKU 变体列表 |

---

## ShopifyMcpImageDTO

商品图片。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | String | 是 | 图片 URL |
| `altText` | String | 否 | 图片替代文本 |

---

## ShopifyMcpVariantDTO

SKU 变体。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | String | 是 | 变体 ID |
| `title` | String | 否 | 变体标题 |
| `price` | String | 是 | 价格（字符串格式，如 `"29.99"`） |
| `sku` | String | 否 | SKU 编码 |
| `inventoryQuantity` | Integer | 否 | 库存数量 |
| `availableForSale` | Boolean | 否 | 是否可售 |
| `selectedOptions` | ShopifySelectedOption[] | 否 | 变体选项值列表 |

---

## ShopifySelectedOption

变体的选中选项值。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | String | 是 | 选项名（如 `Color`、`Size`） |
| `value` | String | 是 | 选项值（如 `Red`、`XL`） |

---

## ShopifyOption

商品级选项定义。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | String | 否 | 选项 ID |
| `name` | String | 是 | 选项名称（如 `Color`、`Size`） |
| `values` | String[] | 是 | 所有可选值列表（如 `["Red", "Blue", "Green"]`） |

---

## Shopify Admin API → ShopifyMcpProductDTO 转换规则

从 Shopify Admin REST API (`GET /admin/api/2024-01/products.json`) 拉取的原始数据，按以下规则转换为 `ShopifyMcpProductDTO`：

| Shopify API 字段 | DTO 字段 | 转换说明 |
|-----------------|----------|---------|
| `id` | `id` | 转为 String |
| `title` | `title` | 直接映射 |
| `handle` | `handle` | 直接映射 |
| `body_html` | `descriptionHtml` | 直接映射，保留 HTML 标签 |
| `body_html`（去标签） | `description` | 去除 HTML 标签后的纯文本 |
| `vendor` | `vendor` | 直接映射 |
| `product_type` | `productType` | 直接映射 |
| `status` | `status` | 直接映射 |
| `updated_at` | `updatedAt` | 直接映射 |
| - | `currencyCode` | 从 Shopify 店铺设置获取，或用户指定 |
| `options[]` | `options[]` | 每个 option 的 `id`、`name`、`values` 直接映射 |
| `images[]` | `images[]` | 每个 image 的 `src` → `url`，`alt` → `altText` |
| `variants[]` | `variants[]` | 见下方变体转换 |

### 变体转换（variants）

| Shopify API 字段 | DTO 字段 | 转换说明 |
|-----------------|----------|---------|
| `id` | `id` | 转为 String |
| `title` | `title` | 直接映射 |
| `price` | `price` | 保持 String 格式 |
| `sku` | `sku` | 直接映射 |
| `inventory_quantity` | `inventoryQuantity` | 直接映射 |
| - | `availableForSale` | 若 `inventory_quantity > 0` 且商品 `status == "active"` 则 `true` |
| `option1/option2/option3` | `selectedOptions[]` | 结合商品的 `options` 定义拆解，如 `option1="Red"` + options[0].name="Color" → `{"name":"Color","value":"Red"}` |

---

## JSON 文件格式示例

上传到 OSS 的文件必须为如下格式（`ShopifyMcpProductDTO` 数组）：

```json
[
  {
    "id": "7654321098",
    "title": "Classic Cotton T-Shirt",
    "handle": "classic-cotton-t-shirt",
    "descriptionHtml": "<p>Premium cotton t-shirt</p>",
    "description": "Premium cotton t-shirt",
    "vendor": "BrandX",
    "productType": "T-Shirts",
    "status": "active",
    "updatedAt": "2024-12-01T10:30:00Z",
    "currencyCode": "USD",
    "options": [
      {
        "id": "opt1",
        "name": "Color",
        "values": ["Red", "Blue", "Black"]
      },
      {
        "id": "opt2",
        "name": "Size",
        "values": ["S", "M", "L", "XL"]
      }
    ],
    "images": [
      {
        "url": "https://cdn.shopify.com/s/files/image1.jpg",
        "altText": "T-shirt front view"
      },
      {
        "url": "https://cdn.shopify.com/s/files/image2.jpg",
        "altText": "T-shirt back view"
      }
    ],
    "variants": [
      {
        "id": "44001",
        "title": "Red / S",
        "price": "29.99",
        "sku": "TSHIRT-RED-S",
        "inventoryQuantity": 100,
        "availableForSale": true,
        "selectedOptions": [
          {"name": "Color", "value": "Red"},
          {"name": "Size", "value": "S"}
        ]
      },
      {
        "id": "44002",
        "title": "Blue / M",
        "price": "29.99",
        "sku": "TSHIRT-BLUE-M",
        "inventoryQuantity": 50,
        "availableForSale": true,
        "selectedOptions": [
          {"name": "Color", "value": "Blue"},
          {"name": "Size", "value": "M"}
        ]
      }
    ]
  }
]
```

> **关键**：所有字段名使用 Java 驼峰命名（camelCase），如 `descriptionHtml`、`productType`、`updatedAt`、`inventoryQuantity`、`altText` 等。Shopify API 返回的 snake_case 字段名（`body_html`、`product_type`、`updated_at`、`inventory_quantity`）需在转换时改为 camelCase。
