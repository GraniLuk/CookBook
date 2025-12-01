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
