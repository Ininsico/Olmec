const { NodeSSH } = require('../deployment/node_modules/node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '68.183.103.119',
    username: 'root',
    password: '2136109HNsj'
};

async function checkLogs() {
    await ssh.connect(config);
    const result = await ssh.execCommand('pm2 logs olmec-train-loop --lines 50 --no-daemon & sleep 5 && kill $!');
    console.log(result.stdout || result.stderr);
    ssh.dispose();
}

checkLogs().catch(console.error);
