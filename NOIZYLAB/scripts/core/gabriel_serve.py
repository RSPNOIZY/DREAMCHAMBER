#!/usr/bin/env python3
"""
gabriel_serve — Gabriel's local HTTP backend.

Stdlib only. JSON REST + Server-Sent Events for live telemetry.
Designed to be the load-bearing API behind the cockpit UI, the
DreamChamber panel, and any future client.

Port: 9090 (override with GABRIEL_PORT env var)

Endpoints:
  GET  /api/health             — liveness
  GET  /api/status             — full empire snapshot
  GET  /api/countdown          — days to April 17 2026
  GET  /api/memcell            — full memory state (read-only)
  GET  /api/memcell/recall?n=N — last N memories
  GET  /api/memcell/context    — inject_omniscience string
  POST /api/memcell/track      — body: {action, subject, ctx?}
  GET  /api/tools              — tool inventory + availability
  POST /api/tools/vitals       — run turbo_vitals, return stdout
  POST /api/tools/net          — run turbo_net_check
  POST /api/tools/sync         — run turbo_git_sync
  POST /api/think              — body: {prompt, force?: 'claude'|'local'}
                                  → routes through claude-hybrid
  POST /api/webhook/n8n        — inbound from n8n. Body: arbitrary JSON.
                                  Auto-tracked to MemCell + SSE-broadcast.
                                  Optional fields: action, subject, reflex.
  POST /api/webhook/zapier     — same shape as n8n (separate route for
                                  per-source filtering + auditing)
  POST /api/webhook/generic    — open inbound from Slack/GitHub/curl/etc.
  POST /api/webhook/out        — body: {url, payload, headers?} → Gabriel
                                  fires an outbound POST. Logged to MemCell.
  GET  /api/tree?path=...      — directory listing (jail: ~/NOIZYANTHROPIC)
  GET  /api/file?path=...      — file read (jail + size cap)
  GET  /api/stream             — Server-Sent Events: vitals every 5s,
                                 memcell delta on every track, telemetry
                                 events. text/event-stream.

CORS: open (it's localhost, single-user). Tighten if exposed.
"""
from __future__ import annotations

import datetime
import json
import os
import queue
import shutil
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# ── Bootstrap MemCell ──────────────────────────────────────────────────────
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from MemCell_V3 import MemCell  # noqa: E402
import linear_client  # noqa: E402
import family  # noqa: E402

mc = MemCell()
family.ensure_seeded()

# ── Constants ──────────────────────────────────────────────────────────────
PORT = int(os.environ.get("GABRIEL_PORT", "9090"))
DEADLINE = datetime.date(2026, 4, 17)
TURBO = Path.home() / "NOIZYANTHROPIC" / "NOIZYLAB" / "scripts" / "turbo"
JAIL = Path.home() / "NOIZYANTHROPIC"
HYBRID = shutil.which("claude-hybrid")
GABRIEL_BIN = shutil.which("gabriel") or str(Path.home() / "bin" / "gabriel")
MAX_FILE_BYTES = 512 * 1024  # 512 KB cap on /api/file

# ── SSE broadcast bus ──────────────────────────────────────────────────────
_subscribers: list[queue.Queue] = []
_sub_lock = threading.Lock()


def _broadcast(event: str, data: dict) -> None:
    payload = f"event: {event}\ndata: {json.dumps(data)}\n\n"
    with _sub_lock:
        dead = []
        for q in _subscribers:
            try:
                q.put_nowait(payload)
            except queue.Full:
                dead.append(q)
        for q in dead:
            _subscribers.remove(q)


# Patch MemCell.track to broadcast on every write (zero-touch instrumentation)
_orig_track = mc.track


def _track_and_broadcast(action: str, subject: str, ctx: dict | None = None) -> None:
    _orig_track(action, subject, ctx)
    _broadcast(
        "memcell",
        {
            "action": action,
            "subject": subject,
            "vibe": mc.state["neural_state"]["vibe"],
            "count": len(mc.state["neural_state"]["short_term"]),
        },
    )


mc.track = _track_and_broadcast  # type: ignore[method-assign]


# ── Helpers ────────────────────────────────────────────────────────────────
def _days_left() -> int:
    return (DEADLINE - datetime.date.today()).days


