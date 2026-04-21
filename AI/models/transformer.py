import torch
import torch.nn as nn
from einops import rearrange, repeat
from torch.utils.checkpoint import checkpoint

class RMSNorm(nn.Module):
    def __init__(self, d, e=1e-6):
        super().__init__()
        self.e = e
        self.w = nn.Parameter(torch.ones(d))
    def forward(self, x):
        m = x.pow(2).mean(-1, keepdim=True)
        return x * torch.rsqrt(m + self.e) * self.w

class RoPE3D(nn.Module):
    def __init__(self, d, b=10000):
        super().__init__()
        self.d = d
        self.b = b

    def forward(self, x, c):
        b, n, d = x.shape
        p = d // 3
        o = []
        for i in range(3):
            v = c[..., i:i+1]
            s_x = x[..., i*p : (i+1)*p]
            f = 1. / (self.b**(torch.arange(0, p, 2).float().to(x.device)/p))
            a = v * f
            sn = repeat(torch.sin(a), 'b n f -> b n (f r)', r=2)
            cs = repeat(torch.cos(a), 'b n f -> b n (f r)', r=2)
            r = rearrange(s_x, '... (d r) -> ... d r', r=2)
            x1, x2 = r.unbind(-1)
            s_r = torch.stack([-x2, x1], -1).reshape(s_x.shape)
            o.append((s_x * cs) + (s_r * sn))
        if d % (p * 3) != 0:
            o.append(x[..., (p * 3):])
        return torch.cat(o, -1)

class Block(nn.Module):
    def __init__(self, d, h, m, dr=0.1):
        super().__init__()
        self.ln1 = RMSNorm(d)
        self.at = nn.MultiheadAttention(d, h, batch_first=True, dropout=dr)
        self.ln2 = RMSNorm(d)
        self.ff = nn.Sequential(
            nn.Linear(d, m),
            nn.GELU(),
            nn.Linear(m, d),
            nn.Dropout(dr)
        )

    def forward(self, x):
        # Explicit Flash Attention kernel selection
        with torch.nn.attention.sdpa_kernel(torch.nn.attention.SDPBackend.FLASH_ATTENTION):
            a, _ = self.at(self.ln1(x), self.ln1(x), self.ln1(x))
            x = x + a
            x = x + self.ff(self.ln2(x))
        return x

class OlmecTransformer(nn.Module):
    def __init__(self, d=1152, h=16, l=48, m=4096, cp=True):
        super().__init__()
        self.cp = cp
        self.ly = nn.ModuleList([Block(d, h, m) for _ in range(l)])
        self.rp = RoPE3D(d)
        self.nm = RMSNorm(d)

    def forward(self, x, c=None, rh=False):
        if c is not None: x = self.rp(x, c)
        hs = []
        for f in self.ly:
            if self.cp and self.training: x = checkpoint(f, x, use_reentrant=False)
            else: x = f(x)
            if rh: hs.append(x)
        x = self.nm(x)
        return (x, hs) if rh else x
