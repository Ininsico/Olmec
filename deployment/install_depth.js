const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));
    const py = 'cd /opt/olmec/AI && venv/bin/python3';

    // Install transformers and torchvision deps
    console.log('Installing transformers...');
    let r = await s('cd /opt/olmec/AI && timeout 180 venv/bin/pip install transformers sentencepiece protobuf 2>&1 | tail -5');
    console.log(r.stdout || r.stderr);

    // Test if we can load a tiny depth model
    console.log('Testing depth model load...');
    r = await s(py + ' -c "
from transformers import pipeline
import time
t0=time.time()
pipe = pipeline(\"depth-estimation\", model=\"depth-anything/Depth-Anything-V2-Small-hf\")
print(\"Model loaded in\", round(time.time()-t0,1), \"sec\")
print(\"Device:\", pipe.device)
" 2>&1 | tail -5');
    console.log(r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
