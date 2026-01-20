---
name: convert-recipe-format
description: Converts recipes from various formats (Instagram reels, YouTube videos, websites, text) into the CookBook Hugo format with proper front matter, ingredient lists, preparation steps, nutritional tables, and FODMAP information. Use when the user asks to convert a recipe, create a recipe file, or format recipe content.
---

# Converting Recipes to CookBook Format

Converts recipes from various sources into standardized CookBook format with complete nutritional information and FODMAP details.

## When to Use

- User provides a recipe URL (Instagram, YouTube, website)
- User pastes recipe text to convert
- User asks to "create a recipe" or "add a recipe"
- Recipe needs proper formatting for the Hugo cookbook site

## Output Location

Create new recipe files in `content/queued/` directory.

## Required Front Matter Structure

```yaml
---
draft: false
readyToTest: true
queued: true
title: "Recipe Title"
author: "Source Name or Policzone Szamy"
recipe_image: images/recipe-headers/filename.avif
video_file: videos/filename.mp4  # Optional
date: YYYY-MM-DDTHH:mm:ss+00:00
categories: # One of: śniadania, obiady, kolacje, desery, przekąska, napoje, sosy
subcategories: # Optional: słodkie, wytrawne, etc.
tags: []  # See tag rules below
tagline: "Brief, appetizing description"
ingredients: []  # See ingredient rules below
servings: 4
prep_time: 20
cook: true
cook_time: 30
calories: 500
protein: 35
fat: 20
carbohydrate: 45
link: https://source-url.com  # Optional
fodmap:
  status: "yes"  # or "no"
  serving_ok: "OK w tej porcji"  # or "Tylko mała porcja" or "Unikaj"
  notes: "Safety notes for FODMAP diet"
  substitutions: []  # Array of substitution suggestions
---
```

## Content Structure

### Składniki Section

Organize ingredients into subsections when applicable:

```markdown
## Składniki

### Ciasto
- ingredient list

### Nadzienie
- ingredient list

### Sos
- ingredient list
```

For simple recipes without components, use flat list:

```markdown
## Składniki
- 500 g ingredient
- 2 łyżki another ingredient
```

### Sposób przygotowania Section

```markdown
## Sposób przygotowania
1. First step with details
2. Second step
3. Continue numbering sequentially
```

### Nutritional Table

ALWAYS include complete nutritional breakdown:

```markdown
## Podsumowanie wartości odżywczych (całe danie)

| Składnik           | Ilość (g) | Kalorie (kcal) | Białko (g) | Tłuszcze (g) | Węglowodany (g) |
|--------------------|-----------|----------------|------------|--------------|-----------------|
| Ingredient 1       | 400       | 660            | 124.0      | 14.4         | 0.0             |
| Ingredient 2       | 200       | 666            | 14.8       | 0.9          | 146.2           |
| **RAZEM:**         | **600**   | **1326**       | **138.8**  | **15.3**     | **146.2**       |
---
```

## Tag Rules (CRITICAL)

Tags describe **recipe type or use case**, NOT ingredients.

**Allowed tags** (from `static/admin/config.yml`):
- Type: kanapki, batony, kotlety, włoskie, meksykańskie, marokański
- Use: szybkie, przekąska, proteinowe, low carb, lunchbox, goście, jesień, wegańskie, pikantne, słodkie

**DO NOT use ingredient tags** like "kurczak", "szpinak", "ser" - these go in `ingredients` field.

Examples:
- Sandwich recipe: `tags: ["kanapki", "szybkie"]`
- Italian dinner: `tags: ["włoskie", "szybkie"]`
- Protein dessert: `tags: ["proteinowe", "przekąska"]`

## Ingredient Rules (CRITICAL)

Include **MAIN ingredients only** (>30g or structural role).

**Include:**
- Proteins: "pierś z kurczaka", "łosoś", "czerwona soczewica", "twaróg półtłusty"
- Dairy: "mleko 1,5%", "ser cheddar", "jogurt grecki"
- Main vegetables: "brokuł", "papryka czerwona", "szpinak"
- Carbs: "ryż basmati", "makaron pełnoziarnisty", "płatki owsiane"
- Significant fats: "oliwa z oliwek" (≥1 tbsp), "masło orzechowe", "awokado"
- Bulk items: "mrożone warzywa", "mąka pszenna" (structural)

**Exclude:**
- Spices/herbs: sól, pieprz, czosnek, cebula, papryka słodka, chili, zioła
- Micro amounts: <10g or <1 tsp (cukier, miód, ocet, sok z cytryny)
- Sprays, baking powder, extracts (unless main ingredient)

Format: `ingredients: ["pierś z kurczaka", "ryż basmati", "mrożone warzywa"]`

## FODMAP Guidelines

Analyze each ingredient for FODMAP safety:

**Safe ingredients:**
- Rice, potatoes, meat, fish, eggs
- Most cheeses (aged), lactose-free dairy
- Carrots, spinach, tomatoes, zucchini
- Strawberries, blueberries, oranges

**Moderate/High FODMAP:**
- Onion, garlic (use alternatives: chives, garlic oil)
- Wheat (suggest gluten-free)
- Beans, lentils (limit portions)
- Apples, pears, watermelon, dried fruit
- Honey, agave (use maple syrup)

Set `fodmap.status`:
- "yes" = Safe in this portion size
- "no" = Contains high FODMAP ingredients

Set `fodmap.serving_ok`:
- "OK w tej porcji" = Safe as written
- "Tylko mała porcja" = Reduce serving size
- "Unikaj" = Not safe for FODMAP diet

## Workflow

1. **Extract recipe data** from source (URL, text, or video)
2. **Calculate nutrition** using standard food databases
3. **Organize ingredients** into logical sections (ciasto, nadzienie, etc.)
4. **Generate front matter** with all required fields
5. **Write content** following structure above
6. **Validate FODMAP** safety and add notes
7. **Save file** as `content/queued/Recipe-Title.md`

## File Naming

Use title case with hyphens: `Pieczony Kurczak z Warzywami.md`

## Quality Checklist

- [ ] All required front matter fields present
- [ ] Categories from allowed list
- [ ] Tags follow type/use rules (no ingredient tags)
- [ ] Ingredients list contains MAIN items only (no spices)
- [ ] Składniki organized into sections when applicable
- [ ] Nutritional table complete with totals
- [ ] FODMAP analysis thorough with substitutions
- [ ] File saved in `content/queued/`
- [ ] Proper Polish language throughout

## Common Mistakes to Avoid

❌ Adding spices/herbs to `ingredients` field
❌ Using ingredient names as tags
❌ Missing nutritional breakdown table
❌ Incomplete FODMAP analysis
❌ Saving to wrong directory
❌ Flat ingredient list when sections needed (e.g., pierogi with filling)

## Asset URLs

When referencing images or videos, use:
- `recipe_image: images/recipe-headers/filename.avif`
- `video_file: videos/filename.mp4`

These paths are processed by Hugo's `asset-url.html` partial for proper URL handling.
