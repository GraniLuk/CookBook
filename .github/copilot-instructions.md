# Copilot Instructions for this repo (Hugo cookbook)

## Mandatory Development Checklist
- [ ] **Build**: `npm run build` (Hugo with Tailwind processing)
- [ ] **Test**: `npm run test:search:v7` (Fuse.js search tests)
- [ ] **Validate**: Run `hugo server -D` and check site renders correctly

Purpose: help AI agents ship changes fast with the right context and conventions.

## Big picture
- Hugo static site with Tailwind CSS v4 + DaisyUI, Polish language, deployed to GitHub Pages under `/CookBook/`
- Content: `layouts/` (templates), `content/` (Markdown recipes), `static/` (assets)
- Search: Fuse.js with JSON index from `layouts/index.json`
- Admin: Decap CMS for content editing

## Key architecture and patterns
- Layouts: `baseof.html` (shell), `single.html` (recipe page with hero + stats), `index.html` (filtered grid)
- Cards: `partials/summary.html` with square images, macros, FODMAP/rating badges
- Features: Video modals, rating system, FODMAP support, i18n via `i18n/pl.yaml`

## Front matter conventions
Use `archetypes/default.md`. Key fields:
- Basics: `title`, `author`, `recipe_image`, `tags`, `tagline`
- Times: `servings`, `prep_time`, `cook`, `cook_time`
- Macros: `calories`, `protein`, `fat`, `carbohydrate`
- Optional: `categories`, `diets` (low-fodmap), `fodmap.status`, `link` (YouTube), `video_file`, `rating`

## Critical rules
**Asset URLs**: Always wrap with `{{ partial "asset-url.html" "/path" }}` for `/CookBook` prefix and cache-busting.

**Collection detection**: Edit links in `single.html` detect collection from file path (queued, obiady, sniadania, etc.).

## Styling conventions
- Tailwind v4 + DaisyUI processed from `assets/css/main.css`
- Images: `aspect-ratio: 1/1` + `object-fit: cover`
- Hero: `.recipe-hero*` classes, media badges `.media-badge`
- Legacy Bulma utilities still supported in `static/css/custom.css`

## Scripts and tooling
- JS: `share-recipe.js`, `navbar.js`, Fuse.js search
- Python scripts in `scripts/`: find recipes by ingredient/tag, normalize frontmatter, validate tags

## Building and running
- Dev: `hugo server -D` (serves at `/CookBook/`)
- Build: `npm run build` (Hugo + minify)
- Tests: `npm run test:search:v7`

## Common tasks
- Add recipe image: Set `recipe_image` in frontmatter, resolve via `asset-url.html`
- Modify cards: Edit `partials/summary.html` + `static/css/custom.css`
- Update search: Modify `layouts/index.json` fields

## Gotchas
- Never hardcode `/CookBook` - use `asset-url.html` partial
- Lowercase frontmatter keys accessed via `.Params.*`
- Hero images not lazy-loaded (LCP priority)
- Draft recipes hidden via `[data-draft="true"] { display: none !important; }`
- Update collection detection logic when adding new recipe categories

## Where to look
- `layouts/_default/single.html` - recipe pages, hero, modals
- `layouts/index.html` - home page filtering
- `partials/summary.html` - recipe cards
- `layouts/index.json` - search index
- `archetypes/default.md` - frontmatter template
- `assets/css/main.css` - Tailwind + DaisyUI styles
- `static/css/custom.css` - legacy styles
- `scripts/` - Python management tools
- `hugo.toml` - site config, menus

If anything above is unclear or you see drift from current behavior, tell us which section to refine and we'll update this doc.
- `layouts/partials/head.html` – assets, SEO, JSON-LD, styles
- `layouts/index.json` & `layouts/partials/searchResults.html` – search index & results template
- `layouts/index.html` – home page filtering and grid
- `static/css/custom.css` – primary custom styles
- `layouts/partials/asset-url.html` – critical URL/versioning helper
- `archetypes/default.md` – front matter template
- `scripts/` – Python tools for recipe management
- `hugo.toml` – site config, menus, taxonomies

If anything above is unclear or you see drift from current behavior, tell us which section to refine and we’ll update this doc.
