# 🍎 Apple Disease & Rot Detection — PFA Project

> **Détection de pommes pourries et diagnostic des maladies du pommier à l'aide de l'IA**

A web application for farmers to detect apple rot and diagnose apple tree diseases via photos, with AI-powered treatment recommendations.

---

## 👥 Team

| Member | Role | Track |
|--------|------|-------|
| Amine Benzid | Full-Stack & Cloud Engineering | Track B (Backend, Frontend, AWS, DevOps) |
| Yacine Mechri   | AI Engineering                 | Track A (Dataset, YOLO, TensorFlow) |

---

## 🛠️ Tech Stack

- **AI / ML:** Python, YOLOv8 (Ultralytics), TensorFlow, OpenCV
- **Backend:** Node.js, Express, MongoDB (Atlas)
- **Frontend:** React, Vite, Tailwind CSS
- **Cloud:** Amazon Web Services (S3, ECR, App Runner / SageMaker, IAM)
- **DevOps:** Docker, GitHub Actions

---

## 📂 Project Structure

```
PFA/
├── ai-model/          # Python YOLO + TensorFlow training & inference
├── backend/           # Node.js Express REST API
├── frontend/          # React web app
├── infrastructure/    # AWS configs, Dockerfiles, deploy scripts
├── .github/workflows/ # CI/CD pipelines
├── docs/              # API contract, diagrams, PFA report
└── scripts/           # Utility scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 20+
- Docker Desktop
- AWS CLI configured
- Git

### Quick Start
```bash
# Clone the repo
git clone <repo-url>
cd PFA

# AI Model (Track A)
cd ai-model
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Backend (Track B)
cd ../backend
npm install
cp .env.example .env  # fill in your secrets

# Frontend (Track B)
cd ../frontend
npm install
npm run dev
```

---

## 📜 Documentation

- [API Contract](docs/api-contract.md) — AI ↔ Backend integration spec
- [Architecture](docs/diagrams/) — System diagrams
- [PFA Report](docs/) — Final report (in progress)

---

## 📅 Roadmap

| Phase | Focus | Owner | Status |
|-------|-------|-------|--------|
| 1 | Dataset & AI Model Training | Track A | 🟡 In progress |
| 2 | Backend API | Track B | 🔘 Not started |
| 3 | Frontend | Track B | 🔘 Not started |
| 4 | AWS Integration | Both | 🔘 Not started |
| 5 | DevOps Pipeline | Track B | 🔘 Not started |

---

## 📄 License

Academic project — EPI (PFA 2025-2026).
