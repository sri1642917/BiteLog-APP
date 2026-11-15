"""
BiteLog Future Dataset Training & ONNX Export Pipeline (Plug-and-Play)
----------------------------------------------------------------------
Trains a lightweight MobileNetV3-Small vision classifier on your custom food dataset:
  dataset/
    train/
      vada_sambar/*.jpg
      idli_sambar/*.jpg
      masala_dosa/*.jpg
      chicken_biryani/*.jpg
      ...
    val/
      ...

And exports:
  1. ../Frontend/public/models/food_classifier.onnx  (Quantized mobile-ready ONNX model)
  2. ../Frontend/public/models/class_map.json        (Class index -> Dish ID mapping)

Usage (when you have a dataset ready):
  python3 train_food_model.py --data_dir ./dataset --epochs 15 --batch_size 32
"""

import argparse
import json
from pathlib import Path


def train_and_export(data_dir: str, output_dir: str, epochs: int = 15, batch_size: int = 32, lr: float = 1e-3):
    try:
        import torch
        import torch.nn as nn
        import torch.optim as optim
        from torchvision import datasets, models, transforms
    except ImportError:
        print("Install PyTorch & Torchvision first: pip install torch torchvision onnx")
        return

    data_path = Path(data_dir)
    train_dir = data_path / "train"
    val_dir = data_path / "val"

    if not train_dir.exists():
        print(f"Dataset directory not found at {train_dir}.")
        print("Create dataset/train/<dish_id>/*.jpg folders and re-run this script.")
        return

    transform_train = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    transform_val = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    train_dataset = datasets.ImageFolder(str(train_dir), transform=transform_train)
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

    val_loader = None
    if val_dir.exists():
        val_dataset = datasets.ImageFolder(str(val_dir), transform=transform_val)
        val_loader = torch.utils.data.DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    num_classes = len(train_dataset.classes)
    print(f"Detected {num_classes} food classes: {train_dataset.classes}")

    device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels).item()
            total += labels.size(0)

        train_acc = (correct / max(1, total)) * 100.0
        print(f"Epoch [{epoch + 1}/{epochs}] - Loss: {running_loss / max(1, total):.4f} - Train Acc: {train_acc:.2f}%")

        if val_loader:
            model.eval()
            val_correct = 0
            val_total = 0
            with torch.no_grad():
                for inputs, labels in val_loader:
                    inputs, labels = inputs.to(device), labels.to(device)
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    val_correct += torch.sum(preds == labels).item()
                    val_total += labels.size(0)
            print(f"  -> Validation Accuracy: {(val_correct / max(1, val_total)) * 100.0:.2f}%")

    # Export to ONNX + class_map.json for Mobile WebView / APK
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    class_map = {str(idx): cls_name for idx, cls_name in enumerate(train_dataset.classes)}
    with open(out_path / "class_map.json", "w") as f:
        json.dump(class_map, f, indent=2)

    model.eval()
    model.cpu()
    dummy_input = torch.randn(1, 3, 224, 224)
    onnx_file = out_path / "food_classifier.onnx"
    torch.onnx.export(
        model,
        dummy_input,
        str(onnx_file),
        input_names=["image"],
        output_names=["logits"],
        opset_version=13,
    )
    print(f"Successfully exported ONNX model to {onnx_file} and class_map.json!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train BiteLog Offline Food Classifier & Export to ONNX")
    parser.add_argument("--data_dir", type=str, default="./dataset", help="Path to dataset directory")
    parser.add_argument("--output_dir", type=str, default="../Frontend/public/models", help="Output folder for ONNX")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch_size", type=int, default=32)
    args = parser.parse_args()
    train_and_export(args.data_dir, args.output_dir, args.epochs, args.batch_size)

