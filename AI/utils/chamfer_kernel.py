import torch

try:
    import triton
    import triton.language as tl
    TRITON_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    TRITON_AVAILABLE = False
    triton = None
    tl = None

if TRITON_AVAILABLE:
    @triton.jit
    def _chamfer_kernel(p1_ptr, p2_ptr, out_ptr, n1, n2, BLOCK_SIZE: tl.constexpr):
        pid = tl.program_id(0)
        idx = pid * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)
        mask = idx < n1
        
        x1 = tl.load(p1_ptr + idx * 3 + 0, mask=mask)
        y1 = tl.load(p1_ptr + idx * 3 + 1, mask=mask)
        z1 = tl.load(p1_ptr + idx * 3 + 2, mask=mask)
        
        min_dist = tl.full((BLOCK_SIZE,), 1e10, dtype=tl.float32)
        
        for i in range(0, n2, BLOCK_SIZE):
            idx_j = i + tl.arange(0, BLOCK_SIZE)
            mask_j = idx_j < n2
            
            x2 = tl.load(p2_ptr + idx_j * 3 + 0, mask=mask_j)
            y2 = tl.load(p2_ptr + idx_j * 3 + 1, mask=mask_j)
            z2 = tl.load(p2_ptr + idx_j * 3 + 2, mask=mask_j)
            
            dx, dy, dz = x1[:, None] - x2[None, :], y1[:, None] - y2[None, :], z1[:, None] - z2[None, :]
            dist = dx*dx + dy*dy + dz*dz
            
            block_min = tl.min(dist, axis=1)
            min_dist = tl.minimum(min_dist, block_min)

        tl.store(out_ptr + idx, min_dist, mask=mask)

def triton_chamfer(p1, p2):
    # p1: [N, 3], p2: [M, 3]
    if not TRITON_AVAILABLE or not p1.is_cuda:
        return _pytorch_chamfer(p1, p2)
    
    n1, n2 = p1.shape[0], p2.shape[0]
    out1, out2 = torch.empty(n1, device=p1.device), torch.empty(n2, device=p1.device)
    grid1 = lambda meta: (triton.cdiv(n1, meta['BLOCK_SIZE']),)
    grid2 = lambda meta: (triton.cdiv(n2, meta['BLOCK_SIZE']),)
    
    try:
        _chamfer_kernel[grid1](p1, p2, out1, n1, n2, BLOCK_SIZE=512)
        _chamfer_kernel[grid2](p2, p1, out2, n2, n1, BLOCK_SIZE=512)
        return out1.mean() + out2.mean()
    except:
        return _pytorch_chamfer(p1, p2)

def _pytorch_chamfer(p1, p2):
    # Efficient PyTorch fallback using cdist
    d = torch.cdist(p1.unsqueeze(0), p2.unsqueeze(0))
    return d.min(2)[0].mean() + d.min(1)[0].mean()
