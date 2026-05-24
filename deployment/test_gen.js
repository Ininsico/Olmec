const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');
const path = require('path');

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('Testing 3D generation...');
    
    // Download test image to VM
    let r = await x('cd /opt/olmec/AI && ls nano_banana_collection/');
    console.log('Test images:', r.stdout);

    r = await x('cd /opt/olmec/AI && curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/banana_out.glb -w "%{http_code}"');
    console.log('Gen HTTP:', r.stdout);

    r = await x('ls -la /tmp/banana_out.glb 2>/dev/null');
    console.log('Output:', r.stdout);

    if (r.stdout.includes('No such file')) {
        r = await x('cat /tmp/banana_out.glb 2>/dev/null | head -c 200');
        console.log('File content:', r.stdout);
    }

    // Check API logs for errors
    r = await x('pm2 logs olmec-api --lines 20 --nostream');
    console.log('\nAPI logs:', r.stdout.slice(-1000));

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
