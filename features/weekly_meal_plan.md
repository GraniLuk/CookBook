# Weekly Meal Planning Feature - Implementation Plan

## Overview

Add a weekly meal planning system to the CookBook Hugo site that allows family members to:
- Create weekly meal plans using existing recipes
- Edit plans from any device via Decap CMS
- View historical meal plans
- Print weekly plans for the kitchen

All data stored in Git for full version history, no database required.

---

## Phase 1: Decap CMS Configuration

### Step 1.1: Update CMS Config

**File**: `static/admin/config.yml`

Add new collection after the existing `recipes` collection:

```yaml
  - name: weekly_plans
    label: Plany Tygodniowe
    label_singular: Plan Tygodniowy
    folder: content/weekly-plans
    create: true
    slug: "{{year}}-W{{fields.week_number}}"
    extension: md
    format: frontmatter
    fields:
      - { label: Tytuł, name: title, widget: string, default: "Plan tygodnia" }
      - { label: Tydzień, name: week_number, widget: number, min: 1, max: 53, value_type: int }
      - { label: Rok, name: year, widget: number, default: 2025, value_type: int }
      - { label: Od dnia, name: start_date, widget: date, format: "YYYY-MM-DD" }
      - { label: Notatki, name: notes, widget: text, required: false }
      - label: Poniedziałek
        name: monday
        widget: object
        collapsed: true
        fields:
          - { label: Śniadanie, name: breakfast, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Lunch, name: lunch, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Obiad, name: dinner, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Notatki, name: notes, widget: string, required: false }
      - label: Wtorek
        name: tuesday
        widget: object
        collapsed: true
        fields:
          - { label: Śniadanie, name: breakfast, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Lunch, name: lunch, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Obiad, name: dinner, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Notatki, name: notes, widget: string, required: false }
      - label: Środa
        name: wednesday
        widget: object
        collapsed: true
        fields:
          - { label: Śniadanie, name: breakfast, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Lunch, name: lunch, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Obiad, name: dinner, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Notatki, name: notes, widget: string, required: false }
      - label: Czwartek
        name: thursday
        widget: object
        collapsed: true
        fields:
          - { label: Śniadanie, name: breakfast, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Lunch, name: lunch, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Obiad, name: dinner, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Notatki, name: notes, widget: string, required: false }
      - label: Piątek
        name: friday
        widget: object
        collapsed: true
        fields:
          - { label: Śniadanie, name: breakfast, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Lunch, name: lunch, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Obiad, name: dinner, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Notatki, name: notes, widget: string, required: false }
      - label: Sobota
        name: saturday
        widget: object
        collapsed: true
        fields:
          - { label: Śniadanie, name: breakfast, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Lunch, name: lunch, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Obiad, name: dinner, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Notatki, name: notes, widget: string, required: false }
      - label: Niedziela
        name: sunday
        widget: object
        collapsed: true
        fields:
          - { label: Śniadanie, name: breakfast, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Lunch, name: lunch, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Obiad, name: dinner, widget: relation, collection: recipes, search_fields: ["title"], value_field: "{{slug}}", display_fields: ["title"], required: false }
          - { label: Notatki, name: notes, widget: string, required: false }
```

**Key features:**
- `relation` widget connects to existing recipes collection
- Slug pattern: `2025-W42` for easy sorting
- Collapsed days for cleaner editing UI
- Optional notes per day and per week

---

## Phase 2: Content Structure

### Step 2.1: Create Weekly Plans Folder

```pwsh
mkdir content/weekly-plans
```

### Step 2.2: Create Index Page for Weekly Plans

**File**: `content/weekly-plans/_index.md`

```markdown
---
title: Plany Tygodniowe
---

Historia planów posiłków dla rodziny.
```

---

## Phase 3: Hugo Templates

### Step 3.1: Create List Template for Weekly Plans

**File**: `layouts/weekly-plans/list.html`

```html
{{ define "main" }}
<section class="section">
    <div class="container">
        <h1 class="title">{{ .Title }}</h1>
        <p class="subtitle">{{ .Content }}</p>
        
        <div class="buttons mb-5">
            <a href="{{ partial "asset-url.html" "/admin/#/collections/weekly_plans/new" }}" class="button is-primary">
                <span class="icon"><i class="fas fa-plus"></i></span>
                <span>Stwórz nowy plan</span>
            </a>
        </div>

        <div class="columns is-multiline">
            {{ range .Pages.ByDate.Reverse }}
            <div class="column is-one-third">
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">
                            <a href="{{ .Permalink }}">{{ .Title }}</a>
                        </p>
                        <div class="card-header-icon">
                            <span class="tag is-info">{{ .Params.start_date | time.Format "02.01" }}</span>
                        </div>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <p class="has-text-grey">
                                <span class="icon"><i class="far fa-calendar"></i></span>
                                Tydzień {{ .Params.week_number }}/{{ .Params.year }}
                            </p>
                            {{ if .Params.notes }}
                            <p class="mt-2">{{ .Params.notes | truncate 100 }}</p>
                            {{ end }}
                        </div>
                    </div>
                    <footer class="card-footer">
                        <a href="{{ .Permalink }}" class="card-footer-item">
                            <span class="icon"><i class="fas fa-eye"></i></span>
                            <span>Zobacz</span>
                        </a>
                        <a href="{{ partial "asset-url.html" (printf "/admin/#/collections/weekly_plans/entries/%s" .File.BaseFileName) }}" class="card-footer-item">
                            <span class="icon"><i class="fas fa-edit"></i></span>
                            <span>Edytuj</span>
                        </a>
                    </footer>
                </div>
            </div>
            {{ end }}
        </div>
    </div>
</section>
{{ end }}
```

