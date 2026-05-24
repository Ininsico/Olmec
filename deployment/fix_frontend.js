const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('Check frontend dist...');
    let r = await x('ls -la /opt/olmec/frontend/dist/ 2>/dev/null || echo "NO DIST DIR"');
    console.log(r.stdout);

    console.log('Check frontend src...');
    r = await x('ls /opt/olmec/frontend/src/ 2>/dev/null || echo "NO SRC"');
    console.log(r.stdout);

    console.log('Check if node/npm available...');
    r = await x('node --version && npm --version');
    console.log(r.stdout);

    console.log('Install frontend deps and build...');
    r = await x('cd /opt/olmec/frontend && npm install 2>&1 | tail -5');
    console.log(r.stdout);

    r = await x('cd /opt/olmec/frontend && npm run build 2>&1 | tail -10');
    console.log(r.stdout);

    console.log('Check dist now...');
    r = await x('ls -la /opt/olmec/frontend/dist/ 2>/dev/null');
    console.log(r.stdout);

    console.log('Restart nginx...');
    await x('systemctl restart nginx');

    console.log('Test...');
    r = await x('curl -s -o /dev/null -w "%{http_code}" http://localhost');
    console.log('HTTP:', r.stdout);
    r = await x('curl -s http://localhost 2>&1 | head -5');
    console.log('Content:', r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
