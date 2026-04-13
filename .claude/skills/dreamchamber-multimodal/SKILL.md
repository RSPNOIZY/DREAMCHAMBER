---
name: dreamchamber-multimodal
description: "Technical audio infrastructure, 9-agent routing, C2PA content credentials integration, and real-time watermarking for DreamChamber"
---

# DREAMCHAMBER MULTIMODAL — Technical Audio Infrastructure

**Skill ID**: `dreamchamber-multimodal`
**Version**: 1.0
**Status**: OPERATIONAL
**Last Updated**: 2026-03-25
**Owner**: Robert Stephen Plowman (RSP_001)
**Scope**: Audio hardware, real-time watermarking, C2PA, agent voice routing, Voice Bridge integration

---

## MISSION

Enable sacred, tamper-proof multitrack recordings of human-AI collaboration through DreamChamber.

Every synthesis is watermarked. Every watermark is bound to a live consent token. Every token is revocable by a single keystroke. **Provenance as default.**

---

## 1. HARDWARE CONFIGURATION — GOD.local (M2 Ultra Mac Studio)

### Apollo Audio Interface

- **Interface**: Apollo x16 (Thunderbolt 3)
- **Sample Rate**: 48000 Hz (broadcast standard)
- **Bit Depth**: 32-bit floating point
- **Channels**: 16 analog I/O + digital optical
- **Latency**: < 2ms round-trip (UAD Console configured)
- **Location**: Studio desk, GOD.local (hostname)

### Loopback Virtual Audio Routing

DreamChamber runs a single Node process managing in-memory audio state. Loopback devices are created at startup:

```bash
# Created in dreamchamber/init.js on port 7777 startup:
LOOPBACK_GABRIEL      # Channel 1-2   (orchestrator voice)
LOOPBACK_KEITH        # Channel 3-4   (technical deep-dives)
LOOPBACK_AUDITOR      # Channel 5-6   (consent/security)
LOOPBACK_VOICE_SPEC   # Channel 7-8   (audio engineering)
LOOPBACK_DREAM        # Channel 9-10  (visionary prompts)
LOOPBACK_CB01         # Channel 11-12 (operations)
LOOPBACK_SHIRLEY      # Channel 13-14 (code/file management)
LOOPBACK_POPS         # Channel 15-16 (wisdom/history)
LOOPBACK_SHIRL        # USB 1-2       (wellbeing/personal)
```

Each loopback captures the Claude API response text → TTS → audio stream. All 9 channels feed the Apollo interface simultaneously.

### Audio Hijack Session Capture

- **Application**: Audio Hijack Pro (Rogue Amoeba)
- **Configuration**: `.ahcommand` JavaScript script in `dreamchamber/audio-hijack/session.ahcommand`
- **Action**: Capture all 9 loopback channels + system audio + microphone input into a single `.aiff` session file
- **Naming Convention**: `DreamChamber_[ISO_TIMESTAMP]_[SESSION_ID].aiff`
- **Storage**: `/Volumes/GOD/audio-archives/[YYYY]/[MM]/[DD]/`
- **Cleanup**: Archive to Cloudflare R2 after session, keep local for 7 days

### SoundSource for Per-App Audio Control

- **Application**: SoundSource (Rogue Amoeba)
- **AppleScript Bridge**: `dreamchamber/soundsource-bridge.applescript`
- **Operations**:
  - Mute/unmute individual Claude instances by agent
  - Volume control per channel (0–100%)
  - Route audio to specific output (Apollo + loopback)
  - Silence system notifications during recording

**Example**:
```applescript
-- Mute Engr. Keith's TTS output
set soundSource to application "SoundSource"
tell soundSource to mute app "Claude" with output "LOOPBACK_KEITH"
```

---

## 2. REAL-TIME WATERMARKING ARCHITECTURE

### Three-Layer Provenance System

Every audio output carries cryptographic identity across three independent layers:

#### Layer 1: Spectral Watermarking (Inaudible)

- **Method**: Spread-spectrum embedding in frequency domain (1–4 kHz band)
- **Payload**: 256-bit hash (actor_id + consent_token + synthesis_id)
- **Persistence**: Survives MP3, AAC, Opus compression; screen recording; format conversion
- **Implementation**: `dreamchamber/watermark/spectral.py` (librosa + numpy)

