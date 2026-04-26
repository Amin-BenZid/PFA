"""
FastAPI service exposing the AI model to the backend.
Implements docs/api-contract.md — POST /predict.

Run:   uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload
"""
import base64
import time
import uuid
from io import BytesIO

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from PIL import Image
from pydantic import BaseModel, Field

# from src.predict import ApplePredictor  # Uncomment once a trained model exists

app = FastAPI(title="Apple Disease AI Service", version="0.1.0")

# predictor = ApplePredictor("models/best.pt")  # Uncomment when ready


class PredictOptions(BaseModel):
    include_bboxes: bool = True
    min_confidence: float = 0.5


class PredictRequest(BaseModel):
    image_url: str | None = None
    image_base64: str | None = None
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    options: PredictOptions = PredictOptions()


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


@app.post("/predict")
def predict(req: PredictRequest, mock: bool = Query(False)):
    start = time.time()

    if mock:
        return _mock_response(req.request_id, start)

    # TODO: load image from S3 (req.image_url) or decode base64
    # image = _load_image(req)
    # result = predictor.predict(image, min_confidence=req.options.min_confidence)
    raise HTTPException(503, "Real model not yet loaded — use ?mock=true for now")


def _mock_response(request_id: str, start: float) -> dict:
    return {
        "status": "success",
        "request_id": request_id,
        "model_version": "mock-v0",
        "inference_time_ms": int((time.time() - start) * 1000),
        "image_dimensions": {"width": 1920, "height": 1080},
        "detections": [
            {
                "class": "apple_scab",
                "class_fr": "Tavelure du pommier",
                "confidence": 0.92,
                "bbox": {"x": 120, "y": 80, "width": 200, "height": 180},
            }
        ],
        "overall_diagnosis": "diseased",
        "severity": "moderate",
        "recommended_treatment_id": "TRT_APPLE_SCAB_001",
    }
