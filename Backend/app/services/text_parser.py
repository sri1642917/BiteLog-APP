import re
from typing import Optional, Tuple, List

class TextParser:
    @staticmethod
    def clean_number(val_str: str) -> Optional[float]:
        if not val_str:
            return None
        cleaned = val_str.replace(",", "").strip()
        try:
            return float(cleaned)
        except ValueError:
            return None

    @classmethod
    def _parse_markdown_table(cls, text: str) -> Tuple[Optional[float], Optional[float]]:
        """Parses markdown or pipe-separated tables for calories and protein columns/rows."""
        lines = [line.strip() for line in text.splitlines() if "|" in line]
        if len(lines) < 2:
            return None, None

        header_idx_cal = -1
        header_idx_prot = -1

        for line in lines:
            cells = [c.strip().lower() for c in line.split("|") if c.strip() != ""]
            for idx, cell in enumerate(cells):
                if "calor" in cell or "kcal" in cell:
                    header_idx_cal = idx
                elif "protein" in cell:
                    header_idx_prot = idx

            # If this is a summary/total row: e.g. | Total | 2,150 kcal | 120 g |
            if any("total" in c for c in cells):
                cal_val = None
                prot_val = None
                if header_idx_cal != -1 and header_idx_cal < len(cells):
                    m = re.search(r"([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)", cells[header_idx_cal])
                    if m:
                        cal_val = cls.clean_number(m.group(1))
                if header_idx_prot != -1 and header_idx_prot < len(cells):
                    m = re.search(r"([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)", cells[header_idx_prot])
                    if m:
                        prot_val = cls.clean_number(m.group(1))
                if cal_val is not None or prot_val is not None:
                    return cal_val, prot_val

        return None, None

    @classmethod
    def extract_nutrition(cls, text: str) -> Tuple[Optional[float], Optional[float], str]:
        """
        Extracts (calories_kcal, protein_g, confidence_note) from arbitrary text.
        Tracks ONLY total calories and total protein.
        """
        if not text or not text.strip():
            return None, None, "Empty text provided"

        calories: Optional[float] = None
        protein: Optional[float] = None

        # Check markdown table first
        tbl_cal, tbl_prot = cls._parse_markdown_table(text)
        if tbl_cal is not None:
            calories = tbl_cal
        if tbl_prot is not None:
            protein = tbl_prot

        # Regex patterns for Calories:
        calorie_patterns = [
            r"(?:total\s+calories?|total\s+kcal|total\s+energy)\s*[:=-]?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(?:kcal|calories?|cal)?",
            r"(?:calories?|kcal|energy)\s*[:=-]?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(?:kcal|calories?|cal)\b",
            r"([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(?:kcal|calories?)\b",
            r"(?:calories?|kcal)\s*[:=-]\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)",
        ]

        # Regex patterns for Protein:
        protein_patterns = [
            r"(?:total\s+protein)\s*[:=-]?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(?:g|grams?)\b",
            r"(?:protein)\s*[:=-]?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(?:g|grams?)\b",
            r"([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(?:g|grams?)\s*(?:of\s+)?protein\b",
            r"(?:protein)\s*[:=-]\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)",
        ]

        # Scan text for calories if not found yet
        if calories is None:
            for pattern in calorie_patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for m in matches:
                    val = cls.clean_number(m.group(1))
                    if val is not None and val > 0:
                        calories = val
                        break
                if calories is not None:
                    break

        # Scan text for protein if not found yet
        if protein is None:
            for pattern in protein_patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for m in matches:
                    val = cls.clean_number(m.group(1))
                    if val is not None and val >= 0:
                        protein = val
                        break
                if protein is not None:
                    break

        # Line-by-line fallback if unstructured
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if calories is None or protein is None:
            for line in lines:
                lower = line.lower()
                if calories is None and ("calor" in lower or "kcal" in lower):
                    num_match = re.search(r"([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)", line)
                    if num_match:
                        calories = cls.clean_number(num_match.group(1))
                if protein is None and "protein" in lower:
                    num_match = re.search(r"([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)", line)
                    if num_match:
                        protein = cls.clean_number(num_match.group(1))

        # OCR artifact cleanup: if protein > 250 and ends with 9 (where 'g' was read as '9'), correct it
        if protein is not None and protein > 250:
            p_str = str(int(protein))
            if p_str.endswith("9"):
                candidate = float(p_str[:-1])
                if 10 <= candidate <= 250:
                    protein = candidate

        notes = []
        if calories is not None:
            notes.append(f"Calories: {calories:g} kcal")
        else:
            notes.append("Calories could not be detected")

        if protein is not None:
            notes.append(f"Protein: {protein:g} g")
        else:
            notes.append("Protein could not be detected")

        return calories, protein, "; ".join(notes)
