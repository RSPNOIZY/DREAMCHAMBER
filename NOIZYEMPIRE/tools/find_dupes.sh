#!/usr/bin/env bash
# ─── NOIZY Duplicate Audio Finder ─────────────────────────────────────────────
# Scans all drives for audio files, finds exact duplicates (SHA-256 hash match)
# and filename duplicates (same name, different location).
#
# Output:
#   tools/dupes_exact.tsv      — identical files (byte-for-byte)
#   tools/dupes_filename.tsv   — same filename, different paths
#   tools/dupes_report.html    — interactive report
#
# Usage:
#   bash find_dupes.sh              — scan all configured roots
#   bash find_dupes.sh /Volumes/X   — scan one location
# ──────────────────────────────────────────────────────────────────────────────

SEARCH_ROOTS=(
  "/Users/m2ultra/NOIZYLAB"
  "/Volumes/4TBSG"
  "/Volumes/6TB"
)

if [[ -n "$1" ]]; then
  SEARCH_ROOTS=("$1")
fi

TOOLS_DIR="$(dirname "$0")"
EXACT_TSV="$TOOLS_DIR/dupes_exact.tsv"
NAME_TSV="$TOOLS_DIR/dupes_filename.tsv"
REPORT_HTML="$TOOLS_DIR/dupes_report.html"
TMPDIR_DUPES=$(mktemp -d)
ALL_FILES="$TMPDIR_DUPES/all_files.txt"
HASH_FILE="$TMPDIR_DUPES/hashes.txt"

echo "═══════════════════════════════════════════════"
echo "  NOIZY DUPLICATE SCANNER"
echo "═══════════════════════════════════════════════"
echo ""
echo "Searching:"
for R in "${SEARCH_ROOTS[@]}"; do echo "  $R"; done
echo ""

# ─── FIND ALL AUDIO FILES ─────────────────────────────────────────────────────
echo "Step 1/4 — Finding audio files..."
for ROOT in "${SEARCH_ROOTS[@]}"; do
  if [[ -d "$ROOT" ]]; then
    find "$ROOT" -type f \( \
      -iname "*.wav" -o -iname "*.mp3" -o -iname "*.aiff" -o \
      -iname "*.aif" -o -iname "*.flac" -o -iname "*.m4a" -o \
      -iname "*.ogg" -o -iname "*.aac" \
    \) 2>/dev/null >> "$ALL_FILES"
  fi
done

TOTAL=$(wc -l < "$ALL_FILES" | tr -d ' ')
echo "  Found $TOTAL audio files."
echo ""

# ─── SHA-256 HASH EVERY FILE ──────────────────────────────────────────────────
echo "Step 2/4 — Hashing files (this takes a while on large drives)..."
COUNT=0
while IFS= read -r FILE; do
  COUNT=$((COUNT + 1))
  if (( COUNT % 100 == 0 )); then
    echo "  [$COUNT/$TOTAL] hashing..."
  fi
  # Get file size first — skip empty files
  SIZE=$(stat -f%z "$FILE" 2>/dev/null || echo 0)
  if (( SIZE < 1024 )); then continue; fi

  HASH=$(shasum -a 256 "$FILE" 2>/dev/null | awk '{print $1}')
  if [[ -n "$HASH" ]]; then
    echo -e "$HASH\t$SIZE\t$FILE" >> "$HASH_FILE"
  fi
done < "$ALL_FILES"

echo "  Hashing complete."
echo ""

# ─── FIND EXACT DUPLICATES (same hash) ────────────────────────────────────────
echo "Step 3/4 — Finding exact duplicates..."

echo -e "HASH\tSIZE_BYTES\tFILE_COUNT\tFILES" > "$EXACT_TSV"

sort "$HASH_FILE" | awk -F'\t' '
{
  hash=$1; size=$2; file=$3
  if (hash == prev_hash) {
    group[hash] = group[hash] "|" file
    count[hash]++
  } else {
    if (prev_hash != "" && count[prev_hash] > 0) {
      print prev_hash "\t" prev_size "\t" (count[prev_hash]+1) "\t" group[prev_hash]
    }
    prev_hash = hash
    prev_size = size
    group[hash] = file
    count[hash] = 0
  }
}
END {
  if (prev_hash != "" && count[prev_hash] > 0) {
    print prev_hash "\t" prev_size "\t" (count[prev_hash]+1) "\t" group[prev_hash]
  }
}' >> "$EXACT_TSV"

EXACT_GROUPS=$(tail -n +2 "$EXACT_TSV" | wc -l | tr -d ' ')
EXACT_WASTE=$(tail -n +2 "$EXACT_TSV" | awk -F'\t' '{
  split($4, files, "|")
  n = $3 - 1  # dupes beyond the first
  waste += n * $2
} END {printf "%.2f", waste/1073741824}')

echo "  Found $EXACT_GROUPS groups of exact duplicates."
echo "  Recoverable space: ~${EXACT_WASTE} GB"
echo ""

