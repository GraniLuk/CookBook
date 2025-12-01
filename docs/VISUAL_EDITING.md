# Visual Editing Feature in Decap CMS

## Overview

Visual editing (click-to-edit) is now enabled in your CookBook CMS! This feature allows you to click directly on content in the preview pane to edit fields, providing a more intuitive editing experience similar to Storyblok or TinaCMS.

## How It Works

The visual editing feature uses [@vercel/stega](https://www.npmjs.com/package/@vercel/stega) to invisibly encode information about field origins directly in the rendered text. This means:

- **No changes needed to preview templates** - The feature works automatically
- **Click on any text in preview** - It will focus the corresponding editor field
- **Auto-scrolling** - The field scrolls into view if needed
- **Visual highlighting** - Fields are highlighted to indicate focus
- **Smart behavior** - Scroll sync is automatically disabled when visual editing is enabled

## Configuration

### Current Setup

Your configuration in `static/admin/config.yml`:

```yaml
collections:
  - name: recipes
    editor:
      preview: true
      visualEditing: true  # ✅ Visual editing enabled
```

### Preview Template

We've created a custom preview template in `static/admin/preview-templates.js` that:
- Shows recipe hero image with title overlay
- Displays metadata (author, tags, servings, prep time, cook time)
- Shows nutritional macros (calories, protein, fat, carbohydrates)
- Renders the full recipe body with markdown formatting
- Matches your Hugo site's styling with Bulma CSS

## Using Visual Editing

1. **Open the CMS** at `/admin/`
2. **Edit or create a recipe**
3. **Look at the preview pane** on the right
4. **Click on any text** in the preview (title, tagline, body content, etc.)
5. **The corresponding field** in the editor will automatically:
   - Get focused
   - Scroll into view if needed
   - Be highlighted

## Features

### What You Can Click

- ✅ **Title** - Hero title text
- ✅ **Author** - Author name
- ✅ **Tagline** - Recipe description
- ✅ **Tags** - Individual tag items
- ✅ **Body content** - Any text in the markdown content
- ✅ **All text fields** - Any string/text widget in your collection

### What Happens

When you click on preview content:
1. Field is **focused** in the editor
2. Field **scrolls into view** (if off-screen)
3. Field gets a **visual highlight**
4. You can **start typing immediately**

### Automatic Behaviors

- **Scroll sync disabled** - When visual editing is active, traditional scroll sync is turned off to prevent interference
- **Smart encoding** - All strings are invisibly encoded without breaking your content
- **Real-time updates** - Changes in the editor immediately reflect in the preview

## Technical Details

### Files Modified

1. **`static/admin/config.yml`**
   - Added `editor.visualEditing: true` to recipes collection
   - Enabled `preview: true` for better UX

2. **`static/admin/index.html`**
   - Included preview templates script
   - Loads after Decap CMS core

3. **`static/admin/preview-templates.js`** (NEW)
   - Custom React preview component for recipes
   - Registers styles from your Hugo theme
   - Matches your site's look and feel

### Version Requirements

- ✅ **Decap CMS 3.9.0** - Currently installed (includes visual editing)
- ✅ **@vercel/stega** - Bundled with Decap CMS (no manual installation needed)

### Browser Compatibility

Visual editing works in all modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- Modern DOM APIs

## Future Enhancements

### Opt-out for Specific Fields

In the future, you may want to exclude certain fields from encoding (like dates or URLs that get processed):

```yaml
fields:
  - label: Publication Date
    name: date
    widget: datetime
    visual_editing: false  # Future feature - not yet available
```

### Custom Widget Support

If you create custom widgets, they will automatically support visual editing if they:
- Use the `forId` prop correctly
- Render text content from field values
- Follow Decap CMS widget patterns

## Troubleshooting

### Visual Editing Not Working?

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. **Check browser console** - Look for JavaScript errors
3. **Verify version** - Ensure you're using Decap CMS 3.9.0+
4. **Check config** - Confirm `editor.visualEditing: true` is set

### Preview Not Showing?

1. **Check preview template script** - Ensure it loads without errors
2. **Verify paths** - Asset URLs should use `/CookBook/` prefix
3. **Check image paths** - Recipe images should be relative to `static/`

### Can't Click on Content?

1. **Check if scroll sync is disabled** - Visual editing auto-disables it
2. **Try clicking directly on text** - Not on images or borders
3. **Refresh the editor** - Close and reopen the entry

## Resources

- [Original PR #7374](https://github.com/decaporg/decap-cms/pull/7374) - Visual editing implementation
- [Decap CMS Documentation](https://decapcms.org/docs/)
- [@vercel/stega Package](https://www.npmjs.com/package/@vercel/stega) - Encoding library

## Questions?

If you encounter issues or have questions about visual editing:
1. Check the [Decap CMS GitHub Issues](https://github.com/decaporg/decap-cms/issues)
2. Review the [discussions forum](https://github.com/decaporg/decap-cms/discussions)
3. Consult this documentation

---

**Note**: Visual editing is a relatively new feature (added in early 2024). If you encounter bugs, consider reporting them to the Decap CMS project.
