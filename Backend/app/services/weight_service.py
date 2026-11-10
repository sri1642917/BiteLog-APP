from datetime import date, datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user_settings import UserSettings
from app.models.weight import WeightHistory

class WeightService:
    @staticmethod
    def calculate_age(birth_date_str: str) -> int:
        try:
            born = datetime.strptime(birth_date_str, "%Y-%m-%d").date()
            today = date.today()
            return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
        except Exception:
            return 28 # Default fallback

    @classmethod
    def get_weight_stats(cls, db: Session) -> Dict[str, Any]:
        settings = db.query(UserSettings).first()
        if not settings:
            settings = UserSettings()
            db.add(settings)
            db.commit()
            db.refresh(settings)

        # Get latest recorded weight
        latest_entry = db.query(WeightHistory).order_by(WeightHistory.date.desc(), WeightHistory.id.desc()).first()
        current_weight = latest_entry.weight_kg if latest_entry else settings.current_weight_kg
        target_weight = settings.target_weight_kg

        # First recorded weight for progress
        first_entry = db.query(WeightHistory).order_by(WeightHistory.date.asc(), WeightHistory.id.asc()).first()
        start_weight = first_entry.weight_kg if first_entry else (current_weight + 5.0)

        # BMI
        height_m = settings.height_cm / 100.0
        bmi = round(current_weight / (height_m * height_m), 1) if height_m > 0 else 22.0

        # Age
        age = cls.calculate_age(settings.date_of_birth)

        # Mifflin-St Jeor BMR
        if settings.gender.lower() == "female":
            bmr = (10 * current_weight) + (6.25 * settings.height_cm) - (5 * age) - 161
        else:
            bmr = (10 * current_weight) + (6.25 * settings.height_cm) - (5 * age) + 5

        # Activity multipliers
        activity_multipliers = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very_active": 1.9,
        }
        multiplier = activity_multipliers.get(settings.activity_level.lower(), 1.55)
        tdee = bmr * multiplier

        # Target recommendations
        diff_kg = current_weight - target_weight
        if diff_kg > 0:
            # Safe deficit of ~500 kcal per day corresponds to ~0.5kg loss per week (7700 kcal per kg)
            recommended_calories = max(1400, int(round(tdee - 500)))
            # Recommended protein: 1.6g - 2.0g per kg of body weight for muscle sparing during deficit
            recommended_protein = int(round(current_weight * 1.8))
            total_deficit_needed = diff_kg * 7700 # approx kcal
            days_needed = int(round(total_deficit_needed / 500.0))
        elif diff_kg < 0:
            # Surplus of ~300 kcal for lean muscle building
            recommended_calories = int(round(tdee + 300))
            recommended_protein = int(round(current_weight * 1.8))
            days_needed = int(round(abs(diff_kg) * 7700 / 300.0))
        else:
            recommended_calories = int(round(tdee))
            recommended_protein = int(round(current_weight * 1.6))
            days_needed = 0

        target_date = date.today() + timedelta(days=days_needed)

        # Overall progress
        total_to_change = abs(start_weight - target_weight)
        changed_so_far = abs(start_weight - current_weight)
        if total_to_change > 0:
            progress_pct = max(0, min(100, round((changed_so_far / total_to_change) * 100)))
        else:
            progress_pct = 100

        return {
            "current_weight_kg": round(current_weight, 1),
            "target_weight_kg": round(target_weight, 1),
            "start_weight_kg": round(start_weight, 1),
            "progress_percentage": progress_pct,
            "bmi": bmi,
            "bmr": round(bmr, 0),
            "tdee": round(tdee, 0),
            "recommended_calories": settings.calorie_target or recommended_calories,
            "recommended_protein": settings.protein_target or recommended_protein,
            "target_date": target_date.strftime("%b %d, %Y"),
            "days_remaining": days_needed,
            "age": age,
            "height_cm": settings.height_cm,
            "gender": settings.gender,
            "activity_level": settings.activity_level,
        }

    @staticmethod
    def get_weight_history_points(db: Session, filter_range: str = "This Month") -> List[Dict[str, Any]]:
        # Fetch entries
        records = db.query(WeightHistory).order_by(WeightHistory.date.asc()).all()
        if not records:
            return []

        result = []
        for r in records:
            dt = datetime.strptime(r.date, "%Y-%m-%d")
            result.append({
                "date": r.date,
                "label": dt.strftime("%d %b"),
                "weight_kg": r.weight_kg,
            })
        return result

