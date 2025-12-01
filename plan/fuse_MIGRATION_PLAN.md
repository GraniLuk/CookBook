# Fuse.js Migration Plan: v3.2.0 → v7.1.0

**Date**: December 1, 2025  
**Application**: Hugo CookBook Recipe Site  
**Current Version**: 3.2.0 (from 2017)  
**Target Version**: 7.1.0 (February 2025)  
**Migration Complexity**: Medium (Breaking changes + Configuration updates)

---

## Executive Summary

This migration upgrades Fuse.js fuzzy-search library across **4 major versions** (v3→v4→v5→v6→v7), introducing breaking changes that require code modifications but offering significant improvements for Polish recipe searching.

**Key Benefits:**
- 🇵🇱 Native Polish diacritics support (ą, ć, ę, ł, ń, ó, ś, ź, ż)
- 🔍 Improved fuzzy matching for typos
- 📊 Better search quality with field normalization
- 🚀 Performance improvements via proper ESM exports
- 📦 ~30% bundle size reduction

**Risk Level**: LOW (backward compatible API, only configuration changes needed)

---

## Phase 1: Pre-Migration Preparation

### 1.2 Document Current Behavior

**AUTOMATED APPROACH:** Run test suite against v3.2.0 baseline.

```bash
# Install test dependencies
npm install

# Build Hugo site to generate index.json
hugo

# Run baseline tests with Fuse.js v3.2.0
npm run test:search:v3
```

This will test these search scenarios automatically:

| Test ID | Query | Expected v3 Behavior | Expected v7 Behavior |
|---------|-------|---------------------|---------------------|
| T1 | "pasta" | ✅ Finds pasta recipes | ✅ Finds pasta recipes |
| T2 | "pasta twarogowa" | ⚠️ Broad matches (tokenized) | ✅ Phrase match |
| T3 | "losos" (no ł) | ❌ No results | ✅ Finds łosoś |
| T4 | "cwikla" | ❌ No results | ✅ Finds ćwikła |
| T5 | "gronola" (typo) | ❌ No fuzzy match | ✅ Finds granola |
| T6 | "kurczk" (typo) | ❌ No fuzzy match | ✅ Finds kurczak |
| T7 | "sniadanie" | ✅ Tag search | ✅ Tag search |
| T8 | "desery" | ✅ Category search | ✅ Category search |
| T9 | "tahini" | ⚠️ May miss if late in content | ✅ Finds anywhere |
| T10 | "xyz123" | ✅ No results | ✅ No results |

**Output:** Test report saved to `tests/fusejs-test-report-v3.json`

### 1.3 Review Dependencies
```bash
# Check if any other scripts depend on Fuse.js global
grep -r "Fuse" static/js/*.js
```

---

## Phase 2: Breaking Changes Resolution

### 2.1 Removed Options (v4.0.0)

#### ❌ `tokenize: true` - REMOVED
**What it did**: Split search queries into individual words, matching each separately  
**Current usage**: Line 7 in `static/js/custom.js`  
**Migration path**: Remove option - fuzzy search now handles full phrases better  
**Impact**: Multi-word searches will behave differently (less broad, more precise)

**Example behavior change:**
```javascript
// v3.2.0 with tokenize:true
search("pasta twarogowa")
// Matched: ANY recipe with "pasta" OR "twarogowa"

// v7.1.0 without tokenize
search("pasta twarogowa") 
// Matched: Recipes with "pasta twarogowa" as phrase (with fuzziness)
```

**Workaround if needed**: Use Extended Search syntax or split queries manually

#### ❌ `maxPatternLength: 32` - REMOVED
**What it did**: Limited search query length to 32 characters  
**Current usage**: Line 8 in `static/js/custom.js`  
**Migration path**: Remove option - now handles patterns of any length  
**Impact**: None (your queries are typically <20 characters)

### 2.2 Changed Options

#### ⚠️ `threshold: 0.0` - RECONSIDER
**Current behavior**: Requires perfect match (no fuzziness)  
**Recommendation**: Change to `0.3` or `0.4` to allow typos  
**Benefit**: Users typing "gronola" will find "granola"

---

## Phase 3: New Features Implementation

### 3.1 Priority 1: Polish Diacritics Support (v7.1.0)

**Add this option:**
```javascript
ignoreDiacritics: true
```

**Impact**: GAME CHANGER for Polish recipes
- Search "losos" finds "łosoś"
- Search "cwikla" finds "ćwikła" 
- Search "zurek" finds "żurek"
- Search "pomarancza" finds "pomarańcza"

**Test scenarios:**
| Query (without diacritics) | Should find (with diacritics) |
|----------------------------|-------------------------------|
| losos | Pieczony łosoś z majonezowo... |
| cwikla | Any ćwikła recipes |
| zurek | żurek recipes |
| srodek | środek (middle) |

### 3.2 Priority 2: Location Independence (v6.2.0)

**Add this option:**
```javascript
ignoreLocation: true
```

**What it does**: Searches entire text content, not just first 60 characters  
**Current issue**: With `location: 0, distance: 100`, only searches ~first 160 chars  
**Benefit**: Matches ingredients/steps mentioned later in recipe

