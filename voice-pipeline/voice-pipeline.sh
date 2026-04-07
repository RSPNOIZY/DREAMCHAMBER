#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Script 3 — voice-pipeline.sh  (THE ORCHESTRATOR)
#  NOIZY Voice Pipeline: Whisper → Claude → Teams
#  Usage: bash voice-pipeline.sh /path/to/recording.wav [tower]
# ═══════════════════════════════════════════════════════════════

PIPELINE_DIR="$HOME/NOIZYLAB/voice-pipeline"
LOG_DIR="$HOME/NOIZYLAB/logs/voice-pipeline"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
AUDIO_FILE="$1"
TOWER="${2:-max}"

mkdir -p "$LOG_DIR"

log() { echo "[$TIMESTAMP] $1" | tee -a "$LOG_DIR/pipeline.log"; }

log "════════════════════════════════════════"
log "NOIZY Voice Pipeline — START"
log "Audio: $AUDIO_FILE"
log "Tower: Claude $TOWER"
log "════════════════════════════════════════"

# ── Step 1: Transcribe ─────────────────────────────────────────
log "Step 1/3: Whisper transcription…"
WHISPER_OUTPUT=$(bash "$PIPELINE_DIR/whisper-transcribe.sh" "$AUDIO_FILE" 2>>"$LOG_DIR/pipeline.log")
TRANSCRIPT_FILE=$(echo "$WHISPER_OUTPUT" | tail -1)

if [ ! -f "$TRANSCRIPT_FILE" ]; then
  log "ERROR: Transcription failed — no transcript file produced."; exit 1
fi

TRANSCRIPT_TEXT=$(cat "$TRANSCRIPT_FILE")
log "Transcript: $TRANSCRIPT_TEXT"

# Skip empty/noise transcripts
if [ ${#TRANSCRIPT_TEXT} -lt 3 ]; then
  log "Transcript too short — skipping (likely silence/noise)"; exit 0
fi

# ── Step 2: Claude ─────────────────────────────────────────────
log "Step 2/3: Sending to Claude $TOWER…"
CLAUDE_OUTPUT=$(bash "$PIPELINE_DIR/claude-prompt.sh" "$TRANSCRIPT_FILE" "$TOWER" 2>>"$LOG_DIR/pipeline.log")
RESPONSE_FILE=$(echo "$CLAUDE_OUTPUT" | tail -1)
RESPONSE_TEXT=$(cat "$RESPONSE_FILE" 2>/dev/null || echo "$CLAUDE_OUTPUT")

log "Claude response: ${RESPONSE_TEXT:0:100}…"

# ── Step 3: Post to Teams ──────────────────────────────────────
log "Step 3/3: Posting to Teams…"
bash "$PIPELINE_DIR/teams-respond.sh" "$RESPONSE_FILE" "$TOWER" "$TRANSCRIPT_TEXT" \
  2>>"$LOG_DIR/pipeline.log"

# ── macOS notification ─────────────────────────────────────────
osascript -e "display notification \"${RESPONSE_TEXT:0:80}…\" with title \"Claude ${TOWER^} — NOIZY\"" 2>/dev/null || true

log "Pipeline complete ✓"
log "════════════════════════════════════════"
