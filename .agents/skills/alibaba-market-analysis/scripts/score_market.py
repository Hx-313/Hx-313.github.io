"""
4D 市场机会评分脚本（需求 / 竞争 / 成长 / 匹配）。

将各维度的原始 JSON 文件作为输入，自动提取关键指标，
按 4D 模型（Demand / Competition / Growth / Fit）各打 1-5 分，
输出结构化结论（标签 + 理由），供报告 §6 决策结论使用。

Usage:
    python3 scripts/score_market.py \
        --detail <market-detail.json> \
        --trend <market-trend.json> \
        --topn <rank.json> \
        --seller <seller-portrait.json> \
        --opportunity <opportunity.json> \
        --buyer-profile <buyer-profile.json> \
        --buyer-channel <buyer-channel.json> \
        --crowd <crowd-insight.json> \
        --amazon <amazon_demand.json> \
        --category-context <category_context.json>

所有 --xxx 参数均为可选。缺失的文件对应维度标 no_data，confidence 降级。

Output (stdout, JSON):
    {
        "scores": { "demand": 4, "competition": 3, "growth": 4, "fit": 3 },
        "total": 14,
        "label": "🟡 中等机会 — 选准细分进入",
        "missing_dimensions": [],
        "confidence": "high",
        "reasoning": "..."
    }
"""

import argparse
import json
import os
import sys


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def safe_load(path):
    """Load JSON file, return None if missing or invalid."""
    if not path or not os.path.isfile(path):
        return None
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def to_num(v):
    """Coerce value to number."""
    if v is None or v == '':
        return 0
    if isinstance(v, (int, float)):
        return v
    if isinstance(v, list):
        return sum((x.get('tagValue', 0) or 0) for x in v if isinstance(x, dict))
    if isinstance(v, dict):
        return v.get('tagValue', 0) or 0
    try:
        return float(str(v).replace('%', '').replace(',', '').strip())
    except ValueError:
        return 0


def get_data(raw):
    """Unwrap nested response to single data object."""
    if raw is None:
        return {}
    if isinstance(raw, list):
        return raw[0] if raw else {}
    if isinstance(raw, dict):
        for key in ('data', 'result', 'item'):
            v = raw.get(key)
            if isinstance(v, (dict, list)):
                return get_data(v)
        return raw
    return {}


def get_items(raw):
    """Unwrap nested response to list."""
    if raw is None:
        return []
    if isinstance(raw, list):
        return raw
    for key in ('data', 'list', 'result', 'items'):
        v = raw.get(key)
        if isinstance(v, list):
            return v
        if isinstance(v, dict):
            for k2 in ('list', 'items', 'data'):
                if isinstance(v.get(k2), list):
                    return v[k2]
    return []


def pick(item, *keys):
    for k in keys:
        if isinstance(item, dict) and k in item and item[k] not in (None, ''):
            return item[k]
    return None


def clamp(v, lo=1, hi=5):
    return max(lo, min(hi, v))


# ---------------------------------------------------------------------------
# Dimension scoring
# ---------------------------------------------------------------------------

def score_demand(detail_data, amazon_data, opportunity_data):
    """
    D 需求 (Demand) — 市场规模与增长。
    信号：站内询盘/UV（market_detail.abCnt）、Amazon 月销、机会词搜索热度。
    """
    signals = []
    score = 3  # default neutral

    # market_detail: abCnt (market size proxy), abCntYoy (growth)
    if detail_data:
        ab_cnt = to_num(pick(detail_data, 'abCnt'))
        ab_yoy = to_num(pick(detail_data, 'abCntYoy'))
        if ab_cnt > 0:
            signals.append(('platform_market_size', ab_cnt))
        if ab_yoy > 0:
            signals.append(('platform_growth', ab_yoy))

    # Amazon: total units sold / revenue
    if amazon_data:
        items = get_items(amazon_data)
        if items:
            total_units = sum(to_num(pick(it, 'unitsSold', 'units_sold', 'sales')) for it in items if isinstance(it, dict))
            if total_units > 0:
                signals.append(('amazon_units', total_units))

    # opportunity: search heat
    if opportunity_data:
        items = get_items(opportunity_data)
        if items:
            avg_heat = sum(to_num(pick(it, 'searchIndex', 'searchHeat', 'seDemandIndex')) for it in items if isinstance(it, dict)) / max(len(items), 1)
            if avg_heat > 0:
                signals.append(('opportunity_heat', avg_heat))

    # Scoring logic
    if not signals:
        return None, signals

    s = 2.0
    # platform market size
    for name, val in signals:
        if name == 'platform_market_size':
            if val > 500000:
                s += 1.5
            elif val > 100000:
                s += 1.0
            elif val > 10000:
                s += 0.5
        elif name == 'platform_growth':
            if val > 20:
                s += 1.0
            elif val > 5:
                s += 0.5
        elif name == 'amazon_units':
            if val > 10000:
                s += 1.0
            elif val > 1000:
                s += 0.5
        elif name == 'opportunity_heat':
            if val > 1000:
                s += 0.5
            elif val > 100:
                s += 0.3

    return clamp(round(s)), signals


