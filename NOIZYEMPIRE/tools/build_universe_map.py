#!/usr/bin/env python3
"""Build a data-driven THE 1000 universe map markdown from JSON."""

from __future__ import annotations

import argparse
import datetime as dt
import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = ROOT / "noizy_platform" / "docs" / "data" / "noizyvox-the-1000-universe.json"
DEFAULT_OUTPUT = ROOT / "noizy_platform" / "docs" / "noizyvox-the-1000-universe-map.md"


def _safe_node_id(text: str) -> str:
    cleaned = "".join(ch for ch in text if ch.isalnum() or ch == "_")
    if not cleaned:
        return "node"
    if cleaned[0].isdigit():
        cleaned = f"n{cleaned}"
    return cleaned


def build_markdown(payload: dict) -> str:
    program = payload.get("program", "THE 1000")
    version = payload.get("version", "v1")
    targets = payload.get("targets", {})
    regions = payload.get("regions", [])
    members = payload.get("members", [])
    archetypes = payload.get("archetypes", [])
    cultural_layers = payload.get("cultural_layers", [])

    now = dt.datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
    status_counts = Counter(m.get("status", "unknown") for m in members)
    region_targets = {r["code"]: r for r in regions}
    region_live = Counter(
        m.get("region", "UNK") for m in members if m.get("status", "").lower() in {"live", "active", "deployed"}
    )
    lang_counts: Counter[str] = Counter()
    for m in members:
        for lang in m.get("languages", []):
            lang_counts[lang] += 1

    # Mermaid system flow
    mermaid = [
        "flowchart LR",
        "  A[Guild Application] --> B[Vetting + QA]",
        "  B --> C[Onboarding + Capture]",
        "  C --> D[Training + Persona Build]",
        "  D --> E[Consent Lock + Policy]",
        "  E --> F[Library Packaging]",
        "  F --> G[Studio Licensing]",
        "  G --> H[Usage Telemetry]",
        "  H --> I[Royalty Routing]",
        "  I --> J[Evolution Engine]",
        "  J --> D",
    ]

    # Mermaid member map (sample nodes currently in dataset)
    member_lines = ["flowchart TB", "  ROOT[THE 1000 Universe]"]
    by_region: dict[str, list[dict]] = defaultdict(list)
    for m in members:
        by_region[m.get("region", "UNK")].append(m)

    for region_code, region_members in by_region.items():
        reg_id = _safe_node_id(f"REG_{region_code}")
        reg_label = region_targets.get(region_code, {}).get("label", region_code)
        member_lines.append(f"  ROOT --> {reg_id}[{region_code}: {reg_label}]")
        for m in region_members:
            node_id = _safe_node_id(m.get("id", "MEM"))
            status = m.get("status", "unknown")
            gen = m.get("evolution_generation", 0)
            member_lines.append(f"  {reg_id} --> {node_id}[{m.get('id')} · {status} · G{gen}]")

    region_rows = []
    for region in regions:
        code = region["code"]
        target = int(region.get("target_members", 0))
        live = int(region_live.get(code, 0))
        progress = round((live / target) * 100, 1) if target else 0.0
        region_rows.append((code, region.get("label", code), target, live, progress))

    top_lang = sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    lines: list[str] = []
    lines.append(f"# {program} — Universe Map")
    lines.append("")
    lines.append(f"Generated: {now}")
    lines.append(f"Data version: `{version}`")
    lines.append("")
    lines.append("## Program Targets")
    lines.append("")
    lines.append(f"- Guild members target: **{targets.get('guild_members', 1000)}**")
    lines.append(f"- Core archetypes: **{targets.get('core_archetypes', len(archetypes))}**")
    lines.append(f"- Primary languages: **{targets.get('primary_languages', 17)}**")
    lines.append(f"- Cultural layers: **{targets.get('cultural_layers', len(cultural_layers))}**")
    lines.append("")
    lines.append("## System Map")
    lines.append("")
    lines.append("```mermaid")
    lines.extend(mermaid)
    lines.append("```")
    lines.append("")
    lines.append("## Sovereign Node Topology (Current Dataset)")
    lines.append("")
    lines.append("```mermaid")
    lines.extend(member_lines)
    lines.append("```")
    lines.append("")
    lines.append("## Status Snapshot")
    lines.append("")
    lines.append("| Status | Count |")
    lines.append("|---|---:|")
    for status, count in sorted(status_counts.items()):
        lines.append(f"| {status} | {count} |")
    lines.append("")
    lines.append("## Regional Progress (Live vs Target)")
    lines.append("")
    lines.append("| Region | Label | Target | Live | Progress % |")
    lines.append("|---|---|---:|---:|---:|")
    for code, label, target, live, progress in region_rows:
        lines.append(f"| {code} | {label} | {target} | {live} | {progress} |")
    lines.append("")
    lines.append("## Language Coverage Snapshot (Top 10)")
    lines.append("")
    lines.append("| Language | Members |")
    lines.append("|---|---:|")
    for lang, count in top_lang:
        lines.append(f"| {lang} | {count} |")
    lines.append("")
    lines.append("## Archetype System (Core 8)")
    lines.append("")
    for a in archetypes:
        lines.append(f"- {a}")
    lines.append("")
    lines.append("## Cultural Intelligence Layers (7)")
    lines.append("")
    for layer in cultural_layers:
        lines.append(f"- {layer}")
    lines.append("")
    lines.append("## Member Registry (Current Dataset)")
    lines.append("")
    lines.append("| ID | Name | Region | Status | Evolution Gen | Archetypes | Languages | Dialects | Verticals |")
    lines.append("|---|---|---|---|---:|---|---|---|---|")
    for m in members:
        lines.append(
            f"| {m.get('id','')} | {m.get('display_name','')} | {m.get('region','')} | {m.get('status','')} | "
            f"{m.get('evolution_generation',0)} | "
            f"{', '.join(m.get('archetypes', []))} | "
            f"{', '.join(m.get('languages', []))} | "
            f"{', '.join(m.get('dialects', []))} | "
            f"{', '.join(m.get('verticals', []))} |"
        )
    lines.append("")
    lines.append("## How To Update")
    lines.append("")
    lines.append("1. Edit `noizy_platform/docs/data/noizyvox-the-1000-universe.json`.")
    lines.append("2. Run `python3 tools/build_universe_map.py`.")
    lines.append("3. Re-open this map from workstation command router.")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate NOIZYVOX THE 1000 universe map markdown.")
    parser.add_argument("--input", default=str(DEFAULT_INPUT))
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    payload = json.loads(input_path.read_text(encoding="utf-8"))
    markdown = build_markdown(payload)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(markdown, encoding="utf-8")
    print(f"[the-1000] wrote universe map: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
