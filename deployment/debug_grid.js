const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    // Test the grid mesh construction directly
    const code = `
from PIL import Image
import numpy as np
import sys
sys.path.insert(0, '/opt/olmec/AI')
from olmec_math_engine import OlmecMathEngine, ImageProcessor, ReliefConstructor

img = Image.open('/opt/olmec/AI/nano_banana_collection/banana_og.png').convert("RGB")
img256 = img.resize((256, 256))
img_np = np.array(img256)

proc = ImageProcessor()
mask = proc.extract_silhouette(img_np)
print("Mask shape:", mask.shape, "sum:", mask.sum())

hm = proc.intensity_heightmap(img_np, mask, sigma=3.0)
print("HM shape:", hm.shape, "range:", hm.min(), hm.max())

con = ReliefConstructor()
verts, faces = con.build_grid_mesh(mask, hm, grid_size=48)
print("Verts:", len(verts), "Faces:", len(faces))
if len(verts) > 0:
    print("Verts range X:", verts[:,0].min(), verts[:,0].max())
    print("Verts range Y:", verts[:,1].min(), verts[:,1].max())
    print("Verts range Z:", verts[:,2].min(), verts[:,2].max())
else:
    print("NO VERTS GENERATED")
`;
    require('fs').writeFileSync('/tmp/debug_grid.py', code);
    await ssh.putFile('/tmp/debug_grid.py', '/tmp/debug_grid.py');
    let r = await x('cd /opt/olmec/AI && venv/bin/python3 /tmp/debug_grid.py');
    console.log(r.stdout);
    console.log(r.stderr);
    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
