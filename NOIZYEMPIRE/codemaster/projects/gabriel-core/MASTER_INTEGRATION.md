# GABRIEL MASTER INTEGRATION
## NOIZY.AI Complete Ecosystem Map

**GORUNFREE!!**

---

## 🗺️ DISCOVERED RESOURCES

### On M2Ultra Local

| Location | Contents |
|----------|----------|
| `~/NOIZYLAB/CODEMASTER/projects/` | Active development projects |
| `~/NOIZYLAB/GABRIEL/` | Gabriel system (bin, logs) |
| `~/NOIZYLAB/gabriel.db` | SQLite database |
| `~/NOIZYLAB/SystemGuardian/` | System utilities |

### On SOUND_DESIGN Volume

| Location | Contents |
|----------|----------|
| `/Volumes/SOUND_DESIGN/_2026_MASTER/06_GITHUB/` | All GitHub repos |
| `.../NOIZYLAB-io/gabriel-system/` | Main Gabriel system |
| `.../NOIZYLAB-io/CODE/` | Master code repository |
| `.../NOIZYLAB-io/MC96_GIT/` | MC96 Universe |

---

## 🤖 GABRIEL SYSTEM COMPONENTS

### From gabriel-system/

| Component | Path | Purpose |
|-----------|------|---------|
| **mcp_servers/gabriel** | MCP server implementation |
| **mcp_servers/ekkos_bridge** | ekkOS memory system bridge |
| **mcp_servers/gabriel_mcp** | Gabriel-specific MCP tools |
| **mcp_servers/unified** | Unified MCP (27KB server!) |
| **mcp_servers/MCP36** | MCP36 implementation |
| **core-system/brain** | AI brain logic |
| **core-system/brain_core** | Core brain functions |
| **core-system/noizylab-os** | NOIZYLAB OS |
| **apps/gabriel-brain** | Gabriel brain app |
| **apps/cockpit-web** | Web cockpit interface |
| **apps/creative-engine** | Creative engine |
| **apps/portal** | Portal interface |
| **apps/sentinel-worker** | Sentinel worker |
| **apps/workers** | Worker processes |
| **integrations/slack_bridge.js** | Slack integration |
| **integrations/mc96_server_bridge.js** | MC96 bridge |
| **tools/SystemGuardian** | System monitoring |
| **tools/ai-dev-toolkit** | AI development tools |

### ekkOS Memory System (28 Tools!)

| Category | Tools |
|----------|-------|
| **Core Memory** | search_memory, get_context, capture_event, forge_pattern, forge_directive, record_outcome, detect_usage, session_summary, check_conflict, recall_conversation, search_codebase, get_memory_stats, track_application |
| **Portability** | export_memory, import_memory |
| **Plan Management** | create_plan, list_plans, update_plan_status, update_plan_step, generate_plan_llm, save_plan_template, list_plan_templates, create_plan_from_template |
| **Secrets** | store_secret, get_secret, list_secrets, delete_secret, rotate_secret |

---

## 🔌 MCP SERVER INVENTORY

### Currently Configured (Claude Desktop)

| Server | Type | Status |
|--------|------|--------|
| filesystem | npx | ✅ Active |
| memory | npx | ✅ Active |
| github | docker | ⚙️ Needs token |
| google-workspace | uvx | ⚙️ Needs OAuth |
| google-ai-studio | uvx | ⚙️ Needs key |
| fetch | uvx | ✅ Active |
| git | uvx | ✅ Active |
| time | uvx | ✅ Active |
| sqlite | uvx | ✅ Active |
| sequential-thinking | npx | ✅ Active |
| gabriel | python | ✅ Active |

### Available to Add (from unified_mcp_config.json)

| Server | Command | Needs |
|--------|---------|-------|
| cloudflare | npx @cloudflare/mcp-server-cloudflare | CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN |
| stripe | npx @stripe/mcp-server | STRIPE_SECRET_KEY |
| canva | npx @anthropic/mcp-server-canva | CANVA_ACCESS_TOKEN |
| ekkos | node ekkos_bridge/server.js | EKKOS_USER_ID |
| postgres | npx @anthropic/mcp-server-postgres | DATABASE_URL |

---

## 🌐 GITHUB REPOSITORIES

### NOIZYLAB-io Organization

| Repo | Purpose |
|------|---------|
| `gabriel-system` | Main Gabriel AI system |
| `gabriel-worker` | Worker processes |
| `MC96_GIT` | MC96 Universe |
| `NOIZYLAB` | Core NOIZYLAB |
| `CODE` | Master code repository |

### rsplowman (Personal)

| Repo | Purpose |
|------|---------|
| `desktop-tutorial` | Tutorial/learning |

---

## 🔗 INTEGRATION PATHS

### Symlinks Already Configured

```
~/NOIZYLAB/NOIZYLAB -> /Volumes/SOUND_DESIGN/_2026_MASTER/06_GITHUB/NOIZYLAB-io/NOIZYLAB
~/NOIZYLAB/OneDrive -> Cloud storage
```

### Recommended New Links

```bash
ln -sf /Volumes/SOUND_DESIGN/_2026_MASTER/06_GITHUB/NOIZYLAB-io/gabriel-system ~/NOIZYLAB/gabriel-system
ln -sf /Volumes/SOUND_DESIGN/_2026_MASTER/06_GITHUB/NOIZYLAB-io/CODE ~/NOIZYLAB/CODE
ln -sf /Volumes/SOUND_DESIGN/_2026_MASTER/06_GITHUB/NOIZYLAB-io/MC96_GIT ~/NOIZYLAB/MC96
```

---

## 🚀 NEXT STEPS

1. **Authenticate GitHub CLI** - `gh auth login`
2. **Create symlinks** to unify file access
3. **Add ekkOS MCP server** to Claude Desktop
4. **Add Cloudflare MCP** if using Workers
5. **Sync GitHub repos** for latest code

---

**GORUNFREE!!** 🚀
