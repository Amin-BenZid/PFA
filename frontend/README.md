# 🎨 Frontend — Track B

React app for farmers to upload apple photos and view disease diagnoses.

## Initial Scaffold

We'll use **Vite + React + Tailwind**. To scaffold the actual project, run from this folder:

```bash
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom @tanstack/react-query lucide-react
```

The pre-created folder structure (`src/components`, `src/pages`, etc.) is ready to be populated once Vite has scaffolded the base files.

## Folder Plan

```
frontend/
├── public/
└── src/
    ├── components/    # Reusable UI components (Button, ImageUpload, BBoxOverlay)
    ├── pages/         # Route components (Home, Upload, Result, History)
    ├── services/      # API client (axios instance, endpoints)
    ├── hooks/         # Custom React hooks
    ├── assets/        # Images, icons
    └── styles/        # Global styles, Tailwind config
```

## Connecting to Backend

Set in `.env`:
```
VITE_API_BASE_URL=http://localhost:3000/api
```
