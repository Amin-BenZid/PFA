"""
One-time script: copies apple images from the external drive
into ai-model/data/raw/ so the project works without the drive.

Run from the PFA/ root:
    python scripts/copy_raw_data.py
"""

import shutil
from pathlib import Path

# ── Source (external drive) ───────────────────────────────────────────────────
NVIDIA_SRC = Path(r"E:\NVIDIA TRAINING ICME\data\fruits")

# ── Destination (inside the project) ─────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
RAW_DEST = PROJECT_ROOT / "ai-model" / "data" / "raw" / "fruits"

# Only copy apple-relevant classes (skip banana, orange)
APPLE_CLASSES = ["freshapples", "rottenapples"]
SPLITS = ["train", "valid"]

# ─────────────────────────────────────────────────────────────────────────────

def main():
    if not NVIDIA_SRC.exists():
        print(f"ERROR: Source not found: {NVIDIA_SRC}")
        print("Make sure the external drive is plugged in for this one-time copy.")
        return

    total_copied = 0

    for split in SPLITS:
        for cls in APPLE_CLASSES:
            src_folder = NVIDIA_SRC / split / cls
            dst_folder = RAW_DEST / split / cls

            if not src_folder.exists():
                print(f"  SKIP (not found): {src_folder}")
                continue

            dst_folder.mkdir(parents=True, exist_ok=True)
            images = list(src_folder.glob("*.png")) + list(src_folder.glob("*.jpg"))

            for img in images:
                dest = dst_folder / img.name
                if not dest.exists():  # skip already-copied files
                    shutil.copy2(img, dest)
                    total_copied += 1

            print(f"  ✅ {split}/{cls}  →  {dst_folder}  ({len(images)} images)")

    print(f"\nDone! {total_copied} images copied to {RAW_DEST}")
    print("\nNext step — run preprocessing:")
    print(f"  cd ai-model")
    print(f"  python src/preprocess.py --nvidia data/raw/fruits")


if __name__ == "__main__":
    main()
