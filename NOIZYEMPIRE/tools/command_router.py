#!/usr/bin/env python3
"""NOIZY Creator Workstation command router.

Usage:
  python3 tools/command_router.py "capture idea build dreamchamber mode"
"""

from __future__ import annotations

import json
import shlex
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "workstation" / "commands.json"


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def normalize(text: str) -> str:
    return " ".join(text.strip().lower().split())


def run_command(shell_cmd: str) -> int:
    print(f"[router] executing: {shell_cmd}")
    result = subprocess.run(shell_cmd, shell=True, cwd=str(ROOT))
    return result.returncode


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python3 tools/command_router.py \"<phrase>\"")
        return 1

    phrase = normalize(" ".join(sys.argv[1:]))
    cfg = load_config()
    commands = cfg.get("commands", [])

    for item in commands:
        matches = item.get("match_any", [])
        for trigger in matches:
            trigger_norm = normalize(trigger)
            if trigger_norm in phrase:
                cmd = item["exec"]
                if item.get("requires_tail"):
                    tail = phrase.replace(trigger_norm, "", 1).strip()
                    if not tail:
                        print(
                            f"[router] command '{item['id']}' needs additional text."
                        )
                        return 2
                    safe_tail = shlex.quote(tail)
                    if "{tail}" in cmd:
                        cmd = cmd.replace("{tail}", safe_tail)
                    else:
                        cmd = f"{cmd} {safe_tail}"
                return run_command(cmd)

    print("[router] no command matched.")
    print("[router] available triggers:")
    for item in commands:
        print(f"  - {item.get('id')}: {', '.join(item.get('match_any', []))}")
    return 3


if __name__ == "__main__":
    raise SystemExit(main())
