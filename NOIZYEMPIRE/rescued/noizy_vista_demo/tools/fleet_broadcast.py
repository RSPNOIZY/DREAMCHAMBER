import requests
import threading

machines = [
    {"name": "MacStudio", "ip": "192.168.0.10"},
    {"name": "OMEN", "ip": "192.168.0.12"},
    {"name": "MacPro", "ip": "192.168.0.14"},
    {"name": "Inspiron/Planar", "ip": "192.168.0.15"},
]

results = {}

def ping_machine(machine):
    url = f"http://{machine['ip']}:8000/handshake"
    try:
        resp = requests.get(url, timeout=3)
        resp.raise_for_status()
        data = resp.json()
        results[machine['name']] = f"✅ {machine['name']} ({machine['ip']}): {data['status']} ({data['message']})"
    except Exception as e:
        results[machine['name']] = f"❌ {machine['name']} ({machine['ip']}): {e}"

threads = []
for m in machines:
    t = threading.Thread(target=ping_machine, args=(m,))
    t.start()
    threads.append(t)
for t in threads:
    t.join()

for name, status in results.items():
    print(status)
