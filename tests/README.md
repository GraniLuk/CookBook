# Testing Guide for CookBook Hugo Site

This directory contains integration tests for the CookBook Hugo site, focusing on template rendering and URL generation.

## Structure

```
tests/
├── test-edit-button.sh   # Shell script for CI/Linux
├── test-edit-button.ps1  # PowerShell script for Windows
└── README.md             # This file
```

## Test Coverage

### Edit Button URL Generation Tests

Tests validate the edit button functionality in `layouts/_default/single.html`:

1. **Category URL Extraction**: Verifies that categories array correctly generates collection URLs
2. **All Collection Types**: Tests all 5 collections (sniadania, obiady, salatki, desery, sosy)
3. **URL Encoding**: Confirms URLs don't contain encoded brackets (`%5b`, `%5d`)

## Prerequisites

### Hugo

```bash
# Check if installed
hugo version

# Install on Ubuntu/Debian
sudo snap install hugo

# Install on macOS
brew install hugo

# Windows
winget install Hugo.Hugo.Extended
```

## Running Tests

### Quick Test (Recommended)

**Linux/macOS/CI:**
```bash
bash tests/test-edit-button.sh
```

**Windows:**
```powershell
.\tests\test-edit-button.ps1
```

### Manual Testing

You can also manually verify by building and checking the output:

```bash
# Build the site
hugo

# Check a specific recipe
grep -r "collections/obiady/entries/" public/published/obiady/
```

## Adding New Tests

### 1. Edit the Test Script

Add new test cases to `test-edit-button.sh` or `test-edit-button.ps1`:

**Bash example:**
```bash
# Test 4: Check salatki collection URLs
if grep -r "collections/salatki/entries/" public/published/salatki/ >/dev/null 2>&1; then
    echo "  ✅ Salatki collection URLs are correct"
    ((PASSED++))
else
    echo "  ❌ Salatki collection URLs not found"
    ((FAILED++))
fi
```

**PowerShell example:**
```powershell
$testFiles = @(
    @{
        Path = "public\published\salatki\*.html"
        ExpectedPattern = "/CookBook/admin/#/collections/salatki/entries/"
        Name = "Salatki recipes"
    }
)
```

### 2. Test Locally

```bash
bash tests/test-edit-button.sh
```

### 3. Commit and Push

The CI pipeline will automatically run tests on every push.

## Continuous Integration

Tests run automatically on GitHub Actions before deployment:

```yaml
test → build → deploy
```

- ✅ Tests pass → Build and deploy
- ❌ Tests fail → Stop pipeline, no deployment

See `.github/workflows/hugo.yml` for the full configuration.

## Troubleshooting

### "Hugo not found"

Ensure Hugo is installed:
```bash
hugo version
```

### "No such file or directory"

Make sure you're running from the repository root or using the correct path:
```bash
# From repo root
bash tests/test-edit-button.sh

# From anywhere
bash /path/to/CookBook/tests/test-edit-button.sh
```

### Tests fail locally but pass in CI (or vice versa)

Check Hugo version consistency:
```bash
hugo version  # Should match version in .github/workflows/hugo.yml
```

---

## Fuse.js Search Testing

Automated test suite for validating search functionality during the Fuse.js v3.2.0 → v7.1.0 migration.

### Prerequisites

1. **Build the Hugo site** to generate `index.json`:
   ```powershell
   hugo
   ```

2. **Install Node.js dependencies**:
   ```powershell
   npm install
   ```

### Running Tests

#### Baseline Tests (Fuse.js v3.2.0)
Test current search behavior before migration:
```powershell
npm run test:search:v3
```

This validates:
- ✅ Basic search functionality
- ❌ Polish diacritics limitations (losos won't find łosoś)
- ❌ Typo tolerance (gronola won't find granola)
- ⚠️  Multi-word search behavior with tokenization

#### Post-Migration Tests (Fuse.js v7.1.0)
After completing the migration, test improved functionality:
```powershell
npm run test:search:v7
```

**Note:** You must update `package.json` to use `"fuse.js": "7.1.0"` and run `npm install` first.

This validates:
- ✅ Polish diacritics support (losos WILL find łosoś)
- ✅ Fuzzy matching for typos (gronola WILL find granola)
- ✅ Full content search (tahini found anywhere in recipe)
- ✅ No regressions in existing functionality

### Test Scenarios

| Test ID | Category | Query | v3.2.0 Expected | v7.1.0 Expected |
|---------|----------|-------|-----------------|-----------------|
| T1 | Basic | "pasta" | ✅ Finds pasta | ✅ Finds pasta |
| T2 | Multi-word | "pasta twarogowa" | ⚠️ Broad (tokenized) | ✅ Phrase match |
| T3 | Diacritics | "losos" | ❌ No results | ✅ Finds łosoś |
| T4 | Diacritics | "cwikla" | ❌ No results | ✅ Finds ćwikła |
| T5 | Typo | "gronola" | ❌ No fuzzy match | ✅ Finds granola |
| T6 | Typo | "kurczk" | ❌ No fuzzy match | ✅ Finds kurczak |
| T7 | Tags | "sniadanie" | ✅ Tag search | ✅ Tag search |
| T8 | Categories | "desery" | ✅ Category search | ✅ Category search |
| T9 | Long content | "tahini" | ⚠️ May miss if late | ✅ Finds anywhere |
| T10 | No results | "xyz123" | ✅ No results | ✅ No results |

### Test Output

Each test run generates:
- **Console output**: Pass/fail status for each scenario
- **JSON report**: Detailed results saved to:
  - `tests/fusejs-test-report-v3.json` (baseline)
  - `tests/fusejs-test-report-v7.json` (post-migration)

### Understanding Results

#### Expected v3.2.0 Behavior
- 4-6 tests will **fail** (T3, T4, T5, T6 - this is expected)
- T2 may show too many results (tokenization splits "pasta twarogowa" into separate words)

#### Expected v7.1.0 Behavior
- All 10 tests should **pass**
- Improved search quality with Polish diacritics support
- Better fuzzy matching for typos

### Troubleshooting Search Tests

**Error: "index.json not found"**
```powershell
# Build Hugo site first
hugo
```

**Error: "Cannot find module 'fuse.js'"**
```powershell
# Install dependencies
npm install
```

**Wrong Fuse.js version**
```powershell
# Check installed version
npm list fuse.js

# Install specific version
npm install fuse.js@3.2.0  # for baseline
npm install fuse.js@7.1.0  # for v7 tests
```

---

## Future Enhancements

- [ ] Add tests for other collections (desery, sosy)
- [ ] Test FODMAP badge rendering
- [ ] Test visual editing functionality
- [ ] Add performance benchmarks
- [ ] Test responsive design
- [ ] Screenshot comparison tests

## Contributing

When adding new template features:

1. Write tests first (TDD approach)
2. Ensure all tests pass before committing
3. Update this README if adding new test categories
