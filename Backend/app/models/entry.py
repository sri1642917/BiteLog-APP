from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime
from app.database.connection import Base

class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    time = Column(String(8), nullable=False) # HH:MM or HH:MM:SS
    calories_kcal = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False)
    fiber_g = Column(Float, default=0.0, nullable=True)
    meal_type = Column(String(30), default="Lunch", nullable=True) # "Breakfast", "Morning Snacks", "Lunch", "Evening Snacks", "Dinner", "Midnight Craving"
    source = Column(String(20), default="Manual") # "Image", "Text", "Manual"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

