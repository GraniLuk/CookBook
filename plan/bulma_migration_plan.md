# Bulma CSS Migration Plan: v0.9.4 → v1.0.4

## Executive Summary

Comprehensive migration plan to upgrade Bulma CSS from 0.9.4 to 1.0.4 for the Hugo CookBook static site. This migration addresses critical breaking changes in the grid system while leveraging new features to enhance site functionality.

**Complexity Level:** HIGH  
**Estimated Effort:** 16-22 hours (10-14h development, 6-8h testing)  
**Primary Challenge:** Deprecated fractional column classes used extensively (~100+ instances)  
**Grid System Decision:** Use `is-2-desktop` (~16.67% width, 6 cards per row) with custom CSS override to maintain 20% width

---

## Migration Overview

### What's Changing

**Bulma 1.0 Major Changes:**
- Full rewrite using Dart Sass (primary Sass implementation)
- Grid system migrated from fractional classes to 12-column numeric system
- Extensive CSS variable system introduction
- Enhanced responsive modifiers and utilities
- New features: Smart Grid, improved form variables, typography additions

**Current Site Architecture:**
- NPM-based precompiled CSS (no Sass compilation)
- 25+ layout files using deprecated fractional column classes
- Custom 3-level navbar with extensive Bulma customization
- Heavy use of `!important` overrides in custom CSS
- No CSS variables or dark mode implementation

---

## Phase 1: Preparation & Analysis

### 1.1 Create Git Branch & Backup
```powershell
git checkout -b feature/bulma-1.0-migration
git push -u origin feature/bulma-1.0-migration
```

### 1.2 Document Current Column Usage

**Fractional Column Mapping (0.9.4 → 1.0.4):**

| Old Class (v0.9.4) | New Class (v1.0.4) | Grid Width | Notes |
|-------------------|-------------------|-----------|--------|
| `is-one-fifth-desktop` | `is-2-desktop` | ~16.67% (2/12) | ⚠️ Narrower than 20% |
| `is-one-quarter-desktop` | `is-3-desktop` | 25% (3/12) | ✅ Exact match |
| `is-one-quarter-tablet` | `is-3-tablet` | 25% (3/12) | ✅ Exact match |
| `is-one-quarter-mobile` | `is-3-mobile` | 25% (3/12) | ✅ Exact match |
| `is-one-third-desktop` | `is-4-desktop` | 33.33% (4/12) | ✅ Exact match |
| `is-one-third-mobile` | `is-4-mobile` | 33.33% (4/12) | ✅ Exact match |
| `is-half-desktop` | `is-6-desktop` | 50% (6/12) | ✅ Exact match |
| `is-half-tablet` | `is-6-tablet` | 50% (6/12) | ✅ Exact match |
| `is-two-thirds-desktop` | `is-8-desktop` | 66.67% (8/12) | ✅ Exact match |
| `is-full-mobile` | `is-full-mobile` | 100% | ✅ Still valid |

**5-Column Layout Approach:**

**✅ CHOSEN SOLUTION: Option A** - Use `is-2-desktop` (16.67% base width) with custom CSS override to maintain exact 20% width.

**Why Option A:**
- Closest match to current 5-column layout
- Uses standard Bulma 1.0 grid classes
- Custom CSS override maintains exact 20% width
- Keeps 5 cards per row on desktop (current design)
- Consistent with Bulma's 12-column system

**Alternatives Considered (Not Selected):**
- Option B: `is-3-desktop` (25% width, 4 cards per row) — Changes layout density
- Option C: Smart Grid `is-col-min` — Unpredictable card counts per row
- Option D: Only custom CSS width overrides — No fallback to Bulma classes

### 1.3 Affected Files Inventory

**Layouts Requiring Updates (25+ files):**
- `layouts/index.html` — Home page recipe grid (PRIMARY)
- `layouts/_default/list.html` — Category list pages
- `layouts/_default/single.html` — Single recipe page (hero layout)
- `layouts/diet/list.html` — Diet taxonomy pages
- `layouts/categories/list.html` — Category taxonomy
- `layouts/queued/list.html` — Queued recipes
- `layouts/favourites/list.html` — Favourite recipes
- `layouts/weekly-plans/*.html` — Weekly meal plan grids
- `layouts/partials/summary.html` — Recipe card partial (used everywhere)
- `layouts/partials/statstable.html` — Stats table (3-column mobile)
- `layouts/partials/macrostable.html` — Macros table (4-column mobile)
- `layouts/partials/printstatstable.html` — Print version stats

