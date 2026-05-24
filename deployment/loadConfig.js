const fs = require('fs');
const path = require('path');

function loadConfig() {
    const envPath = path.resolve(__dirname, 'deploy_config.local.env');
    const defaultPath = path.resolve(__dirname, 'deploy_config.env');
    const configPath = fs.existsSync(envPath) ? envPath : defaultPath;
    const lines = fs.readFileSync(configPath, 'utf-8').split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const config = {};
    for (const line of lines) {
        const [k, ...v] = line.split('=');
        config[k.trim()] = v.join('=').trim();
    }
    return config;
}

module.exports = { loadConfig };
