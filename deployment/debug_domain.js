const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('=== NGINX CONFIG ===');
    let r = await x('cat /etc/nginx/sites-enabled/olmec');
    console.log(r.stdout);

    console.log('=== NGINX LISTENING ===');
    r = await x('ss -tulpn | grep nginx');
    console.log(r.stdout);

    console.log('=== FIREWALL ===');
    r = await x('iptables -L INPUT -n 2>/dev/null | head -15 || echo "no iptables"');
    console.log(r.stdout);

    console.log('=== DNS ===');
    r = await x('dig +short ininsico.artdevelopers.site 2>/dev/null || nslookup ininsico.artdevelopers.site 2>/dev/null || echo "no dns"');
    console.log(r.stdout);

    console.log('=== CURL TO DOMAIN ===');
    r = await x('curl -sv --connect-timeout 5 http://ininsico.artdevelopers.site 2>&1 | head -20');
    console.log(r.stdout + r.stderr);

    console.log('=== CURL TO IP ===');
    r = await x('curl -sv --connect-timeout 5 http://68.183.103.119 2>&1 | head -20');
    console.log(r.stdout + r.stderr);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
