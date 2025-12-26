import argparse
import os
import sys
from pathlib import Path

try:
    import frontmatter
    import yaml
except ImportError:
    print(
        "Error: 'python-frontmatter' is required. Install it with: pip install python-frontmatter"
    )
    sys.exit(1)

# Define the desired order of keys based on archetypes/default.md
# This order MUST match the recipe_fields order in static/admin/config.yml
ORDER = [
    "title",
    "author",
    "categories",
    "subcategories",
    "draft",
    "readyToTest",
    "queued",
    "favourite",
    "recipe_image",
    "date",
    "tags",
    "tagline",
    "link",
    "video_file",
    "video_file2",
    "ingredients",
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

# Define keys that must be present in official recipes (draft: false)
REQUIRED_KEYS = [
    "title",
    "author",
    "recipe_image",
    "date",
    "tags",
    "tagline",
    "ingredients",
    "servings",
    "prep_time",
    "cook_time",
    "calories",
    "protein",
    "fat",
    "carbohydrate",
]


def reorder_metadata(metadata):
    new_metadata = {}
    # Add keys in defined order if they exist
    for key in ORDER:
        if key in metadata:
            new_metadata[key] = metadata[key]

    # Add any remaining keys that weren't in the list (append to end)
    for key in metadata:
        if key not in ORDER:
            new_metadata[key] = metadata[key]

    return new_metadata


def validate_metadata(metadata, filename):
    # Skip validation for drafts or if draft is missing
    if metadata.get("draft") is True or metadata.get("draft") is None:
        return True

    missing_keys = [key for key in REQUIRED_KEYS if key not in metadata]

    if missing_keys:
        print(f"ERROR: {filename} missing keys: {', '.join(missing_keys)}")
        return False
    return True


# Custom dumper to improve YAML formatting
class CustomDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True


def process_directory(content_dir, check_only=False):
    count = 0
    errors = 0

    for root, dirs, files in os.walk(content_dir):
        for file in files:
            if file.endswith(".md") and not file.startswith("_index"):
                file_path = os.path.join(root, file)
                try:
                    # Load the file
                    post = frontmatter.load(file_path)

                    # Validate metadata
                    is_valid = validate_metadata(post.metadata, file)
                    if not is_valid:
                        errors += 1

                    # Reorder metadata
                    original_keys = list(post.metadata.keys())
                    post.metadata = reorder_metadata(post.metadata)
                    new_keys = list(post.metadata.keys())

                    # Check if content would change (order or formatting)
                    # We dump to string to compare exact output
                    original_content = frontmatter.dumps(
                        post, Dumper=CustomDumper, sort_keys=False
                    )

                    # To check if it changed, we need to compare with what's on disk.
                    # However, frontmatter.load parses it.
                    # Simplest check for reordering is checking keys.
                    # For formatting, we might need to read raw file, but let's stick to key order for now as primary check.

                    needs_change = original_keys != new_keys

                    if needs_change:
                        if check_only:
                            print(f"ERROR: Incorrect frontmatter order in {file}")
                            errors += 1
                        else:
                            with open(file_path, "wb") as f:
                                # sort_keys=False is CRITICAL to preserve our custom order
                                frontmatter.dump(
                                    post,
                                    f,
                                    Dumper=CustomDumper,
                                    allow_unicode=True,
                                    default_flow_style=False,
                                    sort_keys=False,
                                    width=1000,  # Prevent aggressive line wrapping
                                )
                            print(f"Fixed order: {file}")
                            count += 1
                    elif not is_valid and check_only:
                        # Already counted error above
                        pass

                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    errors += 1

    if check_only:
        if errors > 0:
            print(f"\nFound {errors} issues.")
            sys.exit(1)
        else:
            print("\nAll files passed validation.")
    else:
        print(f"\nDone! Reordered front matter in {count} files.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Normalize and validate Hugo frontmatter."
    )
    parser.add_argument(
        "--check", action="store_true", help="Check for issues without modifying files."
    )
    args = parser.parse_args()

    # Determine content directory relative to this script
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    content_dir = root_dir / "content"

    print(f"Scanning {content_dir}...")
    process_directory(content_dir, check_only=args.check)
