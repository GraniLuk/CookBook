---
goal: "Implement Progressive Web App (PWA) foundation for offline cookbook with forward compatibility for meal planning and shopping lists"
version: 1.0
date_created: 2025-11-13
last_updated: 2025-11-13
owner: "CookBook Development Team"
status: "Planned"
tags: ["feature", "pwa", "offline", "architecture", "foundation"]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan establishes the Progressive Web App infrastructure for the CookBook Hugo site, enabling offline access, installability on Android devices, and laying the architectural foundation for future features including meal planning, shopping lists, and SQLite-based data management. The PWA will transform the static Hugo site into an app-like experience while maintaining compatibility with the existing `/CookBook/` base path and asset-url.html system.

## 1. Requirements & Constraints

### Requirements

- **REQ-001**: PWA must work offline with all recipes, images, CSS, and JavaScript cached
- **REQ-002**: Must be installable on Android devices via "Add to Home Screen"
- **REQ-003**: Must respect existing `/CookBook/` base path and asset-url.html partial system
- **REQ-004**: Service worker must handle Hugo-generated versioned asset URLs (cache-busting)
- **REQ-005**: Data architecture must support future IndexedDB/SQLite integration
- **REQ-006**: Must maintain backward compatibility with existing Hugo build process
- **REQ-007**: JavaScript modules must be structured for extensibility (meal planning, shopping lists)
- **REQ-008**: Must include update mechanism when new recipes are published
- **REQ-009**: Must provide user feedback during installation and updates
- **REQ-010**: Must work in Chrome, Edge, and Firefox on Android

### Security Requirements

- **SEC-001**: Service worker must only cache assets from same origin
- **SEC-002**: Must use HTTPS in production (GitHub Pages enforces this)
- **SEC-003**: No sensitive data in service worker cache (meal plans will use IndexedDB)

### Technical Constraints

- **CON-001**: Hugo is a static site generator - no server-side logic available
- **CON-002**: Current deployment is GitHub Pages under /CookBook/ subdirectory
- **CON-003**: Asset URLs use query string versioning (e.g., ?v=1731533062)
- **CON-004**: Images are AVIF format and may be large (require smart caching)
- **CON-005**: Recipe content is in Markdown, rendered to HTML at build time
- **CON-006**: Search uses Fuse.js with JSON index generated at build time

### Guidelines

- **GUD-001**: Follow Google Workbox best practices for service worker development
- **GUD-002**: Use progressive enhancement - site must work without PWA features
- **GUD-003**: Implement modular JavaScript architecture (ES6 modules where possible)
- **GUD-004**: Cache strategy should prioritize recipe content over decorative images
- **GUD-005**: Service worker should be versioned and self-updating
- **GUD-006**: Use semantic versioning for PWA manifest and service worker

### Patterns to Follow

- **PAT-001**: Stale-while-revalidate for HTML pages (fast load, background update)
- **PAT-002**: Cache-first for static assets (CSS, JS, fonts)
- **PAT-003**: Network-first for JSON search index (ensure latest recipes in search)
- **PAT-004**: Modular data layer pattern for future database integration
- **PAT-005**: Event-driven architecture for cross-module communication

## 2. Implementation Steps

### Phase 1: PWA Manifest & Icons

**Goal**: Make the app installable on Android devices

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create `/static/manifest.json` with app metadata (name: "Książka Kucharska", short_name: "CookBook", theme_color, background_color, display: standalone, scope: /CookBook/, start_url: /CookBook/) | | |
| TASK-002 | Generate PWA icon set: 192x192, 512x512 PNG icons based on existing favicon | | |
| TASK-003 | Add icons to `/static/icons/` directory | | |
| TASK-004 | Update `/layouts/partials/head.html` to link manifest using asset-url.html partial | | |
| TASK-005 | Update existing site.webmanifest or remove if replaced by manifest.json | | |
| TASK-006 | Test manifest validation using Chrome DevTools Lighthouse | | |

