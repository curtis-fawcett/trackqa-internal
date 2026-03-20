export default function Section({ title, subtitle, children }) {
  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ marginBottom: 14 }}>
        <h2
          style={{
            fontSize: 34,
            lineHeight: 1.1,
            color: "#f8fafc",
            margin: 0,
          }}
        >
          {title}
        </h2>

        {subtitle ? (
          <p
            style={{
              margin: "10px 0 0",
              color: "#94a3b8",
              lineHeight: 1.7,
              maxWidth: 780,
              fontSize: 16,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      <div
        style={{
          color: "#94a3b8",
        }}
      >
        {children}
      </div>
    </section>
  );
}