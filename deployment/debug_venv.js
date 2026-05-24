const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const cmds = [
        'which python3',
        'python3 --version',
        'ls -la /opt/olmec/AI/venv/bin/python3',
        '/opt/olmec/AI/venv/bin/python3 --version',
        '/opt/olmec/AI/venv/bin/pip3 --version',
        '/opt/olmec/AI/venv/bin/pip3 list 2>/dev/null | head -30',
        'ls /opt/olmec/AI/venv/lib/python3.*/site-packages/ | head -30',
        'cat /opt/olmec/AI/requirements.txt',
    ];
    for (const cmd of cmds) {
        const r = await ssh.execCommand(cmd);
        console.log(`$ ${cmd}`);
        console.log(r.stdout.slice(0, 500) || r.stderr.slice(0, 500));
        console.log('---');
    }
    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
