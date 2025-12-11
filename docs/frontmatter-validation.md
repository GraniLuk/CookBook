# Frontmatter Validation Solution

## Problem
Decap CMS may save recipe frontmatter in a different field order than expected by `normalize_frontmatter.py`, causing validation failures.

## Solution

### 1. CMS Field Order (Prevention)
All recipe collections in `static/admin/config.yml` use a shared `recipe_fields` anchor that matches the ORDER array in `normalize_frontmatter.py`:

```yaml
_shared_fields:
  recipe_fields: &recipe_fields
    - title
    - author
    - categories
    - subcategories
    - draft
    - readyToTest
    - recipe_image
    # ... (matches ORDER array exactly)

collections:
  - name: sniadania
    fields: *recipe_fields
  # All collections use the same order
```

**Benefit**: CMS saves fields in the correct order from the start, minimizing validation failures.

### 2. Integrated Validation (Enforcement)
The `hugo.yml` workflow includes validation:

```yaml
- name: Validate frontmatter order
  run: python scripts/normalize_frontmatter.py --check

- name: Validate recipe categories  
  run: ./scripts/sync-recipe-categories.ps1 -CheckOnly
```

**Important**: The workflow **validates** but does NOT auto-commit corrections.

## If Validation Fails

When the workflow fails with frontmatter validation errors:

1. **Run normalization locally**:
   ```bash
   python scripts/normalize_frontmatter.py
   ```

2. **Review and commit**:
   ```bash
   git add content/**/*.md
   git commit -m "fix: normalize frontmatter order"
   git push
   ```

3. **Or install pre-commit hook** (optional):
   ```bash
   # Windows
   Copy-Item scripts\pre-commit-hook.py .git\hooks\pre-commit
   ```

## Why Not Auto-Commit from CI?

Auto-committing from CI workflows has issues:
- **Permission complexity**: Requires special tokens and permissions
- **Infinite loops risk**: Can trigger workflows recursively
- **Merge conflicts**: Can cause issues with concurrent edits
- **Transparency**: Developers should see and review formatting changes

The CMS field order configuration should prevent most issues. Manual correction is only needed for:
- Manual edits outside CMS
- Bulk updates
- Edge cases where CMS reorders fields

## Expected Field Order

From `scripts/normalize_frontmatter.py`:

```python
ORDER = [
    "title", "author", "categories", "subcategories",
    "draft", "readyToTest", "recipe_image", "date",
    "tags", "tagline", "link", "queued", "favourite",
    "ingredients", "servings", "prep_time",
    "cook", "cook_increment", "cook_time",
    "calories", "protein", "fat", "carbohydrate",
    "diets", "fodmap"
]
```

## Troubleshooting

**Q: Workflow fails with validation errors?**
- Run `python scripts/normalize_frontmatter.py` locally and commit

**Q: Want to check without fixing?**
- Run `python scripts/normalize_frontmatter.py --check`

**Q: CMS still saving in wrong order?**
- Verify all collections use `fields: *recipe_fields`
- Check that `_shared_fields.recipe_fields` matches ORDER array

**Q: Need to update field definitions?**
- Edit `_shared_fields.recipe_fields` in `config.yml`
- Update applies to all collections automatically
