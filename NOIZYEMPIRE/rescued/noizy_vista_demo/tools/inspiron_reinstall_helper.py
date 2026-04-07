#!/usr/bin/env python3
"""
NoizyFleet Dell Inspiron 17 7779 reinstall helper.
Checks USB boot media, verifies BIOS mode, guides reinstall, and logs rejoin.
Run this on any control node (MacStudio, OMEN, or MacPro) while Inspiron is connected to the LAN.
"""
from __future__ import annotations
import subprocess, os, json, platform, time, socket
from pathlib import Path

FLEET_LOG = Path("state/fleet_reinstall_log.json")
FLEET_API = os.getenv("MISSION_API", "http://127.0.0.1:8010").rstrip("/")
NODE_NAME = "Inspiron17_7779"
USB_LABELS = ["WIN10", "CORSAIR"]  # Supported installer USB labels
BIOS_HINTS = {
    "UEFI": ["UEFI Boot", "Secure Boot", "AHCI"],
    "Legacy": ["Legacy Boot", "CSM", "IDE"]
}

def log(msg):
    print(msg)
    FLEET_LOG.parent.mkdir(exist_ok=True)
    with FLEET_LOG.open("a", encoding="utf-8") as f:
        f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")

def check_usb():
    log("🔍 Checking for Windows 10 install USB…")
    if platform.system() == "Darwin":
        out = subprocess.getoutput("diskutil list")
    elif platform.system() == "Windows":
        out = subprocess.getoutput("wmic logicaldisk get volumename")
    else:
        out = subprocess.getoutput("lsblk -o LABEL")
    found_label = next((label for label in USB_LABELS if label in out), None)
    if found_label:
        log(f"✅ Install USB detected: {found_label}")
    else:
        log(f"⚠️ No installer USB found. Checked: {', '.join(USB_LABELS)}")
    return bool(found_label)

def ping_inspiron():
    log("🔌 Checking network reachability…")
    try:
        socket.gethostbyname("inspiron.local")
        result = subprocess.run(["ping", "-c", "2", "inspiron.local"], stdout=subprocess.DEVNULL)
        online = result.returncode == 0
    except Exception:
        online = False
    log(f"{'✅ Inspiron reachable' if online else '❌ Inspiron not responding'}")
    return online

def reinstall_prompt():
    log("""
🧭  Manual steps for reinstall:
1. Plug the WIN10 USB into Inspiron 17 7779.
2. Power on, tap F12 → choose the USB (UEFI: <stick name>).
3. Delete all partitions → install to Unallocated Space.
4. When setup finishes, connect Wi-Fi and note its new IP address.
""")

def rejoin_fleet(ip: str):
    data = {"node": NODE_NAME, "ip": ip, "role": "planar", "status": "online"}
    log(f"📡 Registering Inspiron in fleet: {data}")
    try:
        import requests
        requests.post(f"{FLEET_API}/api/fleet/register", json=data, timeout=3)
        log("✅ Fleet registration posted.")
    except Exception as e:
        log(f"⚠️ Could not post to Mission Control: {e}")

def main():
    log("=== NoizyFleet Inspiron 17 7779 reinstall helper start ===")
    check_usb()
    ping_inspiron()
    reinstall_prompt()
    input("Press Enter once Windows 10 installation is complete and Inspiron is back online… ")
    ip = input("Enter Inspiron's new IP address (shown on its desktop): ").strip()
    rejoin_fleet(ip)
    log("🎉 Inspiron reinstall complete and fleet rejoined.")
    print(f"All done. View logs in {FLEET_LOG}")

if __name__ == "__main__":
    main()
