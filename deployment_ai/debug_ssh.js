const { NodeSSH } = require('../deployment/node_modules/node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({
        host: '68.183.103.119',
        username: 'root',
        password: '2136109HNsj'
    });
    const result = await ssh.execCommand('ls -la /opt/olmec/AI_Training/venv/bin');
    console.log('STDOUT:\n', result.stdout);
    console.log('STDERR:\n', result.stderr);
    
    const pyVer = await ssh.execCommand('python3 --version');
    console.log('Python Version:', pyVer.stdout);
    
    ssh.dispose();
}
run();
