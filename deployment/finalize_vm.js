const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('Save PM2 config for reboot survival...');
    let r = await x('pm2 save');
    console.log(r.stdout);
    r = await x('pm2 startup systemd -u root --hp /root 2>&1 | tail -5');
    console.log(r.stdout);

    console.log('Final PM2 status:');
    r = await x('pm2 list');
    console.log(r.stdout);

    console.log('API health:');
    r = await x('curl -s http://localhost:8000/health');
    console.log(' ', r.stdout);

    console.log('Nginx status:');
    r = await x('systemctl is-active nginx');
    console.log(' ', r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