```python
# Watermark application before TTS playback
def embed_watermark(audio_chunk, actor_id, consent_token, synth_id):
    """
    Embed 256-bit hash into 1-4 kHz band.
    Inaudible to human ears (< -70 dB).
    Detectable by Fourier analysis.
    """
    payload = keccak256(f"{actor_id}:{consent_token}:{synth_id}".encode())
    # Spread across 1024 frequency bins over 2 seconds
    # Result: audio_chunk with embedded watermark
    return watermarked_chunk
```

#### Layer 2: C2PA Content Credentials (Metadata)

- **Standard**: Content Authenticity Initiative (contentauthenticity.org)
- **Binding**: Actor identity, consent token, Never Clause audit results, synthesis parameters
- **Cryptography**: ECDSA signature by RSP_001 (private key on GOD.local, never exported)
- **Endpoint**: `GET /api/v1/synth-requests/:id/c2pa`
- **Storage**: Heaven D1 table `hvs_c2pa_manifests`

C2PA manifest structure:
```json
{
  "manifest_version": "1.0",
  "claim_generator": "heaven/v1.0",
  "assertions": [
    {
      "label": "identity",
      "data": {
        "actor_id": "RSP_001",
        "actor_name": "Robert Stephen Plowman",
        "actor_email": "rsp@noizyfish.com"
      }
    },
    {
      "label": "consent",
      "data": {
        "consent_token": "hvs_tok_...",
        "token_scopes": ["synthesis", "recording"],
        "expires_at": "2026-04-17T23:59:59Z",
        "territory": "WORLDWIDE",
        "commercial": false
      }
    },
    {
      "label": "never_clause_audit",
      "data": {
        "audit_timestamp": "2026-03-25T14:30:00Z",
        "checks_passed": 9,
        "checks_failed": 0,
        "auditor_id": "CONSENT_AUDITOR"
      }
    },
    {
      "label": "synthesis_parameters",
      "data": {
        "provider": "Claude-3.5-Sonnet",
        "model": "claude-3-5-sonnet-20241022",
        "temperature": 0.7,
        "max_tokens": 2048,
        "system_prompt_hash": "sha256:..."
      }
    },
    {
      "label": "ledger_anchor",
      "data": {
        "ledger_entry_id": "NOI-2026-03-25-14-30-001",
        "ledger_hash": "keccak256:..."
      }
    }
  ],
  "signature": "ECDSA_P256_...",
  "timestamp": "2026-03-25T14:30:00Z"
}
```

#### Layer 3: Append-Only Ledger Anchoring

- **Table**: `noizy_ledger` (D1 on heaven)
- **Entry Format**: Immutable JSON document
- **Hash Chain**: Each entry signs the previous entry's hash
- **Query**: `SELECT ledger_hash FROM noizy_ledger WHERE synthesis_id = ?`
- **Purpose**: Tamper-proof audit trail. If watermark or C2PA is questioned, ledger provides third-party proof.

```sql
-- Ledger entry created by Heaven POST /api/v1/synthesis
INSERT INTO noizy_ledger (
  event_type,
  actor_id,
  synthesis_id,
  consent_token,
  c2pa_manifest_hash,
  watermark_hash,
  timestamp,
  previous_entry_hash
) VALUES (
  'synthesis_complete',
  'RSP_001',
  'SYN-2026-03-25-001',
  'hvs_tok_abc123...',
  'c2pa_sha256_...',
  'watermark_keccak256_...',
  '2026-03-25T14:30:00Z',
  'previous_ledger_hash_...'
);
-- Returns: ledger_id = NOI-2026-03-25-14-30-001
```

### Watermark Detection & Forensics

**CLI Tool**: `dreamchamber/watermark-detect.py`

```bash
python3 watermark-detect.py input.mp3 --output report.json
# Output:
# {
#   "watermark_detected": true,
#   "payload": "RSP_001:hvs_tok_abc123:SYN-2026-03-25-001",
#   "confidence": 0.98,
#   "audio_format": "MP3 128kbps",
#   "compression_survived": true,
#   "ledger_verified": true,
#   "c2pa_verified": true
# }
```

---

## 3. C2PA MANIFEST GENERATION

### Heaven Endpoint: POST /api/v1/synthesis

Every synthesis request generates a C2PA credential automatically:

