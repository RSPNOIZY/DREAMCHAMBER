# CONFIRMED DUPES — Separated 2026-03-30

## DUPE #1 — NOIZYVOX Engine
| Location | Status |
|---|---|
| `/Volumes/4TB FISH SG/M2Ultra_Data/scripts/` | DUPE — identical to ARCHIVE |
| `ARCHIVE/2026-03-28_GOLD_SCAN/02_CODE/noizyvox-engine/` | DUPE — source of truth |
| `noizyvox/engine/` | ✅ CANONICAL — adopted here |

Files: `noizyvox_server.py`, `noizyvox_ui.py`, `download_models.py`, `START_NOIZYVOX.sh`
Both Fish SG and ARCHIVE copies are byte-for-byte identical.
Safe to ignore Fish SG copy. ARCHIVE copy can be retired once noizyvox/engine is live.

## DUPE #2 — noir-bureau frontend
| Location | Status |
|---|---|
| `MAG/NOIZYFISH_THE_AQAURIUM/.../noir-bureau-frontend/` | DUPE — node_modules only, no src |
| `ARCHIVE/.../02_CODE/noir-bureau/frontend/` | MORE COMPLETE — has generated + backend-src |

MAG copy has nothing unique. ARCHIVE is the better version.
Canonical: `ARCHIVE/2026-03-28_GOLD_SCAN/02_CODE/noir-bureau/`

## NOT DUPES — True Orphans Now Adopted
| File | From | To |
|---|---|---|
| `librosa_agent/` (4 files) | MAG | `noizyfish/librosa-agent/` ✅ |
| `noizy_vault_engine.py` | MAG | `noizyfish/catalogue-engine/` ✅ |
| `turbo_gabriel_omega.py` | MAG | `mc96/` ✅ |
