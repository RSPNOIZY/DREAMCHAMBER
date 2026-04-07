#!/bin/bash
# ============================================================================
# NOIZY Voice Pipeline — Script 1: Whisper Transcription
# ============================================================================
# Takes an audio file, transcribes it with OpenAI Whisper (local on M2 Ultra)
# Outputs: .txt transcript file alongside the original audio
#
# Usage: ./whisper-transcribe.sh /path/to/recording.wav
# Output: /path/to/recording.txt (transcript)
#
# Requires: pip install openai-whisper (Python, already installed on GOD.local)
# ============================================================================

set -euo pipefail

# --- Configuration ---
WHISPER_MODEL="base"          # Options: tiny, base, small, medium, large-v3
WHISPER_LANGUAGE="en"         # Force English for speed (remove for auto-detect)
LOG_DIR="${HOME}/NOIZYLAB/logs/voice-pipeline"
TRANSCRIPT_DIR="${HOME}/NOIZYLAB/voice-pipeline/transcripts"

# --- Input validation ---
if [ -z "${1:-}" ]; then
    echo "ERROR: No audio file provided"
    echo "Usage: $0 /path/to/recording.wav"
    exit 1
fi

AUDIO_FILE="$1"

if [ ! -f "$AUDIO_FILE" ]; then
    echo "ERROR: File not found: $AUDIO_FILE"
    exit 1
fi

# --- Ensure directories exist ---
mkdir -p "$LOG_DIR"
mkdir -p "$TRANSCRIPT_DIR"

# --- Derive output paths ---
BASENAME=$(basename "$AUDIO_FILE" | sed 's/\.[^.]*$//')
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TRANSCRIPT_FILE="${TRANSCRIPT_DIR}/${BASENAME}_${TIMESTAMP}.txt"
LOG_FILE="${LOG_DIR}/whisper_${TIMESTAMP}.log"

# --- Log start ---
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | WHISPER START | ${AUDIO_FILE}" >> "$LOG_FILE"
echo "Model: ${WHISPER_MODEL} | Language: ${WHISPER_LANGUAGE}" >> "$LOG_FILE"

# --- Run Whisper ---
echo "Transcribing: ${AUDIO_FILE}"
echo "Model: ${WHISPER_MODEL}"

WHISPER_START=$(date +%s)

whisper "$AUDIO_FILE" \
    --model "$WHISPER_MODEL" \
    --language "$WHISPER_LANGUAGE" \
    --output_format txt \
    --output_dir "$TRANSCRIPT_DIR" \
    2>> "$LOG_FILE"

WHISPER_END=$(date +%s)
WHISPER_DURATION=$((WHISPER_END - WHISPER_START))

# --- Whisper outputs as <basename>.txt in output_dir, rename with timestamp ---
WHISPER_OUTPUT="${TRANSCRIPT_DIR}/${BASENAME}.txt"
if [ -f "$WHISPER_OUTPUT" ]; then
    mv "$WHISPER_OUTPUT" "$TRANSCRIPT_FILE"
fi

# --- Verify output ---
if [ -f "$TRANSCRIPT_FILE" ]; then
    CHAR_COUNT=$(wc -c < "$TRANSCRIPT_FILE")
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | WHISPER DONE | ${WHISPER_DURATION}s | ${CHAR_COUNT} chars | ${TRANSCRIPT_FILE}" >> "$LOG_FILE"
    echo "Transcript saved: ${TRANSCRIPT_FILE} (${WHISPER_DURATION}s, ${CHAR_COUNT} chars)"

    # Output the transcript path for the next script in the pipeline
    echo "$TRANSCRIPT_FILE"
    exit 0
else
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | WHISPER FAIL | No output generated" >> "$LOG_FILE"
    echo "ERROR: Whisper produced no output"
    exit 1
fi
