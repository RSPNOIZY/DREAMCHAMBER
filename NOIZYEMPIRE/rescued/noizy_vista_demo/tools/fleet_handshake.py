#!/usr/bin/env python3
"""
Robust Fleet Handshake Orchestration Script
Checks connectivity, retries, and logs results for OMEN, Inspiron, MacStudio, MacPro
"""
import subprocess
import time
import sys
import os
import shutil
from datetime import datetime
import winrm

sys.path.append(os.path.dirname(__file__))
from move_noizywin_assets import inject_assets

NODES = [
    {"name": "OMEN", "ip": "192.168.1.101"},
    {"name": "Inspiron", "ip": "192.168.1.102"},
    {"name": "MacStudio", "ip": "192.168.1.103"},
    {"name": "MacPro", "ip": "10.0.0.199"}
]

HANDSHAKE_COMMAND = "echo 'Fleet Handshake Triggered'"
RETRY_LIMIT = 3
PING_TIMEOUT = 2
LOG_PATH = "."
ASSET_DIR = "/path/to/asset/dir"
OEM_PATH = "/path/to/oem/dir"
ISO_ORIG = "/path/to/original.iso"
MOUNT_DIR = "/path/to/mount/dir"
BUILD_DIR = "/path/to/build/dir"
ISO_NEW = "/path/to/new.iso"
WINRM_CREDENTIALS = ('user', 'password')

SLABS = {
    "OMEN": {"host": "192.168.1.101", "port": 5985, "user": "admin", "password": "password"},
    "Inspiron": {"host": "192.168.1.102", "port": 5985, "user": "admin", "password": "password"}
}

