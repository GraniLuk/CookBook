"""
Find recipes that contain a specific tag.
Usage: python find_recipes_with_tag.py <tag>
"""

import argparse
import os
import pathlib

import yaml


def find_recipes_with_tag(content_dir: pathlib.Path, tag: str) -> list[pathlib.Path]:
    recipes = []
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
            if isinstance(raw_tags, list) and tag in raw_tags:
                recipes.append(path)
    return recipes


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Find recipes containing a specific tag."
    )
    parser.add_argument("tag", help="The tag to search for")
    args = parser.parse_args()

    project_root = pathlib.Path(__file__).resolve().parents[1]
    content_dir = project_root / "content"

    recipes = find_recipes_with_tag(content_dir, args.tag)
    if recipes:
        print(f"Recipes with tag '{args.tag}':")
        for recipe in sorted(recipes):
            abs_filepath = os.path.abspath(recipe)
            uri_path = abs_filepath.replace("\\", "/").replace(" ", "%20")
            if not uri_path.startswith("/"):
                uri_path = "/" + uri_path
            file_uri = f"file://{uri_path}"
            print(f"  {file_uri}")
    else:
        print(f"No recipes found with tag '{args.tag}'.")


if __name__ == "__main__":
    main()
