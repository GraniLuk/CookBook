"""
Regenerate the tag and ingredient options in static/admin/config.yml from current content.
"""

import pathlib
import re

import yaml


def collect_tags(content_dir: pathlib.Path) -> set[str]:
    tags: set[str] = set()
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
            raw_tags = data.get("tags", [])
            if isinstance(raw_tags, list):
                tags.update(str(tag) for tag in raw_tags)
    return tags


def collect_ingredients(content_dir: pathlib.Path) -> set[str]:
    ingredients: set[str] = set()
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
    config_path = project_root / "static" / "admin" / "config.yml"

    tags = sorted(collect_tags(content_dir), key=str.casefold)
    ingredients = sorted(collect_ingredients(content_dir), key=str.casefold)

    # Build the options block for tags
    tag_options_lines = ["    options:"]
    for tag in tags:
        # Escape quotes in tag values
        safe_tag = tag.replace('"', '\\"')
        tag_options_lines.append(
            f'      - {{ label: "{safe_tag}", value: "{safe_tag}" }}'
        )
    tag_options_block = "\n".join(tag_options_lines)

    # Build the options block for ingredients
    ingredient_options_lines = ["    options:"]
    for ingredient in ingredients:
        # Escape quotes in ingredient values
        safe_ingredient = ingredient.replace('"', '\\"')
        ingredient_options_lines.append(
            f'      - {{ label: "{safe_ingredient}", value: "{safe_ingredient}" }}'
        )
    ingredient_options_block = "\n".join(ingredient_options_lines)

    config_text = config_path.read_text(encoding="utf-8")

    # Find and replace the options block for the Tagi field
    tag_pattern = re.compile(
        r"(  tags_field: &tags_field\n"
        r"    label: Tagi\n"
        r"    name: tags\n"
        r"    widget: select\n"
        r"    multiple: true\n"
        r"    required: false\n)"
        r"    options:.*?"
        r"(\n    hint:)",
        re.DOTALL,
    )

    # Find and replace the options block for the Składniki field
    ingredient_pattern = re.compile(
        r"(  ingredients_field: &ingredients_field\n"
        r"    label: Składniki\n"
        r"    name: ingredients\n"
        r"    widget: select\n"
        r"    multiple: true\n"
        r"    required: false\n)"
        r"    options:.*?"
        r"(\n    hint:)",
        re.DOTALL,
    )

    new_config = tag_pattern.sub(r"\1" + tag_options_block + r"\2", config_text)
    new_config = ingredient_pattern.sub(
        r"\1" + ingredient_options_block + r"\2", new_config
    )

    if new_config == config_text:
        print("No changes needed—options blocks not found or already up to date.")
    else:
        config_path.write_text(new_config, encoding="utf-8")
        print(
            f"Updated config.yml with {len(tags)} tags and {len(ingredients)} ingredients."
        )


if __name__ == "__main__":
    main()
