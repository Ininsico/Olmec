import os
import torch
import glob
from PIL import Image
from torchvision import transforms
from torch.utils.data import DataLoader, Dataset
from train import Trainer

class OlmecDataset(Dataset):
    def __init__(self, root="data", res=224):
        self.root = root
        self.imgs = glob.glob(os.path.join(root, "images", "*.png")) + glob.glob(os.path.join(root, "images", "*.jpg"))
        self.tf = transforms.Compose([
            transforms.Resize((res, res)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def __len__(self):
        return len(self.imgs)

    def __getitem__(self, idx):
        p = self.imgs[idx]
        n = os.path.splitext(os.path.basename(p))[0]
        img = self.tf(Image.open(p).convert("RGB")).unsqueeze(0)
        
        txt_p = os.path.join(self.root, "texts", f"{n}.txt")
        text = open(txt_p, "r").read().strip() if os.path.exists(txt_p) else ""
        
        data_p = os.path.join(self.root, "3d_data", f"{n}.pt")
        data = torch.load(data_p) if os.path.exists(data_p) else {
            "xyz": torch.randn(1024, 3), 
            "gt_sdf": torch.randn(1024, 1)
        }
        
        return {
            "img": img,
            "text": text,
            "xyz": data["xyz"],
            "gt_sdf": data["gt_sdf"]
        }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--component", type=str, choices=["encoder", "transformer", "renderer", "full"], default="full")
    parser.add_argument("--master_ip", type=str, default=None)
    parser.add_argument("--worker_id", type=str, default="PC_Worker")
    args = parser.parse_args()

    config = {
        "lr": 2e-4, 
        "wd": 0.05, 
        "tot": 500000, 
        "wp": 5000, 
        "log": 10, 
        "vis_every": 250,
        "save_every": 2000,
        "component": args.component,
        "master_ip": args.master_ip,
        "worker_id": args.worker_id,
        "sync_every": 1000
    }
    
    os.makedirs("data/images", exist_ok=True)
    os.makedirs("data/texts", exist_ok=True)
    os.makedirs("data/3d_data", exist_ok=True)
    
    ds = OlmecDataset()
    if len(ds) == 0:
        print("[!] Warning: No images found in data/images/. Add your SOTA dataset to begin.")
    
    dl = DataLoader(ds, batch_size=8, shuffle=True, num_workers=8, pin_memory=True)
    
    t = Trainer(config)
    t.run(dl)
