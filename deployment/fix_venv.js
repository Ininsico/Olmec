const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    console.log('Checking venv/pip...');
    let r = await ssh.execCommand('ls -la /opt/olmec/AI/venv/bin/pip*');
    console.log(r.stdout);
    console.log('Check site-packages dir...');
    r = await ssh.execCommand('ls /opt/olmec/AI/venv/lib/');
    console.log(r.stdout);
    r = await ssh.execCommand('ls /opt/olmec/AI/venv/lib/python3.12/site-packages/ 2>/dev/null | head -10 || echo "empty"');
    console.log(r.stdout);
    console.log('Recreating venv...');
    r = await ssh.execCommand('cd /opt/olmec/AI && rm -rf venv && python3 -m venv venv');
    console.log(r.stdout + r.stderr);
    console.log('Upgrading pip...');
    r = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -m pip install --upgrade pip');
    console.log(r.stdout.slice(-200));
    console.log('Installing deps...');
    r = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -m pip install uvicorn fastapi python-multipart python-dotenv requests');
    console.log(r.stdout.slice(-300));
    console.log('Verify...');
    r = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -c "import uvicorn; import fastapi; print(\'OK\')"');
    console.log(r.stdout);
    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
