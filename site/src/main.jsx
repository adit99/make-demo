import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { createRoot } from "react-dom/client";
import {
  createLibrary,
  defineComponent,
  Renderer,
} from "@openuidev/react-lang";
import { z } from "zod";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Check,
  Plus,
  Mail,
  Paperclip,
  Table2,
  Columns3,
  CalendarDays,
  Users,
  RotateCcw,
  X,
  FileText,
  Pencil,
  ChevronRight,
  Download,
  Layers,
  CheckCheck,
  Braces,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  EMAIL,
  TERM,
  BREAKS,
  RULES,
  SPECIAL,
  BASE_FIELDS,
  EXTRA_FIELDS,
  TIME_FIELDS,
  INITIAL_RECORDS,
  semesterRecords,
  migrate,
  importSemester,
  programs,
} from "./data.js";
import "./style.css";
const KEY = "make-progressive-v3";
const fresh = () => ({
  version: 0,
  records: [],
  fields: [],
  attached: false,
  shared: false,
  name: "Our school checklist",
});
const load = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v &&
      [0, 1, 2, 3].includes(v.version) &&
      Array.isArray(v.records) &&
      Array.isArray(v.fields)
      ? v
      : fresh();
  } catch {
    return fresh();
  }
};
const steps = [
  {
    id: "create",
    title: "Make an app",
    desc: "An idea becomes a useful interface.",
    icon: Table2,
  },
  {
    id: "edit",
    title: "Change the app",
    desc: "New fields. Same records.",
    icon: Columns3,
  },
  {
    id: "context",
    title: "Build from context",
    desc: "One email. The whole semester.",
    icon: Mail,
  },
];
const Runtime = createContext(null);
function useApp() {
  return useContext(Runtime);
}
const dateLabel = (value) =>
  value
    ? new Date(value + "T12:00:00Z").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })
    : "—";
