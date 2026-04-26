# 🔧 Backend — Track B

Node.js + Express REST API for the Apple Disease Detection PFA.

## Setup

```bash
npm install
cp .env.example .env   # fill in your secrets
npm run dev
```

API will run at http://localhost:3000

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/predict` | Upload an image → calls AI service → returns diagnosis |

See [API Contract](../docs/api-contract.md) for the full spec.

## Tech

- **Express** — HTTP framework
- **Mongoose** — MongoDB ODM
- **Multer** — File upload handling
- **AWS SDK v3** — S3 image storage
- **Axios** — HTTP client to AI service
- **Helmet + CORS** — Security
