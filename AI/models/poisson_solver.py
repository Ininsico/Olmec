import torch
import torch.nn as nn
import torch.fft as fft

class PoissonSolver3D(nn.Module):
    def __init__(self, r=128):
        super().__init__()
        self.r = r
        # Spectral frequencies for the Laplacian in 3D
        k = torch.arange(r)
        k[r//2:] -= r
        k_x, k_y, k_z = torch.meshgrid(k, k, k, indexing='ij')
        lap = -(k_x**2 + k_y**2 + k_z**2).float()
        lap[0, 0, 0] = 1.0 # Avoid div by zero
        self.register_buffer("inv_lap", 1.0 / lap)

    def forward(self, div_f):
        # div_f: Divergence of the vector field [B, R, R, R]
        # Solving Grad(S) = F -> Laplacian(S) = Div(F) in Spectral Domain
        f_div = fft.fftn(div_f)
        f_sdf = f_div * self.inv_lap
        return fft.ifftn(f_sdf).real