const timeLabel = (v) => {
  if (!v) return "—";
  const [h, m] = v.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
};
function SummaryView({ title }) {
  const { data } = useApp();
  const complete = data.records.filter((r) => r.done).length;
  const sourced = data.records.filter((r) => r.source).length;
  return (
    <div className="summary">
      <div>
        <p className="eyebrow">{title}</p>
        <h2>
          {data.version === 3
            ? "A plan for the whole semester."
            : data.version === 2
              ? "A little more room for real life."
              : "Everything has a place."}
        </h2>
        <p>
          {data.version === 3
            ? "January 11 – May 21, 2027 · breaks and exceptions included"
            : data.version === 2
              ? "Your original items, with a richer structure."
              : "A clear list, useful fields, and a next action."}
        </p>
      </div>
      <div className="metrics">
        <div>
          <strong>{data.records.length}</strong>
          <span>items</span>
        </div>
        <div>
          <strong>{data.version === 3 ? sourced : complete}</strong>
          <span>{data.version === 3 ? "from email" : "complete"}</span>
        </div>
      </div>
    </div>
  );
}
function FieldsView({ title }) {
  const { data } = useApp();
  return (
    <div className="field-strip">
      <span>{title}</span>
      {data.fields
        .filter((f) => EXTRA_FIELDS.some((e) => e.key === f.key))
        .map((f) => (
          <span className="field-token" key={f.key}>
            <Plus size={12} />
            {f.label}
            <small>{f.type}</small>
          </span>
        ))}
    </div>
  );
}
function MonthsView({ title }) {
  const { month, setMonth } = useApp();
  return (
    <div className="month-filter">
      <span>{title}</span>
      <div>
        {[
          ["all", "All semester"],
          ["01", "Jan"],
          ["02", "Feb"],
          ["03", "Mar"],
          ["04", "Apr"],
          ["05", "May"],
        ].map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMonth(m)}
            className={month === m ? "active" : ""}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
function RecordsView({ title }) {
  const { data, setData, onEdit, onSource, month, preview, viewer } = useApp();
  const [search, setSearch] = useState("");
  const [child, setChild] = useState("all");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  useEffect(
    () => setPage(1),
    [month, search, child, filter, data.records.length],
  );
  const rows = data.records
    .filter(
      (r) =>
        (month === "all" || r.date?.slice(5, 7) === month) &&
        (child === "all" || r.child?.includes(child)) &&
        (filter === "all" || (filter === "done" ? r.done : !r.done)) &&
        Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      ((a.date || "9999") + (a.time || "")).localeCompare(
        (b.date || "9999") + (b.time || ""),
      ),
    );
  const pages = Math.max(1, Math.ceil(rows.length / 12));
  const shown = rows.slice(
    (Math.min(page, pages) - 1) * 12,
    Math.min(page, pages) * 12,
  );
  return (
    <section className="records">
      <div className="section-heading">
        <h3>
          {title}
          <span className="count">{data.records.length}</span>
        </h3>
        {!preview && (
          <button className="button small" onClick={() => onEdit(null)}>
            <Plus size={15} />
            Add item
          </button>
        )}
      </div>
      <div className="table-tools">
        <label className="search">
          <Search size={15} />
          <input
            aria-label="Search schedule"
            placeholder="Find an item…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div>
          {data.version >= 2 && (
            <select
              aria-label="Filter by child"
              value={child}
              onChange={(e) => setChild(e.target.value)}
            >
              <option value="all">Everyone</option>
              <option>Maya</option>
              <option>Leo</option>
            </select>
          )}
          <select
            aria-label="Filter by status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All items</option>
            <option value="open">To do</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="check-col">
                <span className="sr-only">Done</span>
              </th>
              <th>{data.version === 1 ? "Task" : "Task or activity"}</th>
              {data.version >= 2 && <th>Child / type</th>}
              <th>Date{data.version === 3 ? " & time" : ""}</th>
              <th>Who</th>
              {data.version >= 2 && <th>Backup</th>}
              <th>
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className={r.done ? "completed" : ""}>
                <td>
                  <button
                    disabled={preview}
                    aria-label={`${r.done ? "Mark incomplete" : "Complete"}: ${r.title}`}
                    className={`check ${r.done ? "checked" : ""}`}
                    onClick={() =>
                      setData({
                        ...data,
                        records: data.records.map((x) =>
                          x.id === r.id ? { ...x, done: !x.done } : x,
                        ),
                      })
                    }
                  >
                    {r.done && <Check size={13} />}
                  </button>
                </td>
                <td>
                  <strong>{r.title}</strong>
                  {r.location && <small>{r.location}</small>}
                  {r.source && (
                    <button
                      className="source-link"
                      onClick={onSource}
                      disabled={preview}
                    >
                      <Mail size={11} />
                      School email
                    </button>
                  )}
                </td>
                {data.version >= 2 && (
                  <td>
                    <span>{r.child || "Not set"}</span>
                    <small>{r.category || "Not set"}</small>
                  </td>
                )}
                <td>
                  <span>{dateLabel(r.date)}</span>
                  {data.version === 3 && (
                    <small>
                      {r.time
                        ? `${timeLabel(r.time)} – ${timeLabel(r.endtime)}`
                        : "No time set"}
                    </small>
                  )}
                </td>
                <td>
                  <span className={`person ${r.person === "Sam" ? "sam" : ""}`}>
                    {r.person || "Unassigned"}
                  </span>
                </td>
                {data.version >= 2 && (
                  <td className="backup">{r.backup || "Unassigned"}</td>
                )}
                <td>
                  <button
                    disabled={preview}
                    className="icon-button"
                    aria-label={`Edit ${r.title}`}
                    onClick={() => onEdit(r)}
                  >
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="empty-table">No items match these filters.</div>
        )}
      </div>
      <div className="pagination">
        <span>
          {rows.length
            ? `${(Math.min(page, pages) - 1) * 12 + 1}–${Math.min(Math.min(page, pages) * 12, rows.length)} of ${rows.length} items`
            : "0 items"}
          {viewer === "Sam" ? " · Sam’s shared view" : ""}
        </span>
        <div>
          <button
            aria-label="Previous page"
            className="icon-button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ArrowLeft size={15} />
          </button>
          <span>
            {Math.min(page, pages)} / {pages}
          </span>
          <button
            aria-label="Next page"
            className="icon-button"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
const Summary = defineComponent({
  name: "Summary",
  description: "Live overview of the stored records.",
  props: z.object({ title: z.string() }),
  component: ({ props }) => <SummaryView {...props} />,
});
const FieldLegend = defineComponent({
  name: "FieldLegend",
  description: "New fields in the schema.",
  props: z.object({ title: z.string() }),
  component: ({ props }) => <FieldsView {...props} />,
});
const MonthFilter = defineComponent({
  name: "MonthFilter",
  description: "Filter records by semester month.",
  props: z.object({ title: z.string() }),
  component: ({ props }) => <MonthsView {...props} />,
});
const Records = defineComponent({
  name: "Records",
  description:
    "Working table backed by local records, with editing and filters.",
  props: z.object({ title: z.string(), layout: z.enum(["table"]) }),
  component: ({ props }) => <RecordsView {...props} />,
});
const AppScreen = defineComponent({
  name: "AppScreen",
  description: "Structured app layout.",
  props: z.object({
    children: z.array(
      z.union([Summary.ref, FieldLegend.ref, MonthFilter.ref, Records.ref]),
    ),
  }),
  component: ({ props, renderNode }) => (
    <div className="generated">{renderNode(props.children)}</div>
  ),
});
const library = createLibrary({
  root: "AppScreen",
  components: [AppScreen, Summary, FieldLegend, MonthFilter, Records],
});
function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.querySelector("button,input,textarea")?.focus();
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = [
          ...ref.current.querySelectorAll(
            "button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]",
          ),
        ].filter((el) => el.offsetParent !== null);
        if (e.shiftKey && document.activeElement === els[0]) {
          e.preventDefault();
          els.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
          e.preventDefault();
          els[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      prev?.isConnected && prev.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        className={`modal ${wide ? "wide" : ""}`}
      >
        <header>
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
function App() {
  const [data, setData] = useState(load);
  const [step, setStep] = useState(
    Math.max(
      0,
      steps.findIndex((s) => location.hash === "#" + s.id),
    ),
  );
  const [month, setMonth] = useState("all");
  const [modal, setModal] = useState("");
  const [editing, setEditing] = useState(null);
  const [viewer, setViewer] = useState("Alex");
  const [building, setBuilding] = useState(false);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [data]);
  useEffect(() => {
    const h = () =>
      setStep(
        Math.max(
          0,
          steps.findIndex((s) => location.hash === "#" + s.id),
        ),
      );
    addEventListener("hashchange", h);
    return () => removeEventListener("hashchange", h);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  const select = (s) => {
    setStep(s);
    location.hash = steps[s].id;
    setMonth("all");
  };
  function build() {
    setBuilding(true);
    setTimeout(() => {
      setData({
        ...data,
        version: 1,
        fields: BASE_FIELDS.map((f) => ({ ...f })),
        records: INITIAL_RECORDS.map((r) => ({ ...r })),
      });
      setBuilding(false);
      setToast("The checklist is ready. Try completing or editing an item.");
    }, 600);
  }
  function evolve() {
    const fields = [
      ...BASE_FIELDS,
      ...EXTRA_FIELDS,
      ...(data.version === 3 ? TIME_FIELDS : []),
    ];
    setData({
      ...data,
      version: Math.max(2, data.version),
      fields,
      records: migrate(data.records, fields),
      name: data.version === 3 ? "Our spring semester" : "Our school planner",
    });
    setModal("");
    setToast("Four fields added. Every existing record and edit kept.");
  }
  function attach() {
    setData({ ...data, attached: true });
    setToast("Fictional semester email attached. Inspect it before building.");
  }
  function importAll() {
    const fields = [...BASE_FIELDS, ...EXTRA_FIELDS, ...TIME_FIELDS];
    const records = migrate(importSemester(data.records), fields);
    setData({
      ...data,
      version: 3,
      fields,
      records,
      attached: true,
      name: "Our spring semester",
    });
    setModal("");
    setMonth("all");
    setToast(
      "The full semester is ready: 70 email events, with breaks excluded.",
    );
  }
  const runtime = {
    data,
    setData,
    month,
    setMonth,
    viewer,
    preview: false,
    onEdit: (r) => {
      setEditing(r);
      setModal("record");
    },
    onSource: () => setModal("email"),
  };
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#create" onClick={() => select(0)}>
          <span className="brand-symbol">m</span>make<span>.</span>
        </a>
        <div className="top-links">
          <span className="demo-label">
            <i />
            Interactive guided demo
          </span>
          <a href="./deck/">
            The idea <ArrowUpRight size={15} />
          </a>
        </div>
      </header>
      <div className="shell">
        <aside className="story">
          <div className="story-heading">
            <span className="eyebrow">THREE WAYS TO MAKE</span>
            <h1>
              Software that takes
              <br />
              your shape.
            </h1>
            <p>
              Create it. Change it.
              <br />
              Give it the context of your life.
            </p>
          </div>
          <nav aria-label="Demo steps">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => select(i)}
                className={`step ${step === i ? "active" : ""}`}
                aria-current={step === i ? "step" : undefined}
              >
                <span className="step-number">{i + 1}</span>
                <span>
                  <strong>{s.title}</strong>
                  <small>{s.desc}</small>
                </span>
                {((i === 0 && data.version >= 1) ||
                  (i === 1 && data.version >= 2) ||
                  (i === 2 && data.version === 3)) && <Check size={15} />}
              </button>
            ))}
          </nav>
          <div className="story-footer">
            <p>
              Prepared AI outputs, rendered with OpenUI. Edits work in this
              browser. No API calls or connected accounts.
            </p>
            <button className="text-button" onClick={() => setModal("reset")}>
              <RotateCcw size={13} />
              Start again
            </button>
          </div>
        </aside>
        <main>
          <div className="chapter">
            <span className="eyebrow">DEMO {step + 1} OF 3</span>
            <h2>
              {step === 0
                ? "An idea becomes an interface."
                : step === 1
                  ? "Change the structure. Keep the work."
                  : "A whole semester, from one email."}
            </h2>
            <p>
              {step === 0
                ? "A title, a summary, a table, and fields you can use immediately."
                : step === 1
                  ? "Editing the app changes its schema as well as its layout. Your existing items stay intact."
                  : "Recurring clubs, one-off events, and school breaks become dated, editable records."}
            </p>
          </div>
          {storageError && (
            <p role="alert" className="notice">
              Your browser could not save changes. This session still works, but
              reloads may reset it.
            </p>
          )}
          <p className="demo-disclosure">
            Guided demo · prepared AI outputs · your edits are saved in this
            browser.
          </p>
          <div className="request-bar">
            <span className="request-icon">
              {step === 2 ? (
                <Mail size={22} />
              ) : step === 1 ? (
                <Columns3 size={22} />
              ) : (
                <Table2 size={22} />
              )}
            </span>
            <div>
              <span className="request-label">
                {step === 2 ? "ATTACHED CONTEXT" : "THE REQUEST"}
              </span>
              <p>
                {step === 0
                  ? "“Make a school checklist with a task, date, person, and done checkbox.”"
                  : step === 1
                    ? "“Add child, activity type, location, and a backup person. Keep my existing tasks.”"
                    : "“Make a planner from this email, including every activity for the full semester.”"}
              </p>
              {step === 2 && data.attached && (
                <button
                  className="attachment"
                  onClick={() => setModal("email")}
                >
                  <Paperclip size={14} />
                  spring-semester.eml<span>Fictional sample</span>
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>
            {step === 0 ? (
              <button
                className="button"
                disabled={data.version > 0 || building}
                onClick={build}
              >
                {building ? (
                  "Preparing…"
                ) : data.version > 0 ? (
                  <>
                    <Check size={16} />
                    App created
                  </>
                ) : (
                  <>
                    Make this app
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            ) : step === 1 ? (
              <button
                className="button"
                disabled={!data.version || data.version >= 2}
                onClick={() => setModal("migration")}
              >
                {data.version >= 2 ? (
                  <>
                    <Check size={16} />
                    Schema updated
                  </>
                ) : (
                  <>
                    Preview change
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            ) : !data.attached ? (
              <button className="button" onClick={attach}>
                <Paperclip size={16} />
                Attach sample email
              </button>
            ) : (
              <button
                className="button"
                disabled={data.version === 3}
                onClick={() => setModal("semester")}
              >
                {data.version === 3 ? (
                  <>
                    <Check size={16} />
                    Semester built
                  </>
                ) : (
                  <>
                    Preview semester
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
          {step === 1 && data.version === 0 && (
            <div className="notice">
              Begin by making the checklist.{" "}
              <button className="text-button" onClick={() => select(0)}>
                Go to demo 1 <ArrowRight size={13} />
              </button>
            </div>
          )}
          {!data.version ? (
            <section className="empty-workspace">
              <div className="empty-icon">
                <Table2 size={32} />
              </div>
              <h3>
                {step === 2
                  ? "Your source becomes the app."
                  : "Your app will appear here."}
              </h3>
              <p>
                {step === 2
                  ? "Attach the sample email and preview the complete semester."
                  : "Create the checklist, then try its fields and controls."}
              </p>
              <div className="skeleton">
                <span />
                <i />
                <i />
                <i />
              </div>
            </section>
          ) : (
            <>
              <div className="app-heading">
                <div>
                  <span className="app-icon">
                    <CalendarDays size={21} />
                  </span>
                  <div>
                    <h2>{data.name}</h2>
                    <span>
                      One app · {data.fields.length} fields ·{" "}
                      {data.records.length} records
                    </span>
                  </div>
                </div>
                <div className="app-heading-actions">
                  <button
                    className="text-button"
                    onClick={() => setModal("schema")}
                  >
                    <Layers size={15} />
                    View fields
                  </button>
                  <button
                    className="button secondary small"
                    onClick={() => setModal("share")}
                  >
                    <Users size={15} />
                    {data.shared ? "Shared · demo" : "Share · demo"}
                  </button>
                </div>
              </div>
              {data.shared && (
                <div className="shared-strip">
                  <span>
                    <Users size={14} />
                    Same records, two family views
                  </span>
                  <div>
                    {["Alex", "Sam"].map((p) => (
                      <button
                        key={p}
                        className={viewer === p ? "active" : ""}
                        onClick={() => setViewer(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <small>Simulated in this browser</small>
                </div>
              )}
              <Runtime.Provider value={runtime}>
                <Renderer
                  library={library}
                  response={programs[data.version]}
                  isStreaming={false}
                />
              </Runtime.Provider>
              <div className="next-step">
                {step < 2 ? (
                  <>
                    <div>
                      <strong>
                        {step === 0
                          ? "Now make it fit your family."
                          : "Now give it a whole semester of context."}
                      </strong>
                      <p>
                        {step === 0
                          ? "The next step changes the data model while keeping your edits."
                          : "An attached email supplies the dates, rules, and exceptions."}
                      </p>
                    </div>
                    <button
                      className="button secondary"
                      onClick={() => select(step + 1)}
                    >
                      Demo {step + 2}
                      <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <strong>
                        {data.version === 3
                          ? "70 dated events. One shared place to use them."
                          : "One email can become the whole semester."}
                      </strong>
                      <p>
                        {data.version === 3
                          ? `${data.records.filter((r) => !r.source).length} existing tasks kept. All five months are searchable and editable.`
                          : "Attach the sample and review the dated events before adding them."}
                      </p>
                    </div>
                    <a className="button secondary" href="./deck/">
                      Explore the idea
                      <ArrowUpRight size={16} />
                    </a>
                  </>
                )}
              </div>
            </>
          )}
          {step === 2 && (
            <div className="source-note">
              <Mail size={16} />
              <p>
                The source is a manufactured email, not a connected inbox. The
                public demo expands prepared recurrence rules locally. In the
                working prototype, the model interprets imported context.
              </p>
              <a href="./examples/spring-semester.eml" download>
                Download email
                <Download size={14} />
              </a>
            </div>
          )}
        </main>
      </div>
      {modal === "migration" && (
        <Modal
          title="The app changes. Your records stay."
          wide
          onClose={() => setModal("")}
        >
          <p className="lead">
            The requested edit adds four real fields to the demo’s data model.
            Existing records receive empty values you can fill in.
          </p>
          <div className="migration-stats">
            <span>
              <strong>
                {data.fields.length} →{" "}
                {BASE_FIELDS.length + EXTRA_FIELDS.length}
              </strong>
              fields
            </span>
            <span>
              <strong>{data.records.length} kept</strong>existing records
            </span>
            <span>
              <strong>0 removed</strong>fields or records
            </span>
          </div>
          <table className="schema-table">
            <thead>
              <tr>
                <th>New field</th>
                <th>Type</th>
                <th>Existing items receive</th>
              </tr>
            </thead>
            <tbody>
              {EXTRA_FIELDS.map((f) => (
                <tr key={f.key}>
                  <td>
                    <Plus size={13} />
                    {f.label}
                  </td>
                  <td>{f.type === "select" ? "Choice" : f.type}</td>
                  <td>{f.options ? "Unassigned choice" : "Empty text"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="notice">
            Existing titles, assignments, dates, and completion states are
            preserved. New items use the expanded form.
          </p>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setModal("")}>
              Keep reviewing
            </button>
            <button className="button" onClick={evolve}>
              Apply schema change
              <Check size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal === "email" && (
        <Modal title="The semester email" wide onClose={() => setModal("")}>
          <div className="email-meta">
            <span className="pill">Fictional source</span>
            <a href="./examples/spring-semester.eml" download>
              Download .eml
              <Download size={14} />
            </a>
          </div>
          <pre className="email-body">{EMAIL}</pre>
        </Modal>
      )}
      {modal === "semester" && (
        <Modal
          title="A full semester, ready to review"
          wide
          onClose={() => setModal("")}
        >
          <p className="lead">
            January 11 – May 21, 2027. The weekly rules expand into dated
            events, with holidays and breaks excluded.
          </p>
          <div className="migration-stats">
            <span>
              <strong>4</strong>weekly activities
            </span>
            <span>
              <strong>3</strong>one-off events
            </span>
            <span>
              <strong>70</strong>dated records
            </span>
          </div>
          <div className="review-rules">
            <h3>Recurring activities</h3>
            {RULES.map((r) => (
              <div key={r.weekday}>
                <span>{["", "Mon", "Tue", "Wed", "Thu"][r.weekday]}</span>
                <strong>
                  {r.child} · {r.title}
                </strong>
                <span>
                  {timeLabel(r.time)} – {timeLabel(r.endtime)}
                </span>
              </div>
            ))}
            <h3>Exceptions already accounted for</h3>
            <p>
              {BREAKS.map(
                (b) =>
                  `${b.label}: ${dateLabel(b.start)}${b.end !== b.start ? "–" + dateLabel(b.end) : ""}`,
              ).join(" · ")}
            </p>
          </div>
          <details className="all-events">
            <summary>
              Inspect all 70 dated events
              <ChevronRight size={16} />
            </summary>
            <div className="events-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Child</th>
                    <th>Activity</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {semesterRecords().map((r) => (
                    <tr key={r.id}>
                      <td>{dateLabel(r.date)}</td>
                      <td>{r.child}</td>
                      <td>{r.title}</td>
                      <td>{timeLabel(r.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <p className="notice">
            {data.records.length} existing records will be kept. Start and end
            time fields will be added; backup people stay unassigned. Repeating
            this import never duplicates these events.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setModal("email")}
            >
              Read source email
            </button>
            <button className="button" onClick={importAll}>
              Build semester app
              <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal === "schema" && (
        <Modal
          title={`App fields · version ${data.version}`}
          onClose={() => setModal("")}
        >
          <p className="lead">
            These fields power the table and the editing form. Records are
            stored separately from the layout.
          </p>
          <table className="schema-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Data type</th>
              </tr>
            </thead>
            <tbody>
              {data.fields.map((f) => (
                <tr key={f.key}>
                  <td>{f.label}</td>
                  <td>{f.type === "select" ? "Choice" : f.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
      {modal === "record" && (
        <RecordEditor
          record={editing}
          fields={data.fields}
          onClose={() => setModal("")}
          onSave={(record) => {
            setData({
              ...data,
              records: editing
                ? data.records.map((r) => (r.id === editing.id ? record : r))
                : [...data.records, record],
            });
            setModal("");
            setToast("Saved in this browser.");
          }}
        />
      )}
      {modal === "share" && (
        <Modal
          title="One app for the people who use it"
          onClose={() => setModal("")}
        >
          <p className="lead">
            Share the planner with Sam. Both views use the same records and the
            same evolving schema.
          </p>
          <div className="share-preview">
            <span className="avatar">S</span>
            <span>
              <strong>Sam</strong>
              <small>Can edit items in this app</small>
            </span>
            <Check size={18} />
          </div>
          <p className="notice">
            This public demo simulates sharing inside one browser. The separate
            working prototype supports real invitation links and access checks.
          </p>
          <div className="modal-actions">
            <button
              className="button"
              onClick={() => {
                setData({ ...data, shared: !data.shared });
                setModal("");
              }}
            >
              {data.shared ? "Stop simulated sharing" : "Try the shared view"}
              <Users size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal === "reset" && (
        <Modal
          title="Start the three demos again?"
          onClose={() => setModal("")}
        >
          <p className="lead">
            This clears only this guided demo’s records and edits in this
            browser.
          </p>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setModal("")}>
              Cancel
            </button>
            <button
              className="button"
              onClick={() => {
                setData(fresh());
                setModal("");
                setViewer("Alex");
                select(0);
              }}
            >
              Reset demo
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
    </>
  );
}
function RecordEditor({ record, fields, onClose, onSave }) {
  const [values, setValues] = useState(record || {});
  return (
    <Modal title={record ? "Edit item" : "Add an item"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...values, id: record?.id || crypto.randomUUID() });
        }}
      >
        <div className="form-grid">
          {fields.map((f) => (
            <label key={f.key} className={f.key === "title" ? "full" : ""}>
              {f.label}
              {f.type === "checkbox" ? (
                <span className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={!!values[f.key]}
                    onChange={(e) =>
                      setValues({ ...values, [f.key]: e.target.checked })
                    }
                  />
                  Complete
                </span>
              ) : f.type === "select" ? (
                <select
                  value={values[f.key] || ""}
                  onChange={(e) =>
                    setValues({ ...values, [f.key]: e.target.value })
                  }
                >
                  <option value="">Not set</option>
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type}
                  required={f.key === "title"}
                  maxLength={150}
                  value={values[f.key] || ""}
                  onInput={(e) =>
                    setValues({ ...values, [f.key]: e.currentTarget.value })
                  }
                  onChange={(e) =>
                    setValues({ ...values, [f.key]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <button className="button" type="submit">
            Save item
            <Check size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
createRoot(document.getElementById("root")).render(<App />);
