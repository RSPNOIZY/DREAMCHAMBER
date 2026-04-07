from __future__ import annotations

from pathlib import Path

from lib.audio_pipeline import load_config


def test_load_config() -> None:
    root = Path(__file__).resolve().parents[1]
    cfg = load_config(root / "config/paths.yml")
    assert "paths" in cfg
    assert "processed_audio" in cfg["paths"]
