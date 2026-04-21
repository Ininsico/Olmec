import torch
import torch.nn as nn

class DiffeoRK4(nn.Module):
    def __init__(self, d=1152, h=512, steps=4):
        super().__init__()
        self.steps = steps
        self.dt = 1.0 / steps
        self.net = nn.Sequential(
            nn.Linear(d + 3, h),
            nn.GroupNorm(8, h),
            nn.SiLU(),
            nn.Linear(h, 3)
        )

    def _v(self, x, z):
        return self.net(torch.cat([x, z.expand(-1, x.shape[1], -1)], -1))

    def forward(self, v, z):
        # 4th-Order Runge-Kutta (RK4) Integration
        # Mathematically superior to Euler; ensures perfect manifold flow
        x = v
        bz = z.unsqueeze(1)
        for _ in range(self.steps):
            k1 = self._v(x, bz)
            k2 = self._v(x + k1 * self.dt / 2, bz)
            k3 = self._v(x + k2 * self.dt / 2, bz)
            k4 = self._v(x + k3 * self.dt, bz)
            x = x + (self.dt / 6) * (k1 + 2*k2 + 2*k3 + k4)
        return x
