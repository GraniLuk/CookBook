import pathlib
from typing import Iterable

import yaml

from list_tags import collect_tags


def slugify(value: str) -> str:
    return value.strip()


def write_tag_files(tags: Iterable[str], data_dir: pathlib.Path) -> None:
    data_dir.mkdir(parents=True, exist_ok=True)
    for tag in tags:
        filename = slugify(tag).replace("/", "-")
        target = data_dir / f"{filename}.yaml"
        payload = {"label": tag, "value": tag}
        target.write_text(yaml.safe_dump(payload, allow_unicode=True), encoding="utf-8")


def main() -> None:
    project_root = pathlib.Path(__file__).resolve().parents[1]
    content_dir = project_root / "content"
    tags_dir = project_root / "data" / "tags"
    tags = sorted(collect_tags(content_dir), key=str.casefold)
    write_tag_files(tags, tags_dir)


if __name__ == "__main__":
    main()
