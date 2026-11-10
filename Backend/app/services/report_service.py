import csv
import io
from datetime import date, datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.entry import Entry
from app.models.user_settings import UserSettings

class ReportService:
    @staticmethod
    def get_period_days(period: str) -> int:
        p = period.lower().strip()
        if p in ["day", "daily", "today"]:
            return 1
        elif p in ["weekly", "week", "7days"]:
            return 7
        elif p in ["monthly", "month", "30days"]:
            return 30
        elif p in ["quarterly", "quarter", "3months", "90days"]:
            return 90
        elif p in ["6months", "half_year", "180days"]:
            return 180
        elif p in ["yearly", "year", "annual", "365days"]:
            return 365
        return 7

    @classmethod
    def generate_report(cls, db: Session, period: str = "weekly", target_date: Optional[str] = None) -> Dict[str, Any]:
        today = date.today()
        if target_date:
            try:
                today = datetime.strptime(target_date, "%Y-%m-%d").date()
            except ValueError:
                today = date.today()

        period_key = period.lower().strip()
        days = cls.get_period_days(period_key)

        start_date = today - timedelta(days=days - 1)
        end_date = today

        # Fetch settings
        settings = db.query(UserSettings).first()
        calorie_target = settings.calorie_target if settings else 2200
        protein_target = settings.protein_target if settings else 100

        # Query all entries within the period
        entries = db.query(Entry).filter(
            Entry.date >= start_date.isoformat(),
            Entry.date <= end_date.isoformat()
        ).order_by(Entry.date.desc(), Entry.id.desc()).all()

        # Group by date
        daily_map: Dict[str, Dict[str, float]] = {}
        for i in range(days):
            d = start_date + timedelta(days=i)
            daily_map[d.isoformat()] = {"calories": 0.0, "protein": 0.0, "fiber": 0.0, "count": 0}

        detailed_entries: List[Dict[str, Any]] = []
        for e in entries:
            fib = e.fiber_g or 0.0
            if e.date in daily_map:
                daily_map[e.date]["calories"] += e.calories_kcal
                daily_map[e.date]["protein"] += e.protein_g
                daily_map[e.date]["fiber"] += fib
                daily_map[e.date]["count"] += 1

            detailed_entries.append({
                "id": e.id,
                "date": e.date,
                "time": e.time,
                "meal_type": e.meal_type or "Meal",
                "calories_kcal": round(e.calories_kcal, 1),
                "protein_g": round(e.protein_g, 1),
                "fiber_g": round(fib, 1),
                "source": e.source or "Manual"
            })

        total_calories = sum(v["calories"] for v in daily_map.values())
        total_protein = sum(v["protein"] for v in daily_map.values())
        total_fiber = sum(v["fiber"] for v in daily_map.values())
        days_logged = sum(1 for v in daily_map.values() if v["count"] > 0)

        # Calculate averages over days logged (or 1 if 0)
        divisor = days_logged if days_logged > 0 else 1
        avg_calories = total_calories / divisor
        avg_protein = total_protein / divisor
        avg_fiber = total_fiber / divisor

        # Target achievement
        expected_total_cal = calorie_target * days
        expected_total_prot = protein_target * days

        cal_achievement = round((total_calories / expected_total_cal * 100), 1) if expected_total_cal > 0 else 0
        prot_achievement = round((total_protein / expected_total_prot * 100), 1) if expected_total_prot > 0 else 0
        overall_achievement = round((cal_achievement + prot_achievement) / 2, 1) if (cal_achievement > 0 or prot_achievement > 0) else 0.0

        # Build daily logs table matching report-export-ui-design-3.png
        daily_logs_table: List[Dict[str, Any]] = []
        entries_by_date: Dict[str, List[Any]] = {}
        for e in entries:
            entries_by_date.setdefault(e.date, []).append(e)

        for d_str, val in sorted(daily_map.items(), reverse=True):
            if val["count"] > 0:
                dt = datetime.strptime(d_str, "%Y-%m-%d")
                day_entries = entries_by_date.get(d_str, [])
                meals_parts = []
                for me in day_entries:
                    m_label = me.meal_type or "Meal"
                    meals_parts.append(f"{m_label}: {int(me.calories_kcal)} kcal ({int(me.protein_g)}g P)")
                meal_summary_text = "; ".join(meals_parts) if meals_parts else "Meals logged"

                goals_met = val["calories"] <= (calorie_target * 1.1) and val["protein"] >= (protein_target * 0.75)
                daily_logs_table.append({
                    "date": dt.strftime("%a, %b %d"),
                    "raw_date": d_str,
                    "calories_kcal": int(val["calories"]),
                    "protein_g": int(val["protein"]),
                    "fiber_g": round(val["fiber"], 1),
                    "meal_logs": meal_summary_text,
                    "goals_met": goals_met
                })

        # Build trend points
        trends: List[Dict[str, Any]] = []
        for d_str, val in sorted(daily_map.items()):
            dt = datetime.strptime(d_str, "%Y-%m-%d")
            if days <= 1:
                label = "Today"
            elif days <= 7:
                label = dt.strftime("%a") # Mon, Tue...
            elif days <= 30:
                label = dt.strftime("%b %d") # May 01
            elif days <= 90:
                label = dt.strftime("%b %d")
            elif days <= 180:
                label = dt.strftime("%b %d")
            else:
                label = dt.strftime("%b")

            trends.append({
                "date": d_str,
                "label": label,
                "calories_kcal": round(val["calories"], 1),
                "protein_g": round(val["protein"], 1),
                "fiber_g": round(val["fiber"], 1),
            })

        # Aggregation for 6months and yearly if too many points: group into months
        if days >= 180:
            monthly_trends: Dict[str, Dict[str, float]] = {}
            for item in trends:
                month_key = item["date"][:7] # YYYY-MM
                if month_key not in monthly_trends:
                    dt = datetime.strptime(month_key + "-01", "%Y-%m-%d")
                    monthly_trends[month_key] = {
                        "label": dt.strftime("%b %Y") if days > 180 else dt.strftime("%b"),
                        "calories": 0.0,
                        "protein": 0.0,
                        "fiber": 0.0
                    }
                monthly_trends[month_key]["calories"] += item["calories_kcal"]
                monthly_trends[month_key]["protein"] += item["protein_g"]
                monthly_trends[month_key]["fiber"] += item.get("fiber_g", 0.0)
            
            trends = [
                {
                    "date": k,
                    "label": v["label"],
                    "calories_kcal": round(v["calories"], 1),
                    "protein_g": round(v["protein"], 1),
                    "fiber_g": round(v["fiber"], 1)
                }
                for k, v in monthly_trends.items()
            ]

        return {
            "period": period_key,
            "start_date": start_date.strftime("%b %d, %Y"),
            "end_date": end_date.strftime("%b %d, %Y"),
            "calorie_target": float(calorie_target),
            "protein_target": float(protein_target),
            "fiber_target": 30.0,
            "total_calories": round(total_calories, 1),
            "total_protein": round(total_protein, 1),
            "total_fiber": round(total_fiber, 1),
            "average_daily_calories": round(avg_calories, 1),
            "average_daily_protein": round(avg_protein, 1),
            "average_daily_fiber": round(avg_fiber, 1),
            "calorie_target_achievement_pct": cal_achievement,
            "protein_target_achievement_pct": prot_achievement,
            "overall_achievement_pct": overall_achievement,
            "days_logged": days_logged,
            "total_days_in_period": days,
            "daily_trends": trends,
            "detailed_entries": detailed_entries,
            "daily_logs_table": daily_logs_table,
        }

    @classmethod
    def generate_csv(cls, db: Session, period: str = "weekly", target_date: Optional[str] = None) -> str:
        rep = cls.generate_report(db, period, target_date)
        output = io.StringIO()
        writer = csv.writer(output)

        # Title and Summary Block
        writer.writerow(["BiteLog - Nutrition Progress Report"])
        writer.writerow(["Period", f"{rep['period'].capitalize()} ({rep['start_date']} to {rep['end_date']})"])
        writer.writerow(["Days Logged", f"{rep['days_logged']} of {rep['total_days_in_period']} days"])
        writer.writerow([])
        writer.writerow(["METRIC SUMMARY", "TOTAL INTAKE", "DAILY AVERAGE", "TARGET ACHIEVEMENT"])
        writer.writerow(["Calories (kcal)", rep["total_calories"], rep["average_daily_calories"], f"{rep['calorie_target_achievement_pct']}%"])
        writer.writerow(["Protein (g)", rep["total_protein"], rep["average_daily_protein"], f"{rep['protein_target_achievement_pct']}%"])
        writer.writerow(["Fiber (g)", rep["total_fiber"], rep["average_daily_fiber"], "N/A"])
        writer.writerow([])

        # Detailed Meal Entries Table
        writer.writerow(["DETAILED MEAL LOGS"])
        writer.writerow(["Date", "Time", "Meal Category", "Calories (kcal)", "Protein (g)", "Fiber (g)", "Input Source"])
        for item in rep.get("detailed_entries", []):
            writer.writerow([
                item["date"],
                item["time"],
                item["meal_type"],
                item["calories_kcal"],
                item["protein_g"],
                item["fiber_g"],
                item["source"]
            ])

        return output.getvalue()

