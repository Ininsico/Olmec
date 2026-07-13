const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));
    const py = 'cd /opt/olmec/AI && venv/bin/python3';

    let r = await s(py + ' -c "import torch; print(torch.__version__)"');
    console.log('Torch:', r.stdout.trim());

    r = await s(py + ' -c "import torch; print(torch.get_num_threads())"');
    console.log('Threads:', r.stdout.trim());

    r = await s(py + ' -c "import torch; t=torch.randn(100,768); print(\'Tensor OK:\', t.shape)"');
    console.log('Tensor:', r.stdout.trim());

    // Check for depth packages
    r = await s('cd /opt/olmec/AI && venv/bin/pip list 2>/dev/null | grep -iE "transform|diffus|depth|midas|hugging"');
    console.log('ML packages:', r.stdout.trim() || 'none');

    // Install depth-anything
    console.log('Installing depth-anything...');
    r = await s('cd /opt/olmec/AI && timeout 120 venv/bin/pip install depth-anything 2>&1 | tail -5');
    console.log(r.stdout || r.stderr);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
