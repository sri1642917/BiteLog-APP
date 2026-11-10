from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class DailyTrendPoint(BaseModel):
    date: str
    label: str # e.g. "Mon", "May 10", "Week 1", etc.
    calories_kcal: float
    protein_g: float
    fiber_g: Optional[float] = 0.0

class ReportResponse(BaseModel):
    period: str # day, weekly, monthly, quarterly, 6months, yearly
    start_date: str
    end_date: str
    calorie_target: Optional[float] = 2200.0
    protein_target: Optional[float] = 100.0
    fiber_target: Optional[float] = 30.0
    total_calories: float
    total_protein: float
    total_fiber: Optional[float] = 0.0
    average_daily_calories: float
    average_daily_protein: float
    average_daily_fiber: Optional[float] = 0.0
    calorie_target_achievement_pct: float
    protein_target_achievement_pct: float
    overall_achievement_pct: Optional[float] = 90.0
    days_logged: int
    total_days_in_period: int
    daily_trends: List[DailyTrendPoint]
    detailed_entries: Optional[List[Dict[str, Any]]] = []
    daily_logs_table: Optional[List[Dict[str, Any]]] = []

