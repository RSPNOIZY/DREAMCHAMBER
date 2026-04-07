"""
MC96ECOUNIVERSE - MCP Integration Layer
========================================
Bridges the MC96 Multi-AI Network with Gabriel MCP Orchestrator

Architecture:
- Port 1: iPad 12.9 (Command Center)
- Port 2: AI Node 1 (Claude Haiku 4.5)
- Port 3: AI Node 2 (ChatGPT 5.2 Thinking)
- Port 4: Processing Core (Anthropic Upgrades)
- Port 5: Data Store (Local Cache)
- Port 6: Automation (Cowork Engine)
- Port 7: Monitoring (Real-time Metrics)
- Port 8: Failover (Redundancy Layer)

Author: R.S. Plowman / NOIZY.AI
Motto: GORUNFREE!!
"""

import os
import json
import sqlite3
from dataclasses import dataclass
from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime
from pathlib import Path

class AIModel(Enum):
    """Available AI models in the MC96 network"""
    CLAUDE_HAIKU = "claude-haiku-4.5"
    CLAUDE_SONNET = "claude-sonnet-4"
    CLAUDE_OPUS = "claude-opus-4.5"
    GPT_THINKING = "chatgpt-5.2-thinking"
    GEMINI_FLASH = "gemini-2.5-flash"
    GEMINI_PRO = "gemini-2.5-pro"


class PortFunction(Enum):
    """MC96 port functions"""
    COMMAND_CENTER = "command_center"
    AI_NODE = "ai_node"
    PROCESSING = "processing"
    DATA_STORE = "data_store"
    AUTOMATION = "automation"
    MONITORING = "monitoring"
    FAILOVER = "failover"


@dataclass
class MC96Port:
    """Represents a port on the MC96 network hub"""
    id: int
    name: str
    device: str
    function: PortFunction
    ai_model: Optional[AIModel] = None
    status: str = "active"
    ip_address: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None


@dataclass
class MC96Network:
    """The MC96ECOUNIVERSE Network Configuration"""
    hub_model: str = "DGS1210-10"
    ports: List[MC96Port] = None
    created_at: str = None

    def __post_init__(self):
        if self.ports is None:
            self.ports = self._default_ports()
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

    def _default_ports(self) -> List[MC96Port]:
        """Default MC96 port configuration"""
        return [
            MC96Port(1, "Port 1", "iPad 12.9", PortFunction.COMMAND_CENTER),
            MC96Port(2, "Port 2", "AI Node 1", PortFunction.AI_NODE, AIModel.CLAUDE_HAIKU),
            MC96Port(3, "Port 3", "AI Node 2", PortFunction.AI_NODE, AIModel.GPT_THINKING),
            MC96Port(4, "Port 4", "Processing Core", PortFunction.PROCESSING, AIModel.CLAUDE_OPUS),
            MC96Port(5, "Port 5", "Data Store", PortFunction.DATA_STORE),
            MC96Port(6, "Port 6", "Automation", PortFunction.AUTOMATION),
            MC96Port(7, "Port 7", "Monitoring", PortFunction.MONITORING),
            MC96Port(8, "Port 8", "Failover", PortFunction.FAILOVER),
        ]

    def get_port(self, port_id: int) -> Optional[MC96Port]:
        """Get a port by ID"""
        for port in self.ports:
            if port.id == port_id:
                return port
        return None

    def get_ai_ports(self) -> List[MC96Port]:
        """Get all ports with AI nodes"""
        return [p for p in self.ports if p.ai_model is not None]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "hub_model": self.hub_model,
            "created_at": self.created_at,
            "ports": [
                {
                    "id": p.id,
                    "name": p.name,
                    "device": p.device,
                    "function": p.function.value,
                    "ai_model": p.ai_model.value if p.ai_model else None,
                    "status": p.status,
                    "ip_address": p.ip_address,
                }
                for p in self.ports
            ]
        }


