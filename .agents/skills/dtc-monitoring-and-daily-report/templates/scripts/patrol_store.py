#!/usr/bin/env python3
"""Crash-consistent local state store for Shopify social patrol actions.

The store is intentionally small and deterministic.  It owns every write to
``project/.shopify-social-patrol``; agents and other scripts must not edit the JSON
files directly.
"""

from __future__ import annotations

import argparse
import contextlib
import copy
import fcntl
import hashlib
import importlib.util
import json
import os
import re
import secrets
import stat
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterator
from urllib.parse import urlsplit


SCHEMA_VERSION = 1
ACTION_TYPES = {"social_publish"}
ACTION_STATUSES = {"pending", "processing", "succeeded", "failed"}
ACTION_KEY_RE = re.compile(r"^act_[0-9a-f]{32}$")
CAMPAIGN_KEY_RE = re.compile(r"^camp_[0-9a-f]{32}$")
SHOP_DOMAIN_RE = re.compile(r"^[a-z0-9][a-z0-9-]*\.myshopify\.com$", re.IGNORECASE)
SET_LIKE_ARRAY_KEYS = {"product_ids"}
PLACEHOLDER_ACCOUNT_IDS = {"connected", "current", "instagram", "me", "unknown", "x", "twitter"}
PREFLIGHT_RESULTS = {"unreviewed", "pass", "warning", "block"}
PREFLIGHT_POLICY_VERSION = "social-publish-v1"
CAMPAIGN_STATUSES = {"drafting", "materialized", "active", "completed", "cancelled"}
CAMPAIGN_SLOT_STATUSES = {"planned", "action_created", "publishing", "published", "failed"}
EXECUTION_ID_RE = re.compile(r"^exec_[0-9a-f]{32}$")
EXECUTION_LEASE_SECONDS = 15 * 60

STATE_KEYS = {
    "schema_version",
    "shop_domain",
    "last_product_scan_at",
    "known_eligible_product_ids",
}
STATE_CHANGE_KEYS = {
    "last_product_scan_at",
    "add_known_product_ids",
}

PAYLOAD_FIELDS = {
    "social_publish": {
        "required": {
            "platform",
            "connected_account_id",
            "text",
            "media_urls",
            "product_url",
            "product_ids",
            "cta_mode",
        },
        "optional": {"campaign_id", "slot_id", "scheduled_for"},
    },
}