# === UTILS ===
def log(message):
    os.makedirs(LOG_PATH, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    with open(os.path.join(LOG_PATH, "ritual.log"), "a") as f:
        f.write(f"[{timestamp}] {message}\n")
    print(f"🧾 {message}")

def ping_node(ip):
    try:
        result = subprocess.run([
            "ping", "-c", "1", "-W", str(PING_TIMEOUT), ip
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return result.returncode == 0
    except Exception as e:
        log(f"Ping error for {ip}: {e}")
        return False

def trigger_handshake(node):
    log(f"Triggering handshake on {node['name']} ({node['ip']})...")
    # Replace with actual remote execution logic (e.g., SSH, WinRM)
    try:
        if "Mac" in node["name"]:
            subprocess.run([
                "ssh", f"user@{node['ip']}", HANDSHAKE_COMMAND
            ], check=True)
        elif node["name"] in ["OMEN", "Inspiron"]:
            log(f"[Simulated] Would run handshake on Windows node: {node['name']}")
        else:
            log(f"Unknown node type: {node['name']}")
    except Exception as e:
        log(f"Error triggering handshake on {node['name']}: {e}")

# === ASSET INJECTION ===
def inject_assets():
    os.makedirs(OEM_PATH, exist_ok=True)
    for file in os.listdir(ASSET_DIR):
        src = os.path.join(ASSET_DIR, file)
        dst = os.path.join(OEM_PATH, file)
        shutil.copy(src, dst)
        log(f"🔥 Asset injected: {file}")

# === ISO BUILD ===
def build_iso():
    log("🔮 Building NOIZYWIN ISO...")
    subprocess.run(["hdiutil", "mount", ISO_ORIG, "-mountpoint", MOUNT_DIR], check=True)
    if os.path.exists(BUILD_DIR): shutil.rmtree(BUILD_DIR)
    shutil.copytree(MOUNT_DIR, BUILD_DIR)
    subprocess.run(["hdiutil", "unmount", MOUNT_DIR], check=True)
    inject_assets()
    subprocess.run(["hdiutil", "makehybrid", "-o", ISO_NEW, BUILD_DIR, "-iso", "-joliet"], check=True)
    log(f"✅ ISO ready: {ISO_NEW}")

# === VM LAUNCH + CUSTOMIZE ===
def start_vm():
    log("🚀 Booting NOIZYWIN VM...")
    subprocess.run(["prlctl", "start", "NOIZYWIN"], check=True)
    time.sleep(20)

# === VM STATUS CHECK ===
def check_vm_status():
    result = subprocess.run(["prlctl", "status", "NOIZYWIN"], capture_output=True, text=True)
    log(f"🖥️ NOIZYWIN VM status: {result.stdout.strip()}")
    return result.stdout.strip()

# === WINRM CONNECTIVITY CHECK ===
def check_winrm(host, port, user, password):
    try:
        session = winrm.Session(f"http://{host}:{port}/wsman", auth=(user, password))
        result = session.run_cmd('echo WinRM OK')
        if result.status_code == 0:
            log(f"🔗 WinRM connection to {host}:{port} successful.")
            return True
        else:
            log(f"❌ WinRM connection to {host}:{port} failed: {result.std_err.decode()}")
            return False
    except Exception as e:
        log(f"❌ WinRM error for {host}:{port}: {e}")
        return False

# === VM CUSTOMIZE ===
def customize_vm():
    log("🎨 Customizing NOIZYWIN desktop...")
    session = winrm.Session('http://NOIZYWIN:5985/wsman', auth=WINRM_CREDENTIALS)
    commands = [
        'taskkill /F /IM Cortana.exe',
        'taskkill /F /IM SpeechRuntime.exe',
        'powershell.exe -Command "Set-ItemProperty -Path HKCU:\\Control Panel\\Desktop -Name Wallpaper -Value C:\\NOIZYGRID\\NOIZY.jpg"',
        'powershell.exe -Command "Checkpoint-Computer -Description NOIZYFISH_Rebirth -RestorePointType MODIFY_SETTINGS"'
    ]
    for cmd in commands:
        result = session.run_cmd(cmd)
        log(f"✅ NOIZYWIN: {cmd}\n{result.std_out.decode()}")

# === REMOTE SLAB CONTROL ===
def heal_slabs():
    log("🧙‍♂️ Healing OMEN and Inspiron remotely...")
    for name, slab in SLABS.items():
        if check_winrm(slab['host'], slab['port'], slab['user'], slab['password']):
            session = winrm.Session(f"http://{slab['host']}:{slab['port']}/wsman", auth=(slab['user'], slab['password']))
            for cmd in [
                'taskkill /F /IM Cortana.exe',
                'taskkill /F /IM SpeechRuntime.exe',
                'powershell.exe -Command "Set-ItemProperty -Path HKCU:\\Control Panel\\Desktop -Name Wallpaper -Value C:\\NOIZYGRID\\NOIZY.jpg"',
                'powershell.exe -Command "Checkpoint-Computer -Description NOIZYGRID_RemoteRebirth -RestorePointType MODIFY_SETTINGS"'
            ]:
                result = session.run_cmd(cmd)
                log(f"✅ {name}: {cmd}\n{result.std_out.decode()}")
        else:
            log(f"⚠️ Skipping {name}: WinRM not available.")

# === MAIN RITUAL ===
def main():
    log("🌌 Initiating NOIZYGRID Paradise Builder...")
    build_iso()
    check_vm_status()
    start_vm()
    customize_vm()
    heal_slabs()
    log("🌟 NOIZYGRID Paradise fully deployed.")

    log("Starting Fleet Handshake...")
    if len(sys.argv) > 1 and sys.argv[1] == "ping":
        log("Pinging all fleet nodes...")
        for node in NODES:
            log(f"Pinging {node['name']} ({node['ip']})...")
            if ping_node(node["ip"]):
                log(f"{node['name']} is reachable.")
            else:
                log(f"{node['name']} is unreachable.")
        log("Ping check complete.")
        return

    for node in NODES:
        reachable = False
        for attempt in range(1, RETRY_LIMIT + 1):
            log(f"Checking connectivity to {node['name']} ({node['ip']}) [Attempt {attempt}]...")
            if ping_node(node["ip"]):
                log(f"{node['name']} is reachable.")
                reachable = True
                break
            else:
                log(f"{node['name']} is unreachable. Retrying...")
                time.sleep(2)
        if not reachable:
            log(f"Forcing handshake on unreachable node: {node['name']} ({node['ip']})")
        else:
            log(f"Proceeding with handshake for {node['name']} ({node['ip']})")
        trigger_handshake(node)
    log("Fleet Handshake complete.")

    # Added ipconfig command execution
    try:
        log("Executing ipconfig on all nodes...")
        for node in NODES:
            log(f"Running ipconfig on {node['name']} ({node['ip']})...")
            if "Mac" in node["name"]:
                subprocess.run([
                    "ssh", f"user@{node['ip']}", "ipconfig"
                ], check=True)
            elif node["name"] in ["OMEN", "Inspiron"]:
                log(f"[Simulated] Would run ipconfig on Windows node: {node['name']}")
            else:
                log(f"Unknown node type for ipconfig: {node['name']}")
    except Exception as e:
        log(f"Error executing ipconfig: {e}")

    # Execute fleet_status.sh script
    try:
        log("Executing fleet_status.sh on all nodes...")
        for node in NODES:
            log(f"Running fleet_status.sh on {node['name']} ({node['ip']})...")
            if "Mac" in node["name"]:
                subprocess.run([
                    "ssh", f"user@{node['ip']}", "/Users/rsp_ms/noizy_vista_demo/tools/fleet_status.sh"
                ], check=True)
            elif node["name"] in ["OMEN", "Inspiron"]:
                log(f"[Simulated] Would run fleet_status.sh on Windows node: {node['name']}")
            else:
                log(f"Unknown node type for fleet_status.sh: {node['name']}")
    except Exception as e:
        log(f"Error executing fleet_status.sh: {e}")

    # Restart NOIZYWIN VM
    try:
        log("Restarting NOIZYWIN VM...")
        subprocess.run(["prlctl", "stop", "NOIZYWIN", "--kill"], check=True)
        subprocess.run(["prlctl", "start", "NOIZYWIN"], check=True)
        log("NOIZYWIN VM restarted successfully.")
    except Exception as e:
        log(f"Error restarting NOIZYWIN VM: {e}")

    # Inject assets
    try:
        log("Injecting assets to NOIZYWIN VM...")
        inject_assets()
        log("Assets injected successfully.")
    except Exception as e:
        log(f"Error injecting assets: {e}")

def autorun_sequence():
    log("🔁 AutoRun: Starting full NOIZYGRID sequence...")
    build_iso()
    start_vm()
    customize_vm()
    heal_slabs()
    log("✅ AutoRun: Sequence complete.")

if __name__ == "__main__":
    autorun_sequence()