def score_competition(topn_data, seller_data, opportunity_data):
    """
    C 竞争 (Competition) — 反向，竞争越低分越高。
    信号：在架商品数、价格内卷度、TopN 集中度、卖家星级分布。
    """
    signals = []

    if topn_data:
        items = get_items(topn_data)
        if items:
            prices = [to_num(pick(it, 'moqPrice', 'price', 'minPrice')) for it in items if isinstance(it, dict)]
            prices = [p for p in prices if p > 0]
            if len(prices) >= 3:
                avg_p = sum(prices) / len(prices)
                min_p = min(prices)
                # price compression ratio: lower = more compressed = more competitive
                compression = min_p / avg_p if avg_p > 0 else 1.0
                signals.append(('price_compression', compression))
            signals.append(('topn_count', len(items)))

    if seller_data:
        data = get_data(seller_data)
        if data:
            # RTS ratio: higher = more mature supply = more competitive
            rts = to_num(pick(data, 'rtsProdCntRatio'))
            if rts > 0:
                signals.append(('rts_ratio', rts))
            # Low star ratio: higher = more small sellers = long tail
            low_star = to_num(pick(data, 'star0CompCntRatio', 'star1CompCntRatio'))
            if low_star > 0:
                signals.append(('low_star_ratio', low_star))

    if opportunity_data:
        items = get_items(opportunity_data)
        if items:
            # supply-demand ratio: higher = less competition
            sd_ratios = [to_num(pick(it, 'supplyDemandRate', 'sdRate')) for it in items if isinstance(it, dict)]
            sd_ratios = [r for r in sd_ratios if r > 0]
            if sd_ratios:
                avg_sd = sum(sd_ratios) / len(sd_ratios)
                signals.append(('avg_supply_demand', avg_sd))

    if not signals:
        return None, signals

    # Higher score = less competition
    s = 3.0
    for name, val in signals:
        if name == 'price_compression':
            if val < 0.3:
                s += 1.0  # very compressed = high competition = lower score
            elif val < 0.5:
                s += 0.5
            else:
                s -= 0.5  # spread prices = less competition
        elif name == 'rts_ratio':
            if val > 0.5:
                s -= 1.0  # mature supply = more competition
            elif val > 0.3:
                s -= 0.5
        elif name == 'avg_supply_demand':
            if val > 2.0:
                s += 1.5  # high demand/supply ratio = low competition
            elif val > 1.0:
                s += 0.5
            elif val < 0.5:
                s -= 1.0

    return clamp(round(s)), signals


