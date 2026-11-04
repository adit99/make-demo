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
  Users,
  X,
  Pencil,
  Search,
} from "lucide-react";
import {
  EMAIL,
  BASE_FIELDS,
  EXTRA_FIELDS,
  TIME_FIELDS,
  INITIAL_RECORDS,
  migrate,
  importSemester,
  programs,
} from "./data.js";
import "./style.css";
const KEY = "make-simple-v4";
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
function MonthsView() {
  const { month, setMonth } = useApp();
  return (
    <div className="month-filter">
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
          {title} <span className="count">{data.records.length}</span>
        </h3>
        {!preview && (
          <button className="button small" onClick={() => onEdit(null)}>
            <Plus size={15} />
            Add item
          </button>
        )}
      </div>
      {data.records.length > 12 && (
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
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="check-col">
                <span className="sr-only">Done</span>
              </th>
              <th>{data.version === 1 ? "Task" : "Task or activity"}</th>
              {data.version >= 2 && <th>Child</th>}
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

                  {r.source && (
                    <button
                      className="source-link"
                      aria-label="View source email"
                      onClick={onSource}
                      disabled={preview}
                    >
                      <Mail size={11} />
                    </button>
                  )}
                </td>
                {data.version >= 2 && (
                  <td>
                    <span>{r.child || "—"}</span>
                  </td>
                )}
                <td>
                  <span>{dateLabel(r.date)}</span>
                  {data.version === 3 && (
                    <small>
                      {r.time
                        ? `${timeLabel(r.time)} – ${timeLabel(r.endtime)}`
                        : ""}
                    </small>
                  )}
                </td>
                <td>
                  <span className={`person ${r.person === "Sam" ? "sam" : ""}`}>
                    {r.person || "Unassigned"}
                  </span>
                </td>
                {data.version >= 2 && (
                  <td className="backup">{r.backup || "—"}</td>
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
    children: z.array(z.union([MonthFilter.ref, Records.ref])),
  }),
  component: ({ props, renderNode }) => (
    <div className="generated">{renderNode(props.children)}</div>
  ),
});
const library = createLibrary({
  root: "AppScreen",
  components: [AppScreen, MonthFilter, Records],
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
  const [month, setMonth] = useState("all");
  const [modal, setModal] = useState("");
  const [editing, setEditing] = useState(null);
  const [viewer, setViewer] = useState("Alex");
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
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);
  function build() {
    setData({
      ...data,
      version: 1,
      fields: [...BASE_FIELDS],
      records: INITIAL_RECORDS.map((r) => ({ ...r })),
    });
  }
  function evolve() {
    const fields = [...BASE_FIELDS, ...EXTRA_FIELDS];
    setData({
      ...data,
      version: 2,
      fields,
      records: migrate(data.records, fields),
    });
    setToast("Child and backup added. Your items are kept.");
  }
  function importAll() {
    const fields = [...BASE_FIELDS, ...EXTRA_FIELDS, ...TIME_FIELDS];
    setData({
      ...data,
      version: 3,
      fields,
      records: migrate(importSemester(data.records), fields),
      attached: true,
      name: "School planner",
    });
    setModal("");
    setMonth("all");
    setToast("70 events added. School breaks included.");
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
        <a className="brand" href="./">
          make<span>.</span>
        </a>
        <a href="./deck/">
          The idea <ArrowUpRight size={15} />
        </a>
      </header>
      <main className="workspace">
        <div className="app-heading">
          <h1>{data.version === 3 ? "School planner" : "School checklist"}</h1>
          {data.version > 0 && (
            <button
              className="button secondary"
              onClick={() => setModal("share")}
            >
              <Users size={16} />
              {data.shared ? "Shared with Sam" : "Share"}
            </button>
          )}
        </div>
        <div className="actions" aria-label="Try the demo">
          <button
            className="button"
            disabled={data.version > 0}
            onClick={build}
          >
            {data.version > 0 ? <Check size={16} /> : <Plus size={16} />}Make a
            checklist
          </button>
          <button
            className="button secondary"
            disabled={!data.version || data.version >= 2}
            onClick={evolve}
          >
            {data.version >= 2 ? <Check size={16} /> : <Plus size={16} />}Add
            child & backup
          </button>
          <button
            className="button secondary"
            disabled={!data.version}
            onClick={() => setModal("email")}
          >
            <Paperclip size={16} />
            {data.attached ? "School email" : "Attach school email"}
          </button>
        </div>
        {storageError && (
          <p role="alert">Changes could not be saved in this browser.</p>
        )}
        {data.shared && (
          <div className="shared-strip">
            <span>Viewing as</span>
            {["Alex", "Sam"].map((p) => (
              <button
                key={p}
                onClick={() => setViewer(p)}
                className={viewer === p ? "active" : ""}
              >
                {p}
              </button>
            ))}
            <small>Simulated sharing</small>
          </div>
        )}
        {data.version ? (
          <Runtime.Provider value={runtime}>
            <Renderer
              library={library}
              response={programs[data.version]}
              isStreaming={false}
            />
          </Runtime.Provider>
        ) : (
          <div className="empty-workspace">
            <Table2 size={30} />
            <p>Your app goes here.</p>
          </div>
        )}
        <footer className="demo-footer">
          <span>Demo · sample AI output · edits saved here</span>
          <button className="text-button" onClick={() => setModal("reset")}>
            Reset
          </button>
        </footer>
      </main>
      {modal === "email" && (
        <Modal title="School email" onClose={() => setModal("")}>
          <p className="email-label">Fictional sample · Spring 2027</p>
          <pre className="email-body">
            {EMAIL.slice(EMAIL.indexOf("Hello Alex"), EMAIL.indexOf("Warmly,"))}
          </pre>
          <div className="modal-actions">
            <a
              className="text-button"
              href="./examples/spring-semester.eml"
              download
            >
              Download email
            </a>
            <button
              className="button"
              disabled={data.version === 3}
              onClick={importAll}
            >
              {data.version === 3 ? "Added to planner" : "Add semester to app"}
            </button>
          </div>
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
          }}
        />
      )}
      {modal === "share" && (
        <Modal title="Share with Sam" onClose={() => setModal("")}>
          <p>
            Try another family member’s view. Sharing is simulated in this demo.
          </p>
          <div className="modal-actions">
            <button
              className="button"
              onClick={() => {
                setData({ ...data, shared: !data.shared });
                setViewer("Sam");
                setModal("");
              }}
            >
              {data.shared ? "Stop sharing" : "Try Sam’s view"}
            </button>
          </div>
        </Modal>
      )}
      {modal === "reset" && (
        <Modal title="Reset this demo?" onClose={() => setModal("")}>
          <p>Your demo edits will be cleared.</p>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setModal("")}>
              Cancel
            </button>
            <button
              className="button"
              onClick={() => {
                setData(fresh());
                setModal("");
                setMonth("all");
                setViewer("Alex");
              }}
            >
              Reset demo
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
function RecordEditor({ record, fields, onClose, onSave }) {
  const [values, setValues] = useState(record || {});
  return (
    <Modal title={record ? "Edit item" : "Add item"} onClose={onClose}>
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
