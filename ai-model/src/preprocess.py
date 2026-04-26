"""
Preprocessing script — Apple Disease & Rot Detection
Track A (Yacine)

Merges two datasets into a single YOLOv8-cls folder structure:
  1. NVIDIA Fruits dataset  → healthy_fruit, rotten_fruit
  2. Plant Pathology 2021   → apple_scab, apple_black_rot, cedar_apple_rust,
                              powdery_mildew, frog_eye_leaf_spot, healthy_leaf

Output layout (data/processed/):
  train/
    apple_scab/         ← images
    apple_black_rot/
    ...
  val/
    ...
  test/
    ...
  data.yaml             ← generated automatically

Usage:
  python src/preprocess.py \\
      --nvidia  "E:/NVIDIA TRAINING ICME/data/fruits" \\
      --plant   "C:/path/to/plant-pathology-2021-fgvc8" \\
      --out     "data/processed" \\
      --split   0.8 0.1 0.1
"""

import argparse
import csv
import random
import shutil
import sys
from pathlib import Path

import yaml  # pip install pyyaml  (already in requirements via ultralytics)

# ── Class taxonomy (from docs/api-contract.md) ────────────────────────────────
ALL_CLASSES = [
    "apple_scab",
    "apple_black_rot",
    "cedar_apple_rust",
    "powdery_mildew",
    "frog_eye_leaf_spot",
    "healthy_leaf",
    "rotten_fruit",
    "bruised_fruit",
    "healthy_fruit",
]

# ── NVIDIA Fruits → our taxonomy ─────────────────────────────────────────────
NVIDIA_CLASS_MAP = {
    "freshapples":  "healthy_fruit",
    "rottenapples": "rotten_fruit",
    # Others skipped (not apple-related)
}

