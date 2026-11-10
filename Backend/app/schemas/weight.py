from datetime import datetime
from pydantic import BaseModel, Field

class WeightBase(BaseModel):
    date: str = Field(..., description="Date formatted as YYYY-MM-DD")
    weight_kg: float = Field(..., gt=0, description="Weight in kilograms")

class WeightCreate(WeightBase):
    pass

class WeightResponse(WeightBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class WeightStats(BaseModel):
    current_weight_kg: float
    target_weight_kg: float
    progress_percentage: float
    bmi: float
    bmr: float
    tdee: float
    recommended_calories: int
    recommended_protein: int
    target_date: str
    days_remaining: int

