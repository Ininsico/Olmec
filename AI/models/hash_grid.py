import torch
import torch.nn as nn
import numpy as np

class HashGrid(nn.Module):
    def __init__(self, l=16, f=2, r_min=16, r_max=2048, t_size=2**19):
        super().__init__()
        self.l, self.f, self.t_size = l, f, t_size
        self.b = np.exp((np.log(r_max) - np.log(r_min)) / (l - 1))
        self.r = [int(r_min * (self.b**i)) for i in range(l)]
        self.p = nn.ParameterList([nn.Parameter(torch.empty(t_size, f).uniform_(-1e-4, 1e-4)) for _ in range(l)])

    def forward(self, x):
        x = (x + 1) / 2
        o = []
        for i in range(self.l):
            r = self.r[i]
            v = x * r
            v_0 = v.long()
            v_1 = v_0 + 1
            w = v - v_0
            h_0 = self._hash(v_0)
            h_1 = self._hash(v_1)
            f = self._interp(v_0, v_1, w, self.p[i])
            o.append(f)
        return torch.cat(o, -1)

    def _hash(self, v):
        p = [1, 2654435761, 805459861]
        h = (v[..., 0] * p[0]) ^ (v[..., 1] * p[1]) ^ (v[..., 2] * p[2])
        return h % self.t_size

    def _interp(self, v_0, v_1, w, p):
        v000 = self._hash(v_0)
        v001 = self._hash(torch.stack([v_0[...,0], v_0[...,1], v_1[...,2]], -1))
        v010 = self._hash(torch.stack([v_0[...,0], v_1[...,1], v_0[...,2]], -1))
        v011 = self._hash(torch.stack([v_0[...,0], v_1[...,1], v_1[...,2]], -1))
        v100 = self._hash(torch.stack([v_1[...,0], v_0[...,1], v_0[...,2]], -1))
        v101 = self._hash(torch.stack([v_1[...,0], v_0[...,1], v_1[...,2]], -1))
        v110 = self._hash(torch.stack([v_1[...,0], v_1[...,1], v_0[...,2]], -1))
        v111 = self._hash(v_1)
        f000, f001, f010, f011 = p[v000], p[v001], p[v010], p[v011]
        f100, f101, f110, f111 = p[v100], p[v101], p[v110], p[v111]
        w_x, w_y, w_z = w[..., 0:1], w[..., 1:2], w[..., 2:3]
        f00 = f000 * (1 - w_z) + f001 * w_z
        f01 = f010 * (1 - w_z) + f011 * w_z
        f10 = f100 * (1 - w_z) + f101 * w_z
        f11 = f110 * (1 - w_z) + f111 * w_z
        f0 = f00 * (1 - w_y) + f01 * w_y
        f1 = f10 * (1 - w_y) + f11 * w_y
        return f0 * (1 - w_x) + f1 * w_x
