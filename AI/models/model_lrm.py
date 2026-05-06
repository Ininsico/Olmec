import torch
import torch.nn as nn
import numpy as np
from skimage import measure
from .encoder import MultiModalEncoder
from .transformer import OlmecTransformer
from .renderer import GS, SDFVol
from .displacement import Disp

class OlmecLRM(nn.Module):
    def __init__(self, e=1152, h=16, l=48):
        super().__init__()
        self.enc = MultiModalEncoder()
        self.pr = nn.Linear(self.enc.embed_dim, e)
        self.tr = OlmecTransformer(d=e, h=h, l=l)
        self.gs = GS(i=e)
        self.sv = SDFVol(e=e)
        self.rf = Disp(e=e)
        self.gt = nn.Parameter(torch.randn(1, 1, e))

    def freeze_except(self, component_name):
        for name, param in self.named_parameters():
            param.requires_grad = False
        
        target = None
        if component_name == "encoder": target = self.enc
        elif component_name == "transformer": target = self.tr
        elif component_name == "renderer": target = [self.gs, self.sv, self.rf]
        
        if isinstance(target, list):
            for t in target:
                for p in t.parameters(): p.requires_grad = True
        elif target:
            for p in target.parameters(): p.requires_grad = True
        
        print(f"[!] COMPONENT FOCUS: {component_name.upper()} active. All other layers frozen.")

    def forward(self, i=None, text=None, c=None, ds=False):
        B = i.shape[0] if i is not None else 1
        f = self.enc(image=i, text=text, device=self.gt.device)
        x = self.pr(f).reshape(B, f.shape[1], -1)
        k = torch.cat([self.gt.expand(B, -1, -1), x], 1)
        r = self.tr(k, rh=ds)
        lt, il = r if ds else (r, None)
        ctx = lt[:, 0:1]
        g = self.gs(lt[:, 1:])
        res = {"gs": g, "ctx": ctx}
        if il: res["aux"] = [h[:, 0:1] for i, h in enumerate(il) if i % 12 == 0 and i > 0]
        if c is not None:
            s, rgb = self.sv(c, ctx.expand(-1, c.size(1), -1))
            sr = s + self.rf(c, ctx)
            res.update({"sdf": s, "sdf_r": sr, "rgb": rgb})
        return res

    @torch.no_grad()
    def generate(self, i=None, text=None, res=128, t=0.0):
        B = i.shape[0] if i is not None else 1
        d = self.gt.device
        f = self.enc(image=i, text=text, device=d)
        x = self.pr(f).reshape(B, f.shape[1], -1)
        lt = self.tr(torch.cat([self.gt.expand(B, -1, -1), x], 1))
        ctx = lt[:, 0:1]
        g = torch.stack(torch.meshgrid(torch.linspace(-1,1,res),torch.linspace(-1,1,res),torch.linspace(-1,1,res),indexing='ij'),-1).to(d).reshape(1,-1,3)
        sv = []
        for j in range(0, g.shape[1], 65536):
            ck = g[:, j:j+65536]
            s, _ = self.sv(ck, ctx.expand(-1, ck.size(1), -1))
            sv.append(s + self.rf(ck, ctx))
        sg = torch.cat(sv, 1).reshape(res, res, res).cpu().numpy()
        v, f, n, val = measure.marching_cubes(sg, level=t)
        return (v / (res-1)) * 2 - 1, f
