const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('=== Domain via Cloudflare ===');
    let r = await x('curl -s --connect-timeout 10 http://ininsico.artdevelopers.site -o /dev/null -w "%{http_code}"');
    console.log('HTTP:', r.stdout);

    r = await x('curl -s --connect-timeout 10 http://ininsico.artdevelopers.site | head -c 200');
    console.log('Content:', r.stdout);

    console.log('\n=== API via domain ===');
    r = await x('curl -s http://ininsico.artdevelopers.site/ai-api/health');
    console.log(r.stdout);

    console.log('\n=== Direct IP ===');
    r = await x('curl -s http://68.183.103.119 -o /dev/null -w "%{http_code}"');
    console.log('HTTP:', r.stdout);

    console.log('\n=== All services ===');
    r = await x('pm2 list');
    console.log(r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
