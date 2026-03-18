import { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

const STORAGE_KEY = "trackqa-data-v2";

const STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "READY_FOR_TEST",
  "VERIFIED",
  "CLOSED",
];

const TYPES = ["BUG", "REFACTOR", "TECH_DEBT", "PERFORMANCE"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function parseTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatLabel(value) {
  return value.replaceAll("_", " ");
}

function Badge({ children, tone = "default" }) {
  const tones = {
    default: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#cbd5e1",
    },
    red: {
      background: "#3f0d12",
      border: "1px solid #7f1d1d",
      color: "#fecaca",
    },
    green: {
      background: "#052e2b",
      border: "1px solid #065f46",
      color: "#a7f3d0",
    },
    yellow: {
      background: "#422006",
      border: "1px solid #92400e",
      color: "#fde68a",
    },
    blue: {
      background: "#172554",
      border: "1px solid #1d4ed8",
      color: "#bfdbfe",
    },
    purple: {
      background: "#2e1065",
      border: "1px solid #6d28d9",
      color: "#ddd6fe",
    },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}

function getTypeTone(type) {
  switch (type) {
    case "BUG":
      return "red";
    case "REFACTOR":
      return "green";
    case "TECH_DEBT":
      return "purple";
    case "PERFORMANCE":
      return "blue";
    default:
      return "default";
  }
}

function getPriorityTone(priority) {
  switch (priority) {
    case "HIGH":
      return "yellow";
    case "CRITICAL":
      return "red";
    default:
      return "default";
  }
}

function createInitialData() {
  const projectId = crypto.randomUUID();

  return {
    projects: [
      {
        id: projectId,
        name: "BackendRescue Website",
        description: "Internal tasks, fixes, and QA checks for the website.",
      },
    ],
    tickets: [
      {
        id: crypto.randomUUID(),
        projectId,
        title: "Review mobile navigation behavior",
        description:
          "Check menu open/close behavior and spacing on smaller screens.",
        type: "BUG",
        status: "OPEN",
        priority: "MEDIUM",
        tags: ["ui", "mobile"],
        notes: "Test on phone and desktop after deploy.",
        reproductionSteps: "",
        rootCause: "",
        resolutionSummary: "",
        qaVerification: "",
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        projectId,
        title: "Refine hero section spacing",
        description:
          "Tighten spacing and improve visual balance in the hero area.",
        type: "REFACTOR",
        status: "IN_PROGRESS",
        priority: "LOW",
        tags: ["ui", "layout"],
        notes: "Compare desktop and mobile.",
        reproductionSteps: "",
        rootCause: "",
        resolutionSummary: "",
        qaVerification: "",
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        projectId,
        title: "Verify Open Graph preview image",
        description: "Check LinkedIn and other previews after metadata updates.",
        type: "BUG",
        status: "READY_FOR_TEST",
        priority: "HIGH",
        tags: ["seo", "social"],
        notes: "Retest after deployment.",
        reproductionSteps: "",
        rootCause: "",
        resolutionSummary: "",
        qaVerification: "",
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
}

function App() {
  const [showNewTicket, setShowNewTicket] = useState(false);

  const [data, setData] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return createInitialData();
      }
    }
    return createInitialData();
  });

  const [selectedProjectId, setSelectedProjectId] = useState(
    () => data.projects[0]?.id || ""
  );

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
  });

  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    type: "BUG",
    status: "OPEN",
    priority: "MEDIUM",
    tagsInput: "",
    notes: "",
    reproductionSteps: "",
    rootCause: "",
    resolutionSummary: "",
    qaVerification: "",
  });

  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!selectedProjectId && data.projects.length > 0) {
      setSelectedProjectId(data.projects[0].id);
    }
  }, [data.projects, selectedProjectId]);

  useEffect(() => {
    const handleFocus = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, [location.pathname]);

  const selectedProject = useMemo(
    () =>
      data.projects.find((project) => project.id === selectedProjectId) || null,
    [data.projects, selectedProjectId]
  );

  const filteredTickets = useMemo(() => {
    return data.tickets.filter((ticket) => {
      if (ticket.projectId !== selectedProjectId) return false;

      const haystack = [
        ticket.title,
        ticket.description,
        ticket.notes,
        ticket.type,
        ticket.priority,
        ...(ticket.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search.toLowerCase());
    });
  }, [data.tickets, search, selectedProjectId]);

  function handleCreateProject(event) {
    event.preventDefault();
    if (!projectForm.name.trim()) return;

    const newProject = {
      id: crypto.randomUUID(),
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
    };

    setData((current) => ({
      ...current,
      projects: [...current.projects, newProject],
    }));

    setSelectedProjectId(newProject.id);
    setProjectForm({ name: "", description: "" });
  }

  function handleCreateTicket(event) {
    event.preventDefault();
    if (!selectedProjectId || !ticketForm.title.trim()) return;

    const now = new Date().toISOString();

    const newTicket = {
      id: crypto.randomUUID(),
      projectId: selectedProjectId,
      title: ticketForm.title.trim(),
      description: ticketForm.description.trim(),
      type: ticketForm.type,
      status: ticketForm.status,
      priority: ticketForm.priority,
      tags: parseTags(ticketForm.tagsInput),
      notes: ticketForm.notes.trim(),
      reproductionSteps: ticketForm.reproductionSteps.trim(),
      rootCause: ticketForm.rootCause.trim(),
      resolutionSummary: ticketForm.resolutionSummary.trim(),
      qaVerification: ticketForm.qaVerification.trim(),
      timeline: [],
      createdAt: now,
      updatedAt: now,
    };

    setData((current) => ({
      ...current,
      tickets: [newTicket, ...current.tickets],
    }));

    setTicketForm({
      title: "",
      description: "",
      type: "BUG",
      status: "OPEN",
      priority: "MEDIUM",
      tagsInput: "",
      notes: "",
      reproductionSteps: "",
      rootCause: "",
      resolutionSummary: "",
      qaVerification: "",
    });

    setShowNewTicket(false);
  }

  function moveTicket(ticketId, direction) {
    const ticket = data.tickets.find((item) => item.id === ticketId);
    if (!ticket) return;

    const currentIndex = STATUSES.indexOf(ticket.status);
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= STATUSES.length) return;

    setData((current) => ({
      ...current,
      tickets: current.tickets.map((item) =>
        item.id === ticketId
          ? {
              ...item,
              status: STATUSES[nextIndex],
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    }));
  }

  function deleteTicket(ticketId) {
    setData((current) => ({
      ...current,
      tickets: current.tickets.filter((ticket) => ticket.id !== ticketId),
    }));
  }

  function resetDemoData() {
    const confirmed = window.confirm("Reset all TrackQA data?");
    if (!confirmed) return;

    const initial = createInitialData();
    setData(initial);
    setSelectedProjectId(initial.projects[0]?.id || "");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    setShowNewTicket(false);
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={appShellStyle}>
            <div style={pageContainerStyle}>
              <header style={headerStyle}>
                <div>
                  <p style={eyebrowStyle}>Internal QA Workspace</p>
                  <h1
                    style={{ margin: "8px 0 0", fontSize: 48, color: "#f8fafc" }}
                  >
                    TrackQA
                  </h1>
                  <p
                    style={{ margin: "8px 0 0", color: "#94a3b8", maxWidth: 760 }}
                  >
                    A dark internal dashboard for tracking bugs, refactors,
                    technical debt, performance issues, and regression-related QA
                    work.
                  </p>
                </div>

                <button onClick={resetDemoData} style={secondaryButtonStyle}>
                  Reset Demo Data
                </button>
              </header>

              <div style={layoutStyle}>
                <aside style={sidebarStyle}>
                  <h2 style={panelHeadingStyle}>Projects</h2>

                  <div style={{ display: "grid", gap: 10 }}>
                    {data.projects.map((project) => {
                      const isSelected = project.id === selectedProjectId;

                      return (
                        <button
                          key={project.id}
                          onClick={() => setSelectedProjectId(project.id)}
                          style={{
                            ...projectButtonStyle,
                            ...(isSelected ? projectButtonActiveStyle : {}),
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>{project.name}</div>
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 13,
                              color: "#94a3b8",
                            }}
                          >
                            {project.description || "No description"}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <h3 style={subHeadingStyle}>New Project</h3>

                    <form
                      onSubmit={handleCreateProject}
                      style={{ display: "grid", gap: 10 }}
                    >
                      <input
                        value={projectForm.name}
                        onChange={(e) =>
                          setProjectForm((current) => ({
                            ...current,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Project name"
                        style={inputStyle}
                      />

                      <textarea
                        rows={3}
                        value={projectForm.description}
                        onChange={(e) =>
                          setProjectForm((current) => ({
                            ...current,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Short description"
                        style={{ ...inputStyle, resize: "vertical" }}
                      />

                      <button type="submit" style={primaryButtonStyle}>
                        Add Project
                      </button>
                    </form>
                  </div>
                </aside>

                <main style={{ minWidth: 0 }}>
                  <section style={panelStyle}>
                    <div style={topSectionRowStyle}>
                      <div>
                        <p style={eyebrowStyle}>Current Project</p>
                        <h2 style={{ margin: "8px 0 0", color: "#f8fafc" }}>
                          {selectedProject
                            ? selectedProject.name
                            : "No project selected"}
                        </h2>
                        <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>
                          {selectedProject?.description ||
                            "Select a project to begin."}
                        </p>
                      </div>

                      <div style={statsGridStyle}>
                        <StatCard label="Total" value={filteredTickets.length} />
                        <StatCard
                          label="Open"
                          value={
                            filteredTickets.filter((t) => t.status !== "CLOSED")
                              .length
                          }
                        />
                        <StatCard
                          label="Critical"
                          value={
                            filteredTickets.filter(
                              (t) => t.priority === "CRITICAL"
                            ).length
                          }
                        />
                        <StatCard
                          label="Tags"
                          value={
                            new Set(filteredTickets.flatMap((t) => t.tags || []))
                              .size
                          }
                        />
                      </div>
                    </div>
                  </section>

                  <section style={{ ...panelStyle, marginTop: 24 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3 style={{ ...panelHeadingStyle, margin: 0 }}>
                        New Ticket
                      </h3>

                      <button
                        type="button"
                        onClick={() => setShowNewTicket((prev) => !prev)}
                        style={secondaryButtonStyle}
                      >
                        {showNewTicket ? "Close" : "New Ticket"}
                      </button>
                    </div>

                    {showNewTicket && (
                      <form
                        onSubmit={handleCreateTicket}
                        style={{ display: "grid", gap: 12, marginTop: 16 }}
                      >
                        <div style={ticketFormGridStyle}>
                          <input
                            value={ticketForm.title}
                            onChange={(e) =>
                              setTicketForm((current) => ({
                                ...current,
                                title: e.target.value,
                              }))
                            }
                            placeholder="Ticket title"
                            style={inputStyle}
                          />

                          <select
                            value={ticketForm.type}
                            onChange={(e) =>
                              setTicketForm((current) => ({
                                ...current,
                                type: e.target.value,
                              }))
                            }
                            style={inputStyle}
                          >
                            {TYPES.map((type) => (
                              <option key={type} value={type}>
                                {formatLabel(type)}
                              </option>
                            ))}
                          </select>

                          <select
                            value={ticketForm.status}
                            onChange={(e) =>
                              setTicketForm((current) => ({
                                ...current,
                                status: e.target.value,
                              }))
                            }
                            style={inputStyle}
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {formatLabel(status)}
                              </option>
                            ))}
                          </select>

                          <select
                            value={ticketForm.priority}
                            onChange={(e) =>
                              setTicketForm((current) => ({
                                ...current,
                                priority: e.target.value,
                              }))
                            }
                            style={inputStyle}
                          >
                            {PRIORITIES.map((priority) => (
                              <option key={priority} value={priority}>
                                {formatLabel(priority)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <textarea
                          rows={3}
                          value={ticketForm.description}
                          onChange={(e) =>
                            setTicketForm((current) => ({
                              ...current,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Describe the issue, task, or QA check"
                          style={{ ...inputStyle, resize: "vertical" }}
                        />

                        <input
                          value={ticketForm.tagsInput}
                          onChange={(e) =>
                            setTicketForm((current) => ({
                              ...current,
                              tagsInput: e.target.value,
                            }))
                          }
                          placeholder="Tags (comma separated: api, auth, ui)"
                          style={inputStyle}
                        />

                        <textarea
                          rows={3}
                          value={ticketForm.notes}
                          onChange={(e) =>
                            setTicketForm((current) => ({
                              ...current,
                              notes: e.target.value,
                            }))
                          }
                          placeholder="Internal notes"
                          style={{ ...inputStyle, resize: "vertical" }}
                        />

                        <textarea
                          rows={3}
                          value={ticketForm.reproductionSteps}
                          onChange={(e) =>
                            setTicketForm((current) => ({
                              ...current,
                              reproductionSteps: e.target.value,
                            }))
                          }
                          placeholder="Reproduction steps"
                          style={{ ...inputStyle, resize: "vertical" }}
                        />

                        <textarea
                          rows={3}
                          value={ticketForm.rootCause}
                          onChange={(e) =>
                            setTicketForm((current) => ({
                              ...current,
                              rootCause: e.target.value,
                            }))
                          }
                          placeholder="Root cause"
                          style={{ ...inputStyle, resize: "vertical" }}
                        />

                        <textarea
                          rows={3}
                          value={ticketForm.resolutionSummary}
                          onChange={(e) =>
                            setTicketForm((current) => ({
                              ...current,
                              resolutionSummary: e.target.value,
                            }))
                          }
                          placeholder="Resolution summary"
                          style={{ ...inputStyle, resize: "vertical" }}
                        />

                        <textarea
                          rows={3}
                          value={ticketForm.qaVerification}
                          onChange={(e) =>
                            setTicketForm((current) => ({
                              ...current,
                              qaVerification: e.target.value,
                            }))
                          }
                          placeholder="QA verification"
                          style={{ ...inputStyle, resize: "vertical" }}
                        />

                        <button type="submit" style={primaryButtonStyle}>
                          Add Ticket
                        </button>
                      </form>
                    )}
                  </section>

                  <section style={{ ...panelStyle, marginTop: 24 }}>
                    <div style={filtersRowStyle}>
                      <h3 style={{ ...panelHeadingStyle, margin: 0 }}>Kanban</h3>

                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tickets"
                        style={{ ...inputStyle, maxWidth: 320 }}
                      />
                    </div>

                    <div style={kanbanWrapperStyle}>
                      <div style={kanbanGridStyle}>
                        {STATUSES.map((status) => {
                          const tickets = filteredTickets.filter(
                            (ticket) => ticket.status === status
                          );

                          return (
                            <div key={status} style={kanbanColumnStyle}>
                              <div style={kanbanColumnHeaderStyle}>
                                <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                                  {formatLabel(status)}
                                </div>
                                <div style={{ fontSize: 12, color: "#64748b" }}>
                                  {tickets.length} ticket
                                  {tickets.length === 1 ? "" : "s"}
                                </div>
                              </div>

                              <div style={{ display: "grid", gap: 12 }}>
                                {tickets.length === 0 ? (
                                  <div style={emptyColumnStyle}>No tickets</div>
                                ) : (
                                  tickets.map((ticket) => (
                                    <div key={ticket.id} style={ticketCardStyle}>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          gap: 8,
                                        }}
                                      >
                                        <div
                                          style={{
                                            flex: 1,
                                            minWidth: 0,
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            navigate(`/ticket/${ticket.id}`)
                                          }
                                        >
                                          <textarea
                                            rows={2}
                                            value={ticket.title}
                                            readOnly
                                            style={{
                                              ...ticketTitleInputStyle,
                                              resize: "none",
                                              overflow: "hidden",
                                            }}
                                          />
                                        </div>

                                        <button
                                          onClick={() => deleteTicket(ticket.id)}
                                          style={deleteButtonStyle}
                                        >
                                          Delete
                                        </button>
                                      </div>

                                      <div
                                        style={{
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: 8,
                                          marginTop: 10,
                                        }}
                                      >
                                        <Badge tone={getTypeTone(ticket.type)}>
                                          {formatLabel(ticket.type)}
                                        </Badge>
                                        <Badge tone={getPriorityTone(ticket.priority)}>
                                          {formatLabel(ticket.priority)}
                                        </Badge>
                                        {(ticket.tags || []).map((tag) => (
                                          <Badge key={tag}>#{tag}</Badge>
                                        ))}
                                      </div>

                                      {ticket.description && (
                                        <p
                                          style={{
                                            marginTop: 8,
                                            fontSize: 13,
                                            color: "#64748b",
                                            lineHeight: 1.5,
                                          }}
                                        >
                                          {ticket.description}
                                        </p>
                                      )}

                                      <div style={ticketFooterRowStyle}>
                                        <div style={{ display: "flex", gap: 8 }}>
                                          <button
                                            onClick={() => moveTicket(ticket.id, -1)}
                                            disabled={status === STATUSES[0]}
                                            style={{
                                              ...smallButtonStyle,
                                              opacity:
                                                status === STATUSES[0] ? 0.45 : 1,
                                              cursor:
                                                status === STATUSES[0]
                                                  ? "not-allowed"
                                                  : "pointer",
                                            }}
                                          >
                                            ← Back
                                          </button>

                                          <button
                                            onClick={() => moveTicket(ticket.id, 1)}
                                            disabled={
                                              status ===
                                              STATUSES[STATUSES.length - 1]
                                            }
                                            style={{
                                              ...smallButtonStyle,
                                              opacity:
                                                status ===
                                                STATUSES[STATUSES.length - 1]
                                                  ? 0.45
                                                  : 1,
                                              cursor:
                                                status ===
                                                STATUSES[STATUSES.length - 1]
                                                  ? "not-allowed"
                                                  : "pointer",
                                            }}
                                          >
                                            Forward →
                                          </button>
                                        </div>

                                        <div
                                          style={{ fontSize: 12, color: "#64748b" }}
                                        >
                                          {ticket.updatedAt
                                            ? new Date(
                                                ticket.updatedAt
                                              ).toLocaleDateString()
                                            : ""}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                </main>
              </div>
            </div>
          </div>
        }
      />

      <Route path="/ticket/:id" element={<TicketPage />} />
    </Routes>
  );
}

function TicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? JSON.parse(stored) : null;
  const ticket = parsed?.tickets?.find((ticket) => ticket.id === id);

  const [notesDraft, setNotesDraft] = useState(ticket?.notes || "");
  const [reproductionStepsDraft, setReproductionStepsDraft] = useState(
    ticket?.reproductionSteps || ""
  );
  const [rootCauseDraft, setRootCauseDraft] = useState(ticket?.rootCause || "");
  const [resolutionSummaryDraft, setResolutionSummaryDraft] = useState(
    ticket?.resolutionSummary || ""
  );
  const [qaVerificationDraft, setQaVerificationDraft] = useState(
    ticket?.qaVerification || ""
  );
  const [saveStatus, setSaveStatus] = useState("idle");

  function saveField(field, value) {
    setSaveStatus("saving");

    const updatedData = {
      ...parsed,
      tickets: parsed.tickets.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

    setTimeout(() => {
      setSaveStatus("saved");
    }, 200);

    setTimeout(() => {
      setSaveStatus("idle");
    }, 1500);
  }

  if (!ticket) {
    return (
      <div style={appShellStyle}>
        <div style={pageContainerStyle}>
          <div style={panelStyle}>
            <p style={eyebrowStyle}>Ticket Workspace</p>
            <h1 style={{ margin: "8px 0 0", fontSize: 36, color: "#f8fafc" }}>
              Ticket Not Found
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={appShellStyle}>
      <div style={pageContainerStyle}>
        <div style={panelStyle}>
          <button
            onClick={() => navigate("/")}
            style={{ ...secondaryButtonStyle, marginBottom: 16 }}
          >
            ← Back to Dashboard
          </button>

          <p style={eyebrowStyle}>Ticket Workspace</p>

          <h1 style={{ margin: "8px 0 0", fontSize: 36, color: "#f8fafc" }}>
            {ticket.title}
          </h1>

          <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved ✓"}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone={getTypeTone(ticket.type)}>
              {formatLabel(ticket.type)}
            </Badge>

            <Badge tone={getPriorityTone(ticket.priority)}>
              {formatLabel(ticket.priority)}
            </Badge>

            {(ticket.tags || []).map((tag) => (
              <Badge key={tag}>#{tag}</Badge>
            ))}
          </div>

          <p style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
            {ticket.description || "No description provided."}
          </p>

          <hr style={{ margin: "20px 0", border: "1px solid #1e293b" }} />

          <div style={{ marginTop: 24 }}>
            <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700 }}>
              Notes
            </p>

            <textarea
              rows={5}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              style={{ ...inputStyle, marginTop: 8, resize: "vertical" }}
              placeholder="Add notes..."
            />

            <button
              type="button"
              onClick={() => saveField("notes", notesDraft)}
              style={{ ...secondaryButtonStyle, marginTop: 12 }}
            >
              Save Notes
            </button>
          </div>

          <div style={{ marginTop: 24 }}>
            <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700 }}>
              Reproduction Steps
            </p>

            <textarea
              rows={5}
              value={reproductionStepsDraft}
              onChange={(e) => setReproductionStepsDraft(e.target.value)}
              style={{ ...inputStyle, marginTop: 8, resize: "vertical" }}
              placeholder="Add reproduction steps..."
            />

            <button
              type="button"
              onClick={() =>
                saveField("reproductionSteps", reproductionStepsDraft)
              }
              style={{ ...secondaryButtonStyle, marginTop: 12 }}
            >
              Save Reproduction Steps
            </button>
          </div>

          <div style={{ marginTop: 24 }}>
            <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700 }}>
              Root Cause
            </p>

            <textarea
              rows={5}
              value={rootCauseDraft}
              onChange={(e) => setRootCauseDraft(e.target.value)}
              style={{ ...inputStyle, marginTop: 8, resize: "vertical" }}
              placeholder="Add root cause analysis..."
            />

            <button
              type="button"
              onClick={() => saveField("rootCause", rootCauseDraft)}
              style={{ ...secondaryButtonStyle, marginTop: 12 }}
            >
              Save Root Cause
            </button>
          </div>

          {["READY_FOR_TEST", "VERIFIED", "CLOSED"].includes(ticket.status) && (
            <div style={{ marginTop: 24 }}>
              <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700 }}>
                Resolution Summary
              </p>

              <textarea
                rows={5}
                value={resolutionSummaryDraft}
                onChange={(e) => setResolutionSummaryDraft(e.target.value)}
                style={{ ...inputStyle, marginTop: 8, resize: "vertical" }}
                placeholder="Add resolution summary..."
              />

              <button
                type="button"
                onClick={() =>
                  saveField("resolutionSummary", resolutionSummaryDraft)
                }
                style={{ ...secondaryButtonStyle, marginTop: 12 }}
              >
                Save Resolution Summary
              </button>
            </div>
          )}

          {["VERIFIED", "CLOSED"].includes(ticket.status) && (
            <div style={{ marginTop: 24 }}>
              <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700 }}>
                QA Verification
              </p>
              <textarea
                rows={5}
                value={qaVerificationDraft}
                onChange={(e) => setQaVerificationDraft(e.target.value)}
                style={{ ...inputStyle, marginTop: 8, resize: "vertical" }}
                placeholder="Add QA verification details..."
              />

              <button
                type="button"
                onClick={() => saveField("qaVerification", qaVerificationDraft)}
                style={{ ...secondaryButtonStyle, marginTop: 12 }}
              >
                Save QA Verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <div
        style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 30,
          fontWeight: 700,
          color: "#f8fafc",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const appShellStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(16,185,129,0.10), transparent 30%), #020617",
  color: "#e2e8f0",
  fontFamily: "Inter, system-ui, sans-serif",
};

const pageContainerStyle = {
  width: "100%",
  padding: "24px 40px",
  boxSizing: "border-box",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
  flexWrap: "wrap",
};

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "300px 1fr",
  gap: 24,
  alignItems: "start",
  width: "100%",
};

const panelStyle = {
  background: "rgba(15, 23, 42, 0.88)",
  border: "1px solid #1e293b",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
  minWidth: 0,
  boxSizing: "border-box",
};

const sidebarStyle = {
  ...panelStyle,
  position: "sticky",
  top: 24,
};

const panelHeadingStyle = {
  marginTop: 0,
  fontSize: 18,
  color: "#f8fafc",
};

const subHeadingStyle = {
  marginTop: 0,
  fontSize: 16,
  color: "#f8fafc",
};

const eyebrowStyle = {
  margin: 0,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#10b981",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#020617",
  color: "#e2e8f0",
  fontSize: 14,
  boxSizing: "border-box",
  minWidth: 0,
};

const primaryButtonStyle = {
  border: "none",
  background: "#10b981",
  color: "#022c22",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#cbd5e1",
  padding: "10px 14px",
  borderRadius: 12,
  cursor: "pointer",
};

const smallButtonStyle = {
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#cbd5e1",
  padding: "8px 10px",
  borderRadius: 10,
  fontSize: 12,
};

const deleteButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#f87171",
  cursor: "pointer",
  fontSize: 12,
  padding: 0,
  whiteSpace: "nowrap",
};

const projectButtonStyle = {
  width: "100%",
  textAlign: "left",
  border: "1px solid #1e293b",
  background: "#0f172a",
  color: "#e2e8f0",
  borderRadius: 14,
  padding: 12,
  cursor: "pointer",
};

const projectButtonActiveStyle = {
  border: "1px solid #10b981",
  background: "#052e2b",
};

const statCardStyle = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 14,
  minWidth: 0,
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 12,
  flex: 1,
  minWidth: 0,
};

const topSectionRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  alignItems: "center",
};

const ticketFormGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const filtersRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const kanbanWrapperStyle = {
  overflowX: "auto",
  paddingBottom: 8,
};

const kanbanGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(280px, 1fr))",
  gap: 16,
  alignItems: "start",
  minWidth: 1480,
};

const kanbanColumnStyle = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 14,
  minHeight: 300,
  boxSizing: "border-box",
};

const kanbanColumnHeaderStyle = {
  marginBottom: 14,
  paddingBottom: 10,
  borderBottom: "1px solid #1e293b",
};

const emptyColumnStyle = {
  border: "1px dashed #334155",
  borderRadius: 14,
  padding: 18,
  color: "#64748b",
  textAlign: "center",
};

const ticketCardStyle = {
  border: "1px solid #1e293b",
  background: "#0f172a",
  borderRadius: 16,
  padding: 14,
  boxSizing: "border-box",
};

const ticketTitleInputStyle = {
  width: "100%",
  padding: 0,
  border: "none",
  background: "transparent",
  color: "#f8fafc",
  fontSize: 16,
  fontWeight: 700,
  outline: "none",
  minWidth: 0,
  lineHeight: 1.4,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
};

const ticketFooterRowStyle = {
  marginTop: 14,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

export default App;