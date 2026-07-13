const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Check if API is running
    let r = await s('pm2 list');
    console.log('=== PM2 ===');
    console.log(r.stdout);

    // Check olmec-api was restarted recently
    r = await s('pm2 jlist | python3 -c "import sys,json;d=json.load(sys.stdin);[print(x[\'name\'],x[\"pm2_env\"][\"status\"],x[\"pm2_env\"][\"restart_time\"],x[\"pm2_env\"][\"created_at\"]) for x in d if x[\"name\"]==\"olmec-api\"]"');
    console.log('API Info:', r.stdout);

    // Full error log  
    r = await s('cat /root/.pm2/logs/olmec-api-error.log');
    console.log('ERR LOG:', r.stdout);

    // Try health endpoint  
    r = await s('curl -s http://localhost:8000/health');
    console.log('Health:', r.stdout);

    // Check PID
    r = await s('pm2 pid olmec-api');
    console.log('PID:', r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
