"""
品牌黑名单匹配引擎（v2 — 字符级多层匹配）。

用法：
    py match_brands.py                # 从 stdin 读取要检测的文本，输出 JSON
    py match_brands.py --text "..."   # 直接传入文本
    py match_brands.py --file path    # 从文件读取
    py match_brands.py --no-fuzzy     # 关闭模糊匹配层（仅做精确+规范化匹配）
    py match_brands.py --fuzzy-threshold 88  # 调整模糊匹配阈值（默认 90）

输出 JSON 结构（v2 增加 match_method 字段）：
{
  "input_length": 1234,
  "blacklist_size": 877,
  "hit_count": 2,
  "hits": [
    {
      "brand_name": "Hermes",
      "matched_substring": "Hermès",        # 原文中实际命中的子串（保留原始大小写/重音）
      "match_method": "exact_normalized",   # exact / exact_normalized / alias / fuzzy
      "match_score": 100,                   # 100 = 精确，<100 = 模糊匹配相似度
      "context": "...inspired by Hermès Birkin...",
      "rights_owner": "...",
      "complaint_email": "...",
      "rights_type": "...",
      "rights_name": "...",
      "rights_id": "...",
      "category": "FUN",
      "risk_level": "S",
      "brand_id": "SC_B_xxx"
    }
  ]
}

匹配策略（按优先级排列，命中后续层次的命中不会覆盖前面已命中的品牌）：

L1 — 精确匹配（exact）
  - 大小写不敏感、词边界严格
  - 短英文品牌（≤3 字符）+ 全大写如 "3M" / "AC" / "BMW" 要求原文也是大写
  - 标点宽容：连字符 / 点号 / 空格归一化（"Louis-Vuitton" 匹配 "Louis Vuitton"）

L2 — Unicode 规范化匹配（exact_normalized）
  - 用 unicodedata NFKD 折叠重音字符：Hermès → Hermes、Café → Cafe、Müller → Muller
  - 全角字符折半角：ＮＩＫＥ → NIKE
  - 解决 "Hermes 在原文写成 Hermès" 这种字符变体导致的漏报

L3 — 别名展开匹配（alias）
  - 通过 brand_aliases.csv 把已知变体注册为黑名单的"虚拟条目"
  - 用于约定俗成的简写 / 别名（LV → Louis Vuitton、Birkin → Hermes）

L4 — 模糊字符匹配（fuzzy，可选）
  - 使用 RapidFuzz 的 token_sort_ratio + partial_ratio 双指标
  - 仅对 ≥4 字符的英文品牌启用，避免短词误报
  - 默认阈值 90（满分 100），可命令行调整
  - 解决拼写错误 / 故意变形：Adidos→Adidas、Loius Vuitton→Louis Vuitton、Niike→Nike
  - 如未安装 rapidfuzz 自动跳过（不会让 skill 失败）

为什么不用 embedding 向量匹配：
  - 品牌侵权检测追求"字符精确性"而非"语义相似性"
  - 短专名（1-2 词）在 embedding 空间里语义信号极弱，且会把 Nike/Puma/Adidas 这类同类目品牌
    错误地判为高相似（它们语义近，但绝不能算互相侵权）
  - embedding 引入网络/模型依赖，与本 skill 的"零外部依赖、本地秒级出结果"原则冲突
  - 上下文/语义判断已由 SKILL.md 第 4 步 LLM 人工扫描承担，技术栈不应重叠
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
import unicodedata
from pathlib import Path

# Windows 默认 stdout 编码为 GBK，会导致输出含中文时下游解码失败 — 强制改 UTF-8
try:
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
except Exception:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ASSETS_CSV = Path(__file__).parent.parent / "assets" / "brand_blacklist.csv"
ALIAS_CSV = Path(__file__).parent.parent / "assets" / "brand_aliases.csv"

# 用于判断"是否含中文"
CJK_RE = re.compile(r"[\u4e00-\u9fff]")
# 标点归一化：连字符 / 下划线 / 点 / 多空格 → 单空格
PUNCT_NORMALIZE = re.compile(r"[\-_./·、，,]+")
MULTI_SPACE = re.compile(r"\s+")
# 提取候选英文 token（用于模糊匹配）
TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z'\-]{2,}")
# 提取英文短语（最长 4 个 token，作为模糊匹配候选窗口）
PHRASE_LEN_MAX = 4

# 模糊匹配默认阈值（0-100）
DEFAULT_FUZZY_THRESHOLD = 90
# 模糊匹配最小品牌长度（避免短词误报）
FUZZY_MIN_BRAND_LEN = 4


# ---------- L1 / L2 字符规范化 ----------

def fold_unicode(s: str) -> str:
    """
    Unicode 折叠：
    - NFKD 分解（重音字符 é → e + ◌́）
    - 去除组合标记（重音符号本身）
    - 全角转半角
    示例：'Hermès' → 'Hermes'，'Ｎｉｋｅ' → 'Nike'
    """
    # NFKC 处理全角→半角等兼容字符
    s = unicodedata.normalize("NFKC", s)
    # NFKD 分解出重音并去掉组合记号
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s


def normalize_loose(s: str) -> str:
    """宽松归一化：Unicode 折叠 + 标点归一 + 合并空格 + 转小写。用于跨形态对比。"""
    s = fold_unicode(s)
    s = PUNCT_NORMALIZE.sub(" ", s)
    s = MULTI_SPACE.sub(" ", s)
    return s.strip().lower()


# ---------- 数据加载 ----------

def load_blacklist(csv_path: Path) -> list[dict]:
    with csv_path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def load_aliases(alias_path: Path) -> dict[str, str]:
    """读取别名表 → {alias: canonical_brand_name}"""
    if not alias_path.exists():
        return {}
    out = {}
    with alias_path.open(encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            alias = (row.get("alias") or "").strip()
            canonical = (row.get("canonical_brand_name") or "").strip()
            if alias and canonical:
                out[alias] = canonical
    return out


def expand_blacklist_with_aliases(
    blacklist: list[dict], aliases: dict[str, str]
) -> list[dict]:
    """
    把别名作为新的"虚拟品牌条目"加入待扫描列表，权利人/邮箱沿用 canonical 品牌的数据。
    输出条目带 _alias_of 字段标记其原始品牌名。
    """
    by_name = {r["brand_name"].lower(): r for r in blacklist}
    expanded = list(blacklist)
    for alias, canonical in aliases.items():
        canon_row = by_name.get(canonical.lower())
        if not canon_row:
            continue
        if alias.lower() in by_name:
            continue
        new_row = dict(canon_row)
        new_row["brand_name"] = alias
        new_row["_alias_of"] = canon_row["brand_name"]
        expanded.append(new_row)
    return expanded


# ---------- L1 精确匹配（含 L2 Unicode 折叠） ----------

def build_pattern(brand: str) -> tuple[re.Pattern, str]:
    """
    为单个品牌构造正则模式 + 匹配模式标签。
    - 含中文：直接子串匹配
    - 纯英数 + 短(≤3)：要求严格词边界 + 区分大小写（避免 'AC' 误中 'FACTORY'）
    - 纯英数 + 长(≥4)：词边界 + 不区分大小写，且容忍标点（"Louis Vuitton" 匹配 "Louis-Vuitton"）
    """
    if CJK_RE.search(brand):
        return re.compile(re.escape(brand.strip())), "cjk-substring"

    parts = re.split(r"\s+", brand.strip())
    pattern_str = r"[\s\-_./]+".join(re.escape(p) for p in parts)

    is_short = len(brand) <= 3 and len(parts) == 1
    flags = 0 if is_short else re.IGNORECASE

    pattern = re.compile(
        r"(?<![A-Za-z0-9])" + pattern_str + r"(?![A-Za-z0-9])",
        flags,
    )
    label = "short-strict" if is_short else "word-boundary"
    return pattern, label


def search_exact(text: str, brand: str) -> tuple[int, int] | None:
    """L1 精确搜索 → (start, end) 或 None。"""
    try:
        pattern, _ = build_pattern(brand)
    except re.error:
        return None
    m = pattern.search(text)
    return (m.start(), m.end()) if m else None


def search_normalized(
    text: str, text_folded: str, brand: str
) -> tuple[int, int] | None:
    """
    L2 在 Unicode 折叠后的文本上搜索品牌的折叠形式。
    若命中，需要把折叠后的位置反向映射回原始 text 的位置。
    实现思路：在 text_folded 上找到命中位置后，按字符长度比例近似回映射。
    由于 NFKD 可能让一个字符变成多个（如 'é' → 'e' + '́' → 'e'），需精确做位置映射表。
    """
    if CJK_RE.search(brand):
        return None  # 中文品牌已由 L1 处理

    brand_folded = fold_unicode(brand)

    # 仅当文本本身经过折叠产生过变化时才有必要走 L2（否则等同于 L1 重复扫描）
    if text_folded == text and brand_folded == brand:
        return None

    # 在折叠文本上做精确搜索（用品牌的折叠形式）
    hit = search_exact(text_folded, brand_folded)
    if not hit:
        return None

    # 位置反向映射：构建 text → text_folded 的字符索引映射
    # 由于 fold_unicode 内部经过 NFKC + NFKD + 去 combining，长度可能变化
    # 简化策略：逐字符走原文本，每次也对当前位置做 fold，比较累计长度
    fold_start, fold_end = hit
    orig_start = _map_folded_pos_to_orig(text, fold_start)
    orig_end = _map_folded_pos_to_orig(text, fold_end)
    if orig_start is None or orig_end is None or orig_end <= orig_start:
        return None
    return (orig_start, orig_end)


def _map_folded_pos_to_orig(text: str, fold_pos: int) -> int | None:
    """把折叠文本中的位置映射回原文本位置。逐字符累计折叠后长度。"""
    cum = 0
    for i, ch in enumerate(text):
        if cum >= fold_pos:
            return i
        cum += len(fold_unicode(ch))
    if cum >= fold_pos:
        return len(text)
    return None


# ---------- L4 模糊匹配（RapidFuzz） ----------

def _try_import_rapidfuzz():
    """惰性导入 rapidfuzz，未安装则返回 None，让流程优雅降级。"""
    try:
        from rapidfuzz import fuzz, distance  # type: ignore
        return (fuzz, distance)
    except ImportError:
        return None


def search_fuzzy(
    text: str,
    text_folded_lower: str,
    brand: str,
    threshold: int,
    fuzz_module,
) -> tuple[int, int, int] | None:
    """
    L4 模糊匹配：在文本中以滑窗方式扫描所有等长 token 短语，与品牌名做 ratio + token_sort_ratio
    比对，取较高分；同时要求 Damerau-Levenshtein 编辑距离 ≤ 2（变形词侵权的实际上限）。

    返回 (start, end, score) 或 None。
    """
    if fuzz_module is None:
        return None
    if CJK_RE.search(brand):
        return None
    brand_norm = normalize_loose(brand)
    if len(brand_norm.replace(" ", "")) < FUZZY_MIN_BRAND_LEN:
        return None  # 短词不做模糊匹配

    fuzz, distance = fuzz_module
    brand_chars = len(brand_norm.replace(" ", ""))
    # 变形词侵权的真实上限：改 1-2 个字符（增/删/换/邻位互换）
    # 5-7 字符品牌允许改 1 个字符，8 字符以上允许改 2 个字符
    max_edit = 1 if brand_chars < 8 else 2
    # 短品牌（≤ 4 字符，如 Ford/Nike/Puma）容易与英文常用词撞，要求候选 token 长度严格大于品牌长度
    # 这只放行"故意拉长改名"（如 Niike→Nike），屏蔽"短常用词"（如 for→Ford）
    require_longer_phrase = brand_chars <= 4

    # 在原始 text 上抽出英文 token 及其 (start, end)
    tokens = [(m.group(), m.start(), m.end()) for m in TOKEN_RE.finditer(text)]
    if not tokens:
        return None

    brand_token_count = len(brand_norm.split())
    # 单 token 短品牌（长度 < 8）适当放宽分数阈值，但用编辑距离兜住误报
    if brand_token_count == 1 and len(brand_norm) < 8:
        effective_threshold = max(80, threshold - 8)
    else:
        effective_threshold = threshold

    best: tuple[int, int, int] | None = None  # (start, end, score)

    # 严格窗口：等于品牌 token 数（多 token 品牌允许 ±1 容忍漏/多一词）
    if brand_token_count == 1:
        windows = [1]
    else:
        windows = list(range(max(1, brand_token_count - 1), brand_token_count + 1 + 1))
        windows = [w for w in windows if w <= PHRASE_LEN_MAX]

    for window in windows:
        for i in range(len(tokens) - window + 1):
            phrase_tokens = tokens[i : i + window]
            phrase = " ".join(t[0] for t in phrase_tokens)
            phrase_norm = normalize_loose(phrase)

            # 长度差距过大直接跳过（性能 + 降误报）
            if abs(len(phrase_norm) - len(brand_norm)) > max(2, len(brand_norm) // 3):
                continue

            # 短品牌：要求候选词严格更长（屏蔽 for→Ford 这类常用词碰撞）
            if require_longer_phrase and len(phrase_norm.replace(" ", "")) <= brand_chars:
                continue

            score = max(
                fuzz.ratio(phrase_norm, brand_norm),
                fuzz.token_sort_ratio(phrase_norm, brand_norm),
            )
            if score < effective_threshold:
                continue

            # 关键：再用编辑距离把误报兜底（短品牌允许 1 改，长品牌允许 2 改）
            edit_dist = distance.DamerauLevenshtein.distance(phrase_norm, brand_norm)
            if edit_dist > max_edit:
                continue

            start = phrase_tokens[0][1]
            end = phrase_tokens[-1][2]
            if best is None or score > best[2]:
                best = (start, end, int(score))

    return best


# ---------- 主匹配逻辑 ----------

def find_hits(
    text: str,
    blacklist: list[dict],
    *,
    enable_fuzzy: bool = True,
    fuzzy_threshold: int = DEFAULT_FUZZY_THRESHOLD,
) -> list[dict]:
    """
    在文本中查找所有命中的品牌。同一品牌只记录第一次命中位置。
    匹配优先级：L1 精确 > L2 Unicode 规范化 > L3 别名（已合并入 blacklist）> L4 模糊。
    """
    hits: list[dict] = []
    seen_brands: set[str] = set()

    # 预计算文本的折叠形式 / 折叠小写形式
    text_folded = fold_unicode(text)
    text_folded_lower = text_folded.lower()

    # 模糊匹配模块（懒加载）
    fuzz_module = _try_import_rapidfuzz() if enable_fuzzy else None

    # ===== Pass 1：L1 精确 + L2 规范化 + L3 别名 =====
    for row in blacklist:
        brand = row["brand_name"].strip()
        if not brand or brand.lower() in seen_brands:
            continue

        match_method = None
        match_score = 100
        position = None

        # L1 精确
        position = search_exact(text, brand)
        if position:
            match_method = "alias" if row.get("_alias_of") else "exact"

        # L2 Unicode 规范化（仅在 L1 未命中时尝试）
        if not position:
            position = search_normalized(text, text_folded, brand)
            if position:
                match_method = "exact_normalized"

        if not position:
            continue

        seen_brands.add(brand.lower())
        hits.append(_build_hit(text, brand, row, position, match_method, match_score))

    # ===== Pass 2：L4 模糊匹配（仅扫未命中的品牌）=====
    if fuzz_module:
        for row in blacklist:
            brand = row["brand_name"].strip()
            if not brand or brand.lower() in seen_brands:
                continue

            fuzzy_hit = search_fuzzy(text, text_folded_lower, brand, fuzzy_threshold, fuzz_module)
            if not fuzzy_hit:
                continue
            start, end, score = fuzzy_hit
            seen_brands.add(brand.lower())
            hits.append(
                _build_hit(text, brand, row, (start, end), "fuzzy", score)
            )

    # 排序：风险等级 S>A>其他 → 精确 > 模糊 → 字母序
    risk_order = {"S": 0, "A": 1}
    method_order = {"exact": 0, "exact_normalized": 1, "alias": 2, "fuzzy": 3}
    hits.sort(
        key=lambda h: (
            risk_order.get(h["risk_level"], 9),
            method_order.get(h["match_method"], 9),
            h["brand_name"].lower(),
        )
    )
    return hits


def _build_hit(
    text: str,
    brand: str,
    row: dict,
    position: tuple[int, int],
    match_method: str,
    match_score: int,
) -> dict:
    start, end = position
    ctx_start = max(0, start - 30)
    ctx_end = min(len(text), end + 30)
    context = text[ctx_start:ctx_end].replace("\n", " ").strip()
    return {
        "brand_name": brand,
        "matched_substring": text[start:end],
        "match_method": match_method,
        "match_score": match_score,
        "context": context,
        "rights_owner": row.get("rights_owner", ""),
        "complaint_email": row.get("complaint_email", ""),
        "rights_type": row.get("rights_type", ""),
        "rights_name": row.get("rights_name", ""),
        "rights_id": row.get("rights_id", ""),
        "category": row.get("category", ""),
        "risk_level": row.get("risk_level", ""),
        "brand_id": row.get("brand_id", ""),
        "alias_of": row.get("_alias_of", ""),
    }


# ---------- 入口 ----------

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", help="要检测的文本")
    ap.add_argument("--file", help="从文件读取要检测的文本")
    ap.add_argument("--csv", help="自定义黑名单 CSV 路径", default=str(ASSETS_CSV))
    ap.add_argument(
        "--no-fuzzy",
        action="store_true",
        help="关闭 L4 模糊匹配层（仅做精确 + 规范化 + 别名）",
    )
    ap.add_argument(
        "--fuzzy-threshold",
        type=int,
        default=DEFAULT_FUZZY_THRESHOLD,
        help=f"模糊匹配相似度阈值 0-100（默认 {DEFAULT_FUZZY_THRESHOLD}，越高越严）",
    )
    args = ap.parse_args()

    if args.text:
        text = args.text
    elif args.file:
        text = Path(args.file).read_text(encoding="utf-8")
    else:
        text = sys.stdin.read()

    if not text.strip():
        print(json.dumps({"input_length": 0, "hit_count": 0, "hits": []}, ensure_ascii=False))
        return

    blacklist = load_blacklist(Path(args.csv))
    aliases = load_aliases(ALIAS_CSV)
    expanded = expand_blacklist_with_aliases(blacklist, aliases)
    hits = find_hits(
        text,
        expanded,
        enable_fuzzy=not args.no_fuzzy,
        fuzzy_threshold=args.fuzzy_threshold,
    )

    fuzz_available = _try_import_rapidfuzz() is not None
    result = {
        "input_length": len(text),
        "blacklist_size": len(blacklist),
        "alias_count": len(aliases),
        "fuzzy_enabled": (not args.no_fuzzy) and fuzz_available,
        "fuzzy_threshold": args.fuzzy_threshold,
        "hit_count": len(hits),
        "hits": hits,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
