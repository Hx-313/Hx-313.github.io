#!/usr/bin/env python3
"""Cost Guardrail — daily / weekly / monthly cap protection for paid APIs.

Used by /geo-* operations whenever they need to call a paid GEO data provider
(DataForSEO, Profound, Otterly, Peec, SerpAPI, Indexing API at scale, etc.).

Design intent: a hard refusal once a budget threshold is hit. We do NOT silently
downgrade or partially succeed — the failure must be loud so the operator
notices and either tops up budget or postpones the request.

USAGE — programmatic guard
  from cost_guardrail import GuardRail
  rail = GuardRail(state_file="project/geo/cost-state.json",
                   limits={"daily_usd": 5, "weekly_usd": 25, "monthly_usd": 75})
  rail.precheck(provider="dataforseo", estimated_usd=0.10)   # raises BudgetExceeded
  # ... do the call ...
  rail.record(provider="dataforseo", actual_usd=0.08)

USAGE — CLI status
  python3 cost_guardrail.py --status --state project/geo/cost-state.json
  python3 cost_guardrail.py --reset --period daily --state project/geo/cost-state.json

STATE FILE FORMAT
  {
    "spend": {
      "2026-04-23": { "dataforseo": 0.42, "profound": 1.20 },
      ...
    },
    "version": 1
  }

NO third-party dependencies — stdlib only.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


class BudgetExceeded(RuntimeError):
    """Raised by GuardRail.precheck when an estimated charge would breach a cap."""


@dataclass
class GuardRail:
    state_file: str
    limits: dict[str, float]   # keys: daily_usd, weekly_usd, monthly_usd

    def __post_init__(self) -> None:
        for k in ("daily_usd", "weekly_usd", "monthly_usd"):
            if k not in self.limits:
                raise ValueError(f"GuardRail.limits missing required key: {k}")
        Path(self.state_file).parent.mkdir(parents=True, exist_ok=True)

    # ---- state I/O ---------------------------------------------------------

    def _load(self) -> dict[str, Any]:
        if not os.path.exists(self.state_file):
            return {"spend": {}, "version": 1}
        with open(self.state_file, encoding="utf-8") as f:
            return json.load(f)

    def _save(self, state: dict[str, Any]) -> None:
        with open(self.state_file, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
            f.write("\n")

    # ---- math --------------------------------------------------------------

    def _today(self) -> str:
        return dt.date.today().isoformat()

    def _date_in_window(self, day_iso: str, days_back: int) -> bool:
        try:
            d = dt.date.fromisoformat(day_iso)
        except ValueError:
            return False
        delta = (dt.date.today() - d).days
        return 0 <= delta < days_back

    def totals(self) -> dict[str, float]:
        state = self._load()
        daily = sum(state["spend"].get(self._today(), {}).values())
        weekly = sum(
            sum(day.values())
            for d, day in state["spend"].items()
            if self._date_in_window(d, 7)
        )
        monthly = sum(
            sum(day.values())
            for d, day in state["spend"].items()
            if self._date_in_window(d, 30)
        )
        return {"daily_usd": daily, "weekly_usd": weekly, "monthly_usd": monthly}

    # ---- guard -------------------------------------------------------------

    def precheck(self, provider: str, estimated_usd: float) -> None:
        if estimated_usd <= 0:
            return
        spent = self.totals()
        for k in ("daily_usd", "weekly_usd", "monthly_usd"):
            cap = self.limits[k]
            if spent[k] + estimated_usd > cap:
                raise BudgetExceeded(
                    f"{provider}: would exceed {k} cap "
                    f"(spent ${spent[k]:.2f} + est ${estimated_usd:.2f} > ${cap:.2f}). "
                    f"Increase the cap in project/geo/cost-state.json or wait until "
                    f"the {k.split('_')[0]} window resets."
                )

    def record(self, provider: str, actual_usd: float) -> None:
        if actual_usd <= 0:
            return
        state = self._load()
        today = self._today()
        state["spend"].setdefault(today, {})
        state["spend"][today][provider] = state["spend"][today].get(provider, 0.0) + actual_usd
        self._save(state)

    # ---- maintenance -------------------------------------------------------

    def reset(self, period: str) -> int:
        """Zero out spend records older than the given period.
        period: 'daily' (today only), 'weekly' (last 7d), 'monthly' (last 30d), 'all'."""
        state = self._load()
        if period == "all":
            state["spend"] = {}
        else:
            days = {"daily": 1, "weekly": 7, "monthly": 30}.get(period)
            if days is None:
                raise ValueError(f"Unknown period: {period}")
            state["spend"] = {
                d: v for d, v in state["spend"].items()
                if not self._date_in_window(d, days)
            }
        self._save(state)
        return len(state["spend"])


# -----------------------------------------------------------------------------
# CLI

def _cli() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--state", required=True, help="Path to cost state JSON")
    ap.add_argument("--daily-cap", type=float, default=5.0, help="Daily USD cap (default 5)")
    ap.add_argument("--weekly-cap", type=float, default=25.0, help="Weekly USD cap (default 25)")
    ap.add_argument("--monthly-cap", type=float, default=75.0, help="Monthly USD cap (default 75)")

    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--status", action="store_true", help="Print current spend totals")
    mode.add_argument("--check", nargs=2, metavar=("PROVIDER", "EST_USD"),
                      help="Check whether a planned call fits in budget")
    mode.add_argument("--record", nargs=2, metavar=("PROVIDER", "ACTUAL_USD"),
                      help="Record an actual charge")
    mode.add_argument("--reset", choices=["daily", "weekly", "monthly", "all"],
                      help="Reset spend for the given window")

    args = ap.parse_args()
    rail = GuardRail(
        state_file=args.state,
        limits={
            "daily_usd": args.daily_cap,
            "weekly_usd": args.weekly_cap,
            "monthly_usd": args.monthly_cap,
        },
    )

    if args.status:
        spent = rail.totals()
        print(json.dumps({
            "spent": spent,
            "limits": rail.limits,
            "remaining": {k: round(rail.limits[k] - spent[k], 2) for k in spent},
        }, indent=2))
        return 0

    if args.check:
        provider, est = args.check
        try:
            rail.precheck(provider, float(est))
            print(json.dumps({"ok": True, "provider": provider, "estimated_usd": float(est)}))
            return 0
        except BudgetExceeded as e:
            print(json.dumps({"ok": False, "error": str(e)}), file=sys.stderr)
            return 2

    if args.record:
        provider, actual = args.record
        rail.record(provider, float(actual))
        print(json.dumps({"recorded": True, "provider": provider, "actual_usd": float(actual)}))
        return 0

    if args.reset:
        kept = rail.reset(args.reset)
        print(json.dumps({"reset": args.reset, "remaining_day_records": kept}))
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(_cli())
