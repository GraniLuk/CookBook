import pathlib
from typing import Set

import yaml


def collect_ingredients(content_dir: pathlib.Path) -> Set[str]:
    ingredients: Set[str] = set()
    for path in content_dir.glob("**/*.md"):
        text = path.read_text(encoding="utf-8")
        if not text.startswith("---"):
            continue
        parts = text.split("---", 2)
        if len(parts) < 3:
            continue
        try:
            data = yaml.safe_load(parts[1])
        except yaml.YAMLError:
            continue
        if isinstance(data, dict):
            raw_ingredients = data.get("ingredients", [])
            if isinstance(raw_ingredients, list):
                ingredients.update(str(ing) for ing in raw_ingredients)
    return ingredients


def main() -> None:
    project_root = pathlib.Path(__file__).resolve().parents[1]
    content_dir = project_root / "content"
    ingredients = collect_ingredients(content_dir)
    for ingredient in sorted(ingredients, key=str.casefold):
        print(ingredient)


if __name__ == "__main__":
    main()
