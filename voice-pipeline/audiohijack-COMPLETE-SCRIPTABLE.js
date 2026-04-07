// ═══════════════════════════════════════════════════════════════
// NOIZY.AI — Audio Hijack Complete Scriptable Suite
// GORUNFREE | RSP_001 | 2026-03-27
//
// HOW TO USE:
//   Each section below is a separate .ahcommand file.
//   Save as: ~/NOIZYLAB/audiohijack-scripts/<name>.ahcommand
//   Trigger: open ~/NOIZYLAB/audiohijack-scripts/<name>.ahcommand
//   Or: In Audio Hijack Session → Scripting tab → attach to events
//
// ARCHITECTURE:
//   RSP_001 mic (Apollo) → [Input Node] → [Recorder] → Whisper → Claude → Jamie TTS
//   Jamie TTS output     → [Input Node] → [Recorder] → Master mix
//   Each AI agent        → Own Loopback virtual device → Master mix
//
// SESSIONS TO CREATE IN AUDIO HIJACK:
//   1. "NOIZY Voice Capture"   — Rob's mic → whisper → Claude pipeline
//   2. "NOIZY Master Mix"      — All channels → master recorder
//   3. "NOIZY Jamie TTS"       — Say command output → Loopback Gabriel channel
//   4. "NOIZY Agent CB01"      — CB01 say output → Loopback slot
//   5. "NOIZY Agent Lucy"      — Lucy say output → Loopback slot
// ═══════════════════════════════════════════════════════════════

// ── FILE 1: voice-capture-start.ahcommand ─────────────────────
// Trigger: Manual or Siri Shortcut → "Start NOIZY session"
// Action: Start voice capture session + notify
const FILE_1 = `
let session = app.sessionWithName("NOIZY Voice Capture");
if (session) {
  if (!session.running) {
    session.start();
    app.runShellCommand(
      'osascript -e \\'display notification "Voice capture active — speak now" with title "NOIZY DreamChamber" subtitle "RSP_001 MIC LIVE"\\'',
    );
    app.runShellCommand(
      'say -v "Jamie (Premium)" -r 165 "Dream Chamber open. Ready."'
    );
  }
} else {
  app.runShellCommand(
    'osascript -e \\'display notification "Session not found: NOIZY Voice Capture" with title "NOIZY ERROR"\\'',
  );
}
`;

// ── FILE 2: voice-capture-stop.ahcommand ──────────────────────
// Trigger: Manual or Siri Shortcut → "Stop and process"
// Action: Stop recording → auto-fires voice-pipeline.sh via Recording Stop event
const FILE_2 = `
let session = app.sessionWithName("NOIZY Voice Capture");
if (session && session.running) {
  session.stop();
  app.runShellCommand(
    'say -v "Jamie (Premium)" -r 165 "Processing."'
  );
}
`;

// ── FILE 3: Recording Stop event script (attach to session) ───
// Trigger: In Audio Hijack Session → Scripts → Recording Stop
// This IS the audiohijack-recording-stop.js — upgraded version:
// #needsFile
const FILE_3 = `
// NOIZY Voice Pipeline — Recording Stop Trigger
// Attach to: NOIZY Voice Capture session → Scripting → Recording Stop
// #needsFile

const PIPELINE  = '/Users/m2ultra/NOIZYLAB/voice-pipeline/voice-pipeline.sh';
const BRIDGE_URL = 'http://localhost:8080/power-automate-webhook';
const LOG       = '/Users/m2ultra/NOIZYLAB/logs/voice-pipeline/audiohijack.log';
const TOWER     = 'max'; // max | code | work — auto-detected in pipeline

let filePath = event.file.filePath;
let ts = new Date().toISOString();

// Ensure log dir exists
app.runShellCommand('mkdir -p /Users/m2ultra/NOIZYLAB/logs/voice-pipeline');
app.runShellCommand('echo "' + ts + ' | Recording: ' + filePath + '" >> ' + app.shellEscapeArgument(LOG));

// OPTION A: Voice Bridge webhook (fastest — sends to DreamChamber directly)
let curlCmd = 'curl -s -X POST ' + BRIDGE_URL
  + ' -H "Content-Type: application/json"'
  + ' -d \\' {"path": "' + filePath + '", "tower": "' + TOWER + '"}\\'  '
  + ' >> ' + app.shellEscapeArgument(LOG) + ' 2>&1 &';
app.runShellCommand(curlCmd);

// OPTION B: Shell pipeline (fallback if voice bridge offline)
let shellCmd = 'bash ' + app.shellEscapeArgument(PIPELINE)
  + ' ' + app.shellEscapeArgument(filePath)
  + ' ' + TOWER
  + ' >> ' + app.shellEscapeArgument(LOG) + ' 2>&1 &';
// Uncomment to use shell pipeline instead:
// app.runShellCommand(shellCmd);

// Visual feedback
app.runShellCommand(
  'osascript -e \\'display notification "' + filePath.split('/').pop() + '" with title "NOIZY Pipeline" subtitle "Whisper → Claude → Jamie"\\'',
);
`;

