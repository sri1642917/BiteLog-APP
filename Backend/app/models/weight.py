from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime
from app.database.connection import Base

class WeightHistory(Base):
    __tablename__ = "weight_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    weight_kg = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