### Phase 2: Service Worker Foundation

**Goal**: Implement caching strategy for offline recipe access

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Create `/static/js/sw.js` service worker file with version constant (SW_VERSION = '1.0.0') | | |
| TASK-008 | Implement install event: cache critical assets (CSS, Bulma, Font Awesome, core JS files, homepage, offline fallback page) | | |
| TASK-009 | Implement activate event: clean up old caches, claim clients | | |
| TASK-010 | Implement fetch event with routing: cache-first for CSS/JS/images, stale-while-revalidate for HTML, network-first for /index.json search data | | |
| TASK-011 | Add service worker registration script in `/static/js/sw-register.js` with update detection and user notification | | |
| TASK-012 | Update `/layouts/partials/script.html` to load sw-register.js using asset-url.html | | |
| TASK-013 | Handle /CookBook/ base path in service worker fetch logic | | |
| TASK-014 | Test service worker in Chrome DevTools (Application tab) | | |

### Phase 3: Offline Fallback & UX

**Goal**: Provide graceful offline experience

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-015 | Create `/layouts/offline.html` template for offline fallback page | | |
| TASK-016 | Build offline.html page using Hugo (add to content/ or handle via archetype) | | |
| TASK-017 | Cache offline.html in service worker install event | | |
| TASK-018 | Implement offline detection in service worker: serve offline.html when fetch fails | | |
| TASK-019 | Add visual indicator in UI when app is offline (use navigator.onLine API in custom.js) | | |
| TASK-020 | Add "Back Online" notification when connection restored | | |

### Phase 4: Data Architecture for Future Features

**Goal**: Create modular data layer compatible with meal planning and shopping lists

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-021 | Create `/static/js/data/db-manager.js` module: abstraction layer for data storage (will wrap IndexedDB in future) | | |
| TASK-022 | Implement getRecipes() method in db-manager.js to fetch from Hugo-generated index.json | | |
| TASK-023 | Implement getRecipeById(id) method | | |
| TASK-024 | Create data schema documentation in `/plan/data-schema.md` defining: Recipe, Ingredient, MealPlan, ShoppingList structures | | |
| TASK-025 | Add placeholder methods for future features: saveMealPlan(), getShoppingList(), addIngredientToList() | | |
| TASK-026 | Export db-manager as ES6 module for use in future meal planning UI | | |

### Phase 5: Install Prompt & Update Notifications

**Goal**: Guide users to install app and notify of updates

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-027 | Create `/static/js/install-prompt.js` to handle beforeinstallprompt event | | |
| TASK-028 | Add "Install App" button in navbar or footer (only show if not installed) | | |
| TASK-029 | Style install button using Bulma classes in `/static/css/custom.css` | | |
| TASK-030 | Implement install flow: show modal/banner on first visit, allow user to dismiss, save preference in localStorage | | |
| TASK-031 | Detect when app is installed (appinstalled event) and hide install button | | |
| TASK-032 | Create update notification UI: show toast when new service worker is waiting | | |
| TASK-033 | Add "Update Now" button to reload page and activate new service worker | | |

### Phase 6: Recipe Caching Strategy

**Goal**: Intelligently cache recipes for offline access without bloating cache

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-034 | Implement runtime caching in service worker: cache recipe pages as user visits them | | |
| TASK-035 | Set cache size limit (e.g., max 50 recipe pages, LRU eviction) | | |
| TASK-036 | Implement cache-first strategy for recipe images (AVIF files) with size limit (e.g., 50MB) | | |
| TASK-037 | Add "Save for Offline" button on recipe pages (pre-cache specific recipe + images) | | |
| TASK-038 | Create "My Offline Recipes" page listing cached recipes with remove option | | |
| TASK-039 | Store list of manually saved recipes in IndexedDB (prepare for future data layer) | | |

### Phase 7: Testing & Validation

