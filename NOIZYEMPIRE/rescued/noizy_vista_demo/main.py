

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import threading, time, json
from pathlib import Path

app = FastAPI(title="Noizy Vista Demo")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

STATE_PATH = Path("state/fleet_autosave.json")
def autosave():
    while True:
        data = {"timestamp": time.strftime('%Y-%m-%d %H:%M:%S'), "status": "autosave", "machine": "OMEN or Inspiron"}
        STATE_PATH.parent.mkdir(exist_ok=True)
        with STATE_PATH.open("w", encoding="utf-8") as f:
            json.dump(data, f)
        time.sleep(300)  # Save every 5 minutes

threading.Thread(target=autosave, daemon=True).start()

@app.get("/")
def index():
    return FileResponse("index.html")

@app.get("/handshake")
def handshake():
    return JSONResponse({"status": "ok", "message": "Handshake successful", "machine": "OMEN or Inspiron"})
