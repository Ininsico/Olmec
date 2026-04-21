import torch
import torch.nn as nn
from einops import rearrange
from torch.nn.attention import sdpa_kernel, SDPBackend

class FusedRotaryAttention(nn.Module):
    def __init__(self, d, h, dr=0.1):
        super().__init__()
        self.d, self.h = d, h
        self.hd = d // h
        self.qkv = nn.Linear(d, d * 3)
        self.out = nn.Linear(d, d)
        self.dr = dr

    def _rope(self, x, sin, cos):
        # Optimized Rotary implementation
        return (x * cos) + (self._rotate(x) * sin)

    def _rotate(self, x):
        x = rearrange(x, '... (d r) -> ... d r', r=2)
        x1, x2 = x.unbind(-1)
        return torch.stack([-x2, x1], -1).flatten(-2)

    def forward(self, x, sin=None, cos=None):
        B, L, D = x.shape
        qkv = self.qkv(x).reshape(B, L, 3, self.h, self.hd).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]
        
        if sin is not None and cos is not None:
            q = self._rope(q, sin, cos)
            k = self._rope(k, sin, cos)

        with sdpa_kernel(SDPBackend.FLASH_ATTENTION):
            a = torch.nn.functional.scaled_dot_product_attention(q, k, v, dropout_p=self.dr if self.training else 0.0)
            
        a = a.transpose(1, 2).reshape(B, L, D)
        return self.out(a)
