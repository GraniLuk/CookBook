import pathlib
from typing import Set

import yaml


def collect_tags(content_dir: pathlib.Path) -> Set[str]:
    tags: Set[str] = set()
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


def main() -> None:
    project_root = pathlib.Path(__file__).resolve().parents[1]
    content_dir = project_root / "content"
    tags = collect_tags(content_dir)
    for tag in sorted(tags, key=str.casefold):
        print(tag)


if __name__ == "__main__":
    main()
