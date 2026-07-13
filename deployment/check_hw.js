const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    let r = await s('nvidia-smi 2>&1 | head -10');
    console.log('=== GPU ===');
    console.log(r.stdout || 'NO GPU');

    r = await s('lscpu | grep "Model name"');
    console.log('=== CPU ===');
    console.log(r.stdout);

    r = await s('free -h | grep Mem');
    console.log('=== RAM ===');
    console.log(r.stdout);

    r = await s('df -h / | tail -1');
    console.log('=== DISK ===');
    console.log(r.stdout);

    // Check if any torch/cuda already installed
    r = await s('cd /opt/olmec/AI && venv/bin/pip list 2>/dev/null | grep -i "torch\\|tensorflow\\|onnx\\|transformers"');
    console.log('=== ML packages ===');
    console.log(r.stdout || '(none)');

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
