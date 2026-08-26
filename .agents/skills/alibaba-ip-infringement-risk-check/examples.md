# 示例集（examples.md）

> 本文件集中存放 `SKILL.md` 中引用的全部示例。SKILL.md 正文只保留规则，遇到「示例见 examples.md §X」时来此查阅对应小节。
> 所有示例**仅作格式与写法参考**，实际报告必须基于当次真实采集到的证据生成，不得照抄示例内容。

---

## §1 全证据表（内部表格）示例

对应 SKILL.md 「Step 1.4.5 — 构建商品全证据表」。下表在思考过程里维护、不输出给用户；用 markdown 表格存储以便引用：

```markdown
| 信息类型 | 编号 | 内容 |
|---|---|---|
| 商品标题 | - | Wireless Earbuds Bluetooth 5.3 Headphones with Noise Cancellation |
| 商品主图 | 1 | https://sc04.alicdn.com/kf/Habc.jpg_640x640.jpg |
| 商品主图 | 2 | https://sc04.alicdn.com/kf/Hbcd.jpg_640x640.jpg |
| 商品主图 | 3 | https://sc04.alicdn.com/kf/Hcde.jpg_640x640.jpg |
| 商品属性 | 1 | attribute:Brand Name, value:OEM |
| 商品属性 | 2 | attribute:Model Number, value:TWS-X1 |
| 商品详情文字 | 1 | IPX5 waterproof, 30h playtime |
| 商品详情图片 | 1 | https://sc04.alicdn.com/kf/Hdesc1.jpg |
| 商品的买家评论图片 | 1 | https://sc04.alicdn.com/kf/Hreview1.jpg |
```

---

## §2 商品基本信息（报告第一部分）示例

对应 SKILL.md 输出模板「## 一、商品基本信息」。要求：中文一段话、≤150 字符、无表格 / 列表 / 分行，品牌名 / 型号 / 规格可保留英文原文。

> 这是一款来自法国 XORUS 品牌的路亚硬饵 ASTURIE 110，规格 110mm / 15g，floating topwater pencil lure 类型，配 Decoy TS 21 三本钩，主打远投与 walk-the-dog 走水动作，提供 30+ 仿生鱼配色，适用于海鲈、狗鱼、河鲈等掠食性鱼种。售价 €28.90 起，主要面向欧洲淡海水路亚市场。

---

## §3 第 4 列「侵权合规建议」填写示例

对应 SKILL.md「第 4 列「侵权合规建议」填写规范」。

### A. 移除型（适用于：图片侵权、暗示售假关键词、无法替换的品牌词等）

句式：`移除：<具体对象>`

- `移除：商品主图中的 Nike 对勾 Logo，改用自有品牌或无 Logo 实拍图`
- `移除：商品标题与商品详情文字中所有 1:1 / replica / aaa 字样`
- `移除：商品详情图片中皮卡丘形象，替换为本商品功能性场景图`

### B. 调整型（适用于：文字商标可替换为通用词、配件句式不合规等）

句式：`调整为：<推荐写法>`（推荐内容须满足"不含品牌名 / 变形词、不含 D2 暗示售假词、保留功能性参数"三条硬性要求）

- `调整为：Stickbait 130mm 26g Floating Topwater Pencil Lure with Treble Hooks`（替换原 `Asturie Lures`）
- `调整为：Battery for Canon Camera, 1800mAh Rechargeable`（替换原 `canon battery`）
- `调整为：Compatible with Apple MacBook, Type-C Charging Adapter 65W`（替换原 `Apple MacBook charger`）

---

## §4 命中表示例（仅作格式参考，实际报告只列当次真正命中的行）

对应 SKILL.md 输出模板「## 二、侵权风险判定」的命中表。表格固定四列：风险等级 / 侵权内容 / 侵权品牌 / 侵权合规建议。

