# Convert JPG images to AVIF format and delete originals

Write-Host "Converting JPG images to AVIF..."
sharp -i D:/repos/CookBook/static/images/recipe-headers/*.jpg --output D:/repos/CookBook/static/images/recipe-headers --format=avif

Write-Host "Deleting original JPG files..."
Remove-Item D:/repos/CookBook/static/images/recipe-headers/*.jpg

Write-Host "Conversion complete!"