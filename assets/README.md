# Asset organization

- `source/` contains original working assets and reference files kept for future case-study work.
- `source/wos/` contains original WOS screenshots.
- `source/logos/` contains original project logos.
- `source/documents/` contains private/source documents such as the CV.
- `public/assets/` contains only assets referenced by the deployed website.

The app must reference deployable files from `public/assets/`; source files are not copied into the production bundle unless explicitly imported.
