const { NodeSSH } = require('node-ssh');
const path = require('path');
const { execSync } = require('child_process');
const { loadConfig } = require('./loadConfig');
const ssh = new NodeSSH();
const config = loadConfig();

async function deploy() {
    console.log('BUILDING FRONTEND...');
    execSync('npm run build', { cwd: path.resolve(__dirname, '../frontend'), stdio: 'inherit' });

    console.log('\nCONNECTING TO SERVER...');
    await ssh.connect({
        host: config.DEPLOY_HOST,
        username: config.DEPLOY_USERNAME,
        password: config.DEPLOY_PASSWORD
    });

    console.log('\nPREPPING SERVER...');
    await ssh.execCommand('rm -f /etc/apt/sources.list.d/mongodb-org-7.0.list');
    await ssh.execCommand('DEBIAN_FRONTEND=noninteractive apt-get update');
    await ssh.execCommand('DEBIAN_FRONTEND=noninteractive apt-get install -y nginx nodejs npm');
    await ssh.execCommand('npm install -g pm2');

    console.log('\nUPLOADING FRONTEND & BACKEND...');
    await ssh.execCommand(`mkdir -p ${config.DEPLOY_REMOTE_PATH}/frontend/dist ${config.DEPLOY_REMOTE_PATH}/backend`);
    await ssh.putDirectory(path.resolve(__dirname, '../frontend/dist'), `${config.DEPLOY_REMOTE_PATH}/frontend/dist`, { recursive: true, concurrency: 20 });
    await ssh.putDirectory(path.resolve(__dirname, '../backend'), `${config.DEPLOY_REMOTE_PATH}/backend`, { recursive: true, concurrency: 20, validate: (p) => !p.includes('node_modules') && !p.includes('.git') && !p.includes('.env') });

    console.log('\nFINALIZING SERVER SETUP...');
    await ssh.execCommand(`cd ${config.DEPLOY_REMOTE_PATH}/backend && npm install`);
    await ssh.execCommand(`cd ${config.DEPLOY_REMOTE_PATH}/backend && [ ! -f .env ] && echo "PORT=5000\nMONGO_URI=mongodb://127.0.0.1:27017/ininsico_db\nJWT_SECRET=your_strong_secret_here\nFRONTEND_URL=http://${config.DEPLOY_DOMAIN}" > .env`);

    const nginxConfig = `server {
    listen 80;
    server_name ${config.DEPLOY_DOMAIN} ${config.DEPLOY_HOST};
    location / {
        root ${config.DEPLOY_REMOTE_PATH}/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}`;
    await ssh.execCommand(`echo '${nginxConfig}' > /etc/nginx/sites-available/olmec`);
    await ssh.execCommand(`ln -sf /etc/nginx/sites-available/olmec /etc/nginx/sites-enabled/olmec`);
    await ssh.execCommand(`rm -f /etc/nginx/sites-enabled/default`);
    await ssh.execCommand(`systemctl restart nginx`);

    console.log('\nSTARTING BACKEND WITH PM2...');
    await ssh.execCommand(`pm2 delete olmec-backend || true`);
    await ssh.execCommand(`cd ${config.DEPLOY_REMOTE_PATH}/backend && pm2 start server.js --name olmec-backend`);

    console.log('\nDEPLOYMENT FINISHED');
    ssh.dispose();
}

deploy().catch(err => {
    console.error('FAILED:', err);
    ssh.dispose();
});
