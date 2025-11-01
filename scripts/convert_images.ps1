# Convert JPG images to AVIF format and delete originals

Write-Host "Converting JPG images to AVIF..."
sharp -i C:/Users/grani/repos/CookBook/static/images/recipe-headers/*.jpg --output C:/Users/grani/repos/CookBook/static/images/recipe-headers --format=avif

Write-Host "Deleting original JPG files..."
Remove-Item C:/Users/grani/repos/CookBook/static/images/recipe-headers/*.jpg

Write-Host "Conversion complete!"