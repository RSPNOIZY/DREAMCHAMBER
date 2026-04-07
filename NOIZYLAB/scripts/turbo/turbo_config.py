#!/usr/bin/env python3
"""
turbo_config.py
Secure Configuration Manager for the Gabriel System.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv, set_key

# Paths
ROOT_DIR = Path.home() / "NOIZYANTHROPIC" / "NOIZYLAB"
ENV_FILE = ROOT_DIR / ".env"

def init_env():
    """Ensure .env exists."""
    if not ENV_FILE.exists():
        ENV_FILE.touch()
        ENV_FILE.chmod(0o600) # Read/Write for owner only
        print(f"🔒 Created secure env file: {ENV_FILE}")

def get_config(key):
    """Retrieve a config value."""
    load_dotenv(ENV_FILE)
    return os.getenv(key)

def set_config(key, value):
    """Set a config value."""
    init_env()
    # dotenv.set_key writes to the file
    set_key(ENV_FILE, key, value)
    print(f"✅ Set {key} = [HIDDEN]")

def main():
    if len(sys.argv) < 2:
        print("Usage: turbo_config.py [get <key> | set <key> <value> | setup]")
        return

    cmd = sys.argv[1]

    if cmd == "setup":
        print("🔐 **GABRIEL SECURITY SETUP** 🔐")
        print("Enter API Keys (leave blank to skip):")
        
        keys = ["OPENAI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GENAI_API_KEY", "ELEVENLABS_API_KEY", "SUNO_API_KEY", "GOOGLE_CLOUD_PROJECT"]
        for k in keys:
            val = input(f"{k}: ").strip()
            if val:
                set_config(k, val)
                
    elif cmd == "set" and len(sys.argv) == 4:
        set_config(sys.argv[2], sys.argv[3])
        
    elif cmd == "get" and len(sys.argv) == 3:
        val = get_config(sys.argv[2])
        print(f"{sys.argv[2]}: {val if val else 'NOT SET'}")
        
    else:
        print("Unknown command or missing arguments.")

if __name__ == "__main__":
    init_env()
    main()
