const { NodeSSH } = require('node-ssh');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const ssh = new NodeSSH();

const config = {
    host: '68.183.103.119',
    username: 'root',
    password: '2136109HNsj',
    remotePath: '/opt/olmec',
    domain: 'ininsico.artdevelopers.site',
    email: 'admin@artdevelopers.site'
};

function localExec(cmd, cwd = process.cwd()) {
    console.log(`  ▸ Local: ${cmd}`);
    try {
        execSync(cmd, { cwd, stdio: 'inherit' });
    } catch (e) {
        console.warn(`    ⚠ Local warning: ${e.message}`);
    }
}

async function deploy() {
    console.log('🚀 [1/5] Starting FAST-TAR Deployment');

    // Build Frontend
    localExec('npm run build', path.resolve(__dirname, '../frontend'));

    // Create TAR
    console.log('\n📦 [2/5] Creating compressed archive...');
    const root = path.resolve(__dirname, '..');
    // Using tar (Windows native) - it's much faster than powershell zip
    localExec(`tar -czf project.tar.gz AI backend frontend/dist --exclude AI/venv_clean --exclude backend/node_modules --exclude .git`, root);

    // Connect
    console.log('\n📡 [3/5] Connecting to server...');
    await ssh.connect({ host: config.host, username: config.username, password: config.password });

    // Prep Server
    console.log('\n⚙️  [4/5] Prepping server...');
    await ssh.execCommand(`pm2 delete all || true`);
    await ssh.execCommand(`rm -rf ${config.remotePath}`);
    await ssh.execCommand(`mkdir -p ${config.remotePath}`);

    // Upload & Extract
    console.log('\n📤 [5/5] Uploading and Extracting...');
    await ssh.putFile(path.join(root, 'project.tar.gz'), `${config.remotePath}/project.tar.gz`);
    await ssh.execCommand(`cd ${config.remotePath} && tar -xzf project.tar.gz && rm project.tar.gz`);

    // Orchestrate
    console.log('\n🚀 [FINAL] Launching services...');
    const commands = [
        { label: 'Backend Deps', cmd: `cd ${config.remotePath}/backend && npm install` },
        { label: 'AI Deps', cmd: `cd ${config.remotePath}/AI && pip3 install -r requirements.txt --index-url https://download.pytorch.org/whl/cpu` },
        { label: 'Nginx setup', cmd: `echo 'server { listen 80; server_name ${config.domain} ${config.host}; location / { root ${config.remotePath}/frontend/dist; index index.html; try_files $uri $uri/ /index.html; } location /api { proxy_pass http://localhost:5000; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_set_header Host $host; } location /ai-api/ { proxy_pass http://localhost:8000/; proxy_set_header Host $host; } }' > /etc/nginx/sites-available/olmec && ln -sf /etc/nginx/sites-available/olmec /etc/nginx/sites-enabled/olmec && systemctl restart nginx` },
        { label: 'Start Backend', cmd: `cd ${config.remotePath}/backend && pm2 start server.js --name olmec-backend` },
        { label: 'Start AI Core', cmd: `cd ${config.remotePath}/AI && pm2 start "python3 START_CORE.py master" --name olmec-ai-core` }
    ];

    for (const { label, cmd } of commands) {
        console.log(`  ▸ ${label}`);
        await ssh.execCommand(cmd);
    }

    console.log('\n✅ DEPLOYMENT COMPLETE');
    ssh.dispose();
}

deploy().catch(err => {
    console.error('\n❌ FAILED:', err);
    ssh.dispose();
});