**Alternative**: Keep `ignoreLocation: false` but increase `distance: 500`

### 3.3 Priority 3: Field-Length Normalization (v6.5.0)

**Add this option:**
```javascript
ignoreFieldNorm: true
// OR
fieldNormWeight: 0.5
```

**What it does**: Prevents longer recipes from ranking lower  
**Current issue**: Short recipes with matches rank higher than long recipes with same matches  
**Benefit**: Fairer scoring across different recipe lengths

### 3.4 Optional: Extended Search Support (v4.0.0)

**Enable advanced syntax:**
```javascript
useExtendedSearch: true
```

**Allows queries like:**
- `=pasta` - Exact match for "pasta"
- `^kurczak` - Starts with "kurczak"
- `!wegetariańskie` - Exclude vegetarian
- `'twarogowa` - Must include "twarogowa"

**UI Enhancement**: Add "Advanced Search" toggle/help text

---

## Phase 4: Implementation Steps

### 4.1 Update CDN URL
**File**: `layouts/partials/script.html`

```diff
- <script src='https://cdnjs.cloudflare.com/ajax/libs/fuse.js/3.2.0/fuse.min.js'></script>
+ <script src='https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.min.js'></script>
```

### 4.2 Update Fuse Options
**File**: `static/js/custom.js`

```diff
 var fuseOptions = {
   shouldSort: true,
   includeMatches: true,
-  threshold: 0.0,
-  tokenize: true,
+  threshold: 0.3,
   location: 0,
   distance: 100,
-  maxPatternLength: 32,
   minMatchCharLength: 1,
+  ignoreLocation: true,
+  ignoreDiacritics: true,
   keys: [
     {name:"title",weight:0.8},
     {name:"contents",weight:0.5},
     {name:"tags",weight:0.3},
     {name:"categories",weight:0.3}
   ]
 };
```

### 4.3 No Changes Needed
These files remain unchanged:
- ✅ `layouts/index.json` - JSON structure compatible
- ✅ `static/js/custom.js` (executeSearch function) - API calls unchanged
- ✅ `static/js/custom.js` (populateResults function) - Result structure compatible

---

## Phase 5: Testing Strategy

### 5.1 Functional Testing

**Test Matrix:**

| Test ID | Category | Query | Expected v7 Behavior |
|---------|----------|-------|---------------------|
| T1 | Basic | "pasta" | All pasta recipes |
| T2 | Multi-word | "pasta twarogowa" | Cottage cheese pasta specifically |
| T3 | Diacritics | "losos" | Finds "łosoś" recipes |
| T4 | Diacritics | "cwikla" | Finds "ćwikła" |
| T5 | Typo (fuzzy) | "gronola" | Finds "granola" |
| T6 | Typo (fuzzy) | "kurczk" | Finds "kurczak" |
| T7 | Tags | "sniadanie" | Breakfast recipes |
| T8 | Categories | "desery" | Dessert categories |
| T9 | Long content | "tahini" | Finds pasta_twarogowa_z_tahini... |
| T10 | No results | "xyz123" | Graceful "No results" message |

### 5.2 Regression Testing

**Critical user flows:**
1. ✅ Search from homepage
2. ✅ Search displays results grid
3. ✅ Result cards show image, title, macros, tags
4. ✅ Click result navigates to recipe
5. ✅ Empty search shows alert
6. ✅ No results shows alert
7. ✅ Tag click from results navigates correctly

### 5.3 Performance Testing

**Metrics to monitor:**
- Initial load time (index.json fetch)
- Search execution time (<100ms target)
- Browser console errors (none expected)
- Memory usage (should improve with v7)

### 5.4 Cross-Browser Testing

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ☐ |
| Firefox | Latest | ☐ |
| Edge | Latest | ☐ |
| Safari | Latest | ☐ |
| Mobile Safari | iOS 15+ | ☐ |
| Mobile Chrome | Android | ☐ |

---

## Phase 6: Rollback Plan

### 6.1 Quick Rollback (< 5 minutes)
```bash
# Revert to backup branch
git checkout backup/pre-fusejs-migration
git push origin main --force

# Or revert specific files
git checkout HEAD~1 layouts/partials/script.html static/js/custom.js
git commit -m "Rollback Fuse.js to v3.2.0"
git push origin main
```

### 6.2 Identify Rollback Triggers

**Immediate rollback if:**
- ❌ Search returns no results for common queries
- ❌ JavaScript console errors prevent search
- ❌ Search UI completely broken
- ❌ >10% increase in search execution time

**Consider rollback if:**
- ⚠️ Search quality subjectively worse for >3 test queries
- ⚠️ Significant user complaints within first 24 hours
- ⚠️ Mobile browser incompatibility

### 6.3 Alternative: Feature Flag
Add temporary feature flag for gradual rollout:

```javascript
// Add to custom.js
const USE_FUSEJS_V7 = true; // Toggle for rollback

const fuseVersion = USE_FUSEJS_V7 ? '7.1.0' : '3.2.0';
const fuseOptions = USE_FUSEJS_V7 
  ? { /* v7 options */ }
  : { /* v3 options */ };
```