class StoreError(RuntimeError):
    """A stable, user-safe store contract error."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


def _utc_iso(value: str | None, field: str) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise StoreError("invalid_field_type", f"{field} must be an ISO-8601 string or null")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise StoreError("invalid_timestamp", f"{field} is not valid ISO-8601") from exc
    if parsed.tzinfo is None:
        raise StoreError("invalid_timestamp", f"{field} must include a timezone")
    return value


def _required_utc_iso(value: Any, field: str) -> str:
    if value is None:
        raise StoreError("invalid_timestamp", f"{field} must be a timezone-aware ISO-8601 string")
    parsed = _utc_iso(value, field)
    assert parsed is not None
    return parsed


def _parse_utc(value: Any, field: str) -> datetime:
    normalised = _required_utc_iso(value, field)
    return datetime.fromisoformat(normalised.replace("Z", "+00:00")).astimezone(timezone.utc)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _format_utc(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _normalise(value: Any, key: str | None = None) -> Any:
    if isinstance(value, dict):
        return {k: _normalise(value[k], k) for k in sorted(value)}
    if isinstance(value, list):
        items = [_normalise(item, key) for item in value]
        if key in SET_LIKE_ARRAY_KEYS:
            keyed = {json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")): item for item in items}
            return [keyed[item_key] for item_key in sorted(keyed)]
        return items
    return value


def canonical_json(value: Any) -> str:
    """Return the stable JSON representation used by payload hashes.

    Payloads in this plugin contain JSON primitives and no floating-point
    business values.  ``allow_nan=False`` prevents non-JSON numeric values.
    Set-like arrays are normalised before serialisation; ordered media arrays
    retain their original order.
    """

    return json.dumps(
        _normalise(value),
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    )


def payload_hash(payload: dict[str, Any]) -> str:
    return "sha256:" + hashlib.sha256(canonical_json(payload).encode("utf-8")).hexdigest()


def action_key(dedupe_key: str) -> str:
    if not isinstance(dedupe_key, str) or not dedupe_key.strip():
        raise StoreError("invalid_dedupe_key", "dedupe_key must be a non-empty string")
    return "act_" + hashlib.sha256(dedupe_key.encode("utf-8")).hexdigest()[:32]


def _validate_action_key(value: str) -> str:
    if not isinstance(value, str) or not ACTION_KEY_RE.fullmatch(value):
        raise StoreError("invalid_action_key", "action_key has an invalid format")
    return value


def _validate_campaign_key(value: str) -> str:
    if not isinstance(value, str) or not CAMPAIGN_KEY_RE.fullmatch(value):
        raise StoreError("invalid_campaign_id", "campaign_id has an invalid format")
    return value


def _validate_shop_domain(value: str) -> str:
    if not isinstance(value, str) or not SHOP_DOMAIN_RE.fullmatch(value):
        raise StoreError("invalid_shop_domain", "shop_domain must be a full *.myshopify.com domain")
    return value.lower()


def _validate_https_url(value: Any, field: str) -> str:
    if not isinstance(value, str) or any(character.isspace() for character in value):
        raise StoreError("invalid_payload", f"{field} must be an HTTPS URL")
    parsed = urlsplit(value)
    if parsed.scheme != "https" or not parsed.netloc or parsed.username is not None or parsed.password is not None:
        raise StoreError("invalid_payload", f"{field} must be a public HTTPS URL")
    return value


def _validate_payload(action_type: str, payload: Any) -> dict[str, Any]:
    if action_type not in ACTION_TYPES:
        raise StoreError("invalid_action_type", f"unsupported action_type: {action_type}")
    if not isinstance(payload, dict):
        raise StoreError("invalid_payload", "payload must be a JSON object")
    contract = PAYLOAD_FIELDS[action_type]
    allowed = contract["required"] | contract["optional"]
    missing = sorted(contract["required"] - payload.keys())
    unknown = sorted(payload.keys() - allowed)
    if missing:
        raise StoreError("invalid_payload", f"payload missing required fields: {', '.join(missing)}")
    if unknown:
        raise StoreError("invalid_payload", f"payload contains unsupported fields: {', '.join(unknown)}")

    normalised = _normalise(payload)
    if action_type == "social_publish":
        if not isinstance(normalised["platform"], str) or normalised["platform"] not in {"instagram", "x"}:
            raise StoreError("invalid_payload", "social platform must be instagram or x")
        account_id = normalised["connected_account_id"]
        if not isinstance(account_id, str) or not account_id.strip() or account_id != account_id.strip():
            raise StoreError("invalid_payload", "connected_account_id must be non-empty")
        if account_id.strip().lower() in PLACEHOLDER_ACCOUNT_IDS:
            raise StoreError("invalid_payload", "connected_account_id must be the stable connector-returned account ID")
        if not isinstance(normalised["text"], str) or not normalised["text"].strip():
            raise StoreError("invalid_payload", "social text must be a non-empty string")
        if normalised["platform"] == "instagram" and "%23" in normalised["text"].lower():
            raise StoreError("invalid_payload", "Instagram text must contain literal # characters, never %23")
        for field in ("media_urls", "product_ids"):
            if not isinstance(normalised[field], list) or not normalised[field] or not all(
                isinstance(item, str) and item for item in normalised[field]
            ):
                raise StoreError("invalid_payload", f"{field} must be a non-empty string array")
        _validate_https_url(normalised["product_url"], "product_url")
        for media_url in normalised["media_urls"]:
            _validate_https_url(media_url, "media_urls")
        if not all(item.startswith("gid://shopify/Product/") for item in normalised["product_ids"]):
            raise StoreError("invalid_payload", "product_ids must contain Shopify Product GIDs")
        if not isinstance(normalised["cta_mode"], str):
            raise StoreError("invalid_payload", "cta_mode must be a string")
        if normalised["platform"] == "instagram":
            if len(normalised["media_urls"]) != 1:
                raise StoreError("invalid_payload", "Instagram P0 supports exactly one image per publish action")
            if urlsplit(normalised["media_urls"][0]).query:
                raise StoreError("invalid_payload", "Instagram media URL must not contain a query string")
            if normalised["cta_mode"] not in {"link_in_bio", "product_tag", "story_link", "caption_url", "none"}:
                raise StoreError("invalid_payload", "unsupported Instagram cta_mode")
        elif normalised["cta_mode"] not in {"direct_link", "none"}:
            raise StoreError("invalid_payload", "unsupported X cta_mode")

        campaign_field_names = {"campaign_id", "slot_id", "scheduled_for"}
        present_campaign_fields = campaign_field_names & normalised.keys()
        if present_campaign_fields and present_campaign_fields != campaign_field_names:
            raise StoreError(
                "invalid_payload",
                "campaign_id, slot_id, and scheduled_for must be supplied together for Campaign actions",
            )
        if present_campaign_fields:
            campaign_id = normalised["campaign_id"]
            slot_id = normalised["slot_id"]
            scheduled_for = normalised["scheduled_for"]
            _validate_campaign_key(campaign_id)
            if not isinstance(slot_id, str) or not re.fullmatch(r"slot_[a-z0-9][a-z0-9_-]{0,63}", slot_id):
                raise StoreError("invalid_payload", "slot_id has an invalid format")
            _required_utc_iso(scheduled_for, "scheduled_for")

    return normalised


def _unreviewed_preflight(current_hash: str, reason_code: str = "PREFLIGHT_REQUIRED") -> dict[str, Any]:
    return {
        "policy_version": PREFLIGHT_POLICY_VERSION,
        "policy_result": "unreviewed",
        "payload_hash": current_hash,
        "reason_codes": [reason_code],
        "explanations": ["Run deterministic social publish preflight for the current payload."],
    }


def _validate_preflight(value: Any, current_hash: str) -> dict[str, Any]:
    required = {"policy_version", "policy_result", "payload_hash", "reason_codes", "explanations"}
    if not isinstance(value, dict) or set(value) != required:
        raise StoreError("invalid_preflight", "preflight fields are invalid")
    if value["policy_result"] not in PREFLIGHT_RESULTS:
        raise StoreError("invalid_preflight", "preflight policy_result is invalid")
    if value["policy_version"] != PREFLIGHT_POLICY_VERSION:
        raise StoreError("invalid_preflight", "preflight policy_version is unsupported")
    if value["payload_hash"] != current_hash:
        raise StoreError("preflight_payload_mismatch", "preflight result does not match the current payload hash")
    if not isinstance(value["reason_codes"], list) or not value["reason_codes"] or not all(
        isinstance(item, str) and re.fullmatch(r"[A-Z][A-Z0-9_]{1,63}", item)
        for item in value["reason_codes"]
    ):
        raise StoreError("invalid_preflight", "preflight reason_codes must be stable uppercase codes")
    if not isinstance(value["explanations"], list) or not all(
        isinstance(item, str) and item for item in value["explanations"]
    ):
        raise StoreError("invalid_preflight", "preflight explanations must be a non-empty string array")
    if len(value["reason_codes"]) != len(value["explanations"]):
        raise StoreError("invalid_preflight", "preflight reason_codes and explanations must align")
    if value["policy_result"] == "pass" and value["reason_codes"] != ["POLICY_PASS"]:
        raise StoreError("invalid_preflight", "pass preflight must contain only POLICY_PASS")
    if value["policy_result"] in {"warning", "block"} and "POLICY_PASS" in value["reason_codes"]:
        raise StoreError("invalid_preflight", "non-pass preflight cannot contain POLICY_PASS")
    return copy.deepcopy(value)


def _default_state(shop_domain: str) -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "shop_domain": shop_domain,
        "last_product_scan_at": None,
        "known_eligible_product_ids": [],
    }


def _default_actions() -> dict[str, Any]:
    return {"schema_version": SCHEMA_VERSION, "actions": {}}


def _default_campaigns() -> dict[str, Any]:
    return {"schema_version": SCHEMA_VERSION, "campaigns": {}}


def _secure_root(root: Path) -> None:
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    if root.is_symlink() or not root.is_dir():
        raise StoreError("unsafe_store_root", "store root must be a real directory, not a symlink")
    os.chmod(root, 0o700)
    payload_dir = root / "action-payloads"
    payload_dir.mkdir(exist_ok=True, mode=0o700)
    if payload_dir.is_symlink() or not payload_dir.is_dir():
        raise StoreError("unsafe_store_root", "action-payloads must be a real directory")
    os.chmod(payload_dir, 0o700)


def _safe_file(path: Path, *, may_not_exist: bool = False) -> None:
    try:
        info = path.lstat()
    except FileNotFoundError:
        if may_not_exist:
            return
        raise StoreError("missing_store_file", f"required store file is missing: {path.name}")
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
        raise StoreError("unsafe_store_file", f"{path.name} must be a regular file")


def _read_json(path: Path) -> dict[str, Any]:
    _safe_file(path)
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise StoreError("invalid_store_json", f"cannot read valid JSON from {path.name}") from exc
    if not isinstance(value, dict):
        raise StoreError("invalid_store_json", f"{path.name} must contain a JSON object")
    return value


def _fsync_directory(path: Path) -> None:
    descriptor = os.open(path, os.O_RDONLY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def _atomic_write(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    temp_path = Path(temp_name)
    try:
        os.fchmod(descriptor, 0o600)
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            json.dump(value, stream, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp_path, path)
        os.chmod(path, 0o600)
        _fsync_directory(path.parent)
    finally:
        if temp_path.exists():
            temp_path.unlink()


def _validate_state(state: dict[str, Any]) -> None:
    unknown = sorted(state.keys() - STATE_KEYS)
    missing = sorted(STATE_KEYS - state.keys())
    if unknown or missing:
        raise StoreError("invalid_state_schema", f"state fields mismatch; missing={missing}, unknown={unknown}")
    if state["schema_version"] != SCHEMA_VERSION:
        raise StoreError("unsupported_schema_version", "unsupported state schema_version")
    _validate_shop_domain(state["shop_domain"])
    if not isinstance(state["known_eligible_product_ids"], list) or not all(
        isinstance(item, str) for item in state["known_eligible_product_ids"]
    ):
        raise StoreError("invalid_state_schema", "known_eligible_product_ids must be an array of strings")
    _utc_iso(state["last_product_scan_at"], "last_product_scan_at")


def _validate_actions(actions_doc: dict[str, Any]) -> None:
    if set(actions_doc) != {"schema_version", "actions"} or actions_doc["schema_version"] != SCHEMA_VERSION:
        raise StoreError("invalid_actions_schema", "actions.json has an unsupported schema")
    if not isinstance(actions_doc["actions"], dict):
        raise StoreError("invalid_actions_schema", "actions must be an object")
    for key, action in actions_doc["actions"].items():
        _validate_action_key(key)
        required = {"action_type", "status", "payload_hash"}
        optional = {"preflight", "execution"}
        if not isinstance(action, dict) or not required <= set(action) or set(action) - required - optional:
            raise StoreError("invalid_actions_schema", f"action {key} has invalid fields")
        if action["action_type"] not in ACTION_TYPES or action["status"] not in ACTION_STATUSES:
            raise StoreError("invalid_actions_schema", f"action {key} has invalid enum values")
        if not isinstance(action["payload_hash"], str) or not re.fullmatch(r"sha256:[0-9a-f]{64}", action["payload_hash"]):
            raise StoreError("invalid_actions_schema", f"action {key} has invalid payload_hash")
        if "preflight" in action:
            _validate_preflight(action["preflight"], action["payload_hash"])
        execution = action.get("execution")
        if execution is not None:
            if action["status"] != "processing":
                raise StoreError("invalid_actions_schema", f"action {key} has an execution lease outside processing")
            if not isinstance(execution, dict) or set(execution) != {
                "execution_id",
                "started_at",
                "lease_expires_at",
            }:
                raise StoreError("invalid_actions_schema", f"action {key} has invalid execution fields")
            if not isinstance(execution["execution_id"], str) or not EXECUTION_ID_RE.fullmatch(
                execution["execution_id"]
            ):
                raise StoreError("invalid_actions_schema", f"action {key} has an invalid execution_id")
            started_at = _parse_utc(execution["started_at"], "started_at")
            lease_expires_at = _parse_utc(execution["lease_expires_at"], "lease_expires_at")
            if lease_expires_at <= started_at:
                raise StoreError("invalid_actions_schema", f"action {key} has a non-positive execution lease")


def _validate_campaigns(campaigns_doc: dict[str, Any]) -> None:
    if set(campaigns_doc) != {"schema_version", "campaigns"} or campaigns_doc["schema_version"] != SCHEMA_VERSION:
        raise StoreError("invalid_campaigns_schema", "campaigns.json has an unsupported schema")
    if not isinstance(campaigns_doc["campaigns"], dict):
        raise StoreError("invalid_campaigns_schema", "campaigns must be an object")
    for campaign_id, campaign in campaigns_doc["campaigns"].items():
        _validate_campaign_key(campaign_id)
        required = {
            "recommendation_id",
            "status",
            "product_id",
            "channel",
            "horizon_days",
            "created_at",
            "slots",
        }
        if not isinstance(campaign, dict) or set(campaign) != required:
            raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has invalid fields")
        if not isinstance(campaign["recommendation_id"], str) or not campaign["recommendation_id"]:
            raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has invalid recommendation_id")
        if campaign["status"] not in CAMPAIGN_STATUSES:
            raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has invalid status")
        if not isinstance(campaign["product_id"], str) or not campaign["product_id"].startswith("gid://shopify/Product/"):
            raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has invalid product_id")
        if campaign["channel"] not in {"instagram", "x"}:
            raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has invalid channel")
        if (
            isinstance(campaign["horizon_days"], bool)
            or not isinstance(campaign["horizon_days"], int)
            or not 1 <= campaign["horizon_days"] <= 31
        ):
            raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has invalid horizon_days")
        _required_utc_iso(campaign["created_at"], "created_at")
        if not isinstance(campaign["slots"], list) or not campaign["slots"]:
            raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} must have slots")
        seen_slots: set[str] = set()
        for slot in campaign["slots"]:
            required_slot = {"slot_id", "day", "content_pillar", "scheduled_for", "status", "action_key"}
            if not isinstance(slot, dict) or set(slot) != required_slot:
                raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has an invalid slot")
            slot_id = slot["slot_id"]
            if not isinstance(slot_id, str) or not re.fullmatch(r"slot_[a-z0-9][a-z0-9_-]{0,63}", slot_id):
                raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has invalid slot_id")
            if slot_id in seen_slots:
                raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has duplicate slot_id")
            seen_slots.add(slot_id)
            if (
                isinstance(slot["day"], bool)
                or not isinstance(slot["day"], int)
                or not 1 <= slot["day"] <= campaign["horizon_days"]
            ):
                raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has invalid slot day")
            if not isinstance(slot["content_pillar"], str) or not slot["content_pillar"]:
                raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has invalid content_pillar")
            _required_utc_iso(slot["scheduled_for"], "scheduled_for")
            if slot["status"] not in CAMPAIGN_SLOT_STATUSES:
                raise StoreError("invalid_campaigns_schema", f"campaign {campaign_id} has invalid slot status")
            if slot["action_key"] is not None:
                _validate_action_key(slot["action_key"])


def _payload_path(root: Path, key: str) -> Path:
    return root / "action-payloads" / f"{_validate_action_key(key)}.json"


@contextlib.contextmanager
def _locked(root: Path) -> Iterator[None]:
    _secure_root(root)
    lock_path = root / "state.lock"
    _safe_file(lock_path, may_not_exist=True)
    descriptor = os.open(lock_path, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        os.fchmod(descriptor, 0o600)
        fcntl.flock(descriptor, fcntl.LOCK_EX)
        yield
    finally:
        fcntl.flock(descriptor, fcntl.LOCK_UN)
        os.close(descriptor)


def _load_locked(root: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    state = _read_json(root / "state.json")
    actions_doc = _read_json(root / "actions.json")
    _validate_state(state)
    _validate_actions(actions_doc)
    return state, actions_doc


def _load_campaigns_locked(root: Path, *, create_if_missing: bool = True) -> dict[str, Any]:
    path = root / "campaigns.json"
    if not path.exists():
        if not create_if_missing:
            return _default_campaigns()
        _atomic_write(path, _default_campaigns())
    campaigns_doc = _read_json(path)
    _validate_campaigns(campaigns_doc)
    return campaigns_doc


def _cleanup_store_files_locked(root: Path, actions_doc: dict[str, Any]) -> tuple[bool, list[str]]:
    changed = False
    notes: list[str] = []
    actions = actions_doc["actions"]

    for key, action in actions.items():
        payload_path = _payload_path(root, key)
        _safe_file(payload_path, may_not_exist=True)
        if not payload_path.exists():
            raise StoreError("missing_action_payload", f"action {key} has no payload; execution is blocked")

    for payload_path in (root / "action-payloads").glob("*.json"):
        if payload_path.is_symlink() or not payload_path.is_file():
            raise StoreError("unsafe_store_file", f"unsafe payload entry: {payload_path.name}")
        key = payload_path.stem
        if key not in actions:
            payload_path.unlink()
            changed = True
            notes.append(f"orphan_payload_removed:{key}")

    for temp_path in root.rglob(".*.tmp"):
        if temp_path.is_file() and not temp_path.is_symlink():
            temp_path.unlink()
            changed = True
            notes.append(f"temporary_file_removed:{temp_path.name}")

    return changed, notes


def _recover_locked(
    root: Path,
    actions_doc: dict[str, Any],
    *,
    now: datetime | None = None,
) -> tuple[bool, list[str]]:
    changed, notes = _cleanup_store_files_locked(root, actions_doc)
    current_time = (now or _utc_now()).astimezone(timezone.utc)
    for key, action in actions_doc["actions"].items():
        if action["status"] != "processing":
            continue
        execution = action.get("execution")
        lease_expired = execution is None or _parse_utc(
            execution["lease_expires_at"], "lease_expires_at"
        ) <= current_time
        if not lease_expired:
            continue
        payload_path = _payload_path(root, key)
        action["status"] = "failed"
        action.pop("execution", None)
        if (root / "campaigns.json").exists():
            payload = _validate_payload(action["action_type"], _read_json(payload_path))
            _update_campaign_for_action_locked(root, payload, key, "failed")
        changed = True
        notes.append(f"expired_processing_recovered_to_failed:{key}")

    if changed:
        _atomic_write(root / "actions.json", actions_doc)
    return changed, notes


def initialise(root: Path, shop_domain: str) -> tuple[bool, dict[str, Any]]:
    domain = _validate_shop_domain(shop_domain)
    with _locked(root):
        state_path = root / "state.json"
        actions_path = root / "actions.json"
        campaigns_path = root / "campaigns.json"
        if state_path.exists() or actions_path.exists() or campaigns_path.exists():
            if not state_path.exists() or not actions_path.exists():
                raise StoreError("partial_initialisation", "state.json and actions.json must both exist")
            state, actions_doc = _load_locked(root)
            if state["shop_domain"] != domain:
                raise StoreError("shop_domain_mismatch", "store root already belongs to another shop")
            cleaned, notes = _cleanup_store_files_locked(root, actions_doc)
            campaigns_created = False
            if campaigns_path.exists():
                _load_campaigns_locked(root)
            else:
                _atomic_write(campaigns_path, _default_campaigns())
                campaigns_created = True
                notes.append("campaigns_store_initialized")
            return cleaned or campaigns_created, {"state": state, "recovery": notes}
        state = _default_state(domain)
        _atomic_write(actions_path, _default_actions())
        _atomic_write(campaigns_path, _default_campaigns())
        _atomic_write(state_path, state)
        return True, {"state": state, "recovery": []}


def load_snapshot(root: Path) -> dict[str, Any]:
    with _locked(root):
        state, actions_doc = _load_locked(root)
        campaigns_doc = _load_campaigns_locked(root, create_if_missing=False)
        return {
            "state": copy.deepcopy(state),
            "actions": copy.deepcopy(actions_doc["actions"]),
            "campaigns": copy.deepcopy(campaigns_doc["campaigns"]),
            "recovery": {"changed": False, "notes": []},
        }


def _load_payload_file(path: str) -> dict[str, Any]:
    source = Path(path)
    if path == "-":
        try:
            value = json.load(sys.stdin)
        except json.JSONDecodeError as exc:
            raise StoreError("invalid_input_json", "stdin does not contain valid JSON") from exc
    else:
        if source.is_symlink() or not source.is_file():
            raise StoreError("invalid_input_file", "input must be a regular JSON file")
        try:
            value = json.loads(source.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise StoreError("invalid_input_json", "input file does not contain valid JSON") from exc
    if not isinstance(value, dict):
        raise StoreError("invalid_input_json", "input must be a JSON object")
    return value


def _new_action(action_type: str, payload: dict[str, Any]) -> dict[str, Any]:
    clean = _validate_payload(action_type, payload)
    current_hash = payload_hash(clean)
    return {
        "action_type": action_type,
        "status": "pending",
        "payload_hash": current_hash,
        "preflight": _unreviewed_preflight(current_hash),
    }


def patrol_commit(root: Path, input_path: str) -> tuple[bool, dict[str, Any]]:
    request = _load_payload_file(input_path)
    if set(request) != {"state_changes", "new_actions"}:
        raise StoreError("invalid_patrol_result", "patrol result must contain only state_changes and new_actions")
    if not isinstance(request["state_changes"], dict) or not isinstance(request["new_actions"], list):
        raise StoreError("invalid_patrol_result", "state_changes must be an object and new_actions an array")
    unknown_changes = sorted(request["state_changes"].keys() - STATE_CHANGE_KEYS)
    if unknown_changes:
        raise StoreError("invalid_patrol_result", f"unsupported state changes: {', '.join(unknown_changes)}")

    with _locked(root):
        state, actions_doc = _load_locked(root)
        state_next = copy.deepcopy(state)
        actions_next = copy.deepcopy(actions_doc)
        created: list[str] = []
        reused: list[str] = []
        pending_payload_writes: list[tuple[Path, dict[str, Any]]] = []

        changes = request["state_changes"]
        if "last_product_scan_at" in changes and changes["last_product_scan_at"] is not None:
            state_next["last_product_scan_at"] = _utc_iso(changes["last_product_scan_at"], "last_product_scan_at")
        added_ids = changes.get("add_known_product_ids") or []
        if not isinstance(added_ids, list) or not all(isinstance(item, str) for item in added_ids):
            raise StoreError("invalid_patrol_result", "add_known_product_ids must be an array of strings")
        state_next["known_eligible_product_ids"] = sorted(set(state_next["known_eligible_product_ids"]) | set(added_ids))

        for item in request["new_actions"]:
            if not isinstance(item, dict) or set(item) != {"dedupe_key", "action_type", "payload"}:
                raise StoreError("invalid_patrol_result", "each new action must contain dedupe_key, action_type, payload")
            key = action_key(item["dedupe_key"])
            clean_payload = _validate_payload(item["action_type"], item["payload"])
            existing = actions_next["actions"].get(key)
            if existing:
                if existing["action_type"] != item["action_type"]:
                    raise StoreError("action_collision", f"action key collision for {key}")
                if existing["payload_hash"] != payload_hash(clean_payload):
                    raise StoreError("dedupe_payload_mismatch", f"existing action {key} has a different payload")
                reused.append(key)
                continue
            actions_next["actions"][key] = _new_action(item["action_type"], clean_payload)
            pending_payload_writes.append((_payload_path(root, key), clean_payload))
            created.append(key)

        _validate_state(state_next)
        _validate_actions(actions_next)
        changed = state_next != state or actions_next != actions_doc
        if changed:
            for path, payload in pending_payload_writes:
                _atomic_write(path, payload)
            _atomic_write(root / "actions.json", actions_next)
            _atomic_write(root / "state.json", state_next)
        return changed, {"created_action_keys": created, "reused_action_keys": reused, "state": state_next}


def action_create(root: Path, action_type: str, request_token: str, payload_file: str) -> tuple[bool, dict[str, Any]]:
    if not isinstance(request_token, str) or not request_token.strip():
        raise StoreError("invalid_request_token", "request_token must be non-empty")
    payload = _validate_payload(action_type, _load_payload_file(payload_file))
    key = action_key(f"manual:{action_type}:{request_token}")
    with _locked(root):
        _, actions_doc = _load_locked(root)
        existing = actions_doc["actions"].get(key)
        if existing:
            if existing["action_type"] != action_type:
                raise StoreError("action_collision", f"action key collision for {key}")
            if existing["payload_hash"] != payload_hash(payload):
                raise StoreError("request_token_payload_mismatch", "request_token already belongs to a different payload")
            return False, {"action_key": key, "action": existing, "reused": True}
        action = _new_action(action_type, payload)
        _atomic_write(_payload_path(root, key), payload)
        actions_doc["actions"][key] = action
        _atomic_write(root / "actions.json", actions_doc)
        return True, {"action_key": key, "action": action, "reused": False}


def action_replace_payload(root: Path, key: str, payload_file: str) -> tuple[bool, dict[str, Any]]:
    key = _validate_action_key(key)
    with _locked(root):
        _, actions_doc = _load_locked(root)
        action = actions_doc["actions"].get(key)
        if not action:
            raise StoreError("action_not_found", f"action not found: {key}")
        if action["status"] not in {"pending", "failed"}:
            raise StoreError("invalid_status_transition", "payload can only be replaced while pending or failed")
        existing_payload = _validate_payload(action["action_type"], _read_json(_payload_path(root, key)))
        payload = _validate_payload(action["action_type"], _load_payload_file(payload_file))
        association_fields = ("campaign_id", "slot_id", "scheduled_for")
        if any(existing_payload.get(field) != payload.get(field) for field in association_fields):
            raise StoreError(
                "campaign_action_mismatch",
                "replace-payload cannot change Campaign association or schedule; reject and create a new slot action",
            )
        _assert_campaign_action_bound_locked(root, payload, key)
        new_hash = payload_hash(payload)
        new_preflight = _unreviewed_preflight(new_hash, "PREFLIGHT_REQUIRED_AFTER_EDIT")
        changed = (
            action["payload_hash"] != new_hash
            or action["status"] != "pending"
            or action.get("preflight") != new_preflight
        )
        _atomic_write(_payload_path(root, key), payload)
        action["payload_hash"] = new_hash
        action["status"] = "pending"
        action["preflight"] = new_preflight
        _atomic_write(root / "actions.json", actions_doc)
        _update_campaign_for_action_locked(root, payload, key, "action_created")
        return changed, {"action_key": key, "action": action}


def _load_social_preflight_module() -> Any:
    candidates = [
        Path(__file__).with_name("social_publish_preflight.py"),
        Path(__file__).resolve().parents[3] / "shopify-marketing" / "scripts" / "social_publish_preflight.py",
    ]
    for candidate in candidates:
        if candidate.is_file() and not candidate.is_symlink():
            spec = importlib.util.spec_from_file_location("shopify_social_publish_preflight_runtime", candidate)
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                return module
    raise StoreError("preflight_unavailable", "social_publish_preflight.py is unavailable")


def action_run_preflight(root: Path, key: str, input_file: str) -> tuple[bool, dict[str, Any]]:
    key = _validate_action_key(key)
    candidate = _load_payload_file(input_file)
    preflight_module = _load_social_preflight_module()
    try:
        preflight = preflight_module.evaluate(candidate)
    except preflight_module.PreflightError as exc:
        raise StoreError("preflight_input_rejected", str(exc)) from exc
    with _locked(root):
        _, actions_doc = _load_locked(root)
        action = actions_doc["actions"].get(key)
        if not action:
            raise StoreError("action_not_found", f"action not found: {key}")
        if action["status"] != "pending":
            raise StoreError(
                "invalid_status_transition",
                "preflight can only be attached while pending; failed actions need explicit retry first",
            )
        preflight = _validate_preflight(preflight, action["payload_hash"])
        payload = _validate_payload(action["action_type"], _read_json(_payload_path(root, key)))
        _assert_campaign_action_bound_locked(root, payload, key)
        changed = action.get("preflight") != preflight
        action["preflight"] = preflight
        _atomic_write(root / "actions.json", actions_doc)
        _update_campaign_for_action_locked(root, payload, key, "action_created")
        return changed, {"action_key": key, "action": action}


def action_retry(root: Path, key: str) -> tuple[bool, dict[str, Any]]:
    key = _validate_action_key(key)
    with _locked(root):
        _, actions_doc = _load_locked(root)
        action = actions_doc["actions"].get(key)
        if not action:
            raise StoreError("action_not_found", f"action not found: {key}")
        if action["status"] != "failed":
            raise StoreError("invalid_status_transition", "only failed actions can be prepared for an explicit retry")
        payload = _validate_payload(action["action_type"], _read_json(_payload_path(root, key)))
        _assert_campaign_action_bound_locked(root, payload, key)
        action["status"] = "pending"
        _atomic_write(root / "actions.json", actions_doc)
        _update_campaign_for_action_locked(root, payload, key, "action_created")
        return True, {"action_key": key, "action": action, "requires_exact_confirmation": True}


def action_begin(
    root: Path,
    key: str,
    expected_hash: str,
    connected_account_id: str,
    *,
    now: datetime | None = None,
    execution_id: str | None = None,
) -> tuple[bool, dict[str, Any]]:
    key = _validate_action_key(key)
    current_time = (now or _utc_now()).astimezone(timezone.utc)
    current_execution_id = execution_id or f"exec_{secrets.token_hex(16)}"
    if not EXECUTION_ID_RE.fullmatch(current_execution_id):
        raise StoreError("invalid_execution_id", "execution_id has an invalid format")
    with _locked(root):
        _, actions_doc = _load_locked(root)
        action = actions_doc["actions"].get(key)
        if not action:
            raise StoreError("action_not_found", f"action not found: {key}")
        if action["status"] != "pending":
            raise StoreError("invalid_status_transition", "only pending actions can begin; failed actions need explicit retry")
        if action["payload_hash"] != expected_hash:
            raise StoreError("payload_hash_mismatch", "confirmed payload hash does not match the current payload")
        payload = _validate_payload(action["action_type"], _read_json(_payload_path(root, key)))
        if payload_hash(payload) != action["payload_hash"]:
            raise StoreError("stored_payload_hash_mismatch", "stored payload does not match the action hash")
        if payload["connected_account_id"] != connected_account_id:
            raise StoreError("connected_account_mismatch", "current connector account does not match the confirmed payload")
        _assert_campaign_action_bound_locked(root, payload, key)
        preflight = action.get("preflight") or _unreviewed_preflight(
            action["payload_hash"], "PREFLIGHT_REQUIRED_AFTER_MIGRATION"
        )
        _validate_preflight(preflight, action["payload_hash"])
        if preflight["policy_result"] not in {"pass", "warning"}:
            raise StoreError("preflight_not_releasable", "current payload has no releasable deterministic preflight")
        action["status"] = "processing"
        action["preflight"] = preflight
        action["execution"] = {
            "execution_id": current_execution_id,
            "started_at": _format_utc(current_time),
            "lease_expires_at": _format_utc(current_time + timedelta(seconds=EXECUTION_LEASE_SECONDS)),
        }
        _atomic_write(root / "actions.json", actions_doc)
        _update_campaign_for_action_locked(root, payload, key, "publishing")
        return True, {
            "action_key": key,
            "action": action,
            "execution_payload": payload,
            "execution_id": current_execution_id,
            "lease_expires_at": action["execution"]["lease_expires_at"],
            "transformations_allowed": False,
        }


def action_heartbeat(
    root: Path,
    key: str,
    execution_id: str,
    *,
    now: datetime | None = None,
) -> tuple[bool, dict[str, Any]]:
    key = _validate_action_key(key)
    if not isinstance(execution_id, str) or not EXECUTION_ID_RE.fullmatch(execution_id):
        raise StoreError("invalid_execution_id", "execution_id has an invalid format")
    current_time = (now or _utc_now()).astimezone(timezone.utc)
    with _locked(root):
        _, actions_doc = _load_locked(root)
        action = actions_doc["actions"].get(key)
        if not action:
            raise StoreError("action_not_found", f"action not found: {key}")
        if action["status"] != "processing":
            raise StoreError("invalid_status_transition", "only processing actions can renew an execution lease")
        execution = action.get("execution")
        if not execution or execution["execution_id"] != execution_id:
            raise StoreError("execution_mismatch", "execution_id does not own the current processing action")
        current_expiry = _parse_utc(execution["lease_expires_at"], "lease_expires_at")
        if current_expiry <= current_time:
            raise StoreError("execution_lease_expired", "execution lease expired before heartbeat; run explicit recovery")
        renewed_expiry = current_time + timedelta(seconds=EXECUTION_LEASE_SECONDS)
        execution["lease_expires_at"] = _format_utc(max(current_expiry, renewed_expiry))
        _atomic_write(root / "actions.json", actions_doc)
        return True, {
            "action_key": key,
            "execution_id": execution_id,
            "lease_expires_at": execution["lease_expires_at"],
        }


def action_finish(
    root: Path,
    key: str,
    result: str,
    execution_id: str | None = None,
    *,
    now: datetime | None = None,
) -> tuple[bool, dict[str, Any]]:
    key = _validate_action_key(key)
    if result not in {"succeeded", "failed"}:
        raise StoreError("invalid_result", "result must be succeeded or failed")
    with _locked(root):
        _, actions_doc = _load_locked(root)
        action = actions_doc["actions"].get(key)
        if not action:
            raise StoreError("action_not_found", f"action not found: {key}")
        if action["status"] != "processing":
            raise StoreError("invalid_status_transition", "only processing actions can finish")
        execution = action.get("execution")
        if execution:
            if execution_id is None:
                raise StoreError("execution_id_required", "finish requires the execution_id returned by begin")
            if execution["execution_id"] != execution_id:
                raise StoreError("execution_mismatch", "execution_id does not own the current processing action")
            current_time = (now or _utc_now()).astimezone(timezone.utc)
            if _parse_utc(execution["lease_expires_at"], "lease_expires_at") <= current_time:
                raise StoreError("execution_lease_expired", "execution lease expired before finish; run explicit recovery")
        elif execution_id is not None:
            raise StoreError("execution_mismatch", "legacy processing action has no matching execution_id")
        payload = _validate_payload(action["action_type"], _read_json(_payload_path(root, key)))
        _assert_campaign_action_bound_locked(root, payload, key)
        action["status"] = result
        action.pop("execution", None)
        _atomic_write(root / "actions.json", actions_doc)
        _update_campaign_for_action_locked(root, payload, key, "published" if result == "succeeded" else "failed")
        return True, {"action_key": key, "action": action}


def action_finalize(root: Path, key: str) -> tuple[bool, dict[str, Any]]:
    key = _validate_action_key(key)
    with _locked(root):
        _, actions_doc = _load_locked(root)
        action = actions_doc["actions"].get(key)
        if not action:
            return False, {"action_key": key, "already_finalized": True}
        if action["status"] != "succeeded":
            raise StoreError("invalid_status_transition", "only succeeded actions can be finalized")
        _payload_path(root, key).unlink(missing_ok=True)
        del actions_doc["actions"][key]
        _atomic_write(root / "actions.json", actions_doc)
        return True, {"action_key": key, "finalized": True}


def action_reject(root: Path, key: str) -> tuple[bool, dict[str, Any]]:
    key = _validate_action_key(key)
    with _locked(root):
        _, actions_doc = _load_locked(root)
        action = actions_doc["actions"].get(key)
        if not action:
            return False, {"action_key": key, "already_absent": True}
        if action["status"] not in {"pending", "failed"}:
            raise StoreError("invalid_status_transition", "only pending or failed actions can be rejected")
        payload = _validate_payload(action["action_type"], _read_json(_payload_path(root, key)))
        campaign_id = payload.get("campaign_id")
        slot_id = payload.get("slot_id")
        if campaign_id and slot_id:
            campaigns_doc = _load_campaigns_locked(root)
            campaign = campaigns_doc["campaigns"].get(campaign_id)
            if not campaign:
                raise StoreError("campaign_not_found", f"campaign not found: {campaign_id}")
            slot = _campaign_slot(campaign, slot_id)
            if slot["action_key"] != key:
                raise StoreError("campaign_action_mismatch", "campaign slot is not bound to this action")
            slot["action_key"] = None
            slot["status"] = "planned"
            campaign["status"] = _derive_campaign_status(campaign)
            _validate_campaigns(campaigns_doc)
            _atomic_write(root / "campaigns.json", campaigns_doc)
        _payload_path(root, key).unlink(missing_ok=True)
        del actions_doc["actions"][key]
        _atomic_write(root / "actions.json", actions_doc)
        return True, {"action_key": key, "rejected": True}


def action_show(root: Path, key: str, include_payload: bool = False) -> dict[str, Any]:
    key = _validate_action_key(key)
    with _locked(root):
        _, actions_doc = _load_locked(root)
        action = actions_doc["actions"].get(key)
        if not action:
            raise StoreError("action_not_found", f"action not found: {key}")
        data: dict[str, Any] = {"action_key": key, "action": copy.deepcopy(action)}
        if include_payload:
            data["payload"] = _read_json(_payload_path(root, key))
        return data


def campaign_key(recommendation_id: str) -> str:
    if not isinstance(recommendation_id, str) or not recommendation_id.strip():
        raise StoreError("invalid_recommendation_id", "recommendation_id must be non-empty")
    return "camp_" + hashlib.sha256(recommendation_id.encode("utf-8")).hexdigest()[:32]


def campaign_create(root: Path, input_path: str) -> tuple[bool, dict[str, Any]]:
    request = _load_payload_file(input_path)
    required = {"recommendation_id", "product_id", "channel", "horizon_days", "created_at", "slots"}
    if set(request) != required:
        raise StoreError("invalid_campaign", "campaign draft fields are invalid")
    campaign_id = campaign_key(request["recommendation_id"])
    slots = request["slots"]
    if not isinstance(slots, list) or not slots:
        raise StoreError("invalid_campaign", "campaign draft must contain at least one slot")
    campaign = {
        "recommendation_id": request["recommendation_id"],
        "status": "drafting",
        "product_id": request["product_id"],
        "channel": request["channel"],
        "horizon_days": request["horizon_days"],
        "created_at": request["created_at"],
        "slots": [],
    }
    for raw_slot in slots:
        if not isinstance(raw_slot, dict) or set(raw_slot) != {"slot_id", "day", "content_pillar", "scheduled_for"}:
            raise StoreError("invalid_campaign", "campaign slot fields are invalid")
        campaign["slots"].append(
            {
                "slot_id": raw_slot["slot_id"],
                "day": raw_slot["day"],
                "content_pillar": raw_slot["content_pillar"],
                "scheduled_for": raw_slot["scheduled_for"],
                "status": "planned",
                "action_key": None,
            }
        )
    candidate = {"schema_version": SCHEMA_VERSION, "campaigns": {campaign_id: campaign}}
    _validate_campaigns(candidate)
    with _locked(root):
        campaigns_doc = _load_campaigns_locked(root)
        existing = campaigns_doc["campaigns"].get(campaign_id)
        if existing:
            existing_identity = copy.deepcopy(existing)
            existing_identity["status"] = "drafting"
            for slot in existing_identity["slots"]:
                slot["status"] = "planned"
                slot["action_key"] = None
            if canonical_json(existing_identity) != canonical_json(campaign):
                raise StoreError("campaign_identity_mismatch", "recommendation_id already belongs to a different campaign")
            return False, {"campaign_id": campaign_id, "campaign": existing, "reused": True}
        campaigns_doc["campaigns"][campaign_id] = campaign
        _validate_campaigns(campaigns_doc)
        _atomic_write(root / "campaigns.json", campaigns_doc)
        return True, {"campaign_id": campaign_id, "campaign": campaign, "reused": False}


def _campaign_slot(campaign: dict[str, Any], slot_id: str) -> dict[str, Any]:
    for slot in campaign["slots"]:
        if slot["slot_id"] == slot_id:
            return slot
    raise StoreError("campaign_slot_not_found", f"campaign slot not found: {slot_id}")


def _derive_campaign_status(campaign: dict[str, Any]) -> str:
    statuses = {slot["status"] for slot in campaign["slots"]}
    if statuses == {"published"}:
        return "completed"
    if "publishing" in statuses or "published" in statuses:
        return "active"
    if statuses <= {"action_created"}:
        return "materialized"
    return "drafting"


def campaign_attach_action(root: Path, campaign_id: str, slot_id: str, key: str) -> tuple[bool, dict[str, Any]]:
    campaign_id = _validate_campaign_key(campaign_id)
    key = _validate_action_key(key)
    with _locked(root):
        _, actions_doc = _load_locked(root)
        campaigns_doc = _load_campaigns_locked(root)
        campaign = campaigns_doc["campaigns"].get(campaign_id)
        if not campaign:
            raise StoreError("campaign_not_found", f"campaign not found: {campaign_id}")
        action = actions_doc["actions"].get(key)
        if not action:
            raise StoreError("action_not_found", f"action not found: {key}")
        payload = _validate_payload(action["action_type"], _read_json(_payload_path(root, key)))
        if payload.get("campaign_id") != campaign_id or payload.get("slot_id") != slot_id:
            raise StoreError("campaign_action_mismatch", "action payload does not belong to this campaign slot")
        if payload["platform"] != campaign["channel"] or campaign["product_id"] not in payload["product_ids"]:
            raise StoreError("campaign_action_mismatch", "action platform or product does not match the campaign")
        slot = _campaign_slot(campaign, slot_id)
        if payload.get("scheduled_for") != slot["scheduled_for"]:
            raise StoreError("campaign_action_mismatch", "action schedule does not match the campaign slot")
        if slot["action_key"] not in {None, key}:
            raise StoreError("campaign_slot_already_bound", "campaign slot already belongs to another action")
        action_slot_status = {
            "pending": "action_created",
            "processing": "publishing",
            "succeeded": "published",
            "failed": "failed",
        }[action["status"]]
        changed = slot["action_key"] != key or slot["status"] != action_slot_status
        slot["action_key"] = key
        slot["status"] = action_slot_status
        campaign["status"] = _derive_campaign_status(campaign)
        _validate_campaigns(campaigns_doc)
        _atomic_write(root / "campaigns.json", campaigns_doc)
        return changed, {"campaign_id": campaign_id, "campaign": campaign, "slot": slot}


def campaign_show(root: Path, campaign_id: str) -> dict[str, Any]:
    campaign_id = _validate_campaign_key(campaign_id)
    with _locked(root):
        campaigns_doc = _load_campaigns_locked(root)
        campaign = campaigns_doc["campaigns"].get(campaign_id)
        if not campaign:
            raise StoreError("campaign_not_found", f"campaign not found: {campaign_id}")
        return {"campaign_id": campaign_id, "campaign": copy.deepcopy(campaign)}


def _update_campaign_for_action_locked(
    root: Path,
    payload: dict[str, Any],
    key: str,
    slot_status: str,
) -> None:
    campaign_id = payload.get("campaign_id")
    slot_id = payload.get("slot_id")
    if not campaign_id or not slot_id:
        return
    campaigns_doc, campaign, slot = _campaign_action_binding_locked(root, payload, key)
    slot["status"] = slot_status
    campaign["status"] = _derive_campaign_status(campaign)
    _validate_campaigns(campaigns_doc)
    _atomic_write(root / "campaigns.json", campaigns_doc)


def _campaign_action_binding_locked(
    root: Path,
    payload: dict[str, Any],
    key: str,
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    campaign_id = payload.get("campaign_id")
    slot_id = payload.get("slot_id")
    if not campaign_id or not slot_id:
        raise StoreError("campaign_action_mismatch", "action has no Campaign association")
    campaigns_doc = _load_campaigns_locked(root)
    campaign = campaigns_doc["campaigns"].get(campaign_id)
    if not campaign:
        raise StoreError("campaign_not_found", f"campaign not found: {campaign_id}")
    slot = _campaign_slot(campaign, slot_id)
    if slot["action_key"] != key:
        raise StoreError("campaign_action_mismatch", "campaign slot is not bound to this action")
    if payload["platform"] != campaign["channel"] or campaign["product_id"] not in payload["product_ids"]:
        raise StoreError("campaign_action_mismatch", "action platform or product does not match the campaign")
    if payload.get("scheduled_for") != slot["scheduled_for"]:
        raise StoreError("campaign_action_mismatch", "action schedule does not match the campaign slot")
    return campaigns_doc, campaign, slot


def _assert_campaign_action_bound_locked(root: Path, payload: dict[str, Any], key: str) -> None:
    if payload.get("campaign_id"):
        _campaign_action_binding_locked(root, payload, key)


def recover(root: Path, *, now: datetime | None = None) -> tuple[bool, dict[str, Any]]:
    with _locked(root):
        _, actions_doc = _load_locked(root)
        changed, notes = _recover_locked(root, actions_doc, now=now)
        return changed, {"notes": notes}


def _emit(data: dict[str, Any], *, changed: bool = False) -> None:
    print(json.dumps({"status": "ok", "changed": changed, "data": data}, ensure_ascii=False, sort_keys=True))


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default="project/.shopify-social-patrol")
    commands = parser.add_subparsers(dest="command", required=True)

    init_cmd = commands.add_parser("init")
    init_cmd.add_argument("--shop-domain", required=True)
    commands.add_parser("snapshot")
    commands.add_parser("recover")

    state_cmd = commands.add_parser("state")
    state_sub = state_cmd.add_subparsers(dest="state_command", required=True)
    state_sub.add_parser("show")

    patrol_cmd = commands.add_parser("patrol")
    patrol_sub = patrol_cmd.add_subparsers(dest="patrol_command", required=True)
    patrol_commit_cmd = patrol_sub.add_parser("commit")
    patrol_commit_cmd.add_argument("--input", required=True)

    action_cmd = commands.add_parser("action")
    action_sub = action_cmd.add_subparsers(dest="action_command", required=True)
    for name in ("show", "payload-show", "finalize", "reject", "retry"):
        cmd = action_sub.add_parser(name)
        cmd.add_argument("--action-key", required=True)
    create_cmd = action_sub.add_parser("create")
    create_cmd.add_argument("--action-type", required=True, choices=sorted(ACTION_TYPES))
    create_cmd.add_argument("--request-token", required=True)
    create_cmd.add_argument("--payload-file", required=True)
    replace_cmd = action_sub.add_parser("replace-payload")
    replace_cmd.add_argument("--action-key", required=True)
    replace_cmd.add_argument("--payload-file", required=True)
    preflight_cmd = action_sub.add_parser("preflight")
    preflight_cmd.add_argument("--action-key", required=True)
    preflight_cmd.add_argument("--input", required=True)
    begin_cmd = action_sub.add_parser("begin")
    begin_cmd.add_argument("--action-key", required=True)
    begin_cmd.add_argument("--expected-payload-hash", required=True)
    begin_cmd.add_argument("--connected-account-id", required=True)
    heartbeat_cmd = action_sub.add_parser("heartbeat")
    heartbeat_cmd.add_argument("--action-key", required=True)
    heartbeat_cmd.add_argument("--execution-id", required=True)
    finish_cmd = action_sub.add_parser("finish")
    finish_cmd.add_argument("--action-key", required=True)
    finish_cmd.add_argument("--result", required=True, choices=["succeeded", "failed"])
    finish_cmd.add_argument("--execution-id", required=True)

    campaign_cmd = commands.add_parser("campaign")
    campaign_sub = campaign_cmd.add_subparsers(dest="campaign_command", required=True)
    campaign_create_cmd = campaign_sub.add_parser("create")
    campaign_create_cmd.add_argument("--input", required=True)
    campaign_show_cmd = campaign_sub.add_parser("show")
    campaign_show_cmd.add_argument("--campaign-id", required=True)
    campaign_attach_cmd = campaign_sub.add_parser("attach-action")
    campaign_attach_cmd.add_argument("--campaign-id", required=True)
    campaign_attach_cmd.add_argument("--slot-id", required=True)
    campaign_attach_cmd.add_argument("--action-key", required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    root = Path(args.root).resolve()
    try:
        if args.command == "init":
            changed, data = initialise(root, args.shop_domain)
        elif args.command == "snapshot":
            data = load_snapshot(root)
            changed = data["recovery"]["changed"]
        elif args.command == "recover":
            changed, data = recover(root)
        elif args.command == "state" and args.state_command == "show":
            data = load_snapshot(root)["state"]
            changed = False
        elif args.command == "patrol" and args.patrol_command == "commit":
            changed, data = patrol_commit(root, args.input)
        elif args.command == "action":
            if args.action_command == "create":
                changed, data = action_create(root, args.action_type, args.request_token, args.payload_file)
            elif args.action_command == "replace-payload":
                changed, data = action_replace_payload(root, args.action_key, args.payload_file)
            elif args.action_command == "preflight":
                changed, data = action_run_preflight(root, args.action_key, args.input)
            elif args.action_command == "begin":
                changed, data = action_begin(
                    root,
                    args.action_key,
                    args.expected_payload_hash,
                    args.connected_account_id,
                )
            elif args.action_command == "finish":
                changed, data = action_finish(root, args.action_key, args.result, args.execution_id)
            elif args.action_command == "heartbeat":
                changed, data = action_heartbeat(root, args.action_key, args.execution_id)
            elif args.action_command == "finalize":
                changed, data = action_finalize(root, args.action_key)
            elif args.action_command == "reject":
                changed, data = action_reject(root, args.action_key)
            elif args.action_command == "retry":
                changed, data = action_retry(root, args.action_key)
            elif args.action_command == "payload-show":
                data = action_show(root, args.action_key, include_payload=True)
                changed = False
            else:
                data = action_show(root, args.action_key)
                changed = False
        elif args.command == "campaign":
            if args.campaign_command == "create":
                changed, data = campaign_create(root, args.input)
            elif args.campaign_command == "show":
                data = campaign_show(root, args.campaign_id)
                changed = False
            else:
                changed, data = campaign_attach_action(root, args.campaign_id, args.slot_id, args.action_key)
        else:  # pragma: no cover - argparse prevents this
            raise StoreError("invalid_command", "unsupported command")
        _emit(data, changed=changed)
        return 0
    except StoreError as exc:
        print(json.dumps({"status": "error", "error_code": exc.code, "message": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2
    except Exception as exc:  # pragma: no cover - final safety net
        print(
            json.dumps(
                {"status": "error", "error_code": "internal_error", "message": f"{type(exc).__name__}: {exc}"},
                ensure_ascii=False,
            ),
            file=sys.stderr,
        )
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
