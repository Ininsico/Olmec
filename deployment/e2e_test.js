const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Test via nginx proxy (like the frontend would)
    let r = await s('curl -s -o /dev/null -w "%{http_code}" http://localhost/');
    console.log('Frontend:', r.stdout);

    r = await s('curl -s http://localhost/ | head -c 200');
    console.log('HTML:', r.stdout.slice(0, 100));

    // Test API via proxy
    r = await s('curl -s -o /dev/null -w "%{http_code}" http://localhost/ai-api/health');
    console.log('API proxy:', r.stdout);

    r = await s('curl -s http://localhost/ai-api/health');
    console.log('Health:', r.stdout);

    // Generate test
    r = await s('cd /opt/olmec/AI && timeout 120 curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/e2e.glb -w "%{http_code}"');
    console.log('Generate:', r.stdout);

    r = await s('ls -la /tmp/e2e.glb 2>/dev/null');
    console.log('GLB:', r.stdout.trim());

    if (r.stdout.includes('/tmp/e2e.glb')) {
        r = await s('python3 -c "import struct; f=open(\'/tmp/e2e.glb\',\'rb\'); m=struct.unpack(\'<I\',f.read(4))[0]; f.seek(0,2); sz=f.tell(); print(\'VALID GLB\' if m==0x46546C67 else \'INVALID\', round(sz/1024,1), \'KB\'); f.close()"');
        console.log(r.stdout);
    }

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
