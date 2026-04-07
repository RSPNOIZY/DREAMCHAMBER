"""
GABRIEL MCP - Model Context Protocol Integration
=================================================
NOIZY.AI Ecosystem

Unified MCP interface for:
- GitHub (code, issues, PRs, actions)
- Google Workspace (Gmail, Calendar, Drive, Docs, Sheets)
- Google AI Studio (Gemini 2.5 multi-modal)
- Slack (workspace messaging)
- Discord (community engagement)

Author: R.S. Plowman
Motto: GORUNFREE!!
"""

from .gabriel_mcp_config import (
    MCPServer,
    MCPCredentials,
    GabrielMCPOrchestrator,
    get_orchestrator,
    check_mcp_status,
)

__all__ = [
    "MCPServer",
    "MCPCredentials",
    "GabrielMCPOrchestrator",
    "get_orchestrator",
    "check_mcp_status",
]

__version__ = "1.0.0"