**JavaScript Files:**
- `static/js/custom.js` — Search results card generation (line 127)

**CSS Files (Potential Conflicts):**
- `static/css/custom.css` — 1,100+ lines with extensive overrides
- `static/css/nested-menu.css` — 3-level navbar customization

**Build Files:**
- `package.json` — Bulma dependency version
- `.github/workflows/hugo.yml` — CI/CD pipeline

---

## Phase 2: Core Migration (Bulma Update)

### 2.1 Update Package Dependencies

**File:** `package.json`

```json
{
  "dependencies": {
    "bulma": "^1.0.4"  // Changed from "^0.9.4"
  }
}
```

### 2.2 Install & Build

```powershell
# Install updated Bulma
npm install

# Verify installation
npm list bulma
# Expected: bulma@1.0.4

# Copy new Bulma CSS to static directory
npm run copy-bulma

# Verify file update
Get-Item static/css/bulma.min.css | Select-Object Name, Length, LastWriteTime
```

### 2.3 Initial Hugo Build Test

```powershell
# Build without minification for easier debugging
hugo --cleanDestinationDir

# Check for build errors or warnings
# Expected: Some layout rendering may look broken at this stage
```

---

## Phase 3: Grid System Migration (Systematic Replacement)

### 3.1 Global Find-and-Replace Operations

**Execute in VS Code or via PowerShell script:**

```powershell
# Navigate to layouts directory
cd d:\repos\CookBook\layouts

# Find all HTML files with column classes
Get-ChildItem -Recurse -Include *.html | Select-String -Pattern "is-one-(fifth|quarter|third|half)|is-two-thirds"
```

**Replacement Matrix (Execute in Order):**

1. **Desktop Classes:**
   - `is-one-fifth-desktop` → `is-2-desktop`
   - `is-one-quarter-desktop` → `is-3-desktop`
   - `is-one-third-desktop` → `is-4-desktop`
   - `is-half-desktop` → `is-6-desktop`
   - `is-two-thirds-desktop` → `is-8-desktop`

2. **Tablet Classes:**
   - `is-one-quarter-tablet` → `is-3-tablet`
   - `is-half-tablet` → `is-6-tablet`

3. **Mobile Classes:**
   - `is-one-quarter-mobile` → `is-3-mobile`
   - `is-one-third-mobile` → `is-4-mobile`
   - `is-half-mobile` → `is-6-mobile`
   - `is-full-mobile` → `is-full-mobile` (NO CHANGE)

### 3.2 Critical File Updates

#### A. Home Page Recipe Grid
**File:** `layouts/index.html` (Line 113)

**Before:**
```html
<div class="column is-one-fifth-desktop is-one-quarter-tablet is-full-mobile"
```

**After:**
```html
<div class="column is-2-desktop is-3-tablet is-full-mobile"
```

#### B. Search Results Template
**File:** `static/js/custom.js` (Line 127)

**Before:**
```javascript
col.className = 'column is-one-fifth-desktop is-one-quarter-tablet is-full-mobile';
```

**After:**
```javascript
col.className = 'column is-2-desktop is-3-tablet is-full-mobile';
```

#### C. Stats Table (Mobile 3-Column)
**File:** `layouts/partials/statstable.html` (Lines 2, 9, 16)

**Before:**
```html
<div class="column is-one-third-mobile" style="border-right: 1px solid #dbdbdb">
```

**After:**
```html
<div class="column is-4-mobile" style="border-right: 1px solid #dbdbdb">
```

#### D. Macros Table (Mobile 4-Column)
**File:** `layouts/partials/macrostable.html` (Lines 2, 9, 16, 23)

**Before:**
```html
<div class="column is-one-quarter-mobile" style="border-right: 1px solid #dbdbdb">
```

**After:**
```html
<div class="column is-3-mobile" style="border-right: 1px solid #dbdbdb">
```

#### E. Recipe Detail Page
**File:** `layouts/_default/single.html` (Line 3)

