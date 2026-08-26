#!/usr/bin/env python3
"""HTML → clean text + headings + JSON-LD blocks for citability analysis.

Used by citability_score.py and by /geo-audit when fetching live pages via
web_fetch (which returns raw HTML).

Stdlib only.

USAGE
  python3 parse_html.py --url https://store.example/products/handle
  python3 parse_html.py --file page.html
  cat page.html | python3 parse_html.py --stdin

OUTPUT
  {
    "title": "...",
    "meta_description": "...",
    "headings": [ {"level": 1, "text": "..."}, ... ],
    "paragraphs": [ "...", ... ],
    "schema_jsonld_blocks": [ {...}, {...} ],
    "outbound_links": [ "https://...", ... ],
    "blockquotes": [ {"text": "...", "cite": "..."}, ... ],
    "word_count": 1234
  }

NOTE: web_fetch is preferred over urllib for sites that need a real User-Agent.
This script supports --url for offline / scripted use only.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
from html.parser import HTMLParser
from typing import Any


class _PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title: str = ""
        self.meta_description: str = ""
        self.headings: list[dict[str, Any]] = []
        self.paragraphs: list[str] = []
        self.schema_jsonld_blocks: list[dict[str, Any]] = []
        self.outbound_links: list[str] = []
        self.blockquotes: list[dict[str, str]] = []

        self._mode_stack: list[str] = []  # latest tag captured in
        self._buf: list[str] = []
        self._h_level: int = 0
        self._jsonld_buf: list[str] = []
        self._in_jsonld = False
        self._current_blockquote_cite: str = ""
        self._in_blockquote = False
        self._blockquote_buf: list[str] = []
        self._in_title = False
        self._suppress = 0   # depth of script/style we're inside (non-jsonld)

    # ---- start tags --------------------------------------------------------

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_dict = dict(attrs)
        if tag == "title":
            self._in_title = True
            self._buf = []
        elif tag == "meta":
            name = (attr_dict.get("name") or "").lower()
            if name == "description":
                self.meta_description = attr_dict.get("content") or ""
        elif tag == "script":
            if (attr_dict.get("type") or "").lower() == "application/ld+json":
                self._in_jsonld = True
                self._jsonld_buf = []
            else:
                self._suppress += 1
        elif tag == "style":
            self._suppress += 1
        elif tag == "p":
            self._flush_buf_into("paragraph")
            self._mode_stack.append("p")
        elif tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self._flush_buf_into("paragraph")
            self._h_level = int(tag[1])
            self._mode_stack.append("h")
        elif tag == "a":
            href = attr_dict.get("href") or ""
            if href.startswith("http") and not self._is_internal(href):
                self.outbound_links.append(href)
        elif tag == "blockquote":
            self._in_blockquote = True
            self._current_blockquote_cite = attr_dict.get("cite") or ""
            self._blockquote_buf = []

    # ---- end tags ----------------------------------------------------------

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.title = " ".join(self._buf).strip()
            self._buf = []
            self._in_title = False
        elif tag == "script":
            if self._in_jsonld:
                raw = "".join(self._jsonld_buf).strip()
                self._in_jsonld = False
                self._jsonld_buf = []
                if raw:
                    try:
                        parsed = json.loads(raw)
                    except json.JSONDecodeError:
                        # Try sub-extraction — sometimes blocks are concatenated
                        return
                    if isinstance(parsed, list):
                        self.schema_jsonld_blocks.extend(
                            [x for x in parsed if isinstance(x, dict)]
                        )
                    elif isinstance(parsed, dict):
                        # Handle @graph wrapper
                        graph = parsed.get("@graph")
                        if isinstance(graph, list):
                            self.schema_jsonld_blocks.extend(
                                [x for x in graph if isinstance(x, dict)]
                            )
                        else:
                            self.schema_jsonld_blocks.append(parsed)
            else:
                self._suppress = max(0, self._suppress - 1)
        elif tag == "style":
            self._suppress = max(0, self._suppress - 1)
        elif tag in {"p", "h1", "h2", "h3", "h4", "h5", "h6"}:
            self._flush_buf_into("heading" if tag.startswith("h") else "paragraph")
            if self._mode_stack:
                self._mode_stack.pop()
        elif tag == "blockquote":
            text = " ".join(self._blockquote_buf).strip()
            text = re.sub(r"\s+", " ", text)
            if text:
                self.blockquotes.append({
                    "text": text,
                    "cite": self._current_blockquote_cite,
                })
            self._in_blockquote = False
            self._current_blockquote_cite = ""
            self._blockquote_buf = []

    # ---- data --------------------------------------------------------------

    def handle_data(self, data: str) -> None:
        if self._in_jsonld:
            self._jsonld_buf.append(data)
            return
        if self._suppress > 0:
            return
        if self._in_title:
            self._buf.append(data)
            return
        if self._mode_stack and self._mode_stack[-1] in {"p", "h"}:
            self._buf.append(data)
        if self._in_blockquote:
            self._blockquote_buf.append(data)

    # ---- helpers -----------------------------------------------------------

    def _flush_buf_into(self, kind: str) -> None:
        text = " ".join(self._buf).strip()
        text = re.sub(r"\s+", " ", text)
        self._buf = []
        if not text:
            return
        if kind == "paragraph":
            self.paragraphs.append(text)
        elif kind == "heading" and self._h_level:
            self.headings.append({"level": self._h_level, "text": text})

    @staticmethod
    def _is_internal(href: str) -> bool:
        # We don't have the page's own host here. Heuristic: links to the same
        # myshopify domain or shop's primary domain are internal. Caller can
        # post-filter using the page URL.
        return False


def parse(html: str) -> dict[str, Any]:
    p = _PageParser()
    p.feed(html or "")
    p._flush_buf_into("paragraph")  # flush trailing
    word_count = sum(len(par.split()) for par in p.paragraphs)
    return {
        "title": p.title,
        "meta_description": p.meta_description,
        "headings": p.headings,
        "paragraphs": p.paragraphs,
        "schema_jsonld_blocks": p.schema_jsonld_blocks,
        "outbound_links": list(dict.fromkeys(p.outbound_links)),  # dedupe, preserve order
        "blockquotes": p.blockquotes,
        "word_count": word_count,
    }


def _fetch(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Accio-shopify-geo-optimizer/1.0 (+https://www.accio.com)"
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:  # noqa: S310 (intentional, opt-in)
        return r.read().decode("utf-8", errors="replace")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--url", help="Fetch and parse the URL (use web_fetch in production)")
    src.add_argument("--file", help="Path to local HTML file")
    src.add_argument("--stdin", action="store_true")
    args = ap.parse_args()

    if args.url:
        html = _fetch(args.url)
    elif args.file:
        with open(args.file, encoding="utf-8") as f:
            html = f.read()
    else:
        html = sys.stdin.read()

    print(json.dumps(parse(html), indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
