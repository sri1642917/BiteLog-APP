from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entry import Entry
from app.models.weight import WeightHistory
from app.schemas.entry import EntryCreate, EntryUpdate, EntryResponse, DailySummary
from app.services.nutrition_service import NutritionService

router = APIRouter(prefix="/entries", tags=["Entries"])

class CleanRangeRequest(BaseModel):
    from_date: str = Field(..., description="Start date YYYY-MM-DD")
    to_date: str = Field(..., description="End date YYYY-MM-DD")
    clean_entries: bool = Field(default=True, description="Clean calorie and protein entries")
    clean_weights: bool = Field(default=True, description="Clean weight history logs")

@router.get("/dashboard-summary")
def get_dashboard_summary(target_date: Optional[str] = None, db: Session = Depends(get_db)):
    return NutritionService.get_dashboard_summary(db, target_date)

@router.get("/intake-overview")
def get_intake_overview(timeframe: str = "This Week", db: Session = Depends(get_db)):
    return NutritionService.get_daily_intake_overview(db, timeframe)

@router.get("/clean-range/preview")
def preview_clean_range(
    from_date: str = Query(..., description="Start date YYYY-MM-DD"),
    to_date: str = Query(..., description="End date YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    if from_date > to_date:
        raise HTTPException(status_code=400, detail="From Date cannot be later than To Date")

    entries_count = db.query(Entry).filter(Entry.date >= from_date, Entry.date <= to_date).count()
    weights_count = db.query(WeightHistory).filter(WeightHistory.date >= from_date, WeightHistory.date <= to_date).count()

    return {
        "from_date": from_date,
        "to_date": to_date,
        "entries_count": entries_count,
        "weights_count": weights_count,
    }

@router.post("/clean-range")
def clean_data_by_range(req: CleanRangeRequest, db: Session = Depends(get_db)):
    if req.from_date > req.to_date:
        raise HTTPException(status_code=400, detail="From Date cannot be later than To Date")

    deleted_entries = 0
    deleted_weights = 0

    if req.clean_entries:
        query_e = db.query(Entry).filter(Entry.date >= req.from_date, Entry.date <= req.to_date)
        deleted_entries = query_e.count()
        query_e.delete(synchronize_session=False)

    if req.clean_weights:
        query_w = db.query(WeightHistory).filter(WeightHistory.date >= req.from_date, WeightHistory.date <= req.to_date)
        deleted_weights = query_w.count()
        query_w.delete(synchronize_session=False)

    db.commit()

    return {
        "success": True,
        "from_date": req.from_date,
        "to_date": req.to_date,
        "deleted_entries": deleted_entries,
        "deleted_weights": deleted_weights,
        "message": f"Successfully deleted {deleted_entries} entries and {deleted_weights} weight logs between {req.from_date} and {req.to_date}."
    }

@router.get("", response_model=List[EntryResponse])
def get_entries(
    date: Optional[str] = Query(None, description="Filter by YYYY-MM-DD"),
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Entry)
    if date:
        query = query.filter(Entry.date == date)
    return query.order_by(Entry.date.desc(), Entry.id.desc()).offset(offset).limit(limit).all()

@router.post("", response_model=EntryResponse)
def create_entry(entry_in: EntryCreate, db: Session = Depends(get_db)):
    # Duplicate prevention: check if an identical entry was added in the last 15 seconds
    cutoff = datetime.utcnow() - timedelta(seconds=15)
    recent_dup = db.query(Entry).filter(
        Entry.date == entry_in.date,
        Entry.calories_kcal == entry_in.calories_kcal,
        Entry.protein_g == entry_in.protein_g,
        Entry.time == entry_in.time,
        Entry.created_at >= cutoff
    ).order_by(Entry.id.desc()).first()
    
    if recent_dup:
        raise HTTPException(status_code=409, detail="Duplicate entry detected. Entry was just saved.")

    db_entry = Entry(
        date=entry_in.date,
        time=entry_in.time,
        calories_kcal=entry_in.calories_kcal,
        protein_g=entry_in.protein_g,
        fiber_g=entry_in.fiber_g if entry_in.fiber_g is not None else 0.0,
        meal_type=entry_in.meal_type or "Lunch",
        source=entry_in.source,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/{entry_id}", response_model=EntryResponse)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@router.put("/{entry_id}", response_model=EntryResponse)
def update_entry(entry_id: int, entry_in: EntryUpdate, db: Session = Depends(get_db)):
    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    update_data = entry_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(entry, field, val)

    entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"success": True, "message": f"Entry {entry_id} deleted"}
