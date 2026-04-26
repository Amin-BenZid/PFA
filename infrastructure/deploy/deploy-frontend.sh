#!/bin/bash
# Usage: ./deploy-frontend.sh <EC2_IP> <S3_BUCKET> <CLOUDFRONT_ID>
# Example: ./deploy-frontend.sh 13.53.x.x apple-doctor-frontend-ab12 EXAMPLEID

EC2_IP=$1
BUCKET=$2
CF_ID=$3

if [ -z "$EC2_IP" ] || [ -z "$BUCKET" ] || [ -z "$CF_ID" ]; then
  echo "Usage: $0 <EC2_IP> <S3_BUCKET> <CLOUDFRONT_ID>"
  exit 1
fi

cd "$(dirname "$0")/../../frontend"

# Build with the live backend URL
VITE_API_URL="http://$EC2_IP:3000/api" npm run build

# Upload to S3
aws s3 sync dist/ s3://$BUCKET/ --delete

# Bust CloudFront cache
aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/*"

echo "Frontend deployed! CloudFront may take ~2 min to propagate."