### Step 3.2: Create Single Template for Weekly Plans

**File**: `layouts/weekly-plans/single.html`

```html
{{ define "main" }}
<section class="section">
    <div class="container">
        <div class="level mb-5">
            <div class="level-left">
                <div class="level-item">
                    <div>
                        <h1 class="title">{{ .Title }}</h1>
                        <p class="subtitle">
                            Od {{ .Params.start_date | time.Format "02.01.2006" }} 
                            <span class="tag is-info ml-2">Tydzień {{ .Params.week_number }}/{{ .Params.year }}</span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="level-right">
                <div class="level-item">
                    <div class="buttons">
                        <a href="{{ partial "asset-url.html" (printf "/admin/#/collections/weekly_plans/entries/%s" .File.BaseFileName) }}" class="button is-primary">
                            <span class="icon"><i class="fas fa-edit"></i></span>
                            <span>Edytuj</span>
                        </a>
                        <button onclick="window.print()" class="button is-info">
                            <span class="icon"><i class="fas fa-print"></i></span>
                            <span>Drukuj</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {{ if .Params.notes }}
        <div class="notification is-info is-light mb-5">
            <p><strong>Notatki do planu:</strong> {{ .Params.notes }}</p>
        </div>
        {{ end }}

        <div class="weekly-plan-grid">
            {{ $days := slice "monday" "tuesday" "wednesday" "thursday" "friday" "saturday" "sunday" }}
            {{ $dayNames := dict "monday" "Poniedziałek" "tuesday" "Wtorek" "wednesday" "Środa" "thursday" "Czwartek" "friday" "Piątek" "saturday" "Sobota" "sunday" "Niedziela" }}
            {{ $meals := slice "breakfast" "lunch" "dinner" }}
            {{ $mealNames := dict "breakfast" "Śniadanie" "lunch" "Lunch" "dinner" "Obiad" }}

            {{ range $dayIndex, $day := $days }}
            {{ $dayData := index $.Params $day }}
            <div class="box weekly-plan-day mb-4">
                <h2 class="title is-4 has-text-primary">
                    <span class="icon"><i class="far fa-calendar-day"></i></span>
                    {{ index $dayNames $day }}
                </h2>
                
                <div class="columns is-multiline">
                    {{ range $meals }}
                    {{ $mealSlug := index $dayData . }}
                    <div class="column is-one-third">
                        <div class="meal-slot">
                            <p class="heading">{{ index $mealNames . }}</p>
                            {{ if $mealSlug }}
                                {{ $recipe := $.Site.GetPage (printf "/%s" $mealSlug) }}
                                {{ if $recipe }}
                                    <a href="{{ $recipe.Permalink }}" class="has-text-weight-semibold">
                                        {{ $recipe.Title }}
                                    </a>
                                    {{ with $recipe.Params.recipe_image }}
                                    <figure class="image is-128x128 mt-2">
                                        <img src="{{ partial "asset-url.html" (printf "/%s" .) }}" 
                                             alt="{{ $recipe.Title }}"
                                             style="aspect-ratio: 1/1; object-fit: cover;">
                                    </figure>
                                    {{ end }}
                                    {{ with $recipe.Params.prep_time }}
                                    <p class="has-text-grey mt-1">
                                        <span class="icon is-small"><i class="far fa-clock"></i></span>
                                        {{ . }} min
                                    </p>
                                    {{ end }}
                                {{ else }}
                                    <p class="has-text-danger">{{ $mealSlug }} (nie znaleziono)</p>
                                {{ end }}
                            {{ else }}
                                <p class="has-text-grey-light">— nie zaplanowano —</p>
                            {{ end }}
                        </div>
                    </div>
                    {{ end }}
                </div>
                
                {{ with $dayData.notes }}
                <div class="notification is-light mt-3">
                    <p class="is-size-7"><strong>Notatka:</strong> {{ . }}</p>
                </div>
                {{ end }}
            </div>
            {{ end }}
        </div>

        <div class="buttons mt-5 is-hidden-print">
            <a href="{{ partial "asset-url.html" "/weekly-plans/" }}" class="button">
                <span class="icon"><i class="fas fa-arrow-left"></i></span>
                <span>Powrót do planów</span>
            </a>
        </div>
    </div>
</section>
{{ end }}
```

