import torch
import torch.nn as nn

class GatedBlock(nn.Module):
    def __init__(self, d, h):
        super().__init__()
        self.ln = nn.LayerNorm(d)
        self.gate = nn.Sequential(nn.Linear(d, d), nn.Sigmoid())
        self.ff = nn.Sequential(
            nn.Linear(d, h),
            nn.GELU(),
            nn.Linear(h, d)
        )

    def forward(self, x):
        return x + self.gate(x) * self.ff(self.ln(x))

class FlowRefiner(nn.Module):
    def __init__(self, d=1152, h=2048, l=4):
        super().__init__()
        self.layers = nn.ModuleList([GatedBlock(d, h) for _ in range(l)])
        self.time_emb = nn.Sequential(nn.Linear(1, d), nn.SiLU(), nn.Linear(d, d))

    def forward(self, x, steps=4):
        B = x.shape[0]
        dt = 1.0 / steps
        for i in range(steps):
            t = torch.tensor([i / steps]).to(x.device).expand(B, 1)
            emb = self.time_emb(t).unsqueeze(1)
            h = x + emb
            for layer in self.layers:
                h = layer(h)
            x = x + dt * h
        return x
