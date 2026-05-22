# CPA Study Tracker Public Site

React/Vite static public build for GitHub Pages.

Safety checks:
- No PDF files are included.
- No SQLite database or backend files are included.
- The public build includes question metadata and public-safe material titles/page counts only.
- Public material IDs are stable hashes with legacy pm ids for migration.
- PDF paths, folders, filenames, and local filesystem paths are removed from material data.
- Progress is stored in each browser's local storage on the public static site.
