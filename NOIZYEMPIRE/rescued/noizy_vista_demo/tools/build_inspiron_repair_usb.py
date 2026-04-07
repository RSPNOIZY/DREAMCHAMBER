#!/usr/bin/env python3
"""
Builds a complete Repair USB for DELL Inspiron 17 7779 2-in-1.
Copies Windows ISO, Dell drivers, firmware, updates, and fleet tools to the USB.
Run on Windows, Mac, or Linux. Specify USB mount point and resource folders.
"""
import shutil, os, sys
from pathlib import Path
import subprocess

# CONFIGURE THESE PATHS
USB_MOUNT = Path(input("Enter USB mount path (e.g., E:/ or /Volumes/CORSAIR): ").strip())
WIN_ISO = Path(input("Path to Windows ISO: ").strip())
DELL_DRIVERS = Path(input("Path to DELL drivers folder: ").strip())
DELL_FIRMWARE = Path(input("Path to DELL firmware folder: ").strip())
WIN_UPDATES = Path(input("Path to Windows updates folder: ").strip())
FLEET_TOOLS = Path(input("Path to fleet tools folder: ").strip())

folders = [
    (WIN_ISO, USB_MOUNT / "Windows_ISO"),
    (DELL_DRIVERS, USB_MOUNT / "DELL_DRIVERS"),
    (DELL_FIRMWARE, USB_MOUNT / "DELL_FIRMWARE"),
    (WIN_UPDATES, USB_MOUNT / "WIN_UPDATES"),
    (FLEET_TOOLS, USB_MOUNT / "FLEET_TOOLS"),
]

def copytree(src, dst):
    if src.is_file():
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
    elif src.is_dir():
        dst.mkdir(parents=True, exist_ok=True)
        for item in src.iterdir():
            s = item
            d = dst / item.name
            copytree(s, d)
    else:
        print(f"⚠️ Source not found or not a file/folder: {src}")

print(f"Building Repair USB at {USB_MOUNT}…")
for src, dst in folders:
    if src.exists():
        print(f"Copying {src} → {dst}")
        copytree(src, dst)
    else:
        print(f"⚠️ Source not found: {src}")
print("✅ Repair USB build complete.")

os.system("networksetup -getinfo Wi-Fi")
os.system("networksetup -getinfo Ethernet")

def run(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, text=True).strip()
    except subprocess.CalledProcessError as e:
        return e.output.strip()

print("\n🔍 Checking available network interfaces...")
interfaces = run("networksetup -listallhardwareports")

if "Ethernet" not in interfaces:
    print("⚠️  Ethernet interface not found. Attempting to re-add...")
    # Find a likely hardware device (usually en0 or en1)
    devices = [line.split(": ")[1] for line in interfaces.splitlines() if line.startswith("Device")]
    guessed = "en0" if "en0" in interfaces else (devices[0] if devices else None)
    if guessed:
        print(f"💡 Trying to attach {guessed} as Ethernet...")
        run(f"sudo networksetup -createnetworkservice Ethernet {guessed}")
        run("sudo networksetup -setmanual Ethernet 192.168.1.50 255.255.255.0 192.168.1.1 || true")
        print("✅ Ethernet service created. Open System Settings → Network to confirm.")
    else:
        print("❌ No hardware devices detected. Check cable or adapter.")
else:
    print("✅ Ethernet interface exists.")
    service_status = run("networksetup -getinfo Ethernet")
    print(service_status or "No IP info found — plug in the cable and it should light up.")

print("\n💡 Tip: You can also refresh the network stack manually with:")
print("sudo ifconfig en0 down && sudo ifconfig en0 up\n")
