const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    
    const x = async (cmd) => {
        const r = await ssh.execCommand(cmd);
        return { out: r.stdout, err: r.stderr };
    };

    let r;
    r = await x('curl -sv http://localhost:8000/health 2>&1');
    console.log('=== API HEALTH ===');
    console.log(r.err + r.out);

    r = await x('curl -sv http://localhost:5000/api/health 2>&1 || true');
    console.log('\n=== BACKEND HEALTH ===');
    console.log(r.err + r.out);

    r = await x('pm2 logs olmec-api --lines 20 --nostream');
    console.log('\n=== API LOGS ===');
    console.log(r.out.slice(-500));

    r = await x('nginx -t 2>&1');
    console.log('\n=== NGINX ===');
    console.log(r.out + r.err);

    r = await x('netstat -tulpn | grep -E ":80|:5000|:8000" 2>/dev/null || ss -tulpn | grep -E ":80|:5000|:8000"');
    console.log('\n=== PORTS ===');
    console.log(r.out);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