def _safe_path(raw: str) -> Path | None:
    """Resolve raw against JAIL, reject anything outside."""
    try:
        p = (JAIL / raw.lstrip("/")).resolve() if raw else JAIL
        p.relative_to(JAIL)
        return p
    except (ValueError, OSError):
        return None


def _run(cmd: list[str], timeout: int = 60) -> dict:
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return {
            "ok": out.returncode == 0,
            "exit": out.returncode,
            "stdout": out.stdout,
            "stderr": out.stderr,
        }
    except subprocess.TimeoutExpired:
        return {"ok": False, "exit": -1, "stdout": "", "stderr": "timeout"}
    except FileNotFoundError as e:
        return {"ok": False, "exit": -1, "stdout": "", "stderr": str(e)}


def _tool_inventory() -> list[dict]:
    tools = [
        ("vitals", "turbo_vitals.py", "System CPU/RAM/disk snapshot"),
        ("net", "turbo_net_check.py", "Parallel network diagnostic"),
        ("sync", "turbo_git_sync.sh", "Parallel git push of all repos"),
        ("speed", "turbo_speed.py", "Bandwidth test (Cloudflare)"),
        ("fishnet", "turbo_fishnet.py", "Heavy-media hunter (>10MB)"),
        ("zap", "turbo_zap.sh", "Network reset (DNS + interface cycle)"),
        ("plugin_heist", "turbo_plugin_heist.py", "VST/AU vault consolidation"),
        ("recall", "turbo_recall.py", "Project ingestion → MemCell"),
    ]
    return [
        {
            "name": name,
            "file": fname,
            "description": desc,
            "available": (TURBO / fname).exists(),
        }
        for name, fname, desc in tools
    ]


# ── Vitals poller (drives SSE) ─────────────────────────────────────────────
def _vitals_poller() -> None:
    while True:
        try:
            # Cheap stdlib reads — don't shell out every 5s
            import shutil as _sh

            load = os.getloadavg()
            total, used, free = _sh.disk_usage("/")
            _broadcast(
                "vitals",
                {
                    "ts": time.time(),
                    "load_1m": round(load[0], 2),
                    "load_5m": round(load[1], 2),
                    "load_15m": round(load[2], 2),
                    "disk_free_gb": round(free / (1024**3), 1),
                    "disk_pct": round(used / total * 100, 1),
                    "countdown": _days_left(),
                },
            )
        except Exception:
            pass
        time.sleep(5)


