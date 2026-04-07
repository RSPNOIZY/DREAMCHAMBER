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

from lib.haptic_beat import build_deceleration_flow, flow_to_dict
from lib.panic_mode import (
    assess_panic,
    load_baseline_profile,
    load_biometric_snapshot,
)


def _load_history(path: Path | None) -> list[dict]:
    if path is None:
        return []
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, list):
        return payload
    return payload.get("episodes", [])


def main() -> int:
    parser = argparse.ArgumentParser(description="Build NOIZYVOX predictive haptic panic flow.")
    parser.add_argument("--snapshot-json", required=True)
    parser.add_argument("--baseline-json", required=True)
    parser.add_argument("--history-json", help="Optional prior episode history JSON")
    parser.add_argument("--duration-seconds", type=int, default=240)
    parser.add_argument("--step-seconds", type=int, default=30)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    snapshot = load_biometric_snapshot(Path(args.snapshot_json))
    baseline = load_baseline_profile(Path(args.baseline_json))
    history = _load_history(Path(args.history_json)) if args.history_json else []

    assessment = assess_panic(snapshot, baseline)
    flow = build_deceleration_flow(
        current_hr_bpm=snapshot.heart_rate_bpm,
        resting_hr_bpm=baseline.resting_hr_bpm,
        severity=assessment.severity,
        duration_s=args.duration_seconds,
        step_s=args.step_seconds,
        history=history,
    )

    output = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "severity": assessment.severity,
        "score": assessment.score,
        "reasons": assessment.reasons,
        "input": {
            "current_hr_bpm": snapshot.heart_rate_bpm,
            "current_hrv_rmssd": snapshot.hrv_rmssd,
            "current_systolic_bp": snapshot.systolic_bp,
            "baseline_hr_bpm": baseline.resting_hr_bpm,
            "baseline_hrv_rmssd": baseline.resting_hrv_rmssd,
            "history_episodes": len(history),
        },
        "flow": flow_to_dict(flow),
        "safety_note": (
            "Haptic deceleration flow is supportive guidance only and not a medical device output. "
            "Escalate to emergency care for persistent severe symptoms."
        ),
    }

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"[haptic-flow] wrote: {out}")
    print(json.dumps(output, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
