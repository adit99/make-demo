export const EMAIL = `From: Oakwood School Office <office@oakwood.example>
To: Alex & Sam <family@example.com>
Date: Tue, 05 Jan 2027 09:00:00 -0500
Subject: Maya & Leo — Spring 2027 semester activities and pickup schedule
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

FICTIONAL EMAIL FOR THE MAKE PRODUCT DEMO. All people, school details and events below are illustrative.

Hello Alex and Sam,

Here is Maya and Leo's activity schedule for the entire spring semester, January 11 through May 21, 2027, inclusive. All times are local school time.

WEEKLY ACTIVITIES
Every Monday: Maya — Chess club, 3:30–4:30 pm, Library. Sam handles pickup.
Every Tuesday: Leo — Soccer practice, 4:00–5:00 pm, West field. Alex handles pickup.
Every Wednesday: Maya — Robotics club, 3:30–5:00 pm, Science lab. Alex handles pickup.
Every Thursday: Leo — Art studio, 3:15–4:15 pm, Art room. Sam handles pickup.
There are no regular Friday activities in this email.

NO ACTIVITIES ON THESE DATES
January 18: school holiday. No clubs or practices.
February 15–19 inclusive: winter break. No clubs or practices.
April 12–16 inclusive: spring break. No clubs or practices.
These exceptions apply to all the weekly activities above.

ONE-OFF EVENTS
March 11: Maya — Science fair, 6:00–7:30 pm, School hall. Alex is attending.
May 14: Maya and Leo — Field day, 1:00–3:00 pm, Sports field. Sam is attending.
May 20: Maya and Leo — Spring concert, 6:00–7:00 pm, Auditorium. Alex is attending. Leo's regular art studio still takes place that afternoon.

Please keep the weekly activities, breaks, and one-off events together so the family can plan the whole semester. We have not specified backup people; please leave those unassigned.

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
  {
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
  { key: "title", label: "Task", type: "text" },
  { key: "date", label: "Date", type: "date" },
  { key: "person", label: "Who", type: "select", options: ["Alex", "Sam"] },
  { key: "done", label: "Done", type: "checkbox" },
];
export const EXTRA_FIELDS = [
  {
    key: "child",
    label: "Child",
    type: "select",
    options: ["Maya", "Leo", "Maya & Leo"],
  },
  {
    key: "category",
    label: "Type",
    type: "select",
    options: ["Task", "Club", "Sport", "Event"],
  },
  { key: "location", label: "Location", type: "text" },
  {
    key: "backup",
    label: "Backup person",
    type: "select",
    options: ["Alex", "Sam"],
  },
];
export const TIME_FIELDS = [
  { key: "time", label: "Starts", type: "time" },
  { key: "endtime", label: "Ends", type: "time" },
];
export const INITIAL_RECORDS = [
  {
    id: "task-books",
    title: "Return library books",
    date: "2027-01-08",
    person: "Alex",
    done: false,
  },
  {
    id: "task-conference",
    title: "Book spring conferences",
    date: "2027-01-09",
    person: "Sam",
    done: false,
  },
  {
    id: "task-art",
    title: "Buy art supplies",
    date: "2027-01-10",
    person: "Alex",
    done: true,
  },
];
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
      const { weekday, ...values } = rule;
      records.push({
        id: `semester-${date}-${weekday}`,
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
export function importSemester(records) {
  const ids = new Set(records.map((r) => r.id));
  return [...records, ...semesterRecords().filter((r) => !ids.has(r.id))];
}
export const programs = {
  1: 'root = AppScreen([summary, items])\nsummary = Summary("Our school checklist")\nitems = Records("A few things to do", "table")',
  2: 'root = AppScreen([summary, fields, items])\nsummary = Summary("Our school planner")\nfields = FieldLegend("A richer data model")\nitems = Records("Tasks & activities", "table")',
  3: 'root = AppScreen([summary, months, items])\nsummary = Summary("Spring semester · 2027")\nmonths = MonthFilter("Explore the whole semester")\nitems = Records("The family schedule", "table")',
};
