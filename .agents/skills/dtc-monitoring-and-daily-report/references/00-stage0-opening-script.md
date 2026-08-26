# Reference 00: Stage 0 Opening Script & Language Matching

> Extracted from SKILL.md to keep the main file lean. Apply this template's **STRUCTURE** literally in the agent's first message — **LANGUAGE follows the user's latest message** per `prompt.md` RULE #-2. The English sentences below are illustrative renderings, not literal output: re-render them in the user's language while keeping the 4-beat structure, the bullet shape, and brand/UI labels (Shopify, Clarity, Judge.me, Accio Work Connector) unchanged.

## The 4-beat opening

The opening message MUST contain these 4 beats in order. Total length ~60 seconds of reading.

> **⚠️ Language guard (RULE #-2)**: The text below is an **EN reference rendering only**. When the user wrote in any other language, translate the STRUCTURE into that language — **do NOT copy the English text verbatim**. Pasting an EN reference into a non-English conversation is the #1 leak source this skill must avoid.

1. **What I'll build for you** (1 sentence)
   - EN reference: "A monitoring system that gives you a daily Markdown report covering UX problems, traffic, and (when you have orders) reviews — all automated."

2. **What you'll see in the daily report** (4-6 concrete bullets)
   - yesterday's sessions / orders / conversion rate
   - top 3 pages with friction
   - new reviews (when configured)
   - 1 recommended action for today

3. **Cost & time** — pull current numbers from [`00-verified-urls.md`](00-verified-urls.md). Do not hardcode prices in this file because they go stale; verify before quoting.
   - EN reference: "Free version: \$0/month. Setup time depends on whether the Accio Work Shopify Connector is already linked (~5 min if yes, ~15 min if no)."
   - EN reference: "Reviews tool (Judge.me) — free Public-Token tier covers daily reports; paid plan only needed for Private Token. Verify pricing via web_search before quoting."

4. **Default route** — pre-decided so the user doesn't have to choose
   - EN reference: "I'll go with the **free version**: install Microsoft Clarity (UX heatmap + analytics, Free), then write a daily report script + cron schedule. Reviews tool (Judge.me) is **deferred** — only suggested when your store crosses ≥ 50 orders/month, since reviews data is meaningless before you have customers."

## Describe the report — do NOT inline a sample file

**Rule**: never `cat` or quote `templates/sample-report-*.md` into chat. Those files are **internal schema references** (always English, written for the agent and plugin developers — not for end users). Inlining them would force every user to read English regardless of their preferred language.

Instead, **describe the report in the user's language** using 4-5 short bullets covering the same structure the user will actually receive:

- **Header**: yesterday's date, store name, timezone
- **KPI snapshot**: orders, revenue, AOV, conversion rate, sessions (with 7-day average for context)
- **Traffic & UX**: top 3 pages with friction (from Clarity), top 3 traffic sources (from Clarity)
- **Reviews** (when configured): new ratings + a flagged 1-3★ comment to address today
- **Insight + 1 recommended action** for the day

Optionally add: *"It's a Markdown file delivered each morning at 09:00 in your store's timezone — you can open it in any editor or have it pushed via email."*

This keeps Stage 0 fully language-matched and keeps maintenance to a single source of truth (the live `render_report.py` template, not a frozen sample file).

## Opt-out signals (offer exactly 4, no open-ended questions)

⚠️ **Language matching rule**: opt-out options MUST be in the **same language as the user's first message**. Never mix languages. The four canonical signals (re-render in the user's language):

- "go" / "start" → proceed to Stage 1
- "skip Clarity" → drop that tool
- "I already have customers, install Judge.me too" → also run Stage 2.5
- "I have a specific concern: X" → adjust focus before starting

## The 3-beat handoff template (apply to every user-input request)

Whenever the agent needs anything from the user (token, ID, paste action, click), the prompt MUST follow this 3-beat structure — never just dump a question:

```
1. ✅ What I already did     →  "I've already prepared the snippet / opened the OAuth page / written the script."
2. 🙏 What I need from you   →  "You only need to copy the popped-up token to me (~30 seconds)."
3. 🚀 What happens next      →  "Once I have it, I'll immediately verify the connection and pull today's orders for you."
```

**Why**: a bare question ("please give me your token") feels like work transferred onto the user. The 3-beat formula proves the agent has done its share, scopes the user's effort, and pre-commits the immediate next deliverable. This converts "asking for help" into "completing a handoff".

**Anti-pattern (NEVER):**
- ❌ "Please paste your Shopify Admin API token here." (no context, no scope, no payoff)

**Correct (EN example):**
- ✅ "I've already prepared the Connector authorization link (see Stage 1). **What I need from you**: open Accio Work settings, click Connect, finish OAuth (~1 minute). **Once you're done**, I'll immediately run a `shop` query to confirm the connection and pull yesterday's order count and conversion rate for you."

## What the agent must NOT do at Stage 0

- ❌ "What stage is your store in?" — agent can read `shop.json` + orders count to infer
- ❌ "How technical are you?" — default to plain language; user will tell us if they want deeper
- ❌ "What's your biggest worry?" — let the data show the worry; users often don't know yet
- ❌ Any open-ended question before showing what we'll build
- ❌ Long dissertation on options — pick the default, mention 1-line alternatives

## How Clarity install actually works (applies in Stage 2)

Clarity install is **a sequence of small user actions**. Total user-side time depends on Connector status.

- 🤖 **Agent side**: while the user is doing any one of the actions below, the agent prepares the snippet, config, and verification scripts for Clarity.
- 👤 **User side (sequential)** — Clarity Connector available path:
  1. Sidebar → Capabilities → Plugins → Shopify → Connectors → **Microsoft Clarity** → Connect (~30s OAuth)
  2. Clarity dashboard → Settings → Overview → copy Project ID (~30s)
- 👤 **User side (sequential)** — Connector NOT available (Path B fallback):
  1. Clarity signup + project creation (~3 min)
  2. Clarity Settings → Overview → copy Project ID (~30s)
  3. Clarity Settings → Data Export → Generate token + paste (~1 min) ⚠️ token shown once

**Recommended chat phrasing** (Connector path) — EN reference, re-render in the user's language:
- EN: *"Start by clicking Sidebar → Clarity Connector (30s) + copy Project ID (30s). Total ~1 minute."*

## After the user gives a "go" signal

Do NOT ask any more questions. Silently profile from context:
- **Connector status — verify, don't assume.** Check user profile / `${user_profile}` Connected Accounts block for Shopify entry. **If absent or empty, treat as "not connected"** and surface Connector setup as Stage 1's first step. Do NOT assume the user has connected Shopify just because the skill is being invoked.
- `shop.json` `created_at`, name, currency, timezone, plan (only fetchable if Connector IS connected — otherwise skip and ask the user for store domain)
- Installed apps (via `shopify store execute` query on `appInstallations`) — same precondition
- Theme name and ID — same precondition
- MEMORY.md for prior context

Ask only when technically required (e.g. "I need your store domain to verify the Connector if it's not in MEMORY", or "I see no Shopify in your Connected Accounts — please connect it first via Sidebar → Capabilities → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权)").

**Standard store-domain ask** (use verbatim, ask exactly once, don't bundle other questions in the same turn):
> EN reference: *"I need your Shopify store domain to continue — what's the `xxx.myshopify.com` URL?"*
