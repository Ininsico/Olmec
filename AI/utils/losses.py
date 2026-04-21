import torch
import torch.nn as nn
import torch.nn.functional as F
from .losses_sota import LPIPS, ssim_loss, chamfer_triton

class OlmecLoss(nn.Module):
    def __init__(self, n_tasks=6):
        super().__init__()
        self.log_vars = nn.Parameter(torch.zeros(n_tasks))
        self.lpips = DINOv2Perceptual()

    def _sample_importance(self, f, n=1024):
        # Sample points where SDF is close to 0 (near surface)
        p = torch.empty(n, 3).uniform_(-1, 1).to(self.log_vars.device)
        p.requires_grad_(True)
        s = f(p)
        # Gradient magnitude as importance metric
        g = torch.autograd.grad(s, p, torch.ones_like(s))[0]
        w = torch.exp(-100. * torch.abs(s)) # High weight near s=0
        return p, w

    def forward(self, p, t, sdf_fn=None):
        l = {}
        if 'sdf' in p and 'gt_sdf' in t: l['sdf'] = F.l1_loss(p['sdf'], t['gt_sdf'])
        if 'grad' in p: l['eik'] = torch.mean((torch.linalg.norm(p['grad'], ord=2, dim=-1) - 1.)**2)
        if 'render' in p and 'gt_img' in t:
            l['pho'] = F.l1_loss(p['render'], t['gt_img'])
            l['ssim'] = ssim_loss(p['render'], t['gt_img'])
            l['perc'] = self.lpips(p['render'], t['gt_img'])
        if 'gs' in p and sdf_fn is not None:
            l['dsc'] = torch.mean(torch.abs(sdf_fn(p['gs']['xyz'])))
            
        # Uncertainty weighting logic (MTL) 
        # Loss = sum( exp(-log_var) * L + log_var )
        t_l = 0
        for i, (k, v) in enumerate(l.items()):
            w = torch.exp(-self.log_vars[i])
            t_l += w * v + self.log_vars[i]
            l[f"{k}_w"] = w.detach()
            
        l['tot'] = t_l
        return l
