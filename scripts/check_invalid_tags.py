import os

import frontmatter

# Lista usuniętych tagów (składnikowych)
removed_tags = [
    "awokado",
    "bagietka",
    "berberys",
    "brokuł",
    "cebula",
    "cynamon",
    "cukinia",
    "draft",
    "gnocchi",
    "gorgonzola",
    "jabłka",
    "jajka",
    "jajko",
    "jaglane",
    "kinder bueno",
    "kurczak",
    "kuskus",
    "makaron",
    "migdały",
    "oliwki",
    "oregano",
    "panko",
    "pieczarki",
    "pistacje",
    "pomidory",
    "rzodkiewka",
    "sałatka",
    "ser cheddar",
    "ser mozzarella",
    "ser śmietankowy",
    "suszone pomidory",
    "szpinak",
    "szynka wędzona",
    "śliwki",
    "łosoś",
    "twaróg",
    "tuńczyk",
]

# Przejdź przez wszystkie pliki .md w folderze content
for root, dirs, files in os.walk("content"):
    for file in files:
        if file.endswith(".md"):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    post = frontmatter.load(f)
                    tags = post.get("tags", [])
                    # Znajdź nieprawidłowe tagi
                    if isinstance(tags, list):
                        invalid = [tag for tag in tags if tag in removed_tags]
                    else:
                        invalid = []
                    if invalid:
                        print(f"{path}: nieprawidłowe tagi: {invalid}")
            except Exception as e:
                print(f"Błąd w pliku {path}: {e}")

print("Skanowanie zakończone.")
