import torch
import torch.nn as nn

class SparseOctree(nn.Module):
    def __init__(self, depth=4):
        super().__init__()
        self.depth = depth
        # Hierarchical Grid Embeddings
        self.levels = nn.ParameterList([
            nn.Parameter(torch.randn(1, 16, 2**i, 2**i, 2**i)) 
            for i in range(2, 2+depth)
        ])

    def forward(self, p):
        # p: [B, N, 3]
        f = []
        for i in range(self.depth):
            # Hierarchical tri-linear interpolation across the Octree levels
            # Standard in SOTA sparse neural fields (e.g. NGLOD)
            g = self.levels[i]
            # Grid sample in 3D
            f.append(F.grid_sample(g.expand(p.shape[0], -1, -1, -1, -1), 
                                   p.unsqueeze(1).unsqueeze(1), 
                                   align_corners=True).squeeze(2).squeeze(2))
        return torch.cat(f, 1).transpose(1, 2)
