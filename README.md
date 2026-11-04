# Make family planner

[Demo](https://adit99.github.io/make-demo/) · [Deck](https://adit99.github.io/make-demo/deck/)

One family planner, three moments:

1. **Make from a prompt.** A school-pickup and after-school planner for Maya and Leo, starting with nine entries for January 11–15, 2027.
2. **Edit from a prompt.** Add backup people, pickup locations or notes as real fields. Existing records, completion status and assignments survive.
3. **Attach context.** A fictional, unstructured email supplies the entire semester. Its prepared interpretation expands to 154 dated pickups and activities, including one-off events and school closures. The nine existing entries are enriched without duplicates or overwriting edited values.

This public React/OpenUI demo uses prepared AI output and limited prompt routing, not live model calls or arbitrary prompt generation. Supported edit requests add backup, location and notes fields. CRUD, schema migration, recurrence expansion, filtering and local persistence work. Sharing is a labeled simulation. The separate `adit99/make.app` prototype has real model calls, SQLite and invitations.

The four-slide deck identifies the AI hobbyist, presents the generative UI thesis, uses two user-supplied Lovable screenshots to discuss distribution, and explains apps in one shared product. Chat, live email and SMS remain future direction.

## Develop

```sh
npm ci
npm run dev
npm test
npm run build
python3 -m http.server 4174 --directory dist
```

Source: `site/src`. Deck: `site/public/deck`. Fictional email: `site/public/examples/spring-semester.eml`. Vite serves the deck at `/deck/index.html`; the static build supports `/deck/`.

GitHub Pages serves the root of `main`. Build, replace generated root assets with `dist/` contents, then commit and push. Keep `.nojekyll`. Never include environment files or backend keys.

Tests cover all semester occurrences, closures, overlapping events, prompt-to-field changes, edited data preservation, source enrichment and idempotent import.
