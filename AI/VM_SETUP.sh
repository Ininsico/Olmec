#!/bin/bash
# 🏺 Olmec VM Setup Script
# Run this on the VM: bash VM_SETUP.sh

echo "[*] Updating system..."
apt-get update && apt-get upgrade -y

echo "[*] Creating Swap space (2GB)..."
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

echo "[*] Installing MongoDB..."
apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ [arch=amd64,arm64] signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod

echo "[*] Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

echo "[*] Installing Python and build tools..."
apt-get install -y python3-pip python3-dev git build-essential libgl1-mesa-glx

echo "[*] Installing AI Core dependencies..."
# If the VM has a GPU, we need to ensure CUDA is handled. 
# For now, we install the base requirements.
pip3 install --upgrade pip
pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cpu # Default to CPU, update if GPU found
pip3 install fastapi uvicorn python-multipart python-dotenv requests pillow trimesh open3d pymeshlab tqdm numpy einops timm accelerate transformers

echo "[*] Installing Node.js and PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

echo "[*] Setting up Deployment Directory..."
mkdir -p /opt/olmec
cp -r /root/* /opt/olmec/
chmod -R 755 /opt/olmec

echo "[*] Configuring Nginx..."
cat > /etc/nginx/sites-available/olmec <<EOF
server {
    listen 80;
    server_name ininsico.artdevelopers.site;

    location / {
        root /opt/olmec/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /ai-api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

ln -s /etc/nginx/sites-available/olmec /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

echo "[*] Setting up Permissions..."
mkdir -p /opt/olmec/AI/api_uploads /opt/olmec/AI/api_outputs /opt/olmec/AI/models /root/AI/previews
chown -R www-data:www-data /opt/olmec/frontend/dist
chmod -R 755 /opt/olmec

echo "[*] Deployment Ready!"
echo "Next steps: Build frontend, start PM2 processes."
