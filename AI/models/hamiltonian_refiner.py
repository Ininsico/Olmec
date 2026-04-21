import torch
import torch.nn as nn

class HamiltonianRefiner(nn.Module):
    def __init__(self, d=1152, h=512, steps=4):
        super().__init__()
        self.steps = steps
        self.dt = 1.0 / steps
        # Hamiltonian H(q, p) = 0.5 * p^2 + V(q, z)
        # We learn the potential field V(q, z)
        self.v_net = nn.Sequential(
            nn.Linear(d + 3, h),
            nn.SiLU(),
            nn.Linear(h, 1)
        )

    def _grad_v(self, q, z):
        q.requires_grad_(True)
        v = self.v_net(torch.cat([q, z.expand(-1, q.shape[1], -1)], -1))
        return torch.autograd.grad(v.sum(), q, create_graph=True)[0]

    def forward(self, q, z):
        # q: coordinates [B, V, 3], z: latents [B, D]
        # Symplectic Leapfrog Integration
        p = torch.zeros_like(q) # Initial momentum
        bz = z.unsqueeze(1)
        
        for _ in range(self.steps):
            # p = p - 0.5 * dt * grad_V(q)
            # q = q + dt * p
            # p = p - 0.5 * dt * grad_V(q)
            p = p - 0.5 * self.dt * self._grad_v(q, bz)
            q = q + self.dt * p
            p = p - 0.5 * self.dt * self._grad_v(q, bz)
            
        return q
