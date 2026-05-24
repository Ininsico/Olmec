const { NodeSSH } = require('../deployment/node_modules/node-ssh');
const path = require('path');
const ssh = new NodeSSH();

const config = {
    host: '68.183.103.119',
    username: 'root',
    password: '2136109HNsj',
    remotePath: '/opt/olmec/AI_Training'
};

async function deployAITraining() {
    console.log('📡 [1/3] Connecting to Server...');
    await ssh.connect({
        host: config.host,
        username: config.username,
        password: config.password
    });

    console.log('\n📦 [2/3] Setting up Robust AI Environment (VENV)...');
    await ssh.execCommand(`mkdir -p ${config.remotePath}`);

    // Install venv tool if missing
    await ssh.execCommand('DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y python3-venv libgl1-mesa-glx');
    
    // Create VENV
    console.log('  ▸ Creating virtual environment...');
    await ssh.execCommand(`python3 -m venv ${config.remotePath}/venv`);
    
    const venvPython = `${config.remotePath}/venv/bin/python3`;
    const venvPip = `${config.remotePath}/venv/bin/pip`;

    // Install dependencies into VENV
    console.log('  ▸ Installing AI stack into VENV (this will take a moment)...');
    await ssh.execCommand(`${venvPip} install --upgrade pip`);
    await ssh.execCommand(`${venvPip} install torch torchvision --index-url https://download.pytorch.org/whl/cpu`);
    await ssh.execCommand(`${venvPip} install fastapi uvicorn python-multipart python-dotenv requests pillow trimesh open3d pymeshlab tqdm numpy einops timm accelerate transformers`);

    console.log('\n📤 [3/3] Uploading AI Source Files...');
    await ssh.putDirectory(path.resolve(__dirname, '../AI'), config.remotePath, {
        recursive: true,
        concurrency: 20,
        validate: (p) => !p.includes('venv') && !p.includes('__pycache__') && !p.includes('.git')
    });

    console.log('\n🚀 Starting Training Loop with VENV...');
    await ssh.execCommand(`pm2 delete olmec-train-loop || true`);
    
    // Use the full path to the venv python to ensure correct modules are loaded
    await ssh.execCommand(`cd ${config.remotePath} && pm2 start "${venvPython} ULTIMATE_TRAIN.py" --name olmec-train-loop`);

    console.log('\n✅ AI TRAINING LOOP INITIALIZED WITH VENV!');
    console.log('Monitor with: pm2 logs olmec-train-loop');
    
    ssh.dispose();
}

deployAITraining().catch(err => {
    console.error('\n❌ AI VENV DEPLOYMENT FAILED:', err);
    ssh.dispose();
});
