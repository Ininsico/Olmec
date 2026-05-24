const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });

    const localPath = path.resolve(__dirname, 'banana_test_output.glb');
    await ssh.getFile(localPath, '/tmp/banana_out.glb');
    console.log('Downloaded to', localPath);
    const stat = fs.statSync(localPath);
    console.log('Size:', (stat.size / 1024).toFixed(1), 'KB');

    // Get final PM2 status
    const r = await ssh.execCommand('pm2 list');
    console.log(r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
