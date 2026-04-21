import torch
import torch.nn as nn
from .registry import BACKBONES, PROJECTORS, HEADS, RENDERERS

class OlmecEngine(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.c = c
        self.enc = BACKBONES.get(c['enc_n'])()
        self.trl = BACKBONES.get(c['tra_n'])(**c['tra_c'])
        self.prj = PROJECTORS.get(c['prj_n'])(**c['prj_c'])
        self.sdv = HEADS.get(c['sdf_n'])(**c['sdf_c'])
        self.vrr = RENDERERS.get(c['ren_n'])(**c['ren_c'])
        self.gtk = nn.Parameter(torch.randn(1, 1, c['tra_c']['d']))

    def forward(self, i, p=None, r=None):
        B, V = i.shape[:2]
        f = self.enc(i.reshape(B*V, *i.shape[2:]))
        x = self.trl(torch.cat([self.gtk.expand(B, -1, -1), f.reshape(B, -1, f.shape[-1])], 1))
        tp = self.prj(x[:, 1:])
        res = {"tp": tp}
        if p is not None:
            f_p = self.prj.sample(p, tp)
            s, c = self.sdv(p, f_p)
            res.update({"sdf": s, "rgb": c})
        if r is not None:
            fn = lambda q: self.sdv(q, self.prj.sample(q, tp))
            res["render"] = self.vrr(r, fn)
        return res
