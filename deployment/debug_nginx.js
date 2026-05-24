const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '68.183.103.119',
    username: 'root',
    password: '2136109HNsj'
};

async function debugNginx() {
    await ssh.connect(config);
    
    console.log('--- NGINX -T ---');
    const test = await ssh.execCommand('nginx -t');
    console.log(test.stdout || test.stderr);

    console.log('\n--- SITES ENABLED ---');
    const sites = await ssh.execCommand('ls -l /etc/nginx/sites-enabled/');
    console.log(sites.stdout || sites.stderr);

    console.log('\n--- PORT 80 OWNER ---');
    const portOwner = await ssh.execCommand('lsof -i :80');
    console.log(portOwner.stdout || portOwner.stderr);

    console.log('\n--- UFW APP LIST ---');
    const ufwApps = await ssh.execCommand('ufw app list');
    console.log(ufwApps.stdout || ufwApps.stderr);

    console.log('\n--- DIGITAL OCEAN FIREWALL? ---');
    // Not easy to check from inside, but let's see if we can reach it from outside.
    
    ssh.dispose();
}

debugNginx().catch(console.error);
