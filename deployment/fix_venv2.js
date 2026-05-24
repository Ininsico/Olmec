const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    console.log('Installing python3.12-venv...');
    let r = await ssh.execCommand('DEBIAN_FRONTEND=noninteractive apt-get install -y python3.12-venv 2>&1');
    console.log(r.stdout.slice(-200));
    console.log('Recreating venv...');
    r = await ssh.execCommand('cd /opt/olmec/AI && rm -rf venv && python3 -m venv venv 2>&1');
    console.log(r.stdout + r.stderr);
    console.log('Upgrading pip...');
    r = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -m pip install --upgrade pip 2>&1');
    console.log(r.stdout.slice(-200));
    console.log('Installing base deps...');
    r = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -m pip install uvicorn fastapi python-multipart python-dotenv requests 2>&1');
    console.log(r.stdout.slice(-300));
    console.log('Verify...');
    r = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -c "import uvicorn; import fastapi; print(\'uvicorn+fastapi OK\')"');
    console.log(r.stdout);
    console.log('Install all requirements...');
    r = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -m pip install -r /opt/olmec/AI/requirements.txt 2>&1');
    console.log(r.stdout.slice(-500));
    console.log('Health check...');
    r = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -c "from olmec_math_engine import OlmecMathEngine; print(\'math engine OK\')"');
    console.log(r.stdout);
    console.log('All deps verified. Starting API...');
    await ssh.execCommand('pm2 delete olmec-api 2>/dev/null; true');
    r = await ssh.execCommand('cd /opt/olmec/AI && pm2 start /opt/olmec/AI/venv/bin/python --name olmec-api -- -m uvicorn OlmecAPI:app --host 0.0.0.0 --port 8000');
    console.log(r.stdout);
    await new Promise(r => setTimeout(r, 3000));
    r = await ssh.execCommand('curl -s http://localhost:8000/health');
    console.log('Health:', r.stdout || r.stderr);
    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
