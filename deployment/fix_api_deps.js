const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    console.log('Installing missing deps...');
    let r = await ssh.execCommand('cd /opt/olmec/AI && venv/bin/pip install uvicorn fastapi python-multipart python-dotenv requests');
    console.log(r.stdout.slice(-200));
    console.log('Checking uvicorn...');
    r = await ssh.execCommand('cd /opt/olmec/AI && venv/bin/python -c "import uvicorn; print(\'uvicorn OK\')"');
    console.log(r.stdout || r.stderr);
    console.log('Checking fastapi...');
    r = await ssh.execCommand('cd /opt/olmec/AI && venv/bin/python -c "from fastapi import FastAPI; print(\'fastapi OK\')"');
    console.log(r.stdout || r.stderr);
    console.log('Restarting service...');
    r = await ssh.execCommand('pm2 restart olmec-api');
    console.log(r.stdout);
    await new Promise(r => setTimeout(r, 3000));
    r = await ssh.execCommand('curl -s http://localhost:8000/health');
    console.log('Health check:', r.stdout || r.stderr);
    r = await ssh.execCommand('pm2 list');
    console.log(r.stdout);
    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
