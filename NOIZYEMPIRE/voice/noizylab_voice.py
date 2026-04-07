"""
NOIZYLAB Voice Engine - Talon Module
=====================================
Premium voice synthesis via Mac M2 Ultra `say` command over SSH.
Supports multiple voices, queue management, rate/volume control,
and GABRIEL integration hooks.

Setup:
  1. Copy to ~/.talon/user/noizylab_voice.py
  2. Ensure SSH key auth is configured: ssh-copy-id m2ultra@<MAC_IP>
  3. Test: `ssh m2ultra@<MAC_IP> 'say -v Jamie "online"'`

Usage in .talon files:
  user.speak_jamie("Hello world")
  user.speak_voice("Hello world", "Samantha")
  user.speak_gabriel("System initialized")
"""

import subprocess
import shlex
import threading
import time
import os
import re
from typing import Optional
from collections import deque
from talon import Module, actions, settings

mod = Module()

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

MAC_USER = "m2ultra"
MAC_IP = "192.168.0.50"          # Update to your Mac's IP
SSH_KEY = os.path.expanduser("~/.ssh/id_ed25519")  # SSH key path
SSH_TIMEOUT = 5                   # Connection timeout (seconds)

# Voice Profiles
VOICES = {
    "jamie":     {"name": "Jamie",     "rate": 185, "desc": "Premium UK English"},
    "samantha":  {"name": "Samantha",  "rate": 190, "desc": "US English Female"},
    "daniel":    {"name": "Daniel",    "rate": 180, "desc": "UK English Male"},
    "karen":     {"name": "Karen",     "rate": 185, "desc": "Australian English"},
    "moira":     {"name": "Moira",     "rate": 180, "desc": "Irish English"},
    "alex":      {"name": "Alex",      "rate": 175, "desc": "US English Male"},
    "fiona":     {"name": "Fiona",     "rate": 185, "desc": "Scottish English"},
    "tessa":     {"name": "Tessa",     "rate": 185, "desc": "South African English"},
}

# GABRIEL voice profile — the AI persona
GABRIEL_VOICE = "Jamie"
GABRIEL_RATE = 170                # Slightly slower for gravitas
GABRIEL_PREFIX = ""               # Optional prefix before GABRIEL speaks

# Default voice
DEFAULT_VOICE = "jamie"
DEFAULT_RATE = 185                # Words per minute (macOS range: 1-500)

# Queue settings
MAX_QUEUE_SIZE = 50
QUEUE_ENABLED = True

# ═══════════════════════════════════════════════════════════════
# SPEECH ENGINE
# ═══════════════════════════════════════════════════════════════

class SpeechQueue:
    """Thread-safe speech queue with priority support."""

    def __init__(self):
        self._queue: deque = deque(maxlen=MAX_QUEUE_SIZE)
        self._priority_queue: deque = deque(maxlen=10)
        self._lock = threading.Lock()
        self._speaking = False
        self._worker = threading.Thread(target=self._process, daemon=True)
        self._worker.start()
        self._current_proc: Optional[subprocess.Popen] = None

    def enqueue(self, text: str, voice: str, rate: int, priority: bool = False):
        """Add speech to queue."""
        with self._lock:
            item = {"text": text, "voice": voice, "rate": rate}
            if priority:
                self._priority_queue.append(item)
            else:
                self._queue.append(item)

    def clear(self):
        """Kill current speech and empty queue."""
        with self._lock:
            self._queue.clear()
            self._priority_queue.clear()
            if self._current_proc and self._current_proc.poll() is None:
                self._current_proc.terminate()

    def _process(self):
        """Worker thread — pulls from queue and speaks."""
        while True:
            item = None
            with self._lock:
                if self._priority_queue:
                    item = self._priority_queue.popleft()
                elif self._queue:
                    item = self._queue.popleft()

            if item:
                self._speaking = True
                _execute_speech(item["text"], item["voice"], item["rate"])
                self._speaking = False
            else:
                time.sleep(0.05)

    @property
    def is_speaking(self) -> bool:
        return self._speaking

    @property
    def pending(self) -> int:
        with self._lock:
            return len(self._queue) + len(self._priority_queue)


# Global queue instance
_speech_queue = SpeechQueue()


def _sanitize_text(text: str) -> str:
    """
    Sanitize text for safe shell execution.
    Strips dangerous characters while preserving natural speech.
    """
    # Remove null bytes
    text = text.replace("\x00", "")

    # Replace smart quotes with straight quotes
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')

    # Remove characters that could break shell commands
    # Allow: letters, numbers, spaces, basic punctuation
    text = re.sub(r'[`$\\;|&<>{}()\[\]!#]', '', text)

    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()

    # Truncate extremely long text (macOS `say` handles ~32KB)
    if len(text) > 4000:
        text = text[:4000] + "... message truncated."

    return text


