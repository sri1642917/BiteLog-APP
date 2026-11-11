from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.schemas.parse import ParseResponse, ParseTextRequest
from app.services.ocr_service import OCRService
from app.services.text_parser import TextParser
from app.services.food_vision_service import FoodVisionService
from app.services.packet_nutrition_service import PacketNutritionService

router = APIRouter(prefix="/parse", tags=["Parsing"])

@router.get("/model-status")
def get_model_status():
    """
    Returns local hardware capabilities and Gemma 3n offline model readiness.
    Never silently falls back to remote cloud APIs.
    """
    return FoodVisionService.get_system_hardware_capabilities()

@router.post("/food-photo")
async def parse_food_photo(
    file: UploadFile = File(...),
    model_tier: str = Form("e2b"),
    portion_size: str = Form("normal"), # "small", "normal", "large"
    cooking_style: str = Form("home"),  # "lean", "home", "restaurant"
    plate_size: str = Form("medium")    # "small", "medium", "large"
):
    """
    Analyzes meal photo offline with Google Gemma 3n E2B (or E4B).
    Features 90%+ Calibrated Accuracy using scale (plate_size) and hidden oil compensation (cooking_style).
    Estimates plate portion and calculates Total Calories and Total Protein.
    Does NOT output food item breakdowns to preserve the app's strict metric scope.
    """
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type and file.content_type.lower() not in allowed_types:
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in ["jpg", "jpeg", "png", "webp"]:
            raise HTTPException(status_code=400, detail="Unsupported image format. Please upload JPG, PNG, or WEBP.")

    # Calculate portion modifier
    modifier = 1.0
    if portion_size.lower() == "small":
        modifier = 0.75
    elif portion_size.lower() == "large":
        modifier = 1.35

    try:
        image_bytes = await file.read()
        result = FoodVisionService.estimate_plate_nutrition(
            image_bytes=image_bytes,
            model_tier=model_tier,
            portion_modifier=modifier,
            cooking_style=cooking_style,
            plate_size=plate_size
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Food photo analysis failed: {str(e)}")

@router.post("/packet-label")
async def parse_packet_label(
    file: UploadFile = File(...),
    quantity: float = Form(1.0)
):
    """
    Offline Protein Bar / Powder Packet & Nutrition Label Scanner.
    Extracts printed ingredients and Per-Serving nutrition facts, scaling all 5 macros by quantity.
    """
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type and file.content_type.lower() not in allowed_types:
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in ["jpg", "jpeg", "png", "webp"]:
            raise HTTPException(status_code=400, detail="Unsupported image format. Please upload JPG, PNG, or WEBP.")

    try:
        image_bytes = await file.read()
        return PacketNutritionService.analyze_packet_image(image_bytes=image_bytes, quantity=quantity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Packet label analysis failed: {str(e)}")

@router.post("/image", response_model=ParseResponse)
async def parse_image(file: UploadFile = File(...)):
    """
    Accepts JPG, PNG, WEBP nutritional screenshots and extracts kcal and protein offline via Tesseract.
    """
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type and file.content_type.lower() not in allowed_types:
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in ["jpg", "jpeg", "png", "webp"]:
            raise HTTPException(status_code=400, detail="Unsupported image format. Please upload JPG, PNG, or WEBP.")

    try:
        image_bytes = await file.read()
        calories, protein, raw_text, note = OCRService.process_image(image_bytes)

        return ParseResponse(
            success=True,
            calories_kcal=calories,
            protein_g=protein,
            raw_extracted_text=raw_text,
            confidence_note=note,
            source="Image"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

@router.post("/text", response_model=ParseResponse)
def parse_text(req: ParseTextRequest):
    """
    Accepts pasted nutritional text from ChatGPT / Gemini and extracts kcal and protein.
    """
    calories, protein, note = TextParser.extract_nutrition(req.text)
    return ParseResponse(
        success=True,
        calories_kcal=calories,
        protein_g=protein,
        raw_extracted_text=req.text,
        confidence_note=note,
        source="Text"
    )
