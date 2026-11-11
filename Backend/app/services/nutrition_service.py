from datetime import date, datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entry import Entry
from app.models.user_settings import UserSettings
from app.models.weight import WeightHistory

class NutritionService:
    @staticmethod
    def get_dashboard_summary(db: Session, target_date: str = None) -> Dict[str, Any]:
        if not target_date:
            target_date = date.today().isoformat()

        settings = db.query(UserSettings).first()
        if not settings:
            # Fallback default
            calorie_target = 2200
            protein_target = 100
            current_weight = 72.5
            target_weight = 65.0
        else:
            calorie_target = settings.calorie_target
            protein_target = settings.protein_target
            current_weight = settings.current_weight_kg
            target_weight = settings.target_weight_kg

        # Check latest weight entry if recorded
        latest_weight_entry = db.query(WeightHistory).order_by(WeightHistory.date.desc(), WeightHistory.id.desc()).first()
        if latest_weight_entry:
            current_weight = latest_weight_entry.weight_kg

        # Query entries for target_date
        today_entries = db.query(Entry).filter(Entry.date == target_date).order_by(Entry.id.desc()).all()

        total_calories = sum(e.calories_kcal for e in today_entries)
        total_protein = sum(e.protein_g for e in today_entries)
        entry_count = len(today_entries)

        last_entry_time = today_entries[0].time if today_entries else "None"

        # Calories calculations
        cal_pct = round((total_calories / calorie_target * 100), 1) if calorie_target > 0 else 0
        cal_remaining = max(0.0, calorie_target - total_calories)
        cal_exceeded = max(0.0, total_calories - calorie_target)

        # Protein calculations
        protein_pct = round((total_protein / protein_target * 100), 1) if protein_target > 0 else 0
        protein_remaining = max(0.0, protein_target - total_protein)
        protein_exceeded = max(0.0, total_protein - protein_target)

        # Weight progress calculation
        # Assume initial starting weight was set or first recorded weight
        first_weight_entry = db.query(WeightHistory).order_by(WeightHistory.date.asc(), WeightHistory.id.asc()).first()
        start_weight = first_weight_entry.weight_kg if first_weight_entry else (current_weight + 5.0)

        total_to_lose = start_weight - target_weight
        lost_so_far = start_weight - current_weight
        if total_to_lose > 0:
            weight_progress_pct = max(0, min(100, round((lost_so_far / total_to_lose) * 100)))
        else:
            weight_progress_pct = 100 if current_weight <= target_weight else 0

        # Recent entries (last 5 entries overall)
        recent_entries = db.query(Entry).order_by(Entry.date.desc(), Entry.id.desc()).limit(5).all()

        return {
            "date": target_date,
            "today_calories": {
                "total": round(total_calories, 1),
                "target": calorie_target,
                "percentage": cal_pct,
                "remaining": round(cal_remaining, 1),
                "exceeded": round(cal_exceeded, 1),
            },
            "today_protein": {
                "total": round(total_protein, 1),
                "target": protein_target,
                "percentage": protein_pct,
                "remaining": round(protein_remaining, 1),
                "exceeded": round(protein_exceeded, 1),
            },
            "weight": {
                "current": current_weight,
                "target": target_weight,
                "progress_percentage": weight_progress_pct,
            },
            "entries_summary": {
                "count": entry_count,
                "last_entry_time": last_entry_time,
            },
            "recent_entries": [
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
                }
                for e in recent_entries
            ]
        }

    @staticmethod
    def get_daily_intake_overview(db: Session, timeframe: str = "This Week") -> List[Dict[str, Any]]:
        """
        Returns day-by-day intake overview for the bar chart.
        'This Week' returns Mon - Sun for current week.
        """
        today = date.today()
        # Find Monday of this week
        start_of_week = today - timedelta(days=today.weekday())

        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        result = []

        for i, day_name in enumerate(days):
            d = start_of_week + timedelta(days=i)
            d_str = d.isoformat()

            entries = db.query(Entry).filter(Entry.date == d_str).all()
            total_cal = sum(e.calories_kcal for e in entries)
            total_prot = sum(e.protein_g for e in entries)

            result.append({
                "day": day_name,
                "date": d_str,
                "calories": round(total_cal, 1),
                "protein": round(total_prot, 1)
            })

        return result

