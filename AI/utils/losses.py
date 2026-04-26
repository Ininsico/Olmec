import torch
import torch.nn as nn
import torch.nn.functional as F
from .losses_sota import DINOv2Perceptual, ssim_loss, chamfer_sota

class OlmecLoss(nn.Module):
    def __init__(self, n_tasks=6):
        super().__init__()
        self.log_vars = nn.Parameter(torch.zeros(n_tasks))
        self.lpips = DINOv2Perceptual()

    def forward(self, p, t):
        l = {}
        if 'sdf' in p and 'gt_sdf' in t: l['sdf'] = F.l1_loss(p['sdf'], t['gt_sdf'])
        if 'grad' in p: l['eik'] = torch.mean((torch.linalg.norm(p['grad'], ord=2, dim=-1) - 1.)**2)
        if 'render' in p and 'gt_img' in t:
            l['pho'] = F.l1_loss(p['render'], t['gt_img'])
            l['ssim'] = ssim_loss(p['render'], t['gt_img'])
            l['perc'] = self.lpips(p['render'], t['gt_img'])
        
        t_l = 0
        for i, (k, v) in enumerate(l.items()):
            w = torch.exp(-self.log_vars[i])
            t_l += w * v + self.log_vars[i]
            
        l['tot'] = t_l
        return l
