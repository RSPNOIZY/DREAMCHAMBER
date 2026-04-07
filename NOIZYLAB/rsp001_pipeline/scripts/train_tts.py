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

from lib.tts_pipeline import create_render_job


def main() -> int:
    parser = argparse.ArgumentParser(description="Create TTS training/render job manifest.")
    parser.add_argument("--actor", required=True)
    parser.add_argument("--provider", default="xtts_v2")
    parser.add_argument("--language", default="en")
    parser.add_argument("--emotion", default="neutral")
    parser.add_argument("--persona", default="hero")
    parser.add_argument("--text", default="RSP_001 voice test line.")
    parser.add_argument("--config", default="config/paths.yml")
    args = parser.parse_args()

    cfg_path = ROOT / args.config
    import yaml

    with cfg_path.open("r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    job = create_render_job(
        actor_id=args.actor,
        text=args.text,
        language=args.language,
        emotion=args.emotion,
        persona=args.persona,
        provider=args.provider,
    )
    job["created_at_utc"] = datetime.now(timezone.utc).isoformat()
    job_dir = ROOT / cfg["paths"]["manifests"] / args.actor
    job_dir.mkdir(parents=True, exist_ok=True)
    job_path = job_dir / f"train_{args.provider}_{args.language}_{args.persona}.json"
    with job_path.open("w", encoding="utf-8") as f:
        json.dump(job, f, indent=2)
    print(f"[train] wrote job manifest: {job_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
