# NOIZY AUDIO EMPIRE MAP
> Generated: 2026-03-14 | Full drive survey

---

## TOTAL AUDIO FOOTPRINT

| Drive | Folder | Size | Type |
|---|---|---|---|
| 4TBSG | _NOIZYFISH - THE AQUARIUM | **184GB** | Master creative archive |
| 4TBSG | AIFF | 27GB | AIFF library |
| 4TBSG | Nexus_library | 35GB | Nexus synth presets |
| 4TBSG | Ivory | 7.5GB | Ivory piano library |
| 4TBSG | GarageBand | 3.9GB | GarageBand projects |
| MAG 4TB | 02_EastWest | **2.6TB** | EastWest orchestral library |
| MAG 4TB | NOIZYFISH_THE_AQAURIUM | **305GB** | Aquarium copy on MAG |
| MAG 4TB | 01_Drums | 0B | **EMPTY** |
| 4TB Lacie | LIBRARY | 182GB | General library |
| 4TB Lacie | AUDIO HIJACK RECORDINGS | 0B | **EMPTY** |
| 4TB Lacie | EXTREME MUSIC | 0B | **EMPTY** |
| 6TB | Sample_Libraries | 4.3GB | Sample libraries |
| 6TB | Superior_Drummer_TCI | 1.3GB | SD3 content |
| M2 Ultra | ~/Music | 263MB | Logic / SonoBus |
| M2 Ultra | ~/Documents/Pro Tools | 278MB | Pro Tools sessions |

**⚠️ DUPLICATE ALERT:** The Aquarium exists on BOTH 4TBSG (184GB) AND MAG 4TB (305GB)
— Different sizes means they've diverged. Needs dedup check.

---

## THE AQUARIUM — 4TBSG (184GB) — INSIDE

| Folder | Size | Contents |
|---|---|---|
| AUDIO/ | **66GB** | Main audio — largest collection |
| OTHER/ | 61GB | Overflow audio |
| _FISH 2011 DEMO/ | 21GB | 2011 demo materials |
| TO SORT/ | 6.3GB | ⚠️ Unsorted — needs attention |
| _SOUND DESIGN & SFX/ | 6.1GB | Professional SFX library |
| All Things Filmora/ | 3.1G | Video/filmora content |
| ARCHIVES/ | 3.1GB | Archived sessions |
| Fish 2 Post/ | 3.9GB | Post-production |
| TO BE WORKED ON/ | 2.3GB | ⚠️ Unfinished work |
| VISION TV MUSIC MASTER/ | 910MB | Vision TV masters |
| _RSP_VOICE/ | 990MB | RSP voice recordings |
| Sessions/ | 1.5GB | DAW sessions |
| LOGIC PRO X/ | 430MB | Logic sessions |
| HENRIETTA SOUTHAM/ | 1.0GB | Project: Henrietta |
| _FOR GRAINEY PICTURES/ | 617MB | Film project |
| 2017_FUEL_PROMO_PIECE/ | 188MB | Fuel promo |
| 05.audio_only/ | 562MB | Audio-only exports |
| FUEL GE/ | 929MB | Fuel General Electric |
| TIFF ELEMENTS/ | 120MB | TIFF project elements |
| TFF 48KHZ/ | 121MB | TFF masters |
| TO BE CLEANED & MIXED/ | 9.6MB | ⚠️ Unmixed |
| NEEDS Logic Love/ | 0B | ⚠️ Flagged for Logic work |

---

## VOICE — RSP RECORDINGS

| Location | Size | Notes |
|---|---|---|
| 4TBSG / _NOIZYFISH THE AQUARIUM / _RSP_VOICE/ | 990MB | Primary RSP voice archive |
| MAG 4TB / NOIZYFISH_THE_AQAURIUM / (contains RSP) | in 305GB | MAG copy |
| 6TB / NOIZYLAB_AUDIO_ARCHIVE / GABRIEL/ | 46MB | GABRIEL voice synthesis |
| 6TB / NOIZYLAB_AUDIO_ARCHIVE / MC96/ | 158MB | MC96 avatar voice |

---

## SFX — SOUND DESIGN

| Location | Size | Notes |
|---|---|---|
| 4TBSG / THE AQUARIUM / _SOUND DESIGN & SFX/ | **6.1GB** | Professional library — properly named WAVs |
| 4TB Lacie / LIBRARY/ | 182GB | General library (contents unknown) |
| 6TB / Sample_Libraries/ | 4.3GB | Various sample packs |

---

## SAMPLE LIBRARIES

| Library | Location | Size |
|---|---|---|
| Nexus | 4TBSG | 35GB |
| Ivory (piano) | 4TBSG | 7.5GB |
| EastWest Complete | MAG 4TB | **2.6TB** |
| Superior Drummer | 6TB | 1.3GB |
| Garritan | 4TBSG | 19MB |

---

## IMMEDIATE ACTION ITEMS

### 🔴 Critical
1. **Dedup The Aquarium** — 4TBSG (184GB) vs MAG (305GB) are diverged
   - MAG copy is 121GB LARGER — it may have more content
   - Run: `rsync --dry-run -avh --delete /Volumes/MAG\ 4TB/NOIZYFISH_THE_AQAURIUM/ /Volumes/4TBSG/_NOIZYFISH\ -\ THE\ AQUARIUM/`
   - Review before syncing

2. **Empty folders to investigate:**
   - MAG 4TB / 01_Drums (0B) — where did the drums go?
   - 4TB Lacie / AUDIO HIJACK RECORDINGS (0B)
   - 4TB Lacie / EXTREME MUSIC (0B)

### 🟡 Needs Work
3. **TO SORT/ (6.3GB)** — needs to be classified
4. **TO BE WORKED ON/ (2.3GB)** — active or abandoned?
5. **NEEDS Logic Love/ (0B flag)** — what was supposed to go here?
6. **__2025 GROUPED BY ARTIST/ (0B on 4TBSG)** — is this project empty or on a different drive?

### 🟢 Well Organized Already
- `_SOUND DESIGN & SFX/` — professionally named, WAV format ✓
- `_RSP_VOICE/` — dedicated voice folder ✓
- EastWest library on MAG ✓
- Superior Drummer on 6TB ✓

---

## PROPOSED CLEAN STRUCTURE (going forward)

```
_NOIZYFISH - THE AQUARIUM/
├── 01_ORIGINALS/          ← completed, mastered tracks
├── 02_SESSIONS/           ← DAW project files (Logic, Pro Tools)
├── 03_VOICE/              ← all RSP voice recordings
├── 04_SFX/                ← sound design & SFX
├── 05_SAMPLES/            ← sample libraries (stay on drives)
├── 06_DEMOS/              ← work-in-progress / demos
├── 07_CLIENTS/            ← client projects (FUEL, FRANCEBOOKS, etc.)
├── 08_ARCHIVES/           ← legacy material (pre-2015)
└── _TO_SORT/              ← intake zone (review weekly)
```