# ─── FIND FILENAME DUPLICATES (same name, different path) ─────────────────────
echo "Step 4/4 — Finding filename duplicates..."

echo -e "FILENAME\tCOUNT\tPATHS" > "$NAME_TSV"

awk -F'\t' '{print $3}' "$HASH_FILE" | \
  awk -F'/' '{print $NF}' | sort | uniq -d > "$TMPDIR_DUPES/dupe_names.txt"

NAME_COUNT=$(wc -l < "$TMPDIR_DUPES/dupe_names.txt" | tr -d ' ')

while IFS= read -r NAME; do
  PATHS=$(grep "/$NAME$" "$ALL_FILES" | tr '\n' '|' | sed 's/|$//')
  COUNT=$(grep -c "/$NAME$" "$ALL_FILES" 2>/dev/null || echo 0)
  echo -e "$NAME\t$COUNT\t$PATHS" >> "$NAME_TSV"
done < "$TMPDIR_DUPES/dupe_names.txt"

echo "  Found $NAME_COUNT filename duplicates."
echo ""

# ─── BUILD HTML REPORT ────────────────────────────────────────────────────────
echo "Generating report..."

cat > "$REPORT_HTML" << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>NOIZY Duplicate Scanner Report</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --void:#03040a;--deep:#070b12;--panel:#111827;
  --amber:#e8a832;--cyan:#38b4c8;--green:#34d399;
  --red:#f43f5e;--yellow:#fbbf24;--violet:#8b5cf6;
  --text:#c8cdd8;--dim:#5a6070;--white:#eef0f4;
  --border:rgba(255,255,255,0.07);
  --mono:'IBM Plex Mono',monospace;--serif:'Cormorant Garamond',serif;
}
body{background:var(--void);color:var(--text);font-family:var(--mono);font-size:12px;line-height:1.6}
header{padding:48px 48px 32px;border-bottom:1px solid var(--border)}
header h1{font-family:var(--serif);font-size:42px;font-weight:300;color:var(--white);margin-bottom:8px}
.sub{font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:var(--amber);opacity:.8}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);margin:32px 48px}
.stat{background:var(--deep);padding:24px 20px;text-align:center}
.stat-n{font-family:var(--serif);font-size:40px;font-weight:300;line-height:1;margin-bottom:6px}
.stat-l{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
.section{margin:32px 48px}
.section h2{font-family:var(--serif);font-size:26px;font-weight:300;color:var(--white);margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.controls{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
input[type=text]{font-family:var(--mono);font-size:11px;background:var(--deep);border:1px solid var(--border);color:var(--text);padding:7px 12px;width:360px;outline:none}
input::placeholder{color:var(--dim)}
table{width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:48px}
th{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);padding:10px 8px;text-align:left;border-bottom:1px solid var(--border);cursor:pointer}
th:hover{color:var(--amber)}
td{padding:8px 8px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
tr:hover td{background:rgba(255,255,255,0.02)}
.badge{display:inline-block;padding:2px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase}
.badge-red{background:rgba(244,63,94,.15);color:#f43f5e}
.badge-yellow{background:rgba(251,191,36,.1);color:#fbbf24}
.badge-green{background:rgba(52,211,153,.12);color:#34d399}
.path-list{font-size:9px;color:var(--dim);line-height:1.8}
.path-list span{display:block;padding:1px 0}
.path-list span:first-child{color:var(--green)}
.path-list span:not(:first-child){color:var(--red)}
.path-label{font-size:8px;letter-spacing:.1em;text-transform:uppercase;margin-right:4px}
.keep{color:var(--green)}
.delete{color:var(--red)}
.expandable{cursor:pointer}
.expandable:hover td{background:rgba(232,168,50,0.04)!important}
details summary{cursor:pointer;color:var(--amber);font-size:10px;list-style:none}
details summary::-webkit-details-marker{display:none}
details[open] summary{margin-bottom:6px}
</style>
</head>
<body>

<header>
  <div class="sub">NOIZY Voice Platform — Storage Audit</div>
  <h1>Duplicate File Report</h1>
  <div style="font-size:11px;color:var(--dim);margin-top:12px">
    Generated $(date "+%Y-%m-%d %H:%M") &nbsp;·&nbsp;
    SHA-256 exact match + filename collision detection
  </div>
</header>

<div class="stats-grid">
  <div class="stat">
    <div class="stat-n" style="color:var(--white)">$TOTAL</div>
    <div class="stat-l">Total Files Scanned</div>
  </div>
  <div class="stat">
    <div class="stat-n" style="color:var(--red)">$EXACT_GROUPS</div>
    <div class="stat-l">Exact Dupe Groups</div>
  </div>
  <div class="stat">
    <div class="stat-n" style="color:var(--yellow)">$NAME_COUNT</div>
    <div class="stat-l">Filename Collisions</div>
  </div>
  <div class="stat">
    <div class="stat-n" style="color:var(--green)">~${EXACT_WASTE} GB</div>
    <div class="stat-l">Recoverable Space</div>
  </div>
</div>

<!-- EXACT DUPLICATES -->
<div class="section">
  <h2>Exact Duplicates — Byte-for-Byte Identical</h2>
  <p style="color:var(--dim);font-size:11px;margin-bottom:16px">
    These files have identical SHA-256 hashes. Safe to delete all but one copy.
    <strong style="color:var(--green)">Green = keep (largest drive / best path). Red = delete.</strong>
  </p>
  <div class="controls">
    <input type="text" id="search-exact" placeholder="Search filename or path..."/>
  </div>
  <table id="exact-table">
  <thead><tr>
    <th style="width:8%">Size</th>
    <th style="width:7%">Copies</th>
    <th style="width:85%">Files (green=keep, red=delete)</th>
  </tr></thead>
  <tbody id="exact-body">
HTMLEOF

# Exact dupes rows
tail -n +2 "$EXACT_TSV" | while IFS=$'\t' read -r HASH SIZE COUNT FILES; do
  SIZE_MB=$(echo "scale=2; $SIZE / 1048576" | bc 2>/dev/null || echo "?")
  WASTE_MB=$(echo "scale=2; ($COUNT - 1) * $SIZE / 1048576" | bc 2>/dev/null || echo "?")

  IFS='|' read -ra PATHS <<< "$FILES"

  # Build path list HTML — first path = keep (on 4TBSG preferred), rest = delete
  # Sort: prefer 4TBSG, then 6TB, then local
  KEEP_PATH="${PATHS[0]}"
  for P in "${PATHS[@]}"; do
    if [[ "$P" == /Volumes/4TBSG* ]]; then KEEP_PATH="$P"; break; fi
  done

  PATH_HTML=""
  for P in "${PATHS[@]}"; do
    if [[ "$P" == "$KEEP_PATH" ]]; then
      PATH_HTML+="<span class='keep'>✓ KEEP &nbsp; $P</span>"
    else
      PATH_HTML+="<span class='delete'>✗ DELETE $P</span>"
    fi
  done

  echo "<tr>
  <td>${SIZE_MB} MB<br/><span style='color:var(--red);font-size:9px'>-${WASTE_MB} MB waste</span></td>
  <td><span class='badge badge-red'>${COUNT}x</span></td>
  <td><details><summary>▸ $(basename "${PATHS[0]}") (${COUNT} copies)</summary><div class='path-list'>${PATH_HTML}</div></details></td>
</tr>" >> "$REPORT_HTML"
done

cat >> "$REPORT_HTML" << HTMLEOF2
  </tbody>
  </table>
</div>

<!-- FILENAME DUPLICATES -->
<div class="section">
  <h2>Filename Collisions — Same Name, Different Locations</h2>
  <p style="color:var(--dim);font-size:11px;margin-bottom:16px">
    Same filename found in multiple locations. May or may not be identical content — verify before deleting.
  </p>
  <div class="controls">
    <input type="text" id="search-name" placeholder="Search filename..."/>
  </div>
  <table id="name-table">
  <thead><tr>
    <th style="width:30%">Filename</th>
    <th style="width:7%">Count</th>
    <th style="width:63%">Locations</th>
  </tr></thead>
  <tbody id="name-body">
HTMLEOF2

tail -n +2 "$NAME_TSV" | while IFS=$'\t' read -r NAME COUNT PATHS; do
  IFS='|' read -ra PLIST <<< "$PATHS"
  PATH_HTML=""
  for P in "${PLIST[@]}"; do
    PATH_HTML+="<span>$P</span>"
  done
  echo "<tr>
  <td style='color:var(--white)'>$NAME</td>
  <td><span class='badge badge-yellow'>${COUNT}x</span></td>
  <td><div class='path-list'>$PATH_HTML</div></td>
</tr>" >> "$REPORT_HTML"
done

cat >> "$REPORT_HTML" << 'HTMLEOF3'
  </tbody>
  </table>
</div>

<script>
function liveSearch(inputId, tbodyId) {
  document.getElementById(inputId).addEventListener('input', function() {
    const q = this.value.toLowerCase();
    document.querySelectorAll('#' + tbodyId + ' tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}
liveSearch('search-exact', 'exact-body');
liveSearch('search-name',  'name-body');
</script>
</body>
</html>
HTMLEOF3

# ─── SUMMARY ──────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════"
echo "  SCAN COMPLETE"
echo "═══════════════════════════════════════════════"
echo "  Total files scanned    : $TOTAL"
echo "  Exact dupe groups      : $EXACT_GROUPS"
echo "  Filename collisions    : $NAME_COUNT"
echo "  Recoverable space      : ~${EXACT_WASTE} GB"
echo "═══════════════════════════════════════════════"
echo ""
echo "  Report → $REPORT_HTML"
echo ""

open "$REPORT_HTML" 2>/dev/null
rm -rf "$TMPDIR_DUPES"
