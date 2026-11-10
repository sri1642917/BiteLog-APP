from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime
from app.database.connection import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, default=1)
    date_of_birth = Column(String(10), default="1995-01-01") # YYYY-MM-DD
    gender = Column(String(10), default="male") # male / female
    height_cm = Column(Float, default=175.0)
    current_weight_kg = Column(Float, default=72.5)
    target_weight_kg = Column(Float, default=65.0)
    activity_level = Column(String(20), default="moderate") # sedentary, light, moderate, active, very_active
    calorie_target = Column(Integer, default=2200)
    protein_target = Column(Integer, default=100)
    preferred_units = Column(String(10), default="metric") # metric / imperial
    target_duration_weeks = Column(Integer, default=16)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

