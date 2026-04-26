import torch
import torch.nn as nn

class CalibrationHead(nn.Module):
    def __init__(self, d=1152):
        super().__init__()
        # Predicts camera rotation (quaternion) and translation
        self.net = nn.Sequential(
            nn.Linear(d, 512),
            nn.SiLU(),
            nn.Linear(512, 7) # [q_w, q_x, q_y, q_z, t_x, t_y, t_z]
        )

    def forward(self, x):
        # x is global context [B, D]
        p = self.net(x)
        q = F.normalize(p[:, :4], dim=-1)
        t = p[:, 4:]
        return q, t

class OlmecProduction(OlmecSOTA):
    def __init__(self, c):
        super().__init__(c)
        self.cal = CalibrationHead(c['tra_c']['d'])
        self.rk4 = DiffeoRK4(d=c['tra_c']['d'])
        # ALEATORIC Uncertainty head (log_var)
        self.sdf_var = nn.Linear(512, 1)

    def forward(self, i, p=None):
        res = super().forward(i, p)
        # 1. Projective Estimator
        q, t = self.cal(res['z'][:, 0]) # Use CLS token
        res.update({"pose": (q, t)})
        
        # 2. Uncertainty Quantification
        if p is not None:
             # Sample variance for SDF confidence
             res["sdf_var"] = torch.exp(self.sdf_var(res["feat_p"]))
             
        return res
