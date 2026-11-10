from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class EntryBase(BaseModel):
    date: str = Field(..., description="Date formatted as YYYY-MM-DD")
    time: str = Field(..., description="Time formatted as HH:MM or HH:MM AM/PM")
    calories_kcal: float = Field(..., ge=0, description="Total Calories in kcal")
    protein_g: float = Field(..., ge=0, description="Total Protein in grams")
    fiber_g: Optional[float] = Field(default=0.0, ge=0, description="Total Fiber in grams")
    meal_type: Optional[str] = Field(default="Lunch", description="Meal category: Breakfast, Morning Snacks, Lunch, Evening Snacks, Dinner, Midnight Craving")
    source: str = Field(default="Manual", description="Source: Image, Text, or Manual")

class EntryCreate(EntryBase):
    pass

class EntryUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    calories_kcal: Optional[float] = Field(None, ge=0)
    protein_g: Optional[float] = Field(None, ge=0)
    fiber_g: Optional[float] = Field(None, ge=0)
    meal_type: Optional[str] = None
    source: Optional[str] = None

class EntryResponse(EntryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DailySummary(BaseModel):
    date: str
    total_calories_kcal: float
    total_protein_g: float
    entry_count: int
    entries: list[EntryResponse] = []