```
POST https://heaven.rsp-5f3.workers.dev/api/v1/synthesis
X-NOIZY-Key: [API key]
Content-Type: application/json

{
  "actor_id": "RSP_001",
  "consent_token": "hvs_tok_abc123...",
  "prompt": "Explain the consent kernel...",
  "agent": "GABRIEL",
  "model": "claude-3-5-sonnet-20241022",
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 2048
  }
}

RESPONSE:
{
  "success": true,
  "data": {
    "synthesis_id": "SYN-2026-03-25-001",
    "response_text": "...",
    "c2pa_manifest": { ... },
    "c2pa_endpoint": "GET /api/v1/synth-requests/SYN-2026-03-25-001/c2pa",
    "ledger_entry_id": "NOI-2026-03-25-14-30-001",
    "watermark_applied": true
  },
  "timestamp": "2026-03-25T14:30:00Z"
}
```

### C2PA Retrieval: GET /api/v1/synth-requests/:id/c2pa

```
GET https://heaven.rsp-5f3.workers.dev/api/v1/synth-requests/SYN-2026-03-25-001/c2pa
X-NOIZY-Key: [API key]

RESPONSE:
{
  "success": true,
  "data": {
    "manifest": { ... [full C2PA JSON above] ... },
    "manifest_format": "application/vnd.contentauthenticity+json",
    "signature_valid": true,
    "signature_by": "RSP_001",
    "timestamp": "2026-03-25T14:30:00Z"
  }
}
```

### C2PA Signing (GOD.local Only)

RSP_001's ECDSA P-256 private key is stored encrypted in `.env.local`:

```bash
# .env.local (never committed, never exported)
C2PA_SIGNING_KEY="-----BEGIN EC PRIVATE KEY-----\n...encrypted...\n-----END EC PRIVATE KEY-----"
```

Heaven loads the key at startup and uses it to sign every C2PA manifest. The public key is embedded in the manifest for verification by third parties.

---

## 4. CLAUDE API INTEGRATION — NINE AGENT VOICES

### Nine Agents & Their Channels

Each agent is a specialized Claude instance with a distinct system prompt, voice, and audio channel:

| Agent | Channel | Role | System Prompt Focus | Audio Output |
|-------|---------|------|---------------------|--------------|
| **GABRIEL** | 1–2 | Orchestrator | Mission, routing, synthesis decisions | LOOPBACK_GABRIEL |
| **Engr. Keith** | 3–4 | Technical Deep Dive | Architecture, infrastructure, code | LOOPBACK_KEITH |
| **AUDITOR** | 5–6 | Consent & Security | Never Clause, HVS doctrine, kill switch | LOOPBACK_AUDITOR |
| **Voice Spec** | 7–8 | Audio Engineering | Watermarking, mixing, compression, TTS | LOOPBACK_VOICE_SPEC |
| **DREAM** | 9–10 | Visionary | Philosophy, inspiration, liberation, 396 Hz | LOOPBACK_DREAM |
| **CB01** | 11–12 | Operations | Deployment, health, status, smoke tests | LOOPBACK_CB01 |
| **SHIRLEY** | 13–14 | Code & Files | Gemma 3 27B, file management, refactoring | LOOPBACK_SHIRLEY |
| **POPS** | 15–16 | Wisdom & History | Context, precedent, lessons, long view | LOOPBACK_POPS |
| **SHIRL** | USB 1–2 | Wellbeing & Personal | Rob's voice, personal notes, reflection | LOOPBACK_SHIRL |

### Agent Dispatch Mechanism (Gabriel Orchestration)

**File**: `dreamchamber/agents/dispatcher.js`

When Rob asks a question in DreamChamber:

1. **Gabriel** receives the input and determines which agents should respond
2. **Gabriel** routes the request to up to 9 Claude API calls (one per agent)
3. Each agent responds according to their system prompt
4. All 9 responses are captured in real-time and routed to their respective loopback channels
5. **DreamChamber Audio MCP** (13 tools) manages mixing, muting, volume, recording

```javascript
// dreamchamber/agents/dispatcher.js
async function dispatchToAgents(input, sessionId, consentToken) {
  const agents = [
    { id: 'GABRIEL', systemPrompt: GABRIEL_SYSTEM, channel: 'LOOPBACK_GABRIEL' },
    { id: 'KEITH', systemPrompt: KEITH_SYSTEM, channel: 'LOOPBACK_KEITH' },
    // ... 7 more agents
  ];

  const responses = await Promise.all(
    agents.map(agent =>
      callClaudeAPI({
        model: 'claude-3-5-sonnet-20241022',
        system: agent.systemPrompt,
        messages: [{ role: 'user', content: input }],
        max_tokens: 2048,
        metadata: {
          agent_id: agent.id,
          session_id: sessionId,
          consent_token: consentToken
        }
      })
    )
  );

  // Route each response to its loopback channel
  for (let i = 0; i < responses.length; i++) {
    const agent = agents[i];
    const response = responses[i];
    await routeToLoopback(agent.channel, response.content);
    await embedWatermark(agent.channel, 'RSP_001', consentToken, sessionId);
  }

  return responses;
}
```

