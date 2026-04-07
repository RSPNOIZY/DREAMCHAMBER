# Voice Pipeline — Audio Hijack → Whisper → Claude → Response

## Architecture

```
iPhone (Teams voice) → Teams Desktop (GOD.local)
    → Audio Hijack captures Teams audio
    → Records WAV to watched folder
    → Recording Stop triggers pipeline script
    → Whisper (local, M2 Ultra GPU) transcribes to text
    → Claude API processes prompt
    → Response routes back to Teams channel
```

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| whisper-transcribe.sh | voice-pipeline/scripts/ | Standalone Whisper transcription |
| audiohijack-recording-stop.js | voice-pipeline/scripts/ | Audio Hijack Recording Stop hook |
| voice-pipeline.sh | voice-pipeline/scripts/ | Full orchestrator (to build) |
| claude-prompt.sh | voice-pipeline/scripts/ | Claude API prompt script (to build) |
| teams-respond.sh | voice-pipeline/scripts/ | Teams response delivery (to build) |

## Audio Hijack Integration

- Scripts go in: Audio Hijack → Window → Script Library → User Scripts
- Wire to: Session → Scripting tab → New Automation → Recording Stop
- `// #needsFile` comment marks it as Recording Stop script
- `event.file.filePath` provides the recorded file path
- `app.runShellCommand()` executes shell scripts
- `app.shellEscapeArgument()` for safe path escaping

## Whisper Config

- Model: base (upgrade to medium/large-v3 for accuracy)
- Language: en (forced for speed)
- Transcripts: ~/NOIZYLAB/voice-pipeline/transcripts/
- Logs: ~/NOIZYLAB/logs/voice-pipeline/

## Rules

- Voice data stays on GOD.local — never sent to external transcription
- All voice processing logged to DAZEFLOW
- Voice DNA protection: NC-9 (never expose via public endpoints)
- C2PA credentials on any synthesized voice output
