const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const s = async (cmd) => (await ssh.execCommand(cmd));

    const distPath = path.resolve(__dirname, '../frontend/dist');
    const remoteDist = '/opt/olmec/frontend/dist';

    // Clear existing
    await s(`rm -rf ${remoteDist}/*`);

    // Upload all dist files
    const { glob } = require('glob');
    const files = await glob('**/*', { cwd: distPath, nodir: true });
    for (const file of files) {
        const local = path.join(distPath, file);
        const remote = path.join(remoteDist, file).replace(/\\/g, '/');
        const dir = path.dirname(remote);
        await s(`mkdir -p ${dir}`);
        await ssh.putFile(local, remote);
    }
    console.log(`Uploaded ${files.length} files`);

    // Also upload API changes
    await ssh.putFile(path.resolve(__dirname, '../AI/olmec_math_engine.py'), '/opt/olmec/AI/olmec_math_engine.py');
    await ssh.putFile(path.resolve(__dirname, '../AI/Mastermind.py'), '/opt/olmec/AI/Mastermind.py');
    await ssh.putFile(path.resolve(__dirname, '../AI/OlmecAPI.py'), '/opt/olmec/AI/OlmecAPI.py');

    // Restart API
    await s('pm2 restart olmec-api --update-env');
    await new Promise(r => setTimeout(r, 5000));

    // Health check
    let r = await s('curl -s http://localhost:8000/health');
    console.log('API:', r.stdout);

    console.log('Deploy done');
    ssh.dispose();
}
run().catch(e => { console.error(e); ssh.dispose(); });
