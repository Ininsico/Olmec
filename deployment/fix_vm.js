const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd)).stdout;

    console.log('Installing libgomp1 for open3d...');
    console.log(await x('DEBIAN_FRONTEND=noninteractive apt-get install -y -qq libgomp1 2>&1 | tail -2'));

    console.log('Verifying open3d...');
    let r = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -c "import open3d; print(\'open3d OK\')"');
    console.log(r.stdout || r.stderr);

    console.log('Verifying full math engine...');
    r = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -c "from olmec_math_engine import OlmecMathEngine; e=OlmecMathEngine(); print(\'MATH ENGINE OK\')"');
    console.log(r.stdout || r.stderr);

    console.log('Restarting API...');
    await x('pm2 restart olmec-api');
    await new Promise(r => setTimeout(r, 3000));

    console.log('Health check...');
    r = await ssh.execCommand('curl -s http://localhost:8000/health');
    console.log(r.stdout || r.stderr);

    console.log('Test reconstruction...');
    r = await ssh.execCommand('cd /opt/olmec/AI && curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" http://localhost:8000/generate -H "x-api-key: OLMEC_DEV_KEY_99" -o /tmp/test_out.glb -w "%{http_code}"');
    console.log('HTTP:', r.stdout);
    r = await ssh.execCommand('ls -la /tmp/test_out.glb 2>/dev/null && echo "FILE EXISTS" || echo "NO FILE"');
    console.log(r.stdout);

    console.log('PM2 list...');
    console.log(await x('pm2 list'));

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
