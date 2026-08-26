"""Microsoft Clarity Data Export API fetcher (dual-path: Connector or token).

Returns a status-tagged dict so the orchestrator can degrade gracefully::

    {"status": "ok"|"skipped"|"rate_limited"|"error",
     "data": ...,
     "reason": "...",
     "source": "connector"|"token"|"none"}

Two paths, evaluated in this order:

1. **Connector (preferred)** — when the Accio Work *Microsoft Clarity* Connector
   is connected (``~/.accio/accounts/{accountId}/connectors/data/clarity/state.json``
   shows an account with ``status == "connected"``), we read the Data Export JWT
   from that Connector's secrets store and call ``project-live-insights`` via
   the official ``@microsoft/clarity-mcp-server`` MCP server (spawned with
   ``npx -y``). The agent never reads the token text; it only reaches the
   Clarity API through the MCP subprocess. Cold-start ~5–10 s, then cached.

2. **Manual token (fallback)** — when ``use_connector`` is False, the
   Connector is unavailable, or the Connector probe fails, we fall back to the
   classic ``urllib`` call against ``https://www.clarity.ms/export-data/api/v1``
   using a JWT pasted into ``project/store-config.json`` under
   ``clarity.api_token``.

Both paths share the upstream limit of **10 calls/day per project**. The daily
report uses 1 call; ``check_health.py`` uses 1 call. Stay under ~8 manual
invocations/day to leave headroom.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


CLARITY_API_BASE = "https://www.clarity.ms/export-data/api/v1/project-live-insights"


# ---------------------------------------------------------------------------
# Connector discovery helpers
# ---------------------------------------------------------------------------

def _resolve_account_id(explicit: str | None = None) -> str | None:
    """Find the Accio Work account directory under ~/.accio/accounts/."""
    if explicit:
        return explicit
    base = Path.home() / ".accio" / "accounts"
    if not base.exists():
        return None
    accounts = [p.name for p in base.iterdir() if p.is_dir() and p.name.isdigit()]
    if len(accounts) == 1:
        return accounts[0]
    # Multiple or zero accounts: caller must set accio_account_id explicitly.
    return None


def _read_connector_state(account_id: str) -> dict[str, Any] | None:
    state_path = (
        Path.home() / ".accio" / "accounts" / account_id
        / "connectors" / "data" / "clarity" / "state.json"
    )
    if not state_path.exists():
        return None
    try:
        return json.loads(state_path.read_text())
    except (OSError, json.JSONDecodeError):
        return None


def _connector_is_connected(account_id: str | None) -> bool:
    if not account_id:
        return False
    state = _read_connector_state(account_id)
    if not state:
        return False
    accounts = state.get("accounts") or []
    return any((a or {}).get("status") == "connected" for a in accounts)


def _read_connector_token(account_id: str) -> str | None:
    """Read the CLARITY_API_TOKEN that the Connector stored locally.

    The Accio Work Clarity Connector keeps the JWT in its account record under
    a sensitive field (``CLARITY_API_TOKEN``). We try a small set of well-known
    locations and key names; if none match (e.g. the Connector backend stores
    secrets in the OS keychain instead of the on-disk state file), we return
    None and fall back to the manual-token path.
    """
    state = _read_connector_state(account_id) or {}
    for acc in state.get("accounts") or []:
        if (acc or {}).get("status") != "connected":
            continue
        for key in ("CLARITY_API_TOKEN", "clarity_api_token", "api_token", "token"):
            v = (acc.get("credentials") or {}).get(key) or acc.get(key)
            if v:
                return str(v)
    return None


# ---------------------------------------------------------------------------
# Path A: MCP server (Connector-managed token)
# ---------------------------------------------------------------------------

_MCP_PACKAGE = "@microsoft/clarity-mcp-server"
_MCP_TOOL = "project-live-insights"


def _fetch_via_mcp(token: str, num_days: int, timeout: int) -> dict[str, Any]:
    """Spawn the Clarity MCP server and call project-live-insights once.

    Implementation notes:
    - We use the JSON-RPC stdio protocol the MCP server speaks.
    - We do NOT depend on ``mcp`` Python SDK to keep this file zero-dep.
    - On any failure (npx missing, server crash, JSON parse, timeout) we
      return status='error' so the caller can fall back to the token path.
    """
    if not shutil.which("npx"):
        return {
            "status": "error",
            "source": "connector",
            "reason": "npx not found on PATH — install Node.js to use the Clarity Connector path",
            "data": None,
        }

    cmd = ["npx", "-y", _MCP_PACKAGE, f"--clarity_api_token={token}"]

    # Minimal MCP handshake + single tool call, all over stdio.
    requests = [
        {"jsonrpc": "2.0", "id": 1, "method": "initialize",
         "params": {"protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "clientInfo": {"name": "shopify-monitoring", "version": "1.0"}}},
        {"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}},
        {"jsonrpc": "2.0", "id": 2, "method": "tools/call",
         "params": {"name": _MCP_TOOL, "arguments": {"numOfDays": num_days}}},
    ]
    stdin_payload = "\n".join(json.dumps(r) for r in requests) + "\n"

    try:
        proc = subprocess.run(
            cmd,
            input=stdin_payload,
            capture_output=True,
            text=True,
            timeout=timeout,
            env={**os.environ, "CLARITY_API_TOKEN": token},
        )
    except subprocess.TimeoutExpired:
        return {
            "status": "error",
            "source": "connector",
            "reason": f"Clarity MCP server timed out after {timeout}s (cold start can take 5-10s; try again)",
            "data": None,
        }
    except OSError as e:
        return {
            "status": "error",
            "source": "connector",
            "reason": f"Failed to spawn MCP server: {e}",
            "data": None,
        }

    # Parse the last JSON-RPC response with id == 2.
    payload: dict[str, Any] | None = None
    for line in (proc.stdout or "").splitlines():
        line = line.strip()
        if not line or not line.startswith("{"):
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if obj.get("id") == 2:
            payload = obj
            break

    if payload is None:
        return {
            "status": "error",
            "source": "connector",
            "reason": f"MCP server returned no usable response (stderr tail: {(proc.stderr or '')[-300:]!r})",
            "data": None,
        }

    if "error" in payload:
        err = payload["error"] or {}
        msg = str(err.get("message") or err)
        # Heuristic: the server forwards Clarity HTTP errors with rate-limit text.
        if "429" in msg or "rate" in msg.lower():
            return {"status": "rate_limited", "source": "connector",
                    "reason": "Clarity Data Export quota exceeded (10/day)", "data": None}
        if "401" in msg or "unauthor" in msg.lower():
            return {"status": "error", "source": "connector",
                    "reason": "Clarity Connector token rejected — reconnect via Sidebar → Capabilities → Plugins → Shopify → Connectors → Microsoft Clarity",
                    "data": None}
        return {"status": "error", "source": "connector", "reason": f"MCP error: {msg}", "data": None}

    # Success path: tools/call returns content blocks; the live-insights tool
    # returns the raw API JSON inside content[0].text.
    result = payload.get("result") or {}
    content = result.get("content") or []
    if not content:
        return {"status": "error", "source": "connector", "reason": "MCP returned empty content", "data": None}
    text = (content[0] or {}).get("text") or ""
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        return {"status": "error", "source": "connector",
                "reason": f"MCP returned non-JSON: {e}", "data": None}
    return {"status": "ok", "source": "connector", "data": data}


# ---------------------------------------------------------------------------
# Path B: direct REST call (manual token)
# ---------------------------------------------------------------------------

def _fetch_via_token(api_token: str, num_days: int, timeout: int) -> dict[str, Any]:
    url = f"{CLARITY_API_BASE}?numOfDays={num_days}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {api_token}"})

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
        return {"status": "ok", "source": "token", "data": json.loads(raw)}
    except urllib.error.HTTPError as e:
        if e.code == 429:
            return {"status": "rate_limited", "source": "token",
                    "reason": "Clarity Data Export quota exceeded (10/day)", "data": None}
        if e.code == 401:
            return {"status": "error", "source": "token",
                    "reason": "Clarity token invalid or expired — regenerate via Settings → Data Export",
                    "data": None}
        return {"status": "error", "source": "token",
                "reason": f"Clarity HTTP {e.code}: {e.reason}", "data": None}
    except (urllib.error.URLError, TimeoutError) as e:
        return {"status": "error", "source": "token",
                "reason": f"Clarity network error: {e}", "data": None}
    except json.JSONDecodeError as e:
        return {"status": "error", "source": "token",
                "reason": f"Clarity returned non-JSON: {e}", "data": None}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def fetch_insights(
    api_token: str | None = None,
    num_days: int = 1,
    timeout: int = 30,
    *,
    use_connector: bool = True,
    accio_account_id: str | None = None,
) -> dict[str, Any]:
    """Pull Clarity live insights for the last N days.

    Args:
        api_token: Manual JWT (Path B). May be None when relying on the Connector.
        num_days: 1–3 (Clarity Data Export limit).
        timeout: Per-attempt timeout in seconds. MCP cold-start uses ~5–10 s of this.
        use_connector: When False, skips the Connector probe and goes straight to
            the manual token path. Set False to honour ``store-config.json``'s
            ``clarity.use_connector: false``.
        accio_account_id: Optional. When set, skips auto-detection of the Accio
            Work account directory. Required if the user has multiple accounts
            under ``~/.accio/accounts/``.

    Returns:
        Dict with ``status``, ``data``, optional ``reason``, and ``source``
        ('connector' | 'token' | 'none').

    Resolution order:
        1. If ``use_connector`` and Connector is connected → try MCP. If that
           returns ``ok``/``rate_limited``, return it directly.
        2. Otherwise (or on Connector ``error``) fall back to ``api_token``.
        3. If neither path is available, return ``status='skipped'``.
    """
    # --- Path A: Connector ---
    if use_connector:
        account_id = _resolve_account_id(accio_account_id)
        if _connector_is_connected(account_id):
            token_from_connector = _read_connector_token(account_id) if account_id else None
            if token_from_connector:
                result = _fetch_via_mcp(token_from_connector, num_days, timeout)
                # Surface ok / rate_limited from Connector path immediately.
                # On 'error' we fall through to the manual token path so a temporarily
                # broken MCP install never blocks the daily report.
                if result["status"] in ("ok", "rate_limited"):
                    return result
                # else: keep the error reason for the final 'none' branch if no token.
                connector_error_reason = result.get("reason")
            else:
                connector_error_reason = (
                    "Clarity Connector is connected but the Data Export token "
                    "is not exposed to the local state file — the daily report "
                    "needs MCP server support that ships the token in-process."
                )
        else:
            connector_error_reason = None
    else:
        connector_error_reason = None

    # --- Path B: Manual token ---
    if api_token:
        return _fetch_via_token(api_token, num_days, timeout)

    # --- Neither path available ---
    reason = connector_error_reason or "no Clarity Connector connected and no api_token configured"
    return {"status": "skipped", "source": "none", "reason": reason, "data": None}


def parse(metrics: list[dict[str, Any]] | None) -> dict[str, Any]:
    """Flatten Clarity's verbose response into a dict the renderer understands."""
    result: dict[str, Any] = {
        "total_sessions": 0,
        "bot_sessions": 0,
        "human_sessions": 0,
        "distinct_users": 0,
        "pages_per_session": 0,
        "avg_scroll_depth": 0,
        "engagement_time_sec": 0,
        "active_time_sec": 0,
        "rage_clicks": 0,
        "dead_clicks": 0,
        "quick_backs": 0,
        "js_errors": 0,
        "excessive_scroll": 0,
        "popular_pages": [],
        "top_country": "—",
        "top_device": "—",
        "top_browser": "—",
        "referrers": [],
    }
    if not metrics:
        return result

    for m in metrics:
        name = m.get("metricName")
        info = m.get("information") or []
        if not info:
            continue
        first = info[0]

        if name == "Traffic":
            result["total_sessions"] = int(first.get("totalSessionCount") or 0)
            result["bot_sessions"] = int(first.get("totalBotSessionCount") or 0)
            result["human_sessions"] = result["total_sessions"] - result["bot_sessions"]
            result["distinct_users"] = int(first.get("distinctUserCount") or 0)
            result["pages_per_session"] = round(float(first.get("pagesPerSessionPercentage") or 0), 1)
        elif name == "ScrollDepth":
            result["avg_scroll_depth"] = round(float(first.get("averageScrollDepth") or 0), 1)
        elif name == "EngagementTime":
            result["engagement_time_sec"] = int(first.get("totalTime") or 0)
            result["active_time_sec"] = int(first.get("activeTime") or 0)
        elif name == "RageClickCount":
            result["rage_clicks"] = int(first.get("subTotal") or 0)
        elif name == "DeadClickCount":
            result["dead_clicks"] = int(first.get("subTotal") or 0)
        elif name == "QuickbackClick":
            result["quick_backs"] = int(first.get("subTotal") or 0)
        elif name == "ScriptErrorCount":
            result["js_errors"] = int(first.get("subTotal") or 0)
        elif name == "ExcessiveScroll":
            result["excessive_scroll"] = int(first.get("subTotal") or 0)
        elif name == "PopularPages":
            result["popular_pages"] = [
                {"url": p.get("url", ""), "visits": int(p.get("visitsCount") or 0)}
                for p in info[:10]
            ]
        elif name == "Country":
            result["top_country"] = first.get("name") or "—"
        elif name == "Device":
            result["top_device"] = first.get("name") or "—"
        elif name == "Browser":
            result["top_browser"] = first.get("name") or "—"
        elif name == "ReferrerUrl":
            result["referrers"] = [
                {"name": r.get("name") or "Direct", "sessions": int(r.get("sessionsCount") or 0)}
                for r in info[:10]
            ]
    return result
