import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from transformers import AutoModel, AutoImageProcessor, CLIPTextModel, CLIPTokenizer, CLIPVisionModel

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

class MultiModalEncoder(nn.Module):
    """
    SOTA Multi-modal Encoder integrating DINOv2 for geometry 
    and CLIP for semantic/textual context.
    """
    def __init__(self, dino_name="facebook/dinov2-large", clip_name="openai/clip-vit-large-patch14"):
        super().__init__()
        self.dino = MultiScaleEncoder(dino_name)
        self.clip_text = CLIPTextModel.from_pretrained(clip_name)
        self.clip_vision = CLIPVisionModel.from_pretrained(clip_name)
        self.tokenizer = CLIPTokenizer.from_pretrained(clip_name)
        
        # Projection layer to align CLIP (1024) to DINO/Transformer (1152)
        self.proj_clip = nn.Linear(1024, 1152)
        self.embed_dim = 1152

    def forward(self, image=None, text=None, device="cuda"):
        tokens = []
        
        # 1. Image context (DINOv2)
        if image is not None:
            dino_feats = self.dino(image) # [B, N, 1152]
            tokens.append(dino_feats)
            
            # Semantic Image context (CLIP Vision)
            clip_img = self.clip_vision(image).last_hidden_state # [B, L, 1024]
            tokens.append(self.proj_clip(clip_img))
            
        # 2. Text context (CLIP Text)
        if text is not None:
            text_inputs = self.tokenizer(text, padding=True, return_tensors="pt").to(device)
            text_feats = self.clip_text(**text_inputs).last_hidden_state # [B, L, 1024]
            tokens.append(self.proj_clip(text_feats))
            
        # Concatenate all available modalities
        return torch.cat(tokens, 1) # [B, N_dino + N_clip_img + N_clip_text, 1152]