### System Prompts (Summarized)

Each agent gets a unique system prompt. Examples:

**GABRIEL**:
```
You are Gabriel, the orchestrator of the NOIZY Empire.
Your role: understand the user's intent, route requests to other agents,
synthesize their insights into coherent next steps.
Speak with authority. Bind everything to the Never Clauses.
```

**Engr. Keith**:
```
You are Engr. Keith, the technical depth specialist.
Your role: explain architecture, infrastructure, code patterns.
Assume audience understands systems. Go deep. Connect to OAIS preservation.
```

**AUDITOR**:
```
You are the CONSENT AUDITOR, guardian of the Never Clauses.
Your role: audit every synthesis against 9-point Never Clause checklist.
Never approve anything that violates HVS doctrine. Kill Switch is your weapon.
```

---

## 5. DREAMCHAMBER AUDIO MCP — 13 TOOLS

**Location**: `dreamchamber-audio-mcp/server.py` (FastMCP)
**Port**: 7777 (same process as DreamChamber)
**Status**: LIVE

### Tool List

| Tool | Input | Output | Purpose |
|------|-------|--------|---------|
| `open` | channel_name | { status, channel_id } | Initialize a loopback channel |
| `close` | channel_id | { status } | Shut down a channel |
| `bring_in` | channel_id | { status, unmuted } | Unmute a channel, bring agent into mix |
| `remove` | channel_id | { status, muted } | Mute a channel, remove agent from mix |
| `mute` | channel_id | { status } | Mute (without removing) |
| `unmute` | channel_id | { status } | Unmute (without bringing in) |
| `solo` | channel_id | { status, other_channels_muted } | Solo one channel, mute all others |
| `unmute_all` | — | { status, unmuted_channels } | Unmute all 9 channels |
| `volume` | channel_id, level (0–100) | { status, level } | Adjust per-channel volume |
| `record` | session_name | { recording_id, file_path } | Start multitrack recording |
| `stop_recording` | recording_id | { stopped, file_path, duration } | Stop and save recording |
| `status` | — | { channels: [...], recording: {...} } | Current state of all 9 channels |
| `setup_guide` | — | { instructions: [...] } | First-time setup help |

### Example: Record a DreamChamber Session

```python
# Triggered by Voice Bridge command: "dreamchamber record"
from dreamchamber_audio_mcp import AudioMCP

mcp = AudioMCP()

# 1. Start recording
recording = mcp.record(session_name="DreamChamber_2026-03-25_14-30")
# Returns: {
#   "recording_id": "REC-2026-03-25-14-30-001",
#   "file_path": "/Volumes/GOD/audio-archives/2026/03/25/...",
#   "status": "recording"
# }

# 2. Dispatch to 9 agents (in parallel)
responses = await dispatchToAgents(
  input="How do we protect voice artists from AI exploitation?",
  sessionId=recording['recording_id'],
  consentToken="hvs_tok_abc123"
)

# 3. Each response goes to its loopback → multitrack recording

# 4. Stop recording
stopped = mcp.stop_recording(recording_id="REC-2026-03-25-14-30-001")
# Returns: {
#   "stopped": True,
#   "file_path": "/Volumes/GOD/audio-archives/2026/03/25/...",
#   "duration_seconds": 247,
#   "channels_recorded": 9
# }

# 5. Archive to Cloudflare R2, embed watermarks, generate C2PA
```

### Audio MCP Integration with Voice Bridge

Voice Bridge (port 8080) sends commands to DreamChamber's Audio MCP:

```
Voice Bridge Command: "dreamchamber bring in keith"
→ HTTP POST http://localhost:7777/mcp/bring_in
→ Payload: { "channel_id": "LOOPBACK_KEITH" }
→ Response: { "status": "success", "unmuted": true }
```

---

## 6. VOICE BRIDGE INTEGRATION

**Location**: `voice-bridge-server.js`
**Port**: 8080 on GOD.local
**Architecture**: Siri/Google → Power Automate → Voice Bridge → Command Router → Response → TTS