// ── FILE 4: master-mix-start.ahcommand ────────────────────────
// Trigger: morning-routine workflow
const FILE_4 = `
let sessions = [
  "NOIZY Voice Capture",
  "NOIZY Master Mix",
  "NOIZY Jamie TTS",
];

let started = [];
for (let name of sessions) {
  let s = app.sessionWithName(name);
  if (s && !s.running) {
    s.start();
    started.push(name);
  }
}

app.runShellCommand(
  'say -v "Jamie (Premium)" -r 165 "All stations active. DreamChamber is live."'
);
app.runShellCommand(
  'osascript -e \\'display notification "' + started.join(", ") + '" with title "NOIZY Master" subtitle "All sessions started"\\'',
);
`;

// ── FILE 5: master-mix-stop.ahcommand ─────────────────────────
const FILE_5 = `
for (let s of app.sessions) {
  if (s.name.startsWith("NOIZY") && s.running) {
    s.stop();
  }
}
app.runShellCommand(
  'say -v "Jamie (Premium)" -r 165 "DreamChamber closed."'
);
`;

// ── FILE 6: agent-announce.ahcommand ─────────────────────────
// Called from Node.js when GABRIEL/agent responds:
// open agent-announce.ahcommand (pass text via env or tmp file)
const FILE_6 = `
// Read text from tmp file written by DreamChamber before opening
let tmpFile = '/tmp/noizy-announce.txt';
let [status, text] = app.runShellCommand('cat ' + tmpFile + ' 2>/dev/null');
if (!text || text.trim() === '') text = 'GABRIEL response received.';

// Speak via Jamie Premium
let escaped = text.replace(/'/g, String.fromCharCode(39) + '\\\\' + String.fromCharCode(39) + String.fromCharCode(39))
                 .substring(0, 2000);
app.runShellCommand('say -v "Jamie (Premium)" -r 165 \\'' + escaped + '\\'');

// Route audio through Gabriel Loopback channel
// (The say command output is captured by "NOIZY Jamie TTS" session)
`;

// ── FILE 7: noizy-status-check.ahcommand ─────────────────────
const FILE_7 = `
// Health check all NOIZY sessions
let report = [];
for (let s of app.sessions) {
  if (s.name.startsWith("NOIZY")) {
    report.push(s.name + ": " + (s.running ? "LIVE" : "STOPPED"));
  }
}

let statusText = report.join(". ") || "No NOIZY sessions found.";
app.runShellCommand(
  'say -v "Jamie (Premium)" -r 165 "Status check. ' + statusText.replace(/"/g, '') + '"'
);
app.runShellCommand(
  'osascript -e \\'display notification "' + report.join("\\n") + '" with title "NOIZY Status"\\'',
);
`;

module.exports = { FILE_1, FILE_2, FILE_3, FILE_4, FILE_5, FILE_6, FILE_7 };
