const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('Uploading built frontend...');
    await ssh.execCommand('mkdir -p /opt/olmec/frontend/dist');
    await ssh.putDirectory(
        path.resolve(__dirname, '../frontend/dist'),
        '/opt/olmec/frontend/dist',
        { recursive: true, concurrency: 20 }
    );

    console.log('Restarting nginx...');
    await x('systemctl restart nginx');

    console.log('Testing...');
    let r = await x('curl -s -o /dev/null -w "%{http_code}" http://localhost');
    console.log('HTTP:', r.stdout);
    r = await x('curl -s http://localhost | head -c 200');
    console.log('Content:', r.stdout);

    // Test API proxy too
    r = await x('curl -s http://localhost/ai-api/health');
    console.log('API via nginx:', r.stdout);

    console.log('Test from outside via curl...');
    r = await x('curl -s --connect-timeout 5 http://68.183.103.119 | head -c 100');
    console.log('Public HTTP:', r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
