from __future__ import annotations

import subprocess

import httpx

from ..config import get_settings


def synthesize_speech(text: str, voice_id: str, output_path: str) -> tuple[str, str]:
    settings = get_settings()
    provider = settings.tts_provider
    if provider == "piper":
        return provider, _synthesize_with_piper(text, output_path, settings.piper_bin, settings.piper_model_path)
    return provider, _synthesize_with_coqui(text, output_path, voice_id, settings.coqui_server_url)


def _synthesize_with_piper(text: str, output_path: str, piper_bin: str, model_path: str) -> str:
    if not model_path:
        return "piper model path missing"
    cmd = [piper_bin, "--model", model_path, "--output_file", output_path]
    try:
        subprocess.run(cmd, input=text, text=True, check=True, capture_output=True)
        return f"piper synthesis completed -> {output_path}"
    except FileNotFoundError:
        return f"piper binary not found; install and retry for {output_path}"
    except subprocess.CalledProcessError as exc:
        return f"piper failed: {exc.stderr.strip() or exc.stdout.strip()}"


def _synthesize_with_coqui(text: str, output_path: str, voice_id: str, base_url: str) -> str:
    payload = {"text": text, "speaker_id": voice_id, "output_path": output_path}
    url = f"{base_url.rstrip('/')}/api/tts"
    try:
        response = httpx.post(url, json=payload, timeout=30)
        response.raise_for_status()
        return f"coqui synthesis requested -> {output_path}"
    except httpx.HTTPError as exc:
        return f"coqui request failed: {exc}"

