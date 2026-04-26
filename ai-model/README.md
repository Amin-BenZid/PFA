# 🧠 AI Model — Track A

Apple disease detection & rotten apple identification using YOLOv8 + TensorFlow.

## Setup

```bash
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Folder Structure

```
ai-model/
├── data/
│   ├── raw/           # Original downloaded datasets (gitignored)
│   ├── processed/     # After cleaning + train/val/test split
│   └── annotations/   # YOLO format labels (.txt)
├── notebooks/         # Jupyter exploration & experiments
├── src/
│   ├── train.py       # Training script
│   ├── predict.py     # Inference script
│   ├── server.py      # FastAPI service exposing /predict
│   └── utils.py
├── models/            # Saved weights (gitignored, push to S3)
├── tests/
├── requirements.txt
└── Dockerfile
```

## Workflow

1. **Explore data** → `notebooks/01_data_exploration.ipynb`
2. **Train baseline** → `python src/train.py --config configs/baseline.yaml`
3. **Evaluate** → `notebooks/02_evaluation.ipynb`
4. **Serve** → `python src/server.py` (exposes `POST /predict` per [API Contract](../docs/api-contract.md))

## Datasets

- [Plant Pathology 2021 (Kaggle FGVC8)](https://www.kaggle.com/c/plant-pathology-2021-fgvc8)
- [PlantVillage](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset)
- [Roboflow Universe — apple rot](https://universe.roboflow.com/)

## Targets

- mAP@0.5 ≥ 0.75 on validation set
- Inference time < 500ms per image (CPU) / < 100ms (GPU)
- Model size < 50MB (use YOLOv8n or YOLOv8s)
