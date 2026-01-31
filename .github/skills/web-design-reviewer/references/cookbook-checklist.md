# CookBook Visual Design Checklist

Quick reference checklist for reviewing the Hugo CookBook website design.

---

## Pre-Review Setup

- [ ] Hugo server running: `hugo server -D`
- [ ] Site accessible at: `http://localhost:1313/CookBook/`
- [ ] Browser automation tool configured (Playwright MCP)
- [ ] Test viewports ready: Mobile (375px), Tablet (768px), Desktop (1280px)

---

## Home Page (`/CookBook/`)

### Grid Layout
- [ ] Recipe cards display in responsive grid
- [ ] Grid adapts: 1 col mobile → 2 col tablet → 3-4 col desktop
- [ ] Consistent gap spacing between cards
- [ ] No horizontal scroll on any viewport
- [ ] Draft recipes are hidden

### Recipe Cards (`layouts/partials/summary.html`)
- [ ] All images are perfectly square (aspect-ratio: 1/1)
- [ ] Images use `object-fit: cover` (no distortion)
- [ ] Images load via `{{ partial "asset-url.html" }}`
- [ ] Hover effect works smoothly
- [ ] Card shadows consistent across all cards
- [ ] No broken/missing images

### Card Content
- [ ] Recipe title visible and readable
- [ ] Tagline/description displays correctly
- [ ] Macro badges (calories, protein, fat, carbs) visible
- [ ] FODMAP badge displays correctly (if applicable)
- [ ] Rating stars show properly (if applicable)
- [ ] Video icon visible for recipes with videos

### Typography
- [ ] Font sizes appropriate for viewport
- [ ] Text doesn't overflow card boundaries
- [ ] Proper text truncation with ellipsis
- [ ] Consistent font weights across cards

---

## Recipe Page (`/published/[category]/[recipe]`)

### Hero Section
- [ ] Hero image displays at full width
- [ ] Hero image NOT lazy-loaded (fetchpriority="high")
- [ ] Hero image uses `{{ partial "asset-url.html" }}`
- [ ] Image aspect ratio appropriate (not stretched)
- [ ] Media badge (video icon) visible if recipe has video
- [ ] FODMAP badge visible in hero if applicable

### Recipe Metadata
- [ ] Prep time, cook time visible
- [ ] Servings count displays
- [ ] Author name shows
- [ ] Rating displays correctly
- [ ] All icons/SVGs render properly

### Nutritional Information
- [ ] Macros table displays correctly
- [ ] Calories, protein, fat, carbs readable
- [ ] Table responsive on mobile
- [ ] No text overflow in table cells

### Ingredients Section
- [ ] Ingredients list is readable
- [ ] Bullet points/formatting correct
- [ ] FODMAP indicators visible (if applicable)
- [ ] No text clipping

### Preparation Steps
- [ ] Numbered steps display correctly
- [ ] Step formatting consistent
- [ ] Images in steps (if any) display properly
- [ ] No text overflow

### Video Modal (if applicable)
- [ ] Video button visible and styled correctly
- [ ] Modal opens on click
- [ ] Video iframe loads correctly (YouTube)
- [ ] Modal close button works
- [ ] Modal backdrop darkens background
- [ ] Modal centers on screen
- [ ] Modal responsive on mobile

### Edit Button (Decap CMS)
- [ ] Edit button visible (admin mode)
- [ ] Button positioned correctly
- [ ] Collection detection works (queued, published, etc.)

---

## Navigation

### Navbar
- [ ] Logo/site title visible
- [ ] All navigation links work
- [ ] Active page highlighted
- [ ] Mobile hamburger menu works
- [ ] Dropdown menus (if any) function correctly
- [ ] Search icon/button visible

### Search Functionality
- [ ] Search bar accessible
- [ ] Search results display correctly
- [ ] Fuse.js highlighting works
- [ ] Results cards maintain square images
- [ ] No results message displays properly

---

## Footer

- [ ] Footer content visible
- [ ] Links work correctly
- [ ] Social icons display (if applicable)
- [ ] Copyright text visible
- [ ] Footer responsive on mobile

---

## Responsive Design

### Mobile (375px - 767px)
- [ ] Single column layout
- [ ] Touch targets ≥ 44x44px
- [ ] Text readable without zooming
- [ ] Images scale properly
- [ ] No horizontal scroll
- [ ] Modals fit viewport

### Tablet (768px - 1023px)
- [ ] 2-column grid for cards
- [ ] Navigation adapts appropriately
- [ ] Touch-friendly interactions
- [ ] Images maintain aspect ratio

### Desktop (1024px+)
- [ ] 3-4 column grid for cards
- [ ] Hero images display at optimal size
- [ ] Hover states work on interactive elements
- [ ] Layout doesn't stretch awkwardly on wide screens

