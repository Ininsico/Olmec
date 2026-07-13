const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Clear logs first
    await s('pm2 flush olmec-api');
    
    // Make a fresh request
    let r = await s('cd /opt/olmec/AI && timeout 60 curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/grid_final.glb -w "%{http_code}"');
    console.log('HTTP:', r.stdout);
    
    // Wait a moment for logs to flush
    await new Promise(r => setTimeout(r, 2000));
    
    // Check full output log
    r = await s('cat /root/.pm2/logs/olmec-api-out.log');
    console.log('=== OUT LOG ===');
    console.log(r.stdout);
    
    r = await s('cat /root/.pm2/logs/olmec-api-error.log');
    console.log('=== ERR LOG ===');
    console.log(r.stdout.slice(-500));
    
    // Check for output file
    r = await s('ls -la /tmp/grid_final.glb 2>/dev/null');
    console.log('FILE:', r.stdout.trim() || 'NO FILE');

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
