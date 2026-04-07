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

from lib.panic_mode import (
    BaselineProfile,
    BiometricSnapshot,
    assess_panic,
    build_panic_intervention,
    load_baseline_profile,
    load_biometric_snapshot,
    plan_to_dict,
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run NOIZYVOX Panic Mode intervention planning.")
    parser.add_argument("--snapshot-json", required=True, help="Current biometric snapshot JSON")
    parser.add_argument("--baseline-json", required=True, help="User baseline profile JSON")
    parser.add_argument(
        "--profile",
        default="standard_sleep",
        choices=["standard_sleep", "high_sensitivity", "neurodiversity_support", "no_binaural"],
    )
    parser.add_argument("--haptics-enabled", action="store_true", default=False)
    parser.add_argument("--output", required=True, help="Intervention plan JSON output")
    args = parser.parse_args()

    snapshot: BiometricSnapshot = load_biometric_snapshot(Path(args.snapshot_json))
    baseline: BaselineProfile = load_baseline_profile(Path(args.baseline_json))
    assessment = assess_panic(snapshot, baseline)
    plan = build_panic_intervention(
        assessment,
        haptics_enabled=args.haptics_enabled,
        no_binaural=(args.profile == "no_binaural"),
    )

    output = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "profile": args.profile,
        "snapshot": {
            "heart_rate_bpm": snapshot.heart_rate_bpm,
            "hrv_rmssd": snapshot.hrv_rmssd,
            "systolic_bp": snapshot.systolic_bp,
            "diastolic_bp": snapshot.diastolic_bp,
        },
        "baseline": {
            "resting_hr_bpm": baseline.resting_hr_bpm,
            "resting_hrv_rmssd": baseline.resting_hrv_rmssd,
            "resting_systolic_bp": baseline.resting_systolic_bp,
        },
        "assessment": {"severity": assessment.severity, "score": assessment.score, "reasons": assessment.reasons},
        "plan": plan_to_dict(plan),
        "safety_note": (
            "Supportive panic-calming guidance only; not a replacement for emergency medical care. "
            "Escalate to emergency services when severe symptoms persist or safety is at risk."
        ),
    }

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"[panic-mode] wrote intervention plan: {out_path}")
    print(json.dumps(output, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
