"""
将 MCP `query_product_page_info` 的 JSON 输出转换为「商品全证据表」Markdown。

适用范围：
    只用于 https://www.alibaba.com/product-detail/<id>.html 形态的国际站商品。
    其它平台（1688 / Amazon / 独立站）仍走 probe_image_urls.py + web_fetch 通道。

数据源 → 全证据表字段映射（与 SKILL Step 1.4.5 6 类信息严格对齐）：

| MCP 字段                              | 对应行                                |
|---------------------------------------|---------------------------------------|
| data.title                            | 商品标题（编号 -）                    |
| data.mainImageUrl + data.imageUrls    | 商品主图（编号 1 起、可多张，按 URL 去重保序） |
| data.properties[*]（忽略 imageDTO）    | 商品属性（编号 1 起）                 |
| data.description 剥 HTML              | 商品详情文字（编号 1 起）             |
| data.description <img src>            | 商品详情图片（编号 1 起）             |
| —（MCP 不提供）                       | 商品的买家评论图片 → 写「（无）」     |

已废弃字段（不再产出独立行）：
- 商品轮播图：MCP 不区分"主图/轮播图"，已并入"商品主图"
- 商品 SKU 图 / 商品 SKU 名称：MCP 不提供独立 SKU 图与 SKU 名称，properties[*].imageDTO 一律忽略

说明：本商品评论区 MCP 不返回，因此评论区扫描（SKILL Step 1.6）在 MCP 通道下不执行，
全证据表「商品的买家评论图片」一律填「（无，MCP 通道暂不支持评论区采集）」。

图片编号（改法 A — 防止 see_image 与报告配图 URL 错配）：
    所有图片（商品主图 + 商品详情图片）按 [主图1..n, 详情图1..m] 顺序拼成一个有序数组，
    每张图分配全局唯一编号 IMG-01、IMG-02 …（升序、跨类型连续，不会重复）。
    - 主图/详情图行的「内容」列前缀该图的 `IMG-NN` 编号；
    - 文末「图片证据清单」给出 IMG编号↔URL 对照表 + 可直接照抄的 see_image 输入数组(JSON)。
    用法约定：see_image 严格按此数组顺序原样传入 → 第 k 张即 IMG-0k → 报告配图只引用
    IMG 编号、最后机械还原成 URL，杜绝"人肉回忆 URL"导致的张冠李戴。

用法：
    py -X utf8 scripts/mcp_to_evidence_table.py --json-file <mcp_response.json>
    py -X utf8 scripts/mcp_to_evidence_table.py --stdin < mcp_response.json
"""

import argparse
import json
import re
import sys
from pathlib import Path

# Windows 控制台 UTF-8
try:
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
except Exception:
    pass


def normalize_img_url(u: str) -> str:
    """把 `//sc04.alicdn.com/...` 这种协议相对 URL 补成 https://；保留绝对 URL 原样。"""
    if not u:
        return u
    u = u.strip()
    if u.startswith("//"):
        return "https:" + u
    return u


def extract_text_from_description_html(html: str) -> list[str]:
    """
    把 description 的 HTML 剥成"文字段"列表。
    切分规则：先按 <p> / <div> / <br> / </tr> / </td> 这些常见分段点切，
    再合并空行、去多余空白。
    """
    if not html:
        return []
    s = html
    # 去 style / script
    s = re.sub(r"<style[^>]*>.*?</style>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<script[^>]*>.*?</script>", " ", s, flags=re.S | re.I)
    # 段落级分隔点 → 换行
    s = re.sub(r"</(p|div|tr|li|h[1-6])>", "\n", s, flags=re.I)
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</td>", " | ", s, flags=re.I)  # 表格列用 | 隔开
    # 剥其余 tag
    s = re.sub(r"<[^>]+>", " ", s)
    # HTML 实体最常见几个
    s = s.replace("&amp;", "&").replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').replace("&#39;", "'")
    # 按行整理
    lines = []
    for raw in s.split("\n"):
        cleaned = re.sub(r"\s+", " ", raw).strip(" |").strip()
        if cleaned and cleaned != "|":
            lines.append(cleaned)
    return lines