---

## Phase 7: Deployment Strategy

### 7.1 Recommended Approach: Staged Rollout

**Step 1: Development (Local)**
- Implement changes locally
- Run full test suite
- Fix any issues

**Step 2: Staging/Preview**
- Deploy to preview branch
- Share with team for UAT
- Monitor for 48 hours

**Step 3: Production (Canary)**
- Deploy during low-traffic hours
- Monitor analytics for search usage
- Keep rollback ready for 1 week

### 7.2 Monitoring Post-Deployment

**First 24 hours - Watch for:**
- JavaScript errors (browser console)
- Search failure rate (vs baseline)
- User feedback/bug reports
- Google Analytics: Search exit rate

**First week - Metrics:**
- Average search queries per session
- Search-to-recipe-view conversion rate
- Common "no results" queries (add to content backlog)

### 7.3 Communication Plan

**Internal:**
- [ ] Brief team on changes (this doc)
- [ ] Assign tester roles (functional/regression)
- [ ] Schedule rollout window

**External:**
- Not needed (backend change, users won't notice technical upgrade)
- Exception: If search quality issues arise, inform via site banner

---

## Phase 8: Post-Migration Enhancements

### 8.1 Quick Wins (Week 1-2)

**A. Add search help tooltip:**
```html
<span class="search-help-icon" title="Tip: Try searching without Polish letters (e.g., 'losos' finds 'łosoś')">
  <i class="fas fa-question-circle"></i>
</span>
```

**B. Track "no results" queries:**
```javascript
if(result.length === 0){
  // Send to analytics
  gtag('event', 'search_no_results', { search_term: searchQuery });
}
```

**C. Add search suggestions:**
Based on common Polish recipe terms without diacritics

### 8.2 Future Enhancements (Month 2+)

**A. Extended Search UI:**
- Toggle for exact match mode
- Filters: category, max calories, prep time
- Autocomplete with recent searches

**B. Search Analytics Dashboard:**
- Most searched terms
- Zero-result queries (content gaps)
- Search-to-conversion funnel

**C. AI-Powered Improvements:**
- Synonym handling (e.g., "chicken" = "kurczak")
- Ingredient substitution search
- Dietary restriction filters

---

## Success Criteria

### Must Have (Go/No-Go)
- ✅ All 10 functional tests pass
- ✅ Zero console errors in Chrome DevTools
- ✅ Search works on mobile (iOS/Android)
- ✅ No regression in critical user flows
- ✅ Rollback tested and working

### Should Have
- ✅ Polish diacritics searches work (T3, T4)
- ✅ Fuzzy matching finds typos (T5, T6)
- ✅ Search feels faster or same speed
- ✅ Result quality subjectively better

### Nice to Have
- ✅ Extended search syntax documented
- ✅ Analytics tracking implemented
- ✅ Search help tooltip added

---

## Timeline

| Phase | Duration | Owner | Deadline |
|-------|----------|-------|----------|
| 1. Preparation | 1 hour | Dev | Day 1 |
| 2-3. Implementation | 2 hours | Dev | Day 1 |
| 4. Local Testing | 3 hours | Dev + QA | Day 2 |
| 5. Staging Deploy | 1 hour | Dev | Day 2 |
| 6. Staging Testing | 48 hours | Team | Day 2-4 |
| 7. Production Deploy | 1 hour | Dev | Day 5 |
| 8. Monitoring | 1 week | Dev | Day 5-12 |

**Total estimated effort**: 8-10 hours  
**Calendar time**: 5-12 days (depending on staging soak time)

---

## Resources

### Documentation
- [Fuse.js v7 Docs](https://www.fusejs.io/)
- [v7.0.0 Release Notes](https://github.com/krisk/Fuse/releases/tag/v7.0.0)
- [v7.1.0 Release Notes](https://github.com/krisk/Fuse/releases/tag/v7.1.0)
- [Migration Discussion #355](https://github.com/krisk/Fuse/issues/355)

### Code Changes
- `layouts/partials/script.html` - CDN URL
- `static/js/custom.js` - fuseOptions object

### Testing Resources
- Browser DevTools Console
- Google Analytics (search tracking)
- Manual test scenarios (above)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Search returns fewer results | Medium | High | Adjust threshold/distance |
| Multi-word searches different | High | Medium | User education, test extensively |
| Performance degradation | Low | High | Benchmark before/after |
| Browser compatibility | Low | High | Cross-browser testing |
| Rollback complexity | Low | Medium | Pre-test rollback procedure |

**Overall Risk Level**: LOW-MEDIUM  
**Confidence Level**: HIGH (well-documented upgrade path, backward-compatible API)

---

## Approval

- [ ] **Developer**: Changes implemented and tested locally
- [ ] **QA**: Test plan executed, all critical tests pass
- [ ] **Product Owner**: Accepts risk/reward tradeoff
- [ ] **Deploy Authorization**: Approved for production

**Signed off**: _____________________ Date: _____________________

---

**End of Migration Plan**

*For questions or issues during migration, refer to this document or contact the development team.*
