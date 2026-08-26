#!/usr/bin/env python3
"""Deterministic release preflight for one exact social publish payload."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import stat
import sys
from pathlib import Path
from typing import Any


class PreflightError(RuntimeError):
    pass


def _load_patrol_store():
    candidates = [
        Path(__file__).with_name("patrol_store.py"),
        Path(__file__).resolve().parents[2]
        / "dtc-monitoring-and-daily-report"
        / "templates"
        / "scripts"
        / "patrol_store.py",
    ]
    for candidate in candidates:
        if candidate.is_file() and not candidate.is_symlink():
            spec = importlib.util.spec_from_file_location("shopify_social_patrol_store", candidate)
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                return module
    raise PreflightError("patrol_store.py is unavailable; deterministic payload hashing cannot continue")


STORE = _load_patrol_store()
REASON_CODE_RE = re.compile(r"^[A-Z][A-Z0-9_]{1,63}$")

RISK_TOKEN_PATTERNS = (
    re.compile(
        r"(?<![\w.])\d+(?:[.,]\d+)?\s*(?:%|kg|g|lb|lbs|cm|mm|m²|㎡|m|天|日|days?|hours?|小时|年|years?|usd|rmb|cny|元|\$|€|£)",
        re.IGNORECASE,
    ),
    re.compile(r"(?:[$€£¥]|USD\s*|RMB\s*|CNY\s*)\d+(?:[.,]\d+)?", re.IGNORECASE),
    re.compile(r"限时优惠|限时|优惠|折扣|免费|赠送|discount|sale|\boff\b|\bfree\b", re.IGNORECASE),
    re.compile(r"\bCE\b|\bGPSR\b|\bRoHS\b|认证|certified|certification", re.IGNORECASE),
    re.compile(r"质保|保修|保证|warranty|guarantee", re.IGNORECASE),
    re.compile(r"仅剩|最后\s*\d+|only\s+\d+\s+left|selling fast", re.IGNORECASE),
)

EXPLANATIONS = {
    "ACCOUNT_BINDING_MISMATCH": "The resolved connector account differs from the payload account.",
    "CLAIM_LEDGER_INCOMPLETE": "The candidate did not attest that every factual claim was reviewed.",
    "CLAIM_NOT_VERIFIED": "At least one declared factual claim is unverified or contradicted.",
    "RISKY_CLAIM_WITHOUT_EVIDENCE": "A numeric, promotional, certification, warranty, or scarcity claim lacks a verified text fragment.",
    "SYNTHETIC_MEDIA_IDENTITY_NOT_VERIFIED": "Synthetic or composited media was not verified against the Shopify product identity.",
    "SYNTHETIC_MEDIA_REQUIRES_REVIEW": "Synthetic or composited product media requires merchant review.",
    "INSTAGRAM_CAPTION_URL_NON_CLICKABLE": "Instagram Feed caption URLs are non-clickable and must not be the primary CTA.",
    "INSTAGRAM_NONCLICKABLE_CTA_COPY": "The caption tells shoppers to click a non-clickable Feed caption URL.",
    "MEDIA_POLICY_WARNING": "The media check returned a warning.",
    "MEDIA_POLICY_BLOCK": "The media check blocked release.",
    "PLATFORM_POLICY_WARNING": "The platform policy check returned a warning.",
    "PLATFORM_POLICY_BLOCK": "The platform policy check blocked release.",
    "POLICY_PASS": "The exact payload passed deterministic release checks.",
}


def _load_json(path: str) -> dict[str, Any]:
    if path == "-":
        try:
            value = json.load(sys.stdin)
        except json.JSONDecodeError as exc:
            raise PreflightError("stdin does not contain valid JSON") from exc
    else:
        source = Path(path)
        try:
            info = source.lstat()
        except FileNotFoundError as exc:
            raise PreflightError("input must be an existing regular JSON file") from exc
        if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
            raise PreflightError("input must be a regular JSON file")
        try:
            value = json.loads(source.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise PreflightError("input does not contain valid JSON") from exc
    if not isinstance(value, dict):
        raise PreflightError("input must be a JSON object")
    return value


def _validate_check(name: str, value: Any) -> dict[str, Any]:
    required = {"result", "reason_codes"}
    if not isinstance(value, dict) or set(value) != required:
        raise PreflightError(f"{name} must contain result and reason_codes")
    if value["result"] not in {"pass", "warning", "block"}:
        raise PreflightError(f"{name}.result is invalid")
    if not isinstance(value["reason_codes"], list) or not all(
        isinstance(item, str) and REASON_CODE_RE.fullmatch(item) for item in value["reason_codes"]
    ):
        raise PreflightError(f"{name}.reason_codes must be stable uppercase codes")
    return value


def _claim_checks(value: Any) -> tuple[list[str], bool]:
    if not isinstance(value, list):
        raise PreflightError("claim_checks must be an array")
    verified_fragments: list[str] = []
    has_invalid = False
    for item in value:
        required = {"text_fragment", "status", "source"}
        if not isinstance(item, dict) or set(item) != required:
            raise PreflightError("each claim check must contain text_fragment, status, and source")
        fragment = item["text_fragment"]
        status = item["status"]
        source = item["source"]
        if not isinstance(fragment, str) or not fragment.strip():
            raise PreflightError("claim text_fragment must be non-empty")
        if status not in {"verified", "unverified", "contradicted"}:
            raise PreflightError("claim status is invalid")
        if not isinstance(source, str):
            raise PreflightError("claim source must be a string")
        if status == "verified":
            if not source.strip():
                raise PreflightError("verified claims require a source")
            if not re.match(r"^(?:shopify|merchant|public):\S", source, re.IGNORECASE):
                raise PreflightError("verified claim sources must use shopify:, merchant:, or public:")
            verified_fragments.append(fragment.casefold())
        else:
            has_invalid = True
    return verified_fragments, has_invalid


def _risky_tokens(text: str) -> list[str]:
    tokens: list[str] = []
    for pattern in RISK_TOKEN_PATTERNS:
        tokens.extend(match.group(0) for match in pattern.finditer(text))
    return sorted(set(tokens), key=str.casefold)


def evaluate(value: dict[str, Any]) -> dict[str, Any]:
    required = {
        "payload",
        "resolved_connected_account_id",
        "claims_complete",
        "claim_checks",
        "media_check",
        "platform_check",
    }
    if set(value) != required:
        raise PreflightError("preflight input fields are invalid")

    try:
        payload = STORE._validate_payload("social_publish", value["payload"])
    except STORE.StoreError as exc:
        raise PreflightError(str(exc)) from exc
    current_hash = STORE.payload_hash(payload)
    resolved_account = value["resolved_connected_account_id"]
    if not isinstance(resolved_account, str) or not resolved_account:
        raise PreflightError("resolved_connected_account_id must be non-empty")
    if not isinstance(value["claims_complete"], bool):
        raise PreflightError("claims_complete must be boolean")

    verified_fragments, invalid_claim = _claim_checks(value["claim_checks"])
    media_check = _validate_check("media_check", value["media_check"])
    platform_check = _validate_check("platform_check", value["platform_check"])

    blocks: set[str] = set()
    warnings: set[str] = set()
    if payload["connected_account_id"] != resolved_account:
        blocks.add("ACCOUNT_BINDING_MISMATCH")
    if not value["claims_complete"]:
        blocks.add("CLAIM_LEDGER_INCOMPLETE")
    if invalid_claim:
        blocks.add("CLAIM_NOT_VERIFIED")
    for token in _risky_tokens(payload["text"]):
        if not any(token.casefold() in fragment for fragment in verified_fragments):
            blocks.add("RISKY_CLAIM_WITHOUT_EVIDENCE")

    if media_check["result"] == "block":
        blocks.add("MEDIA_POLICY_BLOCK")
        blocks.update(media_check["reason_codes"])
    elif media_check["result"] == "warning":
        warnings.add("MEDIA_POLICY_WARNING")
        warnings.update(media_check["reason_codes"])
    if platform_check["result"] == "block":
        blocks.add("PLATFORM_POLICY_BLOCK")
        blocks.update(platform_check["reason_codes"])
    elif platform_check["result"] == "warning":
        warnings.add("PLATFORM_POLICY_WARNING")
        warnings.update(platform_check["reason_codes"])

    media_reason_codes = set(media_check["reason_codes"])
    if "SYNTHETIC_MEDIA" in media_reason_codes:
        if "PRODUCT_IDENTITY_VERIFIED" not in media_reason_codes:
            blocks.add("SYNTHETIC_MEDIA_IDENTITY_NOT_VERIFIED")
        else:
            warnings.add("SYNTHETIC_MEDIA_REQUIRES_REVIEW")

    if payload["platform"] == "instagram":
        if payload["cta_mode"] == "caption_url" or re.search(r"https://", payload["text"], re.IGNORECASE):
            warnings.add("INSTAGRAM_CAPTION_URL_NON_CLICKABLE")
        if re.search(r"点击(?:下方)?链接|click\s+(?:the\s+)?link\s+below|tap\s+(?:the\s+)?link\s+below", payload["text"], re.IGNORECASE):
            warnings.add("INSTAGRAM_NONCLICKABLE_CTA_COPY")

    if blocks:
        policy_result = "block"
        reason_codes = sorted(blocks | warnings)
    elif warnings:
        policy_result = "warning"
        reason_codes = sorted(warnings)
    else:
        policy_result = "pass"
        reason_codes = ["POLICY_PASS"]
    explanations = [EXPLANATIONS.get(code, f"Policy check returned {code}.") for code in reason_codes]
    return {
        "policy_version": STORE.PREFLIGHT_POLICY_VERSION,
        "policy_result": policy_result,
        "payload_hash": current_hash,
        "reason_codes": reason_codes,
        "explanations": explanations,
    }


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        print(json.dumps(evaluate(_load_json(args.input)), ensure_ascii=False, sort_keys=True))
        return 0
    except PreflightError as exc:
        print(
            json.dumps(
                {"status": "error", "error_code": "invalid_social_preflight_input", "message": str(exc)},
                ensure_ascii=False,
            ),
            file=sys.stderr,
        )
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
