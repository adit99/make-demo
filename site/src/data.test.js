import { test } from "node:test";
import assert from "node:assert/strict";
import {
  semesterRecords,
  migrate,
  importSemester,
  INITIAL_RECORDS,
  BASE_FIELDS,
  EXTRA_FIELDS,
  BREAKS,
  editFields,
  CREATE_PROMPT,
} from "./data.js";
test("making and editing the planner invent no family data", () => {
  assert.deepEqual(INITIAL_RECORDS, []);
  assert.ok(!/Maya|Leo|Alex|Sam|2027/.test(CREATE_PROMPT));
  for (const key of ["child", "person"])
    assert.equal(BASE_FIELDS.find((f) => f.key === key).type, "text");
  assert.equal(EXTRA_FIELDS.find((f) => f.key === "backup").type, "text");
  assert.deepEqual(
    migrate(
      INITIAL_RECORDS,
      editFields("Add backup and location", BASE_FIELDS),
    ),
    [],
  );
});
test("attaching the sample is what supplies the full fictional semester", () => {
  const rows = importSemester(INITIAL_RECORDS);
  assert.equal(rows.length, 154);
  assert.equal(rows.filter((r) => r.category === "Pickup").length, 84);
  assert.equal(rows.filter((r) => r.category === "Event").length, 3);
  assert.equal(rows.filter((r) => r.title === "Chess club").length, 16);
  assert.equal(rows.filter((r) => r.title === "Art studio").length, 17);
  assert.equal(rows.filter((r) => r.date === "2027-05-20").length, 3);
  assert.ok(rows.every((r) => r.source === "semester-email"));
  assert.ok(
    rows.every(
      (r) => !BREAKS.some((b) => r.date >= b.start && r.date <= b.end),
    ),
  );
  assert.equal(new Set(rows.map((r) => r.id)).size, 154);
});
test("manual entries and edited imported records survive schema changes and repeated imports", () => {
  const manual = {
    id: "manual",
    title: "My pickup",
    child: "Riley",
    person: "Taylor",
    date: "2027-01-12",
    done: true,
  };
  const fields = editFields(
    "Add a backup person and pickup location",
    BASE_FIELDS,
  );
  const migrated = migrate([manual], fields);
  assert.equal(migrated[0].backup, "");
  assert.equal(migrated[0].location, "");
  assert.equal(migrated[0].child, "Riley");
  assert.equal(migrated[0].person, "Taylor");
  migrated[0].backup = "Jordan";
  const imported = importSemester(migrated);
  assert.equal(imported.length, 155);
  assert.deepEqual(imported[0], migrated[0]);
  imported[1].location = "Side entrance";
  imported[1].done = true;
  assert.deepEqual(importSemester(imported), imported);
  assert.ok(editFields("Add notes", fields).some((f) => f.key === "notes"));
  assert.throws(() => editFields("Remove pickup person", fields));
});
