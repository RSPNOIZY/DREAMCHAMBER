#!/usr/bin/env python3
"""Kokoro TTS Server for DreamChamber"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import uvicorn
import subprocess
import io
import re

app = FastAPI(title="Kokoro TTS", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:*", "http://127.0.0.1:*"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# Allowlist of safe macOS voices — prevents command injection
ALLOWED_VOICES = {
    "Samantha", "Alex", "Daniel", "Karen", "Moira", "Rishi", "Tessa",
    "Fiona", "Victoria", "Fred", "Whisper",
}

MAX_TEXT_LENGTH = 2000
SUBPROCESS_TIMEOUT = 30  # seconds


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)
    voice: str = "Samantha"


@app.post("/synthesize")
async def synthesize(request: TTSRequest):
    # Validate voice against allowlist — prevent shell injection
    if request.voice not in ALLOWED_VOICES:
        raise HTTPException(
            status_code=400,
            detail=f"Voice '{request.voice}' not allowed. Choose from: {sorted(ALLOWED_VOICES)}",
        )

    # Sanitize text: strip control characters
    clean_text = re.sub(r"[\x00-\x1f\x7f]", "", request.text)
    if not clean_text.strip():
        raise HTTPException(status_code=400, detail="Text is empty after sanitization")

    try:
        process = subprocess.Popen(
            ["say", "-v", request.voice, clean_text, "-o", "-"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        audio_data, stderr = process.communicate(timeout=SUBPROCESS_TIMEOUT)

        if process.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"TTS failed: {stderr.decode(errors='replace').strip()}",
            )

        if not audio_data:
            raise HTTPException(status_code=500, detail="TTS produced no audio")

        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/aiff",
        )
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()
        raise HTTPException(status_code=504, detail="TTS timed out")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8880)
