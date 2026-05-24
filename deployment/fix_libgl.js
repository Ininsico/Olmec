const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('Install libgl1...');
    let r = await x('DEBIAN_FRONTEND=noninteractive apt-get install -y -qq libgl1 2>&1 | tail -3');
    console.log(r.stdout);

    console.log('Find libGL.so...');
    r = await x('find /usr -name "libGL.so*" 2>/dev/null; ldconfig -p | grep libGL');
    console.log(r.stdout || r.stderr);

    console.log('Check open3d now...');
    r = await x('cd /opt/olmec/AI && venv/bin/python3 -c "import open3d; print(\'OPEN3D OK\')" 2>&1');
    console.log(r.stdout);

    console.log('Check math engine...');
    r = await x('cd /opt/olmec/AI && venv/bin/python3 -c "from olmec_math_engine import OlmecMathEngine; e=OlmecMathEngine(); print(\'MATH ENGINE OK\')" 2>&1');
    console.log(r.stdout);

    console.log('Restart API...');
    await x('cd /opt/olmec/AI && pm2 delete olmec-api 2>/dev/null; true');
    await x('cd /opt/olmec/AI && pm2 start venv/bin/python --name olmec-api -- -m uvicorn OlmecAPI:app --host 0.0.0.0 --port 8000');
    await new Promise(r => setTimeout(r, 3000));

    r = await x('curl -s http://localhost:8000/health');
    console.log('Health:', r.stdout);

    r = await x('cd /opt/olmec/AI && curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/banana.glb -w "%{http_code}"');
    console.log('HTTP:', r.stdout);
    r = await x('ls -la /tmp/banana.glb 2>/dev/null');
    console.log('File:', r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
