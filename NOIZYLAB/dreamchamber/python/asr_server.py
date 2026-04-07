#!/usr/bin/env python3
"""
DreamChamber ASR Server — Moonshine v2 / Whisper HTTP bridge
Listens on port 8099. Accepts raw PCM audio, returns transcript JSON.

Usage:
    python asr_server.py [--backend moonshine|whisper] [--port 8099]

Endpoints:
    POST /transcribe   { audio_b64: str, sample_rate: int } → { text: str, confidence: float }
    GET  /health       → { status: "ok", backend: str, model: str }
    POST /transcribe/file  multipart/form-data, field "audio" (wav/raw) → { text: str }
"""

import argparse
import base64
import io
import logging
import os
import sys
import tempfile
import time
from typing import Optional

import numpy as np
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="[ASR] %(levelname)s %(message)s")
log = logging.getLogger("asr")

# ── Args ─────────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument("--backend", choices=["moonshine", "whisper"], default="moonshine")
parser.add_argument("--port", type=int, default=8099)
parser.add_argument("--model", type=str, default=None,
                    help="Model size: tiny/base/small (whisper) or moonshine-v2 (moonshine)")
args, _ = parser.parse_known_args()

# ── FastAPI ───────────────────────────────────────────────────────────────────
app = FastAPI(title="DreamChamber ASR", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Model loading ─────────────────────────────────────────────────────────────
_model = None
_backend = args.backend
_model_name = args.model


def load_model():
    global _model, _model_name
    if _backend == "moonshine":
        try:
            import moonshine
            _model_name = _model_name or "moonshine/base"
            log.info(f"Loading Moonshine: {_model_name}")
            _model = moonshine.load_model(_model_name)
            log.info("Moonshine loaded ✓")
        except ImportError:
            log.warning("moonshine not installed — falling back to whisper")
            load_whisper_fallback()
    elif _backend == "whisper":
        load_whisper_fallback()


def load_whisper_fallback():
    global _model, _model_name, _backend
    try:
        import whisper
        _model_name = _model_name or "base"
        log.info(f"Loading Whisper: {_model_name}")
        _model = whisper.load_model(_model_name)
        _backend = "whisper"
        log.info("Whisper loaded ✓")
    except ImportError:
        log.error("Neither moonshine nor whisper is installed. Install via: pip install moonshine-onnx openai-whisper")
        sys.exit(1)


# ── Request/Response models ───────────────────────────────────────────────────
class TranscribeRequest(BaseModel):
    audio_b64: str          # base64-encoded raw PCM int16 LE
    sample_rate: int = 16000


class TranscribeResponse(BaseModel):
    text: str
    confidence: float = 1.0
    duration_ms: float = 0.0
    backend: str = ""


# ── Transcription helpers ─────────────────────────────────────────────────────
def transcribe_pcm(pcm_bytes: bytes, sample_rate: int = 16000) -> TranscribeResponse:
    """Transcribe raw int16 PCM bytes → text."""
    t0 = time.monotonic()
    samples = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0

    if _backend == "moonshine":
        text = _transcribe_moonshine(samples, sample_rate)
    else:
        text = _transcribe_whisper(samples, sample_rate)

    elapsed = (time.monotonic() - t0) * 1000
    return TranscribeResponse(text=text.strip(), duration_ms=round(elapsed, 1), backend=_backend)


def _transcribe_moonshine(samples: np.ndarray, sample_rate: int) -> str:
    import moonshine
    # Moonshine expects float32 mono @ 16kHz
    if sample_rate != 16000:
        samples = _resample(samples, sample_rate, 16000)
    return moonshine.transcribe(_model, samples)


def _transcribe_whisper(samples: np.ndarray, sample_rate: int) -> str:
    import whisper
    if sample_rate != 16000:
        samples = _resample(samples, sample_rate, 16000)
    result = _model.transcribe(samples, fp16=False)
    return result.get("text", "")


def _resample(samples: np.ndarray, from_rate: int, to_rate: int) -> np.ndarray:
    """Simple linear resampling — accurate enough for speech."""
    ratio = to_rate / from_rate
    new_len = int(len(samples) * ratio)
    indices = np.linspace(0, len(samples) - 1, new_len)
    return np.interp(indices, np.arange(len(samples)), samples).astype(np.float32)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "backend": _backend, "model": _model_name, "ready": _model is not None}


@app.post("/transcribe", response_model=TranscribeResponse)
def transcribe(req: TranscribeRequest):
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    try:
        pcm = base64.b64decode(req.audio_b64)
        return transcribe_pcm(pcm, req.sample_rate)
    except Exception as e:
        log.exception("Transcription error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/transcribe/file", response_model=TranscribeResponse)
async def transcribe_file(audio: UploadFile = File(...)):
    """Accept a WAV or raw PCM file upload (used for file-based handoff)."""
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    try:
        data = await audio.read()
        # Strip WAV header if present
        if data[:4] == b"RIFF":
            import wave
            with io.BytesIO(data) as buf:
                with wave.open(buf) as wf:
                    sample_rate = wf.getframerate()
                    pcm = wf.readframes(wf.getnframes())
        else:
            pcm = data
            sample_rate = 16000
        return transcribe_pcm(pcm, sample_rate)
    except Exception as e:
        log.exception("File transcription error")
        raise HTTPException(status_code=500, detail=str(e))


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    load_model()


if __name__ == "__main__":
    log.info(f"DreamChamber ASR Server starting on port {args.port} — backend: {_backend}")
    uvicorn.run("asr_server:app", host="127.0.0.1", port=args.port, reload=False)
