import json
import shutil
from pathlib import Path
from PIL import Image
import torch
import torchvision.transforms as T
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights

DATASET_DIR = Path(__file__).parent / "dataset" / "train"
MISMATCH_DIR = Path(__file__).parent / "dataset" / "mismatches"
CATALOG_PATH = Path(__file__).parent / "food_nutrition_100.json"
REPORT_PATH = Path(__file__).parent / "benchmark_report.json"


def run_benchmark():
    """
    Task: Benchmark MobileNetV3-Small on all 100 food classes and quarantine mismatches.
    input_params:
        None
    output_params:
        report (dict): Accuracy metrics and mismatch count written to benchmark_report.json.
    returns:
        None
    raises:
        FileNotFoundError: If food_nutrition_100.json or dataset/train is missing.
    """
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    MISMATCH_DIR.mkdir(parents=True, exist_ok=True)
    weights = MobileNet_V3_Small_Weights.DEFAULT
    model = mobilenet_v3_small(weights=weights)
    model.eval()
    categories = weights.meta["categories"]
    preprocess = T.Compose([
        T.Resize((224, 224)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    total = 0
    mobilenet_correct = 0
    mismatches = 0

    for dish_dir in sorted(DATASET_DIR.iterdir()):
        if not dish_dir.is_dir():
            continue
        dish_id = dish_dir.name
        if dish_id not in catalog:
            continue
        dish_tokens = set(dish_id.lower().replace("_", " ").split())
        for img_path in sorted(dish_dir.glob("*.jpg")):
            total += 1
            try:
                img = Image.open(img_path).convert("RGB")
                tensor = preprocess(img).unsqueeze(0)
                with torch.no_grad():
                    logits = model(tensor)
                    pred_idx = int(logits.argmax(dim=1).item())
                pred_label = categories[pred_idx].lower()
                matched = any(tok in pred_label for tok in dish_tokens if len(tok) > 2)
                if matched:
                    mobilenet_correct += 1
                else:
                    mismatches += 1
                    target_dir = MISMATCH_DIR / dish_id
                    target_dir.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(img_path, target_dir / img_path.name)
            except Exception:
                continue

    acc = round((mobilenet_correct / total) * 100, 2) if total else 0.0
    report = {
        "total_images": total,
        "mobilenet_baseline_correct": mobilenet_correct,
        "mobilenet_baseline_accuracy_pct": acc,
        "mismatches_quarantined": mismatches,
    }
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    run_benchmark()

