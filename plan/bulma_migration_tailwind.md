# Bulma → Tailwind + DaisyUI Migration Plan

Full phased migration from Bulma CSS to Tailwind + DaisyUI for the Hugo cookbook site. Each phase is independently verifiable—run `hugo server` after each to confirm the site renders correctly before proceeding.

---

## Phase 1: Setup & Infrastructure (Day 1-2)

1. **Install dependencies** — Add `tailwindcss`, `postcss`, `autoprefixer`, `daisyui` to `package.json`; remove `copy-bulma` script after Phase 8.
2. **Create Tailwind config** — Add `tailwind.config.js` at repo root with design tokens extracted from `static/css/custom.css` (colors `--color-primary: #4A7C59`, fonts, border-radius, shadows) and DaisyUI theme `cookbook`.
3. **Create CSS entry point** — Add `assets/css/main.css` with `@tailwind base/components/utilities` directives.
4. **Configure Hugo Pipes** — Update `layouts/partials/head.html` to process Tailwind via `resources.Get | css.TailwindCSS`; keep Bulma loaded **alongside** for this phase.
5. **Migrate utility classes** — Global find-replace: `is-hidden`→`hidden`, `is-flex`→`flex`, `has-text-centered`→`text-center`, `has-text-weight-bold`→`font-bold` across all 45 templates.

**Verification**: Site loads with both Bulma + Tailwind; utility classes work.

---

## Phase 2: Buttons & Tags (Day 3)

1. **Migrate buttons** — Replace `.button.is-primary` with `btn btn-primary`, `.is-small`→`btn-sm`, `.is-rounded`→`rounded-full` in `layouts/_default/single.html`, `layouts/index.html`, `layouts/partials/header.html`.
2. **Migrate tags** — Replace `.tag`/`.tags` with DaisyUI `badge` classes in `layouts/partials/summary.html`, `layouts/partials/tags.html`.
3. **Update tag CSS** — Port relevant styles from `static/css/tags.css` to Tailwind `@layer components`.

**Verification**: All buttons and recipe tags render correctly; hover/focus states work.

---

## Phase 3: Cards (Day 4-5)

1. **Migrate recipe cards** — Convert `layouts/partials/summary.html` from `.card`/`.card-image`/`.card-content` to DaisyUI `card`/`card-body` structure.
2. **Migrate weekly plan cards** — Update `layouts/weekly-plans/single.html` and `layouts/weekly-plans/list.html` card markup.
3. **Port card overrides** — Move border-radius, shadow, and hover effects from `static/css/custom.css` (search for `.card {`) into Tailwind config or `@layer components`.

**Verification**: Recipe cards display with correct image aspect ratio, shadows, and hover effects.

---

## Phase 4: Forms & Filters (Day 6-7)

1. **Migrate search form** — Convert `.field.has-addons`/`.control`/`.input` in `layouts/index.html` to DaisyUI `join`/`input input-bordered`/`btn`.
2. **Migrate filter dropdowns** — Replace Bulma `.dropdown` with DaisyUI `dropdown` component in `layouts/index.html`; update `static/js/filter.js` class toggles (`is-active`→`dropdown-open` or checkbox-based).
3. **Migrate checkboxes/selects** — Convert `.checkbox`/`.select` to DaisyUI `checkbox`/`select select-bordered`.
4. **Update filter JS** — Modify `static/js/filter.js` and `static/js/listFilter.js` to use new class names or DaisyUI's native dropdown behavior.

**Verification**: Search works; filter dropdowns open/close; checkbox filters function.

---

## Phase 5: Navbar (Day 8-10) — **Most Complex**

1. **Migrate desktop navbar** — Convert `layouts/partials/header.html` from `.navbar`/`.navbar-menu`/`.navbar-item` to DaisyUI `navbar`/`navbar-start`/`navbar-center`/`navbar-end` structure.
2. **Implement mobile drawer** — Replace `.navbar-burger` toggle with DaisyUI `drawer` component for mobile menu.
3. **Migrate nested dropdowns** — Convert `.has-dropdown.is-hoverable` to DaisyUI `dropdown dropdown-hover`; port 3-level menu logic from `static/css/nested-menu.css`.
4. **Update navbar JS** — Rewrite `static/js/navbar.js` and `static/js/menu.js`: replace `toggleClass('is-active')` with drawer state management; update scroll/sticky behavior.
5. **Port sticky styles** — Move sticky navbar CSS from `static/css/header.css` to Tailwind utilities or `@layer components`.

