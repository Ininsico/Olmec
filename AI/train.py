import os
import torch
import torch.nn as nn
from accelerate import Accelerator
from tqdm import tqdm
from timm.utils import ModelEmaV3
from torch.optim.lr_scheduler import LambdaLR
from models.model_lrm import OlmecLRM
from utils.losses import OlmecLoss

class Trainer:
    def __init__(self, c):
        self.c = c
        self.acc = Accelerator(mixed_precision="bf16", log_with="wandb")
        self.m = OlmecLRM()
        self.o = torch.optim.AdamW(self.m.parameters(), lr=c['lr'], weight_decay=c['wd'], betas=(0.9, 0.95))
        l_fn = lambda s: float(s)/float(max(1, c['wp'])) if s < c['wp'] else 0.5*(1.+np.cos(np.pi*(s-c['wp'])/(c['tot']-c['wp'])))
        self.s = LambdaLR(self.o, l_fn)
        self.ema = ModelEmaV3(self.m, decay=0.999) if self.acc.is_main_process else None
        self.crit = OlmecLoss({"sdf": 20., "sdf_r": 10., "eik": 0.5, "nrm": 1., "rgb": 5., "spr": 0.05})
        self.m, self.o, self.s = self.acc.prepare(self.m, self.o, self.s)
        if self.acc.is_main_process: self.acc.init_trackers("Olmec-LRM", config=c)

    def step(self, b, gs):
        self.m.train()
        with self.acc.accumulate(self.m):
            out = self.m(b['img'], c=b['xyz'], ds=True)
            if self.c.get('eik', False): out['grad'] = self.m.module.sv.grad(b['xyz'], out['ctx'])
            loss = self.crit(out, b)
            self.acc.backward(loss['tot'])
            if self.acc.sync_gradients: self.acc.clip_grad_norm_(self.m.parameters(), 1.0)
            self.o.step()
            self.s.step()
            self.o.zero_grad()
            if self.ema: self.ema.update(self.m)
        return loss

    def run(self, dl, vl):
        dl, vl = self.acc.prepare(dl, vl)
        pb = tqdm(range(self.c['tot']), disable=not self.acc.is_main_process)
        gs = 0
        for _ in range(100):
            for b in dl:
                l = self.step(b, gs)
                if gs % self.c['log'] == 0: self.acc.log({f"t/{k}": v for k, v in l.items()}, step=gs)
                pb.update(1)
                gs += 1
                if gs >= self.c['tot']: break
            if gs >= self.c['tot']: break

if __name__ == "__main__":
    import numpy as np
    cfg = {"lr": 2e-4, "wd": 0.05, "tot": 500000, "wp": 5000, "log": 10, "eik": True}
    print("Trainer Core Ready. SOTA Pipeline Loaded.")
    # t = Trainer(cfg); t.run(train_dl, val_dl)
