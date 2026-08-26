#!/usr/bin/env python3
"""Citability Score — per-page rubric scorer for shopify-geo-optimizer.

Implements the rubric defined in references/geo/02-citability-rubric.md.

Stdlib only — no third-party deps. Designed to run inside an Accio Work agent
session against a Product / Page / Article fetched via shopify-admin-execution.

USAGE
  python3 citability_score.py --input page.json --out audit.json
  python3 citability_score.py --input page.json   # prints to stdout
  cat page.json | python3 citability_score.py --stdin

INPUT FORMAT (page.json)
  {
    "handle": "example-product",
    "url": "https://example.myshopify.com/products/example-product",
    "title": "Example Product Title",
    "description_html": "<p>...</p>",
    "schema_jsonld_blocks": [ {...}, {...} ],
    "rendered_text": "(optional) cleaned text from parse_html.py"
  }

OUTPUT
  {
    "handle": "...",
    "score": 52,
    "dimensions": { "self_containment": 88, ... },
    "next_actions": [ "/geo-enrich-stats", ... ]
  }

NOTE — this is a deterministic, rule-based proxy. It does not call an LLM.
For LLM-grounded judgments (e.g. self-containment subtlety) the agent should
sample 2–3 paragraphs and ask the LLM directly. The rubric values produced
here are stable across runs and cheap to compute on every audit.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from html.parser import HTMLParser
from typing import Any


# -- weights from references/geo/02-citability-rubric.md -----------------------
WEIGHTS = {
    "self_containment": 0.25,
    "statistic_density": 0.20,
    "verifiable_claims": 0.15,
    "structured_qa":     0.15,
    "eeat":              0.15,
    "schema_completeness": 0.10,
}

REQUIRED_SCHEMAS = {"Product", "Offer", "AggregateRating", "Brand"}
ENTITY_LINK_KEYS = {"isRelatedTo", "isAccessoryOrSparePartFor", "material", "audience", "award"}

# Pronouns that can leave a paragraph dangling without context
DANGLING_TOKENS_RE = re.compile(
    r"\b(it|this|that|they|these|those|also|additionally|further|"
    r"as\s+(we\s+)?mentioned|see\s+above|see\s+below)\b",
    flags=re.IGNORECASE,
)
# Stat tokens: integers ≥ 10, decimals, percentages, currency, ISO date,
# dimensions like "4.2 kg", or "12-piece" / "3 pack"
STAT_TOKEN_RE = re.compile(
    r"(\$\s?\d+(\.\d+)?|\d+\.\d+|\d{2,}(?!\d)|\d+\s?%|\d{4}-\d{2}-\d{2}|"
    r"\d+(\.\d+)?\s?(kg|g|lb|lbs|oz|cm|mm|in|inch|inches|ft|m|ml|l|°C|°F)|"
    r"\d+[-\s](piece|pack|count|set|pcs))",
    flags=re.IGNORECASE,
)
QUESTION_HEADING_RE = re.compile(
    r"^(how|what|when|where|why|can|do|does|is|are|should)\b.*\?\s*$",
    flags=re.IGNORECASE,
)


# -----------------------------------------------------------------------------
# HTML helpers (stdlib only)

class _ParagraphExtractor(HTMLParser):
    """Walk HTML, capture text grouped per-paragraph and per-heading."""

    def __init__(self) -> None:
        super().__init__()
        self.paragraphs: list[str] = []
        self.headings: list[tuple[int, str]] = []  # (level, text)
        self._current: list[str] = []
        self._mode: str | None = None  # "p", "h2", "h3", etc.
        self._heading_level = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "p":
            self._flush()
            self._mode = "p"
        elif tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self._flush()
            self._mode = "h"
            self._heading_level = int(tag[1])

    def handle_endtag(self, tag: str) -> None:
        if tag == "p" or tag.startswith("h"):
            self._flush()
            self._mode = None

    def handle_data(self, data: str) -> None:
        if self._mode in {"p", "h"}:
            self._current.append(data)

    def _flush(self) -> None:
        if not self._current:
            return
        text = " ".join(self._current).strip()
        text = re.sub(r"\s+", " ", text)
        if text:
            if self._mode == "p":
                self.paragraphs.append(text)
            elif self._mode == "h":
                self.headings.append((self._heading_level, text))
        self._current = []


def extract_text(html: str) -> tuple[list[str], list[tuple[int, str]]]:
    parser = _ParagraphExtractor()
    parser.feed(html or "")
    parser._flush()
    return parser.paragraphs, parser.headings


# -----------------------------------------------------------------------------
# Per-dimension scorers

def score_self_containment(paragraphs: list[str]) -> int:
    if not paragraphs:
        return 0
    clean = 0
    for p in paragraphs:
        # A paragraph is "clean" if first 12 words contain no dangling tokens.
        head = " ".join(p.split()[:12])
        if not DANGLING_TOKENS_RE.search(head):
            clean += 1
    return round(clean / len(paragraphs) * 100)


def score_statistic_density(paragraphs: list[str]) -> int:
    text = " ".join(paragraphs)
    words = text.split()
    if not words:
        return 0
    stat_count = len(STAT_TOKEN_RE.findall(text))
    density_per_1k = stat_count / len(words) * 1000
    if density_per_1k >= 8:
        return 100
    if density_per_1k >= 4:
        return 70
    if density_per_1k >= 1:
        return 35
    return 0


def score_verifiable_claims(paragraphs: list[str], html: str) -> int:
    text = " ".join(paragraphs)
    # Crude proper-noun detector: token starts with capital, not at sentence start, ≥ 4 chars
    tokens = re.findall(r"(?<![\.\!\?]\s)\b[A-Z][a-zA-Z]{3,}\b", text)
    distinct_entities = len(set(tokens))
    outbound_links = len(re.findall(r"https?://[^\s\"'>]+", html or ""))
    if distinct_entities >= 3 and outbound_links >= 1:
        return 100
    if distinct_entities >= 2 and outbound_links >= 1:
        return 70
    if distinct_entities >= 1:
        return 35
    return 0


def score_structured_qa(headings: list[tuple[int, str]], schemas: list[dict[str, Any]]) -> int:
    """Visible-structure-first scoring (updated 2026-07).

    Rationale: Google retired FAQ rich results for ALL sites on May 7, 2026
    (commerce sites were already excluded since Aug 2023), and no AI engine has
    confirmed reading FAQPage markup. What an LLM can extract is the *visible*
    question-styled headings with self-contained answers, so visible structure
    decides the band; FAQPage JSON-LD acts only as a small tie-breaker within
    the band (+5, capped at 100) and can never lift a page to a higher band.
    See references/geo/02-citability-rubric.md ("Structured Q&A").
    """
    has_faq_schema = any(
        s.get("@type") == "FAQPage" or "FAQPage" in str(s.get("@type", ""))
        for s in schemas
    )

    question_headings = sum(1 for _, h in headings if QUESTION_HEADING_RE.match(h))

    if question_headings >= 3:
        base = 100
    elif question_headings >= 1:
        base = 70
    else:
        base = 0

    if has_faq_schema and base > 0:
        base = min(base + 5, 100)
    return base


def score_schema_completeness(schemas: list[dict[str, Any]]) -> int:
    types_present: set[str] = set()
    has_entity_link = False
    for s in schemas:
        t = s.get("@type")
        if isinstance(t, str):
            types_present.add(t)
        elif isinstance(t, list):
            types_present.update(x for x in t if isinstance(x, str))
        if any(k in s for k in ENTITY_LINK_KEYS):
            has_entity_link = True

    missing = REQUIRED_SCHEMAS - types_present
    if not missing and has_entity_link:
        return 100
    if not missing:
        return 75
    if len(missing) == 1:
        return 50
    if "Product" in missing:
        return 0
    return 25


def score_eeat(eeat_passed: list[str], eeat_failed: list[str]) -> int:
    """E-E-A-T is supplied externally — by an LLM or by the agent's checklist
    walk. If neither side has data, return 50 as a neutral placeholder."""
    total = len(eeat_passed) + len(eeat_failed)
    if total == 0:
        return 50
    return round(len(eeat_passed) / total * 100)


# -----------------------------------------------------------------------------
# Top-level

@dataclass
class PageInput:
    handle: str
    url: str
    title: str
    description_html: str
    schema_jsonld_blocks: list[dict[str, Any]]
    eeat_passed: list[str]
    eeat_failed: list[str]


def load_page(payload: dict[str, Any]) -> PageInput:
    return PageInput(
        handle=payload.get("handle", ""),
        url=payload.get("url", ""),
        title=payload.get("title", ""),
        description_html=payload.get("description_html", ""),
        schema_jsonld_blocks=payload.get("schema_jsonld_blocks", []) or [],
        eeat_passed=payload.get("eeat_passed", []) or [],
        eeat_failed=payload.get("eeat_failed", []) or [],
    )


def score_page(page: PageInput) -> dict[str, Any]:
    paragraphs, headings = extract_text(page.description_html)

    dims = {
        "self_containment":  score_self_containment(paragraphs),
        "statistic_density": score_statistic_density(paragraphs),
        "verifiable_claims": score_verifiable_claims(paragraphs, page.description_html),
        "structured_qa":     score_structured_qa(headings, page.schema_jsonld_blocks),
        "eeat":              score_eeat(page.eeat_passed, page.eeat_failed),
        "schema_completeness": score_schema_completeness(page.schema_jsonld_blocks),
    }
    total = round(sum(dims[k] * WEIGHTS[k] for k in WEIGHTS))

    next_actions: list[str] = []
    if dims["statistic_density"] < 50:
        next_actions.append("/geo-enrich-stats")
    if dims["verifiable_claims"] < 50:
        next_actions.append("/geo-inject-quotes")
    if dims["structured_qa"] < 50:
        next_actions.append("/geo-add-faq-block")
    if dims["schema_completeness"] < 75:
        next_actions.append("/geo-fix-schema")
    if dims["eeat"] < 60:
        next_actions.append("/geo-eeat-review")

    return {
        "handle": page.handle,
        "url": page.url,
        "title": page.title,
        "score": total,
        "dimensions": dims,
        "next_actions": next_actions or ["maintain"],
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--input", help="Path to page JSON")
    src.add_argument("--stdin", action="store_true", help="Read JSON from stdin")
    ap.add_argument("--out", help="Write result JSON here (default: stdout)")
    args = ap.parse_args()

    raw = sys.stdin.read() if args.stdin else open(args.input, encoding="utf-8").read()
    payload = json.loads(raw)
    pages = payload if isinstance(payload, list) else [payload]
    results = [score_page(load_page(p)) for p in pages]
    out = results[0] if len(results) == 1 else results

    text = json.dumps(out, indent=2, ensure_ascii=False)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(text + "\n")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
