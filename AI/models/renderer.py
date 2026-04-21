import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from .displacement import Siren
from .hash_grid import HashGrid
from utils.kernels import triton_eval_sh

class SDFVol(nn.Module):
    def __init__(self, e=1152, h=512, l=4, sh=3):
        super().__init__()
        self.sh = sh
        self.grid = HashGrid()
        # Input to MLP is Hash Grid (L*F) + Latent Context
        i_dim = (16 * 2) + e
        m = [Siren(i_dim, h, f=True)]
        for _ in range(l-2): m.append(Siren(h, h))
        self.b = nn.Sequential(*m)
        self.s = nn.Linear(h, 1)
        self.c = nn.Linear(h, 3 * 9)

    def eval_sh(self, sh, d):
        # sh: [..., 3, 9], d: [..., 3]
        s = sh.shape
        # Flatten for Triton
        res = triton_eval_sh(sh.reshape(-1, 27), d.reshape(-1, 3))
        return res.reshape(*s[:-2], 3)

    def forward(self, c, t, v=None):
        g_feat = self.grid(c)
        f = self.b(torch.cat([g_feat, t], -1))
        s = self.s(f)
        sh = self.c(f)
        if v is not None: rgb = torch.sigmoid(self.eval_sh(sh, v))
        else: rgb = torch.sigmoid(sh[..., :3])
        return s, rgb

    def grad(self, c, t):
        c.requires_grad_(True)
        s, _ = self.forward(c, t)
        return torch.autograd.grad(s, c, torch.ones_like(s), True, True, True)[0]