| 风险等级 | 侵权内容 | 侵权品牌 | 侵权合规建议 |
|---|---|---|---|
| 🔴 高风险 | **位置**：商品标题<br>**依据**：`...Stickbait Asturies Wobbler Topwater Asturie Lures for...` | Asturie | 调整为：`Stickbait 130mm 26g Floating Topwater Pencil Lure with Treble Hooks` |
| 🔴 高风险 | **位置**：商品详情文字<br>**依据**：`...similar action to Patchinko 125 walking style...`<br>`...inspired by Patchinko series for...`（此处仅展示 2 处，另有 1 处同类命中） | Patchinko | 移除：商品详情文字中所有 Patchinko 字样及"similar action / inspired by"类暗示性表达，调整为：`Z-path walking action stickbait, suitable for sea bass and bonito` |
| 🟡 中风险 | **位置**：商品标题<br>**依据**：`...sport shoes nik air running for men women...` | nik / niike（疑似蹭 Nike） | 调整为：`Men Women Lightweight Running Sport Shoes, Breathable Mesh Upper` |
| 🟡 中风险 | **位置**：商品详情文字<br>**依据**：`...compatible with Apple MacBook Pro M3 chip...` | Apple（卖电脑配件） | 调整为：`Compatible with MacBook Pro 14/16 inch (2023+ models), 65W Type-C Adapter` |
| 🟡 中风险 | **位置**：商品主图<br>**依据**：![](https://s.alicdn.com/@sc04/kf/Hxxx1.jpg)<br>![](https://s.alicdn.com/@sc04/kf/Hxxx2.jpg) | JOF Logo | 移除：主图中所有 JOF 字标 / 图形 Logo，替换为自有品牌 Logo 或纯商品白底图 |
| 🟡 中风险 | **位置**：商品主图<br>**依据**：![](https://s.alicdn.com/@sc04/kf/Hyyy1.jpg)<br>![](https://s.alicdn.com/@sc04/kf/Hyyy2.jpg)（此处仅展示 2 处，另有 1 张同类依据图） | AJ1 鞋型 | 移除：所有 AJ1 鞋型轮廓与配色组合，调整为：原创鞋款实拍，鞋型不得复用 AJ1 立体商标特征 |
| 🟡 中风险 | **位置**：商品详情图片<br>**依据**：![](https://s.alicdn.com/@sc04/kf/Hzzz1.jpg) | Pokemon 皮卡丘 | 移除：商品详情图片中皮卡丘形象，替换为本商品功能性场景图或纯产品图 |
| 🟡 中风险 | **位置**：商品主图<br>**依据**：![](https://s.alicdn.com/@sc04/kf/Haaa1.jpg) | Apple AirPods 外观 | 移除：与 AirPods 外观高度近似的产品图，调整为原创外观设计实拍 |
| 🟡 中风险 | **位置**：商品主图<br>**依据**：![](https://s.alicdn.com/@sc04/kf/Hbbb1.jpg) | 涂抹商标手法（遮 Chanel） | 移除：所有含遮挡 / 涂抹 / 马赛克处理的商标图，整张主图重拍 |
| 🟡 中风险 | **位置**：商品标题 / 商品详情文字<br>**依据**：`...high quality 1:1 replica luxury bag aaa grade...` | `1:1` / `replica` / `aaa` 等暗示售假词 | 移除：所有 1:1 / replica / aaa / mirror / clone / dupe 类关键词，调整为：`Premium PU Leather Handbag, Original Design` |
| 🟡 中风险 | **位置**：商品标题<br>**依据**：`...rechargeable canon battery 1800mAh for camera...` | `canon battery`（配件句式违规） | 调整为：`Rechargeable Battery 1800mAh for Canon Camera, Replacement for LP-E6` |

---

## §5 行动总结（报告第三部分）示例

对应 SKILL.md 输出模板「## 三、行动总结」。要求：一段话、≤250 字、用承接词串起动作、高风险动作前置。

示例（基于命中 Asturie / Patchinko / JOF Logo / D2 暗示售假等情形）：

> 建议先把商品标题与商品详情文字中所有 Asturie / Patchinko 字样及"similar action / inspired by"类暗示性表达全部移除，标题统一调整为 `130mm 26g Floating Topwater Pencil Lure, Z-Path Walking Stickbait with Treble Hooks`；接着替换商品主图中所有 JOF Logo 与含遮挡 / 涂抹 / 马赛克手法的商标图，重新拍摄自有品牌实拍图，包装与吊牌不得出现任何已命中品牌字样；同时把商品详情文字中 `1:1` / `replica` / `aaa` 等暗示售假关键词全部删除，并把售价调整到与实际成本匹配的合理区间；修改完成后请重新跑一次本检测确认 0 命中，再行上架。
