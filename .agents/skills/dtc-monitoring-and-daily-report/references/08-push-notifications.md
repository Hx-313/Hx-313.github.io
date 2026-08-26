# Reference 08: Push the Report (Email / Slack / etc.)

> 🚨 **Email push delegates to the `gmail-assistant` skill — DO NOT write a custom `email_report.py`.**
>
> The `gmail-assistant` skill is in the plugin's `defaultSkillIds`, handles OAuth via the Accio Work Gmail Connector, gives you delivery verification, and avoids duplicating email infrastructure.

By default, the daily report writes to a Markdown file under `project/daily-reports/{YYYY-MM-DD}.md`. To **push** that file to the user (rather than them remembering to check), use one of these channels.

---

## Option 1: Email via `gmail-assistant` (recommended for solo founders)

### Setup

1. Confirm Gmail Connector is connected: `Sidebar → Capabilities → Connectors → Gmail`. If absent, instruct the user to connect first.
2. After the daily cron runs and `daily_report.py` writes the file, the **agent (in a follow-up turn or scheduled cron of its own)** invokes the `gmail-assistant` skill to send the email — do not embed Gmail auth or SMTP code in the report script itself.

### Cron pattern (two-step, recommended)

The cron job generates the report file. A separate hook OR the next daily agent run inspects the file and sends via `gmail-assistant`:

```javascript
// Cron 1: generate the report file
cron.add({
  schedule: { kind: "cron", expr: "0 9 * * *", tz: "{shop.ianaTimezone}" },
  payload: {
    kind: "command",
    command: "cd ${WORKSPACE} && python3 project/scripts/daily_report.py"
  }
})

// Cron 2: agent-driven email push (uses gmail-assistant)
cron.add({
  schedule: { kind: "cron", expr: "5 9 * * *", tz: "{shop.ianaTimezone}" },
  payload: {
    kind: "agent",
    message: "Read project/daily-reports/$(date -v-1d +%Y-%m-%d).md and email it to {user_email} using the gmail-assistant skill. Subject: '📊 {Store Name} Daily Report - {date}'."
  }
})
```

The `gmail-assistant` skill handles: auth, MIME formatting (Markdown → HTML), delivery verification, retry on failure.

> ⚠️ **Why not a single command-mode cron?** Because Gmail OAuth tokens live in the Connector, not in env vars — bash-based cron has no access. Agent-mode cron with `gmail-assistant` is the only Connector-aware path.

---

## Option 2: Slack (recommended for teams)

Slack Incoming Webhook is the lightweight path — no Connector needed, just a webhook URL stored in `project/store-config.json`.

### Setup

1. **User does**: Create Slack app at https://api.slack.com/apps → Add Incoming Webhook → Copy Webhook URL → save to `store-config.json` under `notifications.slack_webhook`.
2. **Agent does**: Add a `push_slack.py` to `templates/scripts/` that reads the latest report and POSTs to the webhook.

```python
import json, os, urllib.request
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

# Load config (timezone, webhook, store name)
with open("project/store-config.json") as f:
    cfg = json.load(f)

tz = ZoneInfo(cfg["shop_timezone"])
yesterday = (datetime.now(tz) - timedelta(days=1)).strftime("%Y-%m-%d")
report_path = f"{cfg['reports_dir']}/{yesterday}.md"

with open(report_path) as f:
    report_text = f.read()

# Truncate to fit Slack (~4000 char block limit)
summary = report_text[:3500] + "\n\n... [truncated; full file at " + report_path + "]"

payload = {
    "text": f"📊 Daily Store Report - {yesterday}",
    "blocks": [{"type": "section", "text": {"type": "mrkdwn", "text": summary}}]
}
req = urllib.request.Request(
    cfg["notifications"]["slack_webhook"],
    data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json"},
)
urllib.request.urlopen(req).read()
```

This script CAN run as a `kind: "command"` cron (no auth required beyond the webhook URL).

---

## Option 3: WeChat / Lark / Discord

Same pattern as Slack — config-driven webhook URL + JSON POST. Each platform has a slightly different payload schema:

| Platform | Webhook docs | Payload format |
|---|---|---|
| WeChat Work | search current docs | accepts Markdown directly |
| Lark / Feishu | check `accio-mcp-cli keyword feishu` for an MCP tool | structured card or markdown |
| Discord | Server settings → Integrations → Webhooks | `{"content": "..."}` simple text |

**Verify the current webhook URL/format via `web_search` before quoting** — these change.

---

## Option 4: Push to phone (mobile alerts)

For high-priority alerts (NOT the full daily report — that's a Markdown file, not a notification), use:

- **ntfy.sh** — free, no signup, just POST to a topic URL
- **Pushover** — small one-time fee (verify current pricing), native iOS/Android app
- **Twilio SMS** — for true SMS alerts

Reserve push alerts for **exception conditions only** (CVR drop > 50%, site error spike, big sale event).

---

## Best practice: Tier the channels

| Tier | Trigger | Channel |
|---|---|---|
| Daily summary | Cron 09:00 | Email (via `gmail-assistant`) or Slack |
| Weekly trends | Cron Mon 09:00 | Email (longer format) |
| Anomaly alerts | Real-time (CVR drop, site error) | Slack mention or push |
| Critical (site down) | Real-time | SMS / phone call |

The skill defaults to **Tier 1 only** (daily email or Slack). Higher tiers added per user request.

---

## Privacy: don't email full data to shared inboxes

If the user routes the report to a team email (e.g. `team@store.com` with multiple recipients), the report contains revenue + customer data. Confirm the user is OK with that visibility before subscribing the address.
