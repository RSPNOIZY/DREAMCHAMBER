#!/usr/bin/env bash
# ─── NOIZY Code Scanner — Find Code Files, Group by Project ───────────────────
# Scans all drives for code files, detects duplicate files across projects,
# and groups everything by project (detected by package.json, .git, etc.)
#
# Output: tools/code_scan_report.html
#
# Usage:
#   bash scan_code.sh              — scan all configured roots
#   bash scan_code.sh /some/path   — scan one location
# ──────────────────────────────────────────────────────────────────────────────

SEARCH_ROOTS=(
  "/Users/m2ultra/NOIZYLAB"
  "/Users/m2ultra/swift-library"
  "/Volumes/4TBSG"
  "/Volumes/6TB"
)

if [[ -n "$1" ]]; then
  SEARCH_ROOTS=("$1")
fi

TOOLS_DIR="$(dirname "$0")"
REPORT_HTML="$TOOLS_DIR/code_scan_report.html"
TMPDIR_CODE=$(mktemp -d)
ALL_CODE="$TMPDIR_CODE/all_code.txt"
PROJECT_MAP="$TMPDIR_CODE/projects.txt"
HASH_MAP="$TMPDIR_CODE/code_hashes.txt"

# Code file extensions to scan
CODE_EXTS=( "ts" "tsx" "js" "jsx" "py" "sh" "html" "css" "json" "swift" "go" "rs" "md" )

echo "═══════════════════════════════════════════════"
echo "  NOIZY CODE SCANNER"
echo "═══════════════════════════════════════════════"
echo ""

# ─── BUILD FIND EXPRESSION ────────────────────────────────────────────────────
FIND_EXPR=()
for i in "${!CODE_EXTS[@]}"; do
  if [[ $i -gt 0 ]]; then FIND_EXPR+=("-o"); fi
  FIND_EXPR+=("-iname" "*.${CODE_EXTS[$i]}")
done

# ─── FIND ALL CODE FILES ──────────────────────────────────────────────────────
echo "Step 1/4 — Finding code files..."
for ROOT in "${SEARCH_ROOTS[@]}"; do
  if [[ -d "$ROOT" ]]; then
    find "$ROOT" -type f \( "${FIND_EXPR[@]}" \) \
      ! -path "*/node_modules/*" \
      ! -path "*/.git/*" \
      ! -path "*/out/*" \
      ! -path "*/__pycache__/*" \
      ! -path "*/.venv/*" \
      ! -path "*/dist/*" \
      ! -path "*/build/*" \
      2>/dev/null >> "$ALL_CODE"
  fi
done

TOTAL=$(wc -l < "$ALL_CODE" | tr -d ' ')
echo "  Found $TOTAL code files."
echo ""

# ─── DETECT PROJECTS ─────────────────────────────────────────────────────────
echo "Step 2/4 — Detecting projects..."

# Find all project roots (dirs with package.json, .git, setup.py, Cargo.toml, etc.)
for ROOT in "${SEARCH_ROOTS[@]}"; do
  if [[ -d "$ROOT" ]]; then
    find "$ROOT" -maxdepth 6 -type f \( \
      -name "package.json" -o -name ".git" -o \
      -name "setup.py" -o -name "Cargo.toml" -o \
      -name "go.mod" -o -name "*.xcodeproj" \
    \) ! -path "*/node_modules/*" 2>/dev/null | while read -r MARKER; do
      DIR=$(dirname "$MARKER")
      # Try to get project name
      if [[ -f "$DIR/package.json" ]]; then
        NAME=$(python3 -c "import json,sys; d=json.load(open('$DIR/package.json')); print(d.get('name','unknown'))" 2>/dev/null || basename "$DIR")
      else
        NAME=$(basename "$DIR")
      fi
      echo -e "$DIR\t$NAME"
    done >> "$PROJECT_MAP"
  fi
done

# Deduplicate project map
sort -u "$PROJECT_MAP" > "$TMPDIR_CODE/projects_dedup.txt"
mv "$TMPDIR_CODE/projects_dedup.txt" "$PROJECT_MAP"

PROJECT_COUNT=$(wc -l < "$PROJECT_MAP" | tr -d ' ')
echo "  Found $PROJECT_COUNT projects."
echo ""

