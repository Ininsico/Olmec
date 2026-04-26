import torch
import torch.nn as nn
import numpy as np

class Siren(nn.Module):
    def __init__(self, i, o, w=30.0, f=False):
        super().__init__()
        self.i, self.w, self.f = i, w, f
        self.l = nn.Linear(i, o)
        with torch.no_grad():
            if f: self.l.weight.uniform_(-1 / i, 1 / i)
            else: self.l.weight.uniform_(-np.sqrt(6 / i) / w, np.sqrt(6 / i) / w)
    def forward(self, x): return torch.sin(self.w * self.l(x))

class Disp(nn.Module):
    def __init__(self, e=1152, h=512):
        super().__init__()
        self.n = nn.Sequential(Siren(3+e, h, f=True), Siren(h, h), Siren(h, h), nn.Linear(h, 1))
        nn.init.zeros_(self.n[-1].weight)
        nn.init.zeros_(self.n[-1].bias)
    def forward(self, c, l):
        if l.shape[1] == 1: l = l.expand(-1, c.shape[1], -1)
        return self.n(torch.cat([c, l], -1))