def score_growth(trend_data, opportunity_data):
    """
    G 成长 (Growth) — 趋势走向。
    信号：market_trend 时间序列增速趋势、机会词增长。
    """
    signals = []

    if trend_data:
        items = get_items(trend_data)
        if items:
            # Sort by date, look at growth rate trajectory
            sorted_items = sorted(
                [it for it in items if isinstance(it, dict)],
                key=lambda x: pick(x, 'statDate') or ''
            )
            if len(sorted_items) >= 2:
                recent = sorted_items[-3:] if len(sorted_items) >= 3 else sorted_items
                yoy_values = [to_num(pick(it, 'abCntYoy')) for it in recent]
                avg_recent_yoy = sum(yoy_values) / max(len(yoy_values), 1)
                signals.append(('recent_yoy', avg_recent_yoy))

                # Trend direction: compare first half vs second half
                mid = len(sorted_items) // 2
                first_half_yoy = [to_num(pick(it, 'abCntYoy')) for it in sorted_items[:mid]]
                second_half_yoy = [to_num(pick(it, 'abCntYoy')) for it in sorted_items[mid:]]
                if first_half_yoy and second_half_yoy:
                    first_avg = sum(first_half_yoy) / len(first_half_yoy)
                    second_avg = sum(second_half_yoy) / len(second_half_yoy)
                    signals.append(('yoy_trend_direction', second_avg - first_avg))

    if opportunity_data:
        items = get_items(opportunity_data)
        if items:
            growth_vals = [to_num(pick(it, 'searchGrowthRate', 'growthRate', 'seDemandRate')) for it in items if isinstance(it, dict)]
            growth_vals = [v for v in growth_vals if v != 0]
            if growth_vals:
                avg_growth = sum(growth_vals) / len(growth_vals)
                signals.append(('opportunity_growth', avg_growth))

    if not signals:
        return None, signals

    s = 3.0
    for name, val in signals:
        if name == 'recent_yoy':
            if val > 20:
                s += 1.5
            elif val > 5:
                s += 1.0
            elif val > 0:
                s += 0.3
            elif val < -5:
                s -= 1.0
        elif name == 'yoy_trend_direction':
            if val > 5:
                s += 0.5  # accelerating
            elif val < -5:
                s -= 0.5  # decelerating
        elif name == 'opportunity_growth':
            if val > 30:
                s += 0.5
            elif val > 10:
                s += 0.3

    return clamp(round(s)), signals


def score_fit(buyer_profile_data, buyer_channel_data, crowd_data, category_context):
    """
    F 匹配 (Fit) — 与卖家能力匹配。
    信号：买家画像质量、渠道多样性、人群规模。
    注：此维度高度依赖商家自身画像，脚本只能基于平台数据给出基准分。
    """
    signals = []

    if buyer_profile_data:
        items = get_items(buyer_profile_data)
        if items:
            total_buyers = sum(to_num(pick(it, 'indxVal')) for it in items if isinstance(it, dict))
            if total_buyers > 0:
                signals.append(('buyer_volume', total_buyers))
            quality = sum(to_num(pick(it, 'highQualityIndxValue')) for it in items if isinstance(it, dict))
            if quality > 0 and total_buyers > 0:
                signals.append(('quality_ratio', quality / total_buyers))

    if crowd_data:
        items = get_items(crowd_data)
        if items:
            total_crowd = sum(to_num(pick(it, 'idxValue', 'indxVal')) for it in items if isinstance(it, dict))
            if total_crowd > 0:
                signals.append(('crowd_volume', total_crowd))

    if buyer_channel_data:
        items = get_items(buyer_channel_data)
        if items:
            channels = [it for it in items if isinstance(it, dict) and to_num(pick(it, 'indxVal')) > 0]
            if channels:
                signals.append(('channel_diversity', len(channels)))

    if not signals:
        return None, signals

    s = 3.0
    for name, val in signals:
        if name == 'buyer_volume':
            if val > 10000:
                s += 1.0
            elif val > 1000:
                s += 0.5
        elif name == 'quality_ratio':
            if val > 0.3:
                s += 0.5
            elif val > 0.1:
                s += 0.3
        elif name == 'crowd_volume':
            if val > 50000:
                s += 0.5
            elif val > 5000:
                s += 0.3
        elif name == 'channel_diversity':
            if val >= 3:
                s += 0.3

    return clamp(round(s)), signals


# ---------------------------------------------------------------------------
# Label mapping
# ---------------------------------------------------------------------------

def map_label(total, scored_count):
    """Map total score to label."""
    if scored_count == 0:
        return '❓ 信息不足', 'low'
    # Scale total to 20-point if some dimensions missing
    if scored_count < 4:
        scaled = total * 4 / scored_count
    else:
        scaled = total

    if scaled >= 16:
        return '🟢 高潜力 — 建议优先进入', 'high' if scored_count == 4 else 'medium'
    elif scaled >= 12:
        return '🟡 中等机会 — 选准细分进入', 'high' if scored_count == 4 else 'medium'
    elif scaled >= 8:
        return '🟠 谨慎 — 需差异化或等待时机', 'high' if scored_count == 4 else 'medium'
    else:
        return '🔴 暂不建议 — 红海/需求不足', 'high' if scored_count == 4 else 'medium'


