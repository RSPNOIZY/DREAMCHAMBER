---
description: DreamChamber multi-model AI command center — providers, streaming, UI, Gabriel orchestration.
paths:
  - "dreamchamber/**/*.js"
  - "dreamchamber/**/*.html"
  - "dreamchamber/**/*.json"
---

# DREAMCHAMBER — MULTI-MODEL AI COMMAND CENTER

## Overview

- **Path**: `dreamchamber/`
- **Port**: 7777
- **Start**: `cd dreamchamber && npm start`
- **Stack**: Express + WebSocket + SSE streaming

## AI Providers (11 wired, all streaming)

| Provider | Models | Streaming |
|----------|--------|-----------|
| Anthropic | Claude Sonnet 4, Opus 4 | ✅ SSE |
| OpenAI | GPT-4o, GPT-4 Turbo | ✅ SSE |
| Google | Gemini 2.0 Flash, Gemini Pro, Gemma 3 27B (Shirley) | ✅ SSE |
| Together | Llama 3.3 70B | ✅ SSE |
| Mistral | Mistral Large | ✅ SSE |
| Cohere | Command R+ | ✅ SSE |
| Perplexity | Online search | ✅ SSE |

**Shirley** (Gemma 3 27B) — Code & File Manager persona for the NOIZY Empire codebase.

## Key Files

```
dreamchamber/src/server.js              — Express + WebSocket server
dreamchamber/src/core/StateManager.js   — Conversation state (in-memory)
dreamchamber/src/core/CostCalculator.js — Real pricing per model
dreamchamber/src/core/HeavenClient.js — Bridge to consent kernel
dreamchamber/src/core/Gabriel.js        — Gabriel orchestration layer
dreamchamber/src/core/Database.js       — PostgreSQL layer (optional)
dreamchamber/src/routes/api.js          — REST routes + Heaven proxy
dreamchamber/src/websocket/handler.js   — WebSocket streaming (checks streamChat())
dreamchamber/src/providers/*.js          — One per AI provider
dreamchamber/public/index.html          — Command center UI (4 tabs)
dreamchamber/public/contact-sequence.html — Three.js 4-phase entry animation
```

## UI Tabs

Chat (11 models) | Consent Kernel (live data) | Models | Settings

## Contact Sequence

15-second Three.js cinematic entry. 10,000 particles in 5 categories (art/gold, music/cyan, science/blue, culture/green, architecture/purple). 4 phases: gathering → vortex → wormhole → emergence. 396 Hz Web Audio API tone. First-visit redirect via sessionStorage.

## Critical Patterns

- Single process only (`instances: 1`, fork mode) — WebSocket + StateManager require it
- All providers MUST implement `streamChat()` async generator for streaming
- `handler.js` checks for `provider.streamChat` before attempting stream
- Gabriel context TTL: 30 minutes (force refresh via `/api/gabriel/refresh`)
- Gabriel model configurable via `GABRIEL_MODEL` env var (default: claude-sonnet-4)
- Anthropic prompt caching: static system prompt cached (10% price), dynamic context not cached

## API Keys

- `ANTHROPIC_API_KEY` — "noisy production" key in `dreamchamber/.env`
- `GOOGLE_API_KEY` — for Gemini + Gemma models
- Windsurf uses "NOIZYWIND" key
- Claude Code uses claude.ai login session (no env key needed)
