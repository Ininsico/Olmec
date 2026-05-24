const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '68.183.103.119',
    username: 'root',
    password: '2136109HNsj'
};

async function checkStatus() {
    console.log('📡 Connecting to server...');
    await ssh.connect(config);

    console.log('\n--- NGINX STATUS ---');
    const nginxStatus = await ssh.execCommand('systemctl status nginx');
    console.log(nginxStatus.stdout || nginxStatus.stderr);

    console.log('\n--- NGINX CONFIG TEST ---');
    const nginxTest = await ssh.execCommand('nginx -t');
    console.log(nginxTest.stdout || nginxTest.stderr);

    console.log('\n--- SITES ENABLED ---');
    const sitesEnabled = await ssh.execCommand('ls -l /etc/nginx/sites-enabled/');
    console.log(sitesEnabled.stdout || sitesEnabled.stderr);

    console.log('\n--- OLMEC CONFIG CONTENT ---');
    const olmecConfig = await ssh.execCommand('cat /etc/nginx/sites-available/olmec');
    console.log(olmecConfig.stdout || olmecConfig.stderr);

    console.log('\n--- PM2 STATUS ---');
    const pm2Status = await ssh.execCommand('pm2 list');
    console.log(pm2Status.stdout || pm2Status.stderr);

    console.log('\n--- PORT 80 CHECK ---');
    const port80 = await ssh.execCommand('netstat -tulpn | grep :80');
    console.log(port80.stdout || port80.stderr);

    ssh.dispose();
}

checkStatus().catch(console.error);