def build_reasoning(scores_dict, signals_map):
    """Build human-readable reasoning string."""
    parts = []

    d = scores_dict.get('demand')
    if d is not None:
        if d >= 4:
            parts.append('需求侧旺盛')
        elif d >= 3:
            parts.append('需求侧中等')
        else:
            parts.append('需求侧偏弱')

    c = scores_dict.get('competition')
    if c is not None:
        if c >= 4:
            parts.append('竞争压力较小')
        elif c >= 3:
            parts.append('竞争中等')
        else:
            parts.append('竞争激烈')

    g = scores_dict.get('growth')
    if g is not None:
        if g >= 4:
            parts.append('增长趋势强劲')
        elif g >= 3:
            parts.append('趋势温和')
        else:
            parts.append('增长放缓')

    f = scores_dict.get('fit')
    if f is not None:
        if f >= 4:
            parts.append('市场匹配度高')
        elif f >= 3:
            parts.append('市场匹配度中等')
        else:
            parts.append('匹配度待验证')

    return '，'.join(parts) if parts else '数据不足，无法给出完整评估'


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description='4D 市场机会评分')
    parser.add_argument('--detail', help='market-detail.json 路径')
    parser.add_argument('--trend', help='market-trend.json 路径')
    parser.add_argument('--topn', help='rank.json (product-selection) 路径')
    parser.add_argument('--seller', help='seller-portrait.json 路径')
    parser.add_argument('--opportunity', help='opportunity.json 路径')
    parser.add_argument('--buyer-profile', help='buyer-profile.json 路径')
    parser.add_argument('--buyer-channel', help='buyer-channel.json 路径')
    parser.add_argument('--crowd', help='crowd-insight.json 路径')
    parser.add_argument('--amazon', help='amazon_demand.json 路径')
    parser.add_argument('--category-context', help='category_context.json 路径')
    args = parser.parse_args()

    # Load all data files
    detail_raw = safe_load(args.detail)
    trend_raw = safe_load(args.trend)
    topn_raw = safe_load(args.topn)
    seller_raw = safe_load(args.seller)
    opportunity_raw = safe_load(args.opportunity)
    buyer_profile_raw = safe_load(args.buyer_profile)
    buyer_channel_raw = safe_load(args.buyer_channel)
    crowd_raw = safe_load(args.crowd)
    amazon_raw = safe_load(args.amazon)
    category_ctx = safe_load(args.category_context)

    detail_data = get_data(detail_raw) if detail_raw else None
    topn_items = get_items(topn_raw) if topn_raw else None
    seller_data = get_data(seller_raw) if seller_raw else None
    opportunity_items = get_items(opportunity_raw) if opportunity_raw else None

    # Score each dimension
    d_score, d_signals = score_demand(
        detail_data,
        get_items(amazon_raw) if amazon_raw else None,
        opportunity_items,
    )
    c_score, c_signals = score_competition(topn_items, seller_data, opportunity_items)
    g_score, g_signals = score_growth(
        get_items(trend_raw) if trend_raw else None,
        opportunity_items,
    )
    f_score, f_signals = score_fit(
        get_items(buyer_profile_raw) if buyer_profile_raw else None,
        get_items(buyer_channel_raw) if buyer_channel_raw else None,
        get_items(crowd_raw) if crowd_raw else None,
        category_ctx,
    )

    # Build result
    scores = {}
    missing = []
    all_signals = {}

    for dim_name, score_val, sigs in [
        ('demand', d_score, d_signals),
        ('competition', c_score, c_signals),
        ('growth', g_score, g_signals),
        ('fit', f_score, f_signals),
    ]:
        if score_val is not None:
            scores[dim_name] = score_val
            all_signals[dim_name] = [(n, v) for n, v in sigs]
        else:
            scores[dim_name] = None
            missing.append(dim_name)

    scored = [v for v in scores.values() if v is not None]
    total = sum(scored)
    label, confidence = map_label(total, len(scored))
    reasoning = build_reasoning(scores, all_signals)

    if missing:
        confidence = 'low' if len(missing) >= 3 else 'medium'

    result = {
        'scores': scores,
        'total': total,
        'label': label,
        'missing_dimensions': missing,
        'confidence': confidence,
        'reasoning': reasoning,
    }

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