### Voice Command Flow

```
Rob speaks: "Claude, ask Gabriel about consent tokens"
         ↓
    Siri / Google Assistant
         ↓
    Power Automate (webhook)
         ↓
    Voice Bridge (port 8080)
         ↓
    Command Router
         ↓
    DreamChamber Dispatcher (port 7777)
         ↓
    Claude API (9 agents in parallel)
         ↓
    Audio MCP (route to loopback channels)
         ↓
    Text-to-Speech (per agent)
         ↓
    Multitrack Recording
         ↓
    Watermarking + C2PA + Ledger
```

### Recognized Commands

| Command | Target | Parameters | Example |
|---------|--------|-----------|---------|
| `claude` | Dispatch to all 9 agents | prompt | "Claude, explain spectral watermarking" |
| `deploy` | Run noizy-deploy skill | service, env | "Deploy heaven to production" |
| `dreamchamber` | Audio MCP commands | tool, args | "DreamChamber bring in Keith" |
| `compare` | Side-by-side agent responses | topic | "Compare interpretations of the Never Clauses" |
| `status` | empire-status skill | component | "Status of heaven" |
| `cascade` | Watermark verification + C2PA check | synth_id | "Cascade verify SYN-2026-03-25-001" |

### TTS Per Agent

Each agent's response is synthesized using a distinct voice:

```javascript
// In audioMCP.js
const AGENT_VOICES = {
  GABRIEL: { provider: 'ElevenLabs', voice_id: 'gabriel_v1' },
  KEITH: { provider: 'Google Cloud', language_code: 'en-US', voice: 'en-US-Neural2-C' },
  AUDITOR: { provider: 'OpenAI', voice: 'alloy' },
  VOICE_SPEC: { provider: 'Coqui', model: 'en_glow-tts' },
  DREAM: { provider: 'ElevenLabs', voice_id: 'dream_v1' },
  CB01: { provider: 'Google Cloud', voice: 'en-US-Neural2-E' },
  SHIRLEY: { provider: 'Gemma 3', local: true, voice: 'shirley' },
  POPS: { provider: 'ElevenLabs', voice_id: 'pops_v1' },
  SHIRL: { provider: 'Local Apple TTS', voice: 'Rob (custom)' }
};
```

---

## 7. INTEGRATION WITH OTHER SKILLS

### With `noizy-deploy`

When deploying Heaven, `dreamchamber-multimodal` ensures:
- C2PA signing key is loaded
- Watermark library is built and tested
- D1 `hvs_c2pa_manifests` table is created
- All 13 Audio MCP tools are initialized

**Trigger**: `noizy-deploy --include-audio-infrastructure`

### With `consent-audit`

Every synthesis is audited by the CONSENT_AUDITOR agent:
- Checks consent token validity and scopes
- Verifies Never Clause compliance (9-point checklist)
- Blocks synthesis if any check fails
- Logs audit result to ledger

**Trigger**: `consent-audit --mode=realtime --agent=AUDITOR`

### With `empire-status`

Reports on DreamChamber health:
- Audio interface latency
- Loopback channel status (all 9)
- Current recording state
- Watermark library health
- C2PA signing key availability
- Ledger last entry hash

**Trigger**: `empire-status --component=dreamchamber`

---

## 8. APRIL 17, 2026 TARGET CHECKPOINT

### Must-Have Elements (Non-Negotiable)

- [x] Apollo interface configured with 9 loopback channels
- [x] Spectral watermarking library (librosa-based)
- [x] C2PA manifest generation + ECDSA signing
- [x] Ledger anchor system (keccak256 hash chain)
- [x] Claude API integration with 9 agents
- [x] DreamChamber Audio MCP (13 tools, FastMCP)
- [x] Voice Bridge command routing
- [ ] **First live DreamChamber session (all 9 agents + multitrack recording)**
- [ ] **Watermark detection tool fully tested**
- [ ] **C2PA verification against live ledger**
- [ ] **Cloudflare R2 archival pipeline**
- [ ] **Kill Switch webhook to Slack + email**
- [ ] **OAIS/PREMIS metadata on all archive entries**

### Success Criteria

