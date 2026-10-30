# Make — interactive product demo

A standalone guided demo of the Make.app concept. Published with GitHub Pages.

## Try it

Open `index.html` directly, or serve this directory with `python3 -m http.server 4173`.

The demo supports creating a reading tracker, task list, habit tracker, or expense tracker; adding and updating entries; applying prepared edits; and restoring earlier app layouts without removing records. Changes persist in this browser using localStorage. Reset demo restores the original sample content.

Creation and editing are explicitly simulated. There are no model requests, credentials, backend services, or API costs. Sample history and entries are illustrative. Fonts load from Google Fonts, with system fallbacks when offline.

## Hosting

GitHub Pages serves the repository root. Update `index.html` and push to the default branch to publish changes.

## Verified

- Reading app creation, sample book, and progress update.
- Notes and theme edit preserve the book and progress.
- Reload preserves apps, records, and notes.
- Restoring a layout preserves current records.

This demo is independent of the native Expo app repository.
