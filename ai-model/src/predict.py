"""
Inference helper for the trained apple disease YOLO model.
Used by server.py to expose the /predict endpoint.
"""
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from ultralytics import YOLO


# Map YOLO class indices to taxonomy from docs/api-contract.md
CLASS_NAMES_FR = {
    "apple_scab": "Tavelure du pommier",
    "apple_black_rot": "Pourriture noire",
    "cedar_apple_rust": "Rouille du pommier",
    "powdery_mildew": "Oïdium",
    "frog_eye_leaf_spot": "Tache œil de grenouille",
    "healthy_leaf": "Feuille saine",
    "rotten_fruit": "Pomme pourrie",
    "bruised_fruit": "Pomme meurtrie",
    "healthy_fruit": "Pomme saine",
}


class ApplePredictor:
    def __init__(self, weights_path: str = "models/best.pt"):
        self.model = YOLO(weights_path)
        self.model_version = Path(weights_path).stem

    def predict(self, image: np.ndarray, min_confidence: float = 0.5) -> dict[str, Any]:
        results = self.model(image, conf=min_confidence, verbose=False)[0]

        detections = []
        for box in results.boxes:
            cls_id = int(box.cls[0])
            cls_name = self.model.names[cls_id]
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append({
                "class": cls_name,
                "class_fr": CLASS_NAMES_FR.get(cls_name, cls_name),
                "confidence": float(box.conf[0]),
                "bbox": {
                    "x": int(x1),
                    "y": int(y1),
                    "width": int(x2 - x1),
                    "height": int(y2 - y1),
                },
            })

        # Derive overall diagnosis from detections
        diagnosis = self._derive_diagnosis(detections)

        return {
            "model_version": self.model_version,
            "image_dimensions": {
                "width": image.shape[1],
                "height": image.shape[0],
            },
            "detections": detections,
            **diagnosis,
        }

    @staticmethod
    def _derive_diagnosis(detections: list[dict]) -> dict[str, Any]:
        if not detections:
            return {
                "overall_diagnosis": "healthy",
                "severity": "none",
                "recommended_treatment_id": None,
            }

        classes = {d["class"] for d in detections}
        has_rot = "rotten_fruit" in classes
        has_disease = any(c not in {"healthy_leaf", "healthy_fruit", "bruised_fruit"} for c in classes)

        if has_rot and has_disease:
            diag = "mixed"
        elif has_rot:
            diag = "rotten"
        elif has_disease:
            diag = "diseased"
        else:
            diag = "healthy"

        max_conf = max((d["confidence"] for d in detections), default=0)
        severity = "severe" if max_conf > 0.85 else "moderate" if max_conf > 0.7 else "mild"

        return {
            "overall_diagnosis": diag,
            "severity": severity if diag != "healthy" else "none",
            "recommended_treatment_id": f"TRT_{detections[0]['class'].upper()}_001",
        }
