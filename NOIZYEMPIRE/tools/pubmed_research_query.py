#!/usr/bin/env python3
"""Query PubMed and optionally summarize results with Anthropic Claude.

This tool is designed for evidence gathering, not diagnosis.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = ROOT / "noizy_platform" / "docs" / "data" / "pubmed-last-query.json"
NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages"


def _http_get_json(url: str) -> dict[str, Any]:
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _http_post_json(url: str, payload: dict[str, Any], headers: dict[str, str]) -> dict[str, Any]:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    for key, value in headers.items():
        req.add_header(key, value)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def search_pubmed(query: str, retmax: int, email: str | None, tool: str | None) -> list[str]:
    params = {
        "db": "pubmed",
        "term": query,
        "retmode": "json",
        "retmax": str(retmax),
        "sort": "relevance",
    }
    api_key = os.getenv("NCBI_API_KEY")
    if api_key:
        params["api_key"] = api_key
    if email:
        params["email"] = email
    if tool:
        params["tool"] = tool

    url = f"{NCBI_BASE}/esearch.fcgi?{urllib.parse.urlencode(params)}"
    payload = _http_get_json(url)
    return payload.get("esearchresult", {}).get("idlist", [])


def summarize_pubmed(pmids: list[str], email: str | None, tool: str | None) -> list[dict[str, Any]]:
    if not pmids:
        return []

    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "json",
    }
    api_key = os.getenv("NCBI_API_KEY")
    if api_key:
        params["api_key"] = api_key
    if email:
        params["email"] = email
    if tool:
        params["tool"] = tool

    url = f"{NCBI_BASE}/esummary.fcgi?{urllib.parse.urlencode(params)}"
    payload = _http_get_json(url)
    result = payload.get("result", {})

    articles: list[dict[str, Any]] = []
    for pmid in pmids:
        item = result.get(pmid, {})
        articles.append(
            {
                "pmid": pmid,
                "title": item.get("title"),
                "journal": item.get("fulljournalname") or item.get("source"),
                "pubdate": item.get("pubdate"),
                "authors": [a.get("name") for a in item.get("authors", []) if a.get("name")],
                "doi": item.get("elocationid"),
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
            }
        )
    return articles


def summarize_with_claude(
    *,
    query: str,
    articles: list[dict[str, Any]],
    model: str,
    max_tokens: int,
) -> str | None:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return None

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
    }

    compact = [
        {
            "pmid": a.get("pmid"),
            "title": a.get("title"),
            "journal": a.get("journal"),
            "pubdate": a.get("pubdate"),
            "url": a.get("url"),
        }
        for a in articles
    ]
    prompt = (
        "You are producing a concise research brief for an engineering team building "
        "panic-mode and calming audio interventions. Do not give medical advice. "
        "Summarize findings, caveats, and evidence strength.\n\n"
        f"Query: {query}\n"
        f"Articles: {json.dumps(compact, ensure_ascii=True)}"
    )
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "temperature": 0.1,
        "messages": [{"role": "user", "content": prompt}],
    }
    response = _http_post_json(ANTHROPIC_MESSAGES_URL, payload, headers)
    blocks = response.get("content", [])
    parts: list[str] = []
    for block in blocks:
        if block.get("type") == "text" and block.get("text"):
            parts.append(block["text"])
    return "\n\n".join(parts).strip() if parts else None


def build_payload(
    query: str,
    articles: list[dict[str, Any]],
    claude_summary: str | None,
) -> dict[str, Any]:
    return {
        "query": query,
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source": "PubMed E-utilities",
        "article_count": len(articles),
        "articles": articles,
        "claude_summary": claude_summary,
        "safety_note": (
            "Research support output only. Not medical advice. "
            "Validate clinically before deployment."
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Query PubMed and optionally summarize with Anthropic Claude."
    )
    parser.add_argument("--query", required=True, help="PubMed query string")
    parser.add_argument("--retmax", type=int, default=12, help="Max records to fetch")
    parser.add_argument("--email", default=None, help="Contact email for NCBI requests")
    parser.add_argument("--tool", default="noizyvox_research", help="Tool name for NCBI")
    parser.add_argument(
        "--anthropic-model",
        default=None,
        help="Optional Claude model id (requires ANTHROPIC_API_KEY)",
    )
    parser.add_argument(
        "--anthropic-max-tokens", type=int, default=800, help="Claude summary token cap"
    )
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="Output JSON path")
    args = parser.parse_args()

    try:
        pmids = search_pubmed(args.query, args.retmax, args.email, args.tool)
        articles = summarize_pubmed(pmids, args.email, args.tool)
        claude_summary = None
        if args.anthropic_model:
            claude_summary = summarize_with_claude(
                query=args.query,
                articles=articles,
                model=args.anthropic_model,
                max_tokens=args.anthropic_max_tokens,
            )

        payload = build_payload(args.query, articles, claude_summary)
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(
            f"[pubmed] wrote {len(articles)} article summaries to {output_path}"
        )
        if args.anthropic_model and not os.getenv("ANTHROPIC_API_KEY"):
            print("[pubmed] ANTHROPIC_API_KEY missing; skipped Claude summary.")
        return 0
    except urllib.error.HTTPError as exc:
        print(f"[pubmed] HTTP error: {exc}", file=sys.stderr)
        return 2
    except urllib.error.URLError as exc:
        print(f"[pubmed] Network error: {exc}", file=sys.stderr)
        return 3
    except Exception as exc:  # noqa: BLE001
        print(f"[pubmed] Unexpected error: {exc}", file=sys.stderr)
        return 4


if __name__ == "__main__":
    raise SystemExit(main())

