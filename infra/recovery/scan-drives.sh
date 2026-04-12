#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# scan-drives.sh — First command on every machine, every time.
# Enumerates mounted volumes + approved user paths, records layout, counts artifacts.
# Emits machine-readable manifests to ~/Recovered/manifests/
# NON-DESTRUCTIVE. Read-only. No writes to source drives.
#
# SCOPE: /Volumes/*, /Users/*, and NOIZY_APPROVED_PATHS (if set).
#        Never walks all of /. macOS privacy-protected locations are excluded.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Recovery Preamble (emitted by every recovery script) ─────────────────────
MACHINE_NAME="${HOSTNAME:-$(hostname -s)}"
CURRENT_USER="$(whoami)"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
SCRIPT_NAME="scan-drives"
MANIFEST_DIR="$HOME/Recovered/manifests"
EVENTS_LOG="$HOME/Recovered/events.jsonl"
OUTFILE="${MANIFEST_DIR}/${MACHINE_NAME}_${TIMESTAMP}.json"
DRY_RUN="${DRY_RUN:-false}"

mkdir -p "$MANIFEST_DIR"

echo "═══════════════════════════════════════════════════"
echo " host:        $MACHINE_NAME"
echo " user:        $CURRENT_USER"
echo " command:     $SCRIPT_NAME"
echo " source:      (mounted volumes + approved paths)"
echo " destination: $MANIFEST_DIR"
echo " dry-run:     $DRY_RUN"
echo " timestamp:   $TIMESTAMP"
echo "═══════════════════════════════════════════════════"

log_event() {
  local action="$1" detail="$2"
  printf '{"ts":"%s","script":"%s","machine":"%s","user":"%s","action":"%s","detail":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SCRIPT_NAME" "$MACHINE_NAME" "$CURRENT_USER" "$action" "$detail" \
    >> "$EVENTS_LOG"
}

log_event "scan_started" "{\"machine\":\"$MACHINE_NAME\",\"user\":\"$CURRENT_USER\",\"dry_run\":$DRY_RUN}"

# ── Define scan targets ─────────────────────────────────────────────────────
# SCOPED: Only mounted volumes, user dirs, and explicit approved paths.
# Never scans: /System, /Library, /private, /usr, /sbin, /bin, /etc
# Reason: macOS Privacy & Security controls (TCC) block access to protected
# locations and generate noise. Scoping keeps output clean and fast.
SCAN_TARGETS=()

