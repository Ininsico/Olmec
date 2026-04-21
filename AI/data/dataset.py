import os
import torch
from torch.utils.data import Dataset
import numpy as np
from PIL import Image
from torchvision import transforms
import trimesh

class Objaverse(Dataset):
    def __init__(self, r, v=4, s=224, n=4096):
        self.r, self.v, self.n = r, v, n
        self.i = [f for f in os.listdir(r) if os.path.isdir(os.path.join(r, f))]
        self.t = transforms.Compose([transforms.Resize((s, s)), transforms.ToTensor(), transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])

    def __len__(self): return len(self.i)

    def _s(self, p):
        m = trimesh.load(p)
        ps, _ = m.sample(self.n // 2, return_index=True)
        pv = np.random.uniform(-1, 1, (self.n // 2, 3))
        px = np.concatenate([ps, pv], axis=0)
        sd = trimesh.proximity.signed_distance(m, px)
        return torch.tensor(px).float(), torch.tensor(sd).float().unsqueeze(-1)

    def __getitem__(self, x):
        p = os.path.join(self.r, self.i[x])
        im = torch.stack([self.t(Image.open(os.path.join(p, f"view_{j}.png")).convert("RGB")) for j in range(self.v)])
        xyz, sdf = self._s(os.path.join(p, "model.obj"))
        return {"img": im, "xyz": xyz, "gt_sdf": sdf, "gt_pts": xyz[:self.n // 2]}
