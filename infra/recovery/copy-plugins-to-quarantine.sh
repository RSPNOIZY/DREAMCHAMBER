#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# copy-plugins-to-quarantine.sh — Inventory and quarantine audio plugins
# Copies AU/VST/VST3/AAX bundles into ~/Recovered/plugins-quarantine/
# Never touches live plug-in directories on GOD.
# Usage: ./copy-plugins-to-quarantine.sh /Volumes/SOURCE_DRIVE
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

SOURCE="${1:?Usage: copy-plugins-to-quarantine.sh /path/to/source}"
DEST="$HOME/Recovered/plugins-quarantine"
MANIFEST_DIR="$HOME/Recovered/manifests"
EVENTS_LOG="$HOME/Recovered/events.jsonl"
MACHINE_NAME="${HOSTNAME:-$(hostname -s)}"
CURRENT_USER="$(whoami)"
SCRIPT_NAME="copy-plugins-to-quarantine"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DRY_RUN="${DRY_RUN:-false}"

if [ ! -d "$SOURCE" ]; then
  echo "ERROR: Source not found: $SOURCE"
  exit 1
fi

mkdir -p "$DEST/AU" "$DEST/VST" "$DEST/VST3" "$DEST/AAX" "$MANIFEST_DIR"

# ── Recovery Preamble ────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo " host:        $MACHINE_NAME"
echo " user:        $CURRENT_USER"
echo " command:     $SCRIPT_NAME"
echo " source:      $SOURCE"
echo " destination: $DEST"
echo " dry-run:     $DRY_RUN"
echo "═══════════════════════════════════════════════════"

log_event() {
  printf '{"ts":"%s","script":"%s","machine":"%s","user":"%s","action":"%s","detail":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SCRIPT_NAME" "$MACHINE_NAME" "$CURRENT_USER" "$1" "$2" \
    >> "$EVENTS_LOG"
}

log_event "quarantine_started" "{\"source\":\"$SOURCE\",\"user\":\"$CURRENT_USER\",\"dry_run\":$DRY_RUN}"

inventory_file="${MANIFEST_DIR}/plugins_${MACHINE_NAME}_${TIMESTAMP}.txt"
echo "# Plugin Inventory — $SOURCE — $TIMESTAMP" > "$inventory_file"

count=0

# AU Components (.component)
echo "--- Audio Units (.component) ---"
while IFS= read -r plugin; do
  [ -z "$plugin" ] && continue
  name=$(basename "$plugin")
  echo "  [AU] $name"
  echo "AU|$name|$plugin|QUARANTINED" >> "$inventory_file"
  cp -R "$plugin" "$DEST/AU/" 2>/dev/null && ((count++)) || echo "  SKIP: $plugin (permission denied)"
done < <(find "$SOURCE" -maxdepth 8 -name "*.component" -path "*/Components/*" 2>/dev/null)

# VST Plugins (.vst)
echo "--- VST Plugins (.vst) ---"
while IFS= read -r plugin; do
  [ -z "$plugin" ] && continue
  name=$(basename "$plugin")
  echo "  [VST] $name"
  echo "VST|$name|$plugin|QUARANTINED" >> "$inventory_file"
  cp -R "$plugin" "$DEST/VST/" 2>/dev/null && ((count++)) || echo "  SKIP: $plugin (permission denied)"
done < <(find "$SOURCE" -maxdepth 8 -name "*.vst" 2>/dev/null)

# VST3 Plugins (.vst3)
echo "--- VST3 Plugins (.vst3) ---"
while IFS= read -r plugin; do
  [ -z "$plugin" ] && continue
  name=$(basename "$plugin")
  echo "  [VST3] $name"
  echo "VST3|$name|$plugin|QUARANTINED" >> "$inventory_file"
  cp -R "$plugin" "$DEST/VST3/" 2>/dev/null && ((count++)) || echo "  SKIP: $plugin (permission denied)"
done < <(find "$SOURCE" -maxdepth 8 -name "*.vst3" 2>/dev/null)

# AAX Plugins (.aaxplugin)
echo "--- AAX Plugins (.aaxplugin) ---"
while IFS= read -r plugin; do
  [ -z "$plugin" ] && continue
  name=$(basename "$plugin")
  echo "  [AAX] $name"
  echo "AAX|$name|$plugin|QUARANTINED" >> "$inventory_file"
  cp -R "$plugin" "$DEST/AAX/" 2>/dev/null && ((count++)) || echo "  SKIP: $plugin (permission denied)"
done < <(find "$SOURCE" -maxdepth 8 -name "*.aaxplugin" 2>/dev/null)

echo ""
echo "=== Quarantined $count plugins → $DEST ==="
echo "=== Inventory: $inventory_file ==="
log_event "quarantine_complete" "{\"source\":\"$SOURCE\",\"plugin_count\":$count}"
