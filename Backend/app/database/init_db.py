from datetime import datetime, date, timedelta
from app.database.connection import engine, Base, SessionLocal
from app.models.entry import Entry
from app.models.weight import WeightHistory
from app.models.user_settings import UserSettings
from app.models.user import User

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Auto-migration for SQLite schema updates
    try:
        with engine.connect() as conn:
            cursor = conn.exec_driver_sql("PRAGMA table_info(entries)")
            cols = [row[1] for row in cursor.fetchall()]
            if cols:
                if "fiber_g" not in cols:
                    conn.exec_driver_sql("ALTER TABLE entries ADD COLUMN fiber_g FLOAT DEFAULT 0.0")
                if "meal_type" not in cols:
                    conn.exec_driver_sql("ALTER TABLE entries ADD COLUMN meal_type VARCHAR(30) DEFAULT 'Lunch'")
                conn.commit()
    except Exception as e:
        print(f"Schema migration check: {e}")

    db = SessionLocal()
    try:
        # Check if settings exist
        settings = db.query(UserSettings).first()
        if not settings:
            settings = UserSettings(
                id=1,
                date_of_birth="1996-05-15",
                gender="male",
                height_cm=175.0,
                current_weight_kg=72.5,
                target_weight_kg=65.0,
                activity_level="moderate",
                calorie_target=2200,
                protein_target=100,
                preferred_units="metric",
                target_duration_weeks=16
            )
            db.add(settings)

            # Check if weight history exists
            if db.query(WeightHistory).count() == 0:
                # Add sample weight history for the last 30 days
                today = date.today()
                weights = [
                    (today - timedelta(days=28), 75.8),
                    (today - timedelta(days=21), 74.9),
                    (today - timedelta(days=14), 74.1),
                    (today - timedelta(days=7), 73.2),
                    (today, 72.5),
                ]
                for d, w in weights:
                    db.add(WeightHistory(date=d.isoformat(), weight_kg=w))

            # Add today's sample entries matching reference UI if no entries
            if db.query(Entry).count() == 0:
                today_str = date.today().isoformat()
                sample_entries = [
                    Entry(date=today_str, time="08:15 AM", calories_kcal=500, protein_g=25, source="Image"),
                    Entry(date=today_str, time="01:30 PM", calories_kcal=750, protein_g=40, source="Text"),
                    Entry(date=today_str, time="07:45 PM", calories_kcal=600, protein_g=30, source="Image"),
                ]
                for e in sample_entries:
                    db.add(e)

                # Also populate past 6 days for rich charts
                for i in range(1, 7):
                    past_d = (date.today() - timedelta(days=i)).isoformat()
                    db.add(Entry(date=past_d, time="08:30 AM", calories_kcal=550, protein_g=28, source="Image"))
                    db.add(Entry(date=past_d, time="01:15 PM", calories_kcal=800, protein_g=42, source="Text"))
                    db.add(Entry(date=past_d, time="08:00 PM", calories_kcal=500, protein_g=25, source="Image"))

            db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

