from __future__ import annotations

from pathlib import Path

import numpy as np
import soundfile as sf

from lib.asmr_sleep_pipeline import build_sleepy_story_mix, generate_binaural_beat


def test_generate_binaural_beat_shape() -> None:
    beat = generate_binaural_beat(duration_s=2.0, sample_rate=48_000, carrier_hz=180.0, beat_hz=6.0, gain_db=-30.0)
    assert beat.ndim == 2
    assert beat.shape[1] == 2
    assert beat.shape[0] == 96_000


def test_build_sleepy_story_mix_creates_file(tmp_path: Path) -> None:
    sr = 48_000
    duration_s = 1.0
    t = np.arange(int(sr * duration_s)) / sr
    tone = 0.2 * np.sin(2 * np.pi * 220.0 * t)
    narration = np.column_stack((tone, tone)).astype(np.float32)

    input_wav = tmp_path / "narration.wav"
    output_wav = tmp_path / "story_mix.wav"
    sf.write(str(input_wav), narration, sr)

    result = build_sleepy_story_mix(input_wav, output_wav, tail_seconds=1.0)
    assert output_wav.exists()
    assert result.duration_seconds > 1.5
