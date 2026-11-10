from typing import Optional
from pydantic import BaseModel

class ParseTextRequest(BaseModel):
    text: str

class ParseResponse(BaseModel):
    success: bool
    calories_kcal: Optional[float] = None
    protein_g: Optional[float] = None
    raw_extracted_text: Optional[str] = None
    confidence_note: Optional[str] = None
    source: str = "Text" # "Image" or "Text"

