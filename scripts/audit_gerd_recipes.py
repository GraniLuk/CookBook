"""
Audyt przepisów CookBook pod kątem zaleceń GERD + Low-FODMAP-lite dla podopiecznego.
Identyfikuje triggery z Dieta/Żołądek - Tracking.md i Dieta/Strategia Żywienia.md:
- cebula, czosnek, por (część biała)
- fasola, groch, ciecierzyca, soczewica, bób
- kalafior, kapusta
- czekolada, kakao, nutella, lody, desery cukrowe
- ciężkie sosy śmietanowe / mascarpone / głębokie smażenie
- mleko / twaróg w dużych ilościach (szczególnie wieczorem)
"""

import pathlib
import sys
import frontmatter

PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTENT_DIR = PROJECT_ROOT / "content"

# Słowa kluczowe triggerów (sprawdzane w ingredients, shopping_ingredients i tekście)
HARD_TRIGGERS = [
    "cebula", "cebuli", "czosnek", "czosnku",
    "fasol", "ciecierzyc", "soczewic", "bób", "bobu",
    "kalafior",
    "czekolad", "kakao", "nutell",
]

MODERATE_TRIGGERS = [
    "mascarpone", "śmietana 30%", "śmietany 30%", "śmietana 36%",
    "majonez", "boczek", "boczku", "smażon", "frytur",
]

# Bezpieczne bazy
SAFE_PROTEINS = ["kurczak", "indyk", "dorsz", "łosoś", "tuńczyk", "jajka", "jajko"]
SAFE_CARBS = ["ryż", "ziemniak", "kasza gryczana", "płatki owsiane", "owsiank"]

def audit():
    recipes = []
    
    for path in CONTENT_DIR.glob("**/*.md"):
        if "_drafts" in path.parts or "weekly-plans" in path.parts:
            continue
        if path.name.startswith("_"):
            continue
            
        try:
            post = frontmatter.load(path)
        except Exception:
            continue
            
        title = post.get("title", path.stem)
        categories = post.get("categories", "")
        tags = post.get("tags", []) or []
        diets = post.get("diets", []) or []
        ingredients = post.get("ingredients", []) or []
        shopping = post.get("shopping_ingredients", []) or []
        
        # zbierz tekst składników
        all_ing_text = " ".join([str(i) for i in ingredients]).lower()
        all_shop_text = " ".join([f"{s.get('name', '')} {s.get('note', '')}" for s in shopping if isinstance(s, dict)]).lower()
        full_text = f"{all_ing_text} {all_shop_text} {post.content.lower()}"
        
        found_hard = [t for t in HARD_TRIGGERS if t in full_text]
        found_mod = [t for t in MODERATE_TRIGGERS if t in full_text]
        
        is_sweet = "desery" in str(categories) or "słodkie" in tags or any(k in title.lower() for k in ["ciast", "tort", "baton", "lody", "brownie", "sernik", "deser"])
        
        recipes.append({
            "path": path,
            "title": title,
            "categories": categories,
            "tags": tags,
            "diets": diets,
            "hard_triggers": found_hard,
            "mod_triggers": found_mod,
            "is_sweet": is_sweet,
        })
        
    safe = []
    modifiable = []
    unsafe = []
    
    for r in recipes:
        if r["is_sweet"] and ("cukier" in r["title"].lower() or "ciast" in r["title"].lower() or "czekolad" in r["title"].lower()):
            unsafe.append(r)
        elif len(r["hard_triggers"]) == 0 and len(r["mod_triggers"]) == 0 and not r["is_sweet"]:
            safe.append(r)
        elif len(r["hard_triggers"]) <= 2 and len(r["mod_triggers"]) == 0 and not r["is_sweet"]:
            # np. tylko 1 ząbek czosnku lub cebula do wyjęcia
            modifiable.append(r)
        else:
            unsafe.append(r)
            
    print(f"Total evaluated: {len(recipes)}")
    print(f"Safe as is (no hard triggers, no heavy sweets/fat): {len(safe)}")
    print(f"Modifiable (minor garlic/onion or simple sub): {len(modifiable)}")
    print(f"Unsafe / strong triggers: {len(unsafe)}")
    
    print("\n--- PRZYKŁADOWE BEZPIECZNE (SAFE) ---")
    for r in safe[:20]:
        print(f"[{r['categories']}] {r['title']} ({r['path'].name})")
        
    print("\n--- PRZYKŁADOWE DO MODYFIKACJI (MODIFIABLE) ---")
    for r in modifiable[:15]:
        print(f"[{r['categories']}] {r['title']} -> triggery: {r['hard_triggers']}")

if __name__ == "__main__":
    audit()