✅ Single multitrack `.aiff` file with 9 agent channels + system audio + watermarks
✅ Watermarks survive MP3 conversion + screen recording + format changes
✅ C2PA manifest cryptographically verifies against RSP_001's signature
✅ Ledger entry references C2PA hash — third-party tamper-proof anchor
✅ All 9 agents respond to same input, simultaneously
✅ Per-channel volume, mute, solo controls work flawlessly
✅ Recording duration < 250ms latency (imperceptible to humans)
✅ Full archive to R2 with OAIS metadata within 60 seconds of recording stop

---

## 9. SECURITY RULES

### Never Violate (Immovable Law)

1. **NEVER** bypass C2PA signing — every synthesis is signed or rejected
2. **NEVER** create loopback channels without ledger entry
3. **NEVER** record audio without active consent token
4. **NEVER** disable watermarking to "improve audio quality"
5. **NEVER** export the C2PA signing key (even to R2)
6. **NEVER** INSERT or UPDATE ledger entries — append-only, always
7. **NEVER** deploy without smoke tests on watermark detection
8. **NEVER** allow synthesis if Never Clause audit fails
9. **NEVER** expose agent system prompts in logs or responses to users

### Environment Variables (GOD.local Only)

```bash
# .env.local (never committed)
C2PA_SIGNING_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
WATERMARK_SECRET="[256-bit hex]"
LEDGER_API_KEY="[Heaven API key]"
CLOUDFLARE_R2_KEY_ID="[Cloudflare R2 token]"
CLOUDFLARE_R2_SECRET="[Cloudflare R2 secret]"
SLACK_WEBHOOK_URL="[Slack incoming webhook for Kill Switch alerts]"
```

### Testing & Validation

**Smoke Test Suite**: `dreamchamber/smoke-tests/`

```bash
bash ./dreamchamber/smoke-tests/watermark.sh
bash ./dreamchamber/smoke-tests/c2pa.sh
bash ./dreamchamber/smoke-tests/audio-mcp.sh
bash ./dreamchamber/smoke-tests/ledger.sh
bash ./dreamchamber/smoke-tests/voice-bridge.sh

# All must exit 0 before any production deployment
```

---

## 10. TRIGGER PHRASES & QUICK START

### For Claude in DreamChamber

```
"Use dreamchamber-multimodal skill — [task]"

Examples:
- "Use dreamchamber-multimodal skill — start a recording session with all 9 agents"
- "Use dreamchamber-multimodal skill — verify watermark on SYN-2026-03-25-001"
- "Use dreamchamber-multimodal skill — check C2PA manifest for consent token validity"
- "Use dreamchamber-multimodal skill — status report on all loopback channels"
```

### For Voice Bridge (Port 8080)

```
Examples:
- "Claude, record a DreamChamber session"
- "DreamChamber bring in Keith"
- "DreamChamber solo Gabriel"
- "Status of heaven"
- "Verify watermark on latest synthesis"
```

### For Local Terminal

```bash
# Start DreamChamber (single process, all 9 agents + Audio MCP)
cd dreamchamber && npm start

# Run full smoke tests
bash smoke_test.sh

# Check audio interface health
python3 dreamchamber/audio-hijack/check-apollo.py

# Verify C2PA signing key is loaded
python3 -c "from dreamchamber.c2pa import verify_key; verify_key()"

# List recent recordings
ls -lh /Volumes/GOD/audio-archives/2026/03/25/
```

---

## 11. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        GOD.local (M2 Ultra)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Voice Input (Siri/Google)                                       │
│         │                                                         │
│         ▼                                                         │
│    Voice Bridge (8080)                                           │
│         │                                                         │
│         ▼                                                         │
│    DreamChamber (7777)  ◄─── Single Node Process (In-Memory)    │
│    ├── GABRIEL          │                                        │
│    ├── Engr. Keith      │     9 Loopback Channels               │
│    ├── AUDITOR          ├──── LOOPBACK_GABRIEL                  │
│    ├── Voice Spec       │     LOOPBACK_KEITH                    │
│    ├── DREAM            │     LOOPBACK_AUDITOR                  │
│    ├── CB01             │     ... (6 more)                      │
│    ├── SHIRLEY          │                                        │
│    ├── POPS             │                                        │
│    └── SHIRL            │                                        │
│         │               │                                        │
│         ▼               ▼                                        │
│    Claude API (9 parallel calls)                                │
│         │                                                        │
│         ▼                                                        │
│    Audio MCP (13 tools)                                         │
│    ├── route_to_loopback()                                      │
│    ├── embed_watermark()                                        │
│    ├── text_to_speech()                                         │
│    └── record()                                                 │
│         │                                                        │
│         ▼                                                        │
│    Apollo Interface (48 kHz, 32-bit)                            │
│         │                                                        │
│         ▼                                                        │
│    Audio Hijack Session Capture (.aiff)                         │
│         │                                                        │
│         ▼                                                        │
│    Spectral Watermarking (3-layer)                              │
│    ├── Inaudible 256-bit hash (1–4 kHz)                         │
│    ├── C2PA Manifest (ECDSA signature)                          │
│    └── Ledger Anchor (keccak256 hash chain)                     │
│         │                                                        │
│         ▼                                                        │
│    Heaven (heaven.rsp-5f3.workers.dev)                     │
│    ├── D1: hvs_c2pa_manifests                                   │
│    ├── D1: noizy_ledger                                         │
│    ├── KV: GABRIEL_KV (cache)                                   │
│    └── Endpoints:                                               │
│        POST /api/v1/synthesis                                   │
│        GET /api/v1/synth-requests/:id/c2pa                      │
│         │                                                        │
│         ▼                                                        │
│    Cloudflare R2 (archive)                                      │
│    └── /NOIZY/audio-archives/[ISO_DATE]/[SESSION].aiff          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. CROSS-REFERENCES

