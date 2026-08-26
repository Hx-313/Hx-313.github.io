---
name: Destination Country Classification & Tax Calculation
version: 1.0.0
description: >
  Alibaba.com Destination Country Classification & Tariff Calculation Skill, covering US HS code prediction, tariff rate lookup, and customs duty estimation.
  Use this skill whenever the user mentions HS code, US HS code, customs code, tariff rate, customs duty, import tax, tariff, duty, "how much tax to sell to the US", or any tariff-related question.
  Trigger even if the user just casually asks "what's the US tariff", "what's the HS code", or "how much tax do I pay selling to the US".

  ⚠️ Hard constraints:
  - HS code classification: Only destination = United States (US) is supported (origin country does not affect classification results).
  - Tariff calculation: Only the China (CN) → United States (US) lane is supported. Even if the user declares shipping from Vietnam / India / Mexico / Italy or any non-CN origin, the skill still calls MCP with CN→US and prepends a "for reference only" notice.
  - A product ID or product URL is required — "no-product" scenarios are not accepted.

  Typical prompts:
  1. HS code lookup
  - What is the US HS code for product 1601046346794?
  - Find the HS code of https://www.alibaba.com/product-detail/xxx_1601046346794.html
  - How is product 1601046346794 classified for the US market?

  2. Tariff / customs duty estimation
  - Product 1601046346794, cargo value 1500 USD, how much is the customs duty?
  - Product 1601046346794, purchasing 20 units, what is the US tariff?
  - How much tax do I pay selling product 1601046346794 to the US?
  - From China to US, how much is the tariff for product 1601046346794?
---
> 🔴 **硬约束（不可违反）：**
>
> 1. **归类（HS 编码查询）**：仅支持目的国为**美国（US）**。发货国不影响归类结果，`originCountryCode` 默认填 `"CN"`。
> 2. **关税计算**：仅支持**中国（CN）→ 美国（US）**单一链路。调用 MCP 时 `originCountryCode` **必须**写死为 `"CN"`，**严禁**透传用户声明的发货国；用户输入非 CN 发货国时，须在输出头部明确告知「仅供参考」。
> 3. 两项功能 `destinationCountryCode` 均强制 `"US"`。

## 典型触发场景


| 输入类型                   | 示例                                                                  | 关键词                 |
| -------------------------- | --------------------------------------------------------------------- | ---------------------- |
| **商品 ID + 美国 HS 编码** | `商品 1601046346794 的美国 HS 编码和税率`                             | HS 编码、税率、美国    |
| **商品 ID + 数量**         | `商品 1601046346794 采购 20 件，清关税费多少`                         | 采购、件、清关税费     |
| **商品 ID + 货值**         | `商品 1601046346794 货值 1500usd，清关税费多少`                       | 货值、USD、清关税费    |
| **商品 URL**               | `https://www.alibaba.com/product-detail/...html 的美国 HS 编码和税率` | alibaba.com、URL、链接 |

## 核心功能

### 功能 1：商品归类（HS 编码查询）

> 限制：仅支持目的国为美国（US），发货国不影响归类结果。

**输入**：

- 商品 ID（如 `1601046346794`）
- 或商品 URL（自动提取 ID）

**输出**：

- 美国 HS 编码（10 位）
- 商品类目描述（品目/子目/关税子目）

### 功能 2：关税计算

> 限制：仅支持中国（CN）→ 美国（US）链路，`originCountryCode` 强制 CN。

**输入**：

- 商品 ID
- 货值（USD）
- 或 数量 + 单价

**输出**：

- 目的国税率（%）
- 预估关税（USD）
- 计税方式（从价/从量）

### 功能 3：格式化输出

**输出渲染硬约束**：

