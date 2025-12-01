# Sync Recipe Categories
# This script moves recipe files to the correct category folder based on their front matter
# Run this after editing recipes in CMS to fix misplaced files

$publishedPath = "content/published"
$categories = @("sniadania", "obiady", "salatki", "desery", "sosy", "napoje")

Write-Host "Scanning for misplaced recipes..." -ForegroundColor Cyan

$movedCount = 0
$checkedCount = 0

foreach ($category in $categories) {
    $categoryPath = Join-Path $publishedPath $category
    if (-not (Test-Path $categoryPath)) { continue }
    
    $recipes = Get-ChildItem -Path $categoryPath -Filter "*.md" -File
    
    foreach ($recipe in $recipes) {
        $checkedCount++
        $content = Get-Content $recipe.FullName -Raw -Encoding UTF8
        
        # Extract front matter
        if ($content -match '(?s)^---\s*\n(.*?)\n---') {
            $frontMatter = $Matches[1]
            
            # Extract categories field (handle different formats)
            $recipeCategory = $null
            
            # Format 1: categories: desery
            if ($frontMatter -match '(?m)^categories:\s*(\w+)') {
                $recipeCategory = $Matches[1]
            }
            # Format 2: categories: [desery]
            elseif ($frontMatter -match '(?m)^categories:\s*\[?"?([^"\]]+)"?\]?') {
                $recipeCategory = $Matches[1]
            }
            
            # Normalize category name
            $recipeCategory = $recipeCategory -replace 'śniadania', 'sniadania' `
                                               -replace 'sałatki', 'salatki'
            
            # Check if file is in wrong folder
            if ($recipeCategory -and $recipeCategory -ne $category) {
                $targetFolder = Join-Path $publishedPath $recipeCategory
                
                if (Test-Path $targetFolder) {
                    $targetPath = Join-Path $targetFolder $recipe.Name
                    
                    # Check if target already exists
                    if (Test-Path $targetPath) {
                        Write-Host "  ⚠️  Cannot move $($recipe.Name): target already exists in $recipeCategory" -ForegroundColor Yellow
                    }
                    else {
                        Write-Host "  📦 Moving: $($recipe.Name)" -ForegroundColor Green
                        Write-Host "      From: $category → To: $recipeCategory" -ForegroundColor Gray
                        
                        Move-Item -Path $recipe.FullName -Destination $targetPath -Force
                        $movedCount++
                    }
                }
                else {
                    Write-Host "  ⚠️  Unknown category '$recipeCategory' in $($recipe.Name)" -ForegroundColor Yellow
                }
            }
        }
    }
}

Write-Host "`n✅ Done!" -ForegroundColor Green
Write-Host "   Checked: $checkedCount recipes" -ForegroundColor Gray
Write-Host "   Moved: $movedCount recipes" -ForegroundColor Gray

if ($movedCount -gt 0) {
    Write-Host "`n💡 Don't forget to commit these changes:" -ForegroundColor Cyan
    Write-Host "   git add content/published/" -ForegroundColor Gray
    Write-Host "   git commit -m 'fix: move recipes to correct category folders'" -ForegroundColor Gray
}
