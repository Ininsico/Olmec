const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Get the full error response 
    let r = await s('cd /opt/olmec/AI && curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate');
    console.log('Response:', r.stdout);

    // Also check the out log again for more info
    r = await s('tail -10 /root/.pm2/logs/olmec-api-out.log');
    console.log('LOG:', r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
