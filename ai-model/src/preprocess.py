"""
Preprocessing script — Apple Disease & Rot Detection
Track A (Yacine)

Source: NVIDIA Fruits dataset (freshapples → healthy_fruit, rottenapples → rotten_fruit)

Output layout (data/processed/):
  train/
    healthy_fruit/
    rotten_fruit/
  val/
    healthy_fruit/
    rotten_fruit/
  test/
    healthy_fruit/
    rotten_fruit/
  data.yaml

Usage:
  python src/preprocess.py --nvidia data/raw/fruits
  python src/preprocess.py --nvidia data/raw/fruits --augment --clean
"""

import argparse
import random
import shutil
import sys
from pathlib import Path

import yaml
from PIL import Image, ImageEnhance, ImageOps

# ── Classes we actually have data for ────────────────────────────────────────
CLASSES = ["healthy_fruit", "rotten_fruit"]

# ── NVIDIA folder names → our class names ────────────────────────────────────
NVIDIA_CLASS_MAP = {
    "freshapples":  "healthy_fruit",
    "rottenapples": "rotten_fruit",
}

# ── Augmentation target: minimum images per class in train set ───────────────
MIN_TRAIN_IMAGES = 100


# ── Helpers ───────────────────────────────────────────────────────────────────

def collect_nvidia(nvidia_root: Path) -> dict[str, list[Path]]:
    """Collect all apple images from NVIDIA dataset (merges train + valid splits)."""
    result: dict[str, list[Path]] = {c: [] for c in CLASSES}

    if not nvidia_root.exists():
        print(f"[ERROR] NVIDIA path not found: {nvidia_root}")
        sys.exit(1)

    for split in ["train", "valid"]:
        for orig_cls, our_cls in NVIDIA_CLASS_MAP.items():
            folder = nvidia_root / split / orig_cls
            if not folder.exists():
                print(f"  [WARN] Folder not found: {folder}")
                continue
            imgs = list(folder.glob("*.png")) + list(folder.glob("*.jpg"))
            result[our_cls].extend(imgs)
            print(f"  [NVIDIA] {split}/{orig_cls} → {our_cls}: {len(imgs)} images")

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


