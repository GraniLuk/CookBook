# Visual Editing - Testing Checklist

Use this checklist to verify that visual editing is working correctly in your CookBook CMS.

## ✅ Pre-Testing Setup

- [ ] Hugo server is running (`hugo server -D`)
- [ ] Site is accessible at `http://localhost:1313/CookBook/`
- [ ] Admin panel loads at `http://localhost:1313/CookBook/admin/`
- [ ] You can log in to the CMS successfully

## ✅ Configuration Verification

- [ ] `static/admin/config.yml` has `editor.visualEditing: true` in recipes collection
- [ ] `static/admin/preview-templates.js` exists
- [ ] `static/admin/index.html` loads preview-templates.js
- [ ] No JavaScript errors in browser console

## ✅ Visual Editing Tests

### Basic Functionality
- [ ] Open an existing recipe in the CMS
- [ ] Preview pane displays on the right side
- [ ] Preview shows recipe content (title, image, body)
- [ ] Editor fields display on the left side

### Click-to-Edit: Title Field
- [ ] Click on the recipe title in the hero section (preview)
- [ ] Title field ("Tytuł") gets focused in editor
- [ ] Title field scrolls into view if needed
- [ ] Field shows visual highlighting
- [ ] You can type immediately to edit

### Click-to-Edit: Author Field
- [ ] Click on the author name in preview (if present)
- [ ] Author field ("Autor") gets focused
- [ ] Field scrolls into view
- [ ] You can edit the field

### Click-to-Edit: Tagline
- [ ] Click on the tagline/description in preview
- [ ] Tagline field ("Opis skrócony") gets focused
- [ ] Field scrolls into view
- [ ] You can edit the field

### Click-to-Edit: Tags
- [ ] Click on any tag chip in preview
- [ ] Tags field ("Tagi") gets focused
- [ ] Tag selector opens
- [ ] You can add/remove tags

### Click-to-Edit: Body Content
- [ ] Click on any paragraph in the recipe body (preview)
- [ ] Body field ("Treść") gets focused in markdown editor
- [ ] Editor scrolls to approximately correct location
- [ ] You can edit the content
- [ ] Changes appear in preview in real-time

## ✅ Preview Rendering Tests

### Hero Section
- [ ] Recipe image displays correctly
- [ ] Image has 1:1 aspect ratio (square)
- [ ] Gradient overlay appears at bottom
- [ ] Title text is white and readable over gradient
- [ ] Image fits container properly (object-fit: cover)

### Metadata Display
- [ ] Author name displays (if set)
- [ ] Tags display as styled chips
- [ ] Servings displays in stats grid
- [ ] Prep time displays in stats grid
- [ ] Cook time displays in stats grid
- [ ] All metadata is properly formatted

### Nutritional Info
- [ ] Calories display in green-tinted box
- [ ] Protein displays with "g" suffix
- [ ] Fat displays with "g" suffix
- [ ] Carbohydrates display with "g" suffix
- [ ] Grid layout is responsive
- [ ] Background color is light green (#e8f5e9)

### Body Content
- [ ] Markdown formatting renders correctly
- [ ] Headings are styled properly
- [ ] Lists (ordered/unordered) display correctly
- [ ] Links are clickable (if any)
- [ ] Bold/italic text renders
- [ ] Line spacing is comfortable (1.8)

## ✅ Styling Tests

### CSS Loading
- [ ] Bulma CSS loads (check network tab)
- [ ] Custom CSS loads (check network tab)
- [ ] Styles match Hugo site appearance
- [ ] Colors are consistent
- [ ] Fonts are consistent

### Responsive Behavior
- [ ] Preview adjusts to preview pane width
- [ ] Grid layouts adapt to available space
- [ ] Text wraps properly
- [ ] Images scale correctly

## ✅ Behavior Tests

### Scroll Sync
- [ ] Traditional scroll sync is disabled (expected)
- [ ] Clicking is the primary navigation method
- [ ] Manual scrolling in preview doesn't affect editor

### Real-Time Updates
- [ ] Typing in title field updates preview immediately
- [ ] Changing tags updates preview immediately
- [ ] Markdown changes appear in preview in real-time
- [ ] Image changes update preview when saved

### Multiple Fields
- [ ] Can click between different preview sections
- [ ] Each click focuses correct field
- [ ] Previously focused field loses focus
- [ ] No lag or delay in switching

## ✅ Edge Cases

### Empty Fields
- [ ] Preview handles missing author gracefully
- [ ] Preview handles missing tagline gracefully
- [ ] Preview handles missing image gracefully
- [ ] Preview handles empty tags list
- [ ] No JavaScript errors with empty fields

### Special Characters
- [ ] Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż) display correctly
- [ ] Accented characters work in all fields
- [ ] Special symbols in content render properly

### Long Content
- [ ] Long recipe titles wrap/truncate appropriately
- [ ] Many tags display without breaking layout
- [ ] Long body content scrolls in preview
- [ ] Large numbers in macros don't break grid

## ✅ Browser Compatibility

Test in different browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

## ✅ Error Handling

### Console Checks
- [ ] No JavaScript errors in console
- [ ] No 404 errors for assets
- [ ] No CSS loading failures
- [ ] preview-templates.js loads successfully

### Network Checks
- [ ] All scripts load from correct paths
- [ ] CDN resources load (Decap CMS, Fuse.js)
- [ ] Local assets use `/CookBook/` prefix
- [ ] No CORS errors

## 📝 Test Results

Date tested: _______________  
Tested by: _______________

### Issues Found
1. _________________________________
2. _________________________________
3. _________________________________

### Notes
_____________________________________________
_____________________________________________
_____________________________________________

## ✅ Sign-Off

- [ ] All critical tests pass
- [ ] Visual editing works as expected
- [ ] Preview matches Hugo site styling
- [ ] No blocking issues found
- [ ] Ready for production use

---

**Tester Signature**: _______________  
**Date**: _______________

## 🐛 Known Limitations

These are expected behaviors, not bugs:
- Visual editing works on text fields only (not images, numbers directly)
- Some complex nested widgets may have limited click support
- Dates and computed fields don't trigger click-to-edit
- Custom processing (e.g., date formatting) happens after encoding

## 📞 Support

If you find issues:
1. Check `docs/VISUAL_EDITING.md` for troubleshooting
2. Review browser console for errors
3. Verify config.yml settings
4. Test with browser cache cleared
5. Check [Decap CMS GitHub Issues](https://github.com/decaporg/decap-cms/issues)