**Verification**: Desktop menu with dropdowns works; mobile drawer opens/closes; sticky scroll behavior intact.

---

## Phase 6: Modals (Day 11)

1. **Migrate video modal** — Convert `.modal`/`.modal-background`/`.modal-content` in `layouts/_default/single.html` to DaisyUI `modal` with checkbox or `<dialog>` pattern.
2. **Update modal JS** — Modify `static/js/custom.js` modal handling: replace `.classList.add('is-active')` with DaisyUI modal open method (checkbox toggle or `showModal()`).
3. **Style close button** — Replace `.modal-close.is-large` with `btn btn-sm btn-circle btn-ghost absolute right-2 top-2`.

**Verification**: YouTube video modal opens/closes; background click closes modal.

---

## Phase 7: Layout & Grid (Day 12-13)

1. **Migrate page layout** — Convert `.section`/`.container` in `layouts/_default/baseof.html` and `layouts/_default/single.html` to `py-8 px-4`/`container mx-auto max-w-7xl`.
2. **Migrate card grid** — Replace `.columns.is-multiline` in `layouts/index.html` with Tailwind `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6`.
3. **Migrate recipe page columns** — Convert `.column.is-8-desktop`/`.is-4-desktop` in `layouts/_default/single.html` to `lg:col-span-8`/`lg:col-span-4` within a 12-column grid.
4. **Migrate notifications** — Replace `.notification.is-info` with DaisyUI `alert alert-info` in weekly plans and error messages.

**Verification**: All pages have correct spacing; card grid is responsive; recipe page two-column layout works.

---

## Phase 8: Cleanup & Bulma Removal (Day 14-16)

1. **Remove Bulma** — Delete `bulma` from `package.json`; remove `copy-bulma` script; delete `static/css/bulma.min.css` and `static/css/bulma.css.map`.
2. **Remove Bulma link** — Delete `<link href="bulma.min.css">` from `layouts/partials/head.html`.
3. **Clean custom CSS** — Remove all `!important` overrides and Bulma variable overrides (`--bulma-*`) from `static/css/custom.css`; consolidate remaining custom styles into Tailwind layers.
4. **Delete obsolete CSS files** — Remove `static/css/nested-menu.css`, `static/css/header.css`, `static/css/tags.css` after porting to Tailwind.
5. **Final testing** — Test all pages, responsive breakpoints, print styles, dark mode (if applicable); run Lighthouse audit to confirm CSS size reduction.

**Verification**: Site fully functional without Bulma; CSS bundle < 20KB; no console errors; all interactions work.

---

## Further Considerations

1. **Parallel CSS during migration** — Keep both Bulma + Tailwind loaded through Phases 1-7 for safety, but this doubles CSS size temporarily. Acceptable for dev; remove Bulma only in Phase 8.
2. **DaisyUI theme customization** — The `cookbook` theme in `tailwind.config.js` should match your current brand colors exactly. Review after Phase 1 setup.
3. **Testing strategy** — Consider adding visual regression tests (e.g., Percy, Playwright screenshots) before Phase 1 to catch unintended changes during migration.

---

## Reference: Key Files

| Category | Files |
|----------|-------|
| **Templates** | `layouts/_default/baseof.html`, `layouts/_default/single.html`, `layouts/index.html`, `layouts/partials/header.html`, `layouts/partials/summary.html` |
| **CSS** | `static/css/custom.css`, `static/css/header.css`, `static/css/nested-menu.css`, `static/css/tags.css` |
| **JavaScript** | `static/js/navbar.js`, `static/js/custom.js`, `static/js/menu.js`, `static/js/filter.js`, `static/js/listFilter.js` |
| **Config** | `package.json`, `hugo.toml`, `layouts/partials/head.html` |

---

## Estimated Effort

| Phase | Days | Complexity |
|-------|------|------------|
| Phase 1: Setup | 1-2 | Low |
| Phase 2: Buttons & Tags | 1 | Low |
| Phase 3: Cards | 1-2 | Medium |
| Phase 4: Forms & Filters | 2 | Medium |
| Phase 5: Navbar | 2-3 | High |
| Phase 6: Modals | 1 | Medium |
| Phase 7: Layout & Grid | 1-2 | Medium |
| Phase 8: Cleanup | 2-3 | Low |
| **Total** | **12-16 days** | |
