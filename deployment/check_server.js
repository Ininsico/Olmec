const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');
const path = require('path');

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    // Read lines 160-176 of the engine file
    let r = await s("awk 'NR>=160&&NR<=176' /opt/olmec/AI/olmec_math_engine.py");
    console.log('=== Lines 160-176 ===');
    console.log(r.stdout);

    // Also check for the silhouette extraction
    r = await s("awk 'NR>=10&&NR<=35' /opt/olmec/AI/olmec_math_engine.py");
    console.log('=== Lines 10-35 ===');
    console.log(r.stdout);

    // Check the OlmecAPI to see how generate works
    r = await s("awk 'NR>=1&&NR<=60' /opt/olmec/AI/OlmecAPI.py");
    console.log('=== API lines 1-60 ===');
    console.log(r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