**Before:**
```html
<div class="column is-full-mobile is-two-thirds-desktop recipe-card">
```

**After:**
```html
<div class="column is-full-mobile is-8-desktop recipe-card">
```

#### F. Category/Taxonomy Pages
**File:** `layouts/_default/list.html` (Line 9)  
**File:** `layouts/categories/list.html` (Line 25)  
**File:** `layouts/diet/list.html` (Lines 51, 61)  
**File:** `layouts/queued/list.html` (Line 10)

**Before:**
```html
<div class="column is-one-fifth-desktop is-one-quarter-tablet is-full-mobile">
```

**After:**
```html
<div class="column is-2-desktop is-3-tablet is-full-mobile">
```

### 3.3 Verification Script

```powershell
# Check for any remaining deprecated classes
$deprecatedClasses = @(
    "is-one-fifth",
    "is-one-quarter",
    "is-one-third",
    "is-two-thirds",
    "is-half"
)

Get-ChildItem -Path layouts, static/js -Recurse -Include *.html,*.js | 
    Select-String -Pattern ($deprecatedClasses -join '|') |
    Select-Object Path, LineNumber, Line
```

---

## Phase 4: CSS Custom Overrides Review

### 4.1 Analyze Custom CSS Conflicts

**File:** `static/css/custom.css`

**High-Risk Areas:**

1. **Forced Column Widths (Lines 186-198):**
```css
@media screen and (min-width: 1024px) {
    .section .columns.is-multiline .column.is-one-quarter {
        flex: 0 0 25% !important;
        max-width: 25% !important;
        min-width: 25% !important;
        width: 25% !important;
    }
}
```

**Action Required:** Update selector to `.column.is-3-desktop` or remove if Bulma 1.0 handles this correctly.

2. **Heavy `!important` Usage (100+ instances):**
- May conflict with Bulma 1.0's CSS variable system
- **Action:** Test each override; remove unnecessary `!important` flags
- **Priority:** Border-radius overrides (lines 58-162)

### 4.2 Update Custom Width Overrides

**Required Action: Override is-2-desktop to 20% Width**

```css
/* static/css/custom.css - Update existing width override section */
@media screen and (min-width: 1024px) {
    /* Override is-2-desktop (16.67%) to maintain 5-column layout (20%) */
    .section .columns.is-multiline .column.is-2-desktop {
        flex: 0 0 20% !important;
        max-width: 20% !important;
        width: 20% !important;
    }
    
    /* Also update is-3-desktop for 4-column layouts (unchanged) */
    .section .columns.is-multiline .column.is-3-desktop {
        flex: 0 0 25% !important;
        max-width: 25% !important;
        width: 25% !important;
    }
    
    /* Ensure cards fill their containers properly */
    .section .columns.is-multiline .column .card {
        width: 100% !important;
        height: 100%;
    }
}
```

**Rationale:**
- `is-2-desktop` defaults to 16.67% (2/12 columns)
- Custom override brings it back to exactly 20% (5 cards per row)
- Maintains current visual design and card density
- Provides fallback: Without CSS, shows 6 cards per row (acceptable degradation)

---

## Phase 5: New Features Adoption

### 5.1 Typography Enhancement

