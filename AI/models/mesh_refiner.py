import torch
import torch.nn as nn

class MeshRefiner(nn.Module):
    def __init__(self, d=128, h=256, l=4):
        super().__init__()
        self.enc = nn.Linear(3, d)
        self.convs = nn.ModuleList([self._conv(d, h) for _ in range(l)])
        self.dec = nn.Linear(d, 3)

    def _conv(self, d, h):
        return nn.Sequential(nn.Linear(d * 2, h), nn.ReLU(), nn.Linear(h, d))

    def forward(self, v, e):
        # v: [B, V, 3], e: [B, E, 2]
        x = self.enc(v)
        for conv in self.convs:
            # Graph adjacency aggregation (Laplacian)
            v_n = x[:, e[:, 1]] # Gather neighbors
            agg = torch.zeros_like(x).scatter_add(1, e[:, 0, None].expand(-1, -1, x.shape[-1]), v_n)
            # Combine current state and neighbors
            x = x + conv(torch.cat([x, agg], -1))
        return v + self.dec(x)
