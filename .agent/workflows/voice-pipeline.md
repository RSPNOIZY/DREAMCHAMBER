# /voice — Voice Pipeline Operations

AUDIO agent manages the voice-to-Claude pipeline via Audio Hijack + Whisper.

## Steps

1. Check Audio Hijack status:
   - Verify Audio Hijack is running on GOD.local
   - Verify the NOIZYBEAST session exists with Recording Stop automation
   - Verify the script `audiohijack-recording-stop.js` is in Script Library
2. Check Whisper status:
   - `which whisper` — confirm installed
   - `whisper --help` — confirm version
   - Test with sample audio if available
3. Check pipeline scripts:
   - `voice-pipeline/scripts/whisper-transcribe.sh` — exists, executable
   - `voice-pipeline/scripts/audiohijack-recording-stop.js` — exists
   - `voice-pipeline/scripts/voice-pipeline.sh` — exists (orchestrator)
   - `voice-pipeline/scripts/claude-prompt.sh` — exists
4. Check directories:
   - `~/NOIZYLAB/voice-pipeline/transcripts/` — exists
   - `~/NOIZYLAB/logs/voice-pipeline/` — exists
   - Audio Hijack recordings folder — configured
5. Test transcription:
   - If sample audio available: run `whisper-transcribe.sh [sample.wav]`
   - Verify transcript output in transcripts folder
   - Verify log entry in logs folder
6. Report:
   ```
   VOICE PIPELINE STATUS
   Audio Hijack:    [RUNNING/STOPPED]
   Whisper:         [INSTALLED/MISSING]
   Scripts:         [4/4 READY]
   Recordings dir:  [CONFIGURED/MISSING]
   Last transcript: [timestamp or NONE]
   ```
