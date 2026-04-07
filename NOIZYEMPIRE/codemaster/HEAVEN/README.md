# HEAVEN Bundle

## Quick start

### 1) Create Ollama models from Modelfiles

From this folder:

- `ollama create cb01 -f modelfiles/Modelfile.CB01`
- `ollama create gabriel -f modelfiles/Modelfile.GABRIEL`
- `ollama create ops_mae -f modelfiles/Modelfile.OPS_MAE`
- `ollama create archivist_ivy -f modelfiles/Modelfile.ARCHIVIST_IVY`
- `ollama create sentinel_razor -f modelfiles/Modelfile.SENTINEL_RAZOR`
- `ollama create producer_nova -f modelfiles/Modelfile.PRODUCER_NOVA`
- `ollama create engr_keith -f modelfiles/Modelfile.ENGR_KEITH`
- `ollama create dream -f modelfiles/Modelfile.DREAM`

### 2) Route locally

- Dry run:
  - `python3 router/cb01_router.py --dry-run "paste your request"`
- Run routed agent:
  - `python3 router/cb01_router.py "paste your request"`

### 3) Integration wrapper

- `./integration/heaven.sh "paste your request"`

## Files

- `HEAVEN_TIER_AI_FAMILY.md` master doc scaffold
- `modelfiles/` per-agent templates
- `router/` local router CLI
- `integration/` helper scripts
