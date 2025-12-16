param (
    [Switch]$CheckOnly
)

# Sync Recipe Categories
# This script moves recipe files to the correct category folder based on their front matter
# Run this after editing recipes in CMS to fix misplaced files

# Ensure we are working from the repo root context
$repoRoot = Split-Path $PSScriptRoot -Parent
$publishedPath = Join-Path $repoRoot "content/published"
$queuedPath = Join-Path $repoRoot "content/queued"
$draftsPath = Join-Path $repoRoot "content/_drafts"
$categories = @("sniadania", "obiady", "salatki", "desery", "sosy", "napoje")

if ($CheckOnly) {
    Write-Host "Checking for misplaced recipes..." -ForegroundColor Cyan
}
else {
    Write-Host "Scanning for misplaced recipes..." -ForegroundColor Cyan
}

$movedCount = 0
$checkedCount = 0

function Process-Recipe {
    param (
        [System.IO.FileInfo]$file,
        [string]$currentCategory # Optional, if known
    )

    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Extract front matter
    if ($content -match '(?s)^---\s*\n(.*?)\n---') {
        $frontMatter = $Matches[1]
        
        # 0. Check for readyToTest: true
        if ($frontMatter -match '(?m)^readyToTest:\s*true\s*$') {
            $targetFolder = $queuedPath
            if (-not (Test-Path $targetFolder)) {
                if (-not $CheckOnly) {
                    New-Item -ItemType Directory -Path $targetFolder | Out-Null
                }
            }
            
            $targetPath = Join-Path $targetFolder $file.Name
            
            # If not already in queued
            if ($file.FullName -ne $targetPath) {
                $from = if ($currentCategory) { $currentCategory } else { "Source" }
                if ($file.FullName -like "*_drafts*") { $from = "Drafts" }
                
                if ($CheckOnly) {
                    Write-Host "  🚀 Ready to Test: $($file.Name)" -ForegroundColor Cyan
                    Write-Host "      Current: $from → Should be: Queued" -ForegroundColor Gray
                    return 1
                }
                else {
                    Write-Host "  🚀 Moving to Queued: $($file.Name)" -ForegroundColor Cyan
                    Move-Item -Path $file.FullName -Destination $targetPath -Force
                    return 1
                }
            }
            return 0 # Already in queued
        }

        # If in drafts and not ready to test, stop here (don't auto-publish drafts)
        if ($file.FullName -like "*_drafts*") {
            return 0
        }

        # Extract categories field (handle different formats)
        $recipeCategory = $null
        
        # Format 1: categories: desery
        if ($frontMatter -match '(?m)^categories:\s*(\w+)\s*$') {
            $recipeCategory = $Matches[1]
        }
        # Format 2: categories: [desery]
        elseif ($frontMatter -match '(?m)^categories:\s*\[\s*"?([^"\]]+)"?\s*\]') {
            $recipeCategory = $Matches[1]
        }
        # Format 3: categories:\n- desery
        elseif ($frontMatter -match '(?m)^categories:\s*\r?\n\s*-\s*(\w+)') {
            $recipeCategory = $Matches[1]
        }
        
        # Normalize category name
        if ($recipeCategory) {
            $recipeCategory = $recipeCategory -replace 'śniadania', 'sniadania' `
                -replace 'sałatki', 'salatki'
            
            # Check if file is in wrong folder
            # If currentCategory is provided, check against it.
            # If not (root file), always move if category is valid.
            
            $shouldMove = $false
            if ($currentCategory) {
                if ($recipeCategory -ne $currentCategory) { $shouldMove = $true }
            }
            else {
                # Root file, move if it has a category
                $shouldMove = $true
            }

            if ($shouldMove) {
                # Validate category is one of the known ones
                if ($categories -contains $recipeCategory) {
                    $targetFolder = Join-Path $publishedPath $recipeCategory
                    
                    if (-not (Test-Path $targetFolder)) {
                        if (-not $CheckOnly) {
                            New-Item -ItemType Directory -Path $targetFolder | Out-Null
                        }
                    }

                    $targetPath = Join-Path $targetFolder $file.Name
                    
                    # Check if target already exists (and it's not the same file)
                    if ((Test-Path $targetPath) -and ($file.FullName -ne (Get-Item $targetPath).FullName)) {
                        Write-Host "  ⚠️  Cannot move $($file.Name): target already exists in $recipeCategory" -ForegroundColor Yellow
                    }
                    elseif ($file.FullName -ne $targetPath) {
                        $from = if ($currentCategory) { $currentCategory } else { "Root" }
                        
                        if ($CheckOnly) {
                            Write-Host "  ❌ Misplaced: $($file.Name)" -ForegroundColor Red
                            Write-Host "      Current: $from → Should be: $recipeCategory" -ForegroundColor Gray
                            return 1 # Count as misplaced
                        }
                        else {
                            Write-Host "  📦 Moving: $($file.Name)" -ForegroundColor Green
                            Write-Host "      From: $from → To: $recipeCategory" -ForegroundColor Gray
                            
                            Move-Item -Path $file.FullName -Destination $targetPath -Force
                            return 1 # Moved
                        }
                    }
                }
                else {
                    Write-Host "  ⚠️  Unknown category '$recipeCategory' in $($file.Name)" -ForegroundColor Yellow
                    if ($CheckOnly) {
                        return 1
                    }
                }
            }
        }
    }
    return 0 # Not moved
}

# 1. Scan existing category folders
foreach ($category in $categories) {
    $categoryPath = Join-Path $publishedPath $category
    if (-not (Test-Path $categoryPath)) { continue }
    
    $recipes = Get-ChildItem -Path $categoryPath -Filter "*.md" -File
    
    foreach ($recipe in $recipes) {
        $checkedCount++
        $movedCount += Process-Recipe -file $recipe -currentCategory $category
    }
}

# 2. Scan root content folders for loose recipes
$rootPaths = @(
    (Join-Path $repoRoot "content"),
    (Join-Path $repoRoot "content/published"),
    $queuedPath
)

foreach ($rootPath in $rootPaths) {
    if (-not (Test-Path $rootPath)) { continue }
    
    # Get files only, exclude _index.md
    $files = Get-ChildItem -Path $rootPath -Filter "*.md" -File | Where-Object { $_.Name -ne "_index.md" }
    
    foreach ($file in $files) {
        $checkedCount++
        $movedCount += Process-Recipe -file $file
    }
}

# 3. Scan drafts folder
if (Test-Path $draftsPath) {
    $draftRecipes = Get-ChildItem -Path $draftsPath -Filter "*.md" -Recurse -File
    foreach ($recipe in $draftRecipes) {
        $checkedCount++
        $movedCount += Process-Recipe -file $recipe
    }
}

if ($CheckOnly) {
    if ($movedCount -gt 0) {
        Write-Host "`n❌ Found $movedCount misplaced recipes." -ForegroundColor Red
        exit 1
    }
    else {
        Write-Host "`n✅ All recipes are in correct categories." -ForegroundColor Green
        exit 0
    }
}
else {
    Write-Host "`n✅ Done!" -ForegroundColor Green
    Write-Host "   Checked: $checkedCount recipes" -ForegroundColor Gray
    Write-Host "   Moved: $movedCount recipes" -ForegroundColor Gray

    if ($movedCount -gt 0) {
        Write-Host "`n💡 Don't forget to commit these changes:" -ForegroundColor Cyan
        Write-Host "   git add content/" -ForegroundColor Gray
        Write-Host "   git commit -m 'fix: move recipes to correct category folders'" -ForegroundColor Gray
    }
}
