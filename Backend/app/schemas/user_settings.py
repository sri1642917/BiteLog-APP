from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class UserSettingsBase(BaseModel):
    date_of_birth: str = Field(default="1995-01-01")
    gender: str = Field(default="male")
    height_cm: float = Field(default=175.0, gt=0)
    current_weight_kg: float = Field(default=72.5, gt=0)
    target_weight_kg: float = Field(default=65.0, gt=0)
    activity_level: str = Field(default="moderate")
    calorie_target: int = Field(default=2200, gt=0)
    protein_target: int = Field(default=100, gt=0)
    preferred_units: str = Field(default="metric")
    target_duration_weeks: int = Field(default=16, gt=0)

class UserSettingsUpdate(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    current_weight_kg: Optional[float] = None
    target_weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    calorie_target: Optional[int] = None
    protein_target: Optional[int] = None
    preferred_units: Optional[str] = None
    target_duration_weeks: Optional[int] = None

class UserSettingsResponse(UserSettingsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

