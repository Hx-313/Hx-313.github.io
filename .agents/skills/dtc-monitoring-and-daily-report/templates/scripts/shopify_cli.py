"""Shopify CLI wrapper — delegates ALL Admin API access to `shopify store execute`.

Why this exists
----------------
The plugin uses the Accio Work Shopify Connector to handle OAuth + token refresh.
Tokens live INSIDE the Connector — Python scripts must never hold them. The only
supported execution path is the `shopify` CLI, which the Connector wires up.

Forbidden patterns (do not add here):
- requests.get("https://STORE/admin/api/...")
- urllib calls to admin/oauth/access_token
- shpat_* tokens in env vars or config

Authoring loop:
1. Validate every GraphQL query/mutation via the `shopify-admin` skill BEFORE adding it
   to a `fetch_*.py` module. Run `scripts/search_docs.mjs <op>` then `scripts/validate.mjs`.
2. Pass the validated query string into `execute()` here.
3. If validation fails 3 times, leave the data source as a no-op and emit a warning
   in the report — never ship un-validated GraphQL.
"""

from __future__ import annotations

import json
import shutil
import subprocess
from typing import Any


class ShopifyCLIError(RuntimeError):
    """Raised when the `shopify` CLI returns a non-zero exit code or unparseable output."""


def _ensure_cli_available() -> None:
    if shutil.which("shopify") is None:
        raise ShopifyCLIError(
            "`shopify` CLI not found in PATH. "
            "Install Shopify CLI ≥ 3.93.0 (`npm i -g @shopify/cli@latest`) and "
            "connect the store via Accio Work → Sidebar → Capabilities → Plugins → Shopify → Connectors → Shopify."
        )


def execute(
    *,
    store: str,
    query: str,
    variables: dict[str, Any] | None = None,
    scopes: list[str] | None = None,  # accepted for API symmetry, NOT passed to CLI
    allow_mutations: bool = False,
    api_version: str | None = None,
    timeout: int = 60,
) -> dict[str, Any]:
    """Run a single GraphQL operation against the store and return the parsed JSON.

    Parameters
    ----------
    store
        Full myshopify.com domain, e.g. ``"acme.myshopify.com"``.
    query
        A GraphQL query or mutation string. Must be validated via `shopify-admin` first.
    variables
        Optional GraphQL variables. Serialised to JSON and passed via ``--variables``.
    scopes
        Documentation-only — listed so callers record the minimal scope set the query
        needs. The Shopify CLI does NOT accept a ``--scopes`` flag at execute-time;
        scopes are granted at Connector OAuth time. This argument is intentionally
        ignored at runtime.
    allow_mutations
        Required for mutations. The CLI refuses mutations without this flag.
    api_version
        Optional API version (e.g. ``"2026-01"``). Defaults to CLI's latest stable.
    timeout
        Hard timeout in seconds.

    Returns
    -------
    dict
        The parsed JSON response. Caller must inspect ``data`` and ``errors``.

    Raises
    ------
    ShopifyCLIError
        On CLI invocation failure, non-zero exit, timeout, or unparseable output.
    """
    _ensure_cli_available()

    # Note: --scopes is intentionally NOT passed — it is not a real CLI flag.
    # -j forces JSON output (required for json.loads on stdout).
    cmd = [
        "shopify", "store", "execute",
        "--store", store,
        "--query", query,
        "-j",
        "--no-color",
    ]
    if api_version:
        cmd += ["--version", api_version]
    if variables:
        cmd += ["--variables", json.dumps(variables)]
    if allow_mutations:
        cmd.append("--allow-mutations")

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise ShopifyCLIError(f"shopify CLI timed out after {timeout}s: {exc}") from exc

    if proc.returncode != 0:
        raise ShopifyCLIError(
            f"shopify CLI exit {proc.returncode}\n"
            f"stderr: {proc.stderr.strip()[:1000]}\n"
            f"stdout: {proc.stdout.strip()[:1000]}"
        )

    raw = proc.stdout
    if not raw.strip():
        raise ShopifyCLIError("shopify CLI returned empty stdout")

    json_text = _extract_trailing_json(raw)
    try:
        parsed = json.loads(json_text)
    except json.JSONDecodeError as exc:
        raise ShopifyCLIError(
            f"shopify CLI returned non-JSON output:\n{json_text[:1000]}"
        ) from exc

    # The CLI returns the GraphQL `data` object at top-level (not wrapped in
    # `{"data": ...}`). Normalise to the standard GraphQL response shape so
    # callers can keep using `resp["data"]["..."]`.
    if isinstance(parsed, dict) and "data" not in parsed and "errors" not in parsed:
        parsed = {"data": parsed}
    return parsed


def _extract_trailing_json(text: str) -> str:
    """Extract the last balanced top-level JSON object/array from CLI output.

    The Shopify CLI interleaves a TTY progress bar and `Loading…` text into
    stdout even with ``-j``. The JSON payload is always the *last* well-formed
    object/array. Walk from the end, find the closing brace/bracket, then walk
    backwards counting nesting until we hit the matching opener.
    """
    end = max(text.rfind("}"), text.rfind("]"))
    if end == -1:
        raise ShopifyCLIError(f"shopify CLI returned no JSON:\n{text[-500:]}")

    closer = text[end]
    opener = "{" if closer == "}" else "["
    depth = 0
    in_string = False
    escape = False
    start = -1
    for i in range(end, -1, -1):
        ch = text[i]
        # Strings: track quote pairs. (Backslash escaping is handled by NOT
        # toggling in_string when the previous char was an unescaped backslash;
        # since we walk backwards this is approximated — sufficient for CLI output
        # which doesn't contain stray quotes outside strings.)
        if ch == '"' and not escape:
            in_string = not in_string
        escape = (ch == "\\" and not escape)
        if in_string:
            continue
        if ch == closer:
            depth += 1
        elif ch == opener:
            depth -= 1
            if depth == 0:
                start = i
                break
    if start == -1:
        raise ShopifyCLIError(
            f"shopify CLI output had unbalanced JSON:\n{text[-1000:]}"
        )
    return text[start : end + 1]


def assert_no_user_errors(response: dict[str, Any], mutation_name: str) -> None:
    """Helper: raise if a mutation response contains userErrors."""
    data = (response or {}).get("data") or {}
    payload = data.get(mutation_name) or {}
    user_errors = payload.get("userErrors") or []
    if user_errors:
        raise ShopifyCLIError(
            f"{mutation_name} returned userErrors: {json.dumps(user_errors)}"
        )
