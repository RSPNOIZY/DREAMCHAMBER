from __future__ import annotations

import subprocess

from ..config import get_settings


def process_with_av_audio_engine(input_path: str, output_path: str, preset: str = "cinematic") -> str:
    settings = get_settings()
    if not settings.av_audio_engine_bin:
        return "AV audio engine not configured; returning dry output"

    cmd = [settings.av_audio_engine_bin, "--in", input_path, "--out", output_path, "--preset", preset]
    if settings.av_audio_engine_config:
        cmd.extend(["--config", settings.av_audio_engine_config])
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        return f"AV audio engine processed -> {output_path}"
    except FileNotFoundError:
        return "AV audio engine binary not found"
    except subprocess.CalledProcessError as exc:
        return f"AV audio engine failed: {exc.stderr.strip() or exc.stdout.strip()}"

