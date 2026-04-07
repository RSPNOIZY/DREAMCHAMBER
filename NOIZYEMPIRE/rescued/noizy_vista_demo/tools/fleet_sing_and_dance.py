#!/usr/bin/env python3
"""
Fleet Sing & Dance Orchestrator
Triggers synchronized audio, visual, and notification events on HP OMEN and DELL Inspiron cockpit UIs.
"""
import requests, time

FLEET = [
    {"name": "OMEN", "ip": "192.168.0.12"},
    {"name": "Inspiron", "ip": "192.168.0.15"}
]

EVENT = {
    "audio": "ambient.mp3",
    "visual": "aurora, stars, mountain_vista",
    "message": "Fleet Sync: Sing & Dance!"
}

for node in FLEET:
    try:
        # Trigger notification
        requests.post(f"http://{node['ip']}:8000/api/notify", json={"message": EVENT["message"]}, timeout=2)
        # Trigger audio/visual (if API exists)
        requests.post(f"http://{node['ip']}:8000/api/demo", json={"audio": EVENT["audio"], "visual": EVENT["visual"]}, timeout=2)
        print(f"✅ {node['name']} is singing & dancing!")
    except Exception as e:
        print(f"❌ {node['name']} failed: {e}")
    time.sleep(0.5)

print("🎉 Fleet Sing & Dance event triggered!")