# All mounted external volumes
for vol in /Volumes/*; do
  [ -d "$vol" ] && SCAN_TARGETS+=("$vol")
done

# User home directories (typically just /Users/m2ultra on GOD)
for user_dir in /Users/*; do
  [ -d "$user_dir" ] && [ "$(basename "$user_dir")" != "Shared" ] && SCAN_TARGETS+=("$user_dir")
done

# Explicitly approved external mount paths (set via env var, colon-separated)
if [ -n "${NOIZY_APPROVED_PATHS:-}" ]; then
  IFS=':' read -ra EXTRA_PATHS <<< "$NOIZY_APPROVED_PATHS"
  for p in "${EXTRA_PATHS[@]}"; do
    [ -d "$p" ] && SCAN_TARGETS+=("$p")
  done
fi

echo ""
echo "--- Scan Targets (${#SCAN_TARGETS[@]}) ---"
for t in "${SCAN_TARGETS[@]}"; do
  echo "  $t"
done

# ── Enumerate mounted volumes (disk info only) ──────────────────────────────
echo ""
echo "--- Volume Info ---"
volumes_json="["
first=true

# Include root for disk stats, plus all /Volumes/*
for vol in / /Volumes/*; do
  [ -d "$vol" ] || continue

  read -r size_kb used_kb avail_kb capacity <<< $(df -k "$vol" 2>/dev/null | tail -1 | awk '{print $2, $3, $4, $5}')
  size_gb=$(echo "scale=1; ${size_kb:-0} / 1048576" | bc 2>/dev/null || echo "0")
  free_gb=$(echo "scale=1; ${avail_kb:-0} / 1048576" | bc 2>/dev/null || echo "0")
  fs_type=$(mount | grep "on ${vol} " | awk '{print $4}' | tr -d '(,' | head -1)

  echo "  $vol  — ${size_gb}GB total, ${free_gb}GB free ($fs_type)"

  vol_json=$(printf '{"path":"%s","size_gb":%s,"free_gb":%s,"fs_type":"%s","capacity":"%s"}' \
    "$vol" "${size_gb}" "${free_gb}" "${fs_type:-unknown}" "${capacity:-unknown}")

  if [ "$first" = true ]; then
    volumes_json+="$vol_json"
    first=false
  else
    volumes_json+=",$vol_json"
  fi

  log_event "volume_found" "$vol_json"
done
volumes_json+="]"

# ── Count code-gold artifacts (scoped targets only) ─────────────────────────
echo ""
echo "--- Code-Gold Artifacts ---"

count_files() {
  local dir="$1" pattern="$2"
  find "$dir" -maxdepth 6 -name "$pattern" \
    -not -path "*/Library/*" \
    -not -path "*/.Trash/*" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/objects/*" \
    2>/dev/null | wc -l | tr -d ' '
}

code_gold_json="{"
first_cg=true
for target in "${SCAN_TARGETS[@]}"; do
  git_repos=$(count_files "$target" ".git")
  package_jsons=$(count_files "$target" "package.json")
  wrangler_tomls=$(count_files "$target" "wrangler.toml")
  wrangler_jsoncs=$(count_files "$target" "wrangler.jsonc")
  docker_composes=$(count_files "$target" "docker-compose.yml")
  swift_files=$(count_files "$target" "*.swift")
  ts_files=$(count_files "$target" "*.ts")
  py_files=$(count_files "$target" "*.py")
  xcodeprojs=$(count_files "$target" "*.xcodeproj")

  echo "  $target:"
  echo "    .git=$git_repos  package.json=$package_jsons  wrangler.toml=$wrangler_tomls  wrangler.jsonc=$wrangler_jsoncs"
  echo "    docker-compose=$docker_composes  *.swift=$swift_files  *.ts=$ts_files  *.py=$py_files  *.xcodeproj=$xcodeprojs"

  vol_key=$(echo "$target" | sed 's|/|_|g; s|^_||')
  entry=$(printf '"%s":{"git":%s,"package_json":%s,"wrangler_toml":%s,"wrangler_jsonc":%s,"docker_compose":%s,"swift":%s,"ts":%s,"py":%s,"xcodeproj":%s}' \
    "$vol_key" "$git_repos" "$package_jsons" "$wrangler_tomls" "$wrangler_jsoncs" "$docker_composes" "$swift_files" "$ts_files" "$py_files" "$xcodeprojs")

  if [ "$first_cg" = true ]; then
    code_gold_json+="$entry"
    first_cg=false
  else
    code_gold_json+=",$entry"
  fi
done
code_gold_json+="}"

# ── Count media/projects/plugins (scoped targets only) ──────────────────────
echo ""
echo "--- Media & Audio ---"

media_json="{"
first_m=true
for target in "${SCAN_TARGETS[@]}"; do
  logic_projects=$(count_files "$target" "*.logicx")
  aiff_files=$(count_files "$target" "*.aiff")
  wav_files=$(count_files "$target" "*.wav")
  mp3_files=$(count_files "$target" "*.mp3")
  flac_files=$(count_files "$target" "*.flac")
  au_plugins=$(find "$target" -maxdepth 6 -name "*.component" -path "*/Components/*" 2>/dev/null | wc -l | tr -d ' ')
  vst_plugins=$(find "$target" -maxdepth 6 \( -name "*.vst" -o -name "*.vst3" \) 2>/dev/null | wc -l | tr -d ' ')
  aax_plugins=$(find "$target" -maxdepth 6 -name "*.aaxplugin" 2>/dev/null | wc -l | tr -d ' ')

  echo "  $target:"
  echo "    .logicx=$logic_projects  .wav=$wav_files  .aiff=$aiff_files  .mp3=$mp3_files  .flac=$flac_files"
  echo "    AU=$au_plugins  VST/VST3=$vst_plugins  AAX=$aax_plugins"

  vol_key=$(echo "$target" | sed 's|/|_|g; s|^_||')
  entry=$(printf '"%s":{"logicx":%s,"wav":%s,"aiff":%s,"mp3":%s,"flac":%s,"au":%s,"vst":%s,"aax":%s}' \
    "$vol_key" "$logic_projects" "$wav_files" "$aiff_files" "$mp3_files" "$flac_files" "$au_plugins" "$vst_plugins" "$aax_plugins")

  if [ "$first_m" = true ]; then
    media_json+="$entry"
    first_m=false
  else
    media_json+=",$entry"
  fi
done
media_json+="}"

# ── Check for permission / I/O errors ────────────────────────────────────────
echo ""
echo "--- Permission / I/O Errors ---"
errors_json="["
first_e=true
for target in "${SCAN_TARGETS[@]}"; do
  if ! ls "$target" >/dev/null 2>&1; then
    echo "  ERROR: Cannot read $target"
    entry="{\"path\":\"$target\",\"error\":\"permission_denied\"}"
    if [ "$first_e" = true ]; then
      errors_json+="$entry"
      first_e=false
    else
      errors_json+=",$entry"
    fi
    log_event "io_error" "$entry"
  fi
done
errors_json+="]"

# ── Write manifest ───────────────────────────────────────────────────────────
if [ "$DRY_RUN" = "true" ]; then
  echo ""
  echo "=== DRY RUN — manifest NOT written ==="
  log_event "scan_complete" "{\"dry_run\":true}"
else
  cat > "$OUTFILE" <<MANIFEST
{
  "machine": "$MACHINE_NAME",
  "user": "$CURRENT_USER",
  "timestamp": "$TIMESTAMP",
  "scan_targets": $(printf '['; first=true; for t in "${SCAN_TARGETS[@]}"; do [ "$first" = true ] && first=false || printf ','; printf '"%s"' "$t"; done; printf ']'),
  "volumes": $volumes_json,
  "code_gold": $code_gold_json,
  "media": $media_json,
  "errors": $errors_json
}
MANIFEST

  echo ""
  echo "=== Manifest written: $OUTFILE ==="
  log_event "scan_complete" "{\"manifest\":\"$OUTFILE\",\"targets\":${#SCAN_TARGETS[@]}}"
fi
