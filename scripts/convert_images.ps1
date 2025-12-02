# Convert JPG images to AVIF format and delete originals

Write-Host "Converting JPG images to AVIF..."
$output = & npx avif --input "CookBook/static/images/recipe-headers/**/*.{jpg,jpeg}" --overwrite --verbose 2>&1
Write-Host "avif output:"
Write-Host $output

Write-Host "Deleting original JPG files..."
Remove-Item CookBook/static/images/recipe-headers/*.jpg

Write-Host "Conversion complete!"