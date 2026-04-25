export default function Home() {
  return (
    <main className="container py-5">
      <h1 className="display-5 mb-3">Property Maintains App</h1>
      <p className="lead text-muted">
        COIT13232 Group Project — Rental Maintenance Management Application.
      </p>
      <hr />
      <p>
        Database health check:{" "}
        <a href="/api/health" className="link-primary">
          /api/health
        </a>
      </p>
    </main>
  );
}
