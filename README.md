# CookBook (Hugo)

A Hugo-based cookbook using Bulma and Font Awesome. Deployed to GitHub Pages at: [graniluk.github.io/CookBook](https://graniluk.github.io/CookBook/)

## Quick start (Windows PowerShell)

- Prerequisite: Install Hugo (extended).
- Run local dev server from repo root:

```pwsh
hugo server -D
```

- Open the site under the base path: <http://localhost:1313/CookBook/>

Notes

- All CSS/JS/image URLs must use the `asset-url.html` partial. It adds the `/CookBook` prefix and a version query string in dev/prod.
- Production builds output to `public/`.

## Project structure

- `content/` – Markdown recipes (one file per recipe)
- `layouts/` – Hugo templates
  - `_default/baseof.html` – page shell; includes `partials/head.html`, `header.html`, `script.html`
  - `_default/single.html` – single recipe (square hero image with gradient + title overlay, share/YouTube badges, stats/macros tables, content)
  - `_default/index.json` – search index for Fuse.js
  - `partials/summary.html` – recipe cards (square images; meta preview)
  - `partials/asset-url.html` – critical URL helper (prefix + cache-busting)
- `static/` – static assets (css/js/images)
- `public/` – built site (for GitHub Pages)
- `hugo.toml` – site config, menus, taxonomies, baseURL

## Content model (front matter)

Use `archetypes/default.md` when creating a new recipe. Important keys (lowercase in templates):

- Basics: `title`, `author`, `tagline`, `tags` (array)
- Image: `recipe_image` (path under `static/`), `image_width`, `image_height`
- Times: `servings`, `prep_time`, `cook` (bool), `cook_increment` (minutes|hours), `cook_time`
- Macros: `calories`, `protein`, `fat`, `carbohydrate`
- Optional: `categories`, `subcategories`, `diets` (e.g. includes `low-fodmap`), `fodmap.status`, `fodmap.notes`

## Asset URLs (must-do)

In templates, always resolve assets via the partial:

- CSS/JS: `{{ partial "asset-url.html" "/css/custom.css" }}`
- Images: `{{ partial "asset-url.html" (printf "/%s" .Params.recipe_image) }}`

Never hardcode `/CookBook` or absolute URLs; the partial handles prefixing for dev/prod and cache-busting via `?v=...`.

## Styling & UI

- Bulma CSS (`static/css/bulma.min.css`) + project styles (`static/css/custom.css`).
- Cards and hero images use `aspect-ratio: 1/1` and `object-fit: cover`.
- Single recipe hero includes:
  - `.recipe-hero`, `.recipe-hero__gradient`, `.recipe-hero__title`
  - Media badges: `.media-badge` (YouTube bottom-left, Share bottom-right)
- Meta tables under hero wrapped with `.recipe-meta` to keep them compact.

## Search

- `layouts/_default/index.json` builds a JSON index of pages (title, tags, categories, contents, permalink, macros).
- Fuse.js (CDN) powers client-side search; results are rendered via the template in `partials/searchResults.html`.

## Menus, taxonomies, i18n

- Configure in `hugo.toml`: menus under `[menu.main]`, taxonomies (`categories`, `subcategories`, `tags`, `diets`).
- Primary language: Polish (`languages.pl`).

## SEO / Low FODMAP metadata

- `partials/head.html` injects `meta keywords` and minimal Recipe JSON-LD when `.Params.diets` includes `low-fodmap` and/or `.Params.fodmap.*` is present.

## Build & deploy

- Production build:

```pwsh
hugo -D
```

- Output is in `public/`. Publish to GitHub Pages (project pages) so it serves under `/CookBook/`.
- Live site: [graniluk.github.io/CookBook](https://graniluk.github.io/CookBook/)

## CMS (Decap CMS)

- Admin panel: `/admin/` (requires authentication)
- **Visual Editing enabled** – click on content in the preview pane to edit fields directly
- Custom preview templates match the Hugo site's styling
- See [docs/VISUAL_EDITING.md](docs/VISUAL_EDITING.md) for details on the click-to-edit feature

## Gotchas

- Asset URLs: always use `asset-url.html`. Do not hardcode `/CookBook`.
- Keep front matter keys lowercase (templates expect `.Params.calories`, etc.).
- Don’t lazy-load the hero image (it’s LCP). Lazy-load below-the-fold images only.