**New Feature:** `has-text-weight-extrabold` (v1.0.4 #3937)

**Opportunities:**
- Recipe titles in hero overlay (`layouts/_default/single.html`)
- Card titles on hover states
- Section headings for emphasis

**Implementation Example:**
```html
<!-- Before -->
<h1 class="title is-bold has-text-white">{{ .Title }}</h1>

<!-- After (enhanced emphasis) -->
<h1 class="title has-text-weight-extrabold has-text-white">{{ .Title }}</h1>
```

### 5.2 CSS Variables for Theming

**New Feature:** Root-configurable variables (v1.0.4 #3906)

**Current Hardcoded Colors in custom.css:**
- Primary: `#00d1b2` (Bulma teal)
- Fire icon: `#ff6b35`
- Dumbbell icon: `#4ecdc4`
- Droplet icon: `#687935`
- Wheat icon: `#f9ca24`

**Migration to CSS Variables:**

Create new file: `static/css/variables.css`

```css
:root {
    /* Override Bulma defaults */
    --bulma-primary-h: 171;
    --bulma-primary-s: 100%;
    --bulma-primary-l: 41%;
    
    /* Custom recipe icon colors */
    --recipe-icon-fire: #ff6b35;
    --recipe-icon-protein: #4ecdc4;
    --recipe-icon-fat: #687935;
    --recipe-icon-carbs: #f9ca24;
    
    /* FODMAP status colors */
    --fodmap-yes: #48c774;
    --fodmap-depends: #ffe08a;
    --fodmap-no: #f14668;
    
    /* Card styling */
    --card-radius: 16px;
    --card-shadow: 0 12px 28px rgba(0, 0, 0, .12);
    --card-shadow-hover: 0 16px 32px rgba(0, 0, 0, .18);
}
```

**Update icon colors in templates:**
```html
<!-- Before -->
<i class="fas fa-fire" style="color: #ff6b35;"></i>

<!-- After -->
<i class="fas fa-fire" style="color: var(--recipe-icon-fire);"></i>
```

### 5.3 Enhanced Form Variables

**New CSS Variables (v1.0.2):**
- `--bulma-input-border-style`
- `--bulma-input-border-width`
- `--bulma-label-color`
- `--bulma-label-spacing`
- `--bulma-field-block-spacing`

**Application:** Search form in navbar, filter dropdowns

```css
:root {
    --bulma-input-border-width: 2px;
    --bulma-label-spacing: 0.75em;
    --bulma-field-block-spacing: 1rem;
}
```

### 5.4 Container Max-Width Modifier

**New Feature:** `is-max-tablet` modifier (v1.0.2)

**Use Case:** Weekly meal plan print layout

```html
<!-- Limit container width for better print formatting -->
<div class="container is-max-tablet">
    {{ partial "weekly-plan-content.html" . }}
</div>
```

### 5.5 Section Full-Height

**New Feature:** `is-fullheight` modifier for sections (v1.0.2)

**Use Case:** Landing pages, error pages

```html
<!-- 404 page enhancement -->
<section class="section is-fullheight">
    <div class="container has-text-centered">
        <h1 class="title">404 - Nie znaleziono przepisu</h1>
    </div>
</section>
```

### 5.6 Helper Class Enhancements

**New Values (v1.0.2):**
- Color helpers: `has-text-currentColor`, `has-text-inherit`
- Background helpers: `has-background-currentColor`, `has-background-inherit`

**Use Case:** Icon color inheritance

```html
<!-- Before: Explicit color needed -->
<span class="icon" style="color: #00d1b2;">
    <i class="fas fa-check"></i>
</span>

<!-- After: Inherit from parent -->
<span class="icon has-text-currentColor">
    <i class="fas fa-check"></i>
</span>
```

---

## Phase 6: Component Testing

### 6.1 Navbar & Navigation

**Test Checklist:**
- [ ] Desktop: Primary navigation links visible and clickable
- [ ] Desktop: 3-level nested dropdown menus expand correctly (left: 100%)
- [ ] Desktop: Hover states trigger dropdown visibility
- [ ] Mobile: Burger menu toggles `.is-active` class
- [ ] Mobile: Nested dropdowns display vertically
- [ ] Mobile: Dropdown scrolling works (custom scrollbar styles)
- [ ] Search form: Input field styling consistent
- [ ] FODMAP toggle: Icon and functionality preserved

**Files to Monitor:**
- `layouts/partials/header.html`
- `static/css/nested-menu.css`
- `static/js/navbar.js`

### 6.2 Grid Layouts

**Test Scenarios:**

| Breakpoint | Expected Layout | Verification |
|-----------|-----------------|--------------|
| Desktop (1024px+) | 5-6 recipe cards per row (is-2-desktop) | Visual check, measure widths |
| Tablet (768-1023px) | 4 cards per row (is-3-tablet) | Resize browser window |
| Mobile (<768px) | 1 card per row (is-full-mobile) | Mobile device or DevTools |
| Stats table mobile | 3 columns (is-4-mobile) | Check recipe detail page |
| Macros table mobile | 4 columns (is-3-mobile) | Check recipe detail page |

### 6.3 Interactive Components

**Dropdowns (Filter System):**
- [ ] Ingredient dropdown toggles `.is-active` on click
- [ ] Category dropdown toggles `.is-active` on click
- [ ] Click outside closes dropdown
- [ ] Selected items display as tags below
- [ ] Clear button removes all filters
- [ ] Results count updates correctly

**Modal (Video Playback):**
- [ ] Modal opens with `.is-active` class
- [ ] Video player loads and plays
- [ ] Close button (`modal-close`) dismisses modal
- [ ] Background click closes modal
- [ ] Keyboard ESC closes modal

**Buttons:**
- [ ] Primary buttons maintain pill shape (border-radius: 999px)
- [ ] Hover effects trigger (transform, box-shadow)
- [ ] Loading state displays spinner (is-loading)
- [ ] Size modifiers work (is-small, is-medium, is-large)

### 6.4 Recipe Cards

**Visual Checks:**
- [ ] Card border-radius (16px) renders correctly
- [ ] Hover transform effect triggers (-4px translateY)
- [ ] Image aspect-ratio (1/1) maintained
- [ ] Title text truncates at 2 lines (-webkit-line-clamp)
- [ ] Macro icons display with correct colors
- [ ] FODMAP badge positions correctly
- [ ] Tag overlay visible on card image

### 6.5 Forms & Inputs

**Search & Filters:**
- [ ] Search input in navbar: border-radius, focus states
- [ ] Dropdown search inputs: styling consistent
- [ ] Checkbox labels: clickable and aligned
- [ ] Filter toggle button: icon rotation on expand

---

## Phase 7: Responsive Testing Matrix

### 7.1 Breakpoint Testing

**Desktop Testing (1024px - 1920px):**

| Resolution | Target | Tests |
|-----------|--------|-------|
| 1024x768 | Small desktop/laptop | Grid wrapping, navbar fit |
| 1280x720 | Standard laptop | Default card density |
| 1366x768 | Common laptop | Horizontal scrolling check |
| 1920x1080 | Full HD | Max content width, whitespace |

**Tablet Testing (768px - 1023px):**

| Device | Resolution | Tests |
|--------|-----------|-------|
| iPad (portrait) | 768x1024 | 4-column grid, navbar collapse |
| iPad (landscape) | 1024x768 | Desktop vs tablet breakpoint |
| iPad Pro 11" | 834x1194 | Touch target sizes |

**Mobile Testing (<768px):**

| Device | Resolution | Tests |
|--------|-----------|-------|
| iPhone SE | 375x667 | Smallest viable screen |
| iPhone 12/13/14 | 390x844 | Single column layout |
| iPhone 14 Pro Max | 430x932 | Large mobile experience |
| Galaxy S21 | 360x800 | Android viewport |

### 7.2 Browser Compatibility

**Desktop Browsers:**
- [ ] Chrome 120+ (Windows/Mac)
- [ ] Firefox 121+ (Windows/Mac)
- [ ] Safari 17+ (Mac)
- [ ] Edge 120+ (Windows)

**Mobile Browsers:**
- [ ] Safari iOS 17+ (iPhone/iPad)
- [ ] Chrome Android 120+
- [ ] Samsung Internet 23+

**CSS Feature Support:**
- [ ] CSS Variables (`var()`)
- [ ] CSS Grid (Bulma 1.0 uses flexbox primarily)
- [ ] Aspect-ratio (custom.css uses this)
- [ ] Backdrop-filter (navbar blur effect)

### 7.3 Print Testing

**Print Stylesheet Verification:**

```powershell
# Test print layout in browser
# File → Print Preview or Ctrl+P
```

**Checklist:**
- [ ] Weekly meal plan grid prints on single page
- [ ] Recipe card images scale correctly (max-width: 100px)
- [ ] Column layouts display properly (flex display forced)
- [ ] No horizontal overflow
- [ ] FODMAP panel prints with borders
- [ ] Navigation and footer excluded (display: none)

**Files:** `static/css/custom.css` (lines 519-607, @media print)

---

## Phase 8: Performance & Optimization

### 8.1 CSS File Size Comparison

```powershell
# Before (Bulma 0.9.4)
Get-Item static/css/bulma.min.css | Select-Object Name, @{N='Size(KB)';E={[math]::Round($_.Length/1KB, 2)}}

# After (Bulma 1.0.4)
Get-Item static/css/bulma.min.css | Select-Object Name, @{N='Size(KB)';E={[math]::Round($_.Length/1KB, 2)}}

# Compare sizes
# Expected: Bulma 1.0.4 may be slightly larger due to CSS variables
```

### 8.2 Build Time Measurement

```powershell
# Measure Hugo build time
Measure-Command { hugo --cleanDestinationDir --quiet }

# Expected: No significant change (precompiled CSS)
```

### 8.3 Lighthouse Audit

**Run in Chrome DevTools:**
1. Open site in Chrome: `http://localhost:1313/CookBook/`
2. DevTools → Lighthouse → Generate report
3. Focus on:
   - Performance score
   - Cumulative Layout Shift (CLS)
   - Largest Contentful Paint (LCP)
   - First Contentful Paint (FCP)

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### 8.4 CSS Variable Fallbacks

**Ensure browser compatibility:**

```css
/* Add fallbacks for older browsers */
.card {
    background: #ffffff; /* Fallback */
    background: var(--bulma-card-background, #ffffff);
}
```

---

## Phase 9: CI/CD Pipeline Updates

### 9.1 Update GitHub Actions Workflow

**File:** `.github/workflows/hugo.yml`

**Add Bulma version verification step:**

```yaml
# In test job, after "Install Node.js dependencies"
- name: Verify Bulma version
  run: |
    BULMA_VERSION=$(npm list bulma --depth=0 | grep bulma@ | sed 's/.*bulma@//')
    echo "Installed Bulma version: $BULMA_VERSION"
    if [[ ! "$BULMA_VERSION" =~ ^1\.0\.[4-9] ]]; then
      echo "Error: Bulma version must be 1.0.4 or higher"
      exit 1
    fi
```

### 9.2 Extend Test Coverage

**Add visual regression test placeholder:**

```yaml
- name: Run layout tests
  run: |
    echo "Visual regression testing would go here"
    # Future: Integrate Percy, Chromatic, or BackstopJS
```

### 9.3 Deployment Validation

**Post-deployment smoke tests:**

```powershell
# After deployment, verify key pages
$baseUrl = "https://graniluk.github.io/CookBook"
$testPages = @(
    "$baseUrl/",
    "$baseUrl/categories/",
    "$baseUrl/pasta-twarogowa-z-tahini-i-granatem/"
)

foreach ($page in $testPages) {
    $response = Invoke-WebRequest -Uri $page -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ $page - OK"
    } else {
        Write-Host "❌ $page - FAILED ($($response.StatusCode))"
    }
}
```

---

## Phase 10: Rollback Plan

### 10.1 Quick Revert Procedure

**If critical issues discovered post-migration:**

```powershell
# Revert to pre-migration state
git checkout main
git branch -D feature/bulma-1.0-migration

# Or revert specific files
git checkout main -- package.json static/css/bulma.min.css

# Rebuild with old version
npm install
npm run copy-bulma
hugo --cleanDestinationDir
```

### 10.2 Partial Rollback Option

**Keep new grid classes but revert Bulma:**

```json
// package.json - revert to stable version
{
  "dependencies": {
    "bulma": "^0.9.4"
  }
}
```

**Update grid classes back to fractional:**
- Use find-and-replace in reverse
- Keep improved custom CSS
- Document incompatibilities

### 10.3 Staging Environment

**Test migration on staging before production:**

```powershell
# Create staging branch
git checkout -b staging/bulma-migration
git push -u origin staging/bulma-migration

# Deploy to GitHub Pages test branch (if configured)
# Or use local Hugo server for extended testing
hugo server -D --port 1314
```

---

## Future Enhancements (Post-Migration)

**Note:** Dark mode implementation and Sass compilation will be handled as separate feature projects after this migration is complete.

### 1. Smart Grid Implementation



**Bulma 1.0.2 Feature:** `is-col-min` (auto-fitting columns)

**Replace fixed column classes with flexible grid:**

```html
<!-- Before: Fixed 5-column desktop layout -->
<div class="columns is-multiline">
    <div class="column is-2-desktop is-3-tablet is-full-mobile">
        <!-- Recipe card -->
    </div>
</div>

<!-- After: Auto-fitting grid -->
<div class="columns is-multiline">
    <div class="column is-col-min-12">
        <!-- Recipe card: Min 12rem width, auto-wraps -->
    </div>
</div>
```

**Benefits:**
- Responsive without media queries
- Better card distribution on wide screens
- No need for multiple breakpoint classes

### 2. Accessibility Enhancements

**ARIA Improvements:**

```html
<!-- Enhanced dropdown accessibility -->
<div class="dropdown" id="ingredientDropdown" role="combobox" aria-expanded="false" aria-haspopup="listbox">
    <button class="dropdown-trigger" aria-controls="ingredient-list" aria-label="Wybierz składniki">
        <span>Wybierz składniki</span>
        <span class="icon is-small" aria-hidden="true">
            <i class="fas fa-angle-down"></i>
        </span>
    </button>
    <div class="dropdown-menu" role="listbox" id="ingredient-list">
        <!-- Options -->
    </div>
</div>
```

**Keyboard Navigation:**
- Trap focus in modal dialogs
- Arrow key navigation in dropdowns
- Skip-to-content link for navbar

### 3. Performance Optimization

**Lazy Loading Images:**

```html
<!-- Recipe cards with lazy loading -->
<img src="{{ $image_url }}" 
     alt="{{ .Title }}" 
     loading="lazy" 
     decoding="async"
     style="border-radius: 3%; width: 100%; height: 100%; object-fit: cover;">
```

**Critical CSS Extraction:**
- Extract above-the-fold styles
- Inline in `<head>` for faster initial render
- Defer non-critical CSS

**Font Optimization:**
- Self-host Font Awesome (currently CDN)
- Use `font-display: swap` for custom fonts
- Subset fonts to used characters

---

## Risk Assessment & Mitigation

### High-Risk Areas

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Grid layout breaks on desktop | High | Medium | Extensive visual testing, custom CSS fallbacks |
| Navbar dropdown positioning issues | High | Medium | Test 3-level menu thoroughly, keep nested-menu.css |
| Custom CSS conflicts with v1.0 | Medium | High | Review all `!important` flags, test CSS variable compatibility |
| JavaScript class toggling breaks | Medium | Low | Verify `.is-active` class behavior unchanged |
| Print layouts malfunction | Low | Low | Test print preview on sample recipes |
| Performance regression | Low | Low | Benchmark before/after, Lighthouse audits |

### Mitigation Strategies

1. **Phased Deployment:**
   - Test on local dev environment (1-2 days)
   - Deploy to staging branch (2-3 days user testing)
   - Production deployment (with rollback ready)

2. **Comprehensive Testing:**
   - Automated: CI/CD pipeline tests
   - Manual: Cross-browser, cross-device testing
   - User Acceptance: Staging environment review

3. **Fallback Options:**
   - Keep v0.9.4 branch as safety net
   - Document revert procedures
   - Monitor analytics for bounce rate spikes post-deployment

4. **Incremental Updates:**
   - Can adopt new features (typography, variables) gradually
   - Not required to implement everything in v1.0.4 immediately

---

## Success Metrics

### Technical Metrics

- [ ] All layout files updated with new column classes (0 deprecated classes found)
- [ ] Hugo builds without errors or warnings
- [ ] No console errors on any page
- [ ] All interactive components functional
- [ ] Print layouts render correctly
- [ ] CI/CD pipeline passes all tests

### Performance Metrics

- [ ] Lighthouse Performance score ≥ 90
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Total Blocking Time (TBT) < 200ms
- [ ] CSS bundle size increase < 10% (or decrease with optimization)

### User Experience Metrics

- [ ] All recipe cards display correctly across breakpoints
- [ ] Navigation usable on mobile and desktop
- [ ] Search and filters function as expected
- [ ] No visual regressions detected
- [ ] Accessibility score ≥ 95

### Documentation

- [ ] Migration process documented
- [ ] New CSS variable system documented
- [ ] Updated development guide for contributors
- [ ] Rollback procedure tested and documented

---

## Timeline & Effort Estimate

### Development Phase (10-14 hours)

| Task | Estimated Time |
|------|----------------|
| Preparation & branch setup | 1-2 hours |
| Package update & Bulma installation | 0.5 hours |
| Grid class find-and-replace (25+ files) | 2-3 hours |
| Custom CSS review & updates (is-2-desktop override) | 2-3 hours |
| New features implementation (variables, typography) | 1-2 hours |
| JavaScript updates (search template) | 1 hour |
| CI/CD pipeline updates | 1-2 hours |
| Documentation | 1-2 hours |

### Testing Phase (6-8 hours)

| Task | Estimated Time |
|------|----------------|
| Layout testing (all breakpoints) | 2 hours |
| Component testing (navbar, dropdowns, modals) | 1-2 hours |
| Cross-browser testing | 2 hours |
| Print layout testing | 0.5 hours |
| Performance audits | 0.5-1 hours |
| Accessibility testing | 1 hour |

### Total Estimated Effort: 16-22 hours

**Suggested Schedule:**
- **Week 1:** Development (2-3 days, 4-6 hours/day)
- **Week 2:** Testing & refinement (2-3 days, 4-6 hours/day)
- **Week 3:** Staging deployment & user testing (ongoing)
- **Week 4:** Production deployment & monitoring

---

## Checklist: Ready for Production

### Pre-Deployment
- [ ] Git branch created: `feature/bulma-1.0-migration`
- [ ] All fractional column classes replaced
- [ ] Custom CSS reviewed and updated
- [ ] New features implemented (typography, variables)
- [ ] JavaScript search template updated
- [ ] No deprecated class warnings in console

### Testing Complete
- [ ] Desktop layouts verified (1024px - 1920px)
- [ ] Tablet layouts verified (768px - 1023px)
- [ ] Mobile layouts verified (<768px)
- [ ] Navbar 3-level dropdowns functional
- [ ] Filter system working
- [ ] Video modals working
- [ ] Print layouts correct
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile browser tested (iOS Safari, Chrome Android)

### Performance
- [ ] Lighthouse scores meet targets
- [ ] No layout shift issues (CLS < 0.1)
- [ ] Fast page loads (LCP < 2.5s)
- [ ] CSS file size acceptable

### Documentation
- [ ] CHANGELOG.md updated
- [ ] README.md updated (if needed)
- [ ] Migration notes documented
- [ ] Rollback procedure documented

### Deployment
- [ ] CI/CD pipeline passes
- [ ] Staging environment tested
- [ ] User acceptance complete
- [ ] Production deployment plan ready
- [ ] Monitoring tools configured
- [ ] Rollback plan tested

---

## Conclusion

This migration plan provides a comprehensive roadmap for upgrading Bulma CSS from v0.9.4 to v1.0.4. The primary challenge is updating deprecated fractional column classes across 25+ layout files, but the process is straightforward with systematic find-and-replace operations.

**Key Takeaways:**

1. **Breaking Changes:** Focus on grid system migration (fractional → 12-column numeric)
2. **Grid Strategy:** Use `is-2-desktop` with CSS override to maintain 20% width (5-column layout)
3. **New Opportunities:** CSS variables, enhanced typography, improved form styling
4. **Testing Critical:** Extensive cross-browser and responsive testing required
5. **Low Risk:** Precompiled CSS setup makes rollback simple
6. **Scoped Focus:** Dark mode and Sass compilation deferred to separate features

**Recommended Next Steps:**

1. Schedule development window (16-22 hours over 2-3 weeks)
2. Create `feature/bulma-1.0-migration` branch
3. Begin Phase 1: Preparation & Analysis
4. Execute systematic grid class replacement (Phase 3)
5. Implement `is-2-desktop` width override at 20% (Phase 4)
6. Thorough testing across all breakpoints (Phases 6-7)
7. Deploy to staging for user acceptance testing
8. Production deployment with monitoring

**Questions or concerns?** Review the Risk Assessment section and rollback procedures before beginning migration.

---

**Document Version:** 1.1  
**Created:** December 2, 2025  
**Updated:** December 2, 2025  
**Target Bulma Version:** 1.0.4  
**Current Bulma Version:** 0.9.4  
**Site:** Hugo CookBook (graniluk.github.io/CookBook)

**Key Decisions:**
- Grid System: Option A (is-2-desktop with 20% CSS override)
- Dark Mode: Deferred to separate feature
- Sass Compilation: Deferred to separate feature
- Estimated Effort: 16-22 hours (reduced from 20-28 hours)
