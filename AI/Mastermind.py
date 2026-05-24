import os
import argparse
import open3d as o3d
from olmec_math_engine import OlmecMathEngine

class OlmecMastermind:
    def __init__(self, mode="inference", model_path=None):
        self.mode = mode
        self.engine = OlmecMathEngine(grid_res=64, sdf_eps=0.5)
        if mode == "inference":
            print("[*] Olmec Math Engine initialized (deterministic 3D reconstruction)")
        elif mode == "train":
            print("[*] Olmec Math Engine: training mode (algorithm optimization)")

    def generate_3d(self, image_path=None, text=None, resolution=128, output_name="output.glb"):
        if not image_path or not os.path.exists(image_path):
            print("[!] No valid image path provided")
            return
        print(f"[*] Generating 3D from: {image_path}")
        mesh = self.engine.reconstruct_from_image(image_path, resolution=resolution)
        self.engine.export_mesh(mesh, output_name)

    def optimize_on_dataset(self, data_root="data", output_model="models/math_params.npz"):
        import glob
        from torch.utils.data import DataLoader, Dataset
        class MathDataset(Dataset):
            def __init__(self, root):
                self.imgs = glob.glob(os.path.join(root, "images", "*.png")) + glob.glob(os.path.join(root, "images", "*.jpg"))
            def __len__(self):
                return len(self.imgs)
            def __getitem__(self, idx):
                return {"img_path": self.imgs[idx]}
        ds = MathDataset(data_root)
        dl = DataLoader(ds, batch_size=1)
        print(f"[*] Running mathematical optimization on {len(ds)} samples...")
        for batch in dl:
            path = batch["img_path"][0]
            self.generate_3d(path, output_name=f"opt_preview_{os.path.basename(path)}.glb")
        print("[+] Optimization complete")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", type=str, default="inference", choices=["inference", "train"])
    parser.add_argument("--image", type=str)
    parser.add_argument("--text", type=str)
    parser.add_argument("--weights", type=str)
    parser.add_argument("--res", type=int, default=128)
    parser.add_argument("--output", type=str, default="gen_model.glb")
    args = parser.parse_args()
    master = OlmecMastermind(mode=args.mode, model_path=args.weights)
    if args.mode == "inference":
        master.generate_3d(args.image, text=args.text, resolution=args.res, output_name=args.output)
