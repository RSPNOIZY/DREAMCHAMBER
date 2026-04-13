#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# NOIZY EMPIRE — GABRIEL BOOT SEQUENCE
# ═══════════════════════════════════════════════════════════════
# Fires on every Claude Code / Cowork session start.
# Runs system checks, verifies infrastructure, logs session.
# Output is consumed by Claude to present Gabriel's status.
# ═══════════════════════════════════════════════════════════════

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%S")
DATE_SHORT=$(date +"%Y-%m-%d")

# ─── Persist environment variables ───
if [ -n "$CLAUDE_ENV_FILE" ]; then
    echo "export NOIZY_PROJECT_ROOT=\"$PROJECT_DIR\"" >> "$CLAUDE_ENV_FILE"
    echo "export NOIZY_SESSION_START=\"$TIMESTAMP\"" >> "$CLAUDE_ENV_FILE"
    echo "export GABRIEL_BOOT=true" >> "$CLAUDE_ENV_FILE"
fi

# ─── System checks (fast, non-blocking) ───
NODE_OK="false"
ENV_OK="false"
RULES_COUNT=0
SKILLS_COUNT=0
AGENTS_COUNT=0
MCP_COUNT=0
PROMPTS_COUNT=0
HEAVEN_STATUS="unknown"

# Node modules
[ -d "$PROJECT_DIR/node_modules" ] && NODE_OK="true"

# Environment file
[ -f "$PROJECT_DIR/.env" ] && ENV_OK="true"

# Count empire assets
[ -d "$PROJECT_DIR/.claude/rules" ] && RULES_COUNT=$(ls "$PROJECT_DIR/.claude/rules/"*.md 2>/dev/null | wc -l | tr -d ' ')
[ -d "$PROJECT_DIR/.claude/skills" ] && SKILLS_COUNT=$(ls -d "$PROJECT_DIR/.claude/skills/"*/ 2>/dev/null | wc -l | tr -d ' ')
[ -d "$PROJECT_DIR/.claude/agents" ] && AGENTS_COUNT=$(ls "$PROJECT_DIR/.claude/agents/"*.md 2>/dev/null | wc -l | tr -d ' ')
[ -d "$PROJECT_DIR/mcp" ] && MCP_COUNT=$(ls -d "$PROJECT_DIR/mcp/"*/ 2>/dev/null | wc -l | tr -d ' ')
[ -d "$PROJECT_DIR/.claude/prompts" ] && PROMPTS_COUNT=$(ls "$PROJECT_DIR/.claude/prompts/"*.md 2>/dev/null | wc -l | tr -d ' ')

# Heaven health check (2-second timeout, non-blocking)
H17_RESPONSE=$(curl -s --max-time 2 "https://heaven.rsp-5f3.workers.dev/health" 2>/dev/null)
if echo "$H17_RESPONSE" | grep -q '"success"' 2>/dev/null; then
    HEAVEN_STATUS="LIVE"
else
    HEAVEN_STATUS="UNREACHABLE"
fi

# ─── Log session (append-only audit) ───
LOG_DIR="$PROJECT_DIR/dreamchamber-audio-mcp/logs"
mkdir -p "$LOG_DIR" 2>/dev/null
echo "[$TIMESTAMP] GABRIEL_BOOT | h17=$HEAVEN_STATUS | rules=$RULES_COUNT | skills=$SKILLS_COUNT | agents=$AGENTS_COUNT | mcp=$MCP_COUNT" >> "$LOG_DIR/claude_sessions.log" 2>/dev/null

# ─── Output structured status for Claude ───
cat <<EOF
{
  "gabriel_boot": true,
  "timestamp": "$TIMESTAMP",
  "date": "$DATE_SHORT",
  "project_root": "$PROJECT_DIR",
  "checks": {
    "node_modules": $NODE_OK,
    "env_file": $ENV_OK,
    "heaven": "$HEAVEN_STATUS"
  },
  "empire_assets": {
    "rules": $RULES_COUNT,
    "skills": $SKILLS_COUNT,
    "agents": $AGENTS_COUNT,
    "mcp_servers": $MCP_COUNT,
    "prompts": $PROMPTS_COUNT
  }
}
EOF

exit 0
