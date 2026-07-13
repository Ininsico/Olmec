const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd) => (await ssh.execCommand(cmd));

    let r = await x("grep -n 'def build_grid_mesh' /opt/olmec/AI/olmec_math_engine.py");
    console.log('Line:', r.stdout);

    r = await x("sed -n '80,150p' /opt/olmec/AI/olmec_math_engine.py");
    console.log(r.stdout);

    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
