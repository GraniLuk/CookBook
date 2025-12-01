#!/bin/bash
# Integration test script for edit button URL generation
set -e  # Exit on any error

echo "🧪 Testing Edit Button URL Generation..."

# Navigate to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT"

# Build the site
echo ""
echo "📦 Building Hugo site..."
hugo --quiet

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

# Test 1: Check obiady collection URLs
if grep -r "collections/obiady/entries/" public/published/obiady/ >/dev/null 2>&1; then
    echo "  ✅ Obiady collection URLs are correct"
    ((PASSED++))
else
    echo "  ❌ Obiady collection URLs not found or incorrect"
    ((FAILED++))
fi

# Test 2: Check sniadania collection URLs
if grep -r "collections/sniadania/entries/" public/published/sniadania/ >/dev/null 2>&1; then
    echo "  ✅ Sniadania collection URLs are correct"
    ((PASSED++))
else
    echo "  ❌ Sniadania collection URLs not found or incorrect"
    ((FAILED++))
fi

# Test 3: Check for URL encoding issues (should NOT exist)
if grep -r "%5\[bB\].*collections.*%5\[dD\]" public/ >/dev/null 2>&1; then
    echo "  ❌ Found URL-encoded brackets in edit button URLs"
    ((FAILED++))
else
    echo "  ✅ No URL encoding issues detected"
    ((PASSED++))
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
