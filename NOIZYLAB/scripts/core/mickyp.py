"""
mickyp.py — MICKY-P operator module.

Foundation tooling for the GOD ↔ MICKY-P bridge. Idempotent. Safe.
Verifies first, mutates only with explicit consent.

Subcommands (via gabriel CLI):
  gabriel mickyp ping              — connectivity + port scan
  gabriel mickyp setup <username>  — SSH key trust + env vars on GOD's side
  gabriel mickyp verify            — confirm SSH passwordless works
  gabriel mickyp env               — print the env vars to add to ~/.zshrc
  gabriel mickyp push-audio        — scp the .ahcommand file to MICKY-P
"""
from __future__ import annotations

import os
import shutil
import socket
import subprocess
import sys
from pathlib import Path

MICKY_HOST = os.environ.get("MICKY_P_HOST", "10.0.0.100")
MICKY_USER = os.environ.get("MICKY_P_USER", "")
MICKY_AUDIO_PORT = os.environ.get("MICKY_P_AUDIO_PORT", "5004")

GREEN = "\033[0;32m"
RED = "\033[0;31m"
YELLOW = "\033[1;33m"
DIM = "\033[2m"
NC = "\033[0m"


def _check_port(host: str, port: int, timeout: float = 2.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def _run(cmd: list[str], timeout: int = 10) -> tuple[int, str, str]:
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r.returncode, r.stdout.strip(), r.stderr.strip()
    except Exception as e:
        return -1, "", str(e)


# ── Diagnostics ────────────────────────────────────────────────────────────
def ping() -> dict:
    """Full reachability + service surface report."""
    out = {"host": MICKY_HOST, "checks": {}}

    # ICMP ping
    rc, _, _ = _run(["ping", "-c", "2", "-W", "2000", MICKY_HOST])
    out["checks"]["ping"] = "✓ alive" if rc == 0 else "✗ unreachable"

    # ARP / MAC
    rc, stdout, _ = _run(["arp", MICKY_HOST])
    if rc == 0 and "at " in stdout:
        mac = stdout.split("at ")[1].split(" ")[0]
        out["checks"]["mac"] = mac
    else:
        out["checks"]["mac"] = "unknown"

    # Port scan (foundational ports for our use)
    ports = {
        22: "SSH (Remote Login)",
        80: "HTTP",
        443: "HTTPS",
        548: "AFP (file sharing)",
        5000: "AirPlay receiver / commplex-main",
        5004: "RTP audio",
        5353: "mDNS / Bonjour",
        7000: "AirPlay / DreamChamber dev port",
        8080: "Voice Bridge target",
    }
    for port, name in ports.items():
        ok = _check_port(MICKY_HOST, port)
        mark = "✓" if ok else "✗"
        out["checks"][f"tcp_{port}"] = f"{mark} {name}"

    return out


def render_ping(report: dict) -> str:
    lines = [f"{DIM}═══ MICKY-P @ {report['host']} ═══{NC}"]
    for k, v in report["checks"].items():
        color = GREEN if "✓" in v else (RED if "✗" in v else YELLOW)
        lines.append(f"  {color}{v}{NC}  {DIM}{k}{NC}")
    return "\n".join(lines)


# ── SSH key trust ──────────────────────────────────────────────────────────
def ensure_ssh_key() -> Path:
    """Generate ed25519 key on GOD if missing. Returns public key path."""
    key_path = Path.home() / ".ssh" / "id_ed25519"
    pub_path = key_path.with_suffix(".pub")
    if pub_path.exists():
        return pub_path
    key_path.parent.mkdir(mode=0o700, exist_ok=True)
    rc, _, err = _run([
        "ssh-keygen", "-t", "ed25519", "-N", "",
        "-f", str(key_path), "-C", f"gabriel@GOD.local→micky-p {os.environ.get('USER','')}"
    ], timeout=15)
    if rc != 0:
        raise RuntimeError(f"ssh-keygen failed: {err}")
    return pub_path


def setup(username: str) -> str:
    """Set up SSH key trust GOD → MICKY-P. Idempotent."""
    if not username:
        return f"{RED}usage: gabriel mickyp setup <username>{NC}"

    # Pre-flight: SSH must be enabled on MICKY-P
    if not _check_port(MICKY_HOST, 22):
        return (f"{RED}✗ SSH (port 22) is not open on {MICKY_HOST}.{NC}\n"
                f"  Enable Remote Login on MICKY-P first:\n"
                f"  System Settings → General → Sharing → Remote Login = ON\n"
                f"  Restrict to: Only these users → {username}")

    lines = [f"{DIM}═══ Setting up SSH trust GOD → MICKY-P ({username}@{MICKY_HOST}) ═══{NC}"]

    # 1. Ensure local key
    try:
        pub = ensure_ssh_key()
        lines.append(f"  {GREEN}✓{NC} local key: {pub}")
    except Exception as e:
        return f"{RED}✗ key generation failed: {e}{NC}"

    # 2. Push public key — uses ssh-copy-id (will prompt for password ONCE)
    if shutil.which("ssh-copy-id"):
        lines.append(f"  {YELLOW}→{NC} pushing public key (will prompt for MICKY-P password ONCE)")
        rc, stdout, stderr = _run(
            ["ssh-copy-id", "-i", str(pub), "-o", "StrictHostKeyChecking=accept-new",
             f"{username}@{MICKY_HOST}"],
            timeout=60,
        )
        if rc != 0:
            return "\n".join(lines + [f"  {RED}✗ ssh-copy-id failed: {stderr}{NC}"])
        lines.append(f"  {GREEN}✓{NC} public key authorized on MICKY-P")
    else:
        lines.append(f"  {RED}✗ ssh-copy-id not found — install with: brew install ssh-copy-id{NC}")
        return "\n".join(lines)

    # 3. Verify passwordless
    rc, stdout, stderr = _run(
        ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=5",
         f"{username}@{MICKY_HOST}", "whoami"],
        timeout=10,
    )
    if rc == 0 and stdout == username:
        lines.append(f"  {GREEN}✓{NC} passwordless ssh works — `whoami` returned: {stdout}")
    else:
        lines.append(f"  {RED}✗ passwordless verify failed{NC}")
        if stderr:
            lines.append(f"    stderr: {stderr}")

    # 4. Write env vars to ~/.zshrc (idempotent — only if not already there)
    zshrc = Path.home() / ".zshrc"
    sentinel = "# === GABRIEL: MICKY-P bridge ==="
    if zshrc.exists() and sentinel in zshrc.read_text():
        lines.append(f"  {GREEN}✓{NC} env vars already in {zshrc}")
    else:
        block = (
            f"\n{sentinel}\n"
            f"export MICKY_P_HOST={MICKY_HOST}\n"
            f"export MICKY_P_USER={username}\n"
            f"export MICKY_P_AUDIO_PORT={MICKY_AUDIO_PORT}\n"
            f"# === END GABRIEL MICKY-P ===\n"
        )
        with open(zshrc, "a") as f:
            f.write(block)
        lines.append(f"  {GREEN}✓{NC} appended env vars to {zshrc}")
        lines.append(f"  {YELLOW}→{NC} run `source ~/.zshrc` (or open a new terminal)")

    # 5. SSH config alias for convenience (optional, idempotent)
    ssh_config = Path.home() / ".ssh" / "config"
    alias_block = (
        f"\n# === GABRIEL: MICKY-P alias ===\n"
        f"Host micky-p\n"
        f"    HostName {MICKY_HOST}\n"
        f"    User {username}\n"
        f"    IdentityFile ~/.ssh/id_ed25519\n"
    )
    cur = ssh_config.read_text() if ssh_config.exists() else ""
    if "Host micky-p" not in cur:
        ssh_config.parent.mkdir(mode=0o700, exist_ok=True)
        with open(ssh_config, "a") as f:
            f.write(alias_block)
        os.chmod(ssh_config, 0o600)
        lines.append(f"  {GREEN}✓{NC} added `Host micky-p` alias to ~/.ssh/config")
    else:
        lines.append(f"  {GREEN}✓{NC} ssh alias already present")

    lines.append(f"\n{GREEN}✓ MICKY-P foundation complete.{NC} Try: ssh micky-p whoami")
    return "\n".join(lines)