class MC96MCPBridge:
    """
    Bridge between MC96 Network and MCP Servers

    Routes requests to appropriate AI nodes based on task requirements.
    """

    def __init__(self, network: Optional[MC96Network] = None, db_path: Optional[str] = None):
        self.network = network or MC96Network()
        self.db_path = db_path or str(Path.home() / "NOIZYLAB" / "gabriel.db")
        self._init_db()

    def _init_db(self):
        """Initialize SQLite database for MC96 operations"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Network configuration table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mc96_config (
                id INTEGER PRIMARY KEY,
                config_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Request routing log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mc96_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                port_id INTEGER,
                ai_model TEXT,
                request_type TEXT,
                request_data TEXT,
                response_data TEXT,
                status TEXT,
                latency_ms REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # AI node metrics
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mc96_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                port_id INTEGER,
                metric_name TEXT,
                metric_value REAL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        conn.close()

    def route_request(self, task_type: str, complexity: str = "low") -> MC96Port:
        """
        Route a request to the appropriate AI node based on task requirements

        Args:
            task_type: Type of task (inference, reasoning, generation, etc.)
            complexity: Task complexity (low, medium, high)

        Returns:
            The best port/AI for the task
        """
        routing_rules = {
            # Fast inference tasks -> Haiku
            ("inference", "low"): AIModel.CLAUDE_HAIKU,
            ("inference", "medium"): AIModel.CLAUDE_HAIKU,

            # Complex reasoning -> GPT Thinking or Opus
            ("reasoning", "high"): AIModel.GPT_THINKING,
            ("reasoning", "medium"): AIModel.CLAUDE_OPUS,

            # Code generation -> Opus
            ("generation", "high"): AIModel.CLAUDE_OPUS,
            ("generation", "medium"): AIModel.CLAUDE_SONNET,
            ("generation", "low"): AIModel.CLAUDE_HAIKU,

            # Multi-modal -> Gemini
            ("multimodal", "any"): AIModel.GEMINI_FLASH,
        }

        # Find matching rule
        target_model = routing_rules.get(
            (task_type, complexity),
            routing_rules.get((task_type, "any"), AIModel.CLAUDE_HAIKU)
        )

        # Find port with that model
        for port in self.network.ports:
            if port.ai_model == target_model:
                return port

        # Default to first AI port
        ai_ports = self.network.get_ai_ports()
        return ai_ports[0] if ai_ports else self.network.ports[0]

    def log_request(
        self,
        port_id: int,
        ai_model: str,
        request_type: str,
        request_data: str,
        response_data: str,
        status: str,
        latency_ms: float
    ):
        """Log a request to the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO mc96_requests
            (port_id, ai_model, request_type, request_data, response_data, status, latency_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (port_id, ai_model, request_type, request_data, response_data, status, latency_ms))
        conn.commit()
        conn.close()

    def record_metric(self, port_id: int, metric_name: str, metric_value: float):
        """Record a metric for a port"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO mc96_metrics (port_id, metric_name, metric_value)
            VALUES (?, ?, ?)
        """, (port_id, metric_name, metric_value))
        conn.commit()
        conn.close()

    def get_network_status(self) -> Dict[str, Any]:
        """Get current network status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get request counts by port
        cursor.execute("""
            SELECT port_id, COUNT(*) as count, AVG(latency_ms) as avg_latency
            FROM mc96_requests
            GROUP BY port_id
        """)
        port_stats = {row[0]: {"requests": row[1], "avg_latency": row[2]} for row in cursor.fetchall()}

        conn.close()

        return {
            "network": self.network.to_dict(),
            "port_stats": port_stats,
            "timestamp": datetime.now().isoformat()
        }


# ===========================================
# MCP TOOL DEFINITIONS FOR MC96
# ===========================================

MC96_TOOLS = {
    "mc96_route_request": {
        "description": "Route a request to the optimal AI node in the MC96 network",
        "parameters": {
            "task_type": {"type": "string", "description": "Type of task (inference, reasoning, generation, multimodal)"},
            "complexity": {"type": "string", "description": "Task complexity (low, medium, high)"},
        }
    },
    "mc96_get_status": {
        "description": "Get the current status of all MC96 network ports",
        "parameters": {}
    },
    "mc96_get_port": {
        "description": "Get details about a specific MC96 port",
        "parameters": {
            "port_id": {"type": "integer", "description": "Port ID (1-8)"}
        }
    },
    "mc96_list_ai_nodes": {
        "description": "List all AI nodes in the MC96 network",
        "parameters": {}
    },
}


def main():
    """Test MC96 integration"""
    print("=" * 60)
    print("MC96ECOUNIVERSE - MCP Integration Test")
    print("=" * 60)

    # Create network
    network = MC96Network()
    bridge = MC96MCPBridge(network)

    print(f"\n🔌 Hub: {network.hub_model}")
    print(f"📍 Ports: {len(network.ports)}")

    print("\n📊 Port Configuration:")
    for port in network.ports:
        ai = port.ai_model.value if port.ai_model else "N/A"
        print(f"  Port {port.id}: {port.device} ({port.function.value}) -> {ai}")

    print("\n🎯 Routing Tests:")
    test_cases = [
        ("inference", "low"),
        ("reasoning", "high"),
        ("generation", "medium"),
        ("multimodal", "any"),
    ]

    for task, complexity in test_cases:
        port = bridge.route_request(task, complexity)
        ai = port.ai_model.value if port.ai_model else "N/A"
        print(f"  {task}/{complexity} -> Port {port.id} ({ai})")

    print("\n" + "=" * 60)
    print("GORUNFREE!!")


if __name__ == "__main__":
    main()
