#!/usr/bin/env python3
"""
turbo_bridge.py (V3 - WebSocket Edition)
High-Speed Unity <-> Python Bridge.
Now with ZERO LATENCY PUSH to Web Portal.
"""
import logging
import json
import os
import sys
import subprocess
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit

# Initialize Flask & SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('GABRIEL_SECRET_KEY', 'gabriel_secret_zero_latency')
socketio = SocketIO(app, cors_allowed_origins="*")

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("TurboBridge")

# MemCell Integration (V3 - Overlap Engine)
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), "core"))
try:
    from MemCell_V3 import MemCell
    mc = MemCell()
except ImportError:
    mc = None
    logger.warning("MemCell V3 not found.")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "CRYSTAL SMOOTH", "mode": "TURBO", "bridge": "WebSocket"})

@app.route('/api/interact', methods=['POST'])
def interact():
    """Unity sends Data -> Python processes -> Pushes to Web Portal."""
    data = request.json
    if not data:
        return jsonify({"error": "No data"}), 400

    prompt = data.get("text", "")
    context = data.get("context", {})
    
    logger.info(f"⚡ Received from Unity: {prompt}")
    
    # 1. Track in MemCell
    if mc:
        mc.track("unity_interact", "turbo_bridge", {"prompt": prompt, "context": context})

    # 2. Process Response (Stub logic)
    response_text = f"I hear you. You said: {prompt}"
    
    # 3. VOICE (TTS)
    # Non-blocking voice
    subprocess.Popen(["say", "-v", "Daniel", response_text])
    
    # 4. PUSH TO PORTAL (The Magic)
    # This sends data instantly to any connected browser
    update_payload = {
        "text": response_text,
        "input": prompt,
        "vitals": {"cpu": "Low", "vibe": "Focused"} # Dummy vitals for now
    }
    socketio.emit('gabriel_update', update_payload)

    return jsonify({"response": response_text})

# Cortex Link
EVOLUTION_FILE = os.path.expanduser("~/NOIZYANTHROPIC/NOIZYLAB/memory/evolution_status.json")

def broadcast_cortex():
    """Reads Evolution Status and pushes to Portal."""
    try:
        if os.path.exists(EVOLUTION_FILE):
            with open(EVOLUTION_FILE, 'r') as f:
                data = json.load(f)
            socketio.emit('cortex_update', data)
            logger.info("🧠 Cortex Broadcast: Sent Evolution Data.")
        else:
            logger.warning("Cortex file not found.")
    except Exception as e:
        logger.error(f"Cortex Broadcast Failed: {e}")

# WebSocket Event
@socketio.on('connect')
def test_connect():
    emit('status', {'msg': 'Connected to Gabriel Neural Link'})
    # Send immediate cortex update
    broadcast_cortex()

if __name__ == '__main__':
    logger.info("🚀 GABRIEL BRIDGE (WebSocket) LISTENING ON 8000...")
    socketio.run(app, host='127.0.0.1', port=8000)
