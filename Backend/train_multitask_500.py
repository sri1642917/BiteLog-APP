import argparse
import json
from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image


class MultiTaskFoodDataset(Dataset):
    def __init__(self, dataset_dir: Path, catalog: dict, transform=None):
        """
        Task: Initialize dataset of food images paired with class index and 5 macro targets.
        input_params:
            dataset_dir (Path): Root directory containing <dish_id>/*.jpg folders.
            catalog (dict): 500-food nutrition catalog mapping dish_id to macros.
            transform (callable, optional): Torchvision image transform pipeline.
        output_params:
            None
        returns:
            None
        raises:
            None
        """
        self.samples = []
        self.transform = transform
        self.classes = sorted([d.name for d in dataset_dir.iterdir() if d.is_dir() and d.name in catalog])
        self.class_to_idx = {c: i for i, c in enumerate(self.classes)}
        for c in self.classes:
            m = catalog[c]
            macros = torch.tensor(
                [m["kcal"] / 500.0, m["protein_g"] / 50.0, m["carbs_g"] / 100.0, m["fats_g"] / 50.0, m["fiber_g"] / 20.0],
                dtype=torch.float32,
            )
            for img_path in sorted((dataset_dir / c).glob("*.jpg")):
                self.samples.append((img_path, self.class_to_idx[c], macros))

    def __len__(self):
        """
        Task: Return total number of image samples in the dataset.
        input_params:
            None
        output_params:
            None
        returns:
            int: Sample count.
        raises:
            None
        """
        return len(self.samples)

    def __getitem__(self, idx):
        """
        Task: Load and transform an image along with its class label and normalized macro vector.
        input_params:
            idx (int): Sample index.
        output_params:
            tuple: (image_tensor, class_idx, macro_tensor)
        returns:
            tuple: (torch.Tensor, int, torch.Tensor)
        raises:
            OSError: If the image file cannot be opened.
        """
        img_path, cls_idx, macros = self.samples[idx]
        img = Image.open(img_path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, cls_idx, macros


class MultiTaskMobileNetV3(nn.Module):
    def __init__(self, num_classes: int):
        """
        Task: Build MobileNetV3-Small backbone with parallel classification and 5-macro regression heads.
        input_params:
            num_classes (int): Number of food classes.
        output_params:
            None
        returns:
            None
        raises:
            None
        """
        super().__init__()
        base = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
        self.features = base.features
        self.avgpool = base.avgpool
        in_features = 576
        self.class_head = nn.Sequential(nn.Linear(in_features, 512), nn.Hardswish(), nn.Dropout(0.2), nn.Linear(512, num_classes))
        self.macro_head = nn.Sequential(nn.Linear(in_features, 128), nn.Hardswish(), nn.Linear(128, 5))

    def forward(self, x):
        """
        Task: Forward pass returning class logits and predicted [kcal, protein, carbs, fats, fiber].
        input_params:
            x (torch.Tensor): Batch of input images (B, 3, 224, 224).
        output_params:
            tuple: (class_logits, macro_preds)
        returns:
            tuple[torch.Tensor, torch.Tensor]: Class logits and macro predictions.
        raises:
            None
        """
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        return self.class_head(x), self.macro_head(x)


def train_multitask(data_dir: str, catalog_path: str, epochs: int = 10, batch_size: int = 32):
    """
    Task: Train MobileNetV3-Small in parallel on food class + kcal/protein/carbs/fats/fiber.
    input_params:
        data_dir (str): Path to dataset/train directory.
        catalog_path (str): Path to food_nutrition_500.json.
        epochs (int): Number of training epochs.
        batch_size (int): Training batch size.
    output_params:
        None
    returns:
        None
    raises:
        FileNotFoundError: If catalog_path or data_dir does not exist.
    """
    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    tfm = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    ds = MultiTaskFoodDataset(Path(data_dir), catalog, transform=tfm)
    loader = DataLoader(ds, batch_size=batch_size, shuffle=True)

    model = MultiTaskMobileNetV3(num_classes=len(ds.classes))
    ce_loss = nn.CrossEntropyLoss()
    reg_loss = nn.SmoothL1Loss()
    opt = optim.AdamW(model.parameters(), lr=1e-3)

    for epoch in range(1, epochs + 1):
        model.train()
        correct = 0
        total = 0
        total_loss = 0.0
        for imgs, labels, macros in loader:
            opt.zero_grad()
            logits, pred_macros = model(imgs)
            loss = ce_loss(logits, labels) + 2.0 * reg_loss(pred_macros, macros)
            loss.backward()
            opt.step()
            total_loss += loss.item()
            correct += (logits.argmax(dim=1) == labels).sum().item()
            total += labels.size(0)
        acc = round((correct / max(total, 1)) * 100, 2)
        print(f"Epoch [{epoch}/{epochs}] - Loss: {total_loss/max(len(loader),1):.4f} - Class Acc: {acc}%")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", default="./dataset/train")
    parser.add_argument("--catalog", default="./food_nutrition_500.json")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=32)
    args = parser.parse_args()
    train_multitask(args.data_dir, args.catalog, args.epochs, args.batch_size)