def _build_ssh_command(text: str, voice: str, rate: int) -> list:
    """
    Build SSH command as a list (no shell=True needed).
    Uses proper argument escaping via shlex.
    """
    say_cmd = f'say -v {voice} -r {rate} {shlex.quote(text)}'

    cmd = [
        "ssh",
        "-o", "ConnectTimeout={}".format(SSH_TIMEOUT),
        "-o", "StrictHostKeyChecking=accept-new",
        "-o", "BatchMode=yes",
    ]

    # Use SSH key if it exists
    if os.path.exists(SSH_KEY):
        cmd.extend(["-i", SSH_KEY])

    cmd.append(f"{MAC_USER}@{MAC_IP}")
    cmd.append(say_cmd)

    return cmd


def _execute_speech(text: str, voice: str, rate: int):
    """Execute the SSH say command. Blocks until complete."""
    clean = _sanitize_text(text)
    if not clean:
        return

    cmd = _build_ssh_command(clean, voice, rate)

    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        _speech_queue._current_proc = proc
        stdout, stderr = proc.communicate(timeout=60)

        if proc.returncode != 0:
            err = stderr.decode("utf-8", errors="replace").strip()
            # Log but don't crash Talon
            print(f"[NOIZYLAB Voice] Error (rc={proc.returncode}): {err}")

    except subprocess.TimeoutExpired:
        proc.kill()
        print("[NOIZYLAB Voice] Speech timed out after 60s")
    except FileNotFoundError:
        print("[NOIZYLAB Voice] SSH not found — is OpenSSH installed?")
    except Exception as e:
        print(f"[NOIZYLAB Voice] Unexpected error: {e}")
    finally:
        _speech_queue._current_proc = None


def _fire_and_forget(text: str, voice: str, rate: int):
    """Send speech without waiting — for non-queued quick calls."""
    clean = _sanitize_text(text)
    if not clean:
        return

    cmd = _build_ssh_command(clean, voice, rate)

    try:
        subprocess.Popen(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception as e:
        print(f"[NOIZYLAB Voice] Fire-and-forget error: {e}")


# ═══════════════════════════════════════════════════════════════
# TALON ACTIONS
# ═══════════════════════════════════════════════════════════════

@mod.action_class
class Actions:

    def speak_jamie(text: str):
        """Speak text with Jamie voice (queued)."""
        voice = VOICES["jamie"]
        if QUEUE_ENABLED:
            _speech_queue.enqueue(text, voice["name"], voice["rate"])
        else:
            _fire_and_forget(text, voice["name"], voice["rate"])

    def speak_voice(text: str, voice_key: str):
        """Speak text with any configured voice (queued).
        voice_key: jamie, samantha, daniel, karen, moira, alex, fiona, tessa
        """
        key = voice_key.lower()
        voice = VOICES.get(key, VOICES[DEFAULT_VOICE])
        if QUEUE_ENABLED:
            _speech_queue.enqueue(text, voice["name"], voice["rate"])
        else:
            _fire_and_forget(text, voice["name"], voice["rate"])

    def speak_gabriel(text: str):
        """Speak as GABRIEL — priority queue, distinct voice profile."""
        full_text = f"{GABRIEL_PREFIX}{text}" if GABRIEL_PREFIX else text
        _speech_queue.enqueue(full_text, GABRIEL_VOICE, GABRIEL_RATE, priority=True)

    def speak_urgent(text: str):
        """Priority speech — jumps the queue. Uses default voice."""
        voice = VOICES[DEFAULT_VOICE]
        _speech_queue.enqueue(text, voice["name"], voice["rate"], priority=True)

    def speak_fast(text: str):
        """Speak at accelerated rate (250 wpm) with Jamie."""
        _speech_queue.enqueue(text, "Jamie", 250)

    def speak_slow(text: str):
        """Speak at slow deliberate rate (130 wpm) with Jamie."""
        _speech_queue.enqueue(text, "Jamie", 130)

    def speak_stop():
        """Kill current speech and clear the queue."""
        _speech_queue.clear()
        # Also kill any active `say` process on the Mac
        try:
            subprocess.Popen(
                ["ssh", "-o", f"ConnectTimeout={SSH_TIMEOUT}",
                 "-o", "BatchMode=yes",
                 f"{MAC_USER}@{MAC_IP}", "killall say"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception:
            pass

    def speak_status() -> str:
        """Return speech queue status."""
        speaking = "Speaking" if _speech_queue.is_speaking else "Silent"
        pending = _speech_queue.pending
        return f"{speaking} | {pending} queued"

    def speak_test():
        """Run a connection test — speaks a confirmation if SSH works."""
        _fire_and_forget("NOIZYLAB voice engine online.", "Jamie", 185)

    def speak_list_voices() -> str:
        """Return available voice profiles."""
        lines = []
        for key, v in VOICES.items():
            lines.append(f"{key}: {v['name']} ({v['desc']}) @ {v['rate']} wpm")
        return "\n".join(lines)
