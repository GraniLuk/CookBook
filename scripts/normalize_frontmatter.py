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
ORDER = [
    "title",
    "author",
    "categories",
    "subcategories",
    "draft",
    "readyToTest",
    "recipe_image",
    "date",
    "tags",
    "tagline",
    "link",
    "queued",
    "favourite",
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
        return

    missing_keys = [key for key in REQUIRED_KEYS if key not in metadata]

    if missing_keys:
        print(f"WARNING: {filename} missing keys: {', '.join(missing_keys)}")


# Custom dumper to improve YAML formatting
class CustomDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True


def process_directory(content_dir):
    count = 0
    for root, dirs, files in os.walk(content_dir):
        for file in files:
            if file.endswith(".md") and not file.startswith("_index"):
                file_path = os.path.join(root, file)
                try:
                    # Load the file
                    post = frontmatter.load(file_path)

                    # Validate metadata
                    validate_metadata(post.metadata, file)

                    # Reorder metadata
                    original_keys = list(post.metadata.keys())
                    post.metadata = reorder_metadata(post.metadata)
                    new_keys = list(post.metadata.keys())

                    # Write back if keys are different or just to enforce formatting
                    # We write back to ensure consistent YAML formatting even if order was coincidentally correct
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

                    # Visual feedback for changed files
                    if original_keys != new_keys:
                        print(f"Fixed order: {file}")
                        count += 1

                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

    print(f"\nDone! Reordered front matter in {count} files.")


if __name__ == "__main__":
    # Determine content directory relative to this script
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    content_dir = root_dir / "content"

    print(f"Scanning {content_dir}...")
    process_directory(content_dir)
