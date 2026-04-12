#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# seal-manifests.sh — Cryptographic sealing of recovery manifests
# Creates a tamper-evident seal proving recovery state at ingest completion.
# Supports: minisign (preferred) or OpenSSL Ed25519 (fallback)
# NON-DESTRUCTIVE. Appends signatures alongside manifests.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

MACHINE_NAME="${HOSTNAME:-$(hostname -s)}"
CURRENT_USER="$(whoami)"
SCRIPT_NAME="seal-manifests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DRY_RUN="${DRY_RUN:-false}"

RECOVERED_DIR="$HOME/Recovered"
MANIFEST_DIR="$RECOVERED_DIR/manifests"
EVENTS_LOG="$RECOVERED_DIR/events.jsonl"
KEYS_DIR="$HOME/.noizy/recovery-keys"
HASHES_FILE="$MANIFEST_DIR/hashes_${TIMESTAMP}.txt"

mkdir -p "$MANIFEST_DIR" "$KEYS_DIR"

# ── Recovery Preamble ────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo " host:        $MACHINE_NAME"
echo " user:        $CURRENT_USER"
echo " command:     $SCRIPT_NAME"
echo " source:      $MANIFEST_DIR"
echo " destination: $HASHES_FILE + signature"
echo " dry-run:     $DRY_RUN"
echo "═══════════════════════════════════════════════════"

log_event() {
  printf '{"ts":"%s","script":"%s","machine":"%s","user":"%s","action":"%s","detail":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SCRIPT_NAME" "$MACHINE_NAME" "$CURRENT_USER" "$1" "$2" \
    >> "$EVENTS_LOG"
}

log_event "seal_started" "{\"user\":\"$CURRENT_USER\",\"dry_run\":$DRY_RUN}"

# ── Step 1: Generate hashes of all manifests + events.jsonl ──────────────────
echo ""
echo "--- Generating SHA-256 hashes ---"

{
  echo "# Recovery Manifest Hashes"
  echo "# Machine: $MACHINE_NAME"
  echo "# Timestamp: $TIMESTAMP"
  echo "# User: $CURRENT_USER"
  echo "#"

  # Hash all JSON manifests
  for f in "$MANIFEST_DIR"/*.json; do
    [ -f "$f" ] || continue
    shasum -a 256 "$f"
  done

  # Hash the events log
  if [ -f "$EVENTS_LOG" ]; then
    shasum -a 256 "$EVENTS_LOG"
  fi

  # Hash code-gold inventory (if extract has run)
  if [ -d "$RECOVERED_DIR/code-gold" ]; then
    find "$RECOVERED_DIR/code-gold" -type f -name "package.json" -o -name "wrangler.*" \
      2>/dev/null | head -50 | while read -r f; do
      shasum -a 256 "$f"
    done
  fi

  # Hash plugin inventory
  for inv in "$MANIFEST_DIR"/plugins_*.txt; do
    [ -f "$inv" ] || continue
    shasum -a 256 "$inv"
  done

} > "$HASHES_FILE"

hash_count=$(grep -c "^[a-f0-9]" "$HASHES_FILE" 2>/dev/null || echo "0")
echo "  $hash_count files hashed → $HASHES_FILE"

if [ "$hash_count" -eq 0 ]; then
  echo "  WARNING: No files to hash. Run scan-drives + extract-code first."
  log_event "seal_empty" "{\"hash_count\":0}"
  exit 0
fi

# ── Step 2: Sign the hashes file ─────────────────────────────────────────────
echo ""
echo "--- Signing hashes ---"

if [ "$DRY_RUN" = "true" ]; then
  echo "  DRY RUN — skipping signature"
  log_event "seal_dry_run" "{\"hash_count\":$hash_count}"
  exit 0
fi

# Method 1: minisign (preferred — small, fast, Ed25519-based)
if command -v minisign >/dev/null 2>&1; then
  PUBKEY="$KEYS_DIR/recovery.pub"
  SECKEY="$KEYS_DIR/recovery.key"

  # Generate keypair on first run
  if [ ! -f "$SECKEY" ]; then
    echo "  Generating minisign keypair (first run)..."
    minisign -G -p "$PUBKEY" -s "$SECKEY" -W
    echo "  Keys saved: $KEYS_DIR/"
    log_event "keys_generated" "{\"method\":\"minisign\",\"path\":\"$KEYS_DIR\"}"
  fi

  minisign -Sm "$HASHES_FILE" -s "$SECKEY"
  echo "  SEALED (minisign): ${HASHES_FILE}.minisig"
  log_event "seal_complete" "{\"method\":\"minisign\",\"hash_count\":$hash_count,\"sig\":\"${HASHES_FILE}.minisig\"}"

# Method 2: OpenSSL Ed25519 (fallback — always available on macOS)
elif command -v openssl >/dev/null 2>&1; then
  PRIVKEY="$KEYS_DIR/recovery_ed25519.pem"
  PUBKEY="$KEYS_DIR/recovery_ed25519.pub"
  SIG_FILE="${HASHES_FILE}.sig"

  # Generate keypair on first run
  if [ ! -f "$PRIVKEY" ]; then
    echo "  Generating Ed25519 keypair (first run)..."
    openssl genpkey -algorithm Ed25519 -out "$PRIVKEY"
    openssl pkey -in "$PRIVKEY" -pubout -out "$PUBKEY"
    chmod 600 "$PRIVKEY"
    echo "  Keys saved: $KEYS_DIR/"
    log_event "keys_generated" "{\"method\":\"openssl_ed25519\",\"path\":\"$KEYS_DIR\"}"
  fi

  openssl pkeyutl -sign -inkey "$PRIVKEY" -in "$HASHES_FILE" -out "$SIG_FILE"
  echo "  SEALED (OpenSSL Ed25519): $SIG_FILE"
  log_event "seal_complete" "{\"method\":\"openssl_ed25519\",\"hash_count\":$hash_count,\"sig\":\"$SIG_FILE\"}"

else
  echo "  ERROR: No signing tool available. Install minisign: brew install minisign"
  log_event "seal_failed" "{\"error\":\"no_signing_tool\"}"
  exit 1
fi

# ── Step 3: Verification instructions ────────────────────────────────────────
echo ""
echo "=== Manifest sealed ==="
echo "  Hashes:    $HASHES_FILE"
echo "  Files:     $hash_count"

if command -v minisign >/dev/null 2>&1; then
  echo "  Verify:    minisign -Vm $HASHES_FILE -p $KEYS_DIR/recovery.pub"
else
  echo "  Verify:    openssl pkeyutl -verify -pubin -inkey $KEYS_DIR/recovery_ed25519.pub -in $HASHES_FILE -sigfile ${HASHES_FILE}.sig"
fi

echo ""
echo "  To verify individual files later:"
echo "    shasum -a 256 -c $HASHES_FILE"
