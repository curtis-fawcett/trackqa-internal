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
const OWNERS = ["", "OWNER", "QA", "FRONTEND", "BACKEND", "DESIGN", "PRODUCT"];

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
    teal: {
      background: "#042f2e",
      border: "1px solid #0f766e",
      color: "#99f6e4",
    },
    orange: {
      background: "#431407",
      border: "1px solid #c2410c",
      color: "#fdba74",
    },
    pink: {
      background: "#4a044e",
      border: "1px solid #c026d3",
      color: "#f5d0fe",
    },
    slate: {
      background: "#111827",
      border: "1px solid #374151",
      color: "#d1d5db",
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

function getTagTone(tag) {
  const tones = ["blue", "purple", "green", "teal", "orange", "pink", "slate"];
  let hash = 0;

  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  return tones[Math.abs(hash) % tones.length];
}

function getStatusTone(status) {
  switch (status) {
    case "OPEN":
      return "red";
    case "IN_PROGRESS":
      return "yellow";
    case "READY_FOR_TEST":
      return "blue";
    case "VERIFIED":
      return "green";
    case "CLOSED":
      return "purple";
    default:
      return "default";
  }
}

function getStatusSelectStyle(status) {
  const styles = {
    OPEN: {
      background: "#3f0d12",
      border: "1px solid #7f1d1d",
      color: "#fecaca",
    },
    IN_PROGRESS: {
      background: "#422006",
      border: "1px solid #92400e",
      color: "#fde68a",
    },
    READY_FOR_TEST: {
      background: "#172554",
      border: "1px solid #1d4ed8",
      color: "#bfdbfe",
    },
    VERIFIED: {
      background: "#052e2b",
      border: "1px solid #065f46",
      color: "#a7f3d0",
    },
    CLOSED: {
      background: "#2e1065",
      border: "1px solid #6d28d9",
      color: "#ddd6fe",
    },
  };

  return styles[status] || {};
}

function getStatusCardAccentStyle(status) {
  switch (status) {
    case "OPEN":
      return {
        boxShadow:
          "0 12px 28px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.02), inset 3px 0 0 #ef4444",
      };
    case "IN_PROGRESS":
      return {
        boxShadow:
          "0 12px 28px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.02), inset 3px 0 0 #f59e0b",
      };
    case "READY_FOR_TEST":
      return {
        boxShadow:
          "0 12px 28px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.02), inset 3px 0 0 #3b82f6",
      };
    case "VERIFIED":
      return {
        boxShadow:
          "0 12px 28px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.02), inset 3px 0 0 #10b981",
      };
    case "CLOSED":
      return {
        boxShadow:
          "0 12px 28px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.02), inset 3px 0 0 #8b5cf6",
      };
    default:
      return {};
  }
}

function addTimelineEntry(ticket, message) {
  const now = new Date().toISOString();

  return {
    ...ticket,
    updatedAt: now,
    timeline: [
      {
        id: crypto.randomUUID(),
        message,
        createdAt: now,
      },
      ...(ticket.timeline || []),
    ],
  };
}

function createInitialData() {
  const projectId = crypto.randomUUID();
  const now = new Date().toISOString();

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
        owner: "OWNER",
        tags: ["ui", "mobile"],
        notes: "Test on phone and desktop after deploy.",
        reproductionSteps: "",
        rootCause: "",
        resolutionSummary: "",
        qaVerification: "",
        timeline: [
          {
            id: crypto.randomUUID(),
            message: "Ticket created.",
            createdAt: now,
          },
          {
            id: crypto.randomUUID(),
            message: "Owner set to OWNER.",
            createdAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
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
        owner: "FRONTEND",
        tags: ["ui", "layout"],
        notes: "Compare desktop and mobile.",
        reproductionSteps: "",
        rootCause: "",
        resolutionSummary: "",
        qaVerification: "",
        timeline: [
          {
            id: crypto.randomUUID(),
            message: "Ticket created.",
            createdAt: now,
          },
          {
            id: crypto.randomUUID(),
            message: "Owner set to FRONTEND.",
            createdAt: now,
          },
          {
            id: crypto.randomUUID(),
            message: "Status changed from OPEN to IN PROGRESS.",
            createdAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        projectId,
        title: "Verify Open Graph preview image",
        description: "Check LinkedIn and other previews after metadata updates.",
        type: "BUG",
        status: "READY_FOR_TEST",
        priority: "HIGH",
        owner: "QA",
        tags: ["seo", "social"],
        notes: "Retest after deployment.",
        reproductionSteps: "",
        rootCause: "",
        resolutionSummary: "",
        qaVerification: "",
        timeline: [
          {
            id: crypto.randomUUID(),
            message: "Ticket created.",
            createdAt: now,
          },
          {
            id: crypto.randomUUID(),
            message: "Owner set to QA.",
            createdAt: now,
          },
          {
            id: crypto.randomUUID(),
            message: "Status changed from OPEN to READY FOR TEST.",
            createdAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

function ProjectCard({ project, isSelected, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...projectButtonStyle,
        ...(isSelected ? projectButtonActiveStyle : {}),
        ...(isHovered ? projectButtonHoverStyle : {}),
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
}

function TicketCard({
  ticket,
  status,
  navigate,
  onRequestDelete,
  moveTicket,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...ticketCardStyle,
        ...(isHovered ? ticketCardHoverStyle : {}),
        ...(isHovered ? getStatusCardAccentStyle(ticket.status) : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            cursor: "pointer",
          }}
          onClick={() => navigate(`/ticket/${ticket.id}`)}
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
          onClick={() => onRequestDelete(ticket)}
          style={deleteButtonStyle}
          type="button"
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
        <Badge tone={getTypeTone(ticket.type)}>{formatLabel(ticket.type)}</Badge>
        <Badge tone={getPriorityTone(ticket.priority)}>
          {formatLabel(ticket.priority)}
        </Badge>
        <Badge tone={getStatusTone(ticket.status)}>
          {formatLabel(ticket.status)}
        </Badge>
        {ticket.owner && <Badge tone="blue">{formatLabel(ticket.owner)}</Badge>}
        {(ticket.tags || []).map((tag) => (
          <Badge key={tag} tone={getTagTone(tag)}>
            #{tag}
          </Badge>
        ))}
      </div>

      {ticket.description && (
        <p
          style={{
            marginTop: 8,
            fontSize: 13,
            color: "#94a3b8",
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
              opacity: status === STATUSES[0] ? 0.45 : 1,
              cursor: status === STATUSES[0] ? "not-allowed" : "pointer",
            }}
            type="button"
          >
            ← Back
          </button>

          <button
            onClick={() => moveTicket(ticket.id, 1)}
            disabled={status === STATUSES[STATUSES.length - 1]}
            style={{
              ...smallButtonStyle,
              opacity: status === STATUSES[STATUSES.length - 1] ? 0.45 : 1,
              cursor:
                status === STATUSES[STATUSES.length - 1]
                  ? "not-allowed"
                  : "pointer",
            }}
            type="button"
          >
            Forward →
          </button>
        </div>

        <div style={{ fontSize: 12, color: "#64748b" }}>
          {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : ""}
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  isOpen,
  ticketTitle,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalCardStyle}>
        <p style={eyebrowStyle}>Delete Ticket</p>

        <h3 style={{ margin: "10px 0 0", color: "#f8fafc", fontSize: 24 }}>
          Are you sure?
        </h3>

        <p style={{ margin: "12px 0 0", color: "#94a3b8", lineHeight: 1.6 }}>
          This will permanently remove{" "}
          <span style={{ color: "#f8fafc", fontWeight: 700 }}>
            {ticketTitle || "this ticket"}
          </span>{" "}
          from TrackQA.
        </p>

        <div style={modalButtonRowStyle}>
          <button type="button" onClick={onCancel} style={secondaryButtonStyle}>
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={dangerButtonStyle}
          >
            Delete Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
    owner: "",
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
        try {
          setData(JSON.parse(stored));
        } catch {
          // ignore invalid localStorage data
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        // ignore invalid localStorage data
      }
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
        ticket.owner,
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

    let newTicket = {
      id: crypto.randomUUID(),
      projectId: selectedProjectId,
      title: ticketForm.title.trim(),
      description: ticketForm.description.trim(),
      type: ticketForm.type,
      status: ticketForm.status,
      priority: ticketForm.priority,
      owner: ticketForm.owner,
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

    newTicket = addTimelineEntry(newTicket, "Ticket created.");

    if (ticketForm.owner) {
      newTicket = addTimelineEntry(
        newTicket,
        `Owner set to ${formatLabel(ticketForm.owner)}.`
      );
    }

    if (ticketForm.status !== "OPEN") {
      newTicket = addTimelineEntry(
        newTicket,
        `Status set to ${formatLabel(ticketForm.status)} during creation.`
      );
    }

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
      owner: "",
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

    const previousStatus = ticket.status;
    const nextStatus = STATUSES[nextIndex];

    setData((current) => ({
      ...current,
      tickets: current.tickets.map((item) => {
        if (item.id !== ticketId) return item;

        return addTimelineEntry(
          {
            ...item,
            status: nextStatus,
          },
          `Status changed from ${formatLabel(previousStatus)} to ${formatLabel(
            nextStatus
          )}.`
        );
      }),
    }));
  }

  function requestDeleteTicket(ticket) {
    setDeleteTarget(ticket);
  }

  function confirmDeleteTicket() {
    if (!deleteTarget) return;

    setData((current) => ({
      ...current,
      tickets: current.tickets.filter((ticket) => ticket.id !== deleteTarget.id),
    }));

    setDeleteTarget(null);
  }

  function cancelDeleteTicket() {
    setDeleteTarget(null);
  }

  function resetDemoData() {
    const confirmed = window.confirm("Reset all TrackQA data?");
    if (!confirmed) return;

    const initial = createInitialData();
    setData(initial);
    setSelectedProjectId(initial.projects[0]?.id || "");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    setShowNewTicket(false);
    setDeleteTarget(null);
  }

  const searchHasNoMatches =
    search.trim().length > 0 && filteredTickets.length === 0;

  return (
    <>
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
                      style={{
                        margin: "8px 0 0",
                        color: "#94a3b8",
                        maxWidth: 760,
                      }}
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
                          <ProjectCard
                            key={project.id}
                            project={project}
                            isSelected={isSelected}
                            onClick={() => setSelectedProjectId(project.id)}
                          />
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
                            label="Owned"
                            value={filteredTickets.filter((t) => t.owner).length}
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
                          gap: 12,
                          flexWrap: "wrap",
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
                              style={{
                                ...inputStyle,
                                ...getStatusSelectStyle(ticketForm.status),
                              }}
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

                          <select
                            value={ticketForm.owner}
                            onChange={(e) =>
                              setTicketForm((current) => ({
                                ...current,
                                owner: e.target.value,
                              }))
                            }
                            style={inputStyle}
                          >
                            <option value="">Unassigned</option>
                            {OWNERS.filter(Boolean).map((owner) => (
                              <option key={owner} value={owner}>
                                {formatLabel(owner)}
                              </option>
                            ))}
                          </select>

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

                        <div style={searchSectionStyle}>
                          <div style={searchBoxWrapperStyle}>
                            <input
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Search tickets"
                              style={searchInputStyle}
                            />
                          </div>
                        </div>
                      </div>

                      {searchHasNoMatches && (
                        <div style={searchEmptyStateStyle}>
                          No tickets matched your search for{" "}
                          <span style={{ color: "#f8fafc", fontWeight: 700 }}>
                            {search}
                          </span>
                          .
                        </div>
                      )}

                      <div style={kanbanWrapperStyle}>
                        <div style={kanbanGridStyle}>
                          {STATUSES.map((status) => {
                            const tickets = filteredTickets.filter(
                              (ticket) => ticket.status === status
                            );

                            return (
                              <div key={status} style={kanbanColumnStyle}>
                                <div
                                  style={{
                                    ...kanbanColumnHeaderStyle,
                                    ...getStatusHeaderAccentStyle(status),
                                  }}
                                >
                                  <div
                                    style={{ fontWeight: 700, color: "#f8fafc" }}
                                  >
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
                                      <TicketCard
                                        key={ticket.id}
                                        ticket={ticket}
                                        status={status}
                                        navigate={navigate}
                                        onRequestDelete={requestDeleteTicket}
                                        moveTicket={moveTicket}
                                      />
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

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        ticketTitle={deleteTarget?.title}
        onCancel={cancelDeleteTicket}
        onConfirm={confirmDeleteTicket}
      />
    </>
  );
}

function TicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? JSON.parse(stored) : null;
  const ticket = parsed?.tickets?.find((item) => item.id === id);

  const [statusDraft, setStatusDraft] = useState(ticket?.status || "OPEN");
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

  function saveField(field, value, label) {
    if (!parsed) return;

    const originalTicket = parsed.tickets.find((item) => item.id === id);
    if (!originalTicket) return;

    const previousValue =
      typeof originalTicket[field] === "string"
        ? originalTicket[field].trim()
        : originalTicket[field] || "";

    const nextValue =
      typeof value === "string" ? value.trim() : value || "";

    setSaveStatus("saving");

    const updatedData = {
      ...parsed,
      tickets: parsed.tickets.map((item) => {
        if (item.id !== id) return item;

        let updatedTicket = {
          ...item,
          [field]: value,
          updatedAt: new Date().toISOString(),
        };

        if (previousValue !== nextValue) {
          updatedTicket = addTimelineEntry(updatedTicket, `${label} updated.`);
        }

        return updatedTicket;
      }),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

    setTimeout(() => {
      setSaveStatus("saved");
    }, 200);

    setTimeout(() => {
      setSaveStatus("idle");
    }, 1500);
  }

  function saveStatusChange() {
    if (!parsed) return;

    const originalTicket = parsed.tickets.find((item) => item.id === id);
    if (!originalTicket) return;

    const previousStatus = originalTicket.status;
    const nextStatus = statusDraft;

    setSaveStatus("saving");

    const updatedData = {
      ...parsed,
      tickets: parsed.tickets.map((item) => {
        if (item.id !== id) return item;

        let updatedTicket = {
          ...item,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };

        if (previousStatus !== nextStatus) {
          updatedTicket = addTimelineEntry(
            updatedTicket,
            `Status changed from ${formatLabel(previousStatus)} to ${formatLabel(
              nextStatus
            )}.`
          );
        }

        return updatedTicket;
      }),
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
        <div style={ticketPagePanelStyle}>
          <button
            onClick={() => navigate("/")}
            style={{ ...secondaryButtonStyle, marginBottom: 16 }}
            type="button"
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

            <Badge tone={getStatusTone(ticket.status)}>
              {formatLabel(ticket.status)}
            </Badge>

            {ticket.owner && <Badge tone="blue">{formatLabel(ticket.owner)}</Badge>}

            {(ticket.tags || []).map((tag) => (
              <Badge key={tag} tone={getTagTone(tag)}>
                #{tag}
              </Badge>
            ))}
          </div>

          <p
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "#94a3b8",
              lineHeight: 1.6,
            }}
          >
            {ticket.description || "No description provided."}
          </p>

          <div style={ticketMetaRowStyle}>
            <div style={ticketMetaCardStyle}>
              <div style={metaLabelStyle}>Created</div>
              <div style={metaValueStyle}>
                {ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleString()
                  : "—"}
              </div>
            </div>

            <div style={ticketMetaCardStyle}>
              <div style={metaLabelStyle}>Last Updated</div>
              <div style={metaValueStyle}>
                {ticket.updatedAt
                  ? new Date(ticket.updatedAt).toLocaleString()
                  : "—"}
              </div>
            </div>
          </div>

          <hr style={{ margin: "24px 0", border: "1px solid #1e293b" }} />

          <div style={editorSectionStyle}>
            <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700, margin: 0 }}>
              Owner
            </p>

            <div style={{ ...readonlyInfoCardStyle, marginTop: 10 }}>
              <div style={metaLabelStyle}>Created By / Owner</div>
              <div style={readonlyInfoValueStyle}>
                {ticket.owner ? formatLabel(ticket.owner) : "Unassigned"}
              </div>
            </div>
          </div>

          <div style={editorSectionStyle}>
            <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700, margin: 0 }}>
              Status
            </p>

            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              style={{
                ...inputStyle,
                ...getStatusSelectStyle(statusDraft),
                marginTop: 10,
              }}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={saveStatusChange}
              style={{ ...secondaryButtonStyle, marginTop: 12 }}
            >
              Save Status
            </button>
          </div>

          <EditorSection
            title="Notes"
            value={notesDraft}
            onChange={setNotesDraft}
            onSave={() => saveField("notes", notesDraft, "Notes")}
            placeholder="Add notes..."
            buttonLabel="Save Notes"
          />

          <EditorSection
            title="Reproduction Steps"
            value={reproductionStepsDraft}
            onChange={setReproductionStepsDraft}
            onSave={() =>
              saveField(
                "reproductionSteps",
                reproductionStepsDraft,
                "Reproduction steps"
              )
            }
            placeholder="Add reproduction steps..."
            buttonLabel="Save Reproduction Steps"
          />

          <EditorSection
            title="Root Cause"
            value={rootCauseDraft}
            onChange={setRootCauseDraft}
            onSave={() => saveField("rootCause", rootCauseDraft, "Root cause")}
            placeholder="Add root cause analysis..."
            buttonLabel="Save Root Cause"
          />

          {["READY_FOR_TEST", "VERIFIED", "CLOSED"].includes(ticket.status) && (
            <EditorSection
              title="Resolution Summary"
              value={resolutionSummaryDraft}
              onChange={setResolutionSummaryDraft}
              onSave={() =>
                saveField(
                  "resolutionSummary",
                  resolutionSummaryDraft,
                  "Resolution summary"
                )
              }
              placeholder="Add resolution summary..."
              buttonLabel="Save Resolution Summary"
            />
          )}

          {["VERIFIED", "CLOSED"].includes(ticket.status) && (
            <EditorSection
              title="QA Verification"
              value={qaVerificationDraft}
              onChange={setQaVerificationDraft}
              onSave={() =>
                saveField(
                  "qaVerification",
                  qaVerificationDraft,
                  "QA verification"
                )
              }
              placeholder="Add QA verification details..."
              buttonLabel="Save QA Verification"
            />
          )}

          <div style={activityLogSectionStyle}>
            <div style={activityLogHeaderStyle}>
              <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700, margin: 0 }}>
                Activity Log
              </p>
              <span style={activityCountStyle}>
                {(ticket.timeline || []).length} event
                {(ticket.timeline || []).length === 1 ? "" : "s"}
              </span>
            </div>

            {ticket.timeline?.length ? (
              <div style={timelineListStyle}>
                {ticket.timeline.map((entry) => (
                  <div key={entry.id} style={timelineItemStyle}>
                    <div style={timelineDotStyle} />
                    <div style={timelineContentStyle}>
                      <div style={timelineMessageStyle}>{entry.message}</div>
                      <div style={timelineDateStyle}>
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={searchEmptyStateStyle}>No activity yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorSection({
  title,
  value,
  onChange,
  onSave,
  placeholder,
  buttonLabel,
}) {
  return (
    <div style={editorSectionStyle}>
      <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700, margin: 0 }}>
        {title}
      </p>

      <textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, marginTop: 10, resize: "vertical" }}
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={onSave}
        style={{ ...secondaryButtonStyle, marginTop: 12 }}
      >
        {buttonLabel}
      </button>
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

function getStatusHeaderAccentStyle(status) {
  switch (status) {
    case "OPEN":
      return {
        boxShadow: "inset 0 -1px 0 #1e293b, inset 0 3px 0 #ef4444",
      };
    case "IN_PROGRESS":
      return {
        boxShadow: "inset 0 -1px 0 #1e293b, inset 0 3px 0 #f59e0b",
      };
    case "READY_FOR_TEST":
      return {
        boxShadow: "inset 0 -1px 0 #1e293b, inset 0 3px 0 #3b82f6",
      };
    case "VERIFIED":
      return {
        boxShadow: "inset 0 -1px 0 #1e293b, inset 0 3px 0 #10b981",
      };
    case "CLOSED":
      return {
        boxShadow: "inset 0 -1px 0 #1e293b, inset 0 3px 0 #8b5cf6",
      };
    default:
      return {};
  }
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
  padding: "28px 40px 40px",
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
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
  minWidth: 0,
  boxSizing: "border-box",
};

const ticketPagePanelStyle = {
  ...panelStyle,
  maxWidth: 1100,
  margin: "0 auto",
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
  outline: "none",
};

const searchInputStyle = {
  ...inputStyle,
  maxWidth: 320,
  border: "none",
  background: "transparent",
  padding: "8px 10px",
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

const dangerButtonStyle = {
  border: "1px solid #b91c1c",
  background: "#7f1d1d",
  color: "#fee2e2",
  padding: "10px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
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
  transition: "transform 0.18s ease, box-shadow 0.18s ease, border 0.18s ease",
};

const projectButtonActiveStyle = {
  border: "1px solid #10b981",
  background: "#052e2b",
  boxShadow: "0 0 0 1px rgba(16,185,129,0.14) inset",
};

const projectButtonHoverStyle = {
  transform: "translateY(-2px)",
  border: "1px solid #334155",
  boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
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
  paddingBottom: 10,
  marginBottom: 8,
};

const searchSectionStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  minWidth: 0,
};

const searchBoxWrapperStyle = {
  padding: 8,
  borderRadius: 16,
  background: "linear-gradient(180deg, #0b1220 0%, #0a1120 100%)",
  border: "1px solid #1e293b",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
};

const searchEmptyStateStyle = {
  marginBottom: 14,
  padding: 14,
  borderRadius: 14,
  border: "1px solid #1e293b",
  background: "#020617",
  color: "#94a3b8",
};

const kanbanWrapperStyle = {
  overflowX: "auto",
  paddingTop: 6,
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
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
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
  boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset",
  transition: "transform 0.18s ease, box-shadow 0.18s ease, border 0.18s ease",
};

const ticketCardHoverStyle = {
  transform: "translateY(-3px)",
  border: "1px solid #334155",
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

const ticketMetaRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 18,
};

const ticketMetaCardStyle = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 14,
};

const metaLabelStyle = {
  fontSize: 12,
  textTransform: "uppercase",
  color: "#64748b",
  marginBottom: 6,
};

const metaValueStyle = {
  fontSize: 14,
  color: "#e2e8f0",
};

const editorSectionStyle = {
  marginTop: 24,
};

const readonlyInfoCardStyle = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 14,
};

const readonlyInfoValueStyle = {
  fontSize: 15,
  color: "#f8fafc",
  fontWeight: 600,
};

const activityLogSectionStyle = {
  marginTop: 30,
  paddingTop: 22,
  borderTop: "1px solid #1e293b",
};

const activityLogHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 16,
};

const activityCountStyle = {
  fontSize: 12,
  color: "#94a3b8",
  border: "1px solid #334155",
  background: "#0f172a",
  padding: "6px 10px",
  borderRadius: 999,
};

const timelineListStyle = {
  display: "grid",
  gap: 14,
};

const timelineItemStyle = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  padding: 14,
  borderRadius: 16,
  border: "1px solid #1e293b",
  background: "#020617",
};

const timelineDotStyle = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "#10b981",
  marginTop: 6,
  flexShrink: 0,
  boxShadow: "0 0 0 4px rgba(16,185,129,0.10)",
};

const timelineContentStyle = {
  minWidth: 0,
};

const timelineMessageStyle = {
  color: "#e2e8f0",
  fontSize: 14,
  lineHeight: 1.5,
};

const timelineDateStyle = {
  marginTop: 6,
  color: "#64748b",
  fontSize: 12,
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2, 6, 23, 0.78)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  zIndex: 1000,
};

const modalCardStyle = {
  width: "100%",
  maxWidth: 520,
  background: "rgba(15, 23, 42, 0.98)",
  border: "1px solid #1e293b",
  borderRadius: 22,
  padding: 24,
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  boxSizing: "border-box",
};

const modalButtonRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 24,
  flexWrap: "wrap",
};

export default App;