#!/usr/bin/env python3
"""
DreamChamber TTS Server — Kokoro-82M / Dia-1.6B HTTP bridge
Listens on port 8098. Accepts text, returns audio or plays directly.

Usage:
    python tts_server.py [--backend kokoro|dia|system] [--port 8098]

Endpoints:
    POST /speak        { text: str, voice?: str, play?: bool } → { status: "ok" } or audio/wav
    POST /speak/stream { text: str, voice?: str }             → audio/wav stream
    GET  /voices       → { voices: [str] }
    GET  /health       → { status: "ok", backend: str }
    POST /stop         → { status: "ok" }
"""

import argparse
import io
import logging
import os
import subprocess
import sys
import threading
import time
from typing import Optional

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="[TTS] %(levelname)s %(message)s")
log = logging.getLogger("tts")

# ── Args ─────────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument("--backend", choices=["kokoro", "dia", "system"], default="kokoro")
parser.add_argument("--port", type=int, default=8098)
parser.add_argument("--voice", type=str, default=None)
args, _ = parser.parse_known_args()

# ── FastAPI ───────────────────────────────────────────────────────────────────
app = FastAPI(title="DreamChamber TTS", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── State ─────────────────────────────────────────────────────────────────────
_backend = args.backend
_model = None
_default_voice = args.voice
_stop_flag = threading.Event()
_current_proc: Optional[subprocess.Popen] = None


def load_model():
    global _model, _backend
    if _backend == "kokoro":
        try:
            from kokoro import KPipeline
            log.info("Loading Kokoro-82M...")
            _model = KPipeline(lang_code="a")   # 'a' = American English
            _default_voice_resolved = _default_voice or "af_heart"
            log.info(f"Kokoro loaded ✓  default voice: {_default_voice_resolved}")
        except ImportError:
            log.warning("kokoro not installed — trying Dia")
            load_dia_fallback()
    elif _backend == "dia":
        load_dia_fallback()
    elif _backend == "system":
        log.info("Using system TTS (macOS 'say')")


def load_dia_fallback():
    global _model, _backend
    try:
        import torch
        from dia.model import Dia
        log.info("Loading Dia-1.6B (this may take a moment)...")
        _model = Dia.from_pretrained("nari-labs/Dia-1.6B")
        _backend = "dia"
        log.info("Dia-1.6B loaded ✓")
    except ImportError:
        log.warning("Dia not installed — using system TTS")
        _backend = "system"


# ── Models ────────────────────────────────────────────────────────────────────
class SpeakRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    play: bool = True           # if True, play via sounddevice; if False, return bytes


# ── TTS backends ─────────────────────────────────────────────────────────────
def synth_kokoro(text: str, voice: str) -> bytes:
    """Kokoro-82M synthesis → WAV bytes."""
    import soundfile as sf
    import numpy as np
    samples_gen = _model(text, voice=voice, speed=1.0)
    audio_chunks = []
    for _, _, audio in samples_gen:
        audio_chunks.append(audio)
    if not audio_chunks:
        return b""
    samples = np.concatenate(audio_chunks)
    buf = io.BytesIO()
    sf.write(buf, samples, 24000, format="WAV", subtype="PCM_16")
    return buf.getvalue()


def synth_dia(text: str) -> bytes:
    """Dia-1.6B synthesis — uses [S1] speaker tag."""
    import soundfile as sf
    import numpy as np
    prompt = f"[S1] {text}"
    output = _model.generate(prompt)
    buf = io.BytesIO()
    sf.write(buf, output, _model.config.data.sampling_rate, format="WAV", subtype="PCM_16")
    return buf.getvalue()


def play_wav(wav_bytes: bytes) -> None:
    """Play WAV bytes via sounddevice (non-blocking in thread)."""
    import sounddevice as sd
    import soundfile as sf
    with io.BytesIO(wav_bytes) as buf:
        data, sr = sf.read(buf, dtype="float32")
    sd.play(data, sr)
    sd.wait()


def speak_system(text: str) -> None:
    """macOS 'say' fallback — truly zero-dep."""
    global _current_proc
    _stop_flag.clear()
    try:
        _current_proc = subprocess.Popen(["say", text])
        _current_proc.wait()
    except FileNotFoundError:
        log.error("'say' not found — not on macOS?")
    finally:
        _current_proc = None


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "backend": _backend, "ready": _model is not None or _backend == "system"}


@app.get("/voices")
def voices():
    if _backend == "kokoro":
        return {"voices": [
            "af_heart", "af_bella", "af_nova", "af_sky",
            "am_adam", "am_echo", "am_fable",
            "bf_emma", "bm_george",
        ]}
    elif _backend == "dia":
        return {"voices": ["S1", "S2"]}
    else:
        return {"voices": ["system"]}


@app.post("/speak")
def speak(req: SpeakRequest):
    if not req.text.strip():
        return {"status": "ok", "skipped": True}

    _stop_flag.clear()

    if _backend == "system":
        threading.Thread(target=speak_system, args=(req.text,), daemon=True).start()
        return {"status": "ok", "backend": "system"}

    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        voice = req.voice or _default_voice or ("af_heart" if _backend == "kokoro" else "S1")
        if _backend == "kokoro":
            wav = synth_kokoro(req.text, voice)
        else:
            wav = synth_dia(req.text)

        if req.play:
            threading.Thread(target=play_wav, args=(wav,), daemon=True).start()
            return {"status": "ok", "backend": _backend, "bytes": len(wav)}
        else:
            return StreamingResponse(io.BytesIO(wav), media_type="audio/wav")
    except Exception as e:
        log.exception("TTS error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/speak/stream")
def speak_stream(req: SpeakRequest):
    """Stream WAV audio back to caller."""
    if _backend == "system" or _model is None:
        raise HTTPException(status_code=400, detail="Streaming not available for system backend")
    voice = req.voice or _default_voice or "af_heart"
    try:
        wav = synth_kokoro(req.text, voice) if _backend == "kokoro" else synth_dia(req.text)
        return StreamingResponse(io.BytesIO(wav), media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/stop")
def stop():
    """Interrupt current playback."""
    _stop_flag.set()
    try:
        import sounddevice as sd
        sd.stop()
    except Exception:
        pass
    if _current_proc:
        _current_proc.terminate()
    return {"status": "ok"}


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    load_model()


if __name__ == "__main__":
    log.info(f"DreamChamber TTS Server starting on port {args.port} — backend: {_backend}")
    uvicorn.run("tts_server:app", host="127.0.0.1", port=args.port, reload=False)