# ── HTTP handler ───────────────────────────────────────────────────────────
class Handler(BaseHTTPRequestHandler):
    server_version = "Gabriel/1.0"

    def log_message(self, format, *args):  # silence default access log
        pass

    # ---- response helpers ----
    def _json(self, status: int, obj) -> None:
        body = json.dumps(obj, default=str).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict:
        n = int(self.headers.get("Content-Length", "0"))
        if not n:
            return {}
        try:
            return json.loads(self.rfile.read(n).decode())
        except Exception:
            return {}

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    # ---- routing ----
    def do_GET(self):
        u = urlparse(self.path)
        path = u.path
        qs = parse_qs(u.query)

        if path == "/api/health":
            return self._json(200, {"ok": True, "version": "1.0", "ts": time.time()})

        if path == "/api/countdown":
            return self._json(200, {"days": _days_left(), "deadline": DEADLINE.isoformat()})

        if path == "/api/status":
            ns = mc.state["neural_state"]
            return self._json(
                200,
                {
                    "countdown_days": _days_left(),
                    "deadline": DEADLINE.isoformat(),
                    "memcell": {
                        "vibe": ns["vibe"],
                        "memories": len(ns["short_term"]),
                        "patterns": len(ns["patterns"]),
                        "recent": mc.recall(5),
                    },
                    "tools": _tool_inventory(),
                    "hybrid_router": HYBRID,
                    "gabriel_bin": GABRIEL_BIN,
                },
            )

        if path == "/api/memcell":
            return self._json(200, mc.state)

        if path == "/api/memcell/recall":
            n = int(qs.get("n", ["10"])[0])
            return self._json(200, {"items": mc.recall(n)})

        if path == "/api/memcell/context":
            return self._json(200, {"context": mc.inject_omniscience()})

        if path == "/api/tools":
            return self._json(200, {"tools": _tool_inventory()})

        if path == "/api/tree":
            target = _safe_path(qs.get("path", [""])[0])
            if not target or not target.exists():
                return self._json(404, {"error": "not found or out of jail"})
            if target.is_file():
                return self._json(400, {"error": "use /api/file for files"})
            entries = []
            try:
                for child in sorted(target.iterdir(), key=lambda p: (p.is_file(), p.name.lower())):
                    if child.name.startswith("."):
                        continue
                    try:
                        st = child.stat()
                        entries.append(
                            {
                                "name": child.name,
                                "type": "dir" if child.is_dir() else "file",
                                "size": st.st_size if child.is_file() else None,
                                "mtime": st.st_mtime,
                            }
                        )
                    except OSError:
                        continue
            except PermissionError:
                return self._json(403, {"error": "permission denied"})
            return self._json(
                200,
                {
                    "path": str(target.relative_to(JAIL)) if target != JAIL else "",
                    "entries": entries,
                },
            )

        if path == "/api/file":
            target = _safe_path(qs.get("path", [""])[0])
            if not target or not target.is_file():
                return self._json(404, {"error": "not found or out of jail"})
            try:
                size = target.stat().st_size
                if size > MAX_FILE_BYTES:
                    return self._json(413, {"error": f"file too large ({size} > {MAX_FILE_BYTES})"})
                content = target.read_text(errors="replace")
            except Exception as e:
                return self._json(500, {"error": str(e)})
            return self._json(200, {"path": str(target.relative_to(JAIL)), "content": content, "size": size})

        if path == "/api/family":
            return self._json(200, {"members": family.all_members(), "stats": family.quick_stats()})

        if path == "/api/family/stats":
            return self._json(200, family.quick_stats())

        if path == "/api/family/prompt":
            return self._json(200, {"prompt": family.system_prompt_block()})

        if path.startswith("/api/family/tier/"):
            tier = path.rsplit("/", 1)[1]
            return self._json(200, {"tier": tier, "members": family.by_tier(tier)})

        if path.startswith("/api/family/find/"):
            q = path.rsplit("/", 1)[1]
            from urllib.parse import unquote
            return self._json(200, {"query": unquote(q), "results": family.find(unquote(q))})

        if path.startswith("/api/family/get/"):
            mid = path.rsplit("/", 1)[1]
            m = family.get(mid)
            return self._json(200 if m else 404, m or {"error": "not found"})

        if path == "/api/docker/ps":
            r = _run(["docker", "ps", "--format", "{{json .}}"])
            if not r["ok"]:
                return self._json(503, r)
            containers = []
            for line in r["stdout"].strip().split("\n"):
                if line:
                    try: containers.append(json.loads(line))
                    except: pass
            return self._json(200, {"containers": containers, "count": len(containers)})

        if path == "/api/docker/stats":
            r = _run(["docker", "stats", "--no-stream", "--format", "{{json .}}"])
            if not r["ok"]:
                return self._json(503, r)
            stats = []
            for line in r["stdout"].strip().split("\n"):
                if line:
                    try: stats.append(json.loads(line))
                    except: pass
            return self._json(200, {"stats": stats})

        if path == "/api/linear/issues":
            return self._json(200, linear_client.list_issues(limit=int(qs.get("limit", ["25"])[0])))

        if path == "/api/linear/critical":
            # Try API first; fall back to local snapshot if no key
            result = linear_client.critical_path()
            if not result.get("ok"):
                snap = Path.home() / "NOIZYANTHROPIC/NOIZYLAB/integrations/linear/critical_path.md"
                if snap.exists():
                    result = {"ok": True, "source": "snapshot", "markdown": snap.read_text(), "api_error": result.get("error")}
            return self._json(200, result)

        if path == "/api/stream":
            return self._sse()

        return self._json(404, {"error": "not found", "path": path})

    def do_POST(self):
        u = urlparse(self.path)
        path = u.path
        body = self._read_json()

        if path == "/api/memcell/track":
            action = body.get("action")
            subject = body.get("subject")
            if not action or not subject:
                return self._json(400, {"error": "action and subject required"})
            mc.track(action, subject, body.get("ctx") or {})
            return self._json(200, {"ok": True})

        if path == "/api/tools/vitals":
            script = TURBO / "turbo_vitals.py"
            return self._json(200, _run([sys.executable, str(script)]))

        if path == "/api/tools/net":
            script = TURBO / "turbo_net_check.py"
            return self._json(200, _run([sys.executable, str(script)], timeout=120))

        if path == "/api/tools/sync":
            script = TURBO / "turbo_git_sync.sh"
            return self._json(200, _run(["zsh", str(script)], timeout=300))

        # ---- Webhook receivers ----
        if path in ("/api/webhook/n8n", "/api/webhook/zapier", "/api/webhook/generic"):
            source = path.rsplit("/", 1)[1]
            action = body.get("action") or f"webhook_{source}"
            subject = body.get("subject") or source
            mc.track(action, subject, {"source": source, "payload": body})
            _broadcast("webhook", {"source": source, "action": action, "subject": subject, "payload": body})
            response: dict = {"ok": True, "source": source, "tracked": True}
            # Optional reflex: if body has 'reflex': true, run the prompt through claude-hybrid
            if body.get("reflex") and HYBRID and body.get("prompt"):
                ctx = mc.inject_omniscience()
                args = [HYBRID, f"{ctx}\n\n[from {source}]: {body['prompt']}\n\nGABRIEL:"]
                result = _run(args, timeout=120)
                response["thought"] = result.get("stdout", "").strip()
            return self._json(200, response)

        if path == "/api/webhook/out":
            import urllib.request
            url = body.get("url")
            payload = body.get("payload", {})
            headers = body.get("headers", {"Content-Type": "application/json"})
            if not url:
                return self._json(400, {"error": "url required"})
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode(),
                    headers=headers,
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    rbody = resp.read().decode(errors="replace")[:2000]
                    mc.track("webhook_out", url[:60], {"status": resp.status})
                    return self._json(200, {"ok": True, "status": resp.status, "body": rbody})
            except Exception as e:
                mc.track("webhook_out_fail", url[:60], {"error": str(e)})
                return self._json(502, {"ok": False, "error": str(e)})

        if path == "/api/think":
            prompt = body.get("prompt", "")
            if not prompt:
                return self._json(400, {"error": "prompt required"})
            if not HYBRID:
                return self._json(503, {"error": "claude-hybrid not on PATH"})
            args = [HYBRID]
            force = body.get("force")
            if force == "claude":
                args.append("-c")
            elif force == "local":
                args.append("-l")
            ctx = mc.inject_omniscience()
            args.append(f"{ctx}\n\nRSP_001: {prompt}\n\nGABRIEL:")
            result = _run(args, timeout=120)
            mc.track("think", prompt[:60], {"router": "hybrid", "force": force})
            return self._json(200, result)

        return self._json(404, {"error": "not found", "path": path})

    # ---- SSE ----
    def _sse(self) -> None:
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        q: queue.Queue = queue.Queue(maxsize=200)
        with _sub_lock:
            _subscribers.append(q)

        try:
            # Initial hello
            self.wfile.write(b"event: hello\ndata: {\"ok\":true}\n\n")
            self.wfile.flush()
            while True:
                try:
                    payload = q.get(timeout=15)
                    self.wfile.write(payload.encode())
                    self.wfile.flush()
                except queue.Empty:
                    # Keep-alive ping
                    self.wfile.write(b": keep-alive\n\n")
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            with _sub_lock:
                if q in _subscribers:
                    _subscribers.remove(q)


def main() -> None:
    threading.Thread(target=_vitals_poller, daemon=True).start()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"⚡ Gabriel backend listening on http://127.0.0.1:{PORT}")
    print(f"   Memory: {len(mc.state['neural_state']['short_term'])} entries, vibe={mc.state['neural_state']['vibe']}")
    print(f"   Countdown: T-{_days_left()} days to April 17, 2026")
    print(f"   Stream: curl -N http://127.0.0.1:{PORT}/api/stream")
    mc.track("backend_start", "gabriel_serve", {"port": PORT})
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n⏹  Holding position.")
        mc.track("backend_stop", "gabriel_serve")


if __name__ == "__main__":
    main()