# ─── ASSIGN FILES TO PROJECTS ─────────────────────────────────────────────────
# For each code file, find its nearest project root
assign_project() {
  local FILE="$1"
  local BEST_MATCH=""
  local BEST_LEN=0
  while IFS=$'\t' read -r PROJ_DIR PROJ_NAME; do
    if [[ "$FILE" == "$PROJ_DIR"* ]]; then
      LEN=${#PROJ_DIR}
      if (( LEN > BEST_LEN )); then
        BEST_LEN=$LEN
        BEST_MATCH="$PROJ_NAME|$PROJ_DIR"
      fi
    fi
  done < "$PROJECT_MAP"
  echo "${BEST_MATCH:-Ungrouped|/}"
}

# ─── HASH CODE FILES & BUILD REGISTRY ────────────────────────────────────────
echo "Step 3/4 — Hashing and grouping..."

COUNT=0
declare -A EXT_COUNTS
declare -A PROJ_FILE_COUNTS

while IFS= read -r FILE; do
  COUNT=$((COUNT + 1))
  if (( COUNT % 200 == 0 )); then echo "  [$COUNT/$TOTAL]..."; fi

  SIZE=$(stat -f%z "$FILE" 2>/dev/null || echo 0)
  if (( SIZE < 10 )); then continue; fi  # skip empty/tiny files

  EXT="${FILE##*.}"
  EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')

  HASH=$(shasum -a 256 "$FILE" 2>/dev/null | awk '{print $1}')
  PROJ_INFO=$(assign_project "$FILE")

  echo -e "$HASH\t$SIZE\t$EXT_LOWER\t$PROJ_INFO\t$FILE" >> "$HASH_MAP"
done < "$ALL_CODE"

echo "  Done."
echo ""

# ─── FIND DUPLICATE CODE FILES ───────────────────────────────────────────────
echo "Step 4/4 — Finding duplicate code files..."

DUPE_CODE="$TMPDIR_CODE/code_dupes.txt"
sort "$HASH_MAP" | awk -F'\t' '
{
  hash=$1; size=$2; ext=$3; proj=$4; file=$5
  if (hash == prev_hash) {
    group[hash] = group[hash] "|" proj "###" file
    count[hash]++
  } else {
    if (prev_hash != "" && count[prev_hash] > 0) {
      print prev_hash "\t" prev_size "\t" prev_ext "\t" (count[prev_hash]+1) "\t" group[prev_hash]
    }
    prev_hash = hash; prev_size = size; prev_ext = ext
    group[hash] = proj "###" file
    count[hash] = 0
  }
}
END {
  if (prev_hash != "" && count[prev_hash] > 0) {
    print prev_hash "\t" prev_size "\t" prev_ext "\t" (count[prev_hash]+1) "\t" group[prev_hash]
  }
}' > "$DUPE_CODE"

DUPE_GROUPS=$(wc -l < "$DUPE_CODE" | tr -d ' ')
echo "  Found $DUPE_GROUPS groups of duplicate code files."

# ─── BUILD STATS ─────────────────────────────────────────────────────────────
# Extension breakdown
EXT_STATS=$(awk -F'\t' '{print $3}' "$HASH_MAP" | sort | uniq -c | sort -rn | head -20)

# Project file counts
PROJ_STATS=$(awk -F'\t' '{split($4,a,"|"); print a[1]}' "$HASH_MAP" | sort | uniq -c | sort -rn | head -30)

# ─── HTML REPORT ─────────────────────────────────────────────────────────────
cat > "$REPORT_HTML" << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>NOIZY Code Scan — Project Registry</title>
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
.sub{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--amber);opacity:.8}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);margin:32px 48px}
.stat{background:var(--deep);padding:24px 20px;text-align:center}
.stat-n{font-family:var(--serif);font-size:40px;font-weight:300;line-height:1;margin-bottom:6px}
.stat-l{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:0 48px 32px}
.section{margin:0 48px 32px}
.section h2{font-family:var(--serif);font-size:26px;font-weight:300;color:var(--white);margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.card{background:var(--deep);border:1px solid var(--border);padding:20px}
.card h3{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--amber);margin-bottom:12px}
.proj-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03)}
.proj-row:last-child{border:none}
.proj-name{color:var(--white);font-size:11px}
.proj-count{color:var(--amber);font-size:11px;font-weight:500}
.proj-path{font-size:9px;color:var(--dim);margin-top:2px}
.ext-bar{display:flex;align-items:center;gap:8px;padding:4px 0}
.ext-label{width:40px;color:var(--cyan);font-size:10px}
.ext-fill{height:6px;background:var(--cyan);opacity:.6;min-width:2px}
.ext-num{font-size:9px;color:var(--dim)}
input[type=text]{font-family:var(--mono);font-size:11px;background:var(--deep);border:1px solid var(--border);color:var(--text);padding:7px 12px;width:360px;outline:none;margin-bottom:16px}
input::placeholder{color:var(--dim)}
table{width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:48px}
th{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);padding:10px 8px;text-align:left;border-bottom:1px solid var(--border)}
td{padding:8px 8px;border-bottom:1px solid rgba(255,255,255,.03);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
tr:hover td{background:rgba(255,255,255,.02)}
.badge{display:inline-block;padding:2px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase}
.badge-red{background:rgba(244,63,94,.15);color:#f43f5e}
.badge-amber{background:rgba(232,168,50,.15);color:#e8a832}
.badge-cyan{background:rgba(56,180,200,.12);color:#38b4c8}
.badge-violet{background:rgba(139,92,246,.12);color:#8b5cf6}
.path-group{font-size:9px;line-height:1.8}
.path-group .keep{color:var(--green)}
.path-group .dupe{color:var(--red)}
details summary{cursor:pointer;color:var(--amber);list-style:none}
details summary::-webkit-details-marker{display:none}
</style>
</head>
<body>

<header>
  <div class="sub">NOIZY Voice Platform — Codebase Audit</div>
  <h1>Code Scan Report</h1>
  <div style="font-size:11px;color:var(--dim);margin-top:12px">
    Generated $(date "+%Y-%m-%d %H:%M") &nbsp;·&nbsp;
    node_modules / .git / dist excluded &nbsp;·&nbsp;
    Grouped by detected project root
  </div>
</header>

<div class="stats-grid">
  <div class="stat">
    <div class="stat-n" style="color:var(--white)">$TOTAL</div>
    <div class="stat-l">Code Files Found</div>
  </div>
  <div class="stat">
    <div class="stat-n" style="color:var(--cyan)">$PROJECT_COUNT</div>
    <div class="stat-l">Projects Detected</div>
  </div>
  <div class="stat">
    <div class="stat-n" style="color:var(--red)">$DUPE_GROUPS</div>
    <div class="stat-l">Duplicate Code Groups</div>
  </div>
  <div class="stat">
    <div class="stat-n" style="color:var(--amber)">${#CODE_EXTS[@]}</div>
    <div class="stat-l">File Types Scanned</div>
  </div>
</div>

<div class="two-col">
HTMLEOF

# Projects card
echo '<div class="card"><h3>Projects by File Count</h3>' >> "$REPORT_HTML"
MAX_PROJ_FILES=$(echo "$PROJ_STATS" | awk '{print $1}' | sort -rn | head -1)
echo "$PROJ_STATS" | while read -r LINE; do
  COUNT_P=$(echo "$LINE" | awk '{print $1}')
  NAME_P=$(echo "$LINE" | awk '{$1=""; print $0}' | sed 's/^ //')
  echo "<div class='proj-row'><div><div class='proj-name'>$NAME_P</div></div><div class='proj-count'>$COUNT_P files</div></div>" >> "$REPORT_HTML"
done
echo '</div>' >> "$REPORT_HTML"

# Extensions card
echo '<div class="card"><h3>File Types</h3>' >> "$REPORT_HTML"
MAX_EXT=$(echo "$EXT_STATS" | awk '{print $1}' | sort -rn | head -1)
echo "$EXT_STATS" | while read -r LINE; do
  COUNT_E=$(echo "$LINE" | awk '{print $1}')
  EXT_E=$(echo "$LINE" | awk '{print $2}')
  WIDTH=$(echo "scale=0; $COUNT_E * 160 / $MAX_EXT" | bc 2>/dev/null || echo 20)
  echo "<div class='ext-bar'><span class='ext-label'>.$EXT_E</span><div class='ext-fill' style='width:${WIDTH}px'></div><span class='ext-num'>$COUNT_E</span></div>" >> "$REPORT_HTML"
done
echo '</div>' >> "$REPORT_HTML"

cat >> "$REPORT_HTML" << HTMLEOF2
</div>

<!-- PROJECT FILE LISTING -->
<div class="section">
  <h2>Files by Project</h2>
  <input type="text" id="search-proj" placeholder="Search project name or file..."/>
  <table id="proj-table">
  <thead><tr>
    <th style="width:20%">Project</th>
    <th style="width:10%">Type</th>
    <th style="width:10%">Size</th>
    <th style="width:60%">File</th>
  </tr></thead>
  <tbody id="proj-body">
HTMLEOF2

# Project file rows (sorted by project)
sort -t$'\t' -k4 "$HASH_MAP" | while IFS=$'\t' read -r HASH SIZE EXT PROJ_INFO FILE; do
  IFS='|' read -ra PROJ_PARTS <<< "$PROJ_INFO"
  PROJ_NAME="${PROJ_PARTS[0]}"
  SIZE_KB=$(echo "scale=1; $SIZE / 1024" | bc 2>/dev/null || echo "?")

  case "$EXT" in
    ts|tsx) BADGE_CLASS="badge-cyan" ;;
    py|sh)  BADGE_CLASS="badge-amber" ;;
    html|css) BADGE_CLASS="badge-violet" ;;
    *)      BADGE_CLASS="badge-cyan" ;;
  esac

  echo "<tr>
  <td style='color:var(--white)'>$PROJ_NAME</td>
  <td><span class='badge $BADGE_CLASS'>.$EXT</span></td>
  <td style='color:var(--dim)'>${SIZE_KB}K</td>
  <td title='$FILE' style='color:var(--dim)'>$FILE</td>
</tr>" >> "$REPORT_HTML"
done

cat >> "$REPORT_HTML" << HTMLEOF3
  </tbody></table>
</div>

<!-- DUPLICATE CODE FILES -->
<div class="section">
  <h2>Duplicate Code Files</h2>
  <p style="color:var(--dim);font-size:11px;margin-bottom:16px">
    Identical code files found in multiple projects. May indicate copy-paste, shared utilities, or stale copies.
  </p>
  <input type="text" id="search-dupes" placeholder="Search..."/>
  <table id="dupe-table">
  <thead><tr>
    <th style="width:8%">Type</th>
    <th style="width:7%">Copies</th>
    <th style="width:85%">Locations</th>
  </tr></thead>
  <tbody id="dupe-body">
HTMLEOF3

while IFS=$'\t' read -r HASH SIZE EXT COUNT ENTRIES; do
  IFS='|' read -ra ITEMS <<< "$ENTRIES"
  PATH_HTML=""
  FIRST=true
  for ITEM in "${ITEMS[@]}"; do
    IFS='###' read -ra PARTS <<< "$ITEM"
    PROJ="${PARTS[0]}"
    FPATH="${PARTS[1]}"
    FNAME=$(basename "$FPATH")
    if $FIRST; then
      PATH_HTML+="<div class='keep'>✓ $PROJ — $FPATH</div>"
      FIRST=false
    else
      PATH_HTML+="<div class='dupe'>✗ $PROJ — $FPATH</div>"
    fi
  done

  case "$EXT" in
    ts|tsx) BADGE_CLASS="badge-cyan" ;;
    py|sh)  BADGE_CLASS="badge-amber" ;;
    *)      BADGE_CLASS="badge-violet" ;;
  esac

  echo "<tr>
  <td><span class='badge $BADGE_CLASS'>.$EXT</span></td>
  <td><span class='badge badge-red'>${COUNT}x</span></td>
  <td><details><summary>▸ $(basename "$(echo "$ENTRIES" | cut -d'#' -f3)")</summary><div class='path-group'>$PATH_HTML</div></details></td>
</tr>" >> "$REPORT_HTML"
done < "$DUPE_CODE"

cat >> "$REPORT_HTML" << 'HTMLEOF4'
  </tbody></table>
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
liveSearch('search-proj',  'proj-body');
liveSearch('search-dupes', 'dupe-body');
</script>
</body>
</html>
HTMLEOF4

echo ""
echo "═══════════════════════════════════════════════"
echo "  CODE SCAN COMPLETE"
echo "═══════════════════════════════════════════════"
echo "  Total code files : $TOTAL"
echo "  Projects found   : $PROJECT_COUNT"
echo "  Duplicate groups : $DUPE_GROUPS"
echo "═══════════════════════════════════════════════"
echo ""
echo "  Report → $REPORT_HTML"
echo ""

open "$REPORT_HTML" 2>/dev/null
rm -rf "$TMPDIR_CODE"
