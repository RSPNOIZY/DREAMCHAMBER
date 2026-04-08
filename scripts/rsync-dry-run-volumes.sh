#!/usr/bin/env bash
# =============================================================================
# rsync-dry-run-volumes.sh
# DREAMCHAMBER — MC96 Ecosystem
# ENGR_KEITH Infrastructure Tool
#
# Discovers all locally mounted volumes and performs a root-level rsync dry run
# for each one. No data is transferred — this is a read-only audit.
#
# Usage:
#   ./scripts/rsync-dry-run-volumes.sh                  # scan all local volumes
#   ./scripts/rsync-dry-run-volumes.sh /path/to/dest    # specify a destination for comparison
#   ./scripts/rsync-dry-run-volumes.sh --list            # list detected volumes only
#
# Nodes (MC96 Infrastructure Map):
#   GOD       10.90.90.10   M2 Ultra    Primary compute
#   GABRIEL   10.90.90.20   HP Omen     Agent orchestration
#   DaFixer   10.90.90.40   MBP         Mobile development
#   AQUARIUM  —             34TB Ext    Archive storage
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
LOG_DIR="${LOG_DIR:-/tmp/dreamchamber-rsync-logs}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="${LOG_DIR}/rsync_dryrun_${TIMESTAMP}.log"

# Rsync flags for a root-level dry run
#   -n   dry run — no files are transferred
#   -v   verbose — list every file that would be transferred
#   -h   human-readable sizes
#   --stats  show transfer statistics at the end
#   Note: -d (dirs without recursing) lists only the top-level entries of each volume
RSYNC_FLAGS="-dnvh --stats"

