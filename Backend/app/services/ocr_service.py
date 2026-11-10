import io
from typing import Tuple, Optional
import numpy as np
from PIL import Image
import cv2
import pytesseract
from app.config import TESSERACT_CMD
from app.services.text_parser import TextParser

# Configure tesseract executable path
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

class OCRService:
    @staticmethod
    def preprocess_image(image_bytes: bytes) -> np.ndarray:
        # Load image via PIL to support various formats (WEBP, PNG, JPG)
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(pil_img)

        # Convert to OpenCV BGR then Grayscale
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

        # Resize if image is too small for accurate OCR
        h, w = gray.shape[:2]
        if w < 1000:
            scale = 1000.0 / w
            gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

        # Contrast enhancement using CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # Bilateral filter to reduce noise while keeping edges sharp
        filtered = cv2.bilateralFilter(enhanced, 9, 75, 75)

        return filtered

    @classmethod
    def process_image(cls, image_bytes: bytes) -> Tuple[Optional[float], Optional[float], str, str]:
        """
        Runs local OCR on the uploaded image and extracts kcal and protein.
        Returns: (calories_kcal, protein_g, raw_text, note)
        """
        try:
            processed_cv = cls.preprocess_image(image_bytes)

            # OCR with standard Page Segmentation Mode (PSM 6: Assume a single uniform block of text or PSM 3: Fully automatic)
            custom_config = r"--oem 3 --psm 6"
            raw_text = pytesseract.image_to_string(processed_cv, config=custom_config)

            # If raw_text is short or missed key words, attempt default PSM 3
            if not raw_text.strip() or ("calor" not in raw_text.lower() and "protein" not in raw_text.lower()):
                raw_text_fallback = pytesseract.image_to_string(processed_cv, config=r"--oem 3 --psm 3")
                if len(raw_text_fallback.strip()) > len(raw_text.strip()):
                    raw_text = raw_text_fallback

            # If still nothing, also try on raw grayscale directly
            if not raw_text.strip():
                pil_img = Image.open(io.BytesIO(image_bytes)).convert("L")
                raw_text = pytesseract.image_to_string(pil_img)

            calories, protein, note = TextParser.extract_nutrition(raw_text)
            return calories, protein, raw_text.strip(), note

        except Exception as e:
            return None, None, "", f"OCR Processing error: {str(e)}"

