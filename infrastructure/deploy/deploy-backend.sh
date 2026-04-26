#!/bin/bash
# Usage: ./deploy-backend.sh <EC2_IP> <path-to-private-key>
# Example: ./deploy-backend.sh 13.53.x.x ~/.ssh/apple-doctor-key.pem

EC2_IP=$1
KEY=$2
REPO="https://github.com/YOUR_USERNAME/YOUR_REPO.git"   # <-- change this

if [ -z "$EC2_IP" ] || [ -z "$KEY" ]; then
  echo "Usage: $0 <EC2_IP> <key.pem>"
  exit 1
fi

ssh -i "$KEY" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" <<'ENDSSH'
  set -e
  cd /app

  # First deploy: clone the repo
  if [ ! -d "backend" ]; then
    git clone $REPO .
  else
    git pull origin main
  fi

  cd backend
  npm install --production

  # Start or restart with PM2
  pm2 describe apple-backend > /dev/null 2>&1 \
    && pm2 restart apple-backend \
    || pm2 start src/index.js --name apple-backend --env production

  pm2 save
  echo "Backend deployed!"
ENDSSH