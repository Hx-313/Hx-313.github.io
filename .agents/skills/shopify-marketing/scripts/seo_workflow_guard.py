#!/usr/bin/env python3
"""Deterministic evidence, change-manifest, and completion guard for Shopify SEO."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import stat
import sys
from collections import Counter
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


class GuardError(RuntimeError):
    pass


POLICY_VERSION = "shopify-seo-workflow-v1"
PAGE_TYPES = {"homepage", "collection", "product", "page", "article"}
PAGE_EVIDENCE = {
    "rendered_html",
    "title_meta",
    "headings",
    "canonical",
    "indexability",
    "structured_data",
    "image_alt",
    "internal_links",
    "performance",
}
SITE_EVIDENCE = {"robots", "sitemap"}
CHANGE_OWNER = {
    "homepage_meta": {"merchant_manual", "shopify-theme-decorator"},
    "product_seo": {"shopify-product-editor"},
    "product_title": {"shopify-product-editor"},
    "product_body": {"shopify-product-editor"},
    "product_media_alt": {"shopify-product-editor"},
    "collection_seo": {"shopify-product-editor"},
    "collection_title": {"shopify-product-editor"},
    "collection_body": {"shopify-product-editor"},
    "page_content": {"shopify-admin"},
    "article_content": {"shopify-admin"},
    "theme_seo": {"shopify-theme-decorator"},
}
CHANGE_FIELDS = {
    "change_id",
    "change_type",
    "object_id",
    "public_url",
    "current",
    "proposed",
    "owner",
    "blast_radius",
    "evidence_sources",
    "visual_checked",
}
RESULT_FIELDS = {
    "change_id",
    "status",
    "owner_receipt_ok",
    "object_verified",
    "rendered_html_verified",
    "errors",
}
STORE_DOMAIN_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,62}\.myshopify\.com$")
CHANGE_ID_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{0,63}$")
PLACEHOLDER_WORD_RE = re.compile(r"\b(?:TODO|TBD|PLACEHOLDER)\b", re.IGNORECASE)
ANGLE_TOKEN_RE = re.compile(r"<\s*([^<>]+?)\s*>")
TAG_NAME_RE = re.compile(r"^([A-Za-z][A-Za-z0-9:-]*)\b")
PLACEHOLDER_HINT_RE = re.compile(
    r"(?:^|[-_.\s])(?:current|old|new|proposed|desired|value|id|gid|url|handle|store|"
    r"title|description|body|content|text|object|replace|enter|your)(?:$|[-_.\s])",
    re.IGNORECASE,
)
HTML_TAG_NAMES = {
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "menu",
    "meta",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "search",
    "section",
    "select",
    "slot",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
    "svg",
    "path",
    "circle",
    "ellipse",
    "g",
    "line",
    "polygon",
    "polyline",
    "rect",
    "text",
}


def _load_json(path: str) -> dict[str, Any]:
    if path == "-":
        try:
            value = json.load(sys.stdin)
        except json.JSONDecodeError as exc:
            raise GuardError("stdin does not contain valid JSON") from exc
    else:
        source = Path(path)
        try:
            info = source.lstat()
        except FileNotFoundError as exc:
            raise GuardError("input must be an existing regular JSON file") from exc
        if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
            raise GuardError("input must be a regular JSON file")
        try:
            value = json.loads(source.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise GuardError("input does not contain valid JSON") from exc
    if not isinstance(value, dict):
        raise GuardError("input must be a JSON object")
    return value


def _canonical_hash(value: Any) -> str:
    encoded = json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return f"sha256:{hashlib.sha256(encoded).hexdigest()}"


def _exact_fields(value: Any, fields: set[str], label: str) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != fields:
        raise GuardError(f"{label} fields must be exactly: {', '.join(sorted(fields))}")
    return value


def _non_empty_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise GuardError(f"{label} must be a non-empty string")
    return value.strip()


def _public_url(value: Any, label: str) -> str:
    url = _non_empty_string(value, label)
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
        raise GuardError(f"{label} must be a public https URL without credentials")
    return url


def evaluate_audit(value: dict[str, Any]) -> dict[str, Any]:
    required = {"scope", "pages", "site_evidence", "absent_page_types"}
    _exact_fields(value, required, "audit input")
    scope = value["scope"]
    if scope not in {"single_page", "sitewide"}:
        raise GuardError("scope must be single_page or sitewide")
    if not isinstance(value["pages"], list) or not value["pages"]:
        raise GuardError("pages must be a non-empty array")
    if not isinstance(value["site_evidence"], list) or not all(
        isinstance(item, str) for item in value["site_evidence"]
    ):
        raise GuardError("site_evidence must be an array of strings")
    if set(value["site_evidence"]) - SITE_EVIDENCE:
        raise GuardError("site_evidence may contain only robots and sitemap")
    if not isinstance(value["absent_page_types"], list) or not all(
        item in {"page", "article"} for item in value["absent_page_types"]
    ):
        raise GuardError("absent_page_types may contain only page and article")

    missing: list[str] = []
    page_counts: Counter[str] = Counter()
    normalized_pages: list[dict[str, Any]] = []
    seen_urls: set[str] = set()
    for index, raw_page in enumerate(value["pages"]):
        page = _exact_fields(raw_page, {"url", "page_type", "evidence"}, f"pages[{index}]")
        url = _public_url(page["url"], f"pages[{index}].url")
        if url in seen_urls:
            raise GuardError(f"duplicate audit URL: {url}")
        seen_urls.add(url)
        page_type = page["page_type"]
        if page_type not in PAGE_TYPES:
            raise GuardError(f"pages[{index}].page_type is invalid")
        evidence = page["evidence"]
        if not isinstance(evidence, list) or not all(isinstance(item, str) for item in evidence):
            raise GuardError(f"pages[{index}].evidence must be an array of strings")
        evidence_set = set(evidence)
        unknown_evidence = evidence_set - (PAGE_EVIDENCE | {"admin_object"})
        if unknown_evidence:
            raise GuardError(f"pages[{index}].evidence contains unknown values")
        for evidence_name in sorted(PAGE_EVIDENCE - evidence_set):
            missing.append(f"{url}:{evidence_name}")
        page_counts[page_type] += 1
        normalized_pages.append(
            {"url": url, "page_type": page_type, "evidence": sorted(evidence_set)}
        )

    if scope == "single_page" and len(normalized_pages) != 1:
        missing.append("single_page:exactly_one_page_required")
    if scope == "sitewide":
        minimums = {"homepage": 1, "collection": 1, "product": 2}
        for page_type, minimum in minimums.items():
            if page_counts[page_type] < minimum:
                missing.append(f"sitewide_sample:{page_type}>={minimum}")
        has_static = page_counts["page"] + page_counts["article"] > 0
        absent_types = set(value["absent_page_types"])
        if not has_static and absent_types != {"page", "article"}:
            missing.append("sitewide_sample:page_or_article_if_present")
        for evidence_name in sorted(SITE_EVIDENCE - set(value["site_evidence"])):
            missing.append(f"site:{evidence_name}")

    normalized = {
        "scope": scope,
        "pages": normalized_pages,
        "site_evidence": sorted(set(value["site_evidence"])),
        "absent_page_types": sorted(set(value["absent_page_types"])),
    }
    complete = not missing
    return {
        "policy_version": POLICY_VERSION,
        "audit_status": "evidence_complete" if complete else "insufficient_evidence",
        "score_allowed": complete,
        "missing_evidence": missing,
        "page_counts": dict(sorted(page_counts.items())),
        "audit_receipt_hash": _canonical_hash(normalized),
    }


def _validate_object_id(change_type: str, value: Any, label: str) -> str:
    object_id = _non_empty_string(value, label)
    expected_prefixes = {
        "homepage_meta": ("homepage",),
        "product_seo": ("gid://shopify/Product/",),
        "product_title": ("gid://shopify/Product/",),
        "product_body": ("gid://shopify/Product/",),
        "product_media_alt": ("gid://shopify/MediaImage/", "gid://shopify/Video/"),
        "collection_seo": ("gid://shopify/Collection/",),
        "collection_title": ("gid://shopify/Collection/",),
        "collection_body": ("gid://shopify/Collection/",),
        "page_content": ("gid://shopify/Page/",),
        "article_content": ("gid://shopify/Article/",),
        "theme_seo": ("gid://shopify/OnlineStoreTheme/",),
    }
    if change_type == "homepage_meta" and object_id != "homepage":
        raise GuardError(f"{label} does not match change_type {change_type}")
    if change_type != "homepage_meta" and not object_id.startswith(expected_prefixes[change_type]):
        raise GuardError(f"{label} does not match change_type {change_type}")
    return object_id


def _contains_angle_placeholder(value: str) -> bool:
    stripped = value.strip()
    for match in ANGLE_TOKEN_RE.finditer(value):
        token = match.group(1).strip()
        if not token or token.startswith(("/", "!", "?")):
            continue
        tag_match = TAG_NAME_RE.match(token)
        if not tag_match:
            continue
        tag_name = tag_match.group(1)
        normalized_name = tag_name.casefold()
        if normalized_name in HTML_TAG_NAMES:
            continue
        if token.endswith("/") or "=" in token:
            continue
        closing_tag = re.compile(rf"</\s*{re.escape(tag_name)}\s*>", re.IGNORECASE)
        if closing_tag.search(value, match.end()):
            continue
        if match.group(0).strip() == stripped or PLACEHOLDER_HINT_RE.search(token):
            return True
    return False


def _contains_placeholder(value: Any) -> bool:
    if isinstance(value, str):
        return bool(PLACEHOLDER_WORD_RE.search(value)) or _contains_angle_placeholder(value)
    if isinstance(value, list):
        return any(_contains_placeholder(item) for item in value)
    if isinstance(value, dict):
        return any(_contains_placeholder(item) for item in value.values())
    return False


def validate_manifest(value: dict[str, Any]) -> dict[str, Any]:
    _exact_fields(value, {"store_handle", "changes"}, "manifest")
    store_handle = _non_empty_string(value["store_handle"], "store_handle")
    if not STORE_DOMAIN_RE.fullmatch(store_handle):
        raise GuardError("store_handle must be the verified full *.myshopify.com domain")
    if not isinstance(value["changes"], list) or not value["changes"]:
        raise GuardError("changes must be a non-empty array")

    normalized_changes: list[dict[str, Any]] = []
    change_ids: set[str] = set()
    for index, raw_change in enumerate(value["changes"]):
        change = _exact_fields(raw_change, CHANGE_FIELDS, f"changes[{index}]")
        change_id = _non_empty_string(change["change_id"], f"changes[{index}].change_id")
        if not CHANGE_ID_RE.fullmatch(change_id):
            raise GuardError(f"changes[{index}].change_id is invalid")
        if change_id in change_ids:
            raise GuardError(f"duplicate change_id: {change_id}")
        change_ids.add(change_id)
        change_type = change["change_type"]
        if change_type not in CHANGE_OWNER:
            raise GuardError(f"changes[{index}].change_type is invalid")
        owner = _non_empty_string(change["owner"], f"changes[{index}].owner")
        if owner not in CHANGE_OWNER[change_type]:
            expected = ", ".join(sorted(CHANGE_OWNER[change_type]))
            raise GuardError(f"{change_id} must use owner: {expected}")
        object_id = _validate_object_id(
            change_type,
            change["object_id"],
            f"changes[{index}].object_id",
        )
        public_url = _public_url(change["public_url"], f"changes[{index}].public_url")
        if change["current"] is None or change["proposed"] is None:
            raise GuardError(f"{change_id} current and proposed values must be explicit")
        if change["current"] == change["proposed"]:
            raise GuardError(f"{change_id} current and proposed values must differ")
        if _contains_placeholder(change["current"]) or _contains_placeholder(change["proposed"]):
            raise GuardError(f"{change_id} contains a placeholder")
        blast_radius = _non_empty_string(
            change["blast_radius"],
            f"changes[{index}].blast_radius",
        )
        evidence_sources = change["evidence_sources"]
        if not isinstance(evidence_sources, list) or not evidence_sources or not all(
            isinstance(item, str)
            and item.strip()
            and re.match(r"^(?:shopify|merchant|public|rendered):\S", item, re.IGNORECASE)
            for item in evidence_sources
        ):
            raise GuardError(
                f"{change_id} evidence_sources must use shopify:, merchant:, public:, or rendered:"
            )
        if not isinstance(change["visual_checked"], bool):
            raise GuardError(f"{change_id} visual_checked must be boolean")
        if change_type == "product_media_alt" and not change["visual_checked"]:
            raise GuardError(f"{change_id} requires visual_checked=true")
        normalized_changes.append(
            {
                "change_id": change_id,
                "change_type": change_type,
                "object_id": object_id,
                "public_url": public_url,
                "current": change["current"],
                "proposed": change["proposed"],
                "owner": owner,
                "blast_radius": blast_radius,
                "evidence_sources": sorted(set(item.strip() for item in evidence_sources)),
                "visual_checked": change["visual_checked"],
            }
        )
    return {"store_handle": store_handle, "changes": normalized_changes}


def evaluate_plan(value: dict[str, Any]) -> dict[str, Any]:
    manifest = validate_manifest(value)
    owner_counts = Counter(change["owner"] for change in manifest["changes"])
    return {
        "policy_version": POLICY_VERSION,
        "manifest_hash": _canonical_hash(manifest),
        "change_count": len(manifest["changes"]),
        "owner_counts": dict(sorted(owner_counts.items())),
        "confirmation_required": True,
        "execution_allowed": False,
        "confirmation_rule": (
            "Execute only after the user confirms this exact manifest hash "
            "and full visible change list."
        ),
    }


def evaluate_finalize(value: dict[str, Any]) -> dict[str, Any]:
    _exact_fields(value, {"manifest", "manifest_hash", "results"}, "finalize input")
    manifest = validate_manifest(value["manifest"])
    expected_hash = _canonical_hash(manifest)
    if value["manifest_hash"] != expected_hash:
        raise GuardError("manifest_hash does not match the normalized manifest")
    if not isinstance(value["results"], list):
        raise GuardError("results must be an array")

    expected_ids = [change["change_id"] for change in manifest["changes"]]
    raw_by_id: dict[str, dict[str, Any]] = {}
    for index, raw_result in enumerate(value["results"]):
        result = _exact_fields(raw_result, RESULT_FIELDS, f"results[{index}]")
        change_id = _non_empty_string(result["change_id"], f"results[{index}].change_id")
        if change_id in raw_by_id:
            raise GuardError(f"duplicate result change_id: {change_id}")
        if result["status"] not in {"succeeded", "failed", "partial", "blocked", "skipped"}:
            raise GuardError(f"{change_id} result status is invalid")
        for field in ("owner_receipt_ok", "object_verified", "rendered_html_verified"):
            if not isinstance(result[field], bool):
                raise GuardError(f"{change_id} {field} must be boolean")
        if not isinstance(result["errors"], list) or not all(
            isinstance(item, str) and item.strip() for item in result["errors"]
        ):
            raise GuardError(f"{change_id} errors must be an array of non-empty strings")
        raw_by_id[change_id] = result
    extra_ids = sorted(set(raw_by_id) - set(expected_ids))
    if extra_ids:
        raise GuardError(f"results contain unknown change_ids: {', '.join(extra_ids)}")

    effective_results: list[dict[str, Any]] = []
    for change_id in expected_ids:
        result = raw_by_id.get(change_id)
        if result is None:
            effective_results.append(
                {
                    "change_id": change_id,
                    "declared_status": "missing",
                    "effective_status": "unverified",
                    "errors": ["No execution result was supplied."],
                }
            )
            continue
        verification_ok = (
            result["owner_receipt_ok"]
            and result["object_verified"]
            and result["rendered_html_verified"]
        )
        effective_status = result["status"]
        errors = list(result["errors"])
        if result["status"] == "succeeded" and not verification_ok:
            effective_status = "unverified"
            errors.append(
                "Success requires owner receipt, object read-back, "
                "and rendered HTML verification."
            )
        if result["status"] != "succeeded" and not errors:
            errors.append("Non-success result requires an explanatory error or blocker.")
        effective_results.append(
            {
                "change_id": change_id,
                "declared_status": result["status"],
                "effective_status": effective_status,
                "errors": errors,
            }
        )

    counts = Counter(item["effective_status"] for item in effective_results)
    if counts.get("succeeded", 0) == len(expected_ids):
        overall_status = "success"
    elif counts.get("succeeded", 0) == 0 and all(
        item["effective_status"] in {"failed", "blocked", "skipped"}
        for item in effective_results
    ):
        overall_status = "failed"
    else:
        overall_status = "partial"
    receipt_payload = {
        "manifest_hash": expected_hash,
        "overall_status": overall_status,
        "results": effective_results,
    }
    return {
        "policy_version": POLICY_VERSION,
        "manifest_hash": expected_hash,
        "overall_status": overall_status,
        "task_completion_allowed": overall_status == "success",
        "counts": dict(sorted(counts.items())),
        "results": effective_results,
        "measurement_claims_allowed": False,
        "reporting_rule": (
            "Report only verified field changes; do not claim ranking, CTR, traffic, "
            "or image-search uplift."
        ),
        "finalize_receipt_hash": _canonical_hash(receipt_payload),
    }


def describe_schema() -> dict[str, Any]:
    return {
        "policy_version": POLICY_VERSION,
        "commands": {
            "audit": {
                "input_fields": ["scope", "pages", "site_evidence", "absent_page_types"],
                "scope_values": ["single_page", "sitewide"],
                "page_fields": ["url", "page_type", "evidence"],
                "page_type_values": sorted(PAGE_TYPES),
                "page_evidence_values": sorted(PAGE_EVIDENCE | {"admin_object"}),
                "site_evidence_values": sorted(SITE_EVIDENCE),
            },
            "plan": {
                "input_fields": ["store_handle", "changes"],
                "store_handle": "verified full <store>.myshopify.com domain",
                "change_fields": sorted(CHANGE_FIELDS),
                "change_type_owner_map": {
                    key: sorted(value) for key, value in sorted(CHANGE_OWNER.items())
                },
                "evidence_source_prefixes": ["shopify:", "merchant:", "public:", "rendered:"],
            },
            "finalize": {
                "input_fields": ["manifest", "manifest_hash", "results"],
                "result_fields": sorted(RESULT_FIELDS),
                "result_status_values": ["succeeded", "failed", "partial", "blocked", "skipped"],
            },
        },
    }


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("schema")
    for command in ("audit", "plan", "finalize"):
        subparser = subparsers.add_parser(command)
        subparser.add_argument("--input", required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        if args.command == "schema":
            result = describe_schema()
        elif args.command == "audit":
            value = _load_json(args.input)
            result = evaluate_audit(value)
        elif args.command == "plan":
            value = _load_json(args.input)
            result = evaluate_plan(value)
        else:
            value = _load_json(args.input)
            result = evaluate_finalize(value)
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return 0
    except GuardError as exc:
        print(
            json.dumps(
                {
                    "status": "error",
                    "error_code": "invalid_seo_workflow_input",
                    "message": str(exc),
                },
                ensure_ascii=False,
            ),
            file=sys.stderr,
        )
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
