output "backend_ip" {
  value       = aws_eip.backend.public_ip
  description = "EC2 public IP — set as VITE_API_URL=http://<this-ip>:3000/api in your frontend build"
}

output "cloudfront_url" {
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  description = "Live frontend URL"
}

output "frontend_bucket" {
  value       = aws_s3_bucket.frontend.bucket
  description = "S3 bucket name — used by the deploy script"
}

output "cloudfront_id" {
  value       = aws_cloudfront_distribution.frontend.id
  description = "CloudFront distribution ID — used for cache invalidation"
}