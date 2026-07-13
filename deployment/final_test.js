const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    console.log('Uploading files...');
    await ssh.putFile(path.resolve(__dirname, '../AI/olmec_math_engine.py'), '/opt/olmec/AI/olmec_math_engine.py');
    await ssh.putFile(path.resolve(__dirname, '../AI/Mastermind.py'), '/opt/olmec/AI/Mastermind.py');
    await ssh.putFile(path.resolve(__dirname, '../AI/OlmecAPI.py'), '/opt/olmec/AI/OlmecAPI.py');

    console.log('Restarting API...');
    await x('pm2 restart olmec-api --update-env');
    await new Promise(r => setTimeout(r, 5000));

    for (let i = 0; i < 15; i++) {
        let r = await x('curl -s --connect-timeout 3 http://localhost:8000/health');
        if (r.stdout) { console.log('Health:', r.stdout); break; }
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('Testing generation...');
    let r = await x("cd /opt/olmec/AI && timeout 60 curl -s -X POST -F 'file=@nano_banana_collection/banana_og.png' -H 'x-api-key: OLMEC_DEV_KEY_99' http://localhost:8000/generate -o /tmp/grid_final.glb -w '%{http_code}'");
    console.log('HTTP:', r.stdout);
    r = await x('ls -la /tmp/grid_final.glb');
    console.log('File:', r.stdout);
    r = await x('python3 -c "import struct; f=open(\'/tmp/grid_final.glb\',\'rb\'); m=struct.unpack(\'<I\',f.read(4))[0]; f.seek(0,2); sz=f.tell(); print(\'VALID\' if m==0x46546C67 else \'INVALID\',sz/1024,\'KB\'); f.close()"');
    console.log(r.stdout);
    r = await x('pm2 logs olmec-api --lines 10 --nostream');
    console.log(r.stdout.slice(-600));

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
