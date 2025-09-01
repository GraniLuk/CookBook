# Copilot Instructions for this repo (Hugo cookbook)

Purpose: help AI agents ship changes fast with the right context and conventions.

## Big picture
- Static site built with Hugo using Bulma CSS and Font Awesome.
- Source lives under `layouts/` (templates/partials/shortcodes) and `content/` (Markdown recipes). Static assets in `static/`.
- Deployed to GitHub Pages under `/CookBook/` with canonical base `https://graniluk.github.io/CookBook/`.
- All asset URLs (css/js/img) must go through `{{ partial "asset-url.html" "/path" }}` which handles env-specific prefixing and cache-busting.

## Key architecture and patterns
- Layout base: `layouts/_default/baseof.html` defines the page shell and includes `partials/head.html`, `partials/header.html`, `partials/script.html`.
- Single recipe page: `layouts/_default/single.html` renders the hero image (square, gradient + title overlay) with share/YouTube badges, then stats/macros tables and content.
- List and cards:
  - Home page iterates `Site.RegularPages` and excludes category `sosy`: `layouts/index.html`.
  - Card markup/patterns live in `partials/summary.html`; images are square with `aspect-ratio: 1/1` and object-fit.
- Search: `layouts/_default/index.json` outputs a JSON index (title, tags, categories, contents, permalink, macros) consumed by Fuse.js in `static/js/*` and templated in `partials/searchResults.html`.
- I18n: primary language is Polish (`i18n/pl.yaml`) and menu/taxonomy are configured in `hugo.toml`.

## Front matter conventions (new recipes)
Use `archetypes/default.md` fields. Important keys (lowercase expected in templates):
- `title`, `author`, `recipe_image` (path relative to `static/`), `image_width`, `image_height`
- `tags` (array), `tagline`, `servings`, `prep_time`, `cook` (bool), `cook_increment` (minutes|hours), `cook_time`
- Macros: `calories`, `protein`, `fat`, `carbohydrate`
- Optional: `categories`, `subcategories`, `diets` (e.g. includes `low-fodmap`), `fodmap.status` and `fodmap.notes`

## Asset URL rule (critical)
Always wrap asset paths with `asset-url.html`:
```go-html-template
<link rel="stylesheet" href="{{ partial "asset-url.html" "/css/custom.css" }}">
<img src="{{ partial "asset-url.html" (printf "/%s" .Params.recipe_image) }}" alt="...">
```
This ensures the correct `/CookBook` prefix in dev/prod and adds a version query string for cache busting.

## Styling and UI conventions
- Bulma is included via `static/css/bulma.min.css` and project styles in `static/css/custom.css`.
- Images on cards and hero use CSS `aspect-ratio: 1/1` + `object-fit: cover`.
- The recipe hero uses: `.recipe-hero`, `.recipe-hero__gradient`, `.recipe-hero__title`, and media badges `.media-badge` (YouTube left, Share right). Keep the hero image square and prominent.
- Compact meta tables under the hero use `.recipe-meta` wrappers; do not expand their footprint.

## Scripts
Loaded in `partials/script.html` via `asset-url.html`:
- `static/js/share-recipe.js` implements `shareRecipe()` for the share badge.
- `static/js/navbar.js`, `menu.js`, `custom.js`, `umbrella.min.js` provide interactivity.
- Fuse.js is loaded via CDN for search.

## Building and running
- Local dev: run Hugo server (from repo root):
  - Windows PowerShell
    ```pwsh
    hugo server -D
    ```
  - Site is under the base path `/CookBook/`. Asset URLs are handled by the `asset-url` partial.
- Production build output in `public/` is already present. CI/CD not configured here; publishing is via GitHub Pages.

## Common tasks & examples
- Add a recipe image:
  - Put image under `static/images/...` and set front matter `recipe_image: images/your-file.jpg`.
  - In templates, always resolve via `asset-url.html`.
- Add list card tweaks: edit `partials/summary.html` and matching styles in `static/css/custom.css`.
- Modify hero overlay or badges: edit `layouts/_default/single.html` and styles in `static/css/custom.css` (`.recipe-hero*`, `.media-badge*`).
- Update SEO for low FODMAP: `partials/head.html` conditionally injects keywords and JSON-LD when `.Params.diets` includes `low-fodmap` and/or `.Params.fodmap.*` is present.

## Gotchas
- Do not hardcode `/CookBook` in templates—always use the `asset-url.html` partial. Hardcoding breaks dev/prod URL behavior and cache-busting.
- Respect lowercase front matter keys; templates mostly access `.Params.*` in lowercase.
- Hero image should not be lazy-loaded (LCP). Lazy-load other, below-the-fold images if added later.
- When changing menu, use `hugo.toml` `[menu.main]` blocks; nested menus are supported.

## Where to look
- `layouts/_default/single.html` – recipe page structure
- `layouts/partials/summary.html` – recipe cards on lists
- `layouts/partials/head.html` – assets, SEO, JSON-LD, styles
- `layouts/_default/index.json` & `layouts/partials/searchResults.html` – search index & results template
- `static/css/custom.css` – primary custom styles
- `layouts/partials/asset-url.html` – critical URL/versioning helper

If anything above is unclear or you see drift from current behavior, tell us which section to refine and we’ll update this doc.
