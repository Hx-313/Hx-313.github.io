---
name: alibaba-global-knowledge-base
description: >-
  Alibaba.com GGS (Global Golden Supplier) seller knowledge base fallback Skill (exported from Yuque ggs-seller-kb v2.1.1, 199 articles).
  Use when sellers inquire about platform rules, product features, or operation guides related to Alibaba.com,
  and no other specialized Skill (e.g. store-diagnosis, product-auto-optimizer) matches;
  locate documents via `main-index.md` / `subcategory-index.md` using read_skill_file, then read the corresponding .md under `references/` for full content.
  This library only covers GGS-related content. Not applicable to CGS (China Gold Supplier), non-Alibaba.com scenarios,
  or scenarios requiring real-time data queries (e.g. live orders, Page Views, etc.).
  Skip for:
  - Store operation diagnosis (Page Views / buyer opportunities / Star rating analysis) → store-diagnosis and other specialized Skills
  - Fully automated product optimization toggles → product-auto-optimizer and other specialized Skills
  - Real-time business metrics requiring database queries → data query tools
  - Execution requests such as editing or posting products → corresponding operation tools
  - General questions unrelated to Alibaba.com → general conversation

trigger_keywords:
  - GGS
  - 国际站
  - Alibaba.com
  - 商家知识库
  - 平台规则
  - 合规
  - 禁限售
  - 限售规则
  - 禁售规则
  - 会员权益
  - 营销推广
  - 物流发货
  - 星等级
  - 直通车
  - 橱窗
  - RFQ
  - 信保
  - Trade Assurance
  - 订单
  - 付款
  - 拒付
  - 纠纷
  - 生意助手
  - Smart Assistant
  - 商品发布
  - 发品
  - RTS
  - 询盘
  - 诊断
  - 批量编辑
  - 资金管理
  - 金品
  - GS
  - TS
  - 会广通
  - 认证
  - BV认证
  - 证书
  - EPR
  - FDA
  - P4P
  - 买家分层
  - 店铺装修
enabled: true
metadata:
  author: ggs-team
  version: "2.1.1"
  knowledge_count: 199
  last_knowledge_update: "2026-04-13"
  source: 语雀知识库导出（ggs-seller-kb）
  coverage: GGS 商家（非 CGS）
---

# GGS 商家知识库（knowledge-base）

本目录为 **ggs-seller-kb v2.1.1** 内容，共 **199** 篇知识文档，作为平台 Agent 的 **GGS 业务知识兜底**。

## When to Use

| 场景 | 说明 |
|------|------|
| GGS 商家咨询平台规则 | 禁限售、合规处罚、知识产权等 |
| 查询产品功能说明 | 直通车、橱窗、RFQ、信保、生意助手等 |
| 了解操作流程 | 商品发布、物流、营销推广等 |
| 会员与权益 | 会员等级差异、星等级等 |

## When NOT to Use

| 场景 | 应使用的工具 |
|------|------------|
| CGS（中国供应商）相关问题 | CGS 知识库 |
| 店铺全面诊断、实时经营数据 | 店铺诊断 Skill / 数据查询工具 |
| 修改商品、发布商品等操作 | 对应操作工具 |
| 非阿里巴巴国际站问题 | 其他知识库或通用搜索 |

## How to Use

0. **确保 references 就绪（必须先执行，不可跳过）**：
   使用 bash 工具执行本 skill 目录下的 Python 脚本：
   ```
   python3 <SKILL_DIR>/scripts/ensure-references.py
   ```
   - 输出以 `OK:` 开头 → references 已就绪，继续步骤 1。
   - 输出包含 `ERROR` → 知识库文件暂时不可用，告知用户"知识库资源加载失败，请稍后重试"，终止后续步骤。
   - 首次执行会从远程下载（约 1MB），后续执行会直接跳过，无额外耗时。

1. 先读 **`main-index.md`**，按 P0→P1→P2→P3 与主题定位候选文档；细节清单见 **`subcategory-index.md`**。
2. 在 **`references/`** 下按索引中的**文件名**打开对应 `.md` 获取全文。
3. **P0（合规红线）** 优先级最高；涉及禁限售、处罚等问题必须引用文档内容，不可凭空虚构。
4. 使用 `read_skill_file` 时路径相对于 skills 根目录，例如：`knowledge-base/references/xxx.md`。

## 核心规则（不可跳过）

1. **区域与商家类型**：知识文档若含「适配区域」「商家类型」等字段，回答前须与当前商家一致；不匹配则不得当作依据，并建议联系客服确认区域规则。
2. **知识层级**：P0 > P1 > P2 > P3；同一主题多篇文档时优先高层级。
3. **不编造**：库内无相关内容时，明确告知暂无信息并建议联系客服，勿臆测。
4. **语言**：尽量与用户语言一致；有中英文版本时选匹配语言。
5. **P0 合规**：禁限售、处罚等须忠实引用原文要点，避免过度意译导致误导。
6. **兜底提示（必须执行）**：每次基于本知识库回答后，必须在回复末尾附加以下提示（根据用户语言选择中文或英文版本）：
   - 中文：`以上内容仅供参考，如有更多疑问请咨询官方客服：https://buyer.alimebot.alibaba.com/intl/index.htm?spm=a27gk.ggs-index.0.0.84e6zzcrzzcrmt&from=Iho9WsAIe0`
   - English：`The above information is for reference only. For further questions, please contact official customer service: https://buyer.alimebot.alibaba.com/intl/index.htm?spm=a27gk.ggs-index.0.0.84e6zzcrzzcrmt&from=Iho9WsAIe0`

## 文档分层

- **P0 - 合规红线**：禁限售、违规处罚、知识产权等
- **P1 - 产品功能与平台规则**：功能说明、业务流程、平台规则
- **P2 - 操作指南与 FAQ**：步骤说明、常见问题
- **P3 - 参考资料**：行业报告、案例等

## References

- 主索引 → `main-index.md`
- 完整清单 → `subcategory-index.md`
- 正文 → `references/*.md`
