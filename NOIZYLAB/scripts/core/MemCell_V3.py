#!/usr/bin/env python3
"""
MemCell V3 — Gabriel's persistent memory.

Real implementation. JSON-backed, atomic writes, thread-safe enough for
single-process supervisor use. Tracks actions, detects patterns, exposes
context for LLM injection.

The schema in evolution_status.json (consumed by turbo_evolution.py and
turbo_bridge.py) is preserved exactly:

  {
    "neural_state": {
      "short_term":  [{"a": action, "s": subject, "ctx": {...}, "ts": iso}, ...],
      "patterns":    ["repeated:foo", ...],
      "vibe":        "neutral|focused|connected|critical"
    }
  }
"""
from __future__ import annotations

import json
import os
import threading
import datetime
from collections import Counter
from pathlib import Path
from typing import Any

MEMORY_DIR = Path.home() / "NOIZYANTHROPIC" / "NOIZYLAB" / "memory"
MEMORY_FILE = MEMORY_DIR / "memcell_v3.json"
SHORT_TERM_CAP = 500            # rolling window
PATTERN_THRESHOLD = 3           # 3+ repetitions of (action, subject) = pattern
VIBE_CRITICAL_KEYWORDS = {"error", "fail", "crash", "panic", "broken", "dead"}
VIBE_CONNECTED_KEYWORDS = {"deploy", "ship", "complete", "merged", "live"}

_lock = threading.Lock()


class MemCell:
    def __init__(self, path: Path = MEMORY_FILE):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._load()

    # ---------- persistence ----------
    def _load(self) -> None:
        if self.path.exists():
            try:
                with open(self.path) as f:
                    self.state = json.load(f)
            except Exception:
                self.state = self._empty()
        else:
            self.state = self._empty()

    def _empty(self) -> dict:
        return {
            "neural_state": {
                "short_term": [],
                "patterns": [],
                "vibe": "neutral",
            },
            "long_term": {},
        }

    def _save(self) -> None:
        tmp = self.path.with_suffix(".json.tmp")
        with open(tmp, "w") as f:
            json.dump(self.state, f, indent=2)
        os.replace(tmp, self.path)

    # ---------- core API ----------
    def track(self, action: str, subject: str, ctx: dict | None = None) -> None:
        """Record a single action against a subject. Updates patterns + vibe."""
        with _lock:
            entry = {
                "a": action,
                "s": subject,
                "ctx": ctx or {},
                "ts": datetime.datetime.now().isoformat(timespec="seconds"),
            }
            ns = self.state["neural_state"]
            ns["short_term"].append(entry)
            # Roll window
            if len(ns["short_term"]) > SHORT_TERM_CAP:
                ns["short_term"] = ns["short_term"][-SHORT_TERM_CAP:]
            self._recompute_patterns()
            self._recompute_vibe(action, subject, ctx or {})
            self._save()

    def recall(self, n: int = 10, subject: str | None = None) -> list[dict]:
        """Return the last n actions, optionally filtered by subject."""
        items = self.state["neural_state"]["short_term"]
        if subject:
            items = [e for e in items if e["s"] == subject]
        return items[-n:]

    def remember(self, key: str, value: Any) -> None:
        """Long-term key/value store (survives session)."""
        with _lock:
            self.state.setdefault("long_term", {})[key] = value
            self._save()

    def lookup(self, key: str, default: Any = None) -> Any:
        return self.state.get("long_term", {}).get(key, default)

    def inject_omniscience(self) -> str:
        """Compact context string suitable for prepending to an LLM prompt."""
        ns = self.state["neural_state"]
        recent = ns["short_term"][-5:]
        recent_str = "; ".join(f"{e['a']}({e['s']})" for e in recent) or "none"
        patterns_str = ", ".join(ns["patterns"][:5]) or "none"
        return (
            f"[GABRIEL CONTEXT] vibe={ns['vibe']}, "
            f"patterns=[{patterns_str}], recent=[{recent_str}]"
        )

    # ---------- analysis ----------
    def _recompute_patterns(self) -> None:
        ns = self.state["neural_state"]
        history = ns["short_term"]
        counts = Counter((e["a"], e["s"]) for e in history)
        ns["patterns"] = [
            f"{a}:{s}={n}" for (a, s), n in counts.items() if n >= PATTERN_THRESHOLD
        ]

    def _recompute_vibe(self, action: str, subject: str, ctx: dict) -> None:
        blob = " ".join([action, subject, json.dumps(ctx)]).lower()
        ns = self.state["neural_state"]
        if any(k in blob for k in VIBE_CRITICAL_KEYWORDS):
            ns["vibe"] = "critical"
        elif any(k in blob for k in VIBE_CONNECTED_KEYWORDS):
            ns["vibe"] = "connected"
        elif len(ns["short_term"]) > 20:
            ns["vibe"] = "focused"
        else:
            ns["vibe"] = "neutral"


# Convenience CLI: `python MemCell_V3.py track <action> <subject>`
if __name__ == "__main__":
    import sys

    mc = MemCell()
    if len(sys.argv) < 2:
        print(json.dumps(mc.state, indent=2))
        sys.exit(0)
    cmd = sys.argv[1]
    if cmd == "track" and len(sys.argv) >= 4:
        mc.track(sys.argv[2], sys.argv[3])
        print(f"tracked: {sys.argv[2]} → {sys.argv[3]}")
    elif cmd == "recall":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        for e in mc.recall(n):
            print(f"{e['ts']}  {e['a']:20s}  {e['s']}")
    elif cmd == "context":
        print(mc.inject_omniscience())
    else:
        print("usage: MemCell_V3.py [track <action> <subject> | recall [N] | context]")
