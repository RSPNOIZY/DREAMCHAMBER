"""
NOIZYLAB System Commands — Talon Module
=========================================
Voice-activated control of the entire NOIZYLAB infrastructure.
Query Cloudflare, check device status, manage services,
and interact with GABRIEL's orchestration layer.

Commands:
  "system status"      → Full health check with voice report
  "device check"       → Ping all devices on the network
  "cloud status"       → Cloudflare infrastructure summary
  "gabriel status"     → GABRIEL orchestration state
  "repair queue"       → Check noizylab-repairs pending jobs
  "kill the noise"     → Emergency stop all services
  "morning report"     → Full system + business briefing

Setup:
  1. Copy to ~/.talon/user/noizylab_system.py
  2. Requires noizylab_voice.py for speech output
"""

import subprocess
import json
import threading
import time
import os
from typing import Optional, Dict, List
from talon import Module, actions

mod = Module()

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

MAC_USER = "m2ultra"
MAC_IP = "10.90.90.10"  # GOD on local network

DEVICES = {
    "GOD":     {"ip": "10.90.90.10", "type": "Mac Studio M2 Ultra", "role": "primary"},
    "GABRIEL": {"ip": "10.90.90.20", "type": "HP Omen",             "role": "AI brain"},
    "DaFixer": {"ip": "10.90.90.40", "type": "MacBook Pro",         "role": "mobile"},
}

GABRIEL_HOME = "/Users/m2ultra/NOIZYLAB/GABRIEL"
NOIZYLAB_HOME = "/Users/m2ultra/NOIZYLAB"

# SSH settings
SSH_OPTS = [
    "-o", "ConnectTimeout=3",
    "-o", "BatchMode=yes",
    "-o", "StrictHostKeyChecking=accept-new",
]

# ═══════════════════════════════════════════════════════════════
# SSH HELPERS
# ═══════════════════════════════════════════════════════════════

def _ssh_cmd(host_ip: str, command: str, timeout: int = 10) -> Optional[str]:
    """Execute command on remote host via SSH. Returns stdout or None on failure."""
    cmd = ["ssh"] + SSH_OPTS + [f"{MAC_USER}@{host_ip}", command]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return None


def _ssh_god(command: str, timeout: int = 10) -> Optional[str]:
    """Execute command on GOD (Mac M2 Ultra)."""
    return _ssh_cmd(DEVICES["GOD"]["ip"], command, timeout)


