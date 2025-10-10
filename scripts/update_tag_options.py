"""
Regenerate the tag options in static/admin/config.yml from current content.
"""
import pathlib
import re

from list_tags import collect_tags


def main() -> None:
    project_root = pathlib.Path(__file__).resolve().parents[1]
    content_dir = project_root / "content"
    config_path = project_root / "static" / "admin" / "config.yml"

    tags = sorted(collect_tags(content_dir), key=str.casefold)

    # Build the options block
    options_lines = ["        options:"]
    for tag in tags:
        # Escape quotes in tag values
        safe_tag = tag.replace('"', '\\"')
        options_lines.append(f'          - {{ label: "{safe_tag}", value: "{safe_tag}" }}')
    options_block = "\n".join(options_lines)

    config_text = config_path.read_text(encoding="utf-8")

    # Find and replace the options block for the Tagi field
    pattern = re.compile(
        r"(      - label: Tagi\n"
        r"        name: tags\n"
        r"        widget: select\n"
        r"        multiple: true\n"
        r"        required: false\n)"
        r"        options:.*?"
        r"(\n        hint:)",
        re.DOTALL,
    )

    replacement = r"\1" + options_block + r"\2"
    new_config = pattern.sub(replacement, config_text)

    if new_config == config_text:
        print("No changes needed—options block not found or already up to date.")
    else:
        config_path.write_text(new_config, encoding="utf-8")
        print(f"Updated config.yml with {len(tags)} tags.")


if __name__ == "__main__":
    main()
