from __future__ import annotations

import subprocess

from ..config import get_settings


def transcribe_audio(input_path: str) -> tuple[str, str]:
    settings = get_settings()
    provider = settings.stt_provider
    if provider == "whisper":
        return provider, _transcribe_with_whisper(input_path, settings.whisper_model, settings.whisper_bin)
    return provider, _transcribe_with_deepspeech(input_path, settings.deepspeech_bin, settings.deepspeech_model_path)


def _transcribe_with_whisper(input_path: str, model: str, whisper_bin: str) -> str:
    cmd = [whisper_bin, input_path, "--model", model, "--output_format", "txt", "--fp16", "False"]
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        return f"whisper transcription completed for {input_path}"
    except FileNotFoundError:
        return f"whisper binary not found; install and retry for {input_path}"
    except subprocess.CalledProcessError as exc:
        return f"whisper failed: {exc.stderr.strip() or exc.stdout.strip()}"


def _transcribe_with_deepspeech(input_path: str, deepspeech_bin: str, model_path: str) -> str:
    if not model_path:
        return "deepspeech model path missing"
    cmd = [deepspeech_bin, "--model", model_path, "--audio", input_path]
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        return result.stdout.strip() or f"deepspeech transcription completed for {input_path}"
    except FileNotFoundError:
        return f"deepspeech binary not found; install and retry for {input_path}"
    except subprocess.CalledProcessError as exc:
        return f"deepspeech failed: {exc.stderr.strip() or exc.stdout.strip()}"

