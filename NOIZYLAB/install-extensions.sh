#!/bin/bash

echo "🛠️ Installing Windsurf/VS Code Extensions for Noisy Empire"
echo "========================================================="
echo ""

# Essential for Cloudflare Workers
echo "📦 Installing Cloudflare Extensions..."
code --install-extension cloudflare.wrangler
code --install-extension cloudflare.workers-kv-explorer

# Git Extensions
echo "📦 Installing Git Extensions..."
code --install-extension eamodio.gitlens
code --install-extension mhutchie.git-graph
code --install-extension donjayamanne.githistory

# API Testing
echo "📦 Installing API Testing Tools..."
code --install-extension humao.rest-client
code --install-extension rangav.vscode-thunder-client

# Docker
echo "📦 Installing Docker Extension..."
code --install-extension ms-azuretools.vscode-docker

# Frontend/CSS
echo "📦 Installing Frontend Tools..."
code --install-extension bradlc.vscode-tailwindcss
code --install-extension marlonfan.html-to-css

# Code Quality
echo "📦 Installing Code Quality Tools..."
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension aaron-bond.better-comments

# Audio/Media
echo "📦 Installing Audio Preview..."
code --install-extension sukumo28.wav-preview

# Environment & Workspace
echo "📦 Installing Environment Tools..."
code --install-extension mikestead.dotenv
code --install-extension johnpapa.vscode-peacock
code --install-extension Gruntfuggly.todo-tree

echo ""
echo "✅ Extensions installed!"
echo ""
echo "⚠️  SKIPPED (as requested):"
echo "  - GitHub Copilot (using Cascade instead)"
echo "  - Jupyter (not needed for this build)"
echo ""
echo "Next steps:"
echo "1. Restart Windsurf to activate extensions"
echo "2. Configure Cloudflare extension with your API token"
echo "3. Set up workspace colors with Peacock if desired"
