import calendar
from datetime import date
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entry import Entry
from app.schemas.entry import EntryResponse

router = APIRouter(prefix="/calendar", tags=["Calendar"])

@router.get("/month")
def get_month_calendar(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    today = date.today()
    target_year = year or today.year
    target_month = month or today.month

    # Number of days in month
    num_days = calendar.monthrange(target_year, target_month)[1]
    start_date = f"{target_year:04d}-{target_month:02d}-01"
    end_date = f"{target_year:04d}-{target_month:02d}-{num_days:02d}"

    # Query all entries in this month
    entries = db.query(Entry).filter(
        Entry.date >= start_date,
        Entry.date <= end_date
    ).all()

    # Aggregate by day
    days_map: Dict[str, Dict[str, Any]] = {}
    for day_num in range(1, num_days + 1):
        d_str = f"{target_year:04d}-{target_month:02d}-{day_num:02d}"
        days_map[d_str] = {
            "date": d_str,
            "day": day_num,
            "has_entries": False,
            "total_calories": 0.0,
            "total_protein": 0.0,
            "entry_count": 0,
        }

    for e in entries:
        if e.date in days_map:
            days_map[e.date]["has_entries"] = True
            days_map[e.date]["total_calories"] += e.calories_kcal
            days_map[e.date]["total_protein"] += e.protein_g
            days_map[e.date]["entry_count"] += 1

    # Round totals
    for d_str, info in days_map.items():
        if info["has_entries"]:
            info["total_calories"] = round(info["total_calories"], 1)
            info["total_protein"] = round(info["total_protein"], 1)

    month_name = calendar.month_name[target_month]

    return {
        "year": target_year,
        "month": target_month,
        "month_name": month_name,
        "days": list(days_map.values()),
        "first_weekday": calendar.weekday(target_year, target_month, 1), # 0 = Monday
    }

@router.get("/day-details")
def get_day_details(
    date_str: str = Query(..., alias="date", description="YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    entries = db.query(Entry).filter(Entry.date == date_str).order_by(Entry.id.desc()).all()
    total_cal = sum(e.calories_kcal for e in entries)
    total_prot = sum(e.protein_g for e in entries)

    return {
        "date": date_str,
        "has_entries": len(entries) > 0,
        "total_calories": round(total_cal, 1),
        "total_protein": round(total_prot, 1),
        "entry_count": len(entries),
        "entries": [
            {
                "id": e.id,
                "date": e.date,
                "time": e.time,
                "calories_kcal": e.calories_kcal,
                "protein_g": e.protein_g,
                "carbs_g": getattr(e, 'carbs_g', 0.0) or 0.0,
                "fats_g": getattr(e, 'fats_g', 0.0) or 0.0,
                "fiber_g": getattr(e, 'fiber_g', 0.0) or 0.0,
                "meal_type": getattr(e, 'meal_type', 'Lunch') or 'Lunch',
                "source": e.source,
                "created_at": e.created_at.isoformat() if e.created_at else None
            }
            for e in entries
        ]
    }

