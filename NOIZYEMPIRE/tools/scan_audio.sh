#!/usr/bin/env bash
# ─── NOIZY Audio Scanner & Dynamic Range Guide ────────────────────────────────
# Finds all audio files across your system and grades their dynamic range
# using ffmpeg's loudnorm filter (EBU R128 analysis)
#
# Output: /Users/m2ultra/NOIZYLAB/tools/audio_scan_report.tsv
#         /Users/m2ultra/NOIZYLAB/tools/audio_scan_report.html
#
# Usage: bash scan_audio.sh [optional_path]
# ─────────────────────────────────────────────────────────────────────────────

SEARCH_ROOTS=(
  "/Users/m2ultra/NOIZYLAB"
  "/Users/m2ultra/Desktop"
  "/Users/m2ultra/Documents"
  "/Users/m2ultra/Downloads"
  "/Users/m2ultra/Music"
  "/Volumes/4TBSG"
  "/Volumes/6TB"
)

# Override with argument if provided
if [[ -n "$1" ]]; then
  SEARCH_ROOTS=("$1")
fi

REPORT_TSV="$(dirname "$0")/audio_scan_report.tsv"
REPORT_HTML="$(dirname "$0")/audio_scan_report.html"
TMPDIR_SCAN=$(mktemp -d)

echo "Starting NOIZY Audio Scanner..."
echo "Searching: ${SEARCH_ROOTS[*]}"
echo ""

# ─── FIND ALL AUDIO FILES ────────────────────────────────────────────────────
FILE_LIST="$TMPDIR_SCAN/files.txt"
for ROOT in "${SEARCH_ROOTS[@]}"; do
  if [[ -d "$ROOT" ]]; then
    find "$ROOT" -type f \( \
      -iname "*.wav" -o -iname "*.mp3" -o -iname "*.aiff" -o \
      -iname "*.aif" -o -iname "*.flac" -o -iname "*.m4a" -o \
      -iname "*.ogg" -o -iname "*.aac" \
    \) 2>/dev/null >> "$FILE_LIST"
  fi
done

TOTAL=$(wc -l < "$FILE_LIST" | tr -d ' ')
echo "Found $TOTAL audio files."
echo ""

# ─── ANALYSIS ────────────────────────────────────────────────────────────────
# TSV header
echo -e "FILE\tSIZE_MB\tDURATION_S\tSAMPLE_RATE\tCHANNELS\tLUFS_I\tLUFS_LRA\tLUFS_TP\tDR_GRADE\tVAULT_READY" > "$REPORT_TSV"

