const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Check what ML packages exist
    let r = await s('cd /opt/olmec/AI && venv/bin/pip list 2>/dev/null | grep -iE "torch|tensorflow|onnx|transform|diffus|hugging|open3d|cuda|numba"');
    console.log('=== ML packages ===');
    console.log(r.stdout || '(none)');

    // Check for any model files
    r = await s('find /opt/olmec -name "*.pt" -o -name "*.pth" -o -name "*.bin" -o -name "*.onnx" -o -name "*.safetensors" 2>/dev/null | head -20');
    console.log('=== Model files ===');
    console.log(r.stdout || '(none)');

    // Check if there's an LRM directory or model
    r = await s('ls -la /opt/olmec/AI/ | head -30');
    console.log('=== AI dir ===');
    console.log(r.stdout);

    // Check pip list for all packages
    r = await s('cd /opt/olmec/AI && venv/bin/pip list 2>/dev/null | head -50');
    console.log('=== All packages ===');
    console.log(r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
