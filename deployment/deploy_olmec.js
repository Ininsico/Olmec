const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

const HOST = '68.183.103.119';
const USER = 'root';
const PASS = '2136109HNsj';
const REMOTE = '/opt/olmec';

async function run() {
    console.log('[1/7] Connecting...');
    await ssh.connect({ host: HOST, username: USER, password: PASS });
    console.log('  OK');

    console.log('[2/7] System prep...');
    await ssh.execCommand('rm -f /etc/apt/sources.list.d/mongodb*');
    await ssh.execCommand('DEBIAN_FRONTEND=noninteractive apt-get update -qq 2>&1 | tail -1');
    await ssh.execCommand('DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nginx python3-pip python3-venv libgl1-mesa-glx 2>&1 | tail -1');
    await ssh.execCommand('which pm2 || npm install -g pm2 2>&1 | tail -1');

    console.log('[3/7] Uploading AI code...');
    await ssh.execCommand(`mkdir -p ${REMOTE}/AI`);
    await ssh.putDirectory(path.resolve(__dirname, '../AI'), `${REMOTE}/AI`, {
        recursive: true, concurrency: 10,
        validate: p => !p.includes('__pycache__') && !p.includes('.git') && !p.includes('AI_venv') && !p.includes('node_modules') && !p.includes('.pyc')
    });

    console.log('[4/7] Venv + deps...');
    await ssh.execCommand(`cd ${REMOTE}/AI && rm -rf venv && python3 -m venv venv`);
    await ssh.execCommand(`cd ${REMOTE}/AI && venv/bin/pip install -q --upgrade pip 2>&1 | tail -1`);
    await ssh.execCommand(`cd ${REMOTE}/AI && venv/bin/pip install -q torch torchvision --index-url https://download.pytorch.org/whl/cpu 2>&1 | tail -3`);
    await ssh.execCommand(`cd ${REMOTE}/AI && venv/bin/pip install -q -r requirements.txt 2>&1 | tail -3`);

    console.log('[5/7] Starting API...');
    await ssh.execCommand('pm2 delete olmec-api 2>/dev/null; pm2 delete olmec-ai-core 2>/dev/null; true');
    await ssh.execCommand(`cd ${REMOTE}/AI && pm2 start venv/bin/python --name olmec-api -- -m uvicorn OlmecAPI:app --host 0.0.0.0 --port 8000`);

    console.log('[6/7] Nginx config...');
    const ng = 'server {\n' +
        '    listen 80;\n' +
        `    server_name ininsico.artdevelopers.site ${HOST};\n` +
        '    location /ai-api/ {\n' +
        '        proxy_pass http://localhost:8000/;\n' +
        '        proxy_set_header Host $host;\n' +
        '        proxy_set_header X-Real-IP $remote_addr;\n' +
        '    }\n' +
        '    location /api {\n' +
        '        proxy_pass http://localhost:5000;\n' +
        '        proxy_http_version 1.1;\n' +
        '        proxy_set_header Upgrade $http_upgrade;\n' +
        '        proxy_set_header Connection "upgrade";\n' +
        '        proxy_set_header Host $host;\n' +
        '    }\n' +
        '    location / {\n' +
        `        root ${REMOTE}/frontend/dist;\n` +
        '        index index.html;\n' +
        '        try_files $uri $uri/ /index.html;\n' +
        '    }\n' +
        '}';
    await ssh.execCommand(`mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled`);
    await ssh.execCommand(`cat > /etc/nginx/sites-available/olmec << 'EOF'\n${ng}\nEOF`);
    await ssh.execCommand(`ln -sf /etc/nginx/sites-available/olmec /etc/nginx/sites-enabled/olmec`);
    await ssh.execCommand('rm -f /etc/nginx/sites-enabled/default');
    await ssh.execCommand('systemctl restart nginx 2>&1 | tail -2');

    console.log('[7/7] Verify...');
    await new Promise(r => setTimeout(r, 3000));
    const h = await ssh.execCommand('curl -s http://localhost:8000/health');
    console.log('API Health:', h.stdout || h.stderr);
    const p = await ssh.execCommand('pm2 list');
    console.log('PM2:', p.stdout);

    console.log('DONE - AI math engine active on port 8000');
    ssh.dispose();
}

run().catch(e => { console.error('FAIL:', e); ssh.dispose(); });
