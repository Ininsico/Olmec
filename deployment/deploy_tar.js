const { NodeSSH } = require('node-ssh');
const path = require('path');
const fs = require('fs');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Upload tar
    await ssh.putFile('/tmp/dist.tar.gz', '/tmp/dist.tar.gz');
    console.log('Tar uploaded');

    // Extract
    await s('rm -rf /opt/olmec/frontend/dist && mkdir -p /opt/olmec/frontend/dist && tar -xzf /tmp/dist.tar.gz -C /opt/olmec/frontend/dist');
    await s('rm -f /tmp/dist.tar.gz');
    console.log('Extracted');

    // Upload API files
    await ssh.putFile(path.resolve(__dirname, '../AI/olmec_math_engine.py'), '/opt/olmec/AI/olmec_math_engine.py');
    await ssh.putFile(path.resolve(__dirname, '../AI/Mastermind.py'), '/opt/olmec/AI/Mastermind.py');
    await ssh.putFile(path.resolve(__dirname, '../AI/OlmecAPI.py'), '/opt/olmec/AI/OlmecAPI.py');
    console.log('API files uploaded');

    // Restart
    await s('pm2 restart olmec-api --update-env');
    await new Promise(r => setTimeout(r, 5000));

    let r = await s('curl -s http://localhost:8000/health');
    console.log('API health:', r.stdout);

    // Verify frontend is served
    r = await s('curl -s -o /dev/null -w "%{http_code}" http://localhost/');
    console.log('Frontend HTTP:', r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
