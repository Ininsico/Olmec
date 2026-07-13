# Test depth model
import time, sys
t0 = time.time()
print("Importing transformers...", flush=True)
from transformers import pipeline
print(f"Import took {time.time()-t0:.1f}s", flush=True)
t1 = time.time()
pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf")
print(f"Model loaded in {time.time()-t1:.1f}s", flush=True)
print("Device:", pipe.device, flush=True)
