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
  editFields,
} from "./data.js";
test("whole semester includes pickups, activities, exceptions and simultaneous events", () => {
  const rows = semesterRecords();
  assert.equal(rows.length, 154);
  assert.equal(rows.filter((r) => r.category === "Pickup").length, 84);
  assert.equal(rows.filter((r) => r.category === "Event").length, 3);
  assert.equal(rows.filter((r) => r.title === "Chess club").length, 16);
  assert.equal(rows.filter((r) => r.title === "Art studio").length, 17);
  assert.equal(rows.filter((r) => r.date === "2027-05-20").length, 3);
  assert.ok(
    rows.every(
      (r) => !BREAKS.some((b) => r.date >= b.start && r.date <= b.end),
    ),
  );
  assert.equal(new Set(rows.map((r) => r.id)).size, 154);
  assert.ok(
    rows.every((r) => r.date >= "2027-01-11" && r.date <= "2027-05-21"),
  );
  assert.equal(INITIAL_RECORDS.length, 9);
  assert.ok(INITIAL_RECORDS.every((r) => r.date <= "2027-01-15"));
});
test("prompt-driven schema additions persist and context enriches rather than duplicates the first week", () => {
  const rows = INITIAL_RECORDS.map((r) => ({ ...r }));
  rows[0].person = "Sam";
  rows[0].done = true;
  const fields = editFields(
    "Add a backup person and pickup location",
    BASE_FIELDS,
  );
  assert.equal(fields.length, BASE_FIELDS.length + 2);
  const migrated = migrate(rows, fields);
  assert.equal(migrated[0].backup, "");
  assert.equal(migrated[0].location, "");
  migrated[0].backup = "Alex";
  migrated[0].location = "Side entrance";
  const withNotes = editFields("Add notes", fields);
  assert.ok(withNotes.some((f) => f.key === "notes"));
  assert.throws(() => editFields("Remove pickup person", fields));
  const imported = importSemester(migrated);
  assert.equal(imported.length, 154);
  assert.equal(imported[0].id, rows[0].id);
  assert.equal(imported[0].person, "Sam");
  assert.equal(imported[0].done, true);
  assert.equal(imported[0].location, "Side entrance");
  assert.equal(imported[0].backup, "Alex");
  assert.equal(imported[1].location, "Library");
  assert.equal(imported[0].source, "semester-email");
  assert.deepEqual(importSemester(imported), imported);
  const custom = { id: "custom", title: "Dentist", date: "2027-01-16" };
  assert.equal(importSemester([...imported, custom]).length, 155);
});
