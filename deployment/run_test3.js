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
eng = OlmecMathEngine(grid_res=32)
mesh = eng.reconstruct_from_image(files[0])
print(f'Done: {len(mesh.vertices)} verts, {len(mesh.triangles)} faces', flush=True)
eng.export_mesh(mesh, '/tmp/test_out.glb')
print('Exported OK', flush=True)
`;
    fs.writeFileSync('/tmp/test3.py', testScript);
    await ssh.putFile('/tmp/test3.py', '/opt/olmec/AI/test3.py');
    
    let r = await x('cd /opt/olmec/AI && timeout 120 venv/bin/python3 test3.py 2>&1');
    console.log('OUTPUT:', r.stdout);
    console.log('STDERR:', r.stderr);
    
    r = await x('ls -la /tmp/test_out.glb 2>/dev/null');
    console.log('FILE:', r.stdout.trim() || 'NO FILE');

    await x('rm -f /opt/olmec/AI/test3.py');
    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
