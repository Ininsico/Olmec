const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('=== PM2 STATUS ===');
    let r = await x('pm2 list');
    console.log(r.stdout);

    console.log('=== API HEALTH ===');
    r = await x('curl -s http://localhost:8000/health');
    console.log(r.stdout);

    console.log('=== NGINX ===');
    r = await x('systemctl is-active nginx');
    console.log(r.stdout);

    console.log('=== TEST GENERATION ===');
    r = await x('curl -s -X POST -F "file=@/opt/olmec/AI/nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/verify_now.glb -w "%{http_code}"');
    console.log('HTTP:', r.stdout);

    r = await x('ls -la /tmp/verify_now.glb 2>/dev/null');
    console.log('File:', r.stdout);

    if (r.stdout.includes('No such')) {
        console.log('NO FILE - generation failed');
    } else {
        r = await x('python3 -c "import struct; f=open(\'/tmp/verify_now.glb\',\'rb\'); m=struct.unpack(\'<I\',f.read(4))[0]; print(\'VALID GLB\' if m==0x46546C67 else \'BAD\'); f.close()"');
        console.log('GLB check:', r.stdout);
    }

    console.log('=== API LOGS (last 5 lines) ===');
    r = await x('pm2 logs olmec-api --lines 5 --nostream');
    console.log(r.stdout.slice(-500));

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