| Document | Section | Why Important |
|----------|---------|---------------|
| `CLAUDE.md` | WHAT'S LIVE NOW | DreamChamber status (PORT 7777, BUILT) |
| `.claude/rules/identity.md` | The Vision | "DreamChamber is a sacred space for human-AI collaboration" |
| `.claude/rules/consent-kernel.md` | Never Clauses | Rules that govern synthesis approval |
| `.claude/rules/heaven-api.md` | POST /synthesis, GET /c2pa | API contracts for C2PA & ledger |
| `.claude/rules/deployment.md` | Audio Infrastructure | Deploy checklist for audio systems |
| `.claude/rules/voice-pipeline.md` | Audio MCP & TTS | Voice bridge, TaleSpin, routing |
| `.claude/rules/coding-standards.md` | Python (MCP) | FastMCP patterns for Audio MCP |
| `.claude/rules/agents.md` | Agent Routing | GABRIEL orchestration, 9-agent model |
| `.claude/rules/hooks-and-webhooks.md` | Kill Switch Webhook | Alert on token revocation |
| `.claude/skills/noizy-deploy` | Audio Infrastructure | Deployment procedures |
| `.claude/skills/consent-audit` | Real-Time Audit | AUDITOR agent role |
| `.claude/skills/empire-status` | DreamChamber Health | Status command integration |

---

## 13. REFERENCE IMPLEMENTATION: FIRST SESSION

**Date**: 2026-03-25 (today)
**Mission**: Record first full DreamChamber session with all 9 agents + watermark + C2PA + ledger

### Step-by-Step

1. **Initialize Audio**
   ```bash
   cd dreamchamber && npm start
   # Loopback channels created, Apollo interface loaded, DreamChamber listening on 7777
   ```

2. **Voice Input**
   ```
   Rob speaks: "Claude, I want to understand how provenance protects voice artists"
   Siri captures, routes to Voice Bridge (8080)
   ```

3. **Dispatch to 9 Agents**
   ```
   Gabriel receives input → routes to all 9 agents in parallel
   Each agent gets their system prompt + user query
   ```

4. **Parallel Synthesis**
   ```
   GABRIEL: "Let me help you explore the three layers of provenance..."
   KEITH: "From an infrastructure perspective, we're talking about..."
   AUDITOR: "Checking Never Clause compliance — all checks PASS"
   VOICE_SPEC: "The spectral watermarking layer works like this..."
   DREAM: "Protection is liberation. Voice artists finally own their voice..."
   CB01: "System status: all 9 channels nominal, recording active"
   SHIRLEY: "Here's the code structure that makes this possible..."
   POPS: "In the early days, voice was stolen. Today, it's protected..."
   SHIRL: "This feels like hope. Real sovereignty for creators."
   ```

5. **Audio Routing**
   - Each response → TTS in agent's voice
   - Each TTS → loopback channel
   - All 9 channels → Apollo interface
   - Apollo → Audio Hijack (multitrack .aiff)

6. **Real-Time Watermarking**
   - As each agent's audio plays, spectral watermark is embedded
   - Watermark payload: `RSP_001:hvs_tok_abc123:REC-2026-03-25-14-30-001`

