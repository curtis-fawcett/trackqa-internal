import { useNavigate } from "react-router-dom";
import Section from "./components/Section";
import { trackqaContent } from "./data/content";

function StatPill({ label, value }) {
  return (
    <div
      style={{
        background: "rgba(2, 6, 23, 0.9)",
        border: "1px solid #1e293b",
        borderRadius: 16,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#64748b",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 24,
          fontWeight: 800,
          color: "#f8fafc",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ImageCard({ src, alt }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(2,6,23,0.98) 100%)",
        border: "1px solid #1e293b",
        borderRadius: 22,
        padding: 14,
        boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          display: "block",
          borderRadius: 14,
          border: "1px solid #1e293b",
        }}
      />
    </div>
  );
}

function SplitCard({ title, items, accent }) {
  return (
    <div
      style={{
        background: "rgba(2, 6, 23, 0.88)",
        border: "1px solid #1e293b",
        borderRadius: 22,
        padding: 22,
        boxShadow: `inset 0 3px 0 ${accent}`,
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 16,
          color: "#f8fafc",
          fontSize: 24,
        }}
      >
        {title}
      </h3>

      <ul style={{ margin: 0, paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function TrackQA() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(16,185,129,0.16), transparent 24%), radial-gradient(circle at 85% 20%, rgba(59,130,246,0.10), transparent 22%), #020617",
        color: "#e2e8f0",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "32px 24px 64px",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => navigate("/")}
          type="button"
          style={{
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#cbd5e1",
            padding: "10px 14px",
            borderRadius: 12,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          ← Back to TrackQA
        </button>

        <section
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.94) 0%, rgba(2,6,23,0.96) 100%)",
            border: "1px solid #1e293b",
            borderRadius: 28,
            padding: "36px 28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#10b981",
            }}
          >
            SaaS Case Study
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 0.9fr",
              gap: 24,
              alignItems: "start",
              marginTop: 14,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 46,
                  lineHeight: 1.05,
                  color: "#f8fafc",
                }}
              >
                {trackqaContent.title}
              </h1>

              <p
                style={{
                  marginTop: 18,
                  maxWidth: 760,
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: "#94a3b8",
                }}
              >
                {trackqaContent.overview}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 18,
                }}
              >
                {trackqaContent.tech.map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: "1px solid #334155",
                      background: "#0f172a",
                      color: "#cbd5e1",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <StatPill label="Workflow" value="5 Stages" />
              <StatPill label="Storage" value="Local" />
              <StatPill label="Routing" value="Multi-Page" />
              <StatPill label="Focus" value="QA Ops" />
            </div>
          </div>
        </section>

        <Section
          title="System Architecture"
          subtitle="A lightweight frontend-first architecture focused on speed, clarity, and a clean workflow."
        >
          <ImageCard
            src="/case-studies/trackqa/architecture.png"
            alt="TrackQA architecture"
          />

          <div
            style={{
              marginTop: 20,
              background: "rgba(2, 6, 23, 0.75)",
              border: "1px solid #1e293b",
              borderRadius: 20,
              padding: 22,
            }}
          >
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
              {trackqaContent.architecture.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          title="Before vs After Workflow"
          subtitle="TrackQA replaced informal QA tracking with a more structured and traceable internal workflow."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 18,
            }}
          >
            <SplitCard title="Before" items={trackqaContent.before} accent="#ef4444" />
            <SplitCard title="After" items={trackqaContent.after} accent="#10b981" />
          </div>
        </Section>

        <Section
          title="User Interface"
          subtitle="A dark, operational dashboard experience designed for quick scanning, ticket detail access, and traceable QA activity."
        >
          <div style={{ display: "grid", gap: 18 }}>
            <ImageCard
              src="/case-studies/trackqa/dashboard.png"
              alt="TrackQA dashboard"
            />
            <ImageCard
              src="/case-studies/trackqa/ticket-view.png"
              alt="TrackQA ticket view"
            />
            <ImageCard
              src="/case-studies/trackqa/activity-log.png"
              alt="TrackQA activity log"
            />
          </div>
        </Section>

        <Section
          title="Problem"
          subtitle="The project started with a very practical internal issue: QA work was happening, but the system around it was inconsistent."
        >
          <div
            style={{
              background: "rgba(2, 6, 23, 0.78)",
              border: "1px solid #1e293b",
              borderRadius: 22,
              padding: 22,
            }}
          >
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
              {trackqaContent.problem.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          title="Solution"
          subtitle="The app was designed to bring structure, ownership, and visibility to internal QA work without adding unnecessary complexity."
        >
          <div
            style={{
              background: "rgba(2, 6, 23, 0.78)",
              border: "1px solid #1e293b",
              borderRadius: 22,
              padding: 22,
            }}
          >
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
              {trackqaContent.solution.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          title="Impact"
          subtitle="Even as an internal tool, TrackQA demonstrates product thinking, workflow design, and scalable frontend architecture decisions."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {trackqaContent.impact.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(2, 6, 23, 0.88)",
                  border: "1px solid #1e293b",
                  borderRadius: 18,
                  padding: 18,
                  color: "#cbd5e1",
                  lineHeight: 1.7,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Project Links"
          subtitle="This case study is backed by the working internal app and source code."
        >
          <div
            style={{
              background: "rgba(2, 6, 23, 0.88)",
              border: "1px solid #1e293b",
              borderRadius: 22,
              padding: 22,
            }}
          >
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
              <li>GitHub Repository: Private internal repository available upon request</li>
              <li>Live Demo: Internal tool, not publicly deployed</li>
            </ul>
          </div>
        </Section>
      </div>
    </div>
  );
}