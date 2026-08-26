"""
买家维度取数编排器（硬约束版）。

把买家画像取数的全部「踩坑约束」用代码固化，使子代理无法绕过：
    1. nd 参数白名单：仅 7d/30d 放行；90d/超范围 → 自动降级 30d 并告警
       （实测 nd=90d 会让 buyer_profile/buyer_channel 接口返回空 [{}]）
    2. crowd_insight 的 industryId 强制传具体 cateId，禁止 TOTAL（实测永远空）
    3. buyer_profile/buyer_channel 强制传 indexName（缺失会空）
    4. 接口偶发 HTML 错误页 / 空壳返回 → 自动重试（默认 2 次）
    5. 窄类目（L3/L4）三工具取空 → 自动回退父类目重查，并标注来源粒度
    6. buyer_profile 自动轮询多个 indexName（visitor_country/buyers_identity/cate_total）

Usage:
    python3 scripts/fetch_buyer.py <cateId> [--nd 30d] [--parent <parentCateId>] [--retries 2]

Output (stdout, JSON):
    {
      ok, is_empty, partial, warnings,
      source_granularity: "self" | "parent",   # 数据来自本品类还是父类目
      source_cate_id: <实际取数用的cateId>,
      nd_used: "30d",                            # 实际使用的 nd
      nd_requested: "90d",                       # 用户/调用方请求的 nd（如不同会告警）
      profile: {...},   # extract_buyer profile 结果（含 segments/summary）
      channel: {...},   # extract_buyer channel 结果
      crowd:   {...},   # extract_buyer crowd 结果
    }

说明：本脚本通过 subprocess 调用 accio-mcp-cli，自带重试与回退；
extract_* 解析逻辑直接复用 extract_buyer.py，保证输出格式一致。
"""

import json
import sys
import os
import subprocess

sys.path.insert(0, os.path.dirname(__file__))
from common import validate_status, unwrap_items
from extract_buyer import extract_profile, extract_channel, extract_crowd

# nd 白名单：实测仅这两个值能返回数据
_ND_WHITELIST = ('7d', '30d')
_ND_DEFAULT = '30d'

# buyer_profile 轮询的 indexName（按价值排序，第一个成功即作为主画像）
_PROFILE_INDEX_NAMES = ('visitor_country', 'buyers_identity', 'cate_total')


def _call_mcp(tool, payload, retries=2):
    """subprocess 调用 accio-mcp-cli，带重试。

    返回 (raw_dict_or_None, warnings)。
    重试触发条件：进程非 0 退出 / 非 JSON（HTML 错误页）/ 业务状态失败。
    """
    warnings = []
    last_err = ''
    for attempt in range(retries + 1):
        try:
            proc = subprocess.run(
                ['accio-mcp-cli', 'call', tool, '--json', json.dumps(payload)],
                capture_output=True, text=True, timeout=90,
            )
        except subprocess.TimeoutExpired:
            last_err = 'timeout'
            continue
        out = (proc.stdout or '').strip()
        # HTML 错误页 / 空输出 → 重试
        if not out or out.lstrip().lower().startswith(('<!doctype', '<html')):
            last_err = 'html_or_empty_response'
            continue
        try:
            raw = json.loads(out)
        except json.JSONDecodeError:
            last_err = 'json_decode_error'
            continue
        ok, warn = validate_status(raw)
        if not ok:
            last_err = warn or 'api_error'
            continue
        return raw, warnings
    warnings.append(f'{tool}: 重试 {retries} 次仍失败（{last_err}）')
    return None, warnings


def _is_nonempty_items(raw):
    """判断解包后是否有真实数据（排除 [{}] 空壳）。"""
    if raw is None:
        return False, []
    items, _ = unwrap_items(raw)
    real = [it for it in items if isinstance(it, dict) and any(
        v not in (None, '', [], {}) for v in it.values())]
    return (len(real) > 0), real


def _fetch_profile(cate_id, nd, retries):
    """轮询多个 indexName，返回第一个有数据的 profile 结果 + 是否有数据 + 原始items。"""
    all_warns = []
    for idx_name in _PROFILE_INDEX_NAMES:
        raw, w = _call_mcp('data_advisor_industry_buyer_profile', {
            'industryPortraitQueryParam': {
                'cateId': int(cate_id), 'indexName': idx_name,
                'nd': nd, 'terminalType': 'TOTAL',
            }
        }, retries=retries)
        all_warns += w
        has, items = _is_nonempty_items(raw)
        if has:
            res = extract_profile(items)
            res['indexName'] = idx_name
            return res, True, all_warns, items
    return {'type': 'profile', 'segments': [], 'summary': {}}, False, all_warns, []


def _fetch_channel(cate_id, nd, retries):
    raw, w = _call_mcp('data_advisor_industry_buyer_channel', {
        'industryPortraitQueryParam': {
            'cateId': int(cate_id), 'indexName': 'channel_total',
            'nd': nd, 'terminalType': 'TOTAL',
        }
    }, retries=retries)
    has, items = _is_nonempty_items(raw)
    if has:
        return extract_channel(items), True, w, items
    return {'type': 'channel', 'channels': [], 'summary': {}}, False, w, []


