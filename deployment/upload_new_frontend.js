const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    console.log('Uploading rebuilt frontend...');
    await ssh.execCommand('rm -rf /opt/olmec/frontend/dist');
    await ssh.execCommand('mkdir -p /opt/olmec/frontend/dist');
    await ssh.putDirectory(
        path.resolve(__dirname, '../frontend/dist'),
        '/opt/olmec/frontend/dist',
        { recursive: true, concurrency: 20 }
    );
    await ssh.execCommand('systemctl restart nginx');
    let r = await ssh.execCommand('curl -s -o /dev/null -w "%{http_code}" http://localhost');
    console.log('HTTP:', r.stdout);
    r = await ssh.execCommand('curl -s http://localhost | head -c 200');
    console.log('Content:', r.stdout);
    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
