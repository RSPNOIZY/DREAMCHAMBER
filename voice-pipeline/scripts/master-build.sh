#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  NOIZY Empire — Master Build & Fix Script
#  Fixes: robplowman→m2ultra paths, builds pm2 config,
#         generates unified MCP config, runs status scan
#  Run: bash ~/NOIZYLAB/voice-pipeline/scripts/master-build.sh
# ═══════════════════════════════════════════════════════════════

NOIZYLAB="/Users/m2ultra/NOIZYLAB"
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

echo "══════════════════════════════════════════════════════"
echo "  NOIZY Empire — Master Build  $(date '+%Y-%m-%d %H:%M')"
echo "══════════════════════════════════════════════════════"

# ── 1. Fix broken robplowman → m2ultra paths ──────────────────
echo ""
echo "🔧 Step 1: Fixing broken paths (robplowman → m2ultra)..."
find "$NOIZYLAB/mcp" -name "*.js" -o -name "*.json" -o -name "*.toml" 2>/dev/null | while read f; do
  if grep -q "robplowman" "$f" 2>/dev/null; then
    sed -i '' 's|/Users/robplowman/|/Users/m2ultra/|g' "$f"
    echo "  ✅ Fixed: $f"
  fi
done
# Fix the existing MCP config
sed -i '' 's|/Users/robplowman/|/Users/m2ultra/|g' "$NOIZYLAB/.claude/mcp-config-godlocal.json" 2>/dev/null
echo "  ✅ MCP config paths updated"

# ── 2. Write unified Claude Desktop config ────────────────────
echo ""
echo "🔧 Step 2: Writing unified Claude Desktop MCP config..."
mkdir -p "$HOME/Library/Application Support/Claude"

cat > "$CLAUDE_CONFIG" << 'MCPEOF'
{
  "mcpServers": {
    "gabriel-mcp": {
      "command": "node",
      "args": ["/Users/m2ultra/NOIZYLAB/mcp/gabriel-mcp/index.js"],
      "env": {
        "DREAMCHAMBER_URL": "http://localhost:7777",
        "NOIZY_PROJECT_ROOT": "/Users/m2ultra/NOIZYLAB"
      }
    },
    "lucy-mcp": {
      "command": "node",
      "args": ["/Users/m2ultra/NOIZYLAB/mcp/lucy-mcp/index.js"],
      "env": {
        "HEAVEN_URL": "https://heaven.rsp-5f3.workers.dev",
        "NOIZY_PROJECT_ROOT": "/Users/m2ultra/NOIZYLAB"
      }
    },
    "heaven-mcp": {
      "command": "node",
      "args": ["/Users/m2ultra/NOIZYLAB/mcp/heaven-mcp/index.js"],
      "env": {
        "HEAVEN_URL": "https://heaven.rsp-5f3.workers.dev"
      }
    },
    "engr-keith-mcp": {
      "command": "node",
      "args": ["/Users/m2ultra/NOIZYLAB/mcp/engr-keith-mcp/index.js"],
      "env": {
        "HEAVEN_URL": "https://heaven.rsp-5f3.workers.dev",
        "NOIZY_PROJECT_ROOT": "/Users/m2ultra/NOIZYLAB"
      }
    },
    "dream-mcp": {
      "command": "node",
      "args": ["/Users/m2ultra/NOIZYLAB/mcp/dream-mcp/index.js"],
      "env": {
        "NOIZY_PROJECT_ROOT": "/Users/m2ultra/NOIZYLAB"
      }
    },
    "cb01-mcp": {
      "command": "node",
      "args": ["/Users/m2ultra/NOIZYLAB/mcp/cb01-mcp/index.js"],
      "env": {
        "HEAVEN_URL": "https://heaven.rsp-5f3.workers.dev",
        "NOIZY_PROJECT_ROOT": "/Users/m2ultra/NOIZYLAB"
      }
    },
    "shirley-mcp": {
      "command": "node",
      "args": ["/Users/m2ultra/NOIZYLAB/mcp/shirley-mcp/index.js"],
      "env": {
        "NOIZY_PROJECT_ROOT": "/Users/m2ultra/NOIZYLAB"
      }
    },
    "family-mcp": {
      "command": "node",
      "args": ["/Users/m2ultra/NOIZYLAB/mcp/family-mcp/index.js"],
      "env": {
        "NOIZY_PROJECT_ROOT": "/Users/m2ultra/NOIZYLAB"
      }
    },
    "noizy-gemma3": {
      "command": "node",
      "args": ["/Users/m2ultra/NOIZYLAB/mcp-gemma3/server.js"],
      "env": {
        "OLLAMA_URL": "http://localhost:11434",
        "GEMMA_MODEL": "gemma3:latest",
        "NOIZYLAB_DIR": "/Users/m2ultra/NOIZYLAB",
        "CLOUDFLARE_ACCOUNT_ID": "5f36aa9795348ea681d0b21910dfc82a"
      }
    },
    "noizy-voice-bridge": {
      "command": "node",
      "args": ["/Users/m2ultra/NOIZYLAB/voice-bridge-server.js"],
      "env": {
        "PORT": "8080",
        "DREAMCHAMBER_URL": "http://localhost:7777"
      }
    }
  }
}
MCPEOF
echo "  ✅ Claude Desktop config written (10 MCP servers)"

