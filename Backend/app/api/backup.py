import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entry import Entry
from app.models.weight import WeightHistory
from app.models.user_settings import UserSettings

router = APIRouter(prefix="/backup", tags=["Backup"])

@router.get("/export")
def export_backup(db: Session = Depends(get_db)):
    """Exports full local database as structured JSON."""
    settings = db.query(UserSettings).first()
    entries = db.query(Entry).all()
    weights = db.query(WeightHistory).all()

    data = {
        "version": "1.0",
        "exported_at": datetime.utcnow().isoformat(),
        "app": "BiteLog",
        "settings": {
            "date_of_birth": settings.date_of_birth if settings else "1995-01-01",
            "gender": settings.gender if settings else "male",
            "height_cm": settings.height_cm if settings else 175.0,
            "current_weight_kg": settings.current_weight_kg if settings else 72.5,
            "target_weight_kg": settings.target_weight_kg if settings else 65.0,
            "activity_level": settings.activity_level if settings else "moderate",
            "calorie_target": settings.calorie_target if settings else 2200,
            "protein_target": settings.protein_target if settings else 100,
            "preferred_units": settings.preferred_units if settings else "metric",
            "target_duration_weeks": settings.target_duration_weeks if settings else 16,
        },
        "entries": [
            {
                "date": e.date,
                "time": e.time,
                "calories_kcal": e.calories_kcal,
                "protein_g": e.protein_g,
                "source": e.source,
            }
            for e in entries
        ],
        "weight_history": [
            {
                "date": w.date,
                "weight_kg": w.weight_kg,
            }
            for w in weights
        ]
    }
    return JSONResponse(
        content=data,
        headers={"Content-Disposition": f"attachment; filename=bitelog_backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"}
    )

@router.post("/restore")
async def restore_backup(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Validates and restores local backup."""
    try:
        content = await file.read()
        backup_data = json.loads(content.decode("utf-8"))

        if "app" not in backup_data or backup_data.get("app") not in ["BiteLog", "NutriTrack AI"]:
            raise HTTPException(status_code=400, detail="Invalid backup file: not a recognized BiteLog backup.")

        # Wipe existing data safely
        db.query(Entry).delete()
        db.query(WeightHistory).delete()

        # Restore settings
        if "settings" in backup_data:
            s_data = backup_data["settings"]
            settings = db.query(UserSettings).first()
            if not settings:
                settings = UserSettings(id=1)
                db.add(settings)
            settings.date_of_birth = s_data.get("date_of_birth", "1995-01-01")
            settings.gender = s_data.get("gender", "male")
            settings.height_cm = s_data.get("height_cm", 175.0)
            settings.current_weight_kg = s_data.get("current_weight_kg", 72.5)
            settings.target_weight_kg = s_data.get("target_weight_kg", 65.0)
            settings.activity_level = s_data.get("activity_level", "moderate")
            settings.calorie_target = s_data.get("calorie_target", 2200)
            settings.protein_target = s_data.get("protein_target", 100)
            settings.preferred_units = s_data.get("preferred_units", "metric")
            settings.target_duration_weeks = s_data.get("target_duration_weeks", 16)

        # Restore entries
        entries_count = 0
        for e_dict in backup_data.get("entries", []):
            db.add(Entry(
                date=e_dict["date"],
                time=e_dict["time"],
                calories_kcal=float(e_dict["calories_kcal"]),
                protein_g=float(e_dict["protein_g"]),
                source=e_dict.get("source", "Manual"),
            ))
            entries_count += 1

        # Restore weight history
        weights_count = 0
        for w_dict in backup_data.get("weight_history", []):
            db.add(WeightHistory(
                date=w_dict["date"],
                weight_kg=float(w_dict["weight_kg"]),
            ))
            weights_count += 1

        db.commit()
        return {
            "success": True,
            "message": f"Successfully restored {entries_count} entries and {weights_count} weight history records."
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Corrupted or invalid JSON file.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Restoration failed: {str(e)}")

