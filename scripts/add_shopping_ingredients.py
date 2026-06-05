import argparse
import re
import sys
import unicodedata
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

try:
    import frontmatter
    import yaml
except ImportError:
    print(
        "Error: 'python-frontmatter' and 'PyYAML' are required. "
        "Install them with: pip install python-frontmatter PyYAML"
    )
    sys.exit(1)


ORDER = [
    "title",
    "author",
    "categories",
    "subcategories",
    "draft",
    "readyToTest",
    "queued",
    "priority",
    "favourite",
    "link",
    "recipe_image",
    "video_file",
    "video_file2",
    "date",
    "tags",
    "tagline",
    "ingredients",
    "shopping_ingredients",
    "servings",
    "prep_time",
    "cook",
    "cook_increment",
    "cook_time",
    "calories",
    "protein",
    "fat",
    "carbohydrate",
    "diets",
    "fodmap",
]

UNIT_ALIASES = {
    "g": "g",
    "gram": "g",
    "gramy": "g",
    "gramów": "g",
    "kg": "kg",
    "ml": "ml",
    "l": "l",
    "litr": "l",
    "litra": "l",
    "litry": "l",
    "szt": "szt.",
    "szt.": "szt.",
    "sztuka": "szt.",
    "sztuki": "szt.",
    "sztuk": "szt.",
    "ząbek": "ząbek",
    "ząbki": "ząbki",
    "ząbków": "ząbki",
    "łyżka": "łyżka",
    "łyżki": "łyżki",
    "łyżek": "łyżki",
    "łyżeczka": "łyżeczka",
    "łyżeczki": "łyżeczki",
    "łyżeczek": "łyżeczki",
    "szklanka": "szklanka",
    "szklanki": "szklanki",
    "szklanek": "szklanki",
    "puszka": "puszka",
    "puszki": "puszki",
    "puszek": "puszki",
    "opakowanie": "opak.",
    "opakowania": "opak.",
    "opakowań": "opak.",
    "opak.": "opak.",
    "kromka": "kromka",
    "kromki": "kromki",
    "kromek": "kromki",
    "plaster": "plaster",
    "plastry": "plastry",
    "plasterki": "plastry",
    "plastrów": "plastry",
    "garść": "garść",
    "garście": "garście",
    "garści": "garście",
    "torebka": "torebka",
    "torebki": "torebki",
}

UNIT_PATTERN = "|".join(
    sorted((re.escape(unit) for unit in UNIT_ALIASES), key=len, reverse=True)
)

PANTRY_PATTERNS = [
    r"\bsól\b",
    r"\bsoli\b",
    r"\bpieprz\b",
    r"\bpieprzu\b",
    r"\bwoda\b",
    r"\bwody\b",
    r"\bwrzątek\b",
    r"\blód\b",
]

SECTION_HEADER_RE = re.compile(r"^(?P<hashes>#{2,6})\s+(?P<title>.+?)\s*$")
BULLET_RE = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+(?P<text>.+?)\s*$")
TRAILING_EXACT_RE = re.compile(
    rf"\s[-–]\s(?P<amount>\d+(?:[,.]\d+)?(?:\s*[-–]\s*\d+(?:[,.]\d+)?)?)\s*(?P<unit>{UNIT_PATTERN})\s*$",
    re.IGNORECASE,
)
LEADING_RE = re.compile(
    rf"^(?P<amount>\d+(?:[,.]\d+)?(?:\s*[-–]\s*\d+(?:[,.]\d+)?)?|\d+/\d+|[½¼¾⅓⅔]|pół|kilka)\s*(?P<unit>{UNIT_PATTERN})?\s+(?P<name>.+)$",
    re.IGNORECASE,
)
LEADING_RANGE_WITH_UNITS_RE = re.compile(
    rf"^(?P<amount1>\d+(?:[,.]\d+)?)\s*(?P<unit1>{UNIT_PATTERN})\s*[-–]\s*(?P<amount2>\d+(?:[,.]\d+)?)\s*(?P<unit2>{UNIT_PATTERN})\s+(?P<name>.+)$",
    re.IGNORECASE,
)
PAREN_AMOUNT_RE = re.compile(
    rf"\((?:ok\.?\s*)?(?P<amount>\d+(?:[,.]\d+)?(?:\s*[-–]\s*\d+(?:[,.]\d+)?)?)\s*(?P<unit>{UNIT_PATTERN})\)",
    re.IGNORECASE,
)
LEADING_MEASURE_RE = re.compile(
    rf"^(?:(?:duże|duża|duży|średnie|średnia|średni|małe|mała|mały|czubate|płaskie)\s+)*(?P<unit>{UNIT_PATTERN})\s+(?P<name>.+)$",
    re.IGNORECASE,
)


class CustomDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True


def normalize_unit(unit):
    if not unit:
        return ""
    key = unit.strip().lower().rstrip(",.;")
    return UNIT_ALIASES.get(key, key)


def parse_number(value):
    value = str(value).strip().lower().replace(",", ".")
    fractions = {"½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "pół": 0.5}
    if value in fractions:
        return round(fractions[value], 2)
    if value == "kilka":
        return 1
    if "/" in value and re.fullmatch(r"\d+/\d+", value):
        numerator, denominator = value.split("/")
        return round(int(numerator) / int(denominator), 2)
    if re.search(r"\d\s*[-–]\s*\d", value):
        left, right = re.split(r"\s*[-–]\s*", value, maxsplit=1)
        return round((float(left) + float(right)) / 2, 2)
    number = float(value)
    return int(number) if number.is_integer() else number


def strip_markdown(text):
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = text.replace("**", "").replace("__", "").replace("`", "")
    return text.strip()


def split_note(text):
    note_parts = []

    def collect_parenthetical(match):
        note_parts.append(match.group(1).strip())
        return ""

    text = re.sub(r"\(([^)]*)\)", collect_parenthetical, text)
    if "," in text:
        text, after = text.split(",", 1)
        note_parts.append(after.strip())

    name = re.sub(r"\s+", " ", text).strip(" -–:;.")
    note = "; ".join(part for part in note_parts if part)
    return name, note


def singularish(name):
    replacements = {
        "cebule": "cebula",
        "marchewki": "marchew",
        "kuminu": "kumin",
        "masła klarowanego": "masło klarowane",
        "ostrej papryczki chili": "papryczka chili",
        "suszonych pomidorów": "pomidory suszone",
        "pomidorów pelati": "pomidory Pelati",
        "rosołu wołowego lub drobiowego": "rosół wołowy lub drobiowy",
        "pomidory": "pomidory",
        "pomidorki": "pomidorki",
        "ogórki": "ogórki",
        "ziemniaki": "ziemniaki",
        "jajka": "jajka",
        "bułki": "bułki",
        "tortille": "tortille",
    }
    words = name.split()
    while words and words[0].lower() in {
        "duże",
        "duża",
        "duży",
        "dużych",
        "średnie",
        "średnia",
        "średni",
        "średnich",
        "małe",
        "mała",
        "mały",
        "małych",
        "całe",
        "całych",
        "garść",
        "posiekane",
        "starty",
        "starta",
        "świeża",
        "świeży",
        "świeże",
        "mielona",
        "mielonej",
        "mielone",
    }:
        words = words[1:]
    cleaned = " ".join(words).strip()
    return replacements.get(cleaned.lower(), cleaned)


def normalize_for_match(text):
    polish = str.maketrans(
        {
            "ą": "a",
            "ć": "c",
            "ę": "e",
            "ł": "l",
            "ń": "n",
            "ó": "o",
            "ś": "s",
            "ź": "z",
            "ż": "z",
        }
    )
    text = text.lower()
    text = text.translate(polish)
    text = "".join(
        ch
        for ch in unicodedata.normalize("NFKD", text)
        if not unicodedata.combining(ch)
    )
    return re.sub(r"[^a-z0-9 ]+", " ", text)


def token_stem(token):
    return token[:5] if len(token) >= 5 else token


def canonical_name(raw_name, frontmatter_ingredients):
    raw_norm = normalize_for_match(raw_name)
    if "suszon" in raw_norm:
        required_modifier = "suszon"
    elif "pelati" in raw_norm:
        required_modifier = "pelati"
    elif "koktajl" in raw_norm:
        required_modifier = "koktajl"
    elif "rosol" in raw_norm or "bulion" in raw_norm:
        required_modifier = "rosol"
    else:
        required_modifier = None
    raw_stems = {token_stem(token) for token in raw_norm.split() if len(token) >= 3}
    best = None
    best_score = 0

    for ingredient in frontmatter_ingredients:
        if not isinstance(ingredient, str):
            continue
        ing_norm = normalize_for_match(ingredient)
        if required_modifier == "rosol" and "rosol" not in ing_norm and "bulion" not in ing_norm:
            continue
        if required_modifier and required_modifier != "rosol" and required_modifier not in ing_norm:
            continue
        ing_tokens = [token for token in ing_norm.split() if len(token) >= 3]
        if not ing_tokens:
            continue
        ing_stems = {token_stem(token) for token in ing_tokens}
        matched = ing_stems & raw_stems
        required = len(ing_stems)
        if len(matched) == required:
            score = len(" ".join(ing_tokens))
        elif required == 1 and matched:
            score = len(next(iter(ing_stems)))
        else:
            continue
        if score > best_score:
            best = ingredient
            best_score = score

    return best or raw_name


def should_skip(text):
    lower = text.lower()
    if lower.endswith(":") and not re.search(r"\d|[½¼¾⅓⅔]", lower):
        return True
    if lower in {"sos:", "dodatki:", "marynata:", "nadzienie:", "ciasto:", "krem:"}:
        return True
    return any(re.search(pattern, lower) for pattern in PANTRY_PATTERNS) and not re.search(
        r"\b(sos|bulion|woda kokosowa)\b", lower
    )


def extract_ingredient_lines(body):
    lines = body.splitlines()
    in_section = False
    section_level = None
    collected = []

    for line in lines:
        header = SECTION_HEADER_RE.match(line.strip())
        if header:
            title = header.group("title").strip().lower()
            level = len(header.group("hashes"))
            is_ingredients = "składniki" in title or "skladniki" in title
            if is_ingredients and not in_section:
                in_section = True
                section_level = level
                continue
            if in_section and level <= section_level:
                break

        if not in_section:
            continue

        bullet = BULLET_RE.match(line)
        if not bullet:
            continue
        text = strip_markdown(bullet.group("text"))
        if text:
            collected.append(text)

    return collected


def parse_ingredient_line(text, frontmatter_ingredients):
    text = text.strip()
    if should_skip(text):
        return None

    note_parts = []
    amount = None
    unit = ""

    trailing = TRAILING_EXACT_RE.search(text)
    if trailing:
        amount = parse_number(trailing.group("amount"))
        unit = normalize_unit(trailing.group("unit"))
        text = text[: trailing.start()].strip()

    leading = LEADING_RE.match(text)
    range_with_units = LEADING_RANGE_WITH_UNITS_RE.match(text)
    if range_with_units:
        if amount is not None:
            note_parts.append(
                f"{range_with_units.group('amount1')} {normalize_unit(range_with_units.group('unit1'))}-"
                f"{range_with_units.group('amount2')} {normalize_unit(range_with_units.group('unit2'))}"
            )
        else:
            amount = parse_number(
                f"{range_with_units.group('amount1')}-{range_with_units.group('amount2')}"
            )
            unit = normalize_unit(range_with_units.group("unit1"))
        text = range_with_units.group("name").strip()
        leading = None

    if leading:
        leading_amount_raw = leading.group("amount")
        leading_amount = parse_number(leading_amount_raw)
        leading_unit = normalize_unit(leading.group("unit"))
        text = leading.group("name").strip()
        measure = LEADING_MEASURE_RE.match(text)
        if measure and not leading_unit:
            leading_unit = normalize_unit(measure.group("unit"))
            text = measure.group("name").strip()
        if amount is None:
            amount = leading_amount
            unit = leading_unit or "szt."
        elif leading_unit:
            if amount != leading_amount or unit != leading_unit:
                note_parts.append(f"{leading_amount_raw} {leading_unit}")
        else:
            note_parts.append(f"{leading_amount:g} szt.")

    parenthetical = PAREN_AMOUNT_RE.search(text)
    if amount is None and parenthetical:
        amount = parse_number(parenthetical.group("amount"))
        unit = normalize_unit(parenthetical.group("unit"))

    name, note = split_note(text)
    if note:
        note_parts.append(note)

    name = singularish(name)
    name = canonical_name(name, frontmatter_ingredients)
    name = re.sub(r"\s+", " ", name).strip(" -–:;.")

    if not name or should_skip(name):
        return None

    item = {"name": name, "amount": amount if amount is not None else 1}
    if unit:
        item["unit"] = unit
    else:
        item["unit"] = "szt."
    note = "; ".join(part for part in note_parts if part)
    if note:
        item["note"] = note
    return item


def build_shopping_ingredients(post):
    ingredients = post.metadata.get("ingredients") or []
    if not isinstance(ingredients, list):
        ingredients = [ingredients]

    items = []
    seen = set()
    for line in extract_ingredient_lines(post.content):
        item = parse_ingredient_line(line, ingredients)
        if not item:
            continue
        name_key = normalize_for_match(item["name"])
        if name_key in seen:
            continue
        seen.add(name_key)
        items.append(item)

    if items:
        return items, "section"

    fallback = []
    for ingredient in ingredients:
        if isinstance(ingredient, str) and ingredient.strip():
            fallback.append({"name": ingredient.strip(), "amount": 1, "unit": "szt."})
    return fallback, "frontmatter"


def reorder_metadata(metadata):
    reordered = {}
    for key in ORDER:
        if key in metadata:
            reordered[key] = metadata[key]
    for key, value in metadata.items():
        if key not in reordered:
            reordered[key] = value
    return reordered


def process_file(path, dry_run=False, overwrite=False):
    post = frontmatter.load(path)
    if post.metadata.get("shopping_ingredients") and not overwrite:
        return "kept", 0, None

    shopping_ingredients, source = build_shopping_ingredients(post)
    if not shopping_ingredients:
        return "empty", 0, source

    post.metadata["shopping_ingredients"] = shopping_ingredients
    post.metadata = reorder_metadata(post.metadata)

    if not dry_run:
        with open(path, "wb") as handle:
            frontmatter.dump(
                post,
                handle,
                Dumper=CustomDumper,
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
                width=1000,
            )

    return "updated", len(shopping_ingredients), source


def iter_recipe_files(root):
    content = root / "content"
    for directory in (content / "published", content / "queued"):
        if not directory.exists():
            continue
        for path in sorted(directory.rglob("*.md")):
            if path.name.startswith("_index"):
                continue
            yield path


def main():
    parser = argparse.ArgumentParser(
        description="Populate shopping_ingredients for cookbook recipes."
    )
    parser.add_argument("--dry-run", action="store_true", help="Report changes only.")
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Regenerate existing shopping_ingredients too.",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    totals = {"updated": 0, "kept": 0, "empty": 0}
    fallback_files = []

    for path in iter_recipe_files(root):
        status, count, source = process_file(path, args.dry_run, args.overwrite)
        totals[status] += 1
        rel = path.relative_to(root)
        if status == "updated":
            print(f"{'Would update' if args.dry_run else 'Updated'}: {rel} ({count} items, {source})")
        elif status == "empty":
            print(f"No ingredients generated: {rel}")
        if source == "frontmatter":
            fallback_files.append(str(rel))

    print()
    print(
        "Summary: "
        f"updated={totals['updated']}, kept={totals['kept']}, empty={totals['empty']}"
    )
    if fallback_files:
        print("Used frontmatter fallback for:")
        for rel in fallback_files:
            print(f"- {rel}")


if __name__ == "__main__":
    main()