---

## Phase 4: Styling

### Step 4.1: Add Custom Styles

**File**: `static/css/custom.css` (append to existing file)

```css
/* Weekly Plan Styles */
.weekly-plan-day {
  border-left: 4px solid #00d1b2;
  transition: border-color 0.3s ease;
}

.weekly-plan-day:hover {
  border-left-color: #3273dc;
}

.meal-slot {
  min-height: 80px;
  padding: 0.75rem;
  background: #fafafa;
  border-radius: 4px;
}

.meal-slot .heading {
  color: #363636;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.meal-slot img {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Print styles */
@media print {
  .buttons, 
  .card-footer,
  .is-hidden-print,
  .level-right { 
    display: none !important; 
  }
  
  .box { 
    page-break-inside: avoid;
    border: 1px solid #dbdbdb;
  }
  
  .weekly-plan-day {
    margin-bottom: 1.5rem;
  }
  
  .meal-slot {
    background: white;
    border: 1px solid #e8e8e8;
  }
}
```

---

## Phase 5: Navigation

### Step 5.1: Add Menu Link

**File**: `hugo.toml` (add to `[languages.pl.menu.main]` section)

```toml
[[languages.pl.menu.main]]
  name = "Plany Tygodniowe"
  url = "/weekly-plans/"
  weight = 40
```

---

## Phase 6: Testing & Deployment

### Step 6.1: Local Testing

1. **Test locally with Decap backend:**
   ```pwsh
   # Terminal 1
   hugo server -D
   
   # Terminal 2
   npx decap-server
   ```

2. **Create test weekly plan:**
   - Navigate to `http://localhost:1313/CookBook/admin/`
   - Open "Plany Tygodniowe"
   - Click "New Plan Tygodniowy"
   - Fill in week number, year, start date
   - Select recipes for different meals
   - Save

3. **Verify:**
   - Check file created in `content/weekly-plans/`
   - View list page at `/weekly-plans/`
   - View single plan page
   - Test print layout (Ctrl+P)
   - Test edit link back to CMS

### Step 6.2: Production Deployment

1. **Commit all changes:**
   ```pwsh
   git add .
   git commit -m "feat: add weekly meal planning feature"
   git push origin main
   ```

2. **Verify GitHub Pages deployment:**
   - Wait for GitHub Actions workflow to complete
   - Visit `https://graniluk.github.io/CookBook/weekly-plans/`

3. **Test multi-device:**
   - Log in to CMS from phone/tablet: `https://graniluk.github.io/CookBook/admin/`
   - Create/edit a plan
   - Verify changes appear on all devices after refresh

---

## Phase 7: User Documentation

### Step 7.1: Update Decap CMS Guide

**File**: `docs/decap-cms-guide.md` (add new section)

```markdown
## Weekly Meal Planning

### Creating a new weekly plan

1. Navigate to `https://graniluk.github.io/CookBook/admin/`
2. Click **Plany Tygodniowe** in the left sidebar
3. Click **New Plan Tygodniowy**
4. Fill in:
   - Week number (1-53)
   - Year
   - Start date (Monday of that week)
   - Optional: General notes
5. For each day:
   - Expand the day accordion
   - Use the recipe selector to choose meals
   - Add optional day-specific notes
6. Click **Publish** to save

### Editing existing plans

1. Go to **Plany Tygodniowe** collection
2. Click on the plan card
3. Make changes
4. Click **Publish** to save

### Viewing plans on the site

- List: `https://graniluk.github.io/CookBook/weekly-plans/`
- Click any plan to see detailed view
- Use "Drukuj" button to print for the kitchen

### Tips

- Plans are named `YYYY-Wxx` (e.g., `2025-W42`) for easy sorting
- Recipe images appear automatically in the weekly view
- All changes are versioned in Git—check commit history to see who changed what
- Edit from any device with internet access
```

---

## Success Criteria

- ✅ CMS collection configured with recipe relations
- ✅ Weekly plans stored in Git with full history
- ✅ List view shows all historical plans
- ✅ Single view displays weekly grid with recipe cards
- ✅ Print-friendly layout for kitchen use
- ✅ Edit button links back to CMS
- ✅ Mobile-responsive design
- ✅ Multi-device editing works via GitHub OAuth

---

## Future Enhancements (Optional)

- Shopping list generator from weekly plan
- Nutrition totals for the week
- Duplicate plan feature (copy previous week)
- Filter/search past plans by date range
- Export to calendar (iCal format)
- Meal prep notes per recipe in weekly context

---

## Maintenance Notes

- **Tag system**: Weekly plans don't use tags (they reference recipes that have tags)
- **OAuth proxy**: Same Render setup used for recipe editing
- **Backup**: All plans backed up in Git—no separate backup needed
- **Performance**: Static files = fast load times even with many plans