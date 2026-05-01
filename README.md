# 🍎 Apple Doctor — Détection de Maladies du Pommier

> Application mobile-first permettant aux agriculteurs de détecter les maladies des pommes par photo et d'obtenir des recommandations de traitement en temps réel.

---

## 👥 Équipe

| Membre | Rôle |
|--------|------|
| Amine Benzid | Full-Stack & Cloud Engineering |
| Yacine Mechri | AI Engineering (YOLOv8) |

---

## 🛠️ Stack Technique

- **IA / ML:** Python, YOLOv8 (Ultralytics), Hugging Face Spaces, FastAPI
- **Backend:** Node.js, Express, MongoDB Atlas
- **Frontend:** React, Vite, Framer Motion
- **Cloud:** AWS (S3, CloudFront, EC2, IAM)
- **Monitoring:** Prometheus, Grafana
- **DevOps:** GitHub Actions CI/CD, Jest, Vitest

---

## 📂 Structure du Projet

```
PFA/
├── ai-model/          # Entraînement YOLOv8 (Python)
├── backend/           # API REST Node.js + Express
│   └── __tests__/     # Tests Jest
├── frontend/          # Application React
│   └── src/test/      # Tests Vitest
├── infrastructure/    # Terraform & scripts AWS
├── .github/workflows/ # Pipelines CI/CD
└── scripts/           # Scripts utilitaires
```

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- Python 3.10+
- AWS CLI configuré

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

---

## 🌍 Déploiement

| Service | URL |
|---------|-----|
| Application | https://d3j1y3kiqalty4.cloudfront.net |
| API | https://apple-doctor.duckdns.org/api |
| Monitoring | https://apple-doctor.duckdns.org/grafana |
| IA (HF) | https://aminebenzid-apple-doctor-ai.hf.space |

---

## 📄 Licence

Projet académique — EPI (PFA 2025-2026).
