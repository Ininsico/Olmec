import torch
import torch.nn as nn
from .occ_grid import OccupancyGrid

class SOTARenderer(nn.Module):
    def __init__(self, s=128):
        super().__init__()
        self.s = s
        self.occ = OccupancyGrid()

    def forward(self, r, sdf_fn, step=0.01):
        # r: rays [B, N_RAYS, 6]
        b, n = r.shape[:2]
        o, d = r[..., :3], r[..., 3:]
        
        t = torch.linspace(0.5, 1.5, self.s).to(r.device)
        p = o[..., None, :] + d[..., None, :] * t[None, None, :, None]
        
        # Space-skipping via Occupancy Grid
        m = self.occ.mask(p)
        
        # Volume Rendering (simplified for PyTorch, use Triton in prod)
        s, c = sdf_fn(p.reshape(-1, 3))
        w = self._sdf_to_w(s.reshape(b, n, self.s), m)
        rgb = (w[..., None] * c.reshape(b, n, self.s, 3)).sum(2)
        return rgb

    def _sdf_to_w(self, s, m, b=0.1):
        # Masked VolSDF/NeuS logic
        v = torch.sigmoid(s / b)
        a = (v[:, :, :-1] - v[:, :, 1:]).clamp(0, 1)
        a = a * m[:, :, :-1].float() # Apply Occupancy Mask
        a = torch.cat([a, torch.zeros_like(a[:, :, :1])], -1)
        tr = torch.cumprod(1.0 - a + 1e-6, -1)
        return a * torch.cat([torch.ones_like(tr[:, :, :1]), tr[:, :, :-1]], -1)
