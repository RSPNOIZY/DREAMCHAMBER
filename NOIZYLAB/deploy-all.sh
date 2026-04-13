#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR=$(mktemp -d)
FAILED=0

echo "🚀 Deploying Noisy Empire Foundation (parallel)..."
echo ""

# Deploy Noisy Proof (background)
if [ -d "$SCRIPT_DIR/noisy-proof" ]; then
    (
        cd "$SCRIPT_DIR/noisy-proof"
        chmod +x deploy.sh
        ./deploy.sh > "$LOG_DIR/proof.log" 2>&1 \
            && echo "   ✅ Noisy Proof deployed" \
            || { echo "   ❌ Noisy Proof FAILED (see $LOG_DIR/proof.log)"; exit 1; }
    ) &
    PID_PROOF=$!
else
    echo "   ⚠️  noisy-proof/ not found — skipping"
    PID_PROOF=""
fi

# Deploy NoisyVox (background)
if [ -d "$SCRIPT_DIR/noisy-vox" ]; then
    (
        cd "$SCRIPT_DIR/noisy-vox"
        npm install --prefer-offline --no-audit --no-fund > "$LOG_DIR/vox.log" 2>&1
        wrangler deploy >> "$LOG_DIR/vox.log" 2>&1 \
            && echo "   ✅ NoisyVox deployed" \
            || { echo "   ❌ NoisyVox FAILED (see $LOG_DIR/vox.log)"; exit 1; }
    ) &
    PID_VOX=$!
else
    echo "   ⚠️  noisy-vox/ not found — skipping"
    PID_VOX=""
fi

# Wait for all background jobs
for pid in $PID_PROOF $PID_VOX; do
    [ -n "$pid" ] && wait "$pid" || FAILED=1
done

echo ""
if [ "$FAILED" -eq 0 ]; then
    echo "✅ Foundation deployed!"
else
    echo "⚠️  Some deploys failed — check logs in $LOG_DIR"
fi
echo ""
echo "APIs Ready:"
echo "  Proof: https://heaven.rsp-5f3.workers.dev"
echo "  Vox: https://vox.noisy.io"
