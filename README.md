# Make

[Demo](https://adit99.github.io/make-demo/) · [Three-page deck](https://adit99.github.io/make-demo/deck/)

One table, three actions: make a checklist, add child and backup fields, attach a fictional school email. The email supplies 70 dated semester events, with breaks excluded. Existing items and edits are preserved.

React and OpenUI render prepared outputs. CRUD, schema changes, recurrence expansion, search and filters work locally. Data persists in this browser. Sharing is a labeled simulation. There are no live model calls or inbox connections in the public demo. The separate `adit99/make.app` prototype has real model calls, SQLite and invitations.

The deck uses two user-supplied Lovable screenshots (Frogs in Mugs and FRIDG) to discuss building versus distribution. Original images are linked from the slide. The Make idea is apps in one shared product, with structured UI at the core. Chat, live email and SMS remain future direction.

## Develop

```sh
npm ci
npm run dev
npm test
npm run build
python3 -m http.server 4174 --directory dist
```

Source: `site/src`. Deck: `site/public/deck`. Sample email: `site/public/examples/spring-semester.eml`. Vite serves the deck at `/deck/index.html`; the static build supports `/deck/`.

GitHub Pages serves the root of `main`. Build, replace generated root assets with `dist/` contents, then commit and push. Keep `.nojekyll`. Never include environment files or backend keys.

Tests cover the complete semester, breaks, two events on May 20, data preservation and duplicate prevention.
