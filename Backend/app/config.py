import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("NUTRITRACK_DATA_DIR", BASE_DIR / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "nutritrack.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Tesseract executable detection
def get_tesseract_cmd() -> str:
    env_path = os.environ.get("TESSERACT_CMD")
    if env_path and Path(env_path).exists():
        return env_path
    
    found = shutil.which("tesseract")
    if found:
        return found
        
    candidates = [
        "/opt/homebrew/bin/tesseract",
        "/usr/local/bin/tesseract",
        "/usr/bin/tesseract",
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
    ]
    for c in candidates:
        if Path(c).exists():
            return c
    return "tesseract"

TESSERACT_CMD = get_tesseract_cmd()

