# Reference 01: Skill Layout & Quick Decision Tree

> Extracted from SKILL.md to keep the main file lean. Read this when you need to (a) locate a file by purpose, (b) figure out which stage to start from given partial install state.

---

## File structure

```
dtc-monitoring-and-daily-report/
├── SKILL.md                                        ← Main flow (5 stages + hard rules)
├── references/
│   ├── 00-stage0-opening-script.md                 ← Opening templates, opt-out variants, language matching
│   ├── 00-verified-urls.md                         ← Top-level SaaS URLs + last-verified date
│   ├── 01-skill-layout-and-decision-tree.md        ← This file
│   ├── 02-analytics-snippet-pattern.md             ← Unified analytics snippet design
│   ├── 03-install-judgeme.md                       ← Judge.me end-to-end
│   ├── 04-install-clarity.md                       ← Microsoft Clarity end-to-end
│   ├── 07-report-design-principles.md              ← Why we translate jargon, layout rules
│   ├── 08-push-notifications.md                    ← Delegating push to gmail-assistant / Slack
│   └── 99-fallback-self-hosted.md                  ← Non-Accio-Work fallback (Custom App + token)
├── templates/
│   ├── scripts/
│   │   ├── README.md                               ← Architecture & extension guide
│   │   ├── api_version.py                          ← Single source of truth for Admin API version
│   │   ├── shopify_cli.py                          ← Wraps `shopify store execute` calls
│   │   ├── fetch_shopify.py                        ← Yesterday's orders, products count, totals
│   │   ├── fetch_clarity.py                        ← Clarity Data Export API
│   │   ├── fetch_judgeme.py                        ← Judge.me Public API
│   │   ├── render_report.py                        ← Pure renderer (data → Markdown)
│   │   └── daily_report.py                         ← Orchestrator with try/except per source
│   ├── store-config.example.json                   ← Per-store config (timezone, language, tokens)
│   ├── analytics_snippet_template.liquid           ← Theme snippet template
│   ├── sample-report-mvp.md                        ← Internal schema ref (free tier; English; do NOT inline to users)
│   └── sample-report-mature.md                     ← Internal schema ref (with reviews; English; do NOT inline to users)
└── scripts/
    └── check_health.py                             ← Verify installed tools
```

---

## Quick decision tree

Use this when the user asks for monitoring help and you don't yet know how much of the stack is in place.

```
User says "monitor my store" / "set up dashboard" / "see store data"
  │
  ├── Connector connected to Shopify?
  │     ├── No → Stage 1 (guide through Connector flow)
  │     └── Yes → Continue
  │
  ├── Clarity Connector connected? (`~/.accio/accounts/<id>/connectors/data/clarity/state.json` has accounts: [...])
  │     ├── Yes → Skip Clarity Data Export token step; agent will fetch via local MCP server
  │     └── No  → Either guide user through Connector OAuth (preferred) OR fall back to manual `clarity.api_token`
  │
  ├── How many of these are installed? (Clarity / Judge.me)
  │     ├── 0     → Stage 2 (Clarity) — defer Judge.me to 2.5
  │     ├── 1     → Stage 2 (only missing ones)
  │     └── all   → Stage 3
  │
  ├── Daily report script exists & tested?
  │     ├── No  → Stage 3 (mock first, then real)
  │     └── Yes → Stage 4
  │
  └── Cron scheduled?
        ├── No  → Stage 4
        └── Yes → Stage 5 (iterate)
```

When in doubt, ask the user where they are and start from there.

---

## Where to find what (quick lookup)

| If you need to... | Read |
|---|---|
| Word-for-word opening message | `00-stage0-opening-script.md` |
| URL or pricing fact (no guessing) | `00-verified-urls.md` |
| Install Microsoft Clarity | `04-install-clarity.md` |
| Set up Clarity via Accio Work Connector (preferred) | `04-install-clarity.md` (Step 0) |
| Clarity dual-path script architecture (Connector vs token) | `templates/scripts/README.md` (Clarity dual path) + `templates/scripts/fetch_clarity.py` (top-of-file docstring) |
| Install Judge.me reviews | `03-install-judgeme.md` |
| Edit how the analytics snippet is composed | `02-analytics-snippet-pattern.md` |
| Decide what goes into a daily report | `07-report-design-principles.md` |
| Push reports via email or Slack | `08-push-notifications.md` |
| Help a user not on Accio Work | `99-fallback-self-hosted.md` |
| Modify report data sources / layout | `templates/scripts/README.md` |
