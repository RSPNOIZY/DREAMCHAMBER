# NOIZY EMPIRE — GITHUB CONSOLIDATION PLAN
# Org: github.com/NOIZY-ai
# Status: READY TO EXECUTE — needs `gh auth login` first

---

## CURRENT STATE

- Org: NOIZY-ai (exists)
- `NOIZY-ai/noizy.ai` — WRONG: fork of H.264 codec — DELETE + RECREATE
- `NOIZY-ai/NOIZYLAB` — EXISTS: private, has remote, 2 commits today
- All other repos: NOT CREATED YET

---

## TARGET STRUCTURE — ONE REPO PER BRAND

| Repo | Brand | What Goes In | Source |
|---|---|---|---|
| `NOIZY-ai/heaven` | Infrastructure | `src/`, `wrangler.toml`, `schema/`, `smoke_test.sh`, `workers/`, `cloudflare-workers/` | ~/NOIZYLAB/ |
| `NOIZY-ai/noizyvox` | NOIZYVOX | `noizyvox/engine/`, `voice-pipeline/`, `voice-bridge-server.js` | ~/NOIZYLAB/ |
| `NOIZY-ai/noizyfish` | NOIZYFISH | `noizyfish/`, `noizy-landing/`, `noisyproof/` | ~/NOIZYLAB/ |
| `NOIZY-ai/noizykidz` | NOIZYKIDZ | Unity/Godot projects (TBD) | TBD |
| `NOIZY-ai/noizylab-healing` | NOIZYLAB | `dreamchamber/`, `dreamchamber-audio-mcp/`, `mcp/` | ~/NOIZYLAB/ |
| `NOIZY-ai/wisdom-project` | WISDOM | Wisdom Project code when built | TBD |
| `NOIZY-ai/myfamily-ai` | myFAMILY | myFamily routes in Heaven + future portal | ~/NOIZYLAB/ |
| `NOIZY-ai/noizybeast` | IDE | `noizybeast/`, `turbo-scripts/` | ~/NOIZYLAB/ |
| `NOIZY-ai/gabriel` | AI Core | `mc96/`, `scripts/gabriel-dispatch.sh`, `mcp/gabriel-mcp/` | ~/NOIZYLAB/ |
| `NOIZY-ai/noir-bureau` | Archive | ARCHIVE 02_CODE/noir-bureau/ | ~/NOIZYLAB/ARCHIVE/ |

---

## EXECUTE SEQUENCE (run after gh auth login)

### Step 0 — Authenticate
```bash
gh auth login
# Choose: GitHub.com → HTTPS → Login with a web browser
# OR: paste a token from github.com/settings/tokens
```

### Step 1 — Fix the broken noizy.ai repo
```bash
# Delete the H.264 fork (requires org admin)
gh repo delete NOIZY-ai/noizy.ai --yes

# Recreate as proper NOIZY landing page repo
gh repo create NOIZY-ai/noizy.ai \
  --private \
  --description "NOIZY.AI — Constitutional Infrastructure for Human Creativity" \
  --clone=false
```

### Step 2 — Create all brand repos
```bash
REPOS=(
  "heaven:Heaven — NOIZY HVS Consent Kernel API (Cloudflare Worker v17.5.0)"
  "noizyvox:NOIZYVOX — Voice Sovereignty Platform (XTTS v2 + consent architecture)"
  "noizyfish:NOIZYFISH — 888-title Music Catalogue (C2PA stamped, 75/25 perpetual)"
  "noizykidz:NOIZYKIDZ — Rhythm Root Island (neurodivergent kids + Unity/Godot)"
  "noizylab-healing:NOIZYLAB — Sonic Healing Platform (binaural protocols + AirPlay)"
  "wisdom-project:Wisdom Project — Elder Voice Preservation (100-year estate protocol)"
  "myfamily-ai:myFamily.AI — Voice Legacy Platform (love in code, consent-native)"
  "noizybeast:noizybeast — VS Code Extension (empire IDE, T1-T10, Gabriel Edge)"
  "gabriel:GABRIEL — AI Orchestration Layer (empire nervous system)"
)

for ENTRY in "${REPOS[@]}"; do
  NAME="${ENTRY%%:*}"
  DESC="${ENTRY#*:}"
  gh repo create "NOIZY-ai/$NAME" --private --description "$DESC" --clone=false
  echo "Created: NOIZY-ai/$NAME"
done
```

### Step 3 — Push NOIZYLAB (main monorepo — already has remote)
```bash
cd ~/NOIZYLAB
git push NOIZY-ai main
```

### Step 4 — Create heaven repo and push
```bash
cd ~/NOIZYLAB
# Heaven is the canonical worker — push src, wrangler, schema, smoke_test
git subtree split --prefix=src -b heaven-branch 2>/dev/null || true
# Simple approach: clone NOIZYLAB, push only heaven files
```

### Step 5 — Push noizybeast as standalone
```bash
cd ~/NOIZYLAB/noizybeast/vscode-extension
git init && git add . && git commit -m "noizybeast v1.0.0 — Gabriel Edge WebSocket, T1-T10 turbo"
gh repo create NOIZY-ai/noizybeast --private --source=. --push
```

---

## CLEAN REPO STRUCTURE (what each repo will have)

### heaven
```
src/index.js          ← Heaven v17.5.0 (1500+ lines, 40 endpoints)
schema/               ← D1 migrations
wrangler.toml         ← Cloudflare config
smoke_test.sh         ← 21 tests
seed.sql
README.md
```

### noizyvox
```
engine/
  noizyvox_server.py  ← FastAPI + XTTS v2
  noizyvox_ui.py      ← Gradio UI
  START_NOIZYVOX.sh
voice-bridge-server.js
voice-pipeline/
README.md
```

### noizyfish
```
librosa-agent/        ← Audio analysis
catalogue-engine/     ← Vault engine
noizy-landing/        ← Landing page worker
README.md
```

### noizybeast
```
vscode-extension/     ← Full compiled extension
turbo-scripts/        ← T1-T10 + system scripts
beast.config.json
README.md
```

### gabriel
```
mc96/                 ← Turbo scripts, diagnostic engine
mcp/gabriel-mcp/      ← Gabriel MCP server
scripts/              ← dispatch scripts
README.md
```