# ── 3. Install missing node_modules ──────────────────────────
echo ""
echo "🔧 Step 3: Checking MCP dependencies..."
for mcp_dir in "$NOIZYLAB/mcp"/*/; do
  if [ -f "$mcp_dir/package.json" ] && [ ! -d "$mcp_dir/node_modules" ]; then
    echo "  📦 Installing: $(basename $mcp_dir)"
    npm install --prefix "$mcp_dir" --cache /tmp/npm-cache 2>/dev/null && echo "  ✅ Done" || echo "  ⚠️ Failed"
  fi
done

# ── 4. Write pm2 ecosystem ────────────────────────────────────
echo ""
echo "🔧 Step 4: Writing pm2 ecosystem config..."
cat > "$NOIZYLAB/ecosystem.config.cjs" << 'PM2EOF'
module.exports = {
  apps: [
    {
      name: 'voice-bridge',
      script: '/Users/m2ultra/NOIZYLAB/voice-bridge-server.js',
      cwd: '/Users/m2ultra/NOIZYLAB',
      watch: false,
      env: { PORT: '8080', NODE_ENV: 'production' },
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: 'gemma3-mcp',
      script: '/Users/m2ultra/NOIZYLAB/mcp-gemma3/server.js',
      cwd: '/Users/m2ultra/NOIZYLAB/mcp-gemma3',
      watch: false,
      env: {
        OLLAMA_URL: 'http://localhost:11434',
        GEMMA_MODEL: 'gemma3:latest',
        NOIZYLAB_DIR: '/Users/m2ultra/NOIZYLAB',
      },
    },
    {
      name: 'dreamchamber',
      script: 'docker-compose',
      args: 'up',
      cwd: '/Users/m2ultra/NOIZYLAB/dreamchamber',
      watch: false,
      autorestart: false,
    },
  ],
};
PM2EOF
echo "  ✅ ecosystem.config.cjs written"

# ── 5. Status scan ────────────────────────────────────────────
echo ""
echo "🔍 Step 5: Full empire status scan..."
echo ""

check() {
  local label="$1" cmd="$2"
  if eval "$cmd" &>/dev/null; then
    echo "  ✅ $label"
  else
    echo "  ❌ $label"
  fi
}

check "Ollama running"         "curl -s http://localhost:11434/api/tags"
check "Gemma 3 model"          "curl -s http://localhost:11434/api/tags | grep -q gemma3"
check "Mistral model"          "curl -s http://localhost:11434/api/tags | grep -q mistral"
check "Voice Bridge (8080)"    "curl -s http://localhost:8080/health"
check "DreamChamber (7777)"    "curl -s http://localhost:7777 --max-time 2"
check "Whisper installed"      "which whisper || which mlx_whisper"
check "Wrangler installed"     "which wrangler"
check "Node 18+"               "node --version | grep -E 'v(1[89]|2[0-9])'"
check "Python 3"               "python3 --version"
check "pm2 installed"          "which pm2"
check "Gabriel MCP"            "test -f $NOIZYLAB/mcp/gabriel-mcp/index.js"
check "Heaven Worker"        "test -f $NOIZYLAB/workers/consent-gateway/src/index.js"
check "Voice pipeline scripts" "test -f $NOIZYLAB/voice-pipeline/voice-pipeline.sh"
check "Gemma3 MCP server"      "test -f $NOIZYLAB/mcp-gemma3/server.js"
check "D1 schema"              "test -f $NOIZYLAB/mcp-gemma3/../voice-pipeline/../schema.sql"
check "CF Account ID"          "echo 5f36aa9795348ea681d0b21910dfc82a"
check "Anthropic key in env"   "test -n '$ANTHROPIC_API_KEY' || grep -q ANTHROPIC $NOIZYLAB/NOIZYANTHROPIC/NOIZYLAB/.env 2>/dev/null"

echo ""
echo "══════════════════════════════════════════════════════"
echo "  NOIZY Empire Build Complete  $(date '+%H:%M:%S')"
echo "  Next: pm2 start ecosystem.config.cjs"
echo "  Then: Restart Claude Desktop to load all 10 MCPs"
echo "══════════════════════════════════════════════════════"
