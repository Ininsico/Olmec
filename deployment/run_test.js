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

# Find a banana image
files = glob.glob('api_uploads/*banana*')
if not files:
    files = glob.glob('api_uploads/*.png')
print(f'Using: {files[0]}', flush=True)

eng = OlmecMathEngine(grid_res=32)
print('Engine ready', flush=True)
mesh = eng.reconstruct_from_image(files[0])
print(f'Done: {len(mesh.vertices)} verts, {len(mesh.triangles)} faces', flush=True)
eng.export_mesh(mesh, '/tmp/test_out.glb')
print('Exported OK', flush=True)
`;
    fs.writeFileSync('/tmp/test_engine.py', testScript);
    await ssh.putFile('/tmp/test_engine.py', '/opt/olmec/AI/test_engine.py');
    
    let r = await x('cd /opt/olmec/AI && timeout 120 venv/bin/python3 test_engine.py 2>&1');
    console.log('OUTPUT:');
    console.log(r.stdout);
    console.log('STDERR:');
    console.log(r.stderr);
    
    r = await x('ls -la /tmp/test_out.glb 2>/dev/null');
    console.log('FILE:', r.stdout.trim() || 'NO FILE');

    await x('rm -f /opt/olmec/AI/test_engine.py');
    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
