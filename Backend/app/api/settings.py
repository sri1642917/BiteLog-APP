from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user_settings import UserSettings
from app.models.entry import Entry
from app.models.weight import WeightHistory
from app.schemas.user_settings import UserSettingsUpdate, UserSettingsResponse

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=UserSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(UserSettings).first()
    if not settings:
        settings = UserSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=UserSettingsResponse)
def update_settings(settings_in: UserSettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).first()
    if not settings:
        settings = UserSettings(id=1)
        db.add(settings)

    update_data = settings_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(settings, field, val)

    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    return settings

@router.post("/clear-all")
def clear_all_data(db: Session = Depends(get_db)):
    """Wipes all entries and weight history, resetting user data to defaults."""
    db.query(Entry).delete()
    db.query(WeightHistory).delete()
    db.commit()
    return {"success": True, "message": "All entries and weight history have been cleared."}

