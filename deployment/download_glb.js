const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Find the latest GLB output
    let r = await s('ls -t /opt/olmec/AI/api_outputs/*.glb | head -1');
    let path = r.stdout.trim();
    console.log('Latest GLB:', path);
    
    // Download
    await ssh.getFile('C:\\Users\\arsla\\Desktop\\projects\\Ininsico(3D)\\Olmec\\deployment\\test_output.glb', path);
    console.log('Downloaded to test_output.glb');

    // Verify
    let stat = fs.statSync('C:\\Users\\arsla\\Desktop\\projects\\Ininsico(3D)\\Olmec\\deployment\\test_output.glb');
    console.log('Size:', stat.size, 'bytes');

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
