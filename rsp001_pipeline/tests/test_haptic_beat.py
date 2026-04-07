from __future__ import annotations

from lib.haptic_beat import bilateral_haptic_frequencies, build_deceleration_flow


def test_bilateral_haptic_frequencies() -> None:
    left, right = bilateral_haptic_frequencies(beat_diff_hz=8.0, base_freq_hz=120.0)
    assert left == 116.0
    assert right == 124.0


def test_build_deceleration_flow_descends() -> None:
    flow = build_deceleration_flow(
        current_hr_bpm=132.0,
        resting_hr_bpm=68.0,
        severity="acute",
        duration_s=120,
        step_s=30,
        history=None,
    )
    assert len(flow) == 4
    assert flow[0].target_pulse_bpm > flow[-1].target_pulse_bpm
