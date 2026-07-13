const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    // Wait for server to be ready
    for (let i = 0; i < 10; i++) {
        let r = await x('curl -s --connect-timeout 3 http://localhost:8000/health');
        if (r.stdout) { console.log('Health:', r.stdout); break; }
        await new Promise(r => setTimeout(r, 2000));
    }

    let r = await x('cd /opt/olmec/AI && timeout 60 curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/optimized.glb -w "%{http_code}"');
    console.log('HTTP:', r.stdout);

    r = await x('ls -la /tmp/optimized.glb 2>/dev/null || echo "NO FILE"');
    console.log('File:', r.stdout);

    r = await x('python3 -c "import struct; f=open(\'/tmp/optimized.glb\',\'rb\'); m=struct.unpack(\'<I\',f.read(4))[0]; f.seek(0,2); sz=f.tell(); print(\'VALID\',sz/1024,\'KB\' if m==0x46546C67 else \'BAD\'); f.close()"');
    console.log(r.stdout);

    r = await x('pm2 logs olmec-api --lines 12 --nostream');
    console.log('OUT:', r.stdout.slice(-800));

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
