# 🤝 API Contract — AI Service ↔ Backend

> **Status:** 🟢 Locked v1.0 — Any changes require approval from BOTH Track A & Track B.

This document defines the integration contract between the AI inference service (Track A) and the Node.js backend (Track B). It is the single source of truth that allows both teams to work in parallel.

---

## 🎯 Purpose

The **backend** sends an apple image to the **AI service** and receives a diagnosis with bounding boxes, disease classification, severity, and a treatment recommendation ID.

---

## 📍 Endpoint

```
POST /predict
Content-Type: application/json
```

Base URL during development: `http://localhost:8000` (AI service)
Base URL in production: AWS SageMaker Endpoint or App Runner URL.

---

## 📥 Request

```json
{
  "image_url": "s3://apple-disease-bucket/uploads/abc123.jpg",
  "image_base64": null,
  "request_id": "uuid-v4-string",
  "options": {
    "include_bboxes": true,
    "min_confidence": 0.5
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image_url` | string | ✅ (or `image_base64`) | S3 URL to the uploaded image |
| `image_base64` | string | ✅ (or `image_url`) | Base64-encoded image (fallback) |
| `request_id` | string | ✅ | UUID v4 for tracing |
| `options.include_bboxes` | bool | ❌ | Default `true` |
| `options.min_confidence` | float | ❌ | Default `0.5` |

---

## 📤 Response — Success (200 OK)

```json
{
  "status": "success",
  "request_id": "uuid-v4-string",
  "model_version": "yolov8n-apple-v1.2",
  "inference_time_ms": 245,
  "image_dimensions": { "width": 1920, "height": 1080 },
  "detections": [
    {
      "class": "apple_scab",
      "class_fr": "Tavelure du pommier",
      "class_ar": "جرب التفاح",
      "confidence": 0.92,
      "bbox": {
        "x": 120,
        "y": 80,
        "width": 200,
        "height": 180
      }
    },
    {
      "class": "rotten_fruit",
      "class_fr": "Fruit pourri",
      "confidence": 0.87,
      "bbox": { "x": 400, "y": 300, "width": 150, "height": 150 }
    }
  ],
  "overall_diagnosis": "diseased",
  "severity": "moderate",
  "recommended_treatment_id": "TRT_SCAB_001"
}
```

### Field Specifications

| Field | Type | Description |
|-------|------|-------------|
| `status` | enum | `success` \| `error` |
| `model_version` | string | For traceability in logs |
| `detections[]` | array | Empty if healthy or no detections above threshold |
| `detections[].class` | enum | See [Class Taxonomy](#class-taxonomy) |
| `detections[].confidence` | float | 0.0 – 1.0 |
| `detections[].bbox` | object | Pixel coordinates (top-left origin) |
| `overall_diagnosis` | enum | `healthy` \| `diseased` \| `rotten` \| `mixed` |
| `severity` | enum | `none` \| `mild` \| `moderate` \| `severe` |
| `recommended_treatment_id` | string \| null | Maps to backend's `treatments` collection |

---

## 📤 Response — Error (4xx / 5xx)

```json
{
  "status": "error",
  "request_id": "uuid-v4-string",
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Image could not be decoded or is not a supported format",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_IMAGE` | 400 | Cannot decode image |
| `IMAGE_TOO_LARGE` | 413 | Exceeds 10MB limit |
| `MODEL_NOT_LOADED` | 503 | AI service warming up |
| `INFERENCE_FAILED` | 500 | Internal model error |
| `TIMEOUT` | 504 | Inference exceeded 30s |

---

## 🏷️ Class Taxonomy

Both teams must use these exact class names.

### Leaf Diseases
| Class (en) | Français | العربية |
|------------|----------|---------|
| `apple_scab` | Tavelure du pommier | جرب التفاح |
| `apple_black_rot` | Pourriture noire | العفن الأسود |
| `cedar_apple_rust` | Rouille du pommier | صدأ التفاح |
| `powdery_mildew` | Oïdium | البياض الدقيقي |
| `frog_eye_leaf_spot` | Tache œil de grenouille | بقعة عين الضفدع |
| `healthy_leaf` | Feuille saine | ورقة سليمة |

### Fruit Conditions
| Class (en) | Français | العربية |
|------------|----------|---------|
| `rotten_fruit` | Pomme pourrie | تفاحة عفنة |
| `bruised_fruit` | Pomme meurtrie | تفاحة مجروحة |
| `healthy_fruit` | Pomme saine | تفاحة سليمة |

---

## 🧪 Mock Mode (for parallel development)

While the real model is being trained, the AI service must expose a **mock mode** that returns a deterministic response for any image:

```bash
POST /predict?mock=true
```

This lets the backend team build & test integration without waiting for the trained model.

---

## 📝 Versioning

Breaking changes require:
1. Bump `model_version` field
2. Update this document with a new section `## v2.0`
3. Both team members sign off in PR review
4. Old endpoint stays live for 1 sprint during migration

---

## 🔗 Owners

- **Track A (AI):** *(Friend's name)* — Implements `/predict`
- **Track B (Backend):** Amine Benzid — Consumes `/predict`

Last updated: 2026-04-26
