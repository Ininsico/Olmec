from fastapi import FastAPI, UploadFile, File, Header, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import os
import uuid
from Mastermind import OlmecMastermind
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

API_KEYS = os.getenv("OLMEC_API_KEYS", "OLMEC_DEV_KEY_99,ADMIN_SOTA_TOKEN").split(",")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "api_uploads")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "api_outputs")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

app = FastAPI(title="Olmec 3D AI API", description="Mathematical 3D Reconstruction API")

ai = OlmecMastermind(mode="inference")

class GenRequest(BaseModel):
    text: Optional[str] = None
    resolution: Optional[int] = 128

def verify_key(api_key: str):
    if api_key not in API_KEYS:
        raise HTTPException(status_code=403, detail="Invalid API Key")

@app.post("/generate")
async def generate_3d(
    background_tasks: BackgroundTasks,
    text: Optional[str] = None,
    resolution: int = 128,
    file: UploadFile = File(None),
    x_api_key: str = Header(None)
):
    verify_key(x_api_key)
    request_id = str(uuid.uuid4())
    img_path = None
    if file:
        img_path = os.path.join(UPLOAD_DIR, f"{request_id}_{file.filename}")
        with open(img_path, "wb") as buffer:
            buffer.write(await file.read())
    output_filename = os.path.join(OUTPUT_DIR, f"{request_id}_model.glb")
    try:
        print(f"[*] API Request {request_id}: Text='{text}', Image={img_path}")
        ai.generate_3d(image_path=img_path, text=text, resolution=resolution, output_name=output_filename)
        if img_path:
            background_tasks.add_task(os.remove, img_path)
        return FileResponse(
            output_filename,
            media_type="model/gltf-binary",
            filename=f"olmec_3d_{request_id}.glb"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "online", "engine": "math_engine", "model_loaded": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
