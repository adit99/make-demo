import { test } from "node:test";
import assert from "node:assert/strict";
import {
  semesterRecords,
  migrate,
  importSemester,
  INITIAL_RECORDS,
  BASE_FIELDS,
  EXTRA_FIELDS,
  TIME_FIELDS,
  BREAKS,
} from "./data.js";
test("semester expands all weekly rules and exceptions into 70 dated records", () => {
  const rows = semesterRecords();
  assert.equal(rows.length, 70);
  assert.equal(rows.filter((r) => r.category === "Event").length, 3);
  assert.equal(rows.filter((r) => r.title === "Chess club").length, 16);
  assert.equal(rows.filter((r) => r.title === "Art studio").length, 17);
  assert.ok(
    rows.every(
      (r) => !BREAKS.some((b) => r.date >= b.start && r.date <= b.end),
    ),
  );
  assert.equal(rows.filter((r) => r.date === "2027-05-20").length, 2);
  assert.equal(new Set(rows.map((r) => r.id)).size, 70);
  assert.ok(
    rows.every((r) => r.date >= "2027-01-11" && r.date <= "2027-05-21"),
  );
});
test("schema migration keeps records and edits; semester import is idempotent", () => {
  const rows = INITIAL_RECORDS.map((r) => ({ ...r }));
  rows[0].title = "My edited title";
  const fields = [...BASE_FIELDS, ...EXTRA_FIELDS, ...TIME_FIELDS];
  const migrated = migrate(rows, fields);
  assert.equal(migrated[0].title, "My edited title");
  assert.equal(migrated[0].id, rows[0].id);
  assert.equal(migrated[0].child, "");
  assert.equal(migrated[2].done, true);
  const imported = importSemester(migrated);
  assert.equal(imported.length, 73);
  assert.equal(importSemester(imported).length, 73);
  assert.equal(imported[0].title, "My edited title");
});
