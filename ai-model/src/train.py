"""
Training script for apple disease detection — YOLOv8.
Track A (Yacine)

Supports two modes:
  classify  — YOLOv8 image classification (no bbox needed, use this first)
  detect    — YOLOv8 object detection (requires annotated bboxes)

Usage — Classification (start here):
    python src/train.py --task classify --data data/processed --epochs 10

Usage — Detection (once bbox annotations exist):
    python src/train.py --task detect --data data/processed/data.yaml --epochs 50
"""
import argparse
from pathlib import Path

from ultralytics import YOLO


# Default base models per task
DEFAULT_MODELS = {
    "classify": "yolov8n-cls.pt",
    "detect":   "yolov8n.pt",
}


def parse_args():
    parser = argparse.ArgumentParser(description="Train apple disease YOLOv8 model")
    parser.add_argument(
        "--task",
        type=str,
        choices=["classify", "detect"],
        default="classify",
        help="Training task: 'classify' (no bboxes needed) or 'detect' (bboxes required). Default: classify",
    )
    parser.add_argument(
        "--data",
        type=str,
        required=True,
        help=(
            "For classify: path to processed/ folder (contains train/ val/ test/ subfolders). "
            "For detect: path to data.yaml."
        ),
    )
    parser.add_argument(
        "--model",
        type=str,
        default=None,
        help="Base model weights. Defaults to yolov8n-cls.pt (classify) or yolov8n.pt (detect).",
    )
    parser.add_argument("--epochs",  type=int,   default=10)
    parser.add_argument("--imgsz",   type=int,   default=224,
                        help="Image size. 224 recommended for classify (matches VGG/ImageNet), 640 for detect.")
    parser.add_argument("--batch",   type=int,   default=32)
    parser.add_argument("--name",    type=str,   default=None,
                        help="Run name (auto-generated if not set).")
    parser.add_argument("--project", type=str,   default="runs",
                        help="Root folder for all training runs.")
    parser.add_argument("--patience", type=int,  default=10,
                        help="Early stopping patience (epochs without improvement).")
    parser.add_argument("--lr",      type=float, default=0.001,
                        help="Initial learning rate.")
    parser.add_argument("--freeze",  type=int,   default=None,
                        help="Number of backbone layers to freeze (transfer learning). "
                             "E.g. --freeze 10 freezes first 10 layers.")
    return parser.parse_args()


def main():
    args = parse_args()

    # Pick base model
    model_weights = args.model or DEFAULT_MODELS[args.task]

    # Auto-generate run name
    run_name = args.name or f"apple_disease_{args.task}_v1"

    # Image size defaults
    imgsz = args.imgsz
    if args.imgsz == 224 and args.task == "detect":
        imgsz = 640  # detection needs larger input
        print(f"[INFO] --task detect: overriding imgsz to {imgsz}")

    print(f"\n{'═'*55}")
    print(f"  Task:    {args.task}")
    print(f"  Model:   {model_weights}")
    print(f"  Data:    {args.data}")
    print(f"  Epochs:  {args.epochs}  |  Img size: {imgsz}  |  Batch: {args.batch}")
    print(f"  Run:     {args.project}/{run_name}")
    print(f"{'═'*55}\n")

    model = YOLO(model_weights)

    train_kwargs = dict(
        data=args.data,
        epochs=args.epochs,
        imgsz=imgsz,
        batch=args.batch,
        name=run_name,
        project=args.project,
        patience=args.patience,
        lr0=args.lr,
        save=True,
        plots=True,
        task=args.task,
    )

    if args.freeze is not None:
        train_kwargs["freeze"] = args.freeze

    results = model.train(**train_kwargs)

    # Save best weights to standard location
    best_src = Path(results.save_dir) / "weights" / "best.pt"
    best_dest = Path("models") / f"{run_name}_best.pt"
    best_dest.parent.mkdir(exist_ok=True)

    if best_src.exists():
        import shutil
        shutil.copy2(best_src, best_dest)
        print(f"\n✅ Training complete!")
        print(f"   Best weights: {best_dest}")
        print(f"   Full run:     {results.save_dir}")
        print(f"\n   Next step: update server.py to load '{best_dest}'")
    else:
        print(f"\n✅ Training complete! Weights at: {results.save_dir}/weights/best.pt")


if __name__ == "__main__":
    main()
