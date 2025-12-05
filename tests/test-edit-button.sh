#!/bin/bash
# Integration test script for edit button URL generation

echo "🧪 Testing Edit Button URL Generation..."

# Navigate to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT"

# Resolve Hugo binary (Git Bash in CI sometimes misses PATH)
if command -v hugo >/dev/null 2>&1; then
    HUGO_BIN="$(command -v hugo)"
elif [ -x "/c/Program Files/Hugo/bin/hugo.exe" ]; then
    HUGO_BIN="/c/Program Files/Hugo/bin/hugo.exe"
elif [ -x "/mnt/c/Program Files/Hugo/bin/hugo.exe" ]; then
    HUGO_BIN="/mnt/c/Program Files/Hugo/bin/hugo.exe"
else
    echo "❌ Hugo binary not found. Please install Hugo or adjust PATH."
    exit 1
fi

# Build the site
echo ""
echo "📦 Building Hugo site..."
"$HUGO_BIN" --quiet

if [ $? -ne 0 ]; then
    echo "❌ Hugo build failed"
    exit 1
fi

echo "✅ Build successful"

# Test results
PASSED=0
FAILED=0

echo ""
echo "🔍 Checking generated HTML files..."

# Debug: Show what directories exist
echo "  📁 Directory structure:"
ls -la public/published/ 2>/dev/null | grep -E "^d" | awk '{print "     " $NF}' || echo "     No published directory found!"
if [ -d "public/published/sniadania" ]; then
    SNIADANIA_COUNT=$(find public/published/sniadania -name "*.html" -type f 2>/dev/null | wc -l)
    echo "  📄 Found $SNIADANIA_COUNT HTML files in sniadania/"
fi
if [ -d "public/published/obiady" ]; then
    OBIADY_COUNT=$(find public/published/obiady -name "*.html" -type f 2>/dev/null | wc -l)
    echo "  📄 Found $OBIADY_COUNT HTML files in obiady/"
fi
echo ""

# Test 1: Check obiady collection URLs
echo "  🔍 Checking obiady collection..."
if grep -r "collections/obiady/entries/" public/published/obiady/ >/dev/null 2>&1; then
    echo "  ✅ Obiady collection URLs are correct"
    ((PASSED++))
else
    echo "  ❌ Obiady collection URLs not found or incorrect"
    echo "     Expected pattern: collections/obiady/entries/"
    echo "     Checking what's actually there:"
    grep -r "admin/#/collections" public/published/obiady/ 2>/dev/null | head -3 | sed 's/^/     /'
    ((FAILED++))
fi

# Test 2: Check sniadania collection URLs
echo "  🔍 Checking sniadania collection..."
if [ ! -d "public/published/sniadania" ]; then
    echo "  ❌ Directory public/published/sniadania does not exist!"
    ((FAILED++))
elif grep -r "collections/sniadania/entries/" public/published/sniadania/ >/dev/null 2>&1; then
    echo "  ✅ Sniadania collection URLs are correct"
    ((PASSED++))
else
    echo "  ❌ Sniadania collection URLs not found or incorrect"
    echo "     Expected pattern: collections/sniadania/entries/"
    echo "     Checking what's actually there:"
    grep -r "admin/#/collections" public/published/sniadania/ 2>/dev/null | head -3 | sed 's/^/     /'
    ((FAILED++))
fi

# Test 3: Check for URL encoding issues (should NOT exist)
echo "  🔍 Checking for URL encoding issues..."
if grep -r "%5\[bB\].*collections.*%5\[dD\]" public/ >/dev/null 2>&1; then
    echo "  ❌ Found URL-encoded brackets in edit button URLs"
    grep -r "%5\[bB\].*collections.*%5\[dD\]" public/ 2>/dev/null | head -3 | sed 's/^/     /'
    ((FAILED++))
else
    echo "  ✅ No URL encoding issues detected"
    ((PASSED++))
fi

# Test 4: Ensure no cache-busting query params on admin links
echo "  🔍 Checking for cache-busting query params..."
if grep -r 'admin/#/collections/[^" ]*\?v=' public/ >/dev/null 2>&1; then
    echo "  ❌ Found cache-busting query params on admin edit links"
    grep -r 'admin/#/collections/[^" ]*\?v=' public/ 2>/dev/null | head -3 | sed 's/^/     /'
    ((FAILED++))
else
    echo "  ✅ No cache-busting query params detected on admin links"
    ((PASSED++))
fi

# Test 5: Ensure specific salad slug remains intact (Now in queued)
TARGET_SALAD="CookBook/admin/#/collections/queued/entries/Sa%C5%82atka%20%C5%9Ar%C3%B3dziemnomorska%20z%20Kurczakiem,%20Soczewic%C4%85%20i%20Granatem"
echo "  🔍 Verifying flagship salad edit link (in queued)..."
if grep -r "$TARGET_SALAD" public/ >/dev/null 2>&1; then
    echo "  ✅ Flagship salad edit link is correct"
    ((PASSED++))
else
    echo "  ❌ Flagship salad edit link not found"
    echo "     Expected: $TARGET_SALAD"
    echo "     Sample admin links:"
    grep -r "collections/queued/entries" public/ 2>/dev/null | head -3 | sed 's/^/     /'
    ((FAILED++))
fi

# Test 6: Check queued collection URLs
echo "  🔍 Checking queued collection..."
if [ ! -d "public/queued" ]; then
    echo "  ⚠️ Directory public/queued does not exist (might be empty)"
    # Not necessarily a failure if no queued items, but we know there is one.
    if [ -d "content/queued" ] && [ "$(ls -A content/queued/*.md 2>/dev/null)" ]; then
         echo "  ❌ Content exists in content/queued but public/queued is missing!"
         ((FAILED++))
    fi
elif grep -r "collections/queued/entries/" public/queued/ >/dev/null 2>&1; then
    echo "  ✅ Queued collection URLs are correct"
    ((PASSED++))
else
    echo "  ❌ Queued collection URLs not found or incorrect"
    echo "     Expected pattern: collections/queued/entries/"
    echo "     Checking what's actually there:"
    grep -r "admin/#/collections" public/queued/ 2>/dev/null | head -3 | sed 's/^/     /'
    ((FAILED++))
fi

# Summary
echo ""
echo "=================================================="
echo "Test Results:"
echo "  Passed: $PASSED"
if [ $FAILED -gt 0 ]; then
    echo "  Failed: $FAILED"
else
    echo "  Failed: $FAILED"
fi
echo "=================================================="

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "❌ Some tests failed!"
    exit 1
else
    echo ""
    echo "✅ All tests passed!"
    exit 0
fi
