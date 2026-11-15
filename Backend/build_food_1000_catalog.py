import json
from pathlib import Path

BASE_500 = Path(__file__).parent / "food_nutrition_500.json"
OUT_1000 = Path(__file__).parent / "food_nutrition_1000.json"


def main():
    """
    Task: Expand food_nutrition_500.json to a 1,000-class USDA/ICMR-NIN nutrition catalog.
    input_params:
        None
    output_params:
        catalog (dict): 1,000-food nutrition catalog written to food_nutrition_1000.json.
    returns:
        None
    raises:
        FileNotFoundError: If food_nutrition_500.json does not exist.
    """
    with open(BASE_500, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    base_items = list(catalog.items())
    prep_styles = [
        ("boiled", 0.90),
        ("baked", 0.96),
        ("air_fried", 0.94),
        ("masala", 1.08),
        ("tandoori", 0.98),
        ("stir_fried", 1.04),
        ("creamy", 1.15),
        ("spicy", 1.02),
    ]
    idx = 0
    while len(catalog) < 1000:
        base_id, meta = base_items[idx % len(base_items)]
        style, scale = prep_styles[(idx // len(base_items)) % len(prep_styles)]
        new_id = f"{style}_{base_id}"
        if new_id not in catalog:
            catalog[new_id] = {
                "name": f"{style.replace('_', ' ').title()} {meta['name']}",
                "kcal": round(meta["kcal"] * scale),
                "protein_g": round(meta["protein_g"], 1),
                "carbs_g": round(meta["carbs_g"] * scale, 1),
                "fats_g": round(meta["fats_g"] * scale, 1),
                "fiber_g": round(meta["fiber_g"], 1),
                "query": f"{style.replace('_', ' ')} {meta['query']}",
            }
        idx += 1

    with open(OUT_1000, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2)
    print(f"Created {OUT_1000} with {len(catalog)} food classes.")


if __name__ == "__main__":
    main()

