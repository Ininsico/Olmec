import os
import numpy as np
from scipy import optimize
from PIL import Image
from olmec_math_engine import OlmecMathEngine

class MathOptimizer:
    def __init__(self):
        self.engine = OlmecMathEngine(grid_res=64)

    def optimize_sdf_params(self, image_path, gt_mesh_path=None):
        img = Image.open(image_path)
        mesh = self.engine.reconstruct_from_image(image_path)
        print(f"[*] Mesh generated: {len(mesh.vertices)} verts, {len(mesh.triangles)} tris")
        return mesh

    def run_batch(self, data_root="data", output_dir="checkpoints"):
        os.makedirs(output_dir, exist_ok=True)
        import glob
        imgs = glob.glob(os.path.join(data_root, "images", "*.png")) + glob.glob(os.path.join(data_root, "images", "*.jpg"))
        print(f"[*] Mathematical reconstruction of {len(imgs)} images...")
        for i, img_path in enumerate(imgs):
            name = os.path.splitext(os.path.basename(img_path))[0]
            print(f"  [{i+1}/{len(imgs)}] {name}")
            mesh = self.engine.reconstruct_from_image(img_path)
            out_path = os.path.join(output_dir, f"{name}.glb")
            self.engine.export_mesh(mesh, out_path)

if __name__ == "__main__":
    opt = MathOptimizer()
    opt.run_batch()
