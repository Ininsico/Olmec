const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');
const fs = require('fs');

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Upload files
    await ssh.putFile(path.resolve(__dirname, '../AI/olmec_math_engine.py'), '/opt/olmec/AI/olmec_math_engine.py');
    await ssh.putFile(path.resolve(__dirname, '../AI/Mastermind.py'), '/opt/olmec/AI/Mastermind.py');
    await ssh.putFile(path.resolve(__dirname, '../AI/OlmecAPI.py'), '/opt/olmec/AI/OlmecAPI.py');

    // Restart
    await s('pm2 restart olmec-api --update-env');
    await new Promise(r => setTimeout(r, 5000));

    // Wait for health
    for (let i = 0; i < 10; i++) {
        let r = await s('curl -s --connect-timeout 3 http://localhost:8000/health');
        if (r.stdout) { console.log('Health:', r.stdout.trim()); break; }
        await new Promise(r => setTimeout(r, 2000));
    }

    // Flush old logs
    await s('pm2 flush olmec-api');
    await new Promise(r => setTimeout(r, 500));

    // Test generate
    console.log('Testing generation...');
    let r = await s('cd /opt/olmec/AI && timeout 120 curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/grid_final.glb -w "%{http_code}"');
    console.log('HTTP:', r.stdout);

    // Give time for logs
    await new Promise(r => setTimeout(r, 2000));

    // Check logs
    r = await s('cat /root/.pm2/logs/olmec-api-out.log');
    console.log('=== OUT LOG ===');
    console.log(r.stdout);

    r = await s('cat /root/.pm2/logs/olmec-api-error.log');
    console.log('=== ERR LOG ===');
    console.log(r.stdout || '(none)');

    // Check file
    r = await s('ls -la /tmp/grid_final.glb 2>/dev/null');
    console.log('FILE:', r.stdout.trim() || 'NO FILE');
    if (!r.stdout.includes('No such')) {
        r = await s('python3 -c "import struct; f=open(\'/tmp/grid_final.glb\',\'rb\'); m=struct.unpack(\'<I\',f.read(4))[0]; f.seek(0,2); sz=f.tell(); print(\'VALID\' if m==0x46546C67 else \'INVALID\',sz/1024,\'KB\'); f.close()"');
        console.log('VALID:', r.stdout);
    }

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
