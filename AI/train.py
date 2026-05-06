import os
import torch
import torch.nn as nn
from accelerate import Accelerator
from tqdm import tqdm
from timm.utils import ModelEmaV3
from torch.optim.lr_scheduler import LambdaLR
from models.model_lrm import OlmecLRM
from utils.losses import OlmecLoss
import threading
import requests
import subprocess

class Trainer:
    def __init__(self, c):
        self.c = c
        self.acc = Accelerator(mixed_precision="bf16")
        self.m = OlmecLRM()
        self.o = torch.optim.AdamW(self.m.parameters(), lr=c['lr'], weight_decay=c['wd'], betas=(0.9, 0.95))
        l_fn = lambda s: float(s)/float(max(1, c['wp'])) if s < c['wp'] else 0.5*(1.+torch.cos(torch.tensor(3.14159*(s-c['wp'])/(c['tot']-c['wp']))))
        self.s = LambdaLR(self.o, l_fn)
        self.ema = ModelEmaV3(self.m, decay=0.999) if self.acc.is_main_process else None
        self.crit = OlmecLoss()
        
        # Component Focus
        if c.get('component'):
            self.m.freeze_except(c['component'])
            
        self.m, self.o, self.s = self.acc.prepare(self.m, self.o, self.s)
        self._start_dashboard()

    def sync_remote(self, server_url):
        if not self.acc.is_main_process: return
        try:
            print(f"[*] Syncing with Master at {server_url}...")
            # Push local weights
            m_bytes = io.BytesIO()
            torch.save(self.acc.unwrap_model(self.m).state_dict(), m_bytes)
            m_bytes.seek(0)
            requests.post(f"{server_url}/push_weights", files={"file": m_bytes})
        except: print("[!] Sync failed.")

    def _start_dashboard(self):
        if self.acc.is_main_process:
            def serve():
                subprocess.Popen(["python", "dashboard_server.py"])
            threading.Thread(target=serve, daemon=True).start()

    def step(self, b, gs):
        self.m.train()
        with self.acc.accumulate(self.m):
            out = self.m(b['img'], text=b.get('text'))
            loss = self.crit(out, b)
            self.acc.backward(loss['tot'])
            if self.acc.sync_gradients: self.acc.clip_grad_norm_(self.m.parameters(), 1.0)
            self.o.step()
            self.s.step()
            self.o.zero_grad()
            if self.ema: self.ema.update(self.m)
        return loss

    def save_checkpoint(self, gs, path="checkpoints"):
        if self.acc.is_main_process:
            os.makedirs(path, exist_ok=True)
            m_path = os.path.join(path, f"olmec_step_{gs}.pt")
            torch.save(self.acc.unwrap_model(self.m).state_dict(), m_path)
            torch.save(self.acc.unwrap_model(self.m).state_dict(), os.path.join(path, "latest.pt"))

    def visualize(self, b, gs, path="previews"):
        if not self.acc.is_main_process: return
        self.m.eval()
        os.makedirs(path, exist_ok=True)
        with torch.no_grad():
            v, f = self.acc.unwrap_model(self.m).generate(b['img'][0:1], res=128)
            from utils.mesh import MeshEngine
            e = MeshEngine(vertices=v, faces=f)
            e.export(os.path.join(path, f"preview_{gs}.glb"))
            e.export(os.path.join(path, "preview_latest.glb"))

    def run(self, dl):
        dl = self.acc.prepare(dl)
        pb = tqdm(range(self.c['tot']), disable=not self.acc.is_main_process, desc="Olmec Training")
        gs = 0
        while gs < self.c['tot']:
            for b in dl:
                l = self.step(b, gs)
                if self.acc.is_main_process:
                    try:
                        requests.post(f"http://{self.c.get('master_ip', 'localhost')}:8080/update", json={
                            "worker_id": self.c.get('worker_id', 'master'),
                            "component": self.c.get('component', 'full'),
                            "step": gs,
                            "loss": l['tot'].item(),
                            "sdf": l.get('sdf', torch.tensor(0)).item(),
                            "eik": l.get('eik', torch.tensor(0)).item()
                        }, timeout=0.1)
                    except: pass
                
                if gs % self.c.get('sync_every', 1000) == 0 and self.c.get('master_ip'):
                    self.sync_remote(f"http://{self.c['master_ip']}:8080")
                if gs % self.c.get('vis_every', 500) == 0:
                    self.visualize(b, gs)
                if gs % self.c.get('save_every', 2000) == 0:
                    self.save_checkpoint(gs)
                pb.set_postfix({k: f"{v.item():.4f}" for k, v in l.items() if isinstance(v, torch.Tensor)})
                pb.update(1)
                gs += 1
                if gs >= self.c['tot']: break