**Goal**: Ensure PWA works across devices and meets standards

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-040 | Run Lighthouse PWA audit: target score 90+ | | |
| TASK-041 | Test installation on Android Chrome | | |
| TASK-042 | Test installation on Android Edge | | |
| TASK-043 | Test offline functionality: view recipes, navigate, search (search will show cached results) | | |
| TASK-044 | Test update flow: deploy new version, verify service worker updates, check user notification | | |
| TASK-045 | Validate manifest.json using https://manifest-validator.appspot.com/ | | |
| TASK-046 | Test with slow 3G network throttling to verify caching effectiveness | | |
| TASK-047 | Cross-browser testing: verify Font Awesome loads offline, Bulma styles apply | | |

### Phase 8: Documentation & Deployment

**Goal**: Document PWA features and deploy to production

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-048 | Update `/README.md` with PWA installation instructions for users | | |
| TASK-049 | Create `/docs/pwa-architecture.md` documenting service worker strategy, cache keys, update flow | | |
| TASK-050 | Add developer notes in `/docs/pwa-development.md`: how to test locally, update service worker version, cache debugging | | |
| TASK-051 | Update Hugo build script (if any) to ensure service worker and manifest are copied to /public | | |
| TASK-052 | Deploy to GitHub Pages and verify HTTPS (required for PWA) | | |
| TASK-053 | Add PWA badge/mention in site footer or about page | | |
| TASK-054 | Create user guide: "How to Install CookBook on Your Phone" with screenshots | | |

## 3. Alternatives

**Alternative Approaches Considered**

- **ALT-001**: Use Workbox library (Google''s service worker toolkit) instead of vanilla service worker
  - **Rejected**: Adds build complexity to Hugo setup; vanilla SW is sufficient for current needs and easier to customize
  
- **ALT-002**: Pre-cache all recipes at install time (eager caching)
  - **Rejected**: Too many recipes (~50+) would make initial install slow; runtime caching is more efficient
  
- **ALT-003**: Use AppCache API instead of Service Workers
  - **Rejected**: AppCache is deprecated and removed from modern browsers
  
- **ALT-004**: Implement PWA using a separate JavaScript framework (React, Vue)
  - **Rejected**: Over-engineering; Hugo + vanilla JS is simpler and maintains current architecture
  
- **ALT-005**: Store recipe data in localStorage instead of IndexedDB for future features
  - **Rejected**: localStorage has 5-10MB limit and is synchronous; IndexedDB supports larger data and async operations needed for meal plans
  
- **ALT-006**: Use Firebase for data sync instead of local-first approach
  - **Rejected**: Requires backend setup and costs; local-first with optional sync is better for privacy and offline-first goal

## 4. Dependencies

**External Dependencies**

- **DEP-001**: Hugo static site generator (already installed)
- **DEP-002**: Existing asset-url.html partial for base path handling
- **DEP-003**: Bulma CSS framework (already integrated)
- **DEP-004**: Font Awesome 6.6.0 from CDN (need to consider offline fallback or local copy)
- **DEP-005**: Fuse.js for search (loaded from CDN - need offline fallback)
- **DEP-006**: umbrella.min.js (already in static/js)

**Development Dependencies**

- **DEP-007**: Chrome DevTools or Edge DevTools for service worker debugging
- **DEP-008**: Lighthouse for PWA auditing
- **DEP-009**: Android device or emulator for installation testing
- **DEP-010**: HTTPS-enabled local server for testing (Hugo server with HTTPS or ngrok)

**Future Integration Points**

- **DEP-011**: IndexedDB API (native browser API, no external dependency)
- **DEP-012**: sql.js library for future SQLite integration (to be added in Phase 4 of roadmap)
- **DEP-013**: Potential Firebase SDK if family sync feature is implemented (Phase 5 of roadmap)

## 5. Files

**Files to Create**

