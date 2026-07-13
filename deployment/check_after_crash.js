const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('=== PM2 STATUS ===');
    let r = await x('pm2 list');
    console.log(r.stdout);

    console.log('=== API LOGS (out) ===');
    r = await x('tail -20 /root/.pm2/logs/olmec-api-out.log');
    console.log(r.stdout);

    console.log('=== API LOGS (error) ===');
    r = await x('tail -20 /root/.pm2/logs/olmec-api-error.log');
    console.log(r.stdout);

    console.log('=== GLB FILE ===');
    r = await x('ls -la /tmp/grid_final.glb 2>/dev/null || echo "NO FILE"');
    console.log(r.stdout);
    if (!r.stdout.includes('No such')) {
        r = await x('python3 -c "import struct; f=open(\'/tmp/grid_final.glb\',\'rb\'); m=struct.unpack(\'<I\',f.read(4))[0]; f.seek(0,2); print(\'VALID\' if m==0x46546C67 else \'INVALID\',f.tell()/1024,\'KB\'); f.close()"');
        console.log(r.stdout);
    }

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
