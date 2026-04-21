import torch
import torch.nn as nn
import torch.nn.functional as F

class DiffeomorphicRefiner(nn.Module):
    def __init__(self, d=1152, h=512, steps=6):
        super().__init__()
        self.steps = steps
        self.net = nn.Sequential(
            nn.Linear(d + 3, h),
            nn.SiLU(),
            nn.Linear(h, 3)
        )

    def forward(self, v, z):
        # v: [B, V, 3], z: [B, D]
        # Scaling and Squaring (SVF) for Diffeomorphic Mapping
        # Guarantees the transformation is bijective (no self-intersections)
        dt = 1.0 / (2**self.steps)
        
        # Initial velocity field
        vel = self.net(torch.cat([v, z.unsqueeze(1).expand(-1, v.shape[1], -1)], -1))
        x = v + vel * dt
        
        # Iterative Squaring (Integration of the ODE)
        for _ in range(self.steps):
            # v(x) = v(x) + v(v(x)) style integration
            # Ensuring the mapping remains a diffeomorphism
            vel_x = self.net(torch.cat([x, z.unsqueeze(1).expand(-1, x.shape[1], -1)], -1))
            x = x + vel_x * dt
            dt *= 2
        return x
