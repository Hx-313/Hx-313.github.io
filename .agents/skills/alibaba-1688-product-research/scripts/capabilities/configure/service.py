#!/usr/bin/env python3
"""AK 配置服务 — 校验、写入、状态查询"""

import json
import os
import sys
from pathlib import Path
from typing import Tuple

sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..')))
from _const import OPENCLAW_CONFIG_PATH as CONFIG_PATH, OPENCLAW_CONFIG_CANDIDATES, AK_SKILL_NAMES

# 写入时使用的名称列表（与 AK_SKILL_NAMES 保持一致，确保读写对齐）
WRITE_SKILL_NAMES = AK_SKILL_NAMES


def validate_ak(ak: str) -> Tuple[bool, str]:
    """校验明文 AK 格式，返回 (is_valid, error_msg)"""
    if not ak:
        return False, "AK 不能为空"
    if len(ak) < 32:
        return False, f"AK 长度不足（当前 {len(ak)}，需要至少 32 位）"
    allowed = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-=")
    if not all(c in allowed for c in ak):
        return False, "AK 包含非法字符"
    return True, ""


def configure_via_gateway(api_key: str) -> Tuple[bool, str]:
    """通过 OpenClaw Gateway REST API 写入配置（安全，不破坏 JSON5 格式）。
    返回 (success, error_detail)"""
    try:
        import requests
    except ImportError:
        return False, "requests 库未安装"

    gateway_url = os.environ.get("OPENCLAW_GATEWAY_URL", "http://localhost:18789")
    token = os.environ.get("OPENCLAW_GATEWAY_TOKEN", "")

    payload = {
        "skills": {
            "entries": {
                name: {"apiKey": api_key}
                for name in WRITE_SKILL_NAMES
            }
        }
    }

    try:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        resp = requests.patch(f"{gateway_url}/api/config",
                              headers=headers, json=payload, timeout=5)
        if resp.ok:
            return True, ""
        return False, f"HTTP {resp.status_code} ({gateway_url})"
    except Exception as e:
        return False, f"{type(e).__name__}: {e} ({gateway_url})"


def configure_via_file(api_key: str) -> Tuple[bool, str]:
    """直接写入 openclaw.json（fallback），同时写入首选名称和共享名称。
    返回 (success, error_detail)"""
    try:
        config: dict = {}
        if CONFIG_PATH.exists():
            try:
                with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        config = json.loads(content)
            except json.JSONDecodeError as e:
                return False, f"JSONDecodeError: {e} (path={CONFIG_PATH})"

        config.setdefault("skills", {})
        config["skills"].setdefault("entries", {})

        # 同时写入所有 skill 名称，确保平台读取和跨 Skill 共享都能命中
        for name in WRITE_SKILL_NAMES:
            config["skills"]["entries"].setdefault(name, {})
            skill_entry = config["skills"]["entries"][name]
            skill_entry["apiKey"] = api_key
            # 清理旧格式 env.ALI_1688_AK 避免误导
            if "env" in skill_entry and isinstance(skill_entry["env"], dict):
                skill_entry["env"].pop("ALI_1688_AK", None)
                if not skill_entry["env"]:
                    del skill_entry["env"]

        CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(config, f, ensure_ascii=False, indent=2)

        return True, ""
    except Exception as e:
        return False, f"{type(e).__name__}: {e} (path={CONFIG_PATH})"


def check_existing_config() -> Tuple[bool, str]:
    """检查是否已有 AK（环境变量优先，其次遍历所有候选配置路径，按 AK_SKILL_NAMES 优先级查找）"""
    env_ak = os.environ.get("ALI_1688_AK", "")
    if env_ak:
        return True, env_ak

    for config_path in OPENCLAW_CONFIG_CANDIDATES:
        if not config_path.exists():
            continue
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
            entries = config.get("skills", {}).get("entries", {})
            for name in AK_SKILL_NAMES:
                skill_entry = entries.get(name, {})
                api_key = skill_entry.get("apiKey")
                if isinstance(api_key, str) and api_key:
                    return True, api_key
                # 兼容旧格式：env.ALI_1688_AK
                legacy = skill_entry.get("env", {}).get("ALI_1688_AK", "")
                if legacy:
                    return True, legacy
        except Exception:
            continue
    return False, ""


def get_config_detail() -> dict:
    """获取当前 AK 配置的详细信息，遍历所有候选路径展示各存储位置的状态"""
    def _mask(ak: str) -> str:
        if len(ak) >= 8:
            return f"{ak[:4]}****{ak[-4:]}"
        return "****" if ak else "(空)"

    detail = {
        "env_var": {"available": False, "value": ""},
        "config_files": [],
        "write_path": str(CONFIG_PATH),
        "gateway": {"url": os.environ.get("OPENCLAW_GATEWAY_URL", "http://localhost:18789")},
        "active_ak": None,
        "active_source": None,
    }

    # 1. 环境变量
    env_ak = os.environ.get("ALI_1688_AK", "")
    if env_ak:
        detail["env_var"] = {"available": True, "value": _mask(env_ak)}
        detail["active_ak"] = _mask(env_ak)
        detail["active_source"] = "环境变量 ALI_1688_AK"

    # 2. 遍历所有候选配置文件
    for config_path in OPENCLAW_CONFIG_CANDIDATES:
        file_info = {
            "path": str(config_path),
            "exists": config_path.exists(),
            "is_write_target": (config_path == CONFIG_PATH),
            "entries": {},
            "available": False,
        }
        if config_path.exists():
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    config = json.load(f)
                entries = config.get("skills", {}).get("entries", {})
                for name in AK_SKILL_NAMES:
                    skill_entry = entries.get(name, {})
                    ak = skill_entry.get("apiKey", "")
                    legacy = skill_entry.get("env", {}).get("ALI_1688_AK", "")
                    effective = ak or legacy
                    file_info["entries"][name] = {
                        "apiKey": _mask(ak) if ak else "",
                        "env_AK": _mask(legacy) if legacy else "",
                        "has_ak": bool(effective),
                    }
                    # 如果环境变量没有 AK，从配置文件取第一个有效的
                    if effective and not detail["active_ak"]:
                        detail["active_ak"] = _mask(effective)
                        detail["active_source"] = f"配置文件 `{config_path}` [{name}]"
                file_info["available"] = any(
                    e["has_ak"] for e in file_info["entries"].values()
                )
            except Exception as e:
                file_info["error"] = str(e)
        detail["config_files"].append(file_info)

    return detail