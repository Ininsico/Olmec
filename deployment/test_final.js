const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('PM2 status...');
    let r = await x('pm2 list');
    console.log(r.stdout);

    console.log('\nAPI logs last 30 lines...');
    r = await x('pm2 logs olmec-api --lines 30 --nostream');
    console.log(r.out || r.stderr);

    console.log('\nTry health with timeout...');
    r = await x('timeout 10 curl -s http://localhost:8000/health 2>&1 || echo "TIMEOUT/FAIL"');
    console.log(r.stdout || r.stderr);

    console.log('\nCheck if port 8000 is listening...');
    r = await x('ss -tulpn | grep 8000 || echo "NOT LISTENING"');
    console.log(r.stdout);

    console.log('\nTry running uvicorn directly...');
    r = await x('cd /opt/olmec/AI && timeout 5 venv/bin/python -m uvicorn OlmecAPI:app --host 0.0.0.0 --port 8001 2>&1 || true');
    console.log(r.stdout || r.stderr);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
