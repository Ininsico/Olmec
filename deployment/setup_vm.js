const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
    await ssh.connect({ host: '68.183.103.119', username: 'root', password: '2136109HNsj' });
    const x = async (cmd, label) => {
        console.log(`  ${label || cmd.slice(0, 60)}...`);
        const r = await ssh.execCommand(cmd, { timeout: 300000 });
        if (r.stderr && r.stderr.includes('ERROR')) console.error('  ERR:', r.stderr.slice(-200));
        return r.stdout;
    };

    console.log('[1/8] System packages...');
    await x('rm -f /etc/apt/sources.list.d/mongodb*', 'clean apt');
    await x('DEBIAN_FRONTEND=noninteractive apt-get update -qq 2>&1 | tail -1', 'apt update');
    await x('DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nginx nodejs npm python3-pip python3.12-venv libgl1-mesa-glx 2>&1 | tail -3', 'install pkgs');
    await x('npm install -g pm2 2>&1 | tail -1', 'pm2');

    console.log('[2/8] Python venv...');
    await x('cd /opt/olmec/AI && rm -rf venv && python3 -m venv venv', 'create venv');
    await x('/opt/olmec/AI/venv/bin/python3 -m pip install -q --upgrade pip 2>&1 | tail -1', 'upgrade pip');

    console.log('[3/8] Python deps...');
    await x('/opt/olmec/AI/venv/bin/python3 -m pip install -q torch torchvision --index-url https://download.pytorch.org/whl/cpu 2>&1 | tail -3', 'torch');
    await x('/opt/olmec/AI/venv/bin/python3 -m pip install -q -r /opt/olmec/AI/requirements.txt 2>&1 | tail -3', 'requirements');

    console.log('[4/8] Verify math engine...');
    const v = await ssh.execCommand('/opt/olmec/AI/venv/bin/python3 -c "from olmec_math_engine import OlmecMathEngine; e=OlmecMathEngine(); print(\'MATH ENGINE OK\')"');
    console.log('  ', v.stdout);

    console.log('[5/8] Backend deps...');
    await x('cd /opt/olmec/backend && npm install 2>&1 | tail -2', 'npm install');

    console.log('[6/8] PM2 services...');
    await x('pm2 delete olmec-api olmec-backend olmec-train olmec-train-loop 2>/dev/null; true', 'clean pm2');
    await x('cd /opt/olmec/AI && pm2 start /opt/olmec/AI/venv/bin/python --name olmec-api -- -m uvicorn OlmecAPI:app --host 0.0.0.0 --port 8000 2>&1 | tail -2', 'start API');
    await x('cd /opt/olmec/backend && pm2 start server.js --name olmec-backend 2>&1 | tail -2', 'start backend');

    console.log('[7/8] Nginx...');
    const ng = 'server {\n' +
        '    listen 80 default_server;\n' +
        '    server_name ininsico.artdevelopers.site 68.183.103.119;\n' +
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
        '        root /opt/olmec/frontend/dist;\n' +
        '        index index.html;\n' +
        '        try_files $uri $uri/ /index.html;\n' +
        '    }\n' +
        '}';
    await x('cat > /etc/nginx/sites-available/olmec', 'write nginx... (skip)');
    // Use base64 to avoid escape issues
    const b64 = Buffer.from(ng, 'utf-8').toString('base64');
    await x(`echo ${b64} | base64 -d > /etc/nginx/sites-available/olmec`, 'write nginx cfg');
    await x('ln -sf /etc/nginx/sites-available/olmec /etc/nginx/sites-enabled/olmec && rm -f /etc/nginx/sites-enabled/default && systemctl restart nginx 2>&1 | tail -2', 'enable nginx');

    console.log('[8/8] Verify...');
    await new Promise(r => setTimeout(r, 3000));
    const h = await ssh.execCommand('curl -s http://localhost:8000/health');
    console.log('  API Health:', h.stdout);
    const p = await ssh.execCommand('pm2 list');
    console.log(p.stdout);

    console.log('\nDONE. Everything deployed.');
    ssh.dispose();
}
run().catch(e => { console.error('FAIL:', e); ssh.dispose(); });
