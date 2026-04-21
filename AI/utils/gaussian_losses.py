import torch
import torch.nn as nn

def gaussian_surface_consistency(gs_xyz, gs_scales, sdf_fn):
    # gs_xyz: [N, 3], gs_scales: [N, 3], sdf_fn: SDF decoder
    # Enforce Gaussians to be thin and aligned with the surface
    # 1. Zero-crossing: SDF(xyz) = 0
    s_vals = sdf_fn(gs_xyz)
    l_sdf = torch.mean(torch.abs(s_vals))
    
    # 2. Normal Alignment: Scale[0] should be in direction of SDF gradient
    g = torch.autograd.grad(s_vals.sum(), gs_xyz, create_graph=True)[0]
    n = g / (g.norm(dim=-1, keepdim=True) + 1e-6)
    # This is a SOTA constraint used to "flatten" Gaussians onto the mesh
    return l_sdf, n
