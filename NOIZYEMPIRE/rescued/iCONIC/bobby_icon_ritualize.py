#!/usr/bin/env python3
"""
Bobby Icon Ritualize
A macOS utility that applies Bobby custom icons to folders without existing custom icons.

Author: GitHub Copilot Assistant
Date: October 2, 2025
"""

import os
import subprocess
from pathlib import Path
from shutil import copyfile

# 🔧 CONFIGURATION
BOBBY_ICON_PATH = "/Users/rob/Desktop/bobby_bg.png"  # Update this path to your actual Bobby image
TARGET_ROOT = "/Users/rob/Documents"  # Folder to scan for subfolders
ICON_FILE_NAME = "Icon\r"

# 🧠 Check if folder has a custom icon
def has_custom_icon(folder_path):
    """Check if a folder already has a custom icon."""
    icon_file = Path(folder_path) / ICON_FILE_NAME
    return icon_file.exists()

# 🧿 Apply Bobby icon to folder
def apply_icon(folder_path):
    """Apply the Bobby icon to a folder using fileicon command."""
    try:
        subprocess.run([
            "fileicon", "set", folder_path, BOBBY_ICON_PATH
        ], check=True)
        print(f"✅ Icon applied to: {folder_path}")
    except subprocess.CalledProcessError:
        print(f"⚠️ Failed to apply icon to: {folder_path}")
    except FileNotFoundError:
        print("❌ fileicon command not found. Please install it using: brew install fileicon")

# 🔍 Scan and apply
def ritualize_folders():
    """Scan folders and apply Bobby icons where needed."""
    print("🔧 Scanning folders...")
    
    if not Path(BOBBY_ICON_PATH).exists():
        print(f"❌ Bobby icon not found at: {BOBBY_ICON_PATH}")
        print("Please update BOBBY_ICON_PATH in the configuration section.")
        return
    
    if not Path(TARGET_ROOT).exists():
        print(f"❌ Target directory not found: {TARGET_ROOT}")
        print("Please update TARGET_ROOT in the configuration section.")
        return
    
    for root, dirs, _ in os.walk(TARGET_ROOT):
        for folder in dirs:
            folder_path = os.path.join(root, folder)
            if not has_custom_icon(folder_path):
                apply_icon(folder_path)
            else:
                print(f"🛡️ Custom icon preserved: {folder_path}")

# 🚀 Run Ritual
if __name__ == "__main__":
    ritualize_folders()
    print("🌟 Bobby background applied to all default folders.")