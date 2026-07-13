const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Flush old logs
    await s('pm2 flush olmec-api');
    await new Promise(r => setTimeout(r, 500));

    // Make request with verbose curl
    let r = await s('cd /opt/olmec/AI && timeout 45 curl -v -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/grid_final.glb 2>&1 | tail -5');
    console.log('CURL result:', r.stdout, r.stderr);

    await new Promise(r => setTimeout(r, 2000));

    // Check full out log
    r = await s('cat /root/.pm2/logs/olmec-api-out.log');
    console.log('=== OUT LOG ===');
    console.log(r.stdout || '(empty)');

    r = await s('cat /root/.pm2/logs/olmec-api-error.log');
    console.log('=== ERR LOG ===');
    console.log(r.stdout || '(empty)');

    // Output file check  
    r = await s('ls -la /tmp/grid_final.glb 2>/dev/null');
    console.log('FILE:', r.stdout.trim() || 'NO FILE');
    
    // Check PM2 status
    r = await s('pm2 list');
    console.log('PM2:', r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
