# How to Create Images for Recipes

This guide explains how to prepare images for recipes in the CookBook project.

## Requirements

- Images must be square (720x720 pixels)
- Format: AVIF (converted from JPG)
- Location: `static/images/recipe-headers/`

## Step-by-Step Process

### 1. Manual Image Preparation

1. Take or select your recipe photo
2. Open it in the Photos app on Windows
3. Crop the image to a square aspect ratio (1:1)
4. Resize to exactly 720x720 pixels
5. Choose the best part of the photo to highlight the recipe
6. Save as JPG format in the `static/images/recipe-headers/` folder

### 2. Automatic Conversion to AVIF

After preparing your JPG images, use the conversion script to:

1. Convert all JPG files to AVIF format using Sharp
2. Delete the original JPG files

Run the conversion script in Powershell located in the `scripts/` folder:

```powershell
.\scripts\convert_images.ps1
```

## Prerequisites

- Install Sharp CLI globally: `npm install -g sharp-cli`
