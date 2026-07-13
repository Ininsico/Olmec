const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    const testScript = `
import sys, os, glob
os.chdir('/opt/olmec/AI')
sys.path.insert(0, '.')
from olmec_math_engine import OlmecMathEngine

files = glob.glob('api_uploads/*banana*')
img_path = files[0]

eng = OlmecMathEngine(grid_res=32)

from PIL import Image
import numpy as np

print('step 1: open image', flush=True)
img = Image.open(img_path).convert('RGB')
img_resized = img.resize((256, 256))
img_np = np.array(img_resized)
print(f'step 2: img shape {img_np.shape}', flush=True)

print('step 3: smooth', flush=True)
img_smooth = eng.processor.bilateral_smooth(img_np, sigma_s=3, sigma_r=0.1)
print(f'step 4: smooth done {img_smooth.shape}', flush=True)

print('step 5: silhouette', flush=True)
mask = eng.processor.extract_silhouette(img_smooth)
print(f'step 6: mask shape {mask.shape} sum {mask.sum()}', flush=True)

print('step 7: heightmap', flush=True)
heightmap = eng.processor.intensity_heightmap(img_np, mask, sigma=3.0)
print(f'step 8: heightmap {heightmap.shape} range [{heightmap.min():.4f},{heightmap.max():.4f}]', flush=True)

print('step 9: build grid', flush=True)
verts, faces = eng.constructor.build_grid_mesh(mask, heightmap, grid_size=eng.grid_res)
print(f'step 10: mesh {len(verts)} verts {len(faces)} faces', flush=True)

print('step 11: create o3d mesh', flush=True)
import open3d as o3d
o3d_mesh = o3d.geometry.TriangleMesh(
    o3d.utility.Vector3dVector(verts),
    o3d.utility.Vector3iVector(faces)
)
print('step 12: compute normals', flush=True)
o3d_mesh.compute_vertex_normals()
print('step 13: smoothing', flush=True)
o3d_mesh = o3d_mesh.filter_smooth_taubin(number_of_iterations=2)
print('step 14: done', flush=True)
`;
    fs.writeFileSync('/tmp/test_engine2.py', testScript);
    await ssh.putFile('/tmp/test_engine2.py', '/opt/olmec/AI/test_engine2.py');
    
    let r = await x('cd /opt/olmec/AI && timeout 120 venv/bin/python3 test_engine2.py 2>&1');
    console.log('OUTPUT:');
    console.log(r.stdout || '(empty)');
    console.log('STDERR:');
    console.log(r.stderr || '(empty)');

    await x('rm -f /opt/olmec/AI/test_engine2.py');
    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