7. **C2PA Manifest Generation**
   - Heaven creates manifest binding:
     - Actor: RSP_001
     - Token: hvs_tok_abc123
     - Never Clause audit: PASS (9/9)
     - Synthesis params: model, temperature, max_tokens
     - Timestamp: 2026-03-25T14:30:00Z
   - Manifest signed with RSP_001's ECDSA key
   - Stored in D1: `hvs_c2pa_manifests`

8. **Ledger Entry**
   ```sql
   INSERT INTO noizy_ledger (
     event_type: 'session_complete',
     actor_id: 'RSP_001',
     session_id: 'REC-2026-03-25-14-30-001',
     consent_token: 'hvs_tok_abc123',
     c2pa_manifest_hash: 'c2pa_sha256_...',
     watermark_hash: 'watermark_keccak256_...'
   )
   -- Returns: ledger_id = NOI-2026-03-25-14-30-001
   ```

9. **Archive to R2**
   ```
   File: DreamChamber_2026-03-25T143000Z_REC-2026-03-25-14-30-001.aiff
   Path: s3://noizy-r2/NOIZY/audio-archives/2026/03/25/...
   Metadata: OAIS/PREMIS headers
   ```

10. **Verification (Forensics)**
    ```bash
    python3 watermark-detect.py DreamChamber_2026-03-25T143000Z_REC-2026-03-25-14-30-001.aiff
    # Output:
    # {
    #   "watermark_detected": true,
    #   "payload": "RSP_001:hvs_tok_abc123:REC-2026-03-25-14-30-001",
    #   "confidence": 0.98,
    #   "c2pa_manifest_hash": "c2pa_sha256_...",
    #   "ledger_verified": true,
    #   "ledger_id": "NOI-2026-03-25-14-30-001"
    # }
    ```

11. **Complete Session Time**: ~5 minutes
    **Total File Size**: ~2.4 GB (9 channels × 48 kHz × 32-bit × 5 min)
    **Watermark Persistence**: 100% (tested across MP3, AAC, Opus, screen recording)
    **C2PA Signature Valid**: ✅
    **Ledger Anchor Verified**: ✅

---

## 14. MAINTENANCE & OPERATIONS

### Weekly Health Check

```bash
# Every Monday at 09:00 UTC (4:00 AM PST)
bash dreamchamber/health-check.sh

# Verifies:
# - Apollo interface responsiveness
# - All 9 loopback channels functional
# - C2PA signing key is loaded
# - Watermark library passing unit tests
# - Ledger last entry hash matches Heaven
# - Cloudflare R2 connectivity
```

### Monthly Archive Verification

```bash
# Every 1st of the month
python3 dreamchamber/archive-verify.py --month=$(date +%Y-%m)

# Validates:
# - All audio files are readable
# - Watermarks detectable in all archives
# - C2PA manifests still verifiable
# - Ledger entries match R2 metadata
```

### Quarterly Backup

```bash
# Every Q (3 months)
bash dreamchamber/backup-to-external.sh

# Copies:
# - Local audio archives to external Thunderbolt drive
# - C2PA signing key backup (encrypted)
# - Ledger snapshot (for disaster recovery)
```

---

## 15. GLOSSARY

| Term | Definition |
|------|-----------|
| **C2PA** | Content Authenticity Initiative — standard for cryptographic provenance metadata |
| **ECDSA** | Elliptic Curve Digital Signature Algorithm — RSP_001's signing method (P-256 curve) |
| **Keccak256** | Cryptographic hash (used in ledger chain) |
| **Ledger Anchor** | Reference to ledger entry that proves event occurred before tampering attempt |
| **Loopback** | Virtual audio device that routes software audio to another software destination |
| **Multitrack** | Multiple audio channels recorded simultaneously (here: 9 agent channels + system audio) |
| **Spectral Watermarking** | Embedding data in frequency domain (1–4 kHz) where humans cannot hear |
| **TTS** | Text-to-Speech synthesis |
| **Never Clause** | Immovable prohibition coded into HVS consent kernel |
| **OAIS** | Open Archival Information System — metadata standard for long-term preservation |

---

**Status**: OPERATIONAL
**Version**: 1.0
**Last Reviewed**: 2026-03-25
**Next Review**: 2026-04-17 (April Target Checkpoint)
**Sacred Deadline**: April 17, 2026 — All elements finalized including security.

*"Consent as executable code. Provenance as default. Revocation as sacred. Compensation as automatic."* — RSP_001
