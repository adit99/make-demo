# Make — context-aware shared app demo

A static guided product demo, published at https://adit99.github.io/make-demo/.

The main story turns sample email/calendar context into a structured family pickup planner. Alternate examples show a trip itinerary with a packing list and a household tracker with maintenance tasks.

## Run locally

Serve the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/. No installation or build step is required. Edit `index.html`, `styles.css`, and `app.js`.

## Main walkthrough

1. Create the pickup planner from the sample family calendar and school-email excerpts.
2. Inspect card provenance and the selected source context.
3. Share the app with Sam in the demo, then switch between Alex's full board and Sam's own pickups.
4. Simulate a school email announcing early dismissal. The schedule remains unchanged until the visitor reviews and applies the proposal.
5. See the availability conflict, reassign the pickup, and observe the same record in both family views.
6. Preview and apply an edit that adds backup people and pickup confirmations while retaining all records.
7. Reopen the demo or restore an earlier layout: the records persist.

## Other examples

- **Weekend away:** sample reservations and calendar events become an itinerary; visitors can complete packing tasks, add items, assign people, inspect sources, and add reservation-code and note fields.
- **Home file:** sample receipts and service reminders become appliance records and maintenance tasks; visitors can complete and assign tasks and add serial-number and note fields.

## What is simulated

People, source excerpts, calendar availability, invitations, generation, and external updates are prepared demo data. Family-view switching demonstrates shared state in one browser; it is not authenticated, cross-device collaboration. No emails, calendar changes, invitations, bookings, or model requests are sent. Sources are fixed illustrative snapshots, not live accounts.

App records and interface versions persist in localStorage under `make-context-demo-v2`. A reset affects only that demo state in the current browser. Private source accounts are never connected. No credentials or backend are included. Google Fonts loads optional typefaces, with system-font fallbacks.

## Publishing

GitHub Pages serves the default branch at its root. Commit and push the three app files and any documentation updates. `.openai`, `dist`, `output`, and environment files are ignored and not published.

## Validation

- JavaScript syntax check (`node --check app.js`).
- Browser walkthrough: creation, sharing, both family views, pending source update, conflict detection, reassignment, preview/apply edit, backup field, pickup confirmation, reload persistence, and layout restore.
- Trip packing completion and item creation.
- Household task completion and source inspection.

The demo is independent of the native Expo app repository.
