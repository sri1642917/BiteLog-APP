import os
import sys
from datetime import date
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

FOOD_ITEMS_DIR = "/Users/sriharsha/Documents/Projects/Food-calories-tracker-app-detailed-analysis/Test-data/Food-items"

def run_e2e_food_items_test():
    print("=====================================================================")
    print("  BITELOG END-TO-END FOOD ITEMS LIVE TEST WITH VISION & ANALYTICS  ")
    print("=====================================================================\n")

    images = [
        ("food_item_1.png", "Morning Snacks", "medium", "restaurant"),
        ("food_item_2.png", "Lunch", "medium", "home"),
        ("food_item_3.png", "Dinner", "large", "restaurant")
    ]

    logged_entries = []

    # -------------------------------------------------------------
    # Step 1: Process Each Food Image with Gemma 3n Vision Engine
    # -------------------------------------------------------------
    for filename, meal_type, plate_size, cooking_style in images:
        filepath = os.path.join(FOOD_ITEMS_DIR, filename)
        assert os.path.exists(filepath), f"File {filepath} not found!"
        filesize_kb = os.path.getsize(filepath) / 1024
        print(f"📸 Testing {filename} ({filesize_kb:.1f} KB)...")

        with open(filepath, "rb") as f:
            file_bytes = f.read()

        # Call vision API
        response = client.post(
            "/api/parse/food-photo",
            files={"file": (filename, file_bytes, "image/png")},
            data={
                "model_tier": "e4b",
                "plate_size": plate_size,
                "cooking_style": cooking_style,
                "portion_size": plate_size
            }
        )

        assert response.status_code == 200, f"Vision parse failed: {response.text}"
        data = response.json()

        assert "carbs_g" in data, "carbs_g missing from response"
        assert "fats_g" in data, "fats_g missing from response"
        assert "calorie_range_str" in data, "calorie_range_str missing from response"

        print(f"   ✓ Vision Identified : {data.get('portion_notes', 'Meal Analysis')}")
        print(f"   ✓ Calorie Range     : {data.get('calorie_range_str')} (Average: {data['calories_kcal']} kcal)")
        print(f"   ✓ Full 5-Macro Suite: {data['calories_kcal']} kcal | {data['protein_g']}g P | {data['carbs_g']}g C | {data['fats_g']}g F | {data['fiber_g']}g Fiber")
        print(f"   ✓ Plate & Style     : Plate={data['plate_size']}, Style={data['cooking_style']}")
        print(f"   ✓ AI Model Tier     : {data['model_used']} ({data['inference_time_ms']} ms)")

        # -------------------------------------------------------------
        # Step 2: Log Each Meal into the Database
        # -------------------------------------------------------------
        today_str = date.today().isoformat()
        entry_payload = {
            "date": today_str,
            "time": "12:30",
            "meal_type": meal_type,
            "calories_kcal": data["calories_kcal"],
            "protein_g": data["protein_g"],
            "carbs_g": data["carbs_g"],
            "fats_g": data["fats_g"],
            "fiber_g": data["fiber_g"],
            "source": "Image"
        }

        log_res = client.post("/api/entries", json=entry_payload)
        assert log_res.status_code == 200, f"Failed to log entry: {log_res.text}"
        logged_item = log_res.json()
        logged_entries.append(logged_item)
        print(f"   ✓ Logged as Entry #{logged_item['id']} for '{meal_type}'\n")

    # -------------------------------------------------------------
    # Step 3: Test Duplicate Submission Prevention (409 Conflict)
    # -------------------------------------------------------------
    print("🛡️ Testing Duplicate Submission Shield...")
    last_item = logged_entries[-1]
    duplicate_payload = {
        "date": last_item["date"],
        "time": last_item["time"],
        "meal_type": last_item["meal_type"],
        "calories_kcal": last_item["calories_kcal"],
        "protein_g": last_item["protein_g"],
        "fiber_g": last_item["fiber_g"],
        "source": "Image"
    }
    dup_res = client.post("/api/entries", json=duplicate_payload)
    assert dup_res.status_code == 409, f"Expected 409 conflict, got {dup_res.status_code}"
    print("   ✓ HTTP 409 Conflict blocked immediate duplicate submission!\n")

    # -------------------------------------------------------------
    # Step 4: Verify Dashboard Real-Time Today Totals
    # -------------------------------------------------------------
    print("📊 Verifying Dashboard Real-Time Tracking...")
    today_res = client.get("/api/entries/dashboard-summary")
    assert today_res.status_code == 200
    today_data = today_res.json()

    print(f"   ✓ Today's Total Calories : {today_data['today_calories']['total']} kcal (Target: {today_data['today_calories']['target']} kcal)")
    print(f"   ✓ Today's Total Protein  : {today_data['today_protein']['total']} g (Target: {today_data['today_protein']['target']} g)")
    print(f"   ✓ Remaining Calorie Budget: {today_data['today_calories']['remaining']} kcal")
    assert today_data['today_calories']['total'] > 0
    assert today_data['today_protein']['total'] > 0
    print("   ✓ Dashboard tracking confirmed!\n")

    # -------------------------------------------------------------
    # Step 5: Verify Calendar Month Summary & Day Drill-Down
    # -------------------------------------------------------------
    print("📅 Verifying Calendar Aggregations...")
    today = date.today()
    cal_res = client.get(f"/api/calendar/month?year={today.year}&month={today.month}")
    assert cal_res.status_code == 200
    cal_data = cal_res.json()

    today_cell = next((d for d in cal_data["days"] if d["date"] == today.isoformat()), None)
    assert today_cell is not None
    print(f"   ✓ Calendar Today Cell: {today_cell['total_calories']} kcal, {today_cell['total_protein']}g protein ({today_cell['entry_count']} meals)")

    drill_res = client.get(f"/api/calendar/day-details?date={today.isoformat()}")
    assert drill_res.status_code == 200
    drill_data = drill_res.json()
    print(f"   ✓ Day Drill-Down contains {len(drill_data['entries'])} verified entries for today.\n")

    # -------------------------------------------------------------
    # Step 6: Verify Comprehensive Reports Across All 6 Intervals
    # -------------------------------------------------------------
    print("📈 Verifying Reports & Analytics Engine Across 6 Intervals...")
    intervals = ["day", "weekly", "monthly", "quarterly", "6months", "yearly"]

    for period in intervals:
        rep_res = client.get(f"/api/reports?period={period}")
        assert rep_res.status_code == 200, f"Report failed for {period}"
        rep_data = rep_res.json()
        print(f"   ✓ Period [{period.upper():<11}] -> Avg Cal: {rep_data['average_daily_calories']:.0f} kcal, Avg Prot: {rep_data['average_daily_protein']:.1f}g, Days Logged: {rep_data['days_logged']}")
        assert "daily_trends" in rep_data
        assert len(rep_data["daily_trends"]) > 0

    # -------------------------------------------------------------
    # Step 7: Verify CSV Report Download
    # -------------------------------------------------------------
    print("\n📥 Verifying CSV Report Export...")
    csv_res = client.get("/api/reports/download-csv?period=weekly")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers.get("content-type", "")
    csv_lines = csv_res.text.strip().split("\n")
    print(f"   ✓ CSV Header: {csv_lines[0]}")
    print(f"   ✓ CSV Sample Row: {csv_lines[1] if len(csv_lines) > 1 else 'No entries'}")
    assert len(csv_lines) >= 2
    print("   ✓ CSV Report Export verified!\n")

    # -------------------------------------------------------------
    # Step 8: Verify Instant Post-Save Workflow (Edit & Delete)
    # -------------------------------------------------------------
    print("✏️ Verifying Instant Post-Save Actions (Edit & Delete)...")
    entry_to_edit = logged_entries[0]
    edit_res = client.put(f"/api/entries/{entry_to_edit['id']}", json={
        "date": entry_to_edit["date"],
        "time": entry_to_edit["time"],
        "meal_type": "Morning Snacks",
        "calories_kcal": 450.0,
        "protein_g": 12.0,
        "fiber_g": 4.0,
        "source": "Image"
    })
    assert edit_res.status_code == 200
    print(f"   ✓ Entry #{entry_to_edit['id']} successfully updated to 450 kcal / 12g protein.")

    del_res = client.delete(f"/api/entries/{entry_to_edit['id']}")
    assert del_res.status_code == 200
    print(f"   ✓ Entry #{entry_to_edit['id']} successfully deleted.")

    print("\n=====================================================================")
    print("  ALL END-TO-END TESTS COMPLETED SUCCESSFULLY WITH 100% PASS RATE!  ")
    print("=====================================================================\n")

if __name__ == "__main__":
    run_e2e_food_items_test()
