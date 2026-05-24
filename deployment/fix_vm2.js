const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('Check libGL...');
    let r = await x('ldconfig -p | grep libGL 2>/dev/null || dpkg -l | grep libgl 2>/dev/null || echo "no libGL found"');
    console.log(r.stdout);

    console.log('Install libgl...');
    r = await x('DEBIAN_FRONTEND=noninteractive apt-get install -y -qq libgl1-mesa-glx 2>&1 | tail -3');
    console.log(r.stdout);

    console.log('Check open3d from AI dir...');
    r = await x('cd /opt/olmec/AI && venv/bin/python3 -c "import open3d; print(\'open3d OK\')"');
    console.log(r.stdout || r.stderr);

    console.log('Check math engine from AI dir...');
    r = await x('cd /opt/olmec/AI && venv/bin/python3 -c "from olmec_math_engine import OlmecMathEngine; print(\'MATH ENGINE OK\')"');
    console.log(r.stdout || r.stderr);

    console.log('Restart API from AI dir...');
    await x('cd /opt/olmec/AI && pm2 delete olmec-api 2>/dev/null; true');
    r = await x('cd /opt/olmec/AI && pm2 start venv/bin/python --name olmec-api -- -m uvicorn OlmecAPI:app --host 0.0.0.0 --port 8000 --log-level info');
    console.log(r.stdout);
    await new Promise(r => setTimeout(r, 3000));

    console.log('Health...');
    r = await x('curl -s http://localhost:8000/health');
    console.log('HEALTH:', r.stdout);

    console.log('Test generation...');
    r = await x('cd /opt/olmec/AI && curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/banana_test.glb -w "%{http_code}"');
    console.log('HTTP:', r.stdout);
    r = await x('ls -la /tmp/banana_test.glb 2>/dev/null');
    console.log(r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
