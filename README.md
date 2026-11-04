# Make — three progressive demos

[Interactive demo](https://adit99.github.io/make-demo/) · [Five-slide deck](https://adit99.github.io/make-demo/deck/)

A React/OpenUI guided demonstration of one app becoming more useful:

1. **Make an app:** a school checklist with a summary, table, four typed fields, and working controls.
2. **Change its data model:** add child, type, location, and backup fields. Preserve IDs, values, completion status, and edits; initialize new fields explicitly.
3. **Build from context:** attach a manufactured semester email. Expand four recurring activities, three one-off events, and holiday/break exclusions into **70 dated events** from January through May 2027. Keep existing tasks.

The public demo uses prepared OpenUI programs, fictional data, and browser local storage. Editing, filtering, pagination, recurrence expansion and schema migration run locally. The family-view switch is explicitly simulated. No API calls, keys, live inboxes, or cross-device collaboration are included here. Use **Start again** to reset the guided example.

The separate `adit99/make.app` React prototype has real model generation/editing, email import, SQLite persistence, and app-scoped invitations. GitHub Pages cannot host its API/database.

The deck leads with structured UX and describes agents, chat, live email and SMS as product direction. It is a lightweight conversation aid with demo links, arrow-key navigation and print styles.

## Develop

```sh
npm ci
npm run dev
npm test
npm run build
python3 -m http.server 4174 --directory dist
```

React source: `site/src`. Browser deck: `site/public/deck`. Sample email: `site/public/examples/spring-semester.eml`.

Vite development serves the deck at `/deck/index.html`; the built static site supports `/deck/`.

## Publish

GitHub Pages serves the root of `main`. Run `npm run build`, copy the contents of `dist/` to the repository root, and commit the generated `index.html`, `assets/`, `deck/`, `examples/`, and `icon.svg` alongside source changes. Keep `.nojekyll`. Do not publish environment files or a backend key.

Tests verify all 70 occurrences, exclusions, simultaneous events on May 20, record preservation, and idempotent imports. Browser QA covers the three-step flow, editing, reload persistence, the final month, and the deck.
