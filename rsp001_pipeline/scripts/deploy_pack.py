#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def main() -> int:
    parser = argparse.ArgumentParser(description="Build RSP_001 AAA package structure.")
    parser.add_argument("--actor", required=True)
    parser.add_argument("--title", default="RSP_001_AAA")
    parser.add_argument("--config", default="config/paths.yml")
    args = parser.parse_args()

    import yaml

    with (ROOT / args.config).open("r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    pack_root = ROOT / cfg["paths"]["packs"] / args.title
    for dirname in ["HERO", "VILLAIN", "NARRATOR", "PHONEME_STEMS", "CONSENT_CERT"]:
        (pack_root / dirname).mkdir(parents=True, exist_ok=True)

    consent = {
        "actor_id": args.actor,
        "pack": args.title,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "ownership": "artist_owned",
        "render_policy": "consent_required",
        "default_split": {"artist": 75, "platform": 25},
    }
    with (pack_root / "CONSENT_CERT" / "consent_manifest.json").open("w", encoding="utf-8") as f:
        json.dump(consent, f, indent=2)

    metadata = {
        "title": args.title,
        "actor_id": args.actor,
        "delivery_spec": "48kHz/24-bit",
        "personas": ["HERO", "VILLAIN", "NARRATOR"],
    }
    with (pack_root / "pack_metadata.json").open("w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[deploy] created pack: {pack_root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