def verify() -> str:
    """Confirm passwordless SSH works using stored env."""
    user = os.environ.get("MICKY_P_USER")
    if not user:
        return f"{RED}MICKY_P_USER not set in env. Run setup first.{NC}"
    rc, stdout, stderr = _run(
        ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=5",
         f"{user}@{MICKY_HOST}", "uname -a; sw_vers -productVersion"],
        timeout=10,
    )
    if rc == 0:
        return f"{GREEN}✓ MICKY-P responds:\n{NC}{stdout}"
    return f"{RED}✗ verify failed: {stderr or 'no stderr'}{NC}"


def env_block() -> str:
    return (
        f"# Add to ~/.zshrc:\n"
        f"export MICKY_P_HOST={MICKY_HOST}\n"
        f"export MICKY_P_USER={MICKY_USER or '<YOUR_MICKYP_USERNAME>'}\n"
        f"export MICKY_P_AUDIO_PORT={MICKY_AUDIO_PORT}\n"
    )


# ── Audio file push ────────────────────────────────────────────────────────
def push_audio() -> str:
    user = os.environ.get("MICKY_P_USER")
    if not user:
        return f"{RED}MICKY_P_USER not set. Run setup first.{NC}"
    src = Path.home() / "NOIZYANTHROPIC/NOIZYLAB/integrations/audio/mickyp_voice_capture.ahcommand"
    if not src.exists():
        return f"{RED}source file missing: {src}{NC}"
    rc, stdout, stderr = _run(
        ["scp", "-o", "BatchMode=yes", str(src),
         f"{user}@{MICKY_HOST}:~/Desktop/mickyp_voice_capture.ahcommand"],
        timeout=30,
    )
    if rc == 0:
        return (f"{GREEN}✓ pushed to MICKY-P:~/Desktop/mickyp_voice_capture.ahcommand{NC}\n"
                f"  Now on MICKY-P: double-click the file. Audio Hijack will build the session.")
    return f"{RED}✗ scp failed: {stderr}{NC}"


# ── CLI ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: mickyp.py {ping|setup <user>|verify|env|push-audio}")
        sys.exit(0)
    cmd = sys.argv[1]
    if cmd == "ping":
        print(render_ping(ping()))
    elif cmd == "setup" and len(sys.argv) > 2:
        print(setup(sys.argv[2]))
    elif cmd == "verify":
        print(verify())
    elif cmd == "env":
        print(env_block())
    elif cmd == "push-audio":
        print(push_audio())
    else:
        print(f"unknown: {cmd}")
        sys.exit(1)
