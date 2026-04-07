from __future__ import annotations

from lib.panic_mode import BaselineProfile, BiometricSnapshot, assess_panic, build_panic_intervention


def test_assess_panic_acute() -> None:
    baseline = BaselineProfile(resting_hr_bpm=68, resting_hrv_rmssd=45.0, resting_systolic_bp=118.0)
    snapshot = BiometricSnapshot(heart_rate_bpm=122, hrv_rmssd=18.0, systolic_bp=146.0, diastolic_bp=92.0)
    a = assess_panic(snapshot, baseline)
    assert a.severity == "acute"
    assert a.score >= 5.0


def test_build_intervention_moderate_haptics() -> None:
    baseline = BaselineProfile(resting_hr_bpm=70, resting_hrv_rmssd=42.0, resting_systolic_bp=120.0)
    snapshot = BiometricSnapshot(heart_rate_bpm=92, hrv_rmssd=26.0, systolic_bp=129.0, diastolic_bp=84.0)
    a = assess_panic(snapshot, baseline)
    plan = build_panic_intervention(a, haptics_enabled=True, no_binaural=False)
    assert plan.protocol in {"box_4_4_4_4", "breathing_4_7_8", "physiological_sigh"}
    assert plan.haptic is not None
