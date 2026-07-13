const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Wait a bit for API to fully start
    for (let i = 0; i < 20; i++) {
        let r = await s('curl -s --connect-timeout 5 http://localhost:8000/health 2>/dev/null');
        if (r.stdout) { console.log('Health:', r.stdout.trim()); break; }
        console.log('Waiting... attempt', i+1);
        await new Promise(r => setTimeout(r, 3000));
    }

    // Test generate
    let r = await s('cd /opt/olmec/AI && timeout 120 curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/neural_test.glb -w "%{http_code}"');
    console.log('Generate HTTP:', r.stdout);

    r = await s('ls -la /tmp/neural_test.glb 2>/dev/null');
    console.log('GLB:', r.stdout.trim());
    
    if (r.stdout.includes('neural_test.glb')) {
        r = await s('python3 -c "import struct; f=open(\'/tmp/neural_test.glb\',\'rb\'); m=struct.unpack(\'<I\',f.read(4))[0]; f.seek(0,2); sz=f.tell(); print(\'VALID\' if m==0x46546C67 else \'INVALID\', round(sz/1024,1), \'KB\'); f.close()"');
        console.log(r.stdout);
    }

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
