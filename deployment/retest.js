const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    let r = await x('curl -s --connect-timeout 10 http://localhost:8000/health');
    console.log('Health:', r.stdout);

    r = await x('cd /opt/olmec/AI && timeout 30 curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/relief3.glb -w "%{http_code}"');
    console.log('HTTP:', r.stdout);

    r = await x('ls -la /tmp/relief3.glb 2>/dev/null || echo "NO FILE"');
    console.log('File:', r.stdout);

    r = await x('pm2 logs olmec-api --lines 12 --nostream');
    console.log('LOGS:', r.stdout.slice(-800));

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
