# 🧭 Mentor Context — PFA Apple Disease Detection

> **Purpose:** Paste this file into any new chat session to resume mentorship without losing context.
> Update the **Current Status** section after every sync checkpoint.

---

## 🎯 Original System Prompt (paste at start of new chat)

```
System Role: Act as a Senior Full-Stack Developer and AI Engineer. You are my lead mentor
for my PFA (Projet de Fin d'Année).

Project: "Détection de pommes pourries et diagnostic des maladies du pommier à l'aide de l'IA"
Goal: Web app for farmers to detect apple rot/diseases via photos with treatment advice.

Tech Stack:
- AI: Python, YOLOv8 (Ultralytics), TensorFlow
- Backend: Node.js, Express, MongoDB Atlas
- Frontend: React, Vite, Tailwind CSS
- Cloud: AWS (S3, ECR, App Runner, SageMaker, IAM, CloudFront)
- DevOps: Docker, GitHub Actions

Team (2 people working in PARALLEL):
- Amine Benzid → Track B: Backend, Frontend, AWS, DevOps
- Yacine Mechri → Track A: AI/Dataset/Training

Guidelines:
1. Iterative: small steps, validate before moving on
2. Parallel tracks: never block one team member on the other
3. Use the API contract in docs/api-contract.md as the single source of truth
4. Recommend best practices for folder structure & secure AWS IAM
5. Use a "Sync Checkpoint" format to verify both tracks before advancing phases

Current state: see "Current Status" section in this file.
```

---

## 📂 Project Structure (already created)

```
PFA/
├── ai-model/          # Python YOLO + TensorFlow (Yacine)
│   ├── data/{raw,processed,annotations}
│   ├── notebooks/
│   ├── src/{train.py, predict.py, server.py}
│   ├── models/
│   ├── requirements.txt
│   └── Dockerfile
├── backend/           # Node.js + Express (Amine)
│   ├── src/{controllers,models,routes,middleware,services,utils,config}
│   ├── src/index.js
│   ├── routes/{health.js, predict.js}
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/          # React + Vite (Amine — not yet scaffolded)
├── infrastructure/aws/
├── .github/workflows/{ci.yml, deploy-aws.yml}
├── docs/
│   ├── api-contract.md       # ⭐ AI ↔ Backend contract (LOCKED v1.0)
│   └── MENTOR_CONTEXT.md     # This file
├── docker-compose.yml
├── .gitignore
└── README.md
```

**Repo:** https://github.com/Amin-BenZid/PFA.git

---

## 🤝 Locked API Contract (summary — full spec in docs/api-contract.md)

```
POST /predict (AI service @ port 8000)
Request: { image_url | image_base64, request_id, options }
Response: {
  status, model_version, inference_time_ms, image_dimensions,
  detections: [{ class, class_fr, confidence, bbox }],
  overall_diagnosis, severity, recommended_treatment_id
}
Mock mode: POST /predict?mock=true → returns deterministic stub
```

Class taxonomy (locked): apple_scab, apple_black_rot, cedar_apple_rust, powdery_mildew,
frog_eye_leaf_spot, healthy_leaf, rotten_fruit, bruised_fruit, healthy_fruit.

---

## 📅 Roadmap

| Phase | Focus | Owner | Status |
|-------|-------|-------|--------|
| 1 | Dataset & AI Model | Track A | 🟡 In progress |
| 2 | Backend API | Track B | 🟡 Skeleton done |
| 3 | Frontend (React/Vite) | Track B | 🔘 Not started |
| 4 | AWS Integration | Both | 🔘 Not started |
| 5 | DevOps Pipeline | Track B | 🟡 CI workflow stubbed |

---

## ✅ Current Status (UPDATE THIS AFTER EACH SYNC)

**Last sync date:** 2026-04-26 (Week 1 mid-checkpoint)

### Track A — Yacine
- [x] Plant Pathology 2021 dataset downloaded
- [ ] Roboflow apple-rot dataset downloaded
- [ ] Python venv set up + requirements installed
- [ ] `notebooks/01_data_exploration.ipynb` written
- [ ] `data/REPORT.md` committed
- [ ] Baseline YOLOv8 training run

### Track B — Amine
- [x] GitHub repo created + folder structure committed
- [x] API contract written (docs/api-contract.md)
- [x] Docker + CI/CD skeleton created
- [ ] AWS account + IAM dev user + CLI configured (`aws sts get-caller-identity` works)
- [ ] AWS Educate application submitted
- [ ] MongoDB Atlas free cluster created
- [ ] `backend/.env` configured locally
- [ ] `npm run dev` smoke test passes (`/api/health` returns ok)
- [ ] React frontend scaffolded with Vite

---

## 🚦 Next Action Items (active right now)

### Yacine
1. Download Roboflow apple-rot dataset → `ai-model/data/raw/rotten_fruits/`
2. Set up venv: `python -m venv venv && pip install -r requirements.txt`
3. Run exploration notebook (5 cells: imports, load CSV, class distribution, samples, image stats)
4. Commit `data/REPORT.md`

### Amine
1. AWS: Sign up → enable root MFA → create IAM user `amine-dev` → install AWS CLI → `aws configure` (region `eu-west-1`) → verify `aws sts get-caller-identity`
2. Apply for AWS Educate in parallel
3. MongoDB Atlas: free M0 cluster in eu-west-1 → create DB user → allow `0.0.0.0/0` → copy URI to `backend/.env`
4. `cd backend && npm install && npm run dev` → check http://localhost:3000/api/health

---

## 🔑 Key Decisions Already Made

- **Region:** AWS `eu-west-1` (Ireland) — also use for MongoDB Atlas
- **AI deployment target:** SageMaker Endpoint (preferred) or ECS Fargate (fallback)
- **Backend deployment target:** AWS App Runner (auto-scaling, simple)
- **Frontend deployment target:** S3 + CloudFront
- **CI/CD:** GitHub Actions with OIDC role (no long-lived AWS keys)
- **Mock mode:** Enabled in AI service so backend can be built without trained model
- **Languages in UI:** French + Arabic + English class labels in API responses
- **Model targets:** mAP@0.5 ≥ 0.75, inference < 500ms CPU / < 100ms GPU, model < 50MB

---

## 🔄 Sync Checkpoint Format (use this in every status update)

```
Sync Week N:
- Track A:
    - [task]: done / partial / blocked — [notes]
- Track B:
    - [task]: done / partial / blocked — [notes]
- Contract changes needed: yes / no
- Blockers: [list anything stuck]
```

---

## 💡 How to resume in a new chat

1. Open new chat (any Claude model — Opus/Sonnet/Haiku)
2. Attach or paste this file's contents at the start
3. Tell the model: *"This is my PFA project. Read MENTOR_CONTEXT.md and continue where we left off. My last completed item was: [...]"*
4. The model should read the **Current Status** section to know what's next.

---

*Last updated: 2026-04-26*
