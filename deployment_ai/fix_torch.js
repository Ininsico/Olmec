const { NodeSSH } = require('../deployment/node_modules/node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '68.183.103.119',
    username: 'root',
    password: '2136109HNsj',
    remotePath: '/opt/olmec/AI_Training'
};

async function fixVenvAndTorch() {
    console.log('📡 Connecting to server...');
    await ssh.connect(config);

    console.log('🗑️ Cleaning up corrupted venv...');
    await ssh.execCommand(`rm -rf ${config.remotePath}/venv`);

    console.log('📦 Installing python3-venv and python3-pip system packages...');
    await ssh.execCommand('DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y python3-venv python3-pip libgl1-mesa-glx');

    console.log('🛠️ Creating new VENV...');
    await ssh.execCommand(`python3 -m venv ${config.remotePath}/venv`);

    const venvPython = `${config.remotePath}/venv/bin/python3`;
    const venvPip = `${config.remotePath}/venv/bin/pip`;

    console.log('🔍 Checking for pip inside venv...');
    const checkPip = await ssh.execCommand(`ls ${venvPip}`);
    if (checkPip.code !== 0) {
        console.log('⚠️ Pip not found in venv. Bootstrapping pip...');
        await ssh.execCommand(`wget -qO- https://bootstrap.pypa.io/get-pip.py | ${venvPython}`);
    } else {
        console.log('✅ Pip found in venv.');
    }

    console.log('📦 Upgrading pip...');
    await ssh.execCommand(`${venvPython} -m pip install --upgrade pip`);
    
    console.log('⏳ Installing PyTorch (this might take a few minutes)...');
    const torchInstall = await ssh.execCommand(`${venvPython} -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu`);
    if (torchInstall.code !== 0) {
        console.error('❌ Failed to install torch:\\n', torchInstall.stderr);
        ssh.dispose();
        return;
    } else {
        console.log('✅ PyTorch installed successfully.');
    }

    console.log('⏳ Installing other AI dependencies...');
    const depsInstall = await ssh.execCommand(`${venvPython} -m pip install fastapi uvicorn python-multipart python-dotenv requests pillow trimesh open3d pymeshlab tqdm numpy einops timm accelerate transformers`);
    if (depsInstall.code !== 0) {
        console.error('❌ Failed to install dependencies:\\n', depsInstall.stderr);
        ssh.dispose();
        return;
    } else {
        console.log('✅ AI Dependencies installed successfully.');
    }

    console.log('🚀 Restarting training loop with PM2...');
    await ssh.execCommand(`pm2 delete olmec-train-loop || true`);
    
    // Correct PM2 syntax for running python scripts with a specific interpreter
    const pm2Start = await ssh.execCommand(`cd ${config.remotePath} && pm2 start ULTIMATE_TRAIN.py --name olmec-train-loop --interpreter ${venvPython}`);
    if (pm2Start.code !== 0) {
        console.error('❌ Failed to start PM2:\\n', pm2Start.stderr);
    }

    console.log('✅ ALL DONE! The training loop should now be running. You can verify with check_ai_logs.js.');
    ssh.dispose();
}

fixVenvAndTorch().catch(err => {
    console.error('Fatal error:', err);
    ssh.dispose();
});
