const { NodeSSH } = require('node-ssh');
const path = require('path');
const { execSync } = require('child_process');

const ssh = new NodeSSH();




// PS C:\Users\arsla\Desktop\projects\Ininsico(3D)\Olmec> ssh -o ConnectTimeout=5 root@68.183.103.119 "cat /etc/nginx/sites-enabled/olmec"
// root@68.183.103.119's password: 
// cat: /etc/nginx/sites-enabled/olmec: No such file or directory
// PS C:\Users\arsla\Desktop\projects\Ininsico(3D)\Olmec> 

// fuck u you can not even fuckin deploy a simple fuckin website how much fuckin hard is this shti show for u u fuckin cutn











const config = {
    host: '68.183.103.119',
    username: 'root',
    password: '2136109HNsj',
    remotePath: '/opt/olmec'
};

async function deploy() {
    console.log('🚀 [1/3] Building Frontend...');
    execSync('npm run build', { cwd: path.resolve(__dirname, '../frontend'), stdio: 'inherit' });

    console.log('\n📡 [2/3] Connecting...');
    await ssh.connect({
        host: config.host,
        username: config.username,
        password: config.password
    });

    console.log('\n📤 [3/3] Uploading Folders (High Speed)...');
    
    // Upload Frontend
    console.log('  ▸ Uploading Frontend...');
    await ssh.putDirectory(path.resolve(__dirname, '../frontend/dist'), `${config.remotePath}/frontend/dist`, {
        recursive: true,
        concurrency: 20
    });

    // Upload Backend
    console.log('  ▸ Uploading Backend...');
    await ssh.putDirectory(path.resolve(__dirname, '../backend'), `${config.remotePath}/backend`, {
        recursive: true,
        concurrency: 20,
        validate: (p) => !p.includes('node_modules') && !p.includes('.env') && !p.includes('.git')
    });

    console.log('\n🔄 Restarting Services...');
    await ssh.execCommand(`cd ${config.remotePath}/backend && npm install && pm2 delete olmec-backend || true && pm2 start server.js --name olmec-backend`);
    await ssh.execCommand(`systemctl restart nginx`);

    console.log('\n✅ DONE. Website should be live.');
    ssh.dispose();
}

deploy().catch(err => {
    console.error('❌ FAILED:', err);
    ssh.dispose();
});
