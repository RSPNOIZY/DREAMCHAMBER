# HEAVEN TIER — AI Family

## Purpose

Local multi-agent family scaffold for Ollama:
- Per-agent `Modelfile.*` templates
- Router CLI (`router/cb01_router.py`) to dispatch requests

## Agent Roster (8)

Current (implemented):
- CB01 (router)
- GABRIEL (orchestrator; voice: Apple Siri "Jamie" Premium)
- OPS_MAE (deployment + infra)
- ARCHIVIST_IVY (OAIS/PREMIS + provenance)
- SENTINEL_RAZOR (security + policy enforcement)
- PRODUCER_NOVA (creative + product)
- ENGR_KEITH (engineering; surgical)
- DREAM (visionary)

## CB01 Routing Matrix

- Keyword-based routing lives in `router/router_config.json`.
- You can force an agent via:
  - `python3 router/cb01_router.py --agent GABRIEL "..."`

## Deployment (Ollama)

Create models:
- `ollama create cb01 -f modelfiles/Modelfile.CB01`
- `ollama create gabriel -f modelfiles/Modelfile.GABRIEL`
- `ollama create ops_mae -f modelfiles/Modelfile.OPS_MAE`
- `ollama create archivist_ivy -f modelfiles/Modelfile.ARCHIVIST_IVY`
- `ollama create sentinel_razor -f modelfiles/Modelfile.SENTINEL_RAZOR`
- `ollama create producer_nova -f modelfiles/Modelfile.PRODUCER_NOVA`
- `ollama create engr_keith -f modelfiles/Modelfile.ENGR_KEITH`
- `ollama create dream -f modelfiles/Modelfile.DREAM`

## Modelfiles

Modelfiles live in `modelfiles/`.

## Notes

Add your full HEAVEN-tier prompts by pasting into each Modelfile `SYSTEM` block.
