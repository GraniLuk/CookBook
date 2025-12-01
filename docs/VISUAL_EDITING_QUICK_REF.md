# Visual Editing Quick Reference

## 🎯 What is Visual Editing?

Click directly on content in the CMS preview to jump to the editor field - no more scrolling to find the right field!

## 🚀 Getting Started

1. Open `/admin/` in your browser
2. Edit or create a recipe
3. Click on any text in the preview pane (right side)
4. The editor field (left side) will auto-focus and scroll into view

## ✨ What You Can Click

| Preview Element | What Happens |
|----------------|--------------|
| Recipe title (hero) | Jumps to "Tytuł" field |
| Author name | Jumps to "Autor" field |
| Tagline/description | Jumps to "Opis skrócony" field |
| Individual tags | Jumps to "Tagi" field |
| Body text/paragraphs | Jumps to "Treść" markdown editor |
| Any visible text | Jumps to corresponding field |

## 💡 Tips & Tricks

- **Just click and type** - The field is immediately active after clicking
- **Scroll sync is off** - Visual editing replaces traditional scroll sync
- **Works with all widgets** - String, markdown, text, and more
- **Real-time preview** - Changes appear instantly
- **No configuration needed** - Works automatically with your content

## 🔍 Visual Feedback

When you click content in preview:
1. ✓ Field **highlights** in the editor
2. ✓ Field **scrolls** into view automatically  
3. ✓ Cursor is **positioned** ready to edit
4. ✓ You can **start typing** immediately

## ⚡ Keyboard Shortcuts (after clicking)

| Shortcut | Action |
|----------|--------|
| Start typing | Edit the focused field |
| Tab | Move to next field |
| Shift+Tab | Move to previous field |
| Ctrl+S / Cmd+S | Save changes |

## 🎨 Preview Features

The preview shows:
- ✅ Hero image with gradient overlay
- ✅ Recipe title (clickable)
- ✅ Author, tags, and metadata
- ✅ Prep time, servings, cook time
- ✅ Nutritional macros (calories, protein, fat, carbs)
- ✅ Full recipe body with formatting

## 🔧 Troubleshooting

**Nothing happens when I click?**
- Make sure you're clicking on **text content** (not images or whitespace)
- Try refreshing the page (Ctrl+Shift+R / Cmd+Shift+R)
- Check that `visualEditing: true` is in config.yml

**Preview looks wrong?**
- Images should be in `static/images/` folder
- Recipe image path should be relative (e.g., `images/my-recipe.jpg`)
- Check browser console for errors

**Field doesn't scroll into view?**
- This is normal for fields already visible on screen
- Try clicking on different content to test

## 📚 More Information

See [VISUAL_EDITING.md](VISUAL_EDITING.md) for:
- Technical details
- Configuration options
- How it works under the hood
- Advanced troubleshooting

---

**Version**: Decap CMS 3.9.0+  
**Feature Status**: ✅ Enabled and configured  
**Documentation**: [PR #7374](https://github.com/decaporg/decap-cms/pull/7374)
