"""
extract 脚本共享基础设施。

提供：
    - validate_status(raw)   : 检查 API 返回的 success/status/invokeStatus (#11)
    - unwrap_items(raw)      : 统一解包 records/model/artifact/truncated 等包装层 (#12)
    - make_result(...)       : 统一输出 {ok, is_empty, partial, warnings, ...} (#9)
    - to_num(v)              : 安全数值转换
    - pick(item, *keys)      : 字段别名选取（第一个非空值）
"""


# ── #11: API 状态校验 ───────────────────────────────────────────────

def validate_status(raw):
    """
    检查 API 响应中的业务状态字段。

    Returns:
        (ok: bool, warning: str | None)
        ok=False 表示业务失败，调用方应走降级路径。
    """
    if not isinstance(raw, dict):
        return True, None

    # success: false / "false"
    success = raw.get('success')
    if success is not None:
        if success is False or str(success).lower() == 'false':
            msg = raw.get('message') or raw.get('errorMsg') or raw.get('msg') or 'API returned success=false'
            return False, f'api_error: {msg}'

    # status: "failed" / "error"
    status = raw.get('status')
    if isinstance(status, str) and status.lower() in ('failed', 'error', 'fail'):
        return False, f'api_error: status={status}'

    # invokeStatus: "failed"
    invoke_status = raw.get('invokeStatus')
    if isinstance(invoke_status, str) and invoke_status.lower() in ('failed', 'error', 'fail'):
        return False, f'api_error: invokeStatus={invoke_status}'

    # code: non-zero (某些 API 用 code != 0 / "0" / "200" 表示失败)
    code = raw.get('code')
    if code is not None and str(code) not in ('0', '200', 'ok', 'OK', 'SUCCESS'):
        # 只有同时有 message/errorMsg 时才视为失败，避免误判正常 code 字段
        if raw.get('message') or raw.get('errorMsg') or raw.get('msg'):
            return False, f'api_error: code={code}, {raw.get("message") or raw.get("errorMsg") or raw.get("msg")}'

    return True, None


# ── #12: 统一解包 API 响应 ─────────────────────────────────────────

# 所有已知的「列表型」包装 key，按优先级排列
_LIST_KEYS = (
    'data', 'list', 'result', 'items', 'records',
    'rankList', 'products', 'model', 'artifact',
)

# data 内部可能再嵌套一层列表
_NESTED_LIST_KEYS = (
    'list', 'items', 'data', 'records', 'rankList', 'products',
)


def unwrap_items(raw):
    """
    从 API 响应中提取列表数据。

    覆盖：data / data.list / list / result / items / records / model / artifact
    以及 truncated（截断标记不影响列表提取，仅记 warning）。

    Returns:
        (items: list, warnings: list[str])
    """
    warnings = []

    if isinstance(raw, list):
        return raw, warnings

    if not isinstance(raw, dict):
        return [], warnings

    # truncated 标记（数据被截断但仍可用）
    if raw.get('truncated') is True or raw.get('truncated') == 'true':
        warnings.append('data_truncated: response was truncated by upstream')

    # 第一层：直接找列表 key
    for key in _LIST_KEYS:
        v = raw.get(key)
        if isinstance(v, list):
            return v, warnings
        if isinstance(v, dict):
            # 第二层：dict 内嵌套列表
            for k2 in _NESTED_LIST_KEYS:
                inner = v.get(k2)
                if isinstance(inner, list):
                    return inner, warnings
            # 第三层：data.model.artifact.list 等深嵌套
            for k2 in ('model', 'artifact'):
                inner_dict = v.get(k2)
                if isinstance(inner_dict, dict):
                    for k3 in _NESTED_LIST_KEYS:
                        inner_list = inner_dict.get(k3)
                        if isinstance(inner_list, list):
                            return inner_list, warnings
                    # 第四层：data.model.artifact.list
                    for k3 in ('model', 'artifact'):
                        deep_dict = inner_dict.get(k3)
                        if isinstance(deep_dict, dict):
                            for k4 in _NESTED_LIST_KEYS:
                                deep_list = deep_dict.get(k4)
                                if isinstance(deep_list, list):
                                    return deep_list, warnings

    return [], warnings


def unwrap_single(raw):
    """
    从 API 响应中提取单个对象（用于 market_detail / seller_portrait 等单记录 API）。

    Returns:
        (data: dict, warnings: list[str])
    """
    warnings = []

    if isinstance(raw, list):
        return raw[0] if raw else {}, warnings

    if not isinstance(raw, dict):
        return {}, warnings

    if raw.get('truncated') is True or raw.get('truncated') == 'true':
        warnings.append('data_truncated: response was truncated by upstream')

    for key in ('data', 'result', 'item', 'model'):
        v = raw.get(key)
        if isinstance(v, (dict, list)):
            return unwrap_single(v)
        # continue to next key if not dict/list

    # 如果没有标准包装 key，返回 raw 本身（去掉元信息字段）
    meta_keys = {'success', 'status', 'invokeStatus', 'code', 'message',
                 'errorMsg', 'msg', 'truncated', 'timestamp', 'traceId'}
    remaining = {k: v for k, v in raw.items() if k not in meta_keys}
    if remaining:
        return remaining, warnings

    return raw, warnings


# ── #9: 统一输出形态 ───────────────────────────────────────────────

def make_result(ok=True, is_empty=False, partial=False,
                warnings=None, **payload):
    """
    构造统一的脚本输出格式。

    所有 extract 脚本的 stdout JSON 都应包含：
        ok       : bool    - 脚本是否成功执行（不等于 API 成功）
        is_empty : bool    - 数据为空（需要降级）
        partial  : bool    - 数据不完整但可用
        warnings : list    - 警告信息列表
        + 各脚本自定义的 payload 字段

    调用方（SKILL.md 的 agent）可根据 is_empty=true 判断需要走降级路径。
    """
    result = {
        'ok': ok,
        'is_empty': is_empty,
        'partial': partial,
        'warnings': warnings or [],
    }
    result.update(payload)
    return result


# ── 通用工具函数 ────────────────────────────────────────────────────

def _coerce_scalar(v):
    """把单个标量（可能是 int/float/数字字符串/None）安全转为数字。"""
    if v is None or v == '':
        return 0
    if isinstance(v, (int, float)):
        return v
    try:
        return float(str(v).replace('%', '').replace(',', '').replace('$', '').strip())
    except (ValueError, AttributeError):
        return 0


def to_num(v):
    """安全数值转换，支持 int/float/list[tagValue]/dict[tagValue]/str。

    注意：tagValue 可能是「数字字符串」（如 "218.0"），必须经 _coerce_scalar
    强制转换后再求和，否则 sum() 会触发 'int + str' TypeError。
    """
    if v is None or v == '':
        return 0
    if isinstance(v, (int, float)):
        return v
    if isinstance(v, list):
        return sum(_coerce_scalar(x.get('tagValue', 0)) for x in v if isinstance(x, dict))
    if isinstance(v, dict):
        return _coerce_scalar(v.get('tagValue', 0))
    return _coerce_scalar(v)


def pick(item, *keys):
    """从 dict 中按优先级取第一个非空值（字段别名归一化）。"""
    if not isinstance(item, dict):
        return None
    for k in keys:
        if k in item and item[k] not in (None, ''):
            return item[k]
    return None
