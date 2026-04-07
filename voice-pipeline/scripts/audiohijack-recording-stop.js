// ============================================================================
// NOIZY Voice Pipeline — Audio Hijack Recording Stop Script
// ============================================================================
// Fires when Audio Hijack finishes a recording.
// Sends the recorded file to Whisper for transcription.
//
// Install: Audio Hijack → Window → Script Library → User Scripts → New Script
// Connect: Session → Scripting tab → New Automation → Recording Stop → this script
//
// #needsFile
// ============================================================================

// --- Configuration ---
const WHISPER_SCRIPT = '/Users/m2ultra/NOIZYLAB/voice-pipeline/scripts/whisper-transcribe.sh';
const PIPELINE_SCRIPT = '/Users/m2ultra/NOIZYLAB/voice-pipeline/scripts/voice-pipeline.sh';
const LOG_DIR = '/Users/m2ultra/NOIZYLAB/logs/voice-pipeline';

// --- Get the recorded file path from Audio Hijack ---
let filePath = event.file.filePath;

if (!filePath) {
    console.log('ERROR: No file path received from Audio Hijack');
    // Early exit — nothing to process
} else {
    console.log('Recording complete: ' + filePath);

    // --- Option A: Run Whisper transcription only ---
    // Uncomment this block to ONLY transcribe (no Claude prompt)
    /*
    let cmd = '/bin/bash ' + app.shellEscapeArgument(WHISPER_SCRIPT) + ' ' + app.shellEscapeArgument(filePath);
    let [status, stdout, stderr] = app.runShellCommand(cmd);

    if (status === 0) {
        console.log('Transcription complete: ' + stdout.trim());
    } else {
        console.log('Transcription failed: ' + stderr);
    }
    */

    // --- Option B: Run the full pipeline (Whisper → Claude → response) ---
    // This calls the orchestrator which chains transcription → prompt → response
    let cmd = '/bin/bash ' + app.shellEscapeArgument(PIPELINE_SCRIPT) + ' ' + app.shellEscapeArgument(filePath);
    let [status, stdout, stderr] = app.runShellCommand(cmd);

    if (status === 0) {
        console.log('Pipeline complete: ' + stdout.trim());
    } else {
        console.log('Pipeline error (status ' + status + '): ' + stderr);
    }

    // --- Log the event ---
    let logCmd = 'mkdir -p ' + app.shellEscapeArgument(LOG_DIR) + ' && ';
    logCmd += 'echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | AUDIO_HIJACK | Recording Stop | ';
    logCmd += filePath.replace(/'/g, '') + '" >> ';
    logCmd += app.shellEscapeArgument(LOG_DIR + '/audiohijack_events.log');
    app.runShellCommand(logCmd);
}