# Volumes to always skip (system/virtual mounts)
SKIP_VOLUMES=(
  "com.apple.TimeMachine"
  "Recovery"
  "Preboot"
  "VM"
  "Update"
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()  { printf "\033[1;36m[INFO]\033[0m  %s\n" "$*"; }
warn()  { printf "\033[1;33m[WARN]\033[0m  %s\n" "$*"; }
error() { printf "\033[1;31m[ERROR]\033[0m %s\n" "$*" >&2; }
header(){ printf "\n\033[1;35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m\n"; }

should_skip() {
  local vol_name="$1"
  for skip in "${SKIP_VOLUMES[@]}"; do
    if [[ "$vol_name" == *"$skip"* ]]; then
      return 0
    fi
  done
  return 1
}

# ---------------------------------------------------------------------------
# Detect local volumes
# ---------------------------------------------------------------------------
detect_volumes() {
  local volumes=()

  # macOS: enumerate /Volumes/*
  if [[ -d /Volumes ]]; then
    for vol in /Volumes/*/; do
      # Remove trailing slash
      vol="${vol%/}"
      local vol_name
      vol_name="$(basename "$vol")"

      if should_skip "$vol_name"; then
        warn "Skipping system volume: $vol_name"
        continue
      fi

      # Verify the volume is actually mounted and accessible
      if [[ -r "$vol" ]]; then
        volumes+=("$vol")
      else
        warn "Volume not readable: $vol"
      fi
    done
  fi

  # Linux: enumerate real mounts from /proc/mounts (skip virtual filesystems)
  if [[ -f /proc/mounts ]]; then
    while IFS=' ' read -r _ mountpoint fstype _; do
      case "$fstype" in
        ext4|xfs|btrfs|zfs|ntfs|vfat|exfat|hfs|hfsplus|apfs)
          # Include real filesystems only, skip root (/) to avoid duplicates
          if [[ "$mountpoint" != "/" && -r "$mountpoint" ]]; then
            # Avoid duplicates if already added from /Volumes
            local already_added=false
            for v in "${volumes[@]+"${volumes[@]}"}"; do
              if [[ "$v" == "$mountpoint" ]]; then
                already_added=true
                break
              fi
            done
            if [[ "$already_added" == false ]]; then
              volumes+=("$mountpoint")
            fi
          fi
          ;;
      esac
    done < /proc/mounts
  fi

  # Always include root filesystem as baseline
  volumes=("/" "${volumes[@]+"${volumes[@]}"}")

  printf '%s\n' "${volumes[@]}"
}

# ---------------------------------------------------------------------------
# Run rsync dry run on a single volume
# ---------------------------------------------------------------------------
run_dryrun() {
  local source="$1"
  local dest="${2:-}"
  local vol_name
  vol_name="$(basename "$source")"
  [[ "$source" == "/" ]] && vol_name="ROOT"

  header
  info "VOLUME: $vol_name"
  info "SOURCE: $source/"
  if [[ -n "$dest" ]]; then
    info "DEST:   $dest/$vol_name/"
  else
    info "DEST:   (none — listing source contents only)"
  fi
  info "FLAGS:  $RSYNC_FLAGS"
  echo ""

  if [[ -n "$dest" ]]; then
    # Dry run: compare source volume root against destination
    # shellcheck disable=SC2086
    rsync $RSYNC_FLAGS \
      --exclude='.Spotlight-*' \
      --exclude='.fseventsd' \
      --exclude='.Trashes' \
      --exclude='.DocumentRevisions-V100' \
      --exclude='.TemporaryItems' \
      --exclude='System' \
      --exclude='private/var/vm' \
      --exclude='dev' \
      --exclude='proc' \
      --exclude='sys' \
      --exclude='run' \
      "$source/" "$dest/$vol_name/" 2>&1 || true
  else
    # No destination — list root-level contents by syncing to a temp dir
    local null_dest
    null_dest="$(mktemp -d)"
    # shellcheck disable=SC2086
    rsync $RSYNC_FLAGS \
      --exclude='.Spotlight-*' \
      --exclude='.fseventsd' \
      --exclude='.Trashes' \
      --exclude='.DocumentRevisions-V100' \
      --exclude='.TemporaryItems' \
      --exclude='System' \
      --exclude='private/var/vm' \
      --exclude='dev' \
      --exclude='proc' \
      --exclude='sys' \
      --exclude='run' \
      "$source/" "$null_dest/" 2>&1 || true
    rmdir "$null_dest" 2>/dev/null || true
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  info "DREAMCHAMBER — MC96 Rsync Dry Run (Root Level)"
  info "Timestamp: $TIMESTAMP"
  info "Log: $LOG_FILE"
  header

  mkdir -p "$LOG_DIR"

  # Parse arguments
  local dest=""
  local list_only=false

  for arg in "$@"; do
    case "$arg" in
      --list)
        list_only=true
        ;;
      --help|-h)
        head -20 "$0" | tail -15
        exit 0
        ;;
      *)
        dest="$arg"
        ;;
    esac
  done

  # Detect all local volumes
  info "Detecting local volumes..."
  mapfile -t volumes < <(detect_volumes)

  info "Found ${#volumes[@]} volume(s):"
  for vol in "${volumes[@]}"; do
    local vname
    vname="$(basename "$vol")"
    [[ "$vol" == "/" ]] && vname="ROOT"
    info "  • $vname  →  $vol"
  done

  if [[ "$list_only" == true ]]; then
    info "List-only mode. Exiting."
    exit 0
  fi

  if [[ -n "$dest" ]]; then
    info "Destination: $dest"
    if [[ ! -d "$dest" ]]; then
      error "Destination directory does not exist: $dest"
      exit 1
    fi
  else
    info "No destination specified — running source-only audit"
  fi

  # Run dry run on each volume, capturing all output to log
  {
    for vol in "${volumes[@]}"; do
      run_dryrun "$vol" "$dest"
    done
  } 2>&1 | tee "$LOG_FILE"

  header
  info "Dry run complete. Log saved to: $LOG_FILE"
  info "No files were transferred. This was a read-only audit."
  info "GORUNFREE."
}

main "$@"
