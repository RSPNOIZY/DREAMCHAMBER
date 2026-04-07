#!/usr/bin/env python3
"""Moonshine ASR Server for DreamChamber"""
import logging
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import whisper
import tempfile
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Moonshine ASR", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:*", "http://127.0.0.1:*"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
ALLOWED_CONTENT_TYPES = {
    "audio/wav", "audio/wave", "audio/x-wav",
    "audio/mpeg", "audio/mp3", "audio/mp4",
    "audio/ogg", "audio/flac", "audio/webm",
    "application/octet-stream",  # fallback for unknown types
}

logger.info("Loading Whisper model...")
model = whisper.load_model("base")
logger.info("Whisper model loaded.")


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    # Validate content type
    if audio.content_type and audio.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported audio type: {audio.content_type}",
        )

    # Read with size limit
    content = await audio.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(content)} bytes). Max: {MAX_FILE_SIZE} bytes",
        )

    if not content:
        raise HTTPException(status_code=400, detail="Empty audio file")

    tmp_path = None
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        # Transcribe with Whisper
        result = model.transcribe(tmp_path)
        text = result.get("text", "").strip()
        language = result.get("language", "unknown")

        return JSONResponse({
            "text": text,
            "language": language,
        })
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Transcription failed")
        raise HTTPException(status_code=500, detail=f"Transcription error: {exc}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                logger.warning("Failed to clean up temp file: %s", tmp_path)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8765)