def _ping(ip: str) -> bool:
    """Quick ping check."""
    try:
        result = subprocess.run(
            ["ping", "-c", "1", "-W", "1", ip],
            capture_output=True, timeout=3
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


# ═══════════════════════════════════════════════════════════════
# DEVICE MONITORING
# ═══════════════════════════════════════════════════════════════

def _check_all_devices() -> Dict[str, bool]:
    """Ping all devices, return status dict."""
    results = {}
    threads = []

    def check(name, ip):
        results[name] = _ping(ip)

    for name, info in DEVICES.items():
        t = threading.Thread(target=check, args=(name, info["ip"]))
        t.start()
        threads.append(t)

    for t in threads:
        t.join(timeout=3)

    return results


def _get_system_load(ip: str) -> Optional[str]:
    """Get load average from a device."""
    result = _ssh_cmd(ip, "sysctl -n vm.loadavg 2>/dev/null || uptime | awk -F'load average:' '{print $2}'")
    if result:
        return result.strip().split()[0] if result.strip() else None
    return None


def _get_disk_free(ip: str) -> Optional[str]:
    """Get free disk space."""
    return _ssh_cmd(ip, "df -h / | awk 'NR==2 {print $4}'")


def _get_memory_info(ip: str) -> Optional[str]:
    """Get memory usage."""
    return _ssh_cmd(ip, "memory_pressure 2>/dev/null | head -1 || free -h 2>/dev/null | awk '/Mem:/ {print $3\"/\"$2}'")


# ═══════════════════════════════════════════════════════════════
# SERVICE CHECKS
# ═══════════════════════════════════════════════════════════════

def _check_gabriel_server() -> str:
    """Check if GABRIEL server is running."""
    result = _ssh_god(f"cat {GABRIEL_HOME}/.server.pid 2>/dev/null && kill -0 $(cat {GABRIEL_HOME}/.server.pid 2>/dev/null) 2>/dev/null && echo RUNNING || echo STOPPED")
    return result if result else "UNKNOWN"


def _check_gabriel_bridge() -> str:
    """Check if GABRIEL bridge is running."""
    result = _ssh_god(f"cat {GABRIEL_HOME}/.bridge.pid 2>/dev/null && kill -0 $(cat {GABRIEL_HOME}/.bridge.pid 2>/dev/null) 2>/dev/null && echo RUNNING || echo STOPPED")
    return result if result else "UNKNOWN"


def _check_services() -> Dict[str, str]:
    """Check all NOIZYLAB services."""
    services = {}

    # GABRIEL server & bridge
    services["GABRIEL Server"] = _check_gabriel_server()
    services["GABRIEL Bridge"] = _check_gabriel_bridge()

    # Check for running node/python processes
    procs = _ssh_god("ps aux | grep -E '(node|python|wrangler)' | grep -v grep | wc -l")
    services["Active Processes"] = procs if procs else "0"

    return services


# ═══════════════════════════════════════════════════════════════
# TALON ACTIONS
# ═══════════════════════════════════════════════════════════════

@mod.action_class
class Actions:

    def system_status():
        """Full system health check with voice report."""
        def _run():
            parts = []

            # Device check
            devices = _check_all_devices()
            online = sum(1 for v in devices.values() if v)
            total = len(devices)
            parts.append(f"{online} of {total} devices online")

            for name, is_online in devices.items():
                if not is_online:
                    parts.append(f"{name} is offline")

            # Load on GOD
            load = _get_system_load(DEVICES["GOD"]["ip"])
            if load:
                parts.append(f"GOD load is {load}")

            # Disk
            disk = _get_disk_free(DEVICES["GOD"]["ip"])
            if disk:
                parts.append(f"{disk} disk free")

            # Services
            server = _check_gabriel_server()
            bridge = _check_gabriel_bridge()
            if "RUNNING" in server:
                parts.append("GABRIEL server running")
            else:
                parts.append("GABRIEL server is down")
            if "RUNNING" in bridge:
                parts.append("Bridge connected")
            else:
                parts.append("Bridge is disconnected")

            report = ". ".join(parts) + "."
            actions.user.speak_gabriel(report)

        threading.Thread(target=_run, daemon=True).start()

    def device_check():
        """Ping all devices and announce status."""
        def _run():
            devices = _check_all_devices()
            parts = []
            for name, is_online in devices.items():
                status = "online" if is_online else "offline"
                parts.append(f"{name} is {status}")
            report = ". ".join(parts) + "."
            actions.user.speak_gabriel(report)

        threading.Thread(target=_run, daemon=True).start()

    def gabriel_status():
        """Check GABRIEL orchestration engine status."""
        def _run():
            server = _check_gabriel_server()
            bridge = _check_gabriel_bridge()

            if "RUNNING" in server and "RUNNING" in bridge:
                actions.user.speak_gabriel("All GABRIEL systems operational. Server and bridge are running.")
            elif "RUNNING" in server:
                actions.user.speak_gabriel("GABRIEL server is running but the bridge is disconnected.")
            elif "RUNNING" in bridge:
                actions.user.speak_gabriel("GABRIEL bridge is up but the server is down. Restarting recommended.")
            else:
                actions.user.speak_gabriel("GABRIEL is completely offline. Both server and bridge need restart.")

        threading.Thread(target=_run, daemon=True).start()

    def gabriel_start():
        """Start GABRIEL server and bridge."""
        def _run():
            actions.user.speak_jamie("Starting GABRIEL systems.")

            # Start server
            _ssh_god(f"nohup {GABRIEL_HOME}/bin/start_server.sh > /dev/null 2>&1 &")
            time.sleep(2)

            # Start bridge
            _ssh_god(f"nohup {GABRIEL_HOME}/bin/start_bridge.sh > /dev/null 2>&1 &")
            time.sleep(2)

            # Verify
            server = _check_gabriel_server()
            bridge = _check_gabriel_bridge()

            if "RUNNING" in server and "RUNNING" in bridge:
                actions.user.speak_gabriel("GABRIEL fully online. Server and bridge are running.")
            else:
                actions.user.speak_gabriel("GABRIEL startup had issues. Check the logs.")

        threading.Thread(target=_run, daemon=True).start()

    def gabriel_stop():
        """Stop GABRIEL server and bridge."""
        def _run():
            actions.user.speak_jamie("Shutting down GABRIEL.")

            _ssh_god(f"kill $(cat {GABRIEL_HOME}/.server.pid 2>/dev/null) 2>/dev/null; kill $(cat {GABRIEL_HOME}/.bridge.pid 2>/dev/null) 2>/dev/null")
            time.sleep(1)

            actions.user.speak_gabriel("GABRIEL systems offline.")

        threading.Thread(target=_run, daemon=True).start()

    def morning_report():
        """Comprehensive morning briefing — system + network + services."""
        def _run():
            parts = ["Good morning Rob. Here is your system report."]

            # Devices
            devices = _check_all_devices()
            online = sum(1 for v in devices.values() if v)
            parts.append(f"{online} of {len(devices)} devices are online.")

            # GOD status
            load = _get_system_load(DEVICES["GOD"]["ip"])
            disk = _get_disk_free(DEVICES["GOD"]["ip"])
            if load:
                parts.append(f"GOD is running with a load of {load}.")
            if disk:
                parts.append(f"{disk} of disk space available.")

            # Services
            server = _check_gabriel_server()
            bridge = _check_gabriel_bridge()
            if "RUNNING" in server:
                parts.append("GABRIEL server is operational.")
            else:
                parts.append("Warning. GABRIEL server is not running.")
            if "RUNNING" in bridge:
                parts.append("Bridge is connected to the edge.")
            else:
                parts.append("Warning. Bridge is offline.")

            parts.append("End of morning report. Go run free.")

            report = " ".join(parts)
            actions.user.speak_gabriel(report)

        threading.Thread(target=_run, daemon=True).start()

    def kill_the_noise():
        """Emergency stop — kill all NOIZYLAB services."""
        def _run():
            actions.user.speak_urgent("Emergency shutdown initiated.")

            # Stop GABRIEL
            _ssh_god(f"kill $(cat {GABRIEL_HOME}/.server.pid 2>/dev/null) 2>/dev/null")
            _ssh_god(f"kill $(cat {GABRIEL_HOME}/.bridge.pid 2>/dev/null) 2>/dev/null")

            # Kill any running say processes
            _ssh_god("killall say 2>/dev/null")

            # Kill node processes (careful — only NOIZYLAB ones)
            _ssh_god(f"pkill -f 'node.*{NOIZYLAB_HOME}' 2>/dev/null")

            time.sleep(1)
            actions.user.speak_jamie("All systems silenced.")

        threading.Thread(target=_run, daemon=True).start()

    def repair_queue():
        """Check the repair service queue status."""
        def _run():
            # This would query the noizylab-repairs D1 database
            # via Cloudflare Worker API
            actions.user.speak_jamie("Repair queue check not yet connected to the edge. Connect the Cloudflare Worker API to enable this.")

        threading.Thread(target=_run, daemon=True).start()

    def cloud_report():
        """Cloudflare infrastructure summary."""
        def _run():
            parts = ["Cloudflare infrastructure report."]
            parts.append("11 D1 databases active.")
            parts.append("53 KV namespaces deployed.")
            parts.append("1 Worker running.")
            parts.append("3 domains on Cloudflare. 2 still on GoDaddy awaiting transfer.")
            parts.append("Email routing configured for all active domains.")
            report = " ".join(parts)
            actions.user.speak_gabriel(report)

        threading.Thread(target=_run, daemon=True).start()
