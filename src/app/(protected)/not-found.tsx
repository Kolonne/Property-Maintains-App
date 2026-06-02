import Link from "next/link";

export default function ProtectedNotFound() {
  return (
    <section
      className="d-flex flex-column align-items-start"
      style={{ maxWidth: "640px" }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.6px",
          textTransform: "uppercase",
          color: "#ff4f00",
          marginBottom: "12px",
        }}
      >
        404
      </div>

      <h1
        style={{
          fontSize: "32px",
          fontWeight: 600,
          color: "#201515",
          marginBottom: "8px",
        }}
      >
        Page not found
      </h1>

      <p style={{ fontSize: "16px", color: "#939084", marginBottom: "24px" }}>
        The protected page you are looking for does not exist or is not available
        in this prototype yet.
      </p>

      <div className="d-flex flex-wrap gap-2">
        <Link
          href="/dashboard"
          className="btn"
          style={{
            background: "#ff4f00",
            color: "#fffefb",
            border: "1px solid #ff4f00",
            borderRadius: "4px",
            fontWeight: 600,
            padding: "10px 18px",
          }}
        >
          Back to Dashboard
        </Link>

        <Link
          href="/maintenance"
          className="btn"
          style={{
            background: "#eceae3",
            color: "#36342e",
            border: "1px solid #c5c0b1",
            borderRadius: "4px",
            fontWeight: 600,
            padding: "10px 18px",
          }}
        >
          View Maintenance
        </Link>
      </div>
    </section>
  );
}
