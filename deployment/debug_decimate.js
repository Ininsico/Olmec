const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    // Test decimation directly
    let r = await x('cd /opt/olmec/AI && venv/bin/python3 -c "
import open3d as o3d
print(\"open3d version:\", open3d.__version__)
# Create test mesh
mesh = o3d.geometry.TriangleMesh.create_sphere()
print(\"Before:\", len(mesh.vertices), \"verts,\", len(mesh.triangles), \"faces\")
dec = mesh.simplify_quadric_decimation(target_number_of_triangles=100)
print(\"After:\", len(dec.vertices), \"verts,\", len(dec.triangles), \"faces\")
print(\"Method exists:\", hasattr(mesh, \"simplify_quadric_decimation\"))
"');
    console.log(r.stdout + r.stderr);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
