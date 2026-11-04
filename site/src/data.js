export const CREATE_PROMPT =
  "Make a weekly school pickup and after-school planner.";
export const EDIT_PROMPT = "Add a backup person and a pickup location.";
export const EMAIL = `From: Oakwood School Office <office@oakwood.example>
To: Alex & Sam <family@example.com>
Date: Tue, 05 Jan 2027 09:00:00 -0500
Subject: A few things for Maya and Leo's spring semester
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

FICTIONAL EMAIL FOR THE MAKE PRODUCT DEMO.

Hello Alex and Sam,

I wanted to put everything for the spring semester in one email before we start on January 11. These arrangements run through May 21, 2027, inclusive, and all times are local school time.

Maya has chess in the library on Mondays from 3:30 to 4:30 pm, with Sam picking her up there afterwards. Her Wednesday robotics club is in the science lab, 3:30 to 5 pm, and Alex is doing that pickup. Leo's soccer is every Tuesday on the west field from 4 to 5 pm, with Alex collecting him. On Thursdays he'll be in the art room from 3:15 to 4:15 pm for art studio; Sam will pick him up.

For the ordinary school pickups, Leo leaves at 3 pm on Mondays and Wednesdays with Alex, and Maya leaves at 3 pm on Tuesdays and Thursdays with Sam. On Fridays, Sam collects both children together at 3 pm. All those regular pickups are at the main gate. There are no Friday clubs. On club days, the activity's end time is the pickup time at that activity's location.

One thing to watch: there's no school or any of these activities on January 18. We're also closed February 15 through 19 for winter break and April 12 through 16 for spring break, inclusive, so please skip both pickups and clubs during those dates.

A few extra dates for the calendar: Maya's science fair is March 11, 6 to 7:30 pm in the school hall, and Alex is attending. Field day for both children is May 14 from 1 to 3 pm on the sports field, with Sam attending. Both children are in the spring concert on May 20, 6 to 7 pm in the auditorium, with Alex attending. Leo's art studio still happens that afternoon, so please keep both events.

We haven't arranged backup people yet. Could you leave those blank for now? If you turn this into the family planner, please include the whole semester and keep any pickup arrangements you've already edited.

Warmly,
Oakwood School Office
(Fictional school — demo content only)
`;
export const TERM = { start: "2027-01-11", end: "2027-05-21" };
export const BREAKS = [
  { start: "2027-01-18", end: "2027-01-18", label: "School holiday" },
  { start: "2027-02-15", end: "2027-02-19", label: "Winter break" },
  { start: "2027-04-12", end: "2027-04-16", label: "Spring break" },
];
export const RULES = [
  ...[
    ["pickup-leo-mon", 1, "Leo", "Alex"],
    ["pickup-maya-tue", 2, "Maya", "Sam"],
    ["pickup-leo-wed", 3, "Leo", "Alex"],
    ["pickup-maya-thu", 4, "Maya", "Sam"],
    ["pickup-both-fri", 5, "Maya & Leo", "Sam"],
  ].map(([id, weekday, child, person]) => ({
    id,
    weekday,
    child,
    person,
    title: "School pickup",
    time: "15:00",
    endtime: "",
    location: "Main gate",
    category: "Pickup",
  })),

  {
    id: "chess",
    weekday: 1,
    title: "Chess club",
    child: "Maya",
    time: "15:30",
    endtime: "16:30",
    location: "Library",
    person: "Sam",
    category: "Club",
  },
  {
    id: "soccer",
    weekday: 2,
    title: "Soccer practice",
    child: "Leo",
    time: "16:00",
    endtime: "17:00",
    location: "West field",
    person: "Alex",
    category: "Sport",
  },
  {
    id: "robotics",
    weekday: 3,
    title: "Robotics club",
    child: "Maya",
    time: "15:30",
    endtime: "17:00",
    location: "Science lab",
    person: "Alex",
    category: "Club",
  },
  {
    id: "art",
    weekday: 4,
    title: "Art studio",
    child: "Leo",
    time: "15:15",
    endtime: "16:15",
    location: "Art room",
    person: "Sam",
    category: "Club",
  },
];
export const SPECIAL = [
  {
    date: "2027-03-11",
    title: "Science fair",
    child: "Maya",
    time: "18:00",
    endtime: "19:30",
    location: "School hall",
    person: "Alex",
    category: "Event",
  },
  {
    date: "2027-05-14",
    title: "Field day",
    child: "Maya & Leo",
    time: "13:00",
    endtime: "15:00",
    location: "Sports field",
    person: "Sam",
    category: "Event",
  },
  {
    date: "2027-05-20",
    title: "Spring concert",
    child: "Maya & Leo",
    time: "18:00",
    endtime: "19:00",
    location: "Auditorium",
    person: "Alex",
    category: "Event",
  },
];
export const BASE_FIELDS = [
  { key: "title", label: "Activity", type: "text" },
  { key: "child", label: "Child", type: "text" },
  { key: "date", label: "Date", type: "date" },
  { key: "time", label: "Starts", type: "time" },
  { key: "endtime", label: "Ends / pickup", type: "time" },
  { key: "person", label: "Pickup person", type: "text" },
  { key: "done", label: "Done", type: "checkbox" },
];
export const EXTRA_FIELDS = [
  { key: "backup", label: "Backup", type: "text" },
  { key: "location", label: "Pickup location", type: "text" },
];
export const TIME_FIELDS = [
  {
    key: "category",
    label: "Type",
    type: "select",
    options: ["Pickup", "Club", "Sport", "Event"],
  },
];
export const NOTE_FIELD = { key: "notes", label: "Notes", type: "text" };
export function editFields(prompt, previous) {
  if (/\b(remove|delete|drop|rename)\b/i.test(prompt))
    throw new Error("This demo can add backup, pickup location, or notes.");
  const additions = [
    /backup|back.up|fallback/i.test(prompt) && EXTRA_FIELDS[0],
    /location|place|where|pickup spot/i.test(prompt) && EXTRA_FIELDS[1],
    /notes?|instructions/i.test(prompt) && NOTE_FIELD,
  ]
    .filter(Boolean)
    .filter((f) => !previous.some((p) => p.key === f.key));
  if (!additions.length)
    throw new Error("Try adding a backup person, pickup location, or notes.");
  return [...previous, ...additions];
}
export function semesterRecords() {
  const records = [];
  for (
    let stamp = Date.parse(TERM.start + "T12:00:00Z");
    stamp <= Date.parse(TERM.end + "T12:00:00Z");
    stamp += 86400000
  ) {
    const d = new Date(stamp),
      date = d.toISOString().slice(0, 10);
    if (BREAKS.some((b) => date >= b.start && date <= b.end)) continue;
    for (const rule of RULES.filter((r) => r.weekday === d.getUTCDay())) {
      const { weekday, id, ...values } = rule;
      records.push({
        id: `semester-${date}-${id}`,
        ...values,
        date,
        done: false,
        backup: "",
        source: "semester-email",
      });
    }
  }
  return [
    ...records,
    ...SPECIAL.map((r, i) => ({
      id: `semester-special-${i}`,
      ...r,
      done: false,
      backup: "",
      source: "semester-email",
    })),
  ].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
export function migrate(records, fields) {
  return records.map((r) => {
    const next = { ...r };
    for (const f of fields)
      if (!(f.key in next)) next[f.key] = f.type === "checkbox" ? false : "";
    return next;
  });
}
export const INITIAL_RECORDS = [];
export function importSemester(records) {
  const incoming = semesterRecords();
  const byId = new Map(incoming.map((r) => [r.id, r]));
  const ids = new Set(records.map((r) => r.id));
  const kept = records.map((r) => {
    const fromEmail = byId.get(r.id);
    if (!fromEmail) return r;
    const merged = { ...fromEmail, ...r, source: fromEmail.source };
    for (const key of ["location", "category"])
      if (!r[key]) merged[key] = fromEmail[key];
    return merged;
  });
  return [...kept, ...incoming.filter((r) => !ids.has(r.id))];
}
export const programs = {
  1: 'root = AppScreen([items])\nitems = Records("Weekly planner", "table")',
  2: 'root = AppScreen([items])\nitems = Records("Weekly planner", "table")',
  3: 'root = AppScreen([months, items])\nmonths = MonthFilter("Semester")\nitems = Records("Spring semester", "table")',
};
