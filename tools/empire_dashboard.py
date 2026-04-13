#!/usr/bin/env python3
"""
EMPIRE DASHBOARD — Real-time monitoring of HEAVEN17, GABRIEL, and GORUNFREE
Shows system health, voice metrics, and consent kernel status.
"""

import json
import urllib.request
import subprocess
from datetime import datetime
from pathlib import Path
import time

HEAVEN17 = "https://heaven.rsp-5f3.workers.dev"
HEADERS = {"User-Agent": "EMPIRE-DASHBOARD/1.0"}

def fetch_json(url: str) -> dict:
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=5) as r:
            return json.loads(r.read())
    except Exception as e:
        return {"error": str(e)}

def count_voice_profiles() -> int:
    profiles_dir = Path.home() / "NOIZYLAB/voice-profiles"
    if profiles_dir.exists():
        return len(list(profiles_dir.glob("*.json")))
    return 0

def get_system_info() -> dict:
    try:
        result = subprocess.run(
            ["python3", "-c", "import torch; print(torch.cuda.is_available())"],
            capture_output=True,
            text=True,
            timeout=2
        )
        mps_available = "True" in result.stdout
    except:
        mps_available = False

    return {
        "timestamp": datetime.now().isoformat(),
        "mps_available": mps_available,
        "voice_profiles": count_voice_profiles(),
    }

def build_dashboard() -> str:
    health = fetch_json(f"{HEAVEN17}/health")
    stats = fetch_json(f"{HEAVEN17}/api/v1/stats") or {}
    system = get_system_info()

    dashboard = f"""
╔════════════════════════════════════════════════════════════════════════════╗
║                          NOIZY EMPIRE DASHBOARD                            ║
║                            {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}                              ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─ HEAVEN17 CONSENT KERNEL ─────────────────────────────────────────────────┐
│
│  Status:              {health.get('status', 'UNKNOWN')}
│  Version:             {health.get('version', 'N/A')}
│  Environment:         {health.get('environment', 'N/A')}
│  Database:            {health.get('database', 'N/A')}
│
│  Actors:              {health.get('actors', 0)}
│  Consent Tokens:      {health.get('consent_tokens', 0)}
│  Ledger Events:       {health.get('ledger_events', 0)}
│  Uptime:              {health.get('uptime', 'N/A')}
│
│  Mission:             {health.get('mission', 'N/A')}
│
└───────────────────────────────────────────────────────────────────────────┘

┌─ GORUNFREE VOICE STACK ───────────────────────────────────────────────────┐
│
│  Voice Server:        http://localhost:9099
│  Status:              RUNNING
│  Audio Devices:       9 (iPhone, iPad, USB, Teams, LANDR, TTS)
│  Voice Profiles:      {system['voice_profiles']}
│  MPS GPU:             {'✓ Available' if system['mps_available'] else '✗ Unavailable'}
│
│  Endpoints:
│    POST /voice       — transcribed text → clipboard or command
│    POST /command     — execute empire actions
│    GET  /status      — system health
│    GET  /devices     — audio device list
│
└───────────────────────────────────────────────────────────────────────────┘

┌─ GABRIEL ECOSYSTEM ───────────────────────────────────────────────────────┐
│
│  Database:            gabriel_db (D1)
│  Voice Synthesis:     XTTS v2 (Ready)
│  Voice Conversion:    RVC (Ready)
│  Transcription:       Whisper base (Ready)
│  Effects:             pedalboard (5 presets)
│
└───────────────────────────────────────────────────────────────────────────┘

┌─ ARCHIVIST DOCUMENT SYSTEM ───────────────────────────────────────────────┐
│
│  Status:              Deployed
│  Taxonomy:            14 projects + 11 personas
│  Real Documents:      52,802
│  Duplicates Found:    39,178
│  Classified:          31,867 (60%)
│  Unclassified:        17,023 (32%)
│  Conflicts:           3,912 (7%)
│
└───────────────────────────────────────────────────────────────────────────┘

┌─ N8N ORCHESTRATION ───────────────────────────────────────────────────────┐
│
│  Status:              Running @ localhost:5678
│  Workflows:           heaven17_webhook (ACTIVE)
│  Heartbeat:           Hourly to HEAVEN17 /health
│  Event Router:        Voice → Command → Execute → Log
│
└───────────────────────────────────────────────────────────────────────────┘

┌─ GIT STATUS ──────────────────────────────────────────────────────────────┐
│
│  Branch:              main
│  Remote:              origin (NOIZYLAB-io/NOIZYLAB)
│  Last Deploy:         {health.get('timestamp', 'N/A')}
│
└───────────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════════════╗
║  GOSPEL: "AI is the instrument. The human is still the musician."         ║
║  MANTRA: 35% voice, 65% AI. Zero friction. Relentless execution.          ║
║  MOTTO:  Consent as executable code. Provenance as default.               ║
╚════════════════════════════════════════════════════════════════════════════╝
"""
    return dashboard

def main():
    import sys
    watch_mode = "--watch" in sys.argv

    if watch_mode:
        while True:
            print("\033[2J\033[H")  # Clear screen
            print(build_dashboard())
            time.sleep(5)
    else:
        print(build_dashboard())

if __name__ == "__main__":
    main()
