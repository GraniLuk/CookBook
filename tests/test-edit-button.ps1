# Simple Integration Test Script for Edit Button
# This script builds the Hugo site and checks if edit URLs are generated correctly

Write-Host "🧪 Testing Edit Button URL Generation..." -ForegroundColor Cyan

# Navigate to repo root
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

try {
    # Build the site
    Write-Host "`n📦 Building Hugo site..." -ForegroundColor Yellow
    hugo --quiet
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Hugo build failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Build successful" -ForegroundColor Green
    
    # Test patterns
    $testFiles = @(
        @{
            Path            = "public\published\obiady\kuskus_w_marokanskim_klimacie\index.html"
            ExpectedPattern = "/CookBook/admin/#/collections/obiady/entries/"
            Name            = "Obiady recipe"
        },
        @{
            Path            = "public\published\sniadania\*.html"
            ExpectedPattern = "/CookBook/admin/#/collections/sniadania/entries/"
            Name            = "Sniadania recipes"
        }
    )
    
    $passed = 0
    $failed = 0
    
    Write-Host "`n🔍 Checking generated HTML files..." -ForegroundColor Yellow
    
    foreach ($test in $testFiles) {
        $files = Get-ChildItem -Path $test.Path -ErrorAction SilentlyContinue
        
        if ($files) {
            foreach ($file in $files) {
                $content = Get-Content $file.FullName -Raw
                
                if ($content -match [regex]::Escape($test.ExpectedPattern)) {
                    Write-Host "  ✅ $($test.Name): $($file.Name)" -ForegroundColor Green
                    $passed++
                    
                    # Check for URL encoding issues
                    if ($content -match "%5[bB]|%5[dD]") {
                        Write-Host "  ⚠️  Warning: Found URL-encoded brackets in $($file.Name)" -ForegroundColor Yellow
                    }
                }
                else {
                    Write-Host "  ❌ $($test.Name): $($file.Name) - Pattern not found" -ForegroundColor Red
                    $failed++
                }
            }
        }
        else {
            Write-Host "  ⚠️  No files found matching: $($test.Path)" -ForegroundColor Yellow
        }
    }
    
    # Summary
    Write-Host "`n" + "="*50 -ForegroundColor Cyan
    Write-Host "Test Results:" -ForegroundColor Cyan
    Write-Host "  Passed: $passed" -ForegroundColor Green
    Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
    Write-Host "="*50 -ForegroundColor Cyan
    
    if ($failed -gt 0) {
        Write-Host "`n❌ Some tests failed!" -ForegroundColor Red
        exit 1
    }
    else {
        Write-Host "`n✅ All tests passed!" -ForegroundColor Green
        exit 0
    }
    
}
finally {
    Pop-Location
}