# ── Plant Pathology 2021 → our taxonomy ──────────────────────────────────────
PP2021_CLASS_MAP = {
    "scab":               "apple_scab",
    "rot":                "apple_black_rot",
    "rust":               "cedar_apple_rust",
    "powdery_mildew":     "powdery_mildew",
    "frog_eye_leaf_spot": "frog_eye_leaf_spot",
    "healthy":            "healthy_leaf",
    # "complex" is skipped (multi-label)
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def collect_nvidia(nvidia_root: Path) -> dict[str, list[Path]]:
    """
    Return {our_class: [image_paths]} from the NVIDIA fruits dataset.
    We merge train/ and valid/ — we'll do our own split.
    """
    result: dict[str, list[Path]] = {c: [] for c in ALL_CLASSES}
    if not nvidia_root.exists():
        print(f"[WARN] NVIDIA path not found: {nvidia_root}")
        return result

    for split in ["train", "valid"]:
        for orig_cls, our_cls in NVIDIA_CLASS_MAP.items():
            folder = nvidia_root / split / orig_cls
            if not folder.exists():
                continue
            imgs = list(folder.glob("*.png")) + list(folder.glob("*.jpg"))
            result[our_cls].extend(imgs)
            print(f"  [NVIDIA] {split}/{orig_cls} → {our_cls}: {len(imgs)} images")

    return result


def collect_plant_pathology(plant_root: Path) -> dict[str, list[Path]]:
    """
    Return {our_class: [image_paths]} from Plant Pathology 2021.
    Only single-label images are used.
    """
    result: dict[str, list[Path]] = {c: [] for c in ALL_CLASSES}
    csv_path = plant_root / "train.csv"
    img_dir = plant_root / "train_images"

    if not plant_root.exists():
        print(f"[WARN] Plant Pathology path not found: {plant_root}")
        return result

    if not csv_path.exists():
        print(f"[WARN] train.csv not found at {csv_path}")
        return result

    skipped_multi = 0
    skipped_unknown = 0

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        # Detect the image filename column (usually 'image' or 'image_id')
        fieldnames = reader.fieldnames or []
        img_col = next((c for c in fieldnames if "image" in c.lower()), None)
        label_col = next((c for c in fieldnames if "label" in c.lower()), None)

        if not img_col or not label_col:
            print(f"[ERROR] Cannot find image/label columns in train.csv. Columns: {fieldnames}")
            return result

        for row in reader:
            img_filename = row[img_col]
            labels = row[label_col].strip().split()

            # Skip multi-label images
            if len(labels) != 1:
                skipped_multi += 1
                continue

            label = labels[0]
            our_cls = PP2021_CLASS_MAP.get(label)
            if our_cls is None:
                skipped_unknown += 1
                continue

            img_path = img_dir / img_filename
            if not img_path.exists():
                # Try adding extension
                for ext in [".jpg", ".jpeg", ".png"]:
                    candidate = img_dir / (img_filename + ext)
                    if candidate.exists():
                        img_path = candidate
                        break

            if img_path.exists():
                result[our_cls].append(img_path)

    for cls, imgs in result.items():
        if imgs:
            print(f"  [Plant] {cls}: {len(imgs)} images")

    print(f"  [Plant] Skipped {skipped_multi} multi-label, {skipped_unknown} unknown-label images")
    return result


def split_images(
    images: list[Path],
    train_ratio: float,
    val_ratio: float,
    seed: int = 42,
) -> tuple[list[Path], list[Path], list[Path]]:
    """Split image list into train / val / test."""
    random.seed(seed)
    shuffled = images[:]
    random.shuffle(shuffled)
    n = len(shuffled)
    n_train = int(n * train_ratio)
    n_val = int(n * val_ratio)
    return shuffled[:n_train], shuffled[n_train:n_train + n_val], shuffled[n_train + n_val:]


def copy_images(
    images: list[Path],
    dest_dir: Path,
    prefix: str = "",
) -> int:
    """Copy images to dest_dir. Returns count of copied files."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    copied = 0
    for src in images:
        # Avoid filename collisions with a prefix
        dest = dest_dir / f"{prefix}{src.name}"
        if dest.exists():
            # Add counter suffix
            stem = src.stem
            suffix = src.suffix
            counter = 1
            while dest.exists():
                dest = dest_dir / f"{prefix}{stem}_{counter}{suffix}"
                counter += 1
        shutil.copy2(src, dest)
        copied += 1
    return copied


def write_yaml(out_dir: Path, classes: list[str]) -> None:
    """Write data.yaml for YOLOv8-cls training."""
    yaml_content = {
        "path": str(out_dir.resolve()),
        "train": "train",
        "val": "val",
        "test": "test",
        "nc": len(classes),
        "names": classes,
    }
    yaml_path = out_dir / "data.yaml"
    with open(yaml_path, "w") as f:
        yaml.dump(yaml_content, f, default_flow_style=False, sort_keys=False)
    print(f"\n[OK] data.yaml written → {yaml_path}")


# ── Main ──────────────────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(description="Preprocess datasets for apple disease detection")
    parser.add_argument(
        "--nvidia",
        type=Path,
        default=Path(r"E:\NVIDIA TRAINING ICME\data\fruits"),
        help="Path to NVIDIA fruits dataset root (contains train/ and valid/)",
    )
    parser.add_argument(
        "--plant",
        type=Path,
        default=None,
        help="Path to Plant Pathology 2021 root (contains train.csv and train_images/)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("data/processed"),
        help="Output directory for processed dataset",
    )
    parser.add_argument(
        "--split",
        type=float,
        nargs=3,
        default=[0.8, 0.1, 0.1],
        metavar=("TRAIN", "VAL", "TEST"),
        help="Train / val / test split ratios (default: 0.8 0.1 0.1)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    train_r, val_r, test_r = args.split

    if abs(train_r + val_r + test_r - 1.0) > 1e-6:
        print("[ERROR] Split ratios must sum to 1.0")
        sys.exit(1)

    print("\n══ COLLECTING IMAGES ══════════════════════════════════════════════")

    # Collect from both sources
    nvidia_images = collect_nvidia(args.nvidia)

    plant_images: dict[str, list[Path]] = {c: [] for c in ALL_CLASSES}
    if args.plant:
        plant_images = collect_plant_pathology(args.plant)
    else:
        print("[INFO] --plant not provided — skipping Plant Pathology 2021")

    # Merge
    all_images: dict[str, list[Path]] = {}
    for cls in ALL_CLASSES:
        combined = nvidia_images.get(cls, []) + plant_images.get(cls, [])
        all_images[cls] = combined

    print("\n══ SPLITTING & COPYING ═════════════════════════════════════════════")

    stats: dict[str, dict[str, int]] = {}
    for cls in ALL_CLASSES:
        imgs = all_images[cls]
        if not imgs:
            print(f"  [{cls}] No images found — skipping")
            continue

        train_imgs, val_imgs, test_imgs = split_images(imgs, train_r, val_r, args.seed)

        source_prefix = ""  # prefix to avoid collisions when merging sources
        n_train = copy_images(train_imgs, args.out / "train" / cls, source_prefix)
        n_val   = copy_images(val_imgs,   args.out / "val"   / cls, source_prefix)
        n_test  = copy_images(test_imgs,  args.out / "test"  / cls, source_prefix)

        stats[cls] = {"train": n_train, "val": n_val, "test": n_test, "total": len(imgs)}
        print(f"  [{cls}] total={len(imgs)}  train={n_train}  val={n_val}  test={n_test}")

    print("\n══ WRITING CONFIG ══════════════════════════════════════════════════")
    write_yaml(args.out, ALL_CLASSES)

    print("\n══ SUMMARY ═════════════════════════════════════════════════════════")
    total = sum(s["total"] for s in stats.values())
    print(f"  Classes processed:  {len(stats)} / {len(ALL_CLASSES)}")
    print(f"  Total images:       {total}")
    print(f"  Output directory:   {args.out.resolve()}")

    missing = [c for c in ALL_CLASSES if c not in stats]
    if missing:
        print(f"\n  ⚠️  Classes with NO data: {missing}")
        print("     These will not appear in training — add images manually or via augmentation.")

    print("\n✅ Preprocessing complete!")
    print(f"   Next step: python src/train.py --task classify --data {args.out} --epochs 10")


if __name__ == "__main__":
    main()
