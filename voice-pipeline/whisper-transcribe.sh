#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Script 1 — whisper-transcribe.sh
#  NOIZY Voice Pipeline: Transcribe WAV → Text using Whisper
#  Usage: bash whisper-transcribe.sh /path/to/recording.wav
# ═══════════════════════════════════════════════════════════════

set -e

INPUT_FILE="$1"
TRANSCRIPT_DIR="$HOME/NOIZYLAB/voice-pipeline/transcripts"
LOG_DIR="$HOME/NOIZYLAB/logs/voice-pipeline"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$TRANSCRIPT_DIR" "$LOG_DIR"

if [ -z "$INPUT_FILE" ]; then
  echo "Usage: $0 /path/to/audio.wav" >&2; exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
  echo "ERROR: File not found: $INPUT_FILE" >&2; exit 1
fi

BASENAME=$(basename "$INPUT_FILE" | sed 's/\.[^.]*$//')
TRANSCRIPT_FILE="$TRANSCRIPT_DIR/${TIMESTAMP}_${BASENAME}.txt"

echo "[$TIMESTAMP] Transcribing: $INPUT_FILE" | tee -a "$LOG_DIR/whisper.log"

# ── WHISPER — try installed locations ──────────────────────────
WHISPER_BIN=""

# 1. whisper.cpp compiled binary
if [ -f "$HOME/whisper.cpp/main" ]; then
  WHISPER_BIN="$HOME/whisper.cpp/main"
  WHISPER_MODEL="$HOME/whisper.cpp/models/ggml-base.en.bin"
  "$WHISPER_BIN" -m "$WHISPER_MODEL" -f "$INPUT_FILE" \
    --output-txt --output-file "$TRANSCRIPT_DIR/${TIMESTAMP}_${BASENAME}" \
    2>>"$LOG_DIR/whisper.log"
  # whisper.cpp adds .txt automatically
  TRANSCRIPT_FILE="$TRANSCRIPT_DIR/${TIMESTAMP}_${BASENAME}.txt"

# 2. openai-whisper Python CLI
elif command -v whisper &>/dev/null; then
  whisper "$INPUT_FILE" \
    --model base.en \
    --output_format txt \
    --output_dir "$TRANSCRIPT_DIR" \
    2>>"$LOG_DIR/whisper.log"
  # Whisper CLI saves as same filename .txt
  TRANSCRIPT_FILE="$TRANSCRIPT_DIR/${BASENAME}.txt"

# 3. mlx-whisper (Apple Silicon optimized)
elif command -v mlx_whisper &>/dev/null; then
  mlx_whisper "$INPUT_FILE" \
    --model mlx-community/whisper-base.en-mlx \
    --output-dir "$TRANSCRIPT_DIR" \
    2>>"$LOG_DIR/whisper.log"
  TRANSCRIPT_FILE="$TRANSCRIPT_DIR/${BASENAME}.txt"

else
  echo "ERROR: No Whisper installation found." | tee -a "$LOG_DIR/whisper.log"
  echo "Install with: pip install openai-whisper" | tee -a "$LOG_DIR/whisper.log"
  exit 1
fi

# Verify output
if [ ! -f "$TRANSCRIPT_FILE" ]; then
  echo "ERROR: Transcript not created at $TRANSCRIPT_FILE" >&2; exit 1
fi

echo "[$TIMESTAMP] Transcript saved: $TRANSCRIPT_FILE" | tee -a "$LOG_DIR/whisper.log"
cat "$TRANSCRIPT_FILE"
echo "$TRANSCRIPT_FILE"   # last line = path for pipeline chaining
