#!/bin/bash
# =====================================================
# FIX NPM CACHE PERMISSIONS
# =====================================================
# Run with: sudo bash fix_npm_permissions.sh
# =====================================================

echo "🔧 Fixing NPM cache permissions..."

# Get current user
CURRENT_USER=$(whoami)
if [ "$CURRENT_USER" != "root" ]; then
    echo "❌ This script requires sudo. Run:"
    echo "   sudo bash $0"
    exit 1
fi

# Get the actual user (not root)
ACTUAL_USER=${SUDO_USER:-$USER}
ACTUAL_UID=$(id -u "$ACTUAL_USER")
ACTUAL_GID=$(id -g "$ACTUAL_USER")

echo "Fixing permissions for user: $ACTUAL_USER ($ACTUAL_UID:$ACTUAL_GID)"

# Fix npm directory
if [ -d "/Users/$ACTUAL_USER/.npm" ]; then
    echo "Fixing ~/.npm..."
    chown -R "$ACTUAL_UID:$ACTUAL_GID" "/Users/$ACTUAL_USER/.npm"
    chmod -R 755 "/Users/$ACTUAL_USER/.npm"
    echo "✅ ~/.npm fixed"
fi

# Fix npm cache specifically
if [ -d "/Users/$ACTUAL_USER/.npm/_cacache" ]; then
    echo "Fixing ~/.npm/_cacache..."
    chown -R "$ACTUAL_UID:$ACTUAL_GID" "/Users/$ACTUAL_USER/.npm/_cacache"
    echo "✅ ~/.npm/_cacache fixed"
fi

# Clear any lock files
rm -f "/Users/$ACTUAL_USER/.npm/_locks/"* 2>/dev/null

echo ""
echo "🎉 NPM permissions fixed!"
echo ""
echo "Test with: npx -y cowsay 'NPM works!'"
