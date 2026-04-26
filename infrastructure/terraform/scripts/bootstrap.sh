#!/bin/bash
set -e

apt-get update -y && apt-get upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

# PM2 process manager
npm install -g pm2

# App directory
mkdir -p /app
chown ubuntu:ubuntu /app

# Write .env that the backend will read
cat > /app/.env <<EOF
PORT=3000
NODE_ENV=production
MONGODB_URI=${mongodb_uri}
AWS_REGION=${aws_region}
S3_BUCKET=${s3_bucket}
USE_MOCK_AI=true
AI_SERVICE_URL=http://localhost:8000
EOF

# Enable PM2 to survive reboots
env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
systemctl enable pm2-ubuntu || true

echo "Bootstrap done. SSH in and run deploy-backend.sh to deploy the app."