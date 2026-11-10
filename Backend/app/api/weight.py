from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.weight import WeightHistory
from app.models.user_settings import UserSettings
from app.schemas.weight import WeightCreate, WeightResponse
from app.services.weight_service import WeightService

router = APIRouter(prefix="/weight", tags=["Weight"])

@router.get("/stats")
def get_weight_stats(db: Session = Depends(get_db)):
    return WeightService.get_weight_stats(db)

@router.get("/history")
def get_weight_history(range_filter: str = "This Month", db: Session = Depends(get_db)):
    return WeightService.get_weight_history_points(db, range_filter)

@router.post("/log", response_model=WeightResponse)
def log_weight(weight_in: WeightCreate, db: Session = Depends(get_db)):
    # Check if entry already exists for this date, if so update it
    existing = db.query(WeightHistory).filter(WeightHistory.date == weight_in.date).first()
    if existing:
        existing.weight_kg = weight_in.weight_kg
        record = existing
    else:
        record = WeightHistory(date=weight_in.date, weight_kg=weight_in.weight_kg)
        db.add(record)

    # Also update current_weight_kg in UserSettings
    settings = db.query(UserSettings).first()
    if settings:
        settings.current_weight_kg = weight_in.weight_kg
        settings.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record

