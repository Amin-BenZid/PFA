# ☁️ AWS Infrastructure

This folder will hold AWS-specific configuration and IaC.

## Services we'll use

| Service | Purpose |
|---------|---------|
| **S3** | Image upload storage |
| **ECR** | Docker image registry |
| **App Runner** | Backend hosting (auto-scaling) |
| **SageMaker Endpoint** *or* **ECS Fargate** | AI model inference |
| **CloudFront + S3** | Static frontend hosting |
| **IAM** | Roles & permissions |
| **CloudWatch** | Logs & monitoring |
| **Secrets Manager** | Credentials |

## Phase 4 setup checklist

- [ ] Create S3 bucket `apple-disease-uploads` (private, CORS for frontend)
- [ ] Create ECR repos: `apple-disease-backend`, `apple-disease-ai`
- [ ] Create IAM role for GitHub Actions (OIDC, trust policy)
  - Add ARN to GitHub repo secret `AWS_DEPLOY_ROLE_ARN`
- [ ] Create App Runner service for backend
- [ ] Deploy AI model to SageMaker Endpoint (Phase 4)
- [ ] Set up CloudFront distribution for frontend

## IAM principle

**Never use root account credentials.** Always use:
- IAM users for humans (with MFA)
- IAM roles for services (no long-lived keys)
- Least-privilege: only the permissions needed
