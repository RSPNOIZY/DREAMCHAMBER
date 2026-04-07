# NOIZY FISHNET — M2 ULTRA → ONEDRIVE MIGRATION PLAN
> Status: PLAN ONLY — nothing moves until `bash MIGRATION_PLAN.sh` is run
> Rule: NO AUDIO, NO VIDEO. NOIZY.AI + DREAMCHAMBER stays on M2 Ultra.

---

## WHAT STAYS ON M2 ULTRA (Active NOIZY Work)

| Path | Size | Reason |
|---|---|---|
| `~/NOIZYLAB/` | 3.2GB | **DREAMCHAMBER** — primary workspace |
| `~/NOIZY_2026/` | 4KB | Active NOIZY 2026 |
| `~/Documents/NOIZYLAB/` | 10GB | Claude sessions, GABRIEL code |
| `~/Documents/NOIZYVOX_ENGINE/` | 1.9GB | Active NoizyVox scripts + venv |
| `~/Documents/_ZERO_LATENCY_VAULT/` | 7.7MB | NOIZY design/docs vault |
| `~/Music/` | 263MB | Audio — NOT moving (audio rule) |
| `~/Downloads/Installers/` | **36GB** | Too big for OneDrive → stays local or → external |
| `~/.claude/` | — | Claude session data |
| `~/Library/` | 194GB | System/app data — never migrate |

---

## WHAT MOVES TO ONEDRIVE (Documents)

Target: `OneDrive-Personal/NOIZY_MIGRATION_DOCS/`

| Source | Destination | Size |
|---|---|---|
| `~/Documents/NOIZYLAB_TEXT_VAULT/` | `NOIZY_MIGRATION_DOCS/Claude_TextVault/` | 3.5GB |
| `~/Documents/Archives/` | `NOIZY_MIGRATION_DOCS/Archives/` | 73MB |
| `~/Documents/Documents - M2Ultra's Mac Studio/` | `NOIZY_MIGRATION_DOCS/Legacy_M2Ultra/` | 35MB |
| `~/Documents/Documents - RSP_MS/` | `NOIZY_MIGRATION_DOCS/Legacy_RSP_MS/` | 7.1MB |
| `~/Documents/Documents - Fish MacPro/` | `NOIZY_MIGRATION_DOCS/Legacy_FishMacPro/` | 324KB |
| `~/Documents/iZotope/` | `NOIZY_MIGRATION_DOCS/iZotope/` | 1.6MB |
| `~/Documents/NOIZY*.pptx` | `NOIZY_MIGRATION_DOCS/Presentations/` | ~10MB |
| `~/Documents/*.md` (Canadian canons) | `NOIZY_MIGRATION_DOCS/Research/` | small |
| `~/Documents/Dadroit JSON Generator/` | `NOIZY_MIGRATION_DOCS/Tools/` | small |
| `~/Desktop/CLAUDE TODAY/` | `NOIZY_MIGRATION_DOCS/Claude_Today/` | small |
| `~/Desktop/Presentations/` | `NOIZY_MIGRATION_DOCS/Presentations/` | 3MB |
| `~/Desktop/Web Exports/` | `NOIZY_MIGRATION_DOCS/Web_Exports/` | small |
| `~/Downloads/Archives/` | `NOIZY_MIGRATION_DOCS/DL_Archives/` | 919MB |
| `~/Downloads/Code/` | `NOIZY_MIGRATION_DOCS/DL_Code/` | 2.4MB |
| `~/Downloads/Documents/` | `NOIZY_MIGRATION_DOCS/DL_Documents/` | 2.6MB |
| `~/Downloads/Images/` | `NOIZY_MIGRATION_DOCS/DL_Images/` | 9.1MB |
| `~/Projects/` | `NOIZY_MIGRATION_DOCS/Projects/` | 4.2MB |
| `~/WISDOM_001/` | `NOIZY_MIGRATION_DOCS/WISDOM_001/` | 24KB |

**Total moving: ~4.6GB** (excluding 36GB Installers)

---

## AUDIO/VIDEO — DO NOT MIGRATE (already on external drives)

| Type | Location |
|---|---|
| All WAV/AIFF/MP3/FLAC | 4TBSG, 6TB, MAG, Lacie drives |
| All MP4/MOV/AVI | 4TBSG, 6TB drives |
| `~/Music/` (263MB) | Stays on M2 (Logic, SonoBus, Audio Apps) |
| `~/Documents/Pro Tools/` (278MB) | Stays on M2 (Pro Tools session files) |
| `~/Pictures/` | Stays on M2 (iCloud Photos) |

---

## EXCLUDED FILE TYPES (audio/video filter)
```
*.wav *.aiff *.aif *.mp3 *.flac *.ogg *.m4a *.caf *.au *.wma
*.mp4 *.mov *.avi *.mkv *.m4v *.wmv *.flv *.webm *.mts *.mxf
*.ptx *.ptf *.bwf *.nkx *.nki *.nkc *.nkm *.nksf
```

---

## STEP 2: After migration verified — remove from M2

Only delete from M2 Ultra after confirming OneDrive sync is complete.
Run `bash MIGRATION_VERIFY.sh` first.

---

## TO EXECUTE

```bash
# Step 1: Dry run (see what will move, nothing happens)
bash /Users/m2ultra/NOIZYLAB/tools/fishnet_migrate.sh --dry-run

# Step 2: Execute migration (copies to OneDrive, keeps originals)
bash /Users/m2ultra/NOIZYLAB/tools/fishnet_migrate.sh --copy

# Step 3: After verifying OneDrive is synced — remove from M2
bash /Users/m2ultra/NOIZYLAB/tools/fishnet_migrate.sh --clean
```
