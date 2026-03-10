# Convert JPG images to AVIF format and delete originals

Write-Host "Converting and resizing JPG images to AVIF (720x720)..."

# Determine the correct path depending on where the script is run from
$basePath = if (Test-Path "static/images/recipe-headers") { "static" } elseif (Test-Path "CookBook/static/images/recipe-headers") { "CookBook/static" } else { $null }

if (-not $basePath) {
    Write-Host "Error: Could not find static/images/recipe-headers directory."
    exit 1
}

$targetDir = "$basePath/images/recipe-headers"
$files = Get-ChildItem -Path $targetDir -Include *.jpg,*.jpeg -Recurse -File

if ($files) {
    foreach ($file in $files) {
        $inFile = $file.FullName
        $outFile = Join-Path -Path $file.DirectoryName -ChildPath ($file.BaseName + ".avif")
        Write-Host "Processing $($file.Name) -> $($file.BaseName).avif"
        
        # Use sharp-cli to format as avif and resize to 720x720
        & npx --yes sharp-cli@latest -i "$inFile" -o "$outFile" -f avif resize 720 720 | Out-Null
    }

    Write-Host "Deleting original JPG files..."
    foreach ($file in $files) {
        Remove-Item -Path $file.FullName -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "No JPG images found in $targetDir."
}

Write-Host "Conversion complete!"