- **FILE-001**: `/static/manifest.json` - PWA manifest with app metadata
- **FILE-002**: `/static/icons/icon-192.png` - App icon 192x192
- **FILE-003**: `/static/icons/icon-512.png` - App icon 512x512
- **FILE-004**: `/static/js/sw.js` - Service worker main file (~300 lines)
- **FILE-005**: `/static/js/sw-register.js` - Service worker registration and update handling (~100 lines)
- **FILE-006**: `/static/js/install-prompt.js` - Install prompt UI logic (~80 lines)
- **FILE-007**: `/static/js/data/db-manager.js` - Data layer abstraction (~200 lines initially, will grow)
- **FILE-008**: `/layouts/offline.html` - Offline fallback page template
- **FILE-009**: `/content/offline.md` - Offline page content (or handle as archetype)
- **FILE-010**: `/plan/data-schema.md` - Data structure documentation for future features
- **FILE-011**: `/docs/pwa-architecture.md` - PWA technical documentation
- **FILE-012**: `/docs/pwa-development.md` - Developer guide for PWA maintenance

**Files to Modify**

- **FILE-013**: `/layouts/partials/head.html` - Add manifest link (line ~8)
- **FILE-014**: `/layouts/partials/script.html` - Add sw-register.js script tag (end of file)
- **FILE-015**: `/static/css/custom.css` - Add styles for install button, offline indicator, update toast
- **FILE-016**: `/layouts/partials/header.html` or `/layouts/partials/navbar.html` - Add install button (if in navbar)
- **FILE-017**: `/layouts/_default/single.html` - Add "Save for Offline" button on recipe pages
- **FILE-018**: `/README.md` - Add PWA installation instructions
- **FILE-019**: `/hugo.toml` - Potentially add offline page to menu or handle build config

**Files to Review (for compatibility)**

- **FILE-020**: `/layouts/partials/asset-url.html` - Ensure service worker can parse its output
- **FILE-021**: `/static/js/custom.js` - Verify no conflicts with new modules, potentially refactor for modularity
- **FILE-022**: `/layouts/_default/index.json` - Ensure JSON structure is suitable for db-manager.js

## 6. Testing

**Unit Tests (Manual - future automation possible)**

- **TEST-001**: Verify manifest.json passes validation (manifest-validator.appspot.com)
- **TEST-002**: Test service worker install event: check cache storage in DevTools
- **TEST-003**: Test service worker activate event: verify old caches deleted
- **TEST-004**: Test fetch routing: verify CSS loads from cache, HTML from network then cache
- **TEST-005**: Test offline.html fallback: disconnect network, try to load uncached page
- **TEST-006**: Test db-manager.js: call getRecipes(), verify returns recipe array from index.json
- **TEST-007**: Test install prompt: verify beforeinstallprompt event captured, button shows

**Integration Tests**

- **TEST-008**: Full offline flow: install app, disconnect network, browse recipes, verify images load
- **TEST-009**: Update flow: change SW_VERSION, deploy, verify update notification appears
- **TEST-010**: Search offline: disconnect network, search for recipe, verify cached results (or graceful message)
- **TEST-011**: Save for offline: click button on recipe, verify page and images cached
- **TEST-012**: Cross-page navigation offline: verify internal links work without network

**Device Testing**

- **TEST-013**: Android Chrome: install app, verify home screen icon, verify standalone mode (no browser UI)
- **TEST-014**: Android Edge: install app, verify works identically to Chrome
- **TEST-015**: Desktop Chrome: verify install option appears, test desktop PWA
- **TEST-016**: iOS Safari (if applicable): verify Add to Home Screen works (limited PWA support)

**Performance Testing**

- **TEST-017**: Lighthouse PWA audit: achieve 90+ score
- **TEST-018**: Lighthouse Performance audit: maintain 90+ score after PWA implementation
- **TEST-019**: Cache size monitoring: verify cache doesn''t exceed 100MB after normal usage
- **TEST-020**: Network throttling: test on Slow 3G, verify recipes load < 5s from cache

**Regression Testing**

- **TEST-021**: Verify existing search functionality still works
- **TEST-022**: Verify recipe cards render correctly
- **TEST-023**: Verify asset-url.html still generates correct paths with query strings
- **TEST-024**: Verify Font Awesome icons load (online and offline)
- **TEST-025**: Verify FODMAP metadata displays correctly
- **TEST-026**: Verify YouTube badges and share buttons still function

## 7. Risks & Assumptions

**Risks**

- **RISK-001**: Service worker bugs could break entire site (all pages fail to load)
  - **Mitigation**: Implement kill-switch: service worker checks remote flag before activating; thorough testing before deployment
  
- **RISK-002**: Cache storage quota exceeded on devices with limited space
  - **Mitigation**: Implement cache size limits, LRU eviction, user control over cached recipes
  
- **RISK-003**: Font Awesome CDN not available offline breaks icons
  - **Mitigation**: Add Font Awesome CSS to service worker cache, or host locally
  
- **RISK-004**: Hugo build process doesn''t copy new PWA files to /public
  - **Mitigation**: Verify Hugo static file handling, add to build documentation
  
- **RISK-005**: Base path /CookBook/ causes issues with service worker scope
  - **Mitigation**: Explicitly set scope in manifest and service worker registration; test thoroughly
  
- **RISK-006**: Browser updates break service worker API compatibility
  - **Mitigation**: Use feature detection, follow web standards, monitor browser compatibility tables
  
- **RISK-007**: Future IndexedDB schema migrations are complex
  - **Mitigation**: Design flexible schema from start, use versioning, implement migration utilities

**Assumptions**

- **ASSUMPTION-001**: Users primarily access site on Android devices (Chrome/Edge)
- **ASSUMPTION-002**: GitHub Pages continues to support PWA requirements (HTTPS, service workers)
- **ASSUMPTION-003**: Current /CookBook/ base path will not change
- **ASSUMPTION-004**: Hugo build process remains compatible with static file serving
- **ASSUMPTION-005**: Users are comfortable with ~50-100MB app cache on their devices
- **ASSUMPTION-006**: Future meal planning and shopping list features will use IndexedDB, not remote database
- **ASSUMPTION-007**: Recipe content structure (Markdown with front matter) will remain stable
- **ASSUMPTION-008**: No server-side API will be added (remains static site)

## 8. Related Specifications / Further Reading

**Internal Documentation**

- [CookBook Copilot Instructions](/.github/copilot-instructions.md) - Architecture and conventions
- [Hugo Documentation](https://gohugo.io/documentation/) - Static site generator reference
- [Roadmap: Meal Planning Feature](/plan/feature-meal-planning-1.md) - *To be created in Phase 2*
- [Data Schema Documentation](/plan/data-schema.md) - *To be created in Phase 1, Task 024*

**External Resources**

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) - Comprehensive PWA guide
- [Google Workbox](https://developer.chrome.com/docs/workbox/) - Service worker toolkit (for reference, not used)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) - Core API documentation
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) - Manifest specification
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - For future data layer
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - Icon generation tool
- [Lighthouse PWA Checklist](https://web.dev/pwa-checklist/) - Validation criteria
- [Can I Use: Service Workers](https://caniuse.com/serviceworkers) - Browser compatibility

**Standards & Best Practices**

- [W3C Service Workers Specification](https://www.w3.org/TR/service-workers/)
- [Web App Manifest Specification](https://www.w3.org/TR/appmanifest/)
- [Google PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Cache API Best Practices](https://web.dev/cache-api-quick-guide/)

---

**Implementation Notes**

This plan is designed for incremental implementation. Phases 1-3 provide core PWA functionality. Phase 4 is critical for forward compatibility with meal planning and shopping list features. Phases 5-8 enhance user experience and ensure production readiness.

**Version History**
- v1.0 (2025-11-13): Initial plan created with 8 phases, 54 tasks, forward compatibility for meal planning and shopping lists
