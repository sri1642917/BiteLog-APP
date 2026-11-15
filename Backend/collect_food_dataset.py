import json
import os
import time
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path
from PIL import Image

DATASET_DIR = Path(__file__).parent / "dataset" / "train"
CATALOG_PATH = Path(__file__).parent / "food_nutrition_100.json"
IMAGES_PER_CLASS = 5
USER_AGENT = "BiteLogDatasetCollector/1.0 (https://github.com/sri1642917/BiteLog-APP)"


def fetch_wikimedia_images(query: str, limit: int = 8):
    encoded = urllib.parse.quote(query)
    url = (
        f"https://commons.wikimedia.org/w/api.php?"
        f"action=query&generator=search&gsrsearch={encoded}&gsrnamespace=6"
        f"&gsrlimit={limit}&prop=imageinfo&iiprop=url|mime&iiurlwidth=512&format=json"
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    pages = data.get("query", {}).get("pages", {})
    urls = []
    for page in pages.values():
        info = (page.get("imageinfo") or [{}])[0]
        mime = info.get("mime", "")
        if mime in ("image/jpeg", "image/png", "image/webp"):
            thumb = info.get("thumburl") or info.get("url")
            if thumb:
                urls.append(thumb)
    return urls


def download_and_validate(url: str, out_path: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=15) as resp:
        raw = resp.read()
    img = Image.open(BytesIO(raw)).convert("RGB")
    if img.width < 64 or img.height < 64:
        return False
    img = img.resize((224, 224), Image.Resampling.LANCZOS)
    img.save(out_path, format="JPEG", quality=90)
    return True


def main():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    total_downloaded = 0
    classes_ready = 0

    for idx, (dish_id, meta) in enumerate(catalog.items(), 1):
        dish_dir = DATASET_DIR / dish_id
        dish_dir.mkdir(parents=True, exist_ok=True)
        existing = list(dish_dir.glob("*.jpg"))
        if len(existing) >= IMAGES_PER_CLASS:
            classes_ready += 1
            total_downloaded += len(existing)
            continue

        query = meta.get("query", dish_id.replace("_", " "))
        try:
            urls = fetch_wikimedia_images(query, limit=IMAGES_PER_CLASS + 4)
        except Exception as e:
            print(f"[{idx}/100] {dish_id}: search failed ({e})")
            urls = []

        saved = len(existing)
        for j, u in enumerate(urls):
            if saved >= IMAGES_PER_CLASS:
                break
            out_file = dish_dir / f"{dish_id}_{saved + 1}.jpg"
            try:
                if download_and_validate(u, out_file):
                    saved += 1
            except Exception:
                continue
            time.sleep(0.15)

        if saved > 0:
            classes_ready += 1
        total_downloaded += saved
        print(f"[{idx}/100] {dish_id}: {saved} images")

    print(f"DONE: {classes_ready}/100 classes populated, {total_downloaded} total images.")


if __name__ == "__main__":
    main()

