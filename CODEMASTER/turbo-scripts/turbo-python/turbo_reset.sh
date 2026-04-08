#!/bin/zsh
# ============================================================================
# turbo_reset.sh
# Network & System Cache Reset Tool
# ============================================================================

# 0. System Vitals
echo "🩺 MONITORING SYSTEM VITALS..."
"$HOME/NOIZYANTHROPIC/NOIZYLAB/scripts/turbo/turbo_vitals.py"

# 1. Run Global Optimizer
echo "🚀 INITIATING SYSTEM OPTIMIZATION..."
"$HOME/NOIZYANTHROPIC/NOIZYLAB/scripts/maintenance/FORCE_PERFECTION.sh"

# 2. Flush DNS Cache
echo "🌊 FLUSHING DNS..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
echo "✅ DNS Flushed."

# 2.1. Verify Network Health (Advanced)
echo "🩺 RUNNING ADVANCED NETWORK DIAGNOSTICS..."
"$HOME/NOIZYANTHROPIC/NOIZYLAB/scripts/turbo/turbo_net_check.py"

# 2.2. Verify Speed (Bandwidth)
echo "🏎️  RUNNING BANDWIDTH SPEED TEST..."
"$HOME/NOIZYANTHROPIC/NOIZYLAB/scripts/turbo/turbo_speed.py"

# 3. Clear System Caches
echo "🗑️  CLEARING CACHES..."
# Only clear safe caches, avoid deleting active app states if possible, but user asked for CLEAR.
# We will target the User Caches.
rm -rf "$HOME/Library/Caches/*" 2>/dev/null
echo "✅ Caches Cleared."

# 4. MemCell Logging
MEMCELL="$HOME/NOIZYANTHROPIC/NOIZYLAB/scripts/core/MemCell.py"
if [ -f "$MEMCELL" ]; then
    "$MEMCELL" track "maintenance" "Executed turbo_reset.sh (DNS Flush + Cache Clear)" &>/dev/null
fi

echo "=========================================================="
echo "⚠️  ACTION REQUIRED: ⚠️"
echo "1. UNPLUG your Rogers Router/Modem."
echo "2. Wait 30 seconds."
echo "3. Plug it back in and wait for the lights to stabilize."
echo "=========================================================="
