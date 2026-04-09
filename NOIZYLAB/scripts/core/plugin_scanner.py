#!/usr/bin/env python3
"""
plugin_scanner.py — catalog every audio plugin across all GOD locations.

Walks 4 source roots:
  - Local user:        ~/Library/Audio/Plug-Ins
  - System-wide:       /Library/Audio/Plug-Ins
  - Fish Music GDrive: ~/Library/CloudStorage/GoogleDrive-rp@fishmusicinc.com/My Drive
  - RSP GDrive:        ~/Library/CloudStorage/GoogleDrive-rsplowman@icloud.com/My Drive

Recognizes 30+ vendor patterns. Counts by (vendor, format, location).
Saves full manifest to ~/NOIZYANTHROPIC/NOIZYLAB/memory/plugin_manifest.json.

Run: python3 plugin_scanner.py [--full]    # --full prints every file path
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from collections import defaultdict
from pathlib import Path

ROOTS = [
    ("local",  Path.home() / "Library" / "Audio" / "Plug-Ins"),
    ("system", Path("/Library/Audio/Plug-Ins")),
    ("fish",   Path.home() / "Library/CloudStorage/GoogleDrive-rp@fishmusicinc.com/My Drive"),
    ("rsp",    Path.home() / "Library/CloudStorage/GoogleDrive-rsplowman@icloud.com/My Drive"),
]

# Plugin file extensions
EXTS = (".component", ".vst3", ".vst", ".aaxplugin", ".dpm", ".bundle")

# Vendor pattern map — order matters; first match wins
VENDORS = [
    ("iZotope",          r"iZ|Ozone|Nectar|Neutron|^RX[\s_]?[0-9]|Stutter Edit|Mobius Filter|Meter Tap|Insight|Tonal Balance|VocalSynth|^Trash|Vinyl|^Phoenixverse|Iris|Breaktweaker"),
    ("Waves",            r"^Waves|^WaveShell|WUP|^Abbey|^H-(Reverb|Delay|EQ|Comp)|^API |^SSL |^CLA |^V-(Comp|EQ)|^J37|^Kramer|^Magma|^Maxx|^Mercury|^MV-?[0-9]|^NS1|^Q[0-9]|^R[0-9]|^S1 |^Smack|^Sub Align|^TG12|^Vitamin|^Vocal Rider|^X-(Click|Crackle|Hum|Noise)|^Brauer|^Aphex|Renaissance"),
    ("Universal Audio",  r"^UAD|^Apollo|^Luna|Universal Audio|Manley|Lexicon|Pultec|^1176|^LA-?2A|^Studer|Capitol|^Neve(?!\s*Marbella)|^Helios"),
    ("Native Instruments", r"^Komplete|^Kontakt|^Massive|^FM8|^Battery|^Reaktor|^Maschine|^Guitar Rig|^Absynth|^Razor|^Replika|^The Mouth|^Solid|^Driver|^Polyplex|^Choral|Native Instruments"),
    ("FabFilter",        r"^FabFilter|^Pro-Q|^Pro-C|^Pro-L|^Pro-R|^Pro-G|^Pro-MB|^Pro-DS|^Saturn|^Twin\s*[23]|^Volcano|^Timeless|^MicroPitch|^One"),
    ("Soundtoys",        r"^Decapitator|^Echo[Bb]oy|^Crystallizer|^Devil-?Loc|^FilterFreak|^MicroShift|^PhaseMistress|^PrimalTap|^Radiator|^SieQ|^Tremolator|^Soundtoys|^Little|^Sie-Q"),
    ("Plugin Alliance",  r"^bx_|^Brainworx|^Maag|^elysia|^SPL |^Vertigo|^Lindell|^Shadow Hills|^Mäag|^Black Box|^Dangerous|^Knif|^NEOLD|^Purple|^Spectre|^Vinylator"),
    ("Slate Digital",    r"^Slate|^VBC|^FG-(?:[A-Z]|[0-9])|^Virtual (?:Mix|Tape|Buss|Tube|Console)"),
    ("Eventide",         r"^Eventide|^H910|^H949|^H3000|^Black ?hole|^MangledVerb|^Quadravox|^Tverb|^UltraReverb|^Octavox|^EChannel|^Omnipressor"),
    ("Sonnox",           r"^Sonnox|^Oxford"),
    ("Spectrasonics",    r"^Omnisphere|^Trilian|^Stylus|Spectrasonics"),
    ("Arturia",          r"^Mini ?V|^Stage-?73|^Vocoder V|^B-3 V|^DX7 V|^Wurli V|^Piano V|^CMI V|^Buchla|^Synclavier|^Prophet|^ARP|^Jup-?8|^V Collection|Arturia"),
    ("UVI",              r"^UVI|UVI Workstation|Falcon"),
    ("XLN Audio",        r"^Addictive|XLN|^RC-20|^DS-10"),
    ("Output",           r"^Output |^Arcade|^Movement|^Portal|^Thermal|^Analog Brass"),
    ("Audio Damage",     r"Audio Damage|^Replicant|^Phosphor|^Eos|^Dub Jr"),
    ("Valhalla DSP",     r"^Valhalla(Vintage|Room|Plate|Shimmer|Delay|Freq|Supermassive)"),
    ("u-he",             r"^Diva|^Repro|^Hive|^Bazille|^Zebra|^ACE|^Tyrell|^Podolski|^Filterscape|^Twangström|^Satin|^Presswerk|^Uhbik|u-he"),
    ("KORG",             r"^Triton|^M1 (?:Le|Software)|^MS-20|^Mono\\?Poly|^Polysix|^WaveStation|KORG"),
    ("Spitfire Audio",   r"^Spitfire|BBC Symphony|LABS|Originals"),
    ("EastWest",         r"^EastWest|^Hollywood|^Quantum|^Composer Cloud|^Play"),
    ("Toontrack",        r"^Superior Drummer|^EZdrummer|^EZmix|^EZkeys|^EZbass|Toontrack"),
    ("ROLI",             r"^ROLI|^Equator|^Strobe|Cypher2"),
    ("LiquidSonics",     r"^Cinematic Rooms|^Reverberate|^Seventh Heaven|LiquidSonics"),
    ("Klanghelm",        r"^DC[0-9]|^IVGI|^MJUC|^SDRR|^TheDrop|Klanghelm"),
    ("Audiomodern",      r"Audiomodern|^Riffer|^Chordjam|^Atom|^Playbeat"),
    ("ToneBoosters",     r"^TB |^ToneBoosters"),
    ("Tokyo Dawn",       r"^TDR |Tokyo Dawn|^Slick|^Kotelnikov|^Nova|^Molotok|^Proximity"),
    ("Goodhertz",        r"^Goodhertz|^Vulf|^Trem Control|^CanOpener|^Lossy"),
    ("Newfangled",       r"^Newfangled|^Saturate|^Punctuate|^EQuivocate|^Elevate|^Generate"),
    ("Boz Digital",      r"^Boz|+10|^Hoser|^Mongoose|^Manic|^Pan|^The Wall"),
    ("IK Multimedia",    r"^TR[0-9]|^T-RackS|^AmpliTube|^SampleTank|^Modo|^MixBox|^Lurssen|^Hammond|IK Multimedia|^Saturator X"),
    ("Apple",            r"^Apple |^AU |^Logic |^GarageBand|^Match EQ|^Adaptive|^DLSMusicDevice"),
]


def vendor_of(name: str) -> str:
    for vendor, pat in VENDORS:
        if re.search(pat, name, re.IGNORECASE):
            return vendor
    return "Other"


def fmt_of(path: Path) -> str:
    s = path.suffix.lower()
    return {
        ".component": "AU",
        ".vst3": "VST3",
        ".vst": "VST",
        ".aaxplugin": "AAX",
        ".dpm": "DPM",
        ".bundle": "Bundle",
    }.get(s, "?")


def scan_root(label: str, root: Path) -> dict:
    if not root.exists():
        return {"label": label, "root": str(root), "exists": False, "files": []}
    files = []
    t0 = time.time()
    try:
        for ext in EXTS:
            for p in root.rglob(f"*{ext}"):
                # Skip macOS resource forks and bundle internals
                if "/Contents/" in str(p) or p.name.startswith("._"):
                    continue
                try:
                    files.append({
                        "name": p.stem,
                        "fmt": fmt_of(p),
                        "vendor": vendor_of(p.stem),
                        "path": str(p),
                    })
                except Exception:
                    continue
    except (PermissionError, OSError):
        pass
    return {
        "label": label,
        "root": str(root),
        "exists": True,
        "elapsed_s": round(time.time() - t0, 1),
        "count": len(files),
        "files": files,
    }


def summarize(scans: list[dict]) -> dict:
    by_vendor = defaultdict(int)
    by_format = defaultdict(int)
    by_location = defaultdict(int)
    by_vendor_format = defaultdict(int)
    total = 0
    for s in scans:
        if not s.get("exists"):
            continue
        for f in s["files"]:
            total += 1
            by_vendor[f["vendor"]] += 1
            by_format[f["fmt"]] += 1
            by_location[s["label"]] += 1
            by_vendor_format[f"{f['vendor']}|{f['fmt']}"] += 1
    return {
        "total": total,
        "by_vendor": dict(sorted(by_vendor.items(), key=lambda x: -x[1])),
        "by_format": dict(sorted(by_format.items(), key=lambda x: -x[1])),
        "by_location": dict(by_location),
        "by_vendor_format": dict(sorted(by_vendor_format.items(), key=lambda x: -x[1])),
    }


def main() -> None:
    print("⚡ scanning all 4 plugin roots...", file=sys.stderr)
    scans = []
    for label, root in ROOTS:
        print(f"  → {label}: {root}", file=sys.stderr)
        scans.append(scan_root(label, root))
    summary = summarize(scans)

    out = {
        "scanned_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "roots": [{"label": s["label"], "root": s["root"], "exists": s["exists"],
                   "count": s.get("count", 0), "elapsed_s": s.get("elapsed_s", 0)}
                  for s in scans],
        "summary": summary,
    }

    # Save full manifest
    out_path = Path.home() / "NOIZYANTHROPIC" / "NOIZYLAB" / "memory" / "plugin_manifest.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    full = dict(out)
    full["all_files"] = [f for s in scans for f in s.get("files", [])]
    with open(out_path, "w") as f:
        json.dump(full, f, indent=2)

    # Print summary
    print("\n══════════════════════════════════════════════════════", file=sys.stderr)
    print(f"  TOTAL: {summary['total']:,} plugin files", file=sys.stderr)
    print("══════════════════════════════════════════════════════", file=sys.stderr)
    print("\nBY LOCATION:", file=sys.stderr)
    for loc, n in summary["by_location"].items():
        print(f"  {n:6,}  {loc}", file=sys.stderr)
    print("\nBY FORMAT:", file=sys.stderr)
    for fmt, n in summary["by_format"].items():
        print(f"  {n:6,}  {fmt}", file=sys.stderr)
    print("\nBY VENDOR (top 25):", file=sys.stderr)
    for vendor, n in list(summary["by_vendor"].items())[:25]:
        print(f"  {n:6,}  {vendor}", file=sys.stderr)
    print(f"\n→ full manifest saved: {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