def extract_images_from_description_html(html: str) -> list[str]:
    """从 description HTML 中按出现顺序抽 <img src>，去重保留首次顺序，补协议。"""
    if not html:
        return []
    raw_imgs = re.findall(r"<img[^>]+src=\"([^\"]+)\"", html, flags=re.I)
    seen: set[str] = set()
    out: list[str] = []
    for u in raw_imgs:
        nu = normalize_img_url(u)
        if nu in seen:
            continue
        seen.add(nu)
        out.append(nu)
    return out


def safe_text(node: dict | None) -> str:
    """从 propertyText / valueText 这类结构里取 defaultText（真实文本）。"""
    if not node or not isinstance(node, dict):
        return ""
    return (node.get("defaultText") or "").strip()


def build_evidence_table(mcp_response: dict) -> str:
    """主入口：MCP 顶层 JSON → 全证据表 Markdown 字符串。

    成功判定（兼容两种顶层契约）：
      - 新契约：{"success": true, "errorCode": null, "data": {...}}（无 code 字段）
      - 旧契约：{"code": 200, "data": {...}}
    只要 success == true 或 code == 200，且 data 非空，即视为成功。
    """
    ok = (mcp_response.get("success") is True) or (mcp_response.get("code") == 200)
    data = mcp_response.get("data")
    if not ok or not isinstance(data, dict) or not data:
        return "**ERROR**: MCP 调用未成功或缺 data 字段。原始返回：\n```\n" + json.dumps(mcp_response, ensure_ascii=False, indent=2)[:1000] + "\n```"

    title = (data.get("title") or "").strip()
    main_image = normalize_img_url(data.get("mainImageUrl") or "")
    image_urls = [normalize_img_url(u) for u in (data.get("imageUrls") or []) if u]
    properties = data.get("properties") or []
    description_html = data.get("description") or ""
    product_id = data.get("productId")

    # ---------- 商品主图：mainImageUrl + imageUrls 合并去重保序 ----------
    # MCP 不区分"主图/轮播图"，统一作为"商品主图"，编号 1 起、可多张
    all_main_images: list[str] = []
    seen_main: set[str] = set()
    for u in ([main_image] if main_image else []) + image_urls:
        if u and u not in seen_main:
            seen_main.add(u)
            all_main_images.append(u)

    # ---------- 商品属性：properties[*] 全部进属性行（imageDTO 一律忽略） ----------
    attrs: list[tuple[str, str]] = []
    for p in properties:
        pn = safe_text(p.get("propertyText"))
        vn = safe_text(p.get("valueText"))
        if not pn and not vn:
            continue
        attrs.append((pn, vn))

    # ---------- 详情文字 / 详情图 ----------
    desc_lines = extract_text_from_description_html(description_html)
    desc_images = extract_images_from_description_html(description_html)

    # ---------- 全局图片证据清单（改法 A 核心：唯一锚点 IMG-NN） ----------
    # 把"商品主图"+"商品详情图片"按 [主图…, 详情图…] 顺序拼成一个有序数组，
    # 每张图分配一个全局唯一编号 IMG-01、IMG-02 …（升序、跨类型连续）。
    # 这个有序数组就是 see_image 必须照抄的输入顺序，也是报告里 ![desc](IMG-NN) 的唯一来源。
    img_manifest: list[tuple[str, str, str]] = []  # (IMG编号, 分类标签, URL)
    _img_seq = 0
    for j, u in enumerate(all_main_images, start=1):
        _img_seq += 1
        img_manifest.append((f"IMG-{_img_seq:02d}", f"主图{j}", u))
    for j, u in enumerate(desc_images, start=1):
        _img_seq += 1
        img_manifest.append((f"IMG-{_img_seq:02d}", f"详情图{j}", u))
    # URL → IMG编号 反查表
    url_to_imgid: dict[str, str] = {u: imgid for imgid, _label, u in img_manifest}

    # ---------- 拼 Markdown ----------
    rows: list[tuple[str, str, str]] = []  # (信息类型, 编号, 内容)

    rows.append(("商品标题", "-", title or "（无）"))

    if all_main_images:
        for i, u in enumerate(all_main_images, start=1):
            imgid = url_to_imgid.get(u, "")
            cell = f"`{imgid}` {u}" if imgid else u
            rows.append(("商品主图", str(i), cell))
    else:
        rows.append(("商品主图", "-", "（无）"))

    if attrs:
        for i, (pn, vn) in enumerate(attrs, start=1):
            rows.append(("商品属性", str(i), f"attribute:{pn}, value:{vn}"))
    else:
        rows.append(("商品属性", "-", "（无）"))

    if desc_lines:
        for i, line in enumerate(desc_lines, start=1):
            rows.append(("商品详情文字", str(i), line))
    else:
        rows.append(("商品详情文字", "-", "（无）"))

    if desc_images:
        for i, u in enumerate(desc_images, start=1):
            imgid = url_to_imgid.get(u, "")
            cell = f"`{imgid}` {u}" if imgid else u
            rows.append(("商品详情图片", str(i), cell))
    else:
        rows.append(("商品详情图片", "-", "（无）"))

    # 评论区图：MCP 不返回
    rows.append(("商品的买家评论图片", "-", "（无，MCP 通道暂不支持评论区采集；如需评论区扫描，请改用 probe_image_urls.py）"))

    out: list[str] = []
    out.append(f"# 商品全证据表（productId={product_id}，来源：MCP query_product_page_info）")
    out.append("")
    out.append("| 信息类型 | 编号 | 内容 |")
    out.append("|---|---|---|")
    for t, n, c in rows:
        c_escaped = c.replace("|", "\\|").replace("\n", " ")
        if len(c_escaped) > 800:
            c_escaped = c_escaped[:800] + " …(truncated)"
        out.append(f"| {t} | {n} | {c_escaped} |")
    out.append("")

    # 统计摘要
    summary = {
        "商品标题": 1 if title else 0,
        "商品主图": len(all_main_images),
        "商品属性": len(attrs),
        "商品详情文字": len(desc_lines),
        "商品详情图片": len(desc_images),
        "商品的买家评论图片": 0,
    }
    out.append("## 采集摘要")
    out.append("")
    out.append("| 信息类型 | 行数 |")
    out.append("|---|---|")
    for k, v in summary.items():
        out.append(f"| {k} | {v} |")
    out.append("")
    out.append("> ⚠️ MCP 通道不返回评论区数据。如需买家评论图扫描，请改用 probe_image_urls.py 走原通道。")

    # ---------- 图片证据清单（改法 A：see_image 输入顺序 = IMG 编号顺序） ----------
    out.append("")
    out.append("## 图片证据清单（see_image 必须按此顺序、原样传入；报告配图只能引用 IMG 编号）")
    out.append("")
    if img_manifest:
        out.append("| IMG 编号 | 分类 | URL |")
        out.append("|---|---|---|")
        for imgid, label, u in img_manifest:
            out.append(f"| `{imgid}` | {label} | {u} |")
        out.append("")
        out.append("### see_image 输入数组（复制下面整段 URL 列表，顺序不得改动、不得增删）")
        out.append("")
        out.append("```json")
        out.append(json.dumps([u for _id, _lb, u in img_manifest], ensure_ascii=False, indent=2))
        out.append("```")
        out.append("")
        out.append(
            "> 🔒 规则（改法 A）：see_image 的输入顺序 == 本清单 IMG 编号顺序。"
            "第 k 张传入的图就是 IMG-0k，看图描述必须带上对应 IMG 编号。"
            "写报告时配图先写 `![描述](IMG-NN)` 占位，最后用 IMG→URL 映射机械还原，"
            "**严禁凭记忆手敲 URL**。"
        )
    else:
        out.append("（本商品无可用图片 URL）")
    out.append("")
    return "\n".join(out)


def main() -> None:
    ap = argparse.ArgumentParser(description="MCP query_product_page_info → 全证据表 Markdown")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--json-file", help="MCP 返回 JSON 文件路径")
    src.add_argument("--stdin", action="store_true", help="从 stdin 读 JSON")
    args = ap.parse_args()

    if args.json_file:
        text = Path(args.json_file).read_text(encoding="utf-8")
    else:
        text = sys.stdin.read()

    try:
        mcp = json.loads(text)
    except json.JSONDecodeError as e:
        print(f"**ERROR**: 输入不是合法 JSON：{e}", file=sys.stderr)
        sys.exit(2)

    print(build_evidence_table(mcp))


if __name__ == "__main__":
    main()
