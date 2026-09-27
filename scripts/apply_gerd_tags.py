"""
Skrypt analizuje i oznacza przepisy tagiem 'gerd-safe' w CookBook.
Tag dodawany jest do 'tags' oraz 'diets', aby współpracować z taxonomią Hugo i wyszukiwaniem.
"""

import pathlib
import sys
import frontmatter

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTENT_DIR = PROJECT_ROOT / "content"

# Przepisy jawnie wymienione w Dieta/Strategia Żywienia.md jako bezpieczne:
EXPLICIT_SAFE = [
    "lekkostrawny kurczak na parze z ziemniakami",
    "jajka na miękko",
    "ryż z cukinią i jajkiem",
    "jajecznica ze szpinakiem",
    "pulpety z indyka & ryżanka",
    "kotleciki a la pożarskie z piekarnika",
    "tradycyjny rosół drobiowo-wołowy",
    "owsianka z truskawkami z instant pota",
    "pieczony dorsz",
]

# Triggery absolutnie wykluczające gerd-safe
HARD_TRIGGERS = [
    "cebula", "cebuli", "czosnek", "czosnku",
    "fasol", "ciecierzyc", "soczewic", "bób", "bobu",
    "kalafior", "kapust",
    "czekolad", "kakao", "nutell",
    "mascarpone", "boczek", "boczku",
    "frytur", "deep fry",
]

def clean_str(s):
    return str(s).lower().strip()

def is_recipe_safe(post, path):
    title = clean_str(post.get("title", path.stem))
    
    # Sprawdź czy jest na liście jawnie bezpiecznych
    for safe_name in EXPLICIT_SAFE:
        if safe_name in title:
            return True, "Zgodny z listą bezpiecznych ze Strategii Żywienia"
            
    # Wyklucz desery, słodycze, ciasta
    categories = clean_str(post.get("categories", ""))
    tags = [clean_str(t) for t in post.get("tags", []) or []]
    
    if "desery" in categories or "słodkie" in tags:
        return False, "Kategoria deser/słodkie"
        
    for kw in ["ciast", "tort", "baton", "lody", "brownie", "sernik", "deser", "pancake", "gofry", "tiramisu"]:
        if kw in title:
            return False, f"Tytuł sugeruje deser/słodycze: {kw}"

    # Sprawdź składniki
    ingredients = [clean_str(i) for i in post.get("ingredients", []) or []]
    shopping = post.get("shopping_ingredients", []) or []
    shop_names = [clean_str(s.get("name", "")) + " " + clean_str(s.get("note", "")) for s in shopping if isinstance(s, dict)]
    
    all_text = " ".join(ingredients + shop_names).lower() + " " + post.content.lower()
    
    for trig in HARD_TRIGGERS:
        if trig in all_text:
            return False, f"Zawiera trigger: {trig}"
            
    # Sprawdź czy ma jakąś lekkostrawną bazę białkowo-węglowodanową
    has_base = any(k in all_text for k in ["kurczak", "indyk", "dorsz", "ryb", "łosoś", "jaj", "tuńczyk", "ryż", "ziemniak", "kasza gryczana", "płatki owsiane", "owsiank"])
    if not has_base:
        return False, "Brak bezpiecznej bazy białkowo-węglowodanowej"
        
    return True, "Spełnia kryteria GERD + Low-FODMAP-lite"

def main():
    modified_count = 0
    safe_recipes = []
    
    for path in CONTENT_DIR.glob("**/*.md"):
        if "_drafts" in path.parts or "weekly-plans" in path.parts:
            continue
        if path.name.startswith("_"):
            continue
            
        try:
            with open(path, "r", encoding="utf-8") as f:
                post = frontmatter.load(f)
        except Exception as e:
            print(f"Błąd czytania {path}: {e}")
            continue
            
        is_safe, reason = is_recipe_safe(post, path)
        
        tags = post.get("tags", []) or []
        if isinstance(tags, str):
            tags = [tags]
            
        diets = post.get("diets", []) or []
        if isinstance(diets, str):
            diets = [diets]
            
        changed = False
        
        if is_safe:
            safe_recipes.append((post.get("title", path.stem), path.name, reason))
            if "gerd-safe" not in tags:
                tags.append("gerd-safe")
                changed = True
            if "gerd-safe" not in diets:
                diets.append("gerd-safe")
                changed = True
        else:
            # jeśli był wcześniej nieprawidłowo oznaczony
            if "gerd-safe" in tags:
                tags.remove("gerd-safe")
                changed = True
            if "gerd-safe" in diets:
                diets.remove("gerd-safe")
                changed = True
                
        if changed:
            post["tags"] = tags
            post["diets"] = diets
            with open(path, "w", encoding="utf-8") as f:
                f.write(frontmatter.dumps(post))
            modified_count += 1
            
    print(f"\nZnaleziono {len(safe_recipes)} bezpiecznych przepisów GERD-Safe.")
    print(f"Zaktualizowano {modified_count} plików.")
    print("\n--- PRZYKŁADOWE PRZEPISY GERD-SAFE ---")
    for title, fname, reason in safe_recipes:
        print(f"✔ {title} ({fname}) — {reason}")

if __name__ == "__main__":
    main()
