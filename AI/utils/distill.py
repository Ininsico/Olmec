import torch
import torch.nn as nn
import torch.nn.functional as F

def distillation_loss(student_out, teacher_out, t=2.0):
    # Feature-based distillation for transformer latents
    # Ensures the 12L student mimics the hidden-manifold of the 48L teacher
    s_feat = student_out['z']
    t_feat = teacher_out['z'].detach() # Explictly freeze teacher
    
    # MSE in the latent space + Cosine similarity for directionality
    l_mse = F.mse_loss(s_feat, t_feat)
    l_cos = 1 - F.cosine_similarity(s_feat, t_feat, dim=-1).mean()
    return l_mse + l_cos
