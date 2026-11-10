import io
import time
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw
from app.main import app
from app.services.food_vision_service import FoodVisionService

client = TestClient(app)

def test_food_vision_offline():
    print("=== TESTING OFFLINE FOOD-IMAGE ANALYSIS (GEMMA 3n E2B / E4B) ===")

    # 1. Hardware capabilities check
    hw = FoodVisionService.get_system_hardware_capabilities()
    print(f"✓ Hardware check: Total RAM = {hw['total_ram_gb']} GB, Available = {hw['available_ram_gb']} GB")
    print(f"✓ Hardware acceleration: {hw['acceleration']}")
    print(f"✓ Gemma E2B Supported: {hw['supports_gemma_e2b']}, Gemma E4B Supported: {hw['supports_gemma_e4b']}")
    assert hw["is_compatible"] is True, "Expected hardware to support at least E2B"

    # 2. Check model status endpoint via API
    res_status = client.get("/api/parse/model-status")
    assert res_status.status_code == 200
    assert res_status.json()["is_compatible"] is True
    print("✓ API /api/parse/model-status returned verified local compatibility")

    # 3. Create synthetic meal test image (grilled chicken & greens plate)
    test_img = Image.new("RGB", (600, 600), color=(240, 235, 220))
    d = ImageDraw.Draw(test_img)
    # Draw plate circle
    d.ellipse((50, 50, 550, 550), fill=(255, 255, 255), outline=(200, 200, 200), width=4)
    # Draw warm protein food zone (brownish/golden)
    d.ellipse((120, 150, 340, 380), fill=(180, 110, 60))
    # Draw greens food zone (salad/broccoli)
    d.ellipse((300, 200, 480, 420), fill=(60, 150, 70))
    # Draw grain zone (rice/quinoa)
    d.ellipse((180, 320, 380, 480), fill=(230, 215, 170))

    buf = io.BytesIO()
    test_img.save(buf, format="PNG")
    buf.seek(0)
    img_bytes = buf.getvalue()

    # 4. Test normal portion meal analysis (E2B default with 90% calibration)
    res_e2b = client.post(
        "/api/parse/food-photo",
        files={"file": ("meal_plate.png", img_bytes, "image/png")},
        data={"model_tier": "e2b", "portion_size": "normal", "plate_size": "medium", "cooking_style": "home"}
    )
    assert res_e2b.status_code == 200, f"Analysis failed: {res_e2b.text}"
    data_e2b = res_e2b.json()
    print(f"✓ E2B Medium Plate + Home Style: {data_e2b['calories_kcal']} kcal, {data_e2b['protein_g']} g protein ({data_e2b['inference_time_ms']} ms)")
    assert data_e2b["calories_kcal"] > 0
    assert data_e2b["protein_g"] > 0
    assert "Google Gemma 3n E2B" in data_e2b["model_used"]
    assert "90–92%" in data_e2b["confidence_level"]

    # 5. Test 3 Plate Size Options: Small (Bowl) vs Medium (Plate) vs Large (Platter)
    res_large = client.post(
        "/api/parse/food-photo",
        files={"file": ("meal_plate.png", img_bytes, "image/png")},
        data={"model_tier": "e2b", "plate_size": "large", "cooking_style": "home"}
    )
    assert res_large.status_code == 200
    data_large = res_large.json()
    print(f"✓ Large Platter Plate: {data_large['calories_kcal']} kcal (vs Medium {data_e2b['calories_kcal']} kcal)")
    assert data_large["calories_kcal"] > data_e2b["calories_kcal"], "Large plate should estimate higher calories"

    res_small = client.post(
        "/api/parse/food-photo",
        files={"file": ("meal_plate.png", img_bytes, "image/png")},
        data={"model_tier": "e2b", "plate_size": "small", "cooking_style": "home"}
    )
    assert res_small.status_code == 200
    data_small = res_small.json()
    print(f"✓ Small Bowl/Plate: {data_small['calories_kcal']} kcal")
    assert data_small["calories_kcal"] < data_e2b["calories_kcal"], "Small plate should estimate lower calories"

    # 5b. Test Cooking Style Options (Lean vs Restaurant)
    res_lean = client.post(
        "/api/parse/food-photo",
        files={"file": ("meal_plate.png", img_bytes, "image/png")},
        data={"model_tier": "e2b", "plate_size": "medium", "cooking_style": "lean"}
    )
    assert res_lean.status_code == 200
    data_lean = res_lean.json()
    print(f"✓ Lean Cooking Style (0g added fat): {data_lean['calories_kcal']} kcal")
    assert data_lean["calories_kcal"] < data_e2b["calories_kcal"]

    res_restaurant = client.post(
        "/api/parse/food-photo",
        files={"file": ("meal_plate.png", img_bytes, "image/png")},
        data={"model_tier": "e2b", "plate_size": "medium", "cooking_style": "restaurant"}
    )
    assert res_restaurant.status_code == 200
    data_restaurant = res_restaurant.json()
    print(f"✓ Restaurant Cooking Style: {data_restaurant['calories_kcal']} kcal")
    assert data_restaurant["calories_kcal"] > data_e2b["calories_kcal"]

    # 6. Test E4B tier option
    res_e4b = client.post(
        "/api/parse/food-photo",
        files={"file": ("meal_plate.png", img_bytes, "image/png")},
        data={"model_tier": "e4b", "portion_size": "normal"}
    )
    assert res_e4b.status_code == 200
    data_e4b = res_e4b.json()
    print(f"✓ E4B Tier: {data_e4b['model_used']}")
    assert "Google Gemma 3n E4B" in data_e4b["model_used"]

    # 7. Test saving confirmed entry to SQLite with meal category and fiber
    entry_payload = {
        "date": "2026-11-11",
        "time": "01:30 PM",
        "calories_kcal": data_e2b["calories_kcal"],
        "protein_g": data_e2b["protein_g"],
        "fiber_g": data_e2b["fiber_g"],
        "meal_type": "Midnight Craving",
        "source": "Image"
    }
    save_res = client.post("/api/entries", json=entry_payload)
    assert save_res.status_code == 200
    saved_entry = save_res.json()
    assert saved_entry["meal_type"] == "Midnight Craving"
    assert saved_entry["fiber_g"] == data_e2b["fiber_g"]
    print(f"✓ Saved confirmed meal entry to SQLite: ID={saved_entry['id']}, Category={saved_entry['meal_type']}, {saved_entry['calories_kcal']} kcal, {saved_entry['protein_g']}g prot, {saved_entry['fiber_g']}g fiber")

    # 8. Test Instant Edit of saved meal entry
    edit_payload = {
        "calories_kcal": 650.0,
        "protein_g": 40.0,
        "fiber_g": 9.5,
        "meal_type": "Dinner"
    }
    edit_res = client.put(f"/api/entries/{saved_entry['id']}", json=edit_payload)
    assert edit_res.status_code == 200
    edited = edit_res.json()
    assert edited["calories_kcal"] == 650.0
    assert edited["meal_type"] == "Dinner"
    assert edited["fiber_g"] == 9.5
    print(f"✓ Instant Edit verified: Updated to {edited['meal_type']}, {edited['calories_kcal']} kcal, {edited['fiber_g']}g fiber")

    # 9. Test Instant Delete of saved meal entry
    del_res = client.delete(f"/api/entries/{saved_entry['id']}")
    assert del_res.status_code == 200
    print("✓ Instant Delete verified: Cleaned up test record.")

    print("\n🎉 ALL OFFLINE FOOD VISION TESTS PASSED 100%!")

if __name__ == "__main__":
    test_food_vision_offline()

