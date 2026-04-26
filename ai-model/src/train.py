"""
Training script for apple disease detection — YOLOv8.
Track A starter file. Customize for your dataset.

Usage:
    python src/train.py --data data/processed/data.yaml --epochs 50
"""
import argparse
from pathlib import Path

from ultralytics import YOLO


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, required=True, help="Path to data.yaml")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Base model")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--name", type=str, default="apple_disease_v1")
    parser.add_argument("--project", type=str, default="runs/train")
    return parser.parse_args()


def main():
    args = parse_args()

    model = YOLO(args.model)
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        name=args.name,
        project=args.project,
        patience=10,
        save=True,
        plots=True,
    )

    # Save best model to standard path
    best_path = Path(results.save_dir) / "weights" / "best.pt"
    print(f"\n✅ Training complete. Best model saved at: {best_path}")


if __name__ == "__main__":
    main()
