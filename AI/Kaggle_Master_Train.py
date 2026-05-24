import os
import glob
from olmec_math_engine import OlmecMathEngine

print("[*] Olmec 3D - Mathematical Reconstruction Pipeline")
print("[*] No neural networks. Pure mathematical algorithms.")
engine = OlmecMathEngine(grid_res=64)

imgs = glob.glob("data/images/*.png") + glob.glob("data/images/*.jpg")
if not imgs:
    print("[!] No images found in data/images/")
    print("[!] Upload your dataset to /kaggle/input/ and symlink or copy to data/images/")
    imgs = glob.glob("/kaggle/input/**/*.png", recursive=True) + glob.glob("/kaggle/input/**/*.jpg", recursive=True)

if imgs:
    print(f"[*] Processing {len(imgs)} images through mathematical pipeline...")
    for i, img_path in enumerate(imgs[:10]):
        name = os.path.splitext(os.path.basename(img_path))[0]
        print(f"  [{i+1}/{min(10, len(imgs))}] {name}")
        try:
            mesh = engine.reconstruct_from_image(img_path)
            out = f"olmec_output_{name}.glb"
            engine.export_mesh(mesh, out)
        except Exception as e:
            print(f"  [!] Failed: {e}")
    print("[+] Done. Output .glb files generated.")

print("[*] Pipeline ready. Use Mastermind.py --image <path> for single inference.")
