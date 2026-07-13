const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('Uploading new math engine...');
    await ssh.putFile(
        path.resolve(__dirname, '../AI/olmec_math_engine.py'),
        '/opt/olmec/AI/olmec_math_engine.py'
    );

    console.log('Verifying...');
    let r = await x('cd /opt/olmec/AI && venv/bin/python3 -c "from olmec_math_engine import OlmecMathEngine; e=OlmecMathEngine(); print(\'NEW ENGINE OK\')"');
    console.log(r.stdout);

    console.log('Restarting API...');
    await x('pm2 restart olmec-api');
    await new Promise(r => setTimeout(r, 3000));

    r = await x('curl -s http://localhost:8000/health');
    console.log('Health:', r.stdout);

    console.log('Testing generation...');
    r = await x('cd /opt/olmec/AI && curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/relief_test.glb -w "%{http_code}"');
    console.log('HTTP:', r.stdout);
    r = await x('ls -la /tmp/relief_test.glb');
    console.log(r.stdout);
    r = await x('python3 -c "import struct; f=open(\'/tmp/relief_test.glb\',\'rb\'); m=struct.unpack(\'<I\',f.read(4))[0]; print(\'VALID GLB\' if m==0x46546C67 else \'BAD\'); f.close()"');
    console.log(r.stdout);

    r = await x('pm2 logs olmec-api --lines 10 --nostream');
    console.log('LOGS:', r.stdout.slice(-800));

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
