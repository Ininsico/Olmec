const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    await ssh.putFile(path.resolve(__dirname, '../AI/olmec_math_engine.py'), '/opt/olmec/AI/olmec_math_engine.py');
    await ssh.putFile(path.resolve(__dirname, '../AI/Mastermind.py'), '/opt/olmec/AI/Mastermind.py');
    await ssh.putFile(path.resolve(__dirname, '../AI/OlmecAPI.py'), '/opt/olmec/AI/OlmecAPI.py');

    await x('pm2 restart olmec-api --update-env');
    await new Promise(r => setTimeout(r, 3000));

    let r = await x('curl -s http://localhost:8000/health');
    console.log('Health:', r.stdout);

    r = await x('cd /opt/olmec/AI && timeout 30 curl -s -X POST -F "file=@nano_banana_collection/banana_og.png" -H "x-api-key: OLMEC_DEV_KEY_99" http://localhost:8000/generate -o /tmp/final_test.glb -w "%{http_code}"');
    console.log('HTTP:', r.stdout);

    r = await x('ls -la /tmp/final_test.glb 2>/dev/null || echo "NO FILE"');
    console.log('File:', r.stdout);

    r = await x('python3 -c "import struct; f=open(\'/tmp/final_test.glb\',\'rb\'); m=struct.unpack(\'<I\',f.read(4))[0]; f.seek(0,2); s=f.tell(); print(\'VALID GLB\',s/1024,\'KB\' if m==0x46546C67 else \'BAD\'); f.close()"');
    console.log(r.stdout);

    r = await x('pm2 logs olmec-api --lines 8 --nostream');
    console.log(r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
