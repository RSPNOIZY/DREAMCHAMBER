// NOIZY Voice Pipeline — Recording Stop Trigger v2
// ═══════════════════════════════════════════════════════════════
// INSTALL:
//   1. Open Audio Hijack → "NOIZY Voice Capture" session
//   2. Go to Scripting tab
//   3. Paste this ENTIRE file into "Recording Stop" script slot
//   OR: Save as .ahcommand and attach to session
//
// WHAT IT DOES:
//   When recording stops → fires file path to DreamChamber v2 pipeline
//   DreamChamber v2: Whisper → Claude tower auto-detect → WebSocket push
//   Jamie (Premium) announces the response
//   macOS notification shows Claude's reply
// #needsFile
// ═══════════════════════════════════════════════════════════════

// ── CONFIG ──────────────────────────────────────────────────────
const PIPELINE_URL  = 'http://localhost:8080/api/voice/v2/pipeline';
const VOICE_BRIDGE  = 'http://localhost:8080';
const LOG_FILE      = '/Users/m2ultra/NOIZYLAB/logs/voice-pipeline/audiohijack.log';
const JAMIE_VOICE   = 'Jamie (Premium)';
const JAMIE_RATE    = '165';
// ────────────────────────────────────────────────────────────────

let filePath = event.file.filePath;
let ts       = new Date().toISOString();

// ── Log ──────────────────────────────────────────────────────────
app.runShellCommand('mkdir -p /Users/m2ultra/NOIZYLAB/logs/voice-pipeline');
app.runShellCommand('echo "[' + ts + '] Recording complete: ' + filePath + '" >> ' + app.shellEscapeArgument(LOG_FILE));

// ── Announce start ───────────────────────────────────────────────
app.runShellCommand('say -v "' + JAMIE_VOICE + '" -r ' + JAMIE_RATE + ' "Processing."');

// ── Method 1: DreamChamber v2 voice pipeline (preferred) ─────────
// POSTs file path → Whisper → Claude → WebSocket push → Jamie speaks
let jsonPayload  = '{"path":"' + filePath + '"}';
let curlPipeline = 'curl -s -X POST "' + PIPELINE_URL + '"'
                 + ' -H "Content-Type: application/json"'
                 + ' -d \'' + jsonPayload + '\''
                 + ' >> "' + LOG_FILE + '" 2>&1 &';
app.runShellCommand(curlPipeline);

// ── Method 2: Voice bridge direct (fallback) ─────────────────────
// Uncomment if Method 1 is not responding:
// let curlBridge = 'curl -s -X POST "' + VOICE_BRIDGE + '/api/voice/v2/audiohijack"'
//                + ' -H "Content-Type: application/json"'
//                + ' -d \'' + jsonPayload + '\''
//                + ' >> "' + LOG_FILE + '" 2>&1 &';
// app.runShellCommand(curlBridge);

// ── macOS notification ───────────────────────────────────────────
let filename = filePath.split('/').pop();
app.runShellCommand(
  'osascript -e \'display notification "'
  + filename
  + '" with title "NOIZY Pipeline" subtitle "Whisper → Claude → Jamie"\''
);
