#!/usr/bin/env python3
"""
全局常量
"""

import os
from pathlib import Path

# Skill 版本
SKILL_VERSION = "1.0.0"

# ── Skill 根目录（基于 __file__ 绝对路径，不依赖 CWD）─────────────────────────
_SCRIPT_DIR = Path(os.path.dirname(os.path.abspath(__file__)))   # scripts/
SKILL_ROOT  = _SCRIPT_DIR.parent                                  # skill 根目录

# ── AK 存储 Skill 名称（按优先级排序）────────────────────────────────────────
# OpenClaw 平台按 SKILL.md 中的 name 字段存储配置（1688-product-research），
# 但 1688 系列 Skill 历史上使用 "1688-shopkeeper" 作为共享 AK 存储键。
# 读取时按优先级遍历，写入时同步到首选名称。
AK_SKILL_NAMES = [
    "1688-product-research",   # 当前 Skill 实际名称（平台按此名存储）
    "1688-shopkeeper"     # 共享存储键（多个 1688 Skill 共用）
]

# ── OpenClaw 配置文件路径──────────────────────────────────────────────────────
# 候选目录（按优先级）：
#   1. OPENCLAW_CONFIG_DIR 环境变量
#   2. Path.home()/.openclaw  （标准路径）
#   3. SKILL_ROOT/.openclaw   （skill 目录下，适用于 skill 被复制到 workspace 的场景）
#   4. 从 __file__ 绝对路径推断真实用户 home（适用于沙箱 HOME 被重写的场景）
#
# 写入：使用第一个可写路径（OPENCLAW_CONFIG_PATH）
# 读取：遍历所有候选路径（OPENCLAW_CONFIG_CANDIDATES），返回第一个含有效 AK 的结果
#       这样即使写和读在不同环境下命中不同分支，也能找到已写入的配置。

def _collect_config_candidates() -> list:
    """收集所有候选配置目录，返回去重后的 Path 列表"""
    candidates: list[Path] = []

    # 1. 环境变量指定的目录（最高优先级）
    env_dir = os.environ.get("OPENCLAW_CONFIG_DIR")
    if env_dir:
        candidates.append(Path(env_dir))

    # 2. 标准 home 目录
    try:
        home_openclaw = Path.home() / ".openclaw"
        if home_openclaw not in candidates:
            candidates.append(home_openclaw)
    except Exception:
        pass

    # 3. Skill 根目录下的 .openclaw
    skill_openclaw = SKILL_ROOT / ".openclaw"
    if skill_openclaw not in candidates:
        candidates.append(skill_openclaw)

    # 4. 从 __file__ 绝对路径推断真实用户 home
    abs_parts = _SCRIPT_DIR.parts
    if len(abs_parts) >= 3:
        real_home = Path(abs_parts[0]) / abs_parts[1] / abs_parts[2]
        real_openclaw = real_home / ".openclaw"
        if real_openclaw not in candidates:
            candidates.append(real_openclaw)

    return candidates


def _resolve_write_config_dir(candidates: list) -> Path:
    """从候选列表中选出写入目录：优先已有 openclaw.json 的，其次第一个可写的"""
    # 优先命中已有配置的目录
    for d in candidates:
        if (d / "openclaw.json").exists():
            return d

    # 无现有配置 → 用首选路径创建
    for d in candidates:
        try:
            d.mkdir(parents=True, exist_ok=True)
            return d
        except OSError:
            continue

    # 兜底：Skill 根目录
    fallback = SKILL_ROOT / ".openclaw"
    try:
        fallback.mkdir(parents=True, exist_ok=True)
    except OSError:
        pass
    return fallback


# 所有候选配置文件路径（供读取时遍历）
_CANDIDATES = _collect_config_candidates()
OPENCLAW_CONFIG_CANDIDATES: list[Path] = [d / "openclaw.json" for d in _CANDIDATES]

# 写入使用的配置文件路径（单一确定路径）
OPENCLAW_CONFIG_PATH: Path = _resolve_write_config_dir(_CANDIDATES) / "openclaw.json"