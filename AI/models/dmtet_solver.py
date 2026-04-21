import torch
import torch.nn as nn
import numpy as np

class DMTetSolver(nn.Module):
    def __init__(self, r=64):
        super().__init__()
        self.r = r
        v, t = self._bcc_grid(r)
        self.register_buffer("v", v)
        self.register_buffer("t", t)
        self.e = self._edges(t)

    def _bcc_grid(self, r):
        x = np.linspace(-1, 1, r)
        p = np.stack(np.meshgrid(x, x, x), -1).reshape(-1, 3)
        off = 2.0 / (r - 1)
        p_c = p + off / 2
        v = np.concatenate([p, p_c], 0)
        n = r**3
        t = []
        for i in range(r-1):
            for j in range(r-1):
                for k in range(r-1):
                    # Indices of the 8 corners of the cube
                    p0 = i*r**2 + j*r + k
                    p1 = p0+1; p2 = p0+r; p3 = p0+r+1
                    p4 = p0+r**2; p5 = p4+1; p6 = p4+r; p7 = p4+r+1
                    # Index of the center vertex
                    pc = n + p0
                    # The 12 Tetrahedra forming the BCC cell
                    t.append([pc, p0, p1, p2])
                    t.append([pc, p1, p3, p2])
                    t.append([pc, p4, p5, p6])
                    t.append([pc, p5, p7, p6])
                    t.append([pc, p0, p4, p5])
                    t.append([pc, p0, p1, p5])
                    t.append([pc, p2, p6, p7])
                    t.append([pc, p2, p3, p7])
                    t.append([pc, p0, p2, p6])
                    t.append([pc, p0, p4, p6])
                    t.append([pc, p1, p3, p7])
                    t.append([pc, p1, p5, p7])
        return torch.tensor(v).float(), torch.tensor(t).long()

    def _edges(self, t):
        e = torch.cat([t[:, [0, 1]], t[:, [0, 2]], t[:, [0, 3]], t[:, [1, 2]], t[:, [1, 3]], t[:, [2, 3]]], 0)
        return torch.unique(torch.sort(e, 1)[0], dim=0)

    def forward(self, s, d):
        # Differentiable Vertex Displacement
        v = self.v + torch.tanh(d) / self.r
        s_e = s[self.e]
        m = (s_e[:, 0] * s_e[:, 1] < 0)
        if not m.any(): return None, None # No surface crossings
        e_f = self.e[m]
        s_f = s[e_f]
        # Linear interpolation for zero-crossing (SDF surface)
        w = torch.abs(s_f[:, 0]) / (torch.abs(s_f[:, 0]) + torch.abs(s_f[:, 1] - s_f[:, 0]) + 1e-6)
        v_f = v[e_f[:, 0]] * (1 - w[:, None]) + v[e_f[:, 1]] * w[:, None]
        return v_f, e_f
