"""
Find recipes that have an author field set, optionally filtering by a specific author.
Usage: python find_recipes_with_author.py [author]
"""

import argparse
import os
import pathlib

import yaml


def find_recipes_with_author(
    content_dir: pathlib.Path, author: str
) -> list[pathlib.Path]:
    recipes = []
    for path in content_dir.glob("**/*.md"):
        if "_drafts" in path.parts:
            continue
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
        if isinstance(data, dict) and "author" in data and data["author"]:
            if author is None or data["author"] == author:
                recipes.append(path)
    return recipes


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Find recipes with an author field set, optionally filtering by specific author."
    )
    parser.add_argument(
        "author", nargs="?", help="The specific author to search for (optional)"
    )
    args = parser.parse_args()

    project_root = pathlib.Path(__file__).resolve().parents[1]
    content_dir = project_root / "content"

    recipes = find_recipes_with_author(content_dir, args.author)
    if recipes:
        filter_desc = f" '{args.author}'" if args.author else ""
        print(f"Recipes with author{filter_desc} set ({len(recipes)}):")
        for recipe in sorted(recipes):
            abs_filepath = os.path.abspath(recipe)
            uri_path = abs_filepath.replace("\\", "/").replace(" ", "%20")
            if not uri_path.startswith("/"):
                uri_path = "/" + uri_path
            file_uri = f"file://{uri_path}"
            print(f"  {file_uri}")
    else:
        filter_desc = f" '{args.author}'" if args.author else ""
        print(f"No recipes found with author{filter_desc} set.")


if __name__ == "__main__":
    main()