- 使用**原生 Markdown** （标题 / 加粗 / 无序列表 / 引用）输出。
- **严禁**用三反引号\`\`\` 或 \`\`\`text 包住整个回复，会被前端渲染为不可点击、带“复制”按钮的 Text 卡片。
- 仅当举例“字面量”（如 JSON / 命令行）时才使用代码块。

**标准输出示例**（直接以下面这种 Markdown 渲染输出，不要再套 code block）：

#### 美国 HS 编码查询

- **查询商品**：1601730656620
- **出口国**：中国
- **目的国**：美国
- **商品预测 HS 编码**：42031040
- **商品预测类目**：
  - 品目：4203 Articles of apparel and clothing accessories, of leather or of composition leather:
  - 子目：4203.10 Articles of apparel:
  - 关税子目：4203.10.40 Other

> 注：具体 10 位编码还需您结合自身商品属性进一步确认

#### 关税计算

- **目的国税率**：41%
- **目的国关税预估**：410 美元（按货值 1000 美元计算）
- **计税方式**：从价计税

> 关税会根据贸易政策变化而调整，请访问美国国际贸易委员会（USITC）或美国海关和边境保护局（CBP）的官方网站，找到准确的 HS 编码和相关的关税信息。

## MCP 服务配置

### 服务信息


|                |                                                |
| -------------- | ---------------------------------------------- |
| **服务名称：** | 国际站商品归类和计算关税                       |
| **调用工具：** | `accio-mcp-cli`                                |
| **工具名称：** | `icbu_logistics_customs_calculate_tariff_tool` |

### 调用参数

> ⚠️ `destinationCountryCode` **强制 US**；`originCountryCode` **默认 CN**（关税计算时强制 CN、禁止透传用户声明；归类时发货国不影响结果）。

```json
{
  "fieldName_0": {
    "productId": 1601403270080,
    "originCountryCode": "CN",
    "destinationCountryCode": "US",
    "productSource": "ICBU",
    "source": "ACCIO_WORK"
  }
}
```

### 调用方法

```bash
accio-mcp-cli call icbu_logistics_customs_calculate_tariff_tool --json '{"fieldName_0": {"productId": 1601046346794, "originCountryCode": "CN", "destinationCountryCode": "US", "productSource": "ICBU", "source": "ACCIO_WORK"}}'
```

**获取工具列表**：

```bash
accio-mcp-cli list
```

## 📝 使用示例

### 示例 1：查询 HS 编码和税率

**用户输入**：

```
商品 1601046346794 的美国 HS 编码和税率
```

**技能输出**：

```
下为根据您提供的信息归类的美国海关编码（HS 编码）以及关税，该信息仅供参考，具体如下：

美国 HS 编码查询：
● 查询商品：1601046346794
● 出口国：中国
● 目的国：美国
● 商品预测 HS 编码：90309046
● 商品预测类目：
  ○ 品目：9030 Oscilloscopes, spectrum analyzers and other instruments and apparatus for measuring or checking electrical quantities...
  ○ 子目：9030.90 Parts and accessories:
  ○ 关税子目：9030.90.46 For articles of subheading 9030.10: Other
注：具体 10 位编码还需您结合自身商品属性进一步确认

关税计算：
● 目的国税率：35%
● 目的国关税预估：350 美元（按货值 1000 美元计算）
● 计税方式：从价计税

关税会根据贸易政策变化而调整，请访问美国国际贸易委员会（USITC）或美国海关和边境保护局（CBP）的官方网站，找到准确的 HS 编码和相关的关税信息。
```

### 示例 2：查询清关税费（数量）

**用户输入**：

```
商品 1601046346794 采购 20 件，清关税费多少
```

**技能处理**：

1. 提取商品 ID：`1601046346794`
2. 提取数量：`20 件`
3. 货值默认按1000usd处理
4. 调用 MCP 服务计算关税

**技能输出**：

```
下为根据您提供的信息归类的美国海关编码（HS 编码）以及关税，该信息仅供参考，具体如下：

美国 HS 编码查询：
● 查询商品：1601046346794
● 出口国：中国
● 目的国：美国
● 商品预测 HS 编码：90309046
● 商品预测类目：
  ○ 品目：9030 ...
  ○ 子目：9030.90 ...
  ○ 关税子目：9030.90.46 ...
注：具体 10 位编码还需您结合自身商品属性进一步确认

关税计算：
● 采购数量：20 件
● 预估货值：1000 美元
● 目的国税率：35%
● 目的国关税预估：350 美元
● 计税方式：从价计税

关税会根据贸易政策变化而调整，请访问美国国际贸易委员会（USITC）或美国海关和边境保护局（CBP）的官方网站，找到准确的 HS 编码和相关的关税信息。
```

### 示例 3：查询清关税费（货值）

**用户输入**：

```
商品 1601046346794 货值 1500usd，清关税费多少
```

**技能处理**：

1. 提取商品 ID：`1601046346794`
2. 提取货值：`1500 USD`
3. 调用 MCP 服务计算关税

**技能输出**：

```
下为根据您提供的信息归类的美国海关编码（HS 编码）以及关税，该信息仅供参考，具体如下：

美国 HS 编码查询：
● 查询商品：1601046346794
● 出口国：中国
● 目的国：美国
● 商品预测 HS 编码：90309046
● 商品预测类目：
  ○ 品目：9030 ...
  ○ 子目：9030.90 ...
  ○ 关税子目：9030.90.46 ...
注：具体 10 位编码还需您结合自身商品属性进一步确认

关税计算：
● 申报货值：1500 美元
● 目的国税率：35%
● 目的国关税预估：525 美元
● 计税方式：从价计税

