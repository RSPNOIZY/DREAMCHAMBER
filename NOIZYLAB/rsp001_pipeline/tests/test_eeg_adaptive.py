from __future__ import annotations

import json
from pathlib import Path

from lib.eeg_adaptive import EEGSnapshot, derive_adaptive_mix, load_eeg_snapshot


def test_derive_adaptive_mix_standard() -> None:
    snapshot = EEGSnapshot(delta=0.12, theta=0.32, alpha=0.28, beta=0.10, gamma=0.05)
    cfg = derive_adaptive_mix(snapshot, profile="standard_sleep")
    assert 4.0 <= cfg.beat_hz <= 6.5
    assert cfg.beat_db <= -28.0


def test_no_binaural_profile_disables_beat() -> None:
    snapshot = EEGSnapshot(delta=0.15, theta=0.22, alpha=0.20, beta=0.26, gamma=0.08)
    cfg = derive_adaptive_mix(snapshot, profile="no_binaural")
    assert cfg.beat_hz == 0.0
    assert cfg.beat_db <= -90.0


def test_load_eeg_snapshot_json(tmp_path: Path) -> None:
    payload = {"bands": {"delta": 0.2, "theta": 0.3, "alpha": 0.25, "beta": 0.15, "gamma": 0.1}}
    p = tmp_path / "eeg.json"
    p.write_text(json.dumps(payload), encoding="utf-8")
    s = load_eeg_snapshot(p)
    assert s.theta == 0.3
