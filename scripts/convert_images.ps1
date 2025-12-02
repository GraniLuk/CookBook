# Convert JPG images to AVIF format and delete originals

Write-Host "Converting JPG images to AVIF..."
npx avif "**/*.{jpg,jpeg}" --overwrite --append-ext

Write-Host "Deleting original JPG files..."
Remove-Item D:/repos/CookBook/static/images/recipe-headers/*.jpg

Write-Host "Conversion complete!"