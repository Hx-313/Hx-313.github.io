"""端到端冒烟测试。运行: py _smoke_test.py"""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

THIS = Path(__file__).parent
MATCHER = THIS / "match_brands.py"

TESTS = [
    # ───── L1 精确匹配 + L3 别名 ─────
    {
        "name": "1. 高侵权文案（含别名）",
        "text": (
            "Wholesale Replica Designer Handbag, LV Monogram Style, Premium Leather, "
            "Inspired by Hermes Birkin, Color: Tiffany Blue / Burberry Plaid, "
            "Comes with original Chanel-style box. Also: Adidas Yeezy boost 350, "
            "Nike Air Jordan 1, Rolex Submariner watch, AirPods Pro clone."
        ),
        "expect_min_hits": 8,
        "must_hit_brands": ["LV", "Hermes", "Burberry", "Chanel", "adidas", "Nike", "Rolex"],
    },
    {
        "name": "2. 干净文案 - 不应误伤",
        "text": (
            "Pineapple flavored snack with FACTORY-direct pricing, "
            "machinery for AC repair shop, designed for casual everyday wear."
        ),
        "expect_max_hits": 0,
    },
    {
        "name": "3. 短英文标题（仅一个品牌）",
        "text": "Premium NIKE running shoes for men, size 42, mesh upper",
        "expect_min_hits": 1,
        "must_hit_brands": ["Nike"],
    },
    {
        "name": "4. 中文文案",
        "text": "高仿 LV 老花包，迪奥风格手提包，香奈儿同款",
        "expect_min_hits": 1,
        "must_hit_brands": ["LV"],
    },
    {
        "name": "5. 标点变形（连字符/点号）",
        "text": "Louis-Vuitton style wallet, brand new, AAA quality",
        "expect_min_hits": 1,
        "must_hit_brands": ["Louis Vuitton"],
    },

    # ───── L2 Unicode 折叠（重音/全角） ─────
    {
        "name": "6. L2 重音折叠：Hermès → Hermes",
        "text": "Authentic Hermès silk scarf, brand new with box",
        "expect_min_hits": 1,
        "must_hit_brands": ["Hermes"],
    },
    {
        "name": "7. L2 全角折叠：ＮＩＫＥ → Nike",
        "text": "Wholesale ＮＩＫＥ sportswear factory direct",
        "expect_min_hits": 1,
        "must_hit_brands": ["Nike"],
    },

    # ───── L4 Fuzzy 模糊匹配（变形词） ─────
    {
        "name": "8. L4 多 token 变形：Loius Vuitton → Louis Vuitton",
        "text": "Premium Loius Vuitton inspired handbag, women's tote",
        "expect_min_hits": 1,
        "must_hit_brands": ["Louis Vuitton"],
    },
    {
        "name": "9. L4 单 token 变形：Adidos → adidas",
        "text": "Wholesale Adidos sneakers men size 42, factory price",
        "expect_min_hits": 1,
        "must_hit_brands": ["adidas"],
    },
    {
        "name": "10. L4 短品牌拉长变形：Niike → Nike",
        "text": "Premium Niike running shoes for men, mesh upper, breathable",
        "expect_min_hits": 1,
        "must_hit_brands": ["Nike"],
    },

    # ───── L4 误报回归（绝不应命中） ─────
    {
        "name": "11. L4 误报回归：常用英文短词不撞短品牌",
        "text": (
            "Suitable for men women, made for export, please contact for details, "
            "ready for shipment from China"
        ),
        "expect_max_hits": 0,
    },
    {
        "name": "12. L4 误报回归：化工类无关词不撞 Viton",
        "text": "Genuine leather goods made by skilled craftsmen with vintage style",
        "expect_max_hits": 0,
    },
    {
        "name": "13. L4 误报回归：编辑距离过大不命中",
        "text": "Premium Adios shoes for marathon runners",  # Adios vs adidas 距离=2，但 ratio 偏低
        "expect_max_hits": 0,
    },
]

def run_match(text: str) -> dict:
    # 用临时文件传递文本，避免 Windows 命令行编码问题
    tmp = tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", suffix=".txt", delete=False
    )
    tmp.write(text)
    tmp.close()
    try:
        p = subprocess.run(
            [sys.executable, str(MATCHER), "--file", tmp.name],
            capture_output=True,  # 二进制读取
        )
        if p.returncode != 0:
            err = p.stderr.decode("utf-8", errors="replace")
            raise RuntimeError(f"matcher failed: {err}")
        return json.loads(p.stdout.decode("utf-8", errors="replace"))
    finally:
        os.unlink(tmp.name)

def main():
    print(f"Matcher: {MATCHER}\n")
    fail = 0
    for t in TESTS:
        try:
            r = run_match(t["text"])
        except Exception as e:
            print(f"[ERROR] {t['name']}: {e}")
            fail += 1
            continue
        n = r["hit_count"]
        ok = True
        reasons = []
        if "expect_min_hits" in t and n < t["expect_min_hits"]:
            ok = False
            reasons.append(f"hits {n} < min {t['expect_min_hits']}")
        if "expect_max_hits" in t and n > t["expect_max_hits"]:
            ok = False
            reasons.append(f"hits {n} > max {t['expect_max_hits']}")
        if "must_hit_brands" in t:
            hit_names = {h["brand_name"] for h in r["hits"]}
            missing = [b for b in t["must_hit_brands"] if b not in hit_names]
            if missing:
                ok = False
                reasons.append(f"missing brands: {missing}")
        flag = "PASS" if ok else "FAIL"
        if not ok:
            fail += 1
        suffix = f"  -- {'; '.join(reasons)}" if reasons else ""
        print(f"[{flag}] {t['name']}  hits={n}{suffix}")
        for h in r["hits"][:6]:
            method = h.get("match_method", "?")
            score = h.get("match_score", "")
            print(
                f"   - {h['matched_substring']!r:24s} -> {h['brand_name']:18s} "
                f"[{method}/{score}] {h['rights_owner'][:32]}"
            )
        print()
    print(f"=== {len(TESTS) - fail}/{len(TESTS)} passed ===")
    sys.exit(0 if fail == 0 else 1)

if __name__ == "__main__":
    main()
