import torch
import torch.nn as nn
import torch.nn.functional as F

class SPADE3D(nn.Module):
    def __init__(self, c_in, c_lat):
        super().__init__()
        self.gn = nn.GroupNorm(8, c_in, affine=False)
        self.mlp_gamma = nn.Sequential(nn.Conv3d(c_lat, c_in, 3, 1, 1), nn.SiLU(), nn.Conv3d(c_in, c_in, 3, 1, 1))
        self.mlp_beta = nn.Sequential(nn.Conv3d(c_lat, c_in, 3, 1, 1), nn.SiLU(), nn.Conv3d(c_in, c_in, 3, 1, 1))

    def forward(self, x, latent_vol):
        # x: grid [B, C, R, R, R], latent_vol: [B, C_LAT, R, R, R]
        x = self.gn(x)
        gamma = self.mlp_gamma(latent_vol)
        beta = self.mlp_beta(latent_vol)
        return x * (1 + gamma) + beta