def _fetch_crowd(cate_id, nd, retries):
    # industryId 强制传具体 cateId（字符串），禁用 TOTAL
    raw, w = _call_mcp('data_advisor_industry_crowd_insight', {
        'crowdInsightQueryParam': {
            'industryId': str(cate_id), 'nd': nd,
        }
    }, retries=retries)
    has, items = _is_nonempty_items(raw)
    if has:
        return extract_crowd(items), True, w, items
    return {'type': 'crowd', 'crowds': [], 'summary': {}}, False, w, []


def _find_parent_cate(cate_id, retries):
    """通过 category_infer 反查父类目 id。返回 (parentId|None, warnings)。"""
    warns = []
    raw, w = _call_mcp('data_advisor_category_infer',
                       {'categoryDesc': str(cate_id)}, retries=retries)
    warns += w
    if raw:
        items, _ = unwrap_items(raw)
        for it in items:
            if isinstance(it, dict):
                pid = it.get('parentId') or it.get('parentCateId')
                if pid and str(pid) not in ('0', str(cate_id)):
                    return str(pid), warns
    return None, warns


def fetch_all(cate_id, nd_requested='30d', parent_id=None, retries=2, dump_dir=None):
    warnings = []

    # ── 约束1：nd 白名单校验 ──
    nd = nd_requested
    if nd not in _ND_WHITELIST:
        warnings.append(
            f'nd_downgraded: 请求的 nd="{nd_requested}" 不在有效范围，'
            f'平台买家维度仅提供 7d/30d 数据，已自动用 {_ND_DEFAULT}。'
            f'报告须如实告知用户该限制。'
        )
        nd = _ND_DEFAULT

    def _run(cid):
        p, p_ok, pw, p_items = _fetch_profile(cid, nd, retries)
        c, c_ok, cw, c_items = _fetch_channel(cid, nd, retries)
        cr, cr_ok, crw, cr_items = _fetch_crowd(cid, nd, retries)
        return ((p, c, cr), (p_ok or c_ok or cr_ok), (pw + cw + crw),
                (p_items, c_items, cr_items))

    # ── 本品类取数 ──
    (profile, channel, crowd), any_ok, w, raw_items = _run(cate_id)
    warnings += w
    granularity = 'self'
    source_cate = str(cate_id)

    # ── 约束5：本品类全空 → 回退父类目 ──
    if not any_ok:
        pid = parent_id
        if not pid:
            pid, fw = _find_parent_cate(cate_id, retries)
            warnings += fw
        if pid:
            warnings.append(f'parent_fallback: 本品类 {cate_id} 买家数据为空，回退父类目 {pid} 重查')
            (p2, c2, cr2), any_ok2, w2, raw_items2 = _run(pid)
            warnings += w2
            if any_ok2:
                profile, channel, crowd = p2, c2, cr2
                raw_items = raw_items2
                granularity = 'parent'
                source_cate = str(pid)
                warnings.append(f'source_is_parent: 买家画像基于父类目 {pid}，非本品类精确数据，报告须标注')
            else:
                warnings.append('parent_also_empty: 父类目买家数据同样为空，需降级为 web_search 定性推断')
        else:
            warnings.append('no_parent_found: 未找到父类目，需降级为 web_search 定性推断')

    # ── 落盘 score_market.py 兼容的原始文件（{data:[items]}）──
    if dump_dir:
        try:
            os.makedirs(dump_dir, exist_ok=True)
            p_items, c_items, cr_items = raw_items
            for fname, items in (('buyer-profile.json', p_items),
                                 ('buyer-channel.json', c_items),
                                 ('crowd-insight.json', cr_items)):
                with open(os.path.join(dump_dir, fname), 'w', encoding='utf-8') as f:
                    json.dump({'success': True, 'data': items}, f, ensure_ascii=False)
        except OSError as e:
            warnings.append(f'dump_failed: {e}')

    is_empty = not any_ok and granularity == 'self'
    return {
        'ok': True,
        'is_empty': is_empty,
        'partial': granularity == 'parent',
        'warnings': warnings,
        'source_granularity': granularity,
        'source_cate_id': source_cate,
        'nd_used': nd,
        'nd_requested': nd_requested,
        'profile': profile,
        'channel': channel,
        'crowd': crowd,
    }


def main():
    args = sys.argv[1:]
    if not args:
        print('Usage: python3 fetch_buyer.py <cateId> [--nd 30d] [--parent <id>] [--retries 2]',
              file=sys.stderr)
        sys.exit(1)
    cate_id = args[0]
    nd = _ND_DEFAULT
    parent_id = None
    retries = 2
    dump_dir = None
    for i, a in enumerate(args):
        if a == '--nd' and i + 1 < len(args):
            nd = args[i + 1]
        elif a == '--parent' and i + 1 < len(args):
            parent_id = args[i + 1]
        elif a == '--retries' and i + 1 < len(args):
            try:
                retries = int(args[i + 1])
            except ValueError:
                pass
        elif a == '--dump-dir' and i + 1 < len(args):
            dump_dir = args[i + 1]
    result = fetch_all(cate_id, nd_requested=nd, parent_id=parent_id,
                       retries=retries, dump_dir=dump_dir)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
