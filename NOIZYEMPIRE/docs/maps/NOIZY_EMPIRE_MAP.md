# NOIZY EMPIRE — FULL ECOSYSTEM MAP
> Generated: 2026-03-13 | 2+ years of Claude sessions catalogued

## M2 Ultra (24 cores / 192GB RAM)

### Active Workspace
| Path | Purpose |
|---|---|
| `~/NOIZYLAB/` | Primary dev workspace — Platform, GABRIEL, Rob-AVA, RSP001 |
| `~/NOIZYLAB/GABRIEL/` | GABRIEL orchestration engine (bin/, logs/) |
| `~/NOIZYLAB/CODEMASTER/` | AI morning news, CODEMASTER dashboard |
| `~/NOIZYLAB/noizy_platform/` | FastAPI platform (port 8090) |
| `~/NOIZYLAB/rob_ava/` | Rob-AVA server (port 8091) |
| `~/NOIZYLAB/rsp001_pipeline/` | RSP001 recording pipeline |
| `~/NOIZYLAB/noizy-voice/` | VSCode voice input extension (compiled) |
| `~/NOIZY_2026/NOIZYVOX - AIVA/` | NoizyVox AIVA project |
| `~/Projects/GORUNFREE/` | GORUNFREE project (logs only) |
| `~/Projects/voice-forge-local/` | Local voice forge (logs only) |

### Claude Code Project Sessions (`~/.claude/projects/`)
| Session | Project |
|---|---|
| `-Users-m2ultra` | Root M2 Ultra work |
| `-Users-m2ultra-NOIZYLAB` | NOIZYLAB (this workspace) |
| `-Users-m2ultra-NOIZYLAB-CODEMASTER` | CODEMASTER sessions |
| `-Users-m2ultra-NOIZYLAB-GABRIEL` | GABRIEL sessions |
| `-Users-m2ultra-NOIZY-2026` | NOIZY 2026 project |
| `-Volumes-MAG-4TB-NOIZYFISH-THE-AQAURIUM` | NOIZYFISH Aquarium |
| `-Volumes-SOUND-DESIGN` | Sound design (drive not currently mounted) |
| `-Users-m2ultra-Library-...-NOIZYLAB-WORKSPACES` | Google Drive WORKSPACES |

---

## 4TBSG Drive — Main Work Drive

| Path | Contents |
|---|---|
| `_NOIZYFISH - THE AQUARIUM/` | Animation, branding, audio, video, RSP voice archive |
| `_2026_DOCS/NOIZYLAB_WORKSPACES/` | **HOTROD-ULTRA v4.0.0** — 6-agent swarm operations center |
| `_2026_DOCS/Documents/MissionControl96/noizylab_2026/` | MC96 project |
| `_2025 MUSIC THEORY/` | Music theory library |
| `__2025 GROUPED BY ARTIST/` | Artist-organized audio |
| `__MUSIC TO MOVE/` | Movement/sync music |
| `AIFF/`, `GarageBand/`, `Garritan/`, `Ivory/` | Sample libraries |
| `JUCE/` | JUCE audio framework |
| `IMAGE_LIBRARY/` | Visual assets |

### HOTROD-ULTRA v4.0.0 Agent Swarm
| Agent | Role | Status |
|---|---|---|
| **GABRIEL** | Master Orchestrator | active |
| **ARIA** | Creative Director | active |
| **ZEPHYR** | Community Manager | active |
| **NEXUS** | Licensing Specialist | active |
| **ECHO** | Content Curator | active |
| **ORACLE** | Analytics Engine | active |

---

## 6TB Drive — Archives

| Path | Contents |
|---|---|
| `NOIZYLAB_ARCHIVES/GABRIEL/` | XTTS voice synthesis venv |
| `NOIZYLAB_ARCHIVES/PROJECTS/GABRIEL/` | GABRIEL archive + workers |
| `NOIZYLAB_ARCHIVES/PROJECTS/NLR_01/` | NLR_01 project |
| `NOIZYLAB_ARCHIVES/PROJECTS/ROB_LEGACY/` | 2022 legacy code |
| `NOIZYLAB_ARCHIVES/PROJECTS/repairrob_staging/` | Repair Rob staging |
| `NOIZYLAB_ARCHIVES/LOCAL_LLM/GLM-4.7/` | Local GLM-4.7 model |
| `NOIZYLAB_ARCHIVES/LOCAL_LLM/OpenManus/` | OpenManus agent |
| `NOIZYLAB_ARCHIVES/MC96/` | MC96 (avatar, configs, vault, venv) |
| `NOIZYLAB_AUDIO_ARCHIVE/GABRIEL/modules/rvc_train/` | RVC voice cloning training |
| `NOIZYLAB_AUDIO_ARCHIVE/LOCAL_LLM/` | GLM-4.7 (audio archive copy) |
| `Sample_Libraries/` | Sample library archive |
| `Superior_Drummer_TCI/` | Superior Drummer content |

---

## MAG 4TB Drive — Drums & EastWest

| Path | Contents |
|---|---|
| `01_Drums/` | Drum samples |
| `02_EastWest/` | EastWest orchestral library |
| `NOIZYFISH_THE_AQAURIUM/` | NOIZYFISH content (MAG copy) |

---

## 4TB Lacie Drive

| Path | Contents |
|---|---|
| `01_DESIGN_REUNION/` | Design assets |
| `AUDIO HIJACK RECORDINGS/` | Live recordings |
| `EXTREME MUSIC/` | Extreme Music library |
| `LIBRARY/` | General library |

---

## NOIZYWIN Drive
Windows boot drive — Parallels environment.

---

## Google Drive (rsplowman@icloud.com)
- `My Drive/00.CODE & DOCS/`
- `My Drive/01.MUSIC/`
- `My Drive/02.SOUND DESIGN & SFX/`
- `My Drive/03.VOICES/`
- `My Drive/04.VIDEO/`

---

## MCP Servers (Workspace)
| Server | Scope |
|---|---|
| `noizylab-workspace` | ~/NOIZYLAB |
| `noizy-archive` | ~/NOIZYLAB/NOIZY_ARCHIVE |
| `noizylab-workspaces-4tbsg` | /Volumes/4TBSG/...WORKSPACES |
| `noizy-audio-archive-6tb` | /Volumes/6TB/NOIZYLAB_ARCHIVES |
| `noizyfish-aquarium-4tbsg` | /Volumes/4TBSG/_NOIZYFISH... |
| `gdrive-noizylab` | Google Drive rsplowman |
| `noizy-memory` | Persistent memory store |
| `cloudflare` | Cloudflare infrastructure |
| `microsoft/markitdown` | Document conversion |

---

## Voice Command Architecture
```
Talon Voice → pokey.command-server → VSCode Insiders
                                    ├── NOIZY Voice Extension (noizy-voice.toggle)
                                    ├── Claude inline chat (inlineChat.start)
                                    ├── GABRIEL tasks (workbench.action.tasks.runTask)
                                    ├── Simple Browser (simpleBrowser.show → claude.ai)
                                    └── Debug launchers (Platform, Rob-AVA, GABRIEL)
```

---

## Key Ports
| Service | Port |
|---|---|
| Platform API | 8090 |
| Rob-AVA | 8091 |
| Rob-AVA 50-line | 8092 |
| GABRIEL | 3000 |