COUNT=0
while IFS= read -r FILE; do
  COUNT=$((COUNT + 1))

  # Progress every 25 files
  if (( COUNT % 25 == 0 )); then
    echo "  [$COUNT/$TOTAL] scanning..."
  fi

  # File size in MB
  SIZE_BYTES=$(stat -f%z "$FILE" 2>/dev/null || echo 0)
  SIZE_MB=$(echo "scale=2; $SIZE_BYTES / 1048576" | bc 2>/dev/null || echo "?")

  # ffprobe: duration, sample rate, channels
  PROBE=$(ffprobe -v error -select_streams a:0 \
    -show_entries stream=duration,sample_rate,channels \
    -of default=noprint_wrappers=1:nokey=1 \
    "$FILE" 2>/dev/null)

  DURATION=$(echo "$PROBE" | sed -n '1p' | awk '{printf "%.1f", $1}' 2>/dev/null || echo "?")
  SAMPLE_RATE=$(echo "$PROBE" | sed -n '2p' || echo "?")
  CHANNELS=$(echo "$PROBE" | sed -n '3p' || echo "?")

  # Skip very short files (< 1s) and very large (> 1GB, probably not voice)
  if [[ "$DURATION" =~ ^[0-9] ]] && (( $(echo "$DURATION < 1" | bc -l 2>/dev/null || echo 1) )); then
    continue
  fi
  if (( $(echo "$SIZE_MB > 1000" | bc -l 2>/dev/null || echo 0) )); then
    continue
  fi

  # EBU R128 loudness analysis via ffmpeg
  LOUDNESS=$(ffmpeg -i "$FILE" -af loudnorm=print_format=summary -f null - 2>&1 | \
    grep -E "Input Integrated|Input LRA|Input True Peak" | \
    awk -F: '{print $2}' | tr -d ' ' | tr '\n' '\t' 2>/dev/null)

  LUFS_I=$(echo "$LOUDNESS" | cut -f1)
  LUFS_LRA=$(echo "$LOUDNESS" | cut -f2)
  LUFS_TP=$(echo "$LOUDNESS" | cut -f3)

  # ─── DYNAMIC RANGE GRADE ─────────────────────────────────────────────────
  # Grade based on LRA (Loudness Range) — higher = more dynamic range
  # Voice acting targets: LRA 6-14 LU is ideal
  # LRA < 3  = over-compressed / brick-walled = D
  # LRA 3-6  = highly compressed (typical commercial) = C
  # LRA 6-10 = good voice range (broadcast ready) = B
  # LRA 10-14 = excellent dynamic expression = A
  # LRA > 14 = very wide range (may need mastering) = A+

  DR_GRADE="?"
  VAULT_READY="?"

  if [[ "$LUFS_LRA" =~ ^[0-9] ]] || [[ "$LUFS_LRA" =~ ^-[0-9] ]]; then
    LRA_VAL=$(echo "$LUFS_LRA" | tr -d 'LU ' | awk '{printf "%.1f", $1}')
    if (( $(echo "$LRA_VAL >= 14" | bc -l) )); then
      DR_GRADE="A+"
      VAULT_READY="YES — GOLD"
    elif (( $(echo "$LRA_VAL >= 10" | bc -l) )); then
      DR_GRADE="A"
      VAULT_READY="YES — EXCELLENT"
    elif (( $(echo "$LRA_VAL >= 6" | bc -l) )); then
      DR_GRADE="B"
      VAULT_READY="YES — BROADCAST READY"
    elif (( $(echo "$LRA_VAL >= 3" | bc -l) )); then
      DR_GRADE="C"
      VAULT_READY="REVIEW — COMPRESSED"
    else
      DR_GRADE="D"
      VAULT_READY="NO — OVER-COMPRESSED"
    fi
  fi

  echo -e "$FILE\t$SIZE_MB\t$DURATION\t$SAMPLE_RATE\t$CHANNELS\t$LUFS_I\t$LUFS_LRA\t$LUFS_TP\t$DR_GRADE\t$VAULT_READY" >> "$REPORT_TSV"

done < "$FILE_LIST"

echo ""
echo "Analysis complete. Generating report..."

# ─── SUMMARY STATS ───────────────────────────────────────────────────────────
TOTAL_SCANNED=$(tail -n +2 "$REPORT_TSV" | wc -l | tr -d ' ')
GOLD=$(grep -c "GOLD" "$REPORT_TSV" 2>/dev/null || echo 0)
EXCELLENT=$(grep -c "EXCELLENT" "$REPORT_TSV" 2>/dev/null || echo 0)
BROADCAST=$(grep -c "BROADCAST" "$REPORT_TSV" 2>/dev/null || echo 0)
COMPRESSED=$(grep -c "COMPRESSED" "$REPORT_TSV" 2>/dev/null || echo 0)
OVER=$(grep -c "OVER-COMPRESSED" "$REPORT_TSV" 2>/dev/null || echo 0)

