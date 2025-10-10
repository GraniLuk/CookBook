# Decap CMS Guide for CookBook

This document captures how the Git-based CMS integration works, how to keep tag data consistent, and what to do when the authentication proxy needs attention.

## Admin panel overview

- URL: `https://graniluk.github.io/CookBook/admin/`
- Authentication: GitHub OAuth handled through the Render-hosted proxy (`https://cookbook-cms-oauth.onrender.com`).
- Once signed in you will see two collections:
  - **Przepisy** – all recipe Markdown files from `content/`
  - **Biblioteka tagów** – tag whitelist files in `data/tags/`
- Edits save straight to the `main` branch (publish mode is `simple`).

## Editing recipes

1. Open **Przepisy** and select a recipe.
2. Field mapping:
   - Front matter keys (title, macros, etc.) appear as form inputs.
   - Body editor writes the Markdown below the front matter.
3. Press **Save** to commit immediately, or **Publish** (same effect in simple mode).
4. GitHub Pages workflow rebuilds automatically via `.github/workflows/hugo.yml`.

### Tag selector (relation widget)

- The **Tagi** field pulls from the `tagLibrary` collection and only allows values defined in `data/tags/*.yaml`.
- Removing a tag in the CMS deletes it from the front matter list.
- To add a new tag:
  1. Open **Biblioteka tagów**.
  2. Create an entry with the tag display label and exact value (value must match what Hugo expects in `.Params.tags`).
  3. Save – the tag becomes available in the recipes collection.

## Media uploads

- Uploads go to `static/images/uploaded/`.
- CMS stores URLs using the configured site prefix (`/CookBook/...`), so deployed pages resolve correctly.

## OAuth proxy maintenance

- Hosted on Render as `cookbook-cms-auth` using the `netlify-cms-github-oauth-provider` project.
- Required environment variables:
  - `OAUTH_CLIENT_ID`
  - `OAUTH_CLIENT_SECRET`
  - `OAUTH_REDIRECT_URI` (e.g. `https://cookbook-cms-auth.onrender.com/callback`)
  - `ORIGINS` (`graniluk.github.io`)
  - Optional: `SCOPES` (`repo,user`), `GIT_HOSTNAME` (`github.com`)
- GitHub OAuth app (Settings → Developer settings → OAuth Apps):
  - Homepage URL: `https://graniluk.github.io/CookBook/`
  - Authorization callback URL: `https://cookbook-cms-auth.onrender.com/callback`
- If login ever redirects to GitHub with `client_id=undefined`, check the Render environment variables.

## Local development workflow

1. Start Hugo preview:

   ```pwsh
   hugo server -D
   ```

2. Run the Decap local backend in another terminal:

   ```pwsh
   npx decap-server
   ```

3. Visit `http://localhost:1313/CookBook/admin/` and log in (local backend avoids hitting the Render proxy).
4. Changes are written to local files; commit or discard as usual.

## Tag whitelist scripts

- `scripts/list_tags.py`
  - Prints all unique tags discovered in `content/**/*.md`.
  - Usage:

    ```pwsh
    C:/Users/5028lukgr/source/repos/Another/CookBook/.venv/Scripts/python.exe scripts/list_tags.py
    ```

- `scripts/generate_tag_data.py`
  - Regenerates `data/tags/*.yaml` from current front matter.
  - Run after adding/removing tags manually to keep the whitelist in sync:

    ```pwsh
    C:/Users/5028lukgr/source/repos/Another/CookBook/.venv/Scripts/python.exe scripts/generate_tag_data.py
    ```

## Troubleshooting checklist

- **Login fails with 404 at api.netlify.com**: proxy not in use; ensure CMS config points to the Render `base_url` with `auth_type: pkce`.
- **GitHub authorize page shows `client_id=undefined`**: missing proxy env variables; redeploy after fixing `OAUTH_CLIENT_ID` and friends.
- **Tag not visible in selector**: the tag YAML is missing; add it via **Biblioteka tagów** or rerun `generate_tag_data.py`.
- **Uploads missing in production**: confirm files exist under `static/images/uploaded/` and were committed.

## Operational notes

- All CMS commits use the editor's GitHub identity thanks to the OAuth flow.
- Keep the Render proxy awake by visiting occasionally; free plans may sleep after inactivity, adding a short delay on first login.
- Review `admin/config.yml` after dependency upgrades to ensure widget configuration still matches your front matter schema.
