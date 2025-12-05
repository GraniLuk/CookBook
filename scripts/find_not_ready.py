import os

import frontmatter


def find_md_not_ready(directory):
    """
    Find all Markdown files in the given directory that are not ready.
    Not ready means: no frontmatter, malformed frontmatter, draft: true in frontmatter, or 'draft' in file path.
    """
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".md"):
                filepath = os.path.join(root, file)
                abs_filepath = os.path.abspath(filepath)
                # Create a file URI that handles spaces
                uri_path = abs_filepath.replace('\\', '/').replace(' ', '%20')
                if not uri_path.startswith('/'):
                    uri_path = '/' + uri_path
                file_uri = f"file://{uri_path}"

                try:
                    post = frontmatter.load(filepath)
                    if not post.metadata:
                        print(f"No frontmatter: {file_uri}")
                        count += 1
                    elif post.metadata.get("draft", False):
                        print(f"Draft: {file_uri}")
                        count += 1
                    elif "draft" in filepath.lower():
                        print(f"Draft (path): {file_uri}")
                        count += 1
                except Exception as e:
                    print(f"Malformed frontmatter: {file_uri} - Error: {e}")
                    count += 1
    print(f"\nSummary: Found {count} Markdown files that are not ready.")


if __name__ == "__main__":
    content_dir = "content"
    find_md_not_ready(content_dir)