# ─── HTML REPORT ─────────────────────────────────────────────────────────────
cat > "$REPORT_HTML" << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>NOIZY Audio Scan — Dynamic Range Report</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --void:#03040a;--deep:#070b12;--panel:#111827;
  --amber:#e8a832;--cyan:#38b4c8;--green:#34d399;
  --red:#f43f5e;--violet:#8b5cf6;--yellow:#fbbf24;
  --text:#c8cdd8;--dim:#5a6070;--white:#eef0f4;
  --border:rgba(255,255,255,0.07);
  --mono:'IBM Plex Mono',monospace;--serif:'Cormorant Garamond',serif;
}
body{background:var(--void);color:var(--text);font-family:var(--mono);font-size:12px;line-height:1.6}
header{padding:48px 48px 32px;border-bottom:1px solid var(--border)}
header h1{font-family:var(--serif);font-size:42px;font-weight:300;color:var(--white);margin-bottom:8px}
header .sub{font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:var(--amber);opacity:.8}
.stats-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:1px;background:var(--border);border:1px solid var(--border);margin:32px 48px}
.stat{background:var(--deep);padding:24px 20px;text-align:center}
.stat-n{font-family:var(--serif);font-size:40px;font-weight:300;line-height:1;margin-bottom:6px}
.stat-l{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
.grade-a-plus .stat-n{color:var(--green)}
.grade-a .stat-n{color:var(--cyan)}
.grade-b .stat-n{color:var(--amber)}
.grade-c .stat-n{color:var(--yellow)}
.grade-d .stat-n{color:var(--red)}
.grade-total .stat-n{color:var(--white)}

.guide{margin:32px 48px;padding:24px;border:1px solid var(--border);background:var(--deep)}
.guide h2{font-family:var(--serif);font-size:22px;font-weight:300;color:var(--white);margin-bottom:16px}
.guide-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.grade-block{padding:16px;border:1px solid var(--border)}
.grade-badge{font-family:var(--serif);font-size:32px;font-weight:300;line-height:1;margin-bottom:8px}
.grade-block p{font-size:10px;color:var(--dim);line-height:1.5}

.controls{padding:0 48px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.filter-btn{font-family:var(--mono);font-size:10px;letter-spacing:.15em;text-transform:uppercase;
  background:none;border:1px solid var(--border);color:var(--dim);padding:6px 14px;cursor:pointer;transition:all .2s}
.filter-btn:hover,.filter-btn.active{color:var(--amber);border-color:rgba(232,168,50,.4)}
#search{font-family:var(--mono);font-size:11px;background:var(--deep);border:1px solid var(--border);
  color:var(--text);padding:6px 12px;width:320px;outline:none}
#search::placeholder{color:var(--dim)}

table{width:calc(100% - 96px);margin:0 48px 48px;border-collapse:collapse;table-layout:fixed}
th{font-family:var(--mono);font-size:9px;letter-spacing:.2em;text-transform:uppercase;
  color:var(--dim);padding:10px 8px;text-align:left;border-bottom:1px solid var(--border);cursor:pointer}
th:hover{color:var(--amber)}
td{padding:8px 8px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:10px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
tr:hover td{background:rgba(255,255,255,0.02)}
.col-file{width:34%}
.col-size{width:7%}
.col-dur{width:7%}
.col-sr{width:8%}
.col-ch{width:5%}
.col-lufs{width:8%}
.col-lra{width:7%}
.col-tp{width:7%}
.col-grade{width:7%}
.col-vault{width:10%}

.badge{display:inline-block;padding:2px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase}
.badge-aplus{background:rgba(52,211,153,.15);color:#34d399}
.badge-a{background:rgba(56,180,200,.15);color:#38b4c8}
.badge-b{background:rgba(232,168,50,.15);color:#e8a832}
.badge-c{background:rgba(251,191,36,.1);color:#fbbf24}
.badge-d{background:rgba(244,63,94,.1);color:#f43f5e}
.badge-q{background:rgba(148,163,184,.1);color:#94a3b8}

.vault-yes{color:#34d399}
.vault-review{color:#fbbf24}
.vault-no{color:#f43f5e}

.path{color:var(--dim);font-size:10px}
.filename{color:var(--white)}
</style>
</head>
<body>

<header>
  <div class="sub">NOIZY Voice Platform — Audio Reconnaissance</div>
  <h1>Dynamic Range Report</h1>
  <div style="font-size:11px;color:var(--dim);margin-top:12px">
    Generated $(date "+%Y-%m-%d %H:%M") &nbsp;·&nbsp;
    EBU R128 / ITU-R BS.1770 analysis &nbsp;·&nbsp;
    Graded for vault readiness
  </div>
</header>

<div class="stats-grid">
  <div class="stat grade-total">
    <div class="stat-n">$TOTAL_SCANNED</div>
    <div class="stat-l">Total Analyzed</div>
  </div>
  <div class="stat grade-a-plus">
    <div class="stat-n">$GOLD</div>
    <div class="stat-l">A+ Gold</div>
  </div>
  <div class="stat grade-a">
    <div class="stat-n">$EXCELLENT</div>
    <div class="stat-l">A Excellent</div>
  </div>
  <div class="stat grade-b">
    <div class="stat-n">$BROADCAST</div>
    <div class="stat-l">B Broadcast</div>
  </div>
  <div class="stat grade-c">
    <div class="stat-n">$COMPRESSED</div>
    <div class="stat-l">C Compressed</div>
  </div>
  <div class="stat grade-d">
    <div class="stat-n">$OVER</div>
    <div class="stat-l">D Over-Compressed</div>
  </div>
</div>

<div class="guide">
  <h2>Dynamic Range Guide</h2>
  <div class="guide-grid">
    <div class="grade-block">
      <div class="grade-badge" style="color:#34d399">A+</div>
      <strong style="color:#34d399;font-size:10px">GOLD — LRA ≥ 14 LU</strong>
      <p>Exceptional dynamic expression. Wide emotional range. Vault priority — this is the soul of RSP_001.</p>
    </div>
    <div class="grade-block">
      <div class="grade-badge" style="color:#38b4c8">A</div>
      <strong style="color:#38b4c8;font-size:10px">EXCELLENT — LRA 10–14 LU</strong>
      <p>Outstanding performance capture. Full emotional arc. Vault-ready. Goes in as-is.</p>
    </div>
    <div class="grade-block">
      <div class="grade-badge" style="color:#e8a832">B</div>
      <strong style="color:#e8a832;font-size:10px">BROADCAST — LRA 6–10 LU</strong>
      <p>Professional broadcast quality. Good dynamic range. Vault-ready after light review.</p>
    </div>
    <div class="grade-block">
      <div class="grade-badge" style="color:#fbbf24">C</div>
      <strong style="color:#fbbf24;font-size:10px">COMPRESSED — LRA 3–6 LU</strong>
      <p>Heavily processed. Dynamic life squeezed out. Review before vaulting — may salvage stems.</p>
    </div>
    <div class="grade-block">
      <div class="grade-badge" style="color:#f43f5e">D</div>
      <strong style="color:#f43f5e;font-size:10px">OVER-COMPRESSED — LRA &lt; 3 LU</strong>
      <p>Brick-walled. Human signal buried under processing. Do not vault. Source recording needed.</p>
    </div>
  </div>
</div>

<div class="controls">
  <input id="search" type="text" placeholder="Search filename or path..."/>
  <button class="filter-btn active" data-filter="all">All</button>
  <button class="filter-btn" data-filter="A+">A+ Gold</button>
  <button class="filter-btn" data-filter="A">A Excellent</button>
  <button class="filter-btn" data-filter="B">B Broadcast</button>
  <button class="filter-btn" data-filter="C">C Review</button>
  <button class="filter-btn" data-filter="D">D Skip</button>
</div>

<table id="results-table">
<thead>
<tr>
  <th class="col-file" onclick="sortTable(0)">File ↕</th>
  <th class="col-size" onclick="sortTable(1)">MB ↕</th>
  <th class="col-dur" onclick="sortTable(2)">Dur(s) ↕</th>
  <th class="col-sr" onclick="sortTable(3)">Sample Rate ↕</th>
  <th class="col-ch" onclick="sortTable(4)">Ch ↕</th>
  <th class="col-lufs" onclick="sortTable(5)">LUFS-I ↕</th>
  <th class="col-lra" onclick="sortTable(6)">LRA ↕</th>
  <th class="col-tp" onclick="sortTable(7)">True Peak ↕</th>
  <th class="col-grade" onclick="sortTable(8)">Grade ↕</th>
  <th class="col-vault" onclick="sortTable(9)">Vault ↕</th>
</tr>
</thead>
<tbody id="table-body">
HTMLEOF

# ─── TABLE ROWS ──────────────────────────────────────────────────────────────
tail -n +2 "$REPORT_TSV" | while IFS=$'\t' read -r FILE SIZE DUR SR CH LUFS LRA TP GRADE VAULT; do
  DIRNAME=$(dirname "$FILE")
  BASENAME=$(basename "$FILE")

  # Grade badge class
  case "$GRADE" in
    "A+") BADGE_CLASS="badge-aplus" ;;
    "A")  BADGE_CLASS="badge-a" ;;
    "B")  BADGE_CLASS="badge-b" ;;
    "C")  BADGE_CLASS="badge-c" ;;
    "D")  BADGE_CLASS="badge-d" ;;
    *)    BADGE_CLASS="badge-q" ;;
  esac

  # Vault class
  case "$VAULT" in
    *GOLD*|*EXCELLENT*|*BROADCAST*) VAULT_CLASS="vault-yes" ;;
    *REVIEW*) VAULT_CLASS="vault-review" ;;
    *NO*) VAULT_CLASS="vault-no" ;;
    *) VAULT_CLASS="" ;;
  esac

  echo "<tr data-grade=\"$GRADE\">
  <td class=\"col-file\" title=\"$FILE\"><span class=\"path\">…/</span><span class=\"filename\">$BASENAME</span></td>
  <td class=\"col-size\">$SIZE</td>
  <td class=\"col-dur\">$DUR</td>
  <td class=\"col-sr\">$SR</td>
  <td class=\"col-ch\">$CH</td>
  <td class=\"col-lufs\">$LUFS</td>
  <td class=\"col-lra\">$LRA</td>
  <td class=\"col-tp\">$TP</td>
  <td class=\"col-grade\"><span class=\"badge $BADGE_CLASS\">$GRADE</span></td>
  <td class=\"col-vault $VAULT_CLASS\">$VAULT</td>
</tr>" >> "$REPORT_HTML"
done

cat >> "$REPORT_HTML" << 'HTMLEOF2'
</tbody>
</table>

<script>
// Filter
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('#table-body tr').forEach(row => {
      row.style.display = (f === 'all' || row.dataset.grade === f) ? '' : 'none';
    });
  });
});

