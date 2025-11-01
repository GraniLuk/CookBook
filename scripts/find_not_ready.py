import os
import frontmatter

def find_md_without_proper_frontmatter(directory):
    """
    Find all Markdown files in the given directory that do not have proper frontmatter.
    Proper frontmatter means it starts with ---, contains valid YAML, and ends with ---.
    """
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                try:
                    post = frontmatter.load(filepath)
                    if not post.metadata:
                        print(f"No frontmatter: {filepath}")
                        count += 1
                except Exception as e:
                    print(f"Malformed frontmatter: {filepath} - Error: {e}")
                    count += 1
    print(f"\nSummary: Found {count} Markdown files without proper frontmatter.")

if __name__ == "__main__":
    content_dir = 'content'
    find_md_without_proper_frontmatter(content_dir)
