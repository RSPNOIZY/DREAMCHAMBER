#!/usr/bin/env python3
"""Generate NOIZYVOX world healing library architecture markdown from JSON."""

from __future__ import annotations

import argparse
import datetime as dt
import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = ROOT / "noizy_platform" / "docs" / "data" / "world-healing-library.json"
DEFAULT_OUTPUT = ROOT / "noizy_platform" / "docs" / "world-healing-library-architecture.md"


def build_markdown(payload: dict) -> str:
    now = dt.datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
    traditions = payload.get("traditions", [])
    program = payload.get("program", "NOIZYVOX Global Healing Library")
    version = payload.get("version", "v1")
    protocol_families = payload.get("protocol_families", [])

    family_counts = Counter(t.get("protocol_family", "unknown") for t in traditions)
    safety_counts = Counter(t.get("safety_profile", "unknown") for t in traditions)

    lines: list[str] = []
    lines.append(f"# {program} — Architecture")
    lines.append("")
    lines.append(f"Generated: {now}")
    lines.append(f"Data version: `{version}`")
    lines.append("")
    lines.append("## Scope")
    lines.append("")
    lines.append(
        "A data-driven mapping of global sonic traditions into NOIZYVOX protocol families, "
        "Guild voice roles, and runtime delivery constraints."
    )
    lines.append("")
    lines.append("## System Flow")
    lines.append("")
    lines.append("```mermaid")
    lines.append("flowchart LR")
    lines.append("  A[Cultural Tradition Node] --> B[Protocol Family Mapper]")
    lines.append("  B --> C[Guild Voice Role]")
    lines.append("  B --> D[Tempo/Frequency Profile]")
    lines.append("  C --> E[Runtime Planner]")
    lines.append("  D --> E")
    lines.append("  E --> F[Voice + Haptic + Binaural Delivery]")
    lines.append("  F --> G[Telemetry + Outcomes]")
    lines.append("  G --> H[Protocol Versioning]")
    lines.append("  H --> B")
    lines.append("```")
    lines.append("")
    lines.append("## Protocol Families")
    lines.append("")
    for family in protocol_families:
        lines.append(f"- `{family}`")
    lines.append("")
    lines.append("## Coverage Snapshot")
    lines.append("")
    lines.append("| Dimension | Count |")
    lines.append("|---|---:|")
    lines.append(f"| Tradition nodes | {len(traditions)} |")
    lines.append(f"| Protocol families | {len(protocol_families)} |")
    lines.append(f"| Safety profiles | {len(safety_counts)} |")
    lines.append("")
    lines.append("## Family Distribution")
    lines.append("")
    lines.append("| Protocol Family | Traditions |")
    lines.append("|---|---:|")
    for family, count in sorted(family_counts.items()):
        lines.append(f"| {family} | {count} |")
    lines.append("")
    lines.append("## Safety Profile Distribution")
    lines.append("")
    lines.append("| Safety Profile | Traditions |")
    lines.append("|---|---:|")
    for profile, count in sorted(safety_counts.items()):
        lines.append(f"| {profile} | {count} |")
    lines.append("")
    lines.append("## Tradition-to-Protocol Mapping")
    lines.append("")
    lines.append(
        "| ID | Tradition | Region | Modalities | Tempo BPM | Frequency Focus | "
        "Guild Voice Role | Languages | Protocol Family | Safety |"
    )
    lines.append("|---|---|---|---|---|---|---|---|---|---|")
    for t in traditions:
        lines.append(
            f"| {t.get('id','')} | {t.get('label','')} | {t.get('region','')} | "
            f"{', '.join(t.get('modalities', []))} | {t.get('tempo_bpm_range','')} | "
            f"{t.get('frequency_focus_hz','')} | {t.get('guild_voice_role','')} | "
            f"{', '.join(t.get('languages_examples', []))} | {t.get('protocol_family','')} | "
            f"{t.get('safety_profile','')} |"
        )
    lines.append("")
    lines.append("## Implementation Notes")
    lines.append("")
    lines.append("1. Treat these mappings as protocol templates, not medical directives.")
    lines.append("2. Enforce cultural consent and rights gating before production use.")
    lines.append("3. Require evidence and clinician review for protocol upgrades.")
    lines.append("")
    lines.append("## Update Process")
    lines.append("")
    lines.append("1. Edit `noizy_platform/docs/data/world-healing-library.json`.")
    lines.append("2. Run `python3 tools/build_world_healing_library.py`.")
    lines.append("3. Review diff and publish updated architecture.")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build NOIZYVOX world healing library architecture doc.")
    parser.add_argument("--input", default=str(DEFAULT_INPUT))
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()

    payload = json.loads(Path(args.input).read_text(encoding="utf-8"))
    markdown = build_markdown(payload)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(markdown, encoding="utf-8")
    print(f"[world-healing] wrote architecture: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

