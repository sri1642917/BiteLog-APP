import io
import json
from datetime import date
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw
from app.main import app

client = TestClient(app)

def test_nutritrack_app():
    print("=== STARTING FULL OFFLINE E2E TESTS ===")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    assert res.json()["mode"] == "100% Offline"
    print("✓ Health Check Passed: 100% Offline")

    # 2. Dashboard summary
    res = client.get("/api/entries/dashboard-summary")
    assert res.status_code == 200, f"Dashboard summary failed: {res.text}"
    summary = res.json()
    assert "today_calories" in summary
    assert "today_protein" in summary
    assert "weight" in summary
    print(f"✓ Dashboard Summary: Calories={summary['today_calories']['total']} kcal, Protein={summary['today_protein']['total']} g")

    # 3. Intake overview for bar chart
    res = client.get("/api/entries/intake-overview?timeframe=This%20Week")
    assert res.status_code == 200
    intake = res.json()
    assert len(intake) == 7
    print(f"✓ Intake Overview (7 days Mon-Sun): {len(intake)} days loaded")

    # 4. Text Parsing (ChatGPT format)
    chatgpt_text = "Here is your lunch calculation:\nTotal Calories: 620 kcal\nTotal Protein: 45 g"
    res = client.post("/api/parse/text", json={"text": chatgpt_text})
    assert res.status_code == 200
    parsed = res.json()
    assert parsed["calories_kcal"] == 620.0
    assert parsed["protein_g"] == 45.0
    print(f"✓ ChatGPT Text Parsing: {parsed['calories_kcal']} kcal, {parsed['protein_g']} g")

    # 5. Image OCR Parsing (Synthetic screenshot)
    img = Image.new("RGB", (700, 250), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((40, 50), "Gemini Nutrition Result", fill=(0, 0, 0))
    d.text((40, 100), "Calories: 780 kcal", fill=(0, 0, 0))
    d.text((40, 150), "Protein: 52 g", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    res = client.post("/api/parse/image", files={"file": ("screenshot.png", buf.getvalue(), "image/png")})
    assert res.status_code == 200
    img_parsed = res.json()
    assert img_parsed["calories_kcal"] == 780.0
    assert img_parsed["protein_g"] == 52.0
    print(f"✓ Screenshot Offline OCR: {img_parsed['calories_kcal']} kcal, {img_parsed['protein_g']} g")

    # 6. Add Entry
    today_str = date.today().isoformat()
    new_entry = {
        "date": today_str,
        "time": "12:45 PM",
        "calories_kcal": 650.0,
        "protein_g": 42.0,
        "source": "Image"
    }
    res = client.post("/api/entries", json=new_entry)
    assert res.status_code == 200
    saved = res.json()
    entry_id = saved["id"]
    print(f"✓ Add Entry: Created ID {entry_id}")

    # 7. Duplicate Submission Prevention (Immediate duplicate submission within 15 seconds)
    dup_res = client.post("/api/entries", json=new_entry)
    assert dup_res.status_code == 409
    print("✓ Duplicate Submission Prevention Passed: HTTP 409 Conflict blocked duplicate")

    # 8. Calendar Month Summary
    res = client.get("/api/calendar/month")
    assert res.status_code == 200
    cal_data = res.json()
    assert len(cal_data["days"]) >= 28
    today_cell = next((d for d in cal_data["days"] if d["date"] == today_str), None)
    assert today_cell is not None
    assert today_cell["has_entries"] is True
    print(f"✓ Calendar Month Summary: Today has {today_cell['total_calories']} kcal logged")

    # 9. Reports (6 Periods: Day, Week, Month, Quarter, 6 Months, Year + CSV Export)
    for period_name in ["day", "weekly", "monthly", "quarterly", "6months", "yearly"]:
        res_rep = client.get(f"/api/reports?period={period_name}")
        assert res_rep.status_code == 200, f"Report {period_name} failed: {res_rep.text}"
        rep_json = res_rep.json()
        assert "total_calories" in rep_json
        assert "total_protein" in rep_json
        assert "total_fiber" in rep_json

    # Test CSV Download endpoint
    csv_res = client.get("/api/reports/download-csv?period=monthly")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers.get("content-type", "")
    assert "BiteLog" in csv_res.text
    print(f"✓ All 6 Report Periods (Day, Week, Month, Quarter, 6M, Year) & CSV Download Export verified!")

    # 10. Weight & Goals (Mifflin-St Jeor calculation)
    res = client.get("/api/weight/stats")
    assert res.status_code == 200
    w_stats = res.json()
    assert w_stats["bmi"] > 0
    assert w_stats["bmr"] > 0
    assert w_stats["tdee"] > 0
    assert "days_remaining" in w_stats
    print(f"✓ Weight & Goals: BMI={w_stats['bmi']}, BMR={w_stats['bmr']}, TDEE={w_stats['tdee']}, Target Date={w_stats['target_date']}")

    # 11. Log New Weight
    res = client.post("/api/weight/log", json={"date": today_str, "weight_kg": 72.0})
    assert res.status_code == 200
    print("✓ Log New Weight: Saved 72.0 kg")

    # 13. Backup Export
    res = client.get("/api/backup/export")
    assert res.status_code == 200
    backup_data = res.json()
    assert backup_data["app"] == "BiteLog"
    assert len(backup_data["entries"]) > 0
    assert len(backup_data["weight_history"]) > 0
    print(f"✓ Backup Export: Valid JSON with {len(backup_data['entries'])} entries")

    # 14. Backup Restore
    backup_bytes = json.dumps(backup_data).encode("utf-8")
    restore_res = client.post(
        "/api/backup/restore",
        files={"file": ("backup.json", backup_bytes, "application/json")}
    )
    assert restore_res.status_code == 200
    print(f"✓ Backup Restore: {restore_res.json()['message']}")

    # 15. Delete entry
    del_res = client.delete(f"/api/entries/{entry_id}")
    assert del_res.status_code == 200
    print(f"✓ Delete Entry: Entry {entry_id} deleted successfully")

    # 15. Clean Data by Date Range (Preview & Cleanup)
    prev_res = client.get(f"/api/entries/clean-range/preview?from_date={today_str}&to_date={today_str}")
    assert prev_res.status_code == 200
    p_data = prev_res.json()
    assert "entries_count" in p_data and "weights_count" in p_data
    print(f"✓ Clean Range Preview: {p_data['entries_count']} entries, {p_data['weights_count']} weights found for {today_str}")

    clean_res = client.post("/api/entries/clean-range", json={
        "from_date": today_str,
        "to_date": today_str,
        "clean_entries": True,
        "clean_weights": False
    })
    assert clean_res.status_code == 200
    c_result = clean_res.json()
    assert c_result["success"] is True
    print(f"✓ Clean Range Execution: {c_result['message']}")

    print("\n🎉 ALL E2E OFFLINE INTEGRATION TESTS PASSED 100%!")

if __name__ == "__main__":
    test_nutritrack_app()

