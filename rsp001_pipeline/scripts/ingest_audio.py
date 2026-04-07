#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from lib.audio_pipeline import analyze_features, build_derivatives, ensure_dirs, load_config, write_manifest


def main() -> int:
    parser = argparse.ArgumentParser(description="Ingest and prepare RSP_001 source audio.")
    parser.add_argument("--source", required=True, help="Path to source audio file")
    parser.add_argument("--actor", required=True, help="Actor ID (e.g. rsp001)")
    parser.add_argument("--session", required=True, help="Session key (e.g. capture01)")
    parser.add_argument("--config", default="config/paths.yml", help="Path to paths config YAML")
    args = parser.parse_args()

    cfg = load_config(ROOT / args.config)
    ensure_dirs(ROOT, cfg)
    ffmpeg_bin = cfg.get("ffmpeg_bin", "ffmpeg")
    processed_root = ROOT / cfg["paths"]["processed_audio"] / args.actor / args.session
    analysis = processed_root / f"{Path(args.source).stem}-analysis.wav"
    archival = processed_root / f"{Path(args.source).stem}-archival.wav"
    immersive = processed_root / f"{Path(args.source).stem}-immersive.wav"

    derivatives = build_derivatives(
        source=Path(args.source),
        analysis=analysis,
        archival=archival,
        immersive=immersive,
        ffmpeg_bin=ffmpeg_bin,
    )
    features = analyze_features(derivatives.analysis_path)

    manifest = {
        "actor": args.actor,
        "session": args.session,
        "source": str(Path(args.source)),
        "analysis": str(derivatives.analysis_path),
        "archival": str(derivatives.archival_path),
        "immersive": str(derivatives.immersive_path),
        "features": features,
    }
    manifest_path = ROOT / cfg["paths"]["manifests"] / args.actor / f"{args.session}.json"
    write_manifest(manifest_path, manifest)
    print(f"[ingest] wrote manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
