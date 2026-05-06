from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import json
import asyncio
import torch
import io

app = FastAPI()
app.mount("/previews", StaticFiles(directory="previews"), name="previews")

current_metrics = {"step": 0, "loss": 0, "eik": 0, "active_workers": {}}
clients = []

@app.get("/")
async def get_index():
    return FileResponse("index.html")

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
    worker_id = metrics.get("worker_id", "master")
    current_metrics.update(metrics)
    if "component" in metrics:
        current_metrics["active_workers"][worker_id] = metrics["component"]
    return {"status": "ok"}

@app.get("/pull_weights")
async def pull_weights():
    if os.path.exists("models/latest.pt"):
        return FileResponse("models/latest.pt")
    return {"error": "no weights available"}

@app.post("/push_weights")
async def push_weights(file: UploadFile = File(...)):
    os.makedirs("models", exist_ok=True)
    with open("models/latest.pt", "wb") as f:
        f.write(await file.read())
    return {"status": "synced"}

def start_dashboard():
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="error")

if __name__ == "__main__":
    start_dashboard()
