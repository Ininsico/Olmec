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
    def _sh_kernel(sh_ptr, d_ptr, out_ptr, n_elements, BLOCK_SIZE: tl.constexpr):
        pid = tl.program_id(0)
        offsets = pid * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)
        mask = offsets < n_elements

        # Load view directions
        x = tl.load(d_ptr + offsets * 3 + 0, mask=mask)
        y = tl.load(d_ptr + offsets * 3 + 1, mask=mask)
        z = tl.load(d_ptr + offsets * 3 + 2, mask=mask)

        # SH Constants
        C0, C1, C2, C3, C4 = 0.28209479177387814, 0.4886025119029199, 1.0925484305920792, 0.31539156525252005, 0.5462742152960396

        # SH Basis Coefficients
        sh0 = C0
        sh1 = -C1 * y
        sh2 = C1 * z
        sh3 = -C1 * x
        sh4 = C2 * x * y
        sh5 = -C2 * y * z
        sh6 = C3 * (3.0 * z * z - 1.0)
        sh7 = -C2 * x * z
        sh8 = C4 * (x * x - y * y)

        for c in range(3): # RGB channels
            sh_base = sh_ptr + offsets * 27 + c * 9
            res = tl.load(sh_base + 0, mask=mask) * sh0 + \
                  tl.load(sh_base + 1, mask=mask) * sh1 + \
                  tl.load(sh_base + 2, mask=mask) * sh2 + \
                  tl.load(sh_base + 3, mask=mask) * sh3 + \
                  tl.load(sh_base + 4, mask=mask) * sh4 + \
                  tl.load(sh_base + 5, mask=mask) * sh5 + \
                  tl.load(sh_base + 6, mask=mask) * sh6 + \
                  tl.load(sh_base + 7, mask=mask) * sh7 + \
                  tl.load(sh_base + 8, mask=mask) * sh8
            tl.store(out_ptr + offsets * 3 + c, res, mask=mask)

def triton_eval_sh(sh, d):
    # Process [N, 27] and [N, 3]
    if not TRITON_AVAILABLE or not d.is_cuda:
        return _pytorch_eval_sh(sh, d)
    n = d.shape[0]
    out = torch.empty_like(d)
    grid = lambda meta: (triton.cdiv(n, meta['BLOCK_SIZE']),)
    try:
        _sh_kernel[grid](sh, d, out, n, BLOCK_SIZE=1024)
    except:
        return _pytorch_eval_sh(sh, d)
    return out

def _pytorch_eval_sh(sh, d):
    # SOTA Vectorized PyTorch implementation (Used as fallback/CPU)
    x, y, z = d[..., 0], d[..., 1], d[..., 2]
    c0, c1, c2, c3, c4 = 0.2820948, 0.4886025, 1.0925484, 0.3153916, 0.5462742
    b = torch.stack([
        c0 * torch.ones_like(x), -c1*y, c1*z, -c1*x,
        c2*x*y, -c2*y*z, c3*(3.*z*z-1.), -c2*x*z, c4*(x*x-y*y)
    ], -1)
    return (sh.reshape(-1, 3, 9) * b.unsqueeze(1)).sum(-1)
