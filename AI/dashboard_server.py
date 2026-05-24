from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import json
import asyncio
import os

app = FastAPI()
previews_dir = "previews"
os.makedirs(previews_dir, exist_ok=True)
app.mount("/previews", StaticFiles(directory=previews_dir), name="previews")

current_metrics = {"step": 0, "loss": 0, "status": "idle", "active_workers": {}}
clients = []

@app.get("/")
async def get_index():
    html = """<!DOCTYPE html>
<html>
<head><title>Olmec 3D Dashboard</title>
<style>
body { font-family: monospace; background: #0a0a0a; color: #0f0; padding: 40px; text-align: center; }
h1 { font-size: 2em; border-bottom: 2px solid #0f0; padding-bottom: 10px; }
.metric { font-size: 1.5em; margin: 20px; padding: 20px; background: #111; border: 1px solid #0f0; border-radius: 8px; }
.status { color: #0f0; }
</style></head>
<body>
<h1>OLMEC 3D - MATHEMATICAL ENGINE</h1>
<div class="metric">
<div class="status">STATUS: OPERATIONAL</div>
<div>Engine: Shape-from-Shading + SDF + Marching Cubes</div>
<div>No neural networks. Pure mathematics.</div>
</div>
</body></html>"""
    return HTMLResponse(html)

from fastapi.responses import HTMLResponse

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            await websocket.send_json(current_metrics)
            await asyncio.sleep(0.5)
    except:
        clients.remove(websocket)

@app.post("/update")
async def update_metrics(metrics: dict):
    global current_metrics
    current_metrics.update(metrics)
    return {"status": "ok"}

@app.get("/status")
async def status():
    return {"engine": "math_engine", "status": "operational", "type": "deterministic"}

def start_dashboard():
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="error")

if __name__ == "__main__":
    start_dashboard()
