#!/usr/bin/env python3
"""Fix all broken session-env files in ~/.claude/session-env/

Fixes two issues:
1. Unquoted NOIZY_SESSION_START with space in datetime (shell syntax error)
2. Unquoted NOIZY_PROJECT_ROOT paths

Run: python3 fix-session-env.py
"""
import glob
import re

files = glob.glob("/Users/m2ultra/.claude/session-env/*/sessionstart-hook-0.sh")
print(f"Scanning {len(files)} session-env files...")
fixed = 0

for f in files:
    with open(f) as fh:
        content = fh.read()
    original = content

    # Fix unquoted NOIZY_SESSION_START with space in datetime
    # e.g. export NOIZY_SESSION_START=2026-04-07 20:45:23
    # becomes export NOIZY_SESSION_START="2026-04-07T20:45:23"
    content = re.sub(
        r'^(export NOIZY_SESSION_START=)(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$',
        r'\1"\2T\3"',
        content, flags=re.MULTILINE
    )

    # Fix quoted NOIZY_SESSION_START with space instead of T
    # e.g. export NOIZY_SESSION_START="2026-04-13 12:37:15"
    # becomes export NOIZY_SESSION_START="2026-04-13T12:37:15"
    content = re.sub(
        r'^(export NOIZY_SESSION_START=")(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}")$',
        r'\1\2T\3',
        content, flags=re.MULTILINE
    )

    # Fix unquoted NOIZY_PROJECT_ROOT
    # e.g. export NOIZY_PROJECT_ROOT=/Users/m2ultra/NOIZYANTHROPIC
    # becomes export NOIZY_PROJECT_ROOT="/Users/m2ultra/NOIZYANTHROPIC"
    content = re.sub(
        r'^(export NOIZY_PROJECT_ROOT=)(/[^\s"]+)$',
        r'\1"\2"',
        content, flags=re.MULTILINE
    )

    if content != original:
        with open(f, "w") as fh:
            fh.write(content)
        fixed += 1
        print(f"  Fixed: {f.split('/')[-2]}")

print(f"\nDone. Fixed {fixed}/{len(files)} files.")
