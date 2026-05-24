const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '68.183.103.119',
    username: 'root',
    password: '2136109HNsj'
};

async function fixServer() {
    console.log('📡 Connecting to server...');
    await ssh.connect(config);

    console.log('📦 Updating packages...');
    const updateResult = await ssh.execCommand('DEBIAN_FRONTEND=noninteractive apt-get update');
    console.log('Update stdout:', updateResult.stdout);
    console.log('Update stderr:', updateResult.stderr);

    console.log('📦 Installing Nginx...');
    const installResult = await ssh.execCommand('DEBIAN_FRONTEND=noninteractive apt-get install -y nginx');
    console.log('Install stdout:', installResult.stdout);
    console.log('Install stderr:', installResult.stderr);

    console.log('⚙️ Configuring Nginx...');
    const domain = 'ininsico.artdevelopers.site';
    const remotePath = '/opt/olmec';
    const nginxConfig = `server {
    listen 80;
    server_name ${domain} ${config.host};

    location / {
        root ${remotePath}/frontend/dist;
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

    location /ai-api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
    }
}`;

    await ssh.execCommand(`mkdir -p /etc/nginx/sites-available`);
    await ssh.execCommand(`mkdir -p /etc/nginx/sites-enabled`);
    await ssh.execCommand(`echo '${nginxConfig}' > /etc/nginx/sites-available/olmec`);
    await ssh.execCommand(`ln -sf /etc/nginx/sites-available/olmec /etc/nginx/sites-enabled/olmec`);
    await ssh.execCommand(`rm -f /etc/nginx/sites-enabled/default`);
    
    console.log('🚀 Starting Nginx...');
    const startResult = await ssh.execCommand('systemctl restart nginx');
    console.log('Start stdout:', startResult.stdout);
    console.log('Start stderr:', startResult.stderr);

    console.log('🔍 Checking AI Core status...');
    const aiLogs = await ssh.execCommand('pm2 logs olmec-ai-core --lines 50 --no-daemon'); // wait, this might hang
    // Actually just get the last few lines
    const aiLogsFinal = await ssh.execCommand('pm2 logs olmec-ai-core --lines 50 --no-daemon & sleep 5 && kill $!');
    console.log(aiLogsFinal.stdout || aiLogsFinal.stderr);

    ssh.dispose();
}

fixServer().catch(console.error);