关税会根据贸易政策变化而调整，请访问美国国际贸易委员会（USITC）或美国海关和边境保护局（CBP）的官方网站，找到准确的 HS 编码和相关的关税信息。
```

### 示例 4：URL 查询

**用户输入**：

```
https://www.alibaba.com/product-detail/Stainless-Steel-Jewelry-Wholesale-Full-Zircon_1601046346794.html?spm=a27aq.27095423.1978240560.1.7837a1a2jadbt 的美国 HS 编码和税率
```

**技能处理**：

1. 从 URL 提取商品 ID：`1601046346794`
2. 调用 MCP 服务查询

**技能输出**：同示例 1

## 🛠️ 实现细节

### 商品 ID 提取

```python
import re

def extract_product_id(text):
   """从文本或 URL 中提取国际站商品 ID（13 位或以上数字）"""
    # 模式 1：直接从 URL 提取（13 位或更多数字）
    url_pattern = r'alibaba\.com/product-detail/.*?_(\d{13,})\.html'
    match = re.search(url_pattern, text)
    if match:
        return match.group(1)
  
    # 模式 2：从文本中提取「商品」后的数字（13 位或更多）
    id_pattern = r'商品 [^\d]*(\d{13,})'
    match = re.search(id_pattern, text)
    if match:
        return match.group(1)
  
    # 模式 3：纯数字（13 位或更多，前后无其他数字）
    pure_id_pattern = r'\b(\d{13,})\b'
    match = re.search(pure_id_pattern, text)
    if match:
        return match.group(1)
  
    return None
```

### 货值提取

```python
def extract_value(text):
    """从文本中提取货值（USD）"""
    # 模式：1500usd, 1500 USD, 1500 美元，货值 1500
    patterns = [
        r'货值 [^\d]*(\d+(?:\.\d+)?)\s*(?:usd|USD|美元)?',
        r'(\d+(?:\.\d+)?)\s*(?:usd|USD|美元)',
        r'\$\s*(\d+(?:\.\d+)?)'
    ]
  
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
  
    return None  # 默认值，后续让用户补充
```

### 数量提取

```python
def extract_quantity(text):
    """从文本中提取采购数量"""
    # 模式：20 件，采购 20 个，20pcs
    patterns = [
        r'采购 [^\d]*(\d+)\s*(?:件 | 个 | pcs|pieces)?',
        r'(\d+)\s*(?:件 | 个 | pcs|pieces)'
    ]
  
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
  
    return None
```

### MCP 服务调用

```python
import subprocess
import json

def call_mcp_tariff_service(product_id):
    """调用国际站商品归类和计算关税 MCP 服务。

    硬约束：originCountryCode 强制 CN、destinationCountryCode 强制 US，
    不接受外部透传发货国 / 目的国参数。
    """

    # 构建 accio-mcp-cli 命令（CN→US 硬锁）
    cmd = [
        'accio-mcp-cli', 'call', 'icbu_logistics_customs_calculate_tariff_tool',
        '--json', json.dumps({
            "fieldName_0": {
                "productId": product_id,
                "originCountryCode": "CN",   # 硬编码，严禁透传用户声明
                "destinationCountryCode": "US",  # 硬编码
                "productSource": "ICBU",
                "source": "ACCIO_WORK"
            }
        })
    ]
  
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            response = json.loads(result.stdout)
            if response.get('success'):
                return response.get('data', {})
            else:
                return {'error': response.get('message', 'Unknown error')}
        else:
            return {'error': result.stderr}
  
    except Exception as e:
        return {'error': str(e)}
