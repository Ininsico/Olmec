from .flow import FlowRefiner
from .dmtet_solver import DMTetSolver
from .mesh_refiner import MeshRefiner

class OlmecSOTA(OlmecEngine):
    def __init__(self, c):
        super().__init__(c)
        self.flow = FlowRefiner(d=c['tra_c']['d'])
        self.tet = DMTetSolver(r=c.get('tet_res', 64))
        self.mrf = MeshRefiner()

    def forward(self, i, p=None, r=None, refine=True):
        B, V = i.shape[:2]
        f = self.enc(i.reshape(B*V, *i.shape[2:]))
        z = self.trl(torch.cat([self.gtk.expand(B, -1, -1), f.reshape(B, -1, f.shape[-1])], 1))
        
        if refine: z = self.flow(z)
        
        tp = self.prj(z[:, 1:])
        res = {"tp": tp, "z": z}
        
        if p is not None:
            f_p = self.prj.sample(p, tp)
            s, c = self.sdv(p, f_p)
            res.update({"sdf": s, "rgb": c})
            
        # Differentiable Mesh Extraction via DMTet
        v_grid = self.tet.v.expand(B, -1, -1)
        s_tet, _ = self.sdv(v_grid, self.prj.sample(v_grid, tp))
        v_m, e_m = self.tet(s_tet, torch.zeros_like(self.tet.v).expand(B, -1, -1))
        
        # Post-extraction GCN Refinement
        v_m = self.mrf(v_m, e_m[0]) # Use first batch edge if shared
        res["mesh"] = {"v": v_m, "e": e_m}
        
        if r is not None:
            fn = lambda q: self.sdv(q, self.prj.sample(q, tp))
            res["render"] = self.vrr(r, fn)
            
        return res
