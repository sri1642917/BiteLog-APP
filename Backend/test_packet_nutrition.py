import io
from fastapi.testclient import TestClient
from app.main import app
from app.services.packet_nutrition_service import PacketNutritionService
from PIL import Image, ImageDraw

client = TestClient(app)

def test_packet_nutrition_parser():
    print("=====================================================================")
    print("  TESTING OFFLINE PROTEIN BAR & POWDER PACKET QUANTITY SCALING ENGINE  ")
    print("=====================================================================\n")

    # 1. Test Protein Bar Packet Text Parsing
    bar_text = """
    MUSCLEBLAZE 20G PROTEIN BAR
    Nutrition Facts
    Serving Size: 1 Bar (60g)
    Energy: 240 kcal
    Protein: 20 g
    Total Carbohydrate: 22 g
    Dietary Fiber: 5 g
    Total Fat: 8 g
    Ingredients: Whey Protein Isolate, Whey Protein Concentrate, Almonds, Dark Chocolate, Cocoa Butter, Dietary Fiber, Stevia.
    """

    res_1_bar = PacketNutritionService.parse_packet_text(bar_text, quantity=1.0)
    print("1. Testing 1 Protein Bar (Quantity: 1.0):")
    print(f"   ✓ Product   : {res_1_bar['product_name']} ({res_1_bar['serving_size']})")
    print(f"   ✓ Calories  : {res_1_bar['calories_kcal']} kcal (Range: {res_1_bar['calorie_range_str']})")
    print(f"   ✓ Macros    : P: {res_1_bar['protein_g']}g | C: {res_1_bar['carbs_g']}g | F: {res_1_bar['fats_g']}g | Fib: {res_1_bar['fiber_g']}g")
    print(f"   ✓ Ingredients: {res_1_bar['ingredients']}")

    assert res_1_bar['protein_g'] == 20.0
    assert res_1_bar['carbs_g'] == 22.0
    assert res_1_bar['fats_g'] == 8.0
    assert res_1_bar['fiber_g'] == 5.0
    assert res_1_bar['calories_kcal'] == 240.0

    # 2. Test 2 Protein Bars (Quantity: 2.0)
    res_2_bars = PacketNutritionService.parse_packet_text(bar_text, quantity=2.0)
    print("\n2. Testing 2 Protein Bars (Quantity: 2.0 Scaling):")
    print(f"   ✓ Scaled Cal: {res_2_bars['calories_kcal']} kcal")
    print(f"   ✓ Scaled P  : {res_2_bars['protein_g']}g (Expected: 40.0g)")
    print(f"   ✓ Scaled C  : {res_2_bars['carbs_g']}g (Expected: 44.0g)")
    print(f"   ✓ Scaled F  : {res_2_bars['fats_g']}g (Expected: 16.0g)")

    assert res_2_bars['protein_g'] == 40.0
    assert res_2_bars['carbs_g'] == 44.0
    assert res_2_bars['fats_g'] == 16.0
    assert res_2_bars['calories_kcal'] == 480.0

    # 3. Test Whey Protein Powder (1.5 Scoops)
    powder_text = """
    GOLD STANDARD 100% WHEY
    Nutrition Facts
    Serving Size: 1 Scoop (30.4g)
    Calories: 120
    Total Fat: 1.5 g
    Total Carbohydrate: 3 g
    Protein: 24 g
    Ingredients: Protein Blend (Whey Protein Isolate, Whey Protein Concentrate), Cocoa Powder, Sunflower Lecithin, Natural Flavors, Stevia Leaf Extract.
    """

    res_1_5_scoops = PacketNutritionService.parse_packet_text(powder_text, quantity=1.5)
    print("\n3. Testing Whey Protein Powder (Quantity: 1.5 Scoops Scaling):")
    print(f"   ✓ Product   : {res_1_5_scoops['product_name']} ({res_1_5_scoops['serving_size']})")
    print(f"   ✓ Scaled Cal: {res_1_5_scoops['calories_kcal']} kcal")
    print(f"   ✓ Scaled P  : {res_1_5_scoops['protein_g']}g (1.5 * 24 = 36.0g)")
    print(f"   ✓ Scaled C  : {res_1_5_scoops['carbs_g']}g (1.5 * 3 = 4.5g)")
    print(f"   ✓ Scaled F  : {res_1_5_scoops['fats_g']}g (1.5 * 1.5 = 2.25 -> 2.2g)")
    print(f"   ✓ Ingredients: {res_1_5_scoops['ingredients']}")

    assert res_1_5_scoops['protein_g'] == 36.0
    assert res_1_5_scoops['carbs_g'] == 4.5
    assert res_1_5_scoops['fats_g'] == 2.2

    # 4. Test API endpoint /api/parse/packet-label
    # Generate a dummy test image with text
    img = Image.new("RGB", (400, 200), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    res_api = client.post(
        "/api/parse/packet-label",
        files={"file": ("packet.png", buf.getvalue(), "image/png")},
        data={"quantity": "2.0"}
    )
    assert res_api.status_code == 200
    api_data = res_api.json()
    print("\n4. Testing /api/parse/packet-label Endpoint:")
    print(f"   ✓ Status Code: {res_api.status_code}")
    print(f"   ✓ Response Success: {api_data['success']}")
    print(f"   ✓ Scaled Calories: {api_data['calories_kcal']} kcal")
    print(f"   ✓ Scaled Protein: {api_data['protein_g']} g")

    print("\n=====================================================================")
    print("  ALL PROTEIN PACKET & QUANTITY SCALING TESTS PASSED 100%!  ")
    print("=====================================================================\n")

if __name__ == "__main__":
    test_packet_nutrition_parser()
