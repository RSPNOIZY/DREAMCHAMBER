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

from lib.asmr_sleep_pipeline import build_sleepy_story_mix, write_sleep_mix_manifest
from lib.eeg_adaptive import adaptive_config_to_dict, derive_adaptive_mix, load_eeg_snapshot


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a NOIZYVOX ASMR sleepy-time story mix.")
    parser.add_argument("--narration", required=True, help="Input narration WAV path")
    parser.add_argument("--output", required=True, help="Output mixed WAV path")
    parser.add_argument("--sample-rate", type=int, default=48000)
    parser.add_argument("--beat-hz", type=float, default=6.0, help="Binaural beat offset frequency in Hz")
    parser.add_argument("--carrier-hz", type=float, default=180.0, help="Binaural carrier center frequency in Hz")
    parser.add_argument("--voice-db", type=float, default=-14.0, help="Narration gain in dBFS")
    parser.add_argument("--beat-db", type=float, default=-30.0, help="Binaural bed gain in dBFS")
    parser.add_argument("--ambient-db", type=float, default=-38.0, help="Ambient bed gain in dBFS")
    parser.add_argument("--tail-seconds", type=float, default=20.0, help="Ambient tail after narration ends")
    parser.add_argument(
        "--profile",
        default="standard_sleep",
        choices=["standard_sleep", "high_sensitivity", "neurodiversity_support", "no_binaural"],
        help="Safety/adaptation profile",
    )
    parser.add_argument("--eeg-json", help="Optional EEG snapshot JSON for adaptive tuning")
    args = parser.parse_args()

    adaptive_meta = None
    if args.eeg_json:
        snapshot = load_eeg_snapshot(Path(args.eeg_json))
        adaptive = derive_adaptive_mix(snapshot, profile=args.profile)
        args.beat_hz = adaptive.beat_hz
        args.carrier_hz = adaptive.carrier_hz
        args.voice_db = adaptive.voice_db
        args.beat_db = adaptive.beat_db
        args.ambient_db = adaptive.ambient_db
        adaptive_meta = adaptive_config_to_dict(adaptive)

    result = build_sleepy_story_mix(
        narration_wav=Path(args.narration),
        output_wav=Path(args.output),
        sample_rate=args.sample_rate,
        beat_hz=args.beat_hz,
        carrier_hz=args.carrier_hz,
        voice_db=args.voice_db,
        beat_db=args.beat_db,
        ambient_db=args.ambient_db,
        tail_seconds=args.tail_seconds,
    )

    manifest = {
        "pipeline": "asmr_sleepy_story_v1",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "input_narration": str(Path(args.narration).resolve()),
        "output_wav": str(result.output_wav.resolve()),
        "sample_rate": result.sample_rate,
        "duration_seconds": round(result.duration_seconds, 3),
        "binaural": {"beat_hz": result.beat_hz, "carrier_hz": result.carrier_hz},
        "mix_levels_db": {
            "voice_db": result.voice_db,
            "beat_db": result.beat_db,
            "ambient_db": result.ambient_db,
        },
        "profile": args.profile,
        "adaptive_tuning": adaptive_meta,
        "safety_note": (
            "Sleep-support audio only. Not a medical treatment. "
            "Use conservative volume and stop if listener discomfort appears."
        ),
    }
    report_path = Path(args.output).with_suffix(".sleepmix.json")
    write_sleep_mix_manifest(report_path, manifest)

    print(f"[sleepy-story] wrote mix: {result.output_wav}")
    print(f"[sleepy-story] wrote manifest: {report_path}")
    print(json.dumps(manifest, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