def copy_images(images: list[Path], dest_dir: Path) -> int:
    """Copy images to dest_dir. Returns count copied."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    copied = 0
    for src in images:
        dest = dest_dir / src.name
        # Avoid filename collisions
        if dest.exists():
            stem, suffix = src.stem, src.suffix
            counter = 1
            while dest.exists():
                dest = dest_dir / f"{stem}_{counter}{suffix}"
                counter += 1
        shutil.copy2(src, dest)
        copied += 1
    return copied


def augment_images(src_images: list[Path], dest_dir: Path, target_count: int) -> int:
    """
    Generate augmented images from src_images until dest_dir has target_count images.
    Augmentations: horizontal flip, rotation, brightness, contrast, mirror.
    Returns number of augmented images created.
    """
    dest_dir.mkdir(parents=True, exist_ok=True)
    existing = len(list(dest_dir.glob("*.*")))
    needed = max(0, target_count - existing)

    if needed == 0:
        return 0

    augmentations = [
        lambda img: img.transpose(Image.FLIP_LEFT_RIGHT),
        lambda img: img.rotate(15, expand=False),
        lambda img: img.rotate(-15, expand=False),
        lambda img: img.rotate(10, expand=False),
        lambda img: ImageEnhance.Brightness(img).enhance(1.3),
        lambda img: ImageEnhance.Brightness(img).enhance(0.7),
        lambda img: ImageEnhance.Contrast(img).enhance(1.3),
        lambda img: ImageEnhance.Contrast(img).enhance(0.7),
        lambda img: img.transpose(Image.FLIP_TOP_BOTTOM),
        lambda img: ImageEnhance.Color(img).enhance(1.2),
    ]

    created = 0
    aug_cycle = 0

    while created < needed:
        src = src_images[created % len(src_images)]
        aug_fn = augmentations[aug_cycle % len(augmentations)]
        aug_cycle += 1

        try:
            img = Image.open(src).convert("RGB")
            aug_img = aug_fn(img)
            out_name = f"aug_{created:04d}_{src.stem}.jpg"
            out_path = dest_dir / out_name
            aug_img.save(out_path, "JPEG", quality=90)
            created += 1
        except Exception as e:
            print(f"  [WARN] Augmentation failed for {src.name}: {e}")

    return created


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
    print(f"  [OK] data.yaml written → {yaml_path}")


# ── Main ──────────────────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(description="Preprocess NVIDIA fruits dataset for YOLOv8-cls")
    parser.add_argument(
        "--nvidia",
        type=Path,
        default=Path("data/raw/fruits"),
        help="Path to NVIDIA fruits dataset root (contains train/ and valid/)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("data/processed"),
        help="Output directory (default: data/processed)",
    )
    parser.add_argument(
        "--split",
        type=float,
        nargs=3,
        default=[0.8, 0.1, 0.1],
        metavar=("TRAIN", "VAL", "TEST"),
        help="Train/val/test ratios (default: 0.8 0.1 0.1)",
    )
    parser.add_argument(
        "--augment",
        action="store_true",
        help=f"Augment minority classes to reach {MIN_TRAIN_IMAGES} train images each",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Delete data/processed before running (fresh start)",
    )
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def main():
    args = parse_args()
    train_r, val_r, test_r = args.split

    if abs(train_r + val_r + test_r - 1.0) > 1e-6:
        print("[ERROR] Split ratios must sum to 1.0")
        sys.exit(1)

    # Clean output folder if requested
    if args.clean and args.out.exists():
        shutil.rmtree(args.out)
        print(f"[CLEAN] Deleted {args.out}")

    print("\n══ COLLECTING IMAGES ══════════════════════════════════════════════")
    all_images = collect_nvidia(args.nvidia)

    print("\n══ SPLITTING & COPYING ═════════════════════════════════════════════")
    stats: dict[str, dict[str, int]] = {}

    for cls in CLASSES:
        imgs = all_images[cls]
        if not imgs:
            print(f"  [{cls}] No images — skipping")
            continue

        train_imgs, val_imgs, test_imgs = split_images(imgs, train_r, val_r, args.seed)
        n_train = copy_images(train_imgs, args.out / "train" / cls)
        n_val   = copy_images(val_imgs,   args.out / "val"   / cls)
        n_test  = copy_images(test_imgs,  args.out / "test"  / cls)

        stats[cls] = {"train": n_train, "val": n_val, "test": n_test, "total": len(imgs)}
        print(f"  [{cls}] total={len(imgs)}  train={n_train}  val={n_val}  test={n_test}")

    if args.augment:
        print("\n══ AUGMENTING MINORITY CLASSES ═════════════════════════════════════")
        for cls in CLASSES:
            if cls not in stats:
                continue
            n_train = stats[cls]["train"]
            if n_train < MIN_TRAIN_IMAGES:
                src_imgs = list((args.out / "train" / cls).glob("*.*"))
                created = augment_images(src_imgs, args.out / "train" / cls, MIN_TRAIN_IMAGES)
                print(f"  [{cls}] Added {created} augmented images → now {n_train + created} train images")
            else:
                print(f"  [{cls}] OK ({n_train} >= {MIN_TRAIN_IMAGES}) — no augmentation needed")

    print("\n══ WRITING CONFIG ══════════════════════════════════════════════════")
    write_yaml(args.out, CLASSES)

    print("\n══ SUMMARY ═════════════════════════════════════════════════════════")
    for cls, s in stats.items():
        aug_note = ""
        if args.augment and s["train"] < MIN_TRAIN_IMAGES:
            aug_note = f" → augmented to {MIN_TRAIN_IMAGES}"
        print(f"  {cls:<20} train={s['train']}{aug_note}  val={s['val']}  test={s['test']}")

    print(f"\n  Output: {args.out.resolve()}")
    print("\n✅ Preprocessing complete!")
    print(f"   Next: python src/train.py --task classify --data data/processed --epochs 10")


if __name__ == "__main__":
    main()
