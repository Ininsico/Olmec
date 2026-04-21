import torch
import torch.nn as nn
from transformers import AutoModel, AutoImageProcessor

class MultiScaleEncoder(nn.Module):
    def __init__(self, model_name="facebook/dinov2-large"):
        super().__init__()
        self.model = AutoModel.from_pretrained(model_name)
        self.embed_dim = self.model.config.hidden_size
        # Feature Pyramid Network (FPN) heads
        self.fpn = nn.ModuleList([
            nn.Sequential(nn.Conv2d(self.embed_dim, 256, 1), nn.GroupNorm(8, 256), nn.SiLU())
            for _ in range(4)
        ])
        self.out_proj = nn.Linear(256 * 4, 1152)

    def forward(self, image):
        # Extract features from multiple layers (6, 12, 18, 24)
        outputs = self.model(image, output_hidden_states=True)
        hiddens = outputs.hidden_states
        selected = [hiddens[6], hiddens[12], hiddens[18], hiddens[24]]
        
        # Reshape to spatial grid for FPN processing
        B, L, D = selected[0].shape
        H = W = int(np.sqrt(L-1))
        
        feats = []
        for i, h in enumerate(selected):
            # Exclude CLS token and reshape
            h_spatial = h[:, 1:].transpose(1, 2).reshape(B, D, H, W)
            feats.append(F.interpolate(self.fpn[i](h_spatial), size=(H, W), mode='bilinear'))
            
        x = torch.cat(feats, 1) # Multi-scale fusion
        x = x.flatten(2).transpose(1, 2)
        return self.out_proj(x)
