import torch
import torch.nn as nn
from .registry import PROJECTORS

class CrossAttnBlock(nn.Module):
    def __init__(self, d=1024, h=16):
        super().__init__()
        self.ln1 = nn.LayerNorm(d)
        self.ln2 = nn.LayerNorm(d)
        self.attn = nn.MultiheadAttention(d, h, batch_first=True)
        self.ff = nn.Sequential(nn.Linear(d, d*4), nn.GELU(), nn.Linear(d*4, d))

    def forward(self, q, k):
        q = q + self.attn(self.ln1(q), k, k)[0]
        q = q + self.ff(self.ln2(q))
        return q

@PROJECTORS.register
class CrossAttnProjector(nn.Module):
    def __init__(self, d=1152, r=128):
        super().__init__()
        self.r = r
        # Tri-plane latent queries [3, R*R, D]
        self.tp_queries = nn.Parameter(torch.randn(3, r*r, d))
        self.layers = nn.ModuleList([CrossAttnBlock(d) for _ in range(3)])
        # Spatial Projector (from engine_sota)
        self.u = nn.Linear(d, d)

    def forward(self, x):
        # x is image features [B, V*L, D]
        B = x.shape[0]
        tp = self.tp_queries.unsqueeze(0).expand(B, -1, -1, -1)
        # Reshape to [B, 3, R*R, D]
        planes = []
        for i in range(3):
            p = self.layers[i](tp[:, i], x)
            planes.append(p.reshape(B, self.r, self.r, -1).transpose(1, 3))
        return planes

    def sample(self, p, t):
        b, n = p.shape[:2]
        c = [p[..., [0, 1]], p[..., [0, 2]], p[..., [1, 2]]]
        f = []
        for i in range(3):
            # Bi-linear sampling from the Cross-Attended planes
            g = c[i].reshape(b, 1, n, 2)
            f.append(F.grid_sample(t[i], g, align_corners=True).squeeze(2))
        return torch.cat(f, 1).transpose(1, 2)
