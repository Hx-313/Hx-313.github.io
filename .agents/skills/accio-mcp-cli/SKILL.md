---
name: accio-mcp-cli
description: >-
  Use the accio-mcp-cli command-line tool to discover, search, and invoke MCP tools (Twitter, Gmail, Notion, Square, Apify, etc.) directly from the terminal. Use when the user asks to call MCP tools via CLI, run accio-mcp-cli commands, list available MCP tools from the command line, or invoke remote service integrations from the shell instead of an in-app MCP gateway.
---

# accio-mcp-cli

> **⚠️ `accio-mcp-cli --help` is always authoritative.** This skill documents a specific
> client version; commands and flags may differ across releases. Trust `--help` output first.

CLI for discovering, searching, and invoking MCP tools.
Auth is automatic — no credentials needed.

## Workflow

**`toolkit` → `search` → `call`**. Avoid `list` (150+ tools, floods context).

```bash
accio-mcp-cli toolkit gmail            # browse toolkit
accio-mcp-cli search twitter           # find tools by keyword
accio-mcp-cli call <tool> --arg val    # invoke a tool
```

## Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `search <kw>` | `keyword` | Full-text search across all tools (name, description, toolkit). Falls back to server-side search. Fuzzy suggestions on no match. |
| `toolkit [kw]` | `toolkits` | Browse toolkits or filter by name. No kw = overview. |
| `call <name> [--arg val]` | `run` | Invoke a tool. `--json '{...}'` for raw JSON args. `--server <srv>` to target a fixed MCP server. |
| `list` | `ls` | List all tools (prefer `search`/`toolkit`). |
| `server list` | — | List custom MCP servers and their status. |
| `server add --json '{...}'` | — | Add a custom MCP server (supports Claude/Cursor `mcpServers` format). |
| `server remove <name>` | — | Remove a custom MCP server. |
| `server test <name>` | — | Test connection to a custom MCP server. |
| `server tools <name>` | `server <name>` | List tools from a custom MCP server. |
| `server auth <name>` | — | OAuth-authorize a remote MCP server (opens browser). |

**Call argument rules:** `--json '{...}'` takes precedence; `--key val` → `{key: val}` (true/false→bool, digits→int); `--flag` → `{flag: true}`. Flags `--port`, `--json`, `--server`, `--raw`, `--refresh`, `--help` are excluded from tool args.

### Options

| Flag | Description |
|------|-------------|
| `--port <port>` | Port (default: 4097) |
| `--raw` | Raw JSON output |
| `--refresh` | Force refresh tools cache |
| `-h, --help` | **Authoritative reference** |

## Tool Categories

Google Workspace (Gmail/Calendar/Drive/Docs/Sheets), Twitter/X, Square, Notion, GitHub,
Composio (Figma/HubSpot/Intercom), APIFY (Instagram/Facebook/TikTok/YouTube/Reddit/1688).
Use `toolkit` to browse, `search` to discover.

## Notes & Troubleshooting

- Always `search` before guessing tool names.
- Most services need a one-time `start_*_auth` call.
- Timeout: 60s (most commands), 24h (`call`). Use `--raw` for slow tools.
- **`--help` overrides skill content** — run `accio-mcp-cli --help` or `<command> --help`.

| Problem | Solution |
|---------|----------|
| Cannot connect | Ensure Accio Desktop is running |
| 401 Unauthorized | Restart Accio Desktop |
| Tool not found | Use `search <name>` |
| Version mismatch | Run `accio-mcp-cli --help` |
