import os
import glob
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from train import MathOptimizer

class OlmecDataset(Dataset):
    def __init__(self, root="data"):
        self.root = root
        self.imgs = glob.glob(os.path.join(root, "images", "*.png")) + glob.glob(os.path.join(root, "images", "*.jpg"))
    def __len__(self):
        return len(self.imgs)
    def __getitem__(self, idx):
        return {"img_path": self.imgs[idx]}

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--component", type=str, default="full")
    parser.add_argument("--master_ip", type=str, default=None)
    parser.add_argument("--worker_id", type=str, default="PC_Worker")
    args = parser.parse_args()

    os.makedirs("data/images", exist_ok=True)
    os.makedirs("data/texts", exist_ok=True)
    os.makedirs("data/3d_data", exist_ok=True)

    ds = OlmecDataset()
    if len(ds) == 0:
        print("[!] Warning: No images found in data/images/. Add images to begin.")
    else:
        print(f"[*] Found {len(ds)} images. Running mathematical reconstruction...")
        opt = MathOptimizer()
        opt.run_batch()

    print("[*] Mathematical pipeline ready. Use Mastermind.py --image <path> to generate 3D.")
