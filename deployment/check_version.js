const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Check open3d version
    let r = await s('cd /opt/olmec/AI && venv/bin/python3 -c "import open3d; print(open3d.__version__)"');
    console.log('Open3D:', r.stdout.trim());
    
    // Check numpy version
    r = await s('cd /opt/olmec/AI && venv/bin/python3 -c "import numpy; print(numpy.__version__)"');
    console.log('Numpy:', r.stdout.trim());
    
    // Check glibc version  
    r = await s('ldd --version 2>&1 | head -1');
    console.log('GLibc:', r.stdout.trim());
    
    r = await s('python3 --version');
    console.log('Python:', r.stdout.trim());
    
    // Try creating a simple o3d mesh
    r = await s('cd /opt/olmec/AI && timeout 30 venv/bin/python3 -c "import open3d as o3d; import numpy as np; v=np.random.rand(100,3); f=np.random.randint(0,100,(50,3)); m=o3d.geometry.TriangleMesh(o3d.utility.Vector3dVector(v), o3d.utility.Vector3iVector(f)); m.compute_vertex_normals(); print(\'OK\')"');
    console.log('Simple test:', r.stdout.trim() || r.stderr.trim());

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