---

## Accessibility

### Color Contrast
- [ ] Text/background contrast ≥ 4.5:1 (WCAG AA)
- [ ] Badge text readable on colored backgrounds
- [ ] Link colors distinguishable
- [ ] Focus states visible

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Focus indicator clearly visible
- [ ] Tab order logical
- [ ] Modal trap focus correctly

### Images
- [ ] All images have alt text
- [ ] Alt text descriptive and meaningful
- [ ] Decorative images have empty alt=""

### Semantic HTML
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Lists use proper markup (<ul>, <ol>)
- [ ] Forms use labels correctly

---

## Performance

### Images
- [ ] Hero images use fetchpriority="high"
- [ ] Card images lazy-loaded
- [ ] No oversized images (check file sizes)
- [ ] Images properly optimized

### CSS
- [ ] Tailwind CSS loads correctly
- [ ] No render-blocking CSS
- [ ] Custom CSS loads after Tailwind
- [ ] No unused CSS causing bloat

### JavaScript
- [ ] No console errors
- [ ] Search JavaScript loads properly
- [ ] Modal scripts function correctly
- [ ] No JavaScript blocking rendering

---

## Brand/Style Consistency

### Colors
- [ ] Primary colors consistent (DaisyUI theme)
- [ ] Badge colors follow convention:
  - Green: low-FODMAP
  - Red: high-FODMAP
  - Yellow: ratings
  - Red: video indicators
- [ ] Background colors appropriate

### Spacing
- [ ] Consistent padding in cards
- [ ] Uniform margins between sections
- [ ] Grid gaps consistent
- [ ] Whitespace balanced

### Shadows & Effects
- [ ] Card shadows consistent
- [ ] Hover effects smooth (transition)
- [ ] No jarring animations
- [ ] Drop shadows subtle and appropriate

---

## Common Issues to Look For

### Critical (P1)
- ❌ Broken asset URLs (missing `/CookBook` prefix)
- ❌ Non-square recipe card images
- ❌ Hero images lazy-loaded (bad LCP)
- ❌ Layout overflow causing horizontal scroll
- ❌ Broken navigation links

### Important (P2)
- ⚠️ FODMAP badges not displaying
- ⚠️ Video modals not opening
- ⚠️ Rating stars rendering incorrectly
- ⚠️ Search functionality broken
- ⚠️ Mobile menu not working

### Minor (P3)
- ℹ️ Inconsistent spacing
- ℹ️ Hover effect missing on cards
- ℹ️ Font weight inconsistencies
- ℹ️ Shadow depth variations

---

## Testing Flow

1. **Home Page Review**
   - Load homepage
   - Check grid layout at all viewports
   - Verify card images are square
   - Test card hover effects

2. **Recipe Page Review**
   - Open a recipe from each category
   - Check hero image and metadata
   - Verify nutritional table
   - Test video modal (if applicable)
   - Check responsive layout

3. **Navigation Review**
   - Test all nav links
   - Open mobile menu
   - Use search functionality
   - Check breadcrumbs (if any)

4. **Responsive Review**
   - Resize browser from 375px to 1920px
   - Check breakpoint transitions
   - Verify touch targets on mobile
   - Test orientation changes (portrait/landscape)

5. **Accessibility Review**
   - Tab through page with keyboard
   - Check focus indicators
   - Verify alt text on images
   - Test with screen reader (if available)

---

## Fix Priority Matrix

| Priority | Issue Types | Action |
|----------|-------------|--------|
| **P1** | Layout breaks, broken URLs, missing images | Fix immediately |
| **P2** | Visual inconsistencies, broken features | Fix next |
| **P3** | Minor styling, polish | Fix if time permits |

---

## Post-Fix Verification

After making fixes:

- [ ] Run `hugo server -D` to verify locally
- [ ] Run `npm run build` to ensure production build works
- [ ] Test at all responsive breakpoints
- [ ] Check browser console for errors
- [ ] Verify no regression in other areas
- [ ] Take before/after screenshots
- [ ] Document changes made

---

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `layouts/_default/baseof.html` | Base template (site shell) |
| `layouts/_default/single.html` | Recipe page template |
| `layouts/index.html` | Homepage template |
| `layouts/partials/summary.html` | Recipe card partial |
| `layouts/partials/asset-url.html` | Asset URL helper |
| `assets/css/main.css` | Tailwind CSS v4 + DaisyUI |
| `static/css/custom.css` | Legacy custom styles |
| `static/js/share-recipe.js` | Video modal logic |
| `i18n/pl.yaml` | Polish translations |
| `hugo.toml` | Site configuration |
