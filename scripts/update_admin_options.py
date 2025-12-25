"""
Regenerate the tag and ingredient options in static/admin/config.yml from current content.
"""

import argparse
import pathlib
import re
import sys

import yaml


def find_project_root(start_path: pathlib.Path) -> pathlib.Path:
    """Find the project root by searching upwards for a directory containing 'content' and 'static'."""
    current = start_path
    while current != current.parent:
        if (current / "content").is_dir() and (current / "static").is_dir():
            return current
        current = current.parent
    raise ValueError(
        "Could not find project root with 'content' and 'static' directories."
    )


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


def get_current_options(config_path: pathlib.Path) -> tuple[set[str], set[str]]:
    config_text = config_path.read_text(encoding="utf-8")
    config = yaml.safe_load(config_text)
    tags = set()
    ingredients = set()
    if "_shared_fields" in config:
        shared = config["_shared_fields"]
        if "tags_field" in shared:
            tags_options = shared["tags_field"].get("options", [])
            for opt in tags_options:
                if isinstance(opt, dict) and "value" in opt:
                    tags.add(opt["value"])
        if "ingredients_field" in shared:
            ing_options = shared["ingredients_field"].get("options", [])
            for opt in ing_options:
                if isinstance(opt, dict) and "value" in opt:
                    ingredients.add(opt["value"])
    return tags, ingredients


def main() -> None:
    parser = argparse.ArgumentParser(description="Update or check CMS config options.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check if all tags and ingredients are in config, fail if not.",
    )
    args = parser.parse_args()

    script_dir = pathlib.Path(__file__).resolve().parent
    project_root = find_project_root(script_dir)
    content_dir = project_root / "content"
    config_path = project_root / "static" / "admin" / "config.yml"

    tags = sorted(collect_tags(content_dir), key=str.casefold)
    ingredients = sorted(collect_ingredients(content_dir), key=str.casefold)

    if args.check:
        current_tags, current_ingredients = get_current_options(config_path)
        missing_tags = set(tags) - current_tags
        missing_ingredients = set(ingredients) - current_ingredients
        if missing_tags or missing_ingredients:
            print("Missing options in CMS config:")
            if missing_tags:
                print(f"Tags: {sorted(missing_tags)}")
            if missing_ingredients:
                print(f"Ingredients: {sorted(missing_ingredients)}")
            sys.exit(1)
        else:
            print("All tags and ingredients are present in CMS config.")
        return

        return

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
