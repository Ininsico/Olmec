const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Install transformers
    console.log('Installing transformers...');
    let r = await s('cd /opt/olmec/AI && timeout 180 venv/bin/pip install transformers sentencepiece 2>&1 | tail -5');
    console.log(r.stdout || r.stderr);

    // Upload and run test
    await ssh.putFile(path.resolve(__dirname, 'test_depth.py'), '/opt/olmec/AI/test_depth.py');
    console.log('Testing depth model...');
    r = await s('cd /opt/olmec/AI && timeout 300 venv/bin/python3 test_depth.py 2>&1');
    console.log(r.stdout);
    console.log('STDERR:', r.stderr);
    
    // Cleanup
    await s('rm -f /opt/olmec/AI/test_depth.py');

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
