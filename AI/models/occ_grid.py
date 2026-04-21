import torch
import torch.nn as nn

class OccupancyGrid(nn.Module):
    def __init__(self, r=128, th=0.01):
        super().__init__()
        self.r = r
        self.th = th
        self.register_buffer("grid", torch.zeros(r, r, r, dtype=torch.bool))

    @torch.no_grad()
    def update(self, f, v=None):
        # f: sdf function, v: optional view direction
        x = torch.linspace(-1, 1, self.r).to(self.grid.device)
        p = torch.stack(torch.meshgrid(x, x, x), -1).reshape(-1, 3)
        # Process in chunks to avoid OOM
        s = []
        for i in range(0, p.shape[0], 2**16):
            p_i = p[i:i+2**16]
            s_i, _ = f(p_i)
            s.append(s_i)
        s = torch.cat(s, 0).reshape(self.r, self.r, self.r)
        # Occupied if SDF is close to 0
        self.grid = torch.abs(s) < self.th

    def mask(self, p):
        # p: [B, N, 3]
        idx = ((p + 1) / 2 * (self.r - 1)).long().clamp(0, self.r - 1)
        return self.grid[idx[..., 0], idx[..., 1], idx[..., 2]]