// Search
document.getElementById('search').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  document.querySelectorAll('#table-body tr').forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q) ? '' : 'none';
  });
});

// Sort
let sortDir = {};
function sortTable(col) {
  const tbody = document.getElementById('table-body');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const dir = sortDir[col] = !(sortDir[col]);
  rows.sort((a, b) => {
    const av = a.cells[col]?.textContent.trim() || '';
    const bv = b.cells[col]?.textContent.trim() || '';
    const an = parseFloat(av), bn = parseFloat(bv);
    if (!isNaN(an) && !isNaN(bn)) return dir ? an - bn : bn - an;
    return dir ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  rows.forEach(r => tbody.appendChild(r));
}
</script>
</body>
</html>
HTMLEOF2

echo ""
echo "═══════════════════════════════════════════════════"
echo "  NOIZY AUDIO SCAN COMPLETE"
echo "═══════════════════════════════════════════════════"
echo "  Total files analyzed : $TOTAL_SCANNED"
echo "  A+ Gold              : $GOLD"
echo "  A  Excellent         : $EXCELLENT"
echo "  B  Broadcast Ready   : $BROADCAST"
echo "  C  Review (compressed): $COMPRESSED"
echo "  D  Skip (over-comp)  : $OVER"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  TSV  → $REPORT_TSV"
echo "  HTML → $REPORT_HTML"
echo ""

# Open the HTML report
open "$REPORT_HTML" 2>/dev/null || echo "Open manually: $REPORT_HTML"

rm -rf "$TMPDIR_SCAN"
