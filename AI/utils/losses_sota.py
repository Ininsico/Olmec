import torch
import torch.nn as nn
import torch.nn.functional as F
from .chamfer_kernel import triton_chamfer
from models.encoder import MultiScaleEncoder

class DINOv2Perceptual(nn.Module):
    def __init__(self):
        super().__init__()
        self.enc = MultiScaleEncoder()
        for p in self.parameters(): p.requires_grad = False

    def forward(self, x, y):
        # Using SOTA DINOv2 features for perceptual consistency
        f1 = self.enc(x)
        f2 = self.enc(y)
        return F.mse_loss(f1, f2)

def ssim_loss(x, y, w=11):
    c1, c2 = 0.01**2, 0.03**2
    mu_x = F.avg_pool2d(x, w, 1, w//2)
    mu_y = F.avg_pool2d(y, w, 1, w//2)
    sig_x = F.avg_pool2d(x*x, w, 1, w//2) - mu_x**2
    sig_y = F.avg_pool2d(y*y, w, 1, w//2) - mu_y**2
    sig_xy = F.avg_pool2d(x*y, w, 1, w//2) - mu_x*mu_y
    ssim = ((2*mu_x*mu_y + c1)*(2*sig_xy + c2)) / ((mu_x**2 + mu_y**2 + c1)*(sig_x + sig_y + c2))
    return (1 - ssim).mean()

def chamfer_sota(p1, p2):
    if p1.is_cuda: return triton_chamfer(p1.reshape(-1, 3), p2.reshape(-1, 3))
    else:
        d = torch.cdist(p1, p2)
        return d.min(2)[0].mean() + d.min(1)[0].mean()