```

### 格式化输出

```python
def format_tariff_result(product_id, hs_code_data, tariff_data, value_usd):
    """格式化关税查询结果"""
  
    # 解析 HS 编码层级
    hs_code = hs_code_data.get('hscode', 'N/A')
    description_en = hs_code_data.get('descriptionEn', '')
  
    # 解析品目/子目/关税子目
    description_lines = description_en.split('\n') if description_en else []
    pinmu = ""
    zimu = ""
    guanshui_zimu = ""
  
    for line in description_lines:
        line = line.strip()
        if '品目：' in line:
            pinmu = line.replace('品目：', '').strip()
        elif '子目：' in line:
            zimu = line.replace('子目：', '').strip()
        elif '关税子目：' in line:
            guanshui_zimu = line.replace('关税子目：', '').strip()
  
    # 关税信息
    tariff_rate = tariff_data.get('tariffRate', 0)
    tariff_formula = tariff_data.get('tariffFormula', '从价计税')
    tariff_type = tariff_data.get('tariffCalculateType', 'ByAmount')
  
    # 计算预估关税
    estimated_duty = value_usd * (tariff_rate / 100)
  
    # 使用 Markdown 代码块包裹，确保换行保留
    output = f"""```text
根据您提供的信息归类的美国海关编码（HS 编码）以及关税，该信息仅供参考，具体如下：

美国 HS 编码查询：
● 查询商品：{product_id}
● 出口国：中国
● 目的国：美国
● 商品预测 HS 编码：{hs_code}
● 商品预测类目：
  ○ 品目：{pinmu}
  ○ 子目：{zimu}
  ○ 关税子目：{guanshui_zimu}
注：具体 10 位编码还需您结合自身商品属性进一步确认

关税计算：
● 目的国税率：{tariff_rate}%
● 目的国关税预估：{estimated_duty:.0f} 美元（按货值{value_usd:.0f}美元计算）
● 计税方式：{'从价计税' if tariff_type == 'ByAmount' else '从量计税'}

关税会根据贸易政策变化而调整，请访问美国国际贸易委员会（USITC）或美国海关和边境保护局（CBP）的官方网站，找到准确的 HS 编码和相关的关税信息。
```"""
  
    return output
```

## ⚠️ 输出格式注意事项

如果输出时换行丢失，请在返回前执行：

```python
# 方法 1：替换转义字符
return output.replace('\\n', '\n')

# 方法 2：使用 print 直接输出（绕过 JSON 序列化）
print(output)
return ""
```

## ⚠️ 输出结果注意事项


|                     |                                                                                                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HS 编码准确性：** | 返回结果为 AI 预测，需结合商品属性确认                                                                                                                                                   |
| **关税时效性：**    | 关税会随贸易政策调整，结果仅供参考                                                                                                                                                       |
| **货值默认值：**    | 如用户未提供货值，默认按 1000 USD 计算                                                                                                                                                   |
| **发货国默认值：**  | 归类不受发货国影响；关税计算仅支持**CN→US**，如用户声明非 CN 发货国，需在输出开头**明确声明**本次结果是按「出口国：中国（CN） → 目的国：美国（US）」计算的，不代表实际发货国的真实税率 |
| **错误处理：**      | 如 MCP 服务不可用，提示用户手动查询                                                                                                                                                      |

## 🛡️ 调用前预处理

### 目的国硬锁（归类 + 关税）

> 🔴 `destinationCountryCode` **永远传 `"US"`**，**严禁**传入任何其他国家代码。


| 用户输入场景                             | 处理动作                                   | 输出头部提示                                                                                  |
| ---------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 目的国为 US / 未声明目的国               | 按 US 调用                                 | 无需额外提示                                                                                  |
| 目的国为非 US（意大利/德国/英国/日本等） | **仍按 US 调用**，禁止透传用户声明的目的国 | "⚠️ 本工具仅支持美国（US）归类与关税查询，以下结果为美国 HS 编码及关税，不适用于其他目的国" |

### 发货国硬锁（仅关税计算）

> 此预处理仅影响**关税计算**场景。纯归类查询（仅查 HS 编码、不算税）不受发货国限制。

在提取到商品 ID 后、调用 MCP 之前，必须进行以下预处理：


| 用户输入场景                            | 处理动作                                   | 输出头部提示                                                |
| --------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| 未声明发货国                            | 直接按 CN→US 调用                         | "⚠️ 本次默认按【中国（CN） → 美国（US）】计算"           |
| 声明发货国为 CN                         | 直接按 CN→US 调用                         | 无需额外提示                                                |
| 声明发货国为非 CN（越南/印度/墨西哥等） | **必须仍按 CN→US 调用**，禁止透传用户声明 | "⚠️ 关税计算仅支持 CN→US 链路，本次结果仍按中国出口计算" |

实现要求：`originCountryCode` 始终硬编码 `"CN"`，`destinationCountryCode` 始终硬编码 `"US"`，预处理仅决定输出头部提示文案。

## 🔄 错误处理

### 场景 1：MCP 服务不可用

```
抱歉，关税查询服务暂时不可用（网络访问限制）。

您可以手动查询：
1. 美国 HS 编码：https://hts.usitc.gov
2. 中国海关归类：http://www.customs.gov.cn

或提供更多信息，我帮您分析预估。
```

### 场景 2：商品 ID 无效

```
未找到有效的商品 ID，请检查输入：
- 商品 ID 应为 13 位以上数字（如：1601046346794）
- 或提供完整的阿里巴巴国际站商品 URL

请重新提供商品信息。
```

### 场景 3：货值缺失

```
- 已查询到商品 HS 编码，但是没提供货值，按照1000usd货值做税费估算参考
---
```
