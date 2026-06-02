import Link from "next/link";

const roles = [
  {
    title: "Tenants",
    description:
      "Submit maintenance requests, add supporting evidence, and follow progress without chasing scattered emails.",
    icon: <TenantIcon />,
    accent: "#ff4f00",
  },
  {
    title: "Property Managers",
    description:
      "Triage incoming requests, prioritise urgent issues, update statuses, and keep communication organised.",
    icon: <ManagerIcon />,
    accent: "#7d8a6a",
  },
  {
    title: "Landlords",
    description:
      "Review relevant maintenance issues, see request details, and approve repair actions when required.",
    icon: <LandlordIcon />,
    accent: "#a8593e",
  },
];

const features = [
  "Centralised maintenance request tracking",
  "Role-based dashboards",
  "Clear status updates",
  "Evidence and photo upload support",
  "Landlord approval workflow",
  "Searchable maintenance records",
];

export default function Home() {
  return (
    <main style={{ background: "#fffefb", color: "#201515" }}>
      <section
        className="container"
        style={{
          minHeight: "calc(100vh - 76px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          alignItems: "center",
          gap: "42px",
          paddingTop: "64px",
          paddingBottom: "54px",
        }}
      >
        <div>
          <p
            style={{
              color: "#ff4f00",
              fontSize: "13px",
              fontWeight: 750,
              letterSpacing: 0,
              marginBottom: "14px",
              textTransform: "uppercase",
            }}
          >
            COIT13232 property maintenance prototype
          </p>
          <h1
            style={{
              color: "#201515",
              fontSize: "56px",
              fontWeight: 700,
              lineHeight: 1,
              marginBottom: "20px",
              maxWidth: "720px",
            }}
          >
            Rental maintenance, made clearer.
          </h1>
          <p
            style={{
              color: "#36342e",
              fontSize: "20px",
              lineHeight: 1.6,
              marginBottom: "28px",
              maxWidth: "620px",
            }}
          >
            Submit, manage, and track property maintenance requests in one
            central place for tenants, property managers, and landlords.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Link
              href="/login"
              className="btn"
              style={{
                background: "#ff4f00",
                border: "1px solid #ff4f00",
                borderRadius: "999px",
                boxShadow: "0 12px 26px rgba(255, 79, 0, 0.18)",
                color: "#fffefb",
                fontWeight: 750,
                padding: "11px 20px",
              }}
            >
              Log in
            </Link>
            <Link
              href="#roles"
              className="btn"
              style={{
                background: "#fffefb",
                border: "1px solid #c5c0b1",
                borderRadius: "999px",
                color: "#36342e",
                fontWeight: 700,
                padding: "11px 20px",
              }}
            >
              Learn more
            </Link>
          </div>
        </div>

        <div aria-label="Maintenance request dashboard preview">
          <div
            style={{
              background: "#eceae3",
              border: "1px solid #c5c0b1",
              borderRadius: "8px",
              boxShadow: "0 24px 60px rgba(32, 21, 21, 0.12)",
              overflow: "hidden",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-between"
              style={{
                background: "#201515",
                color: "#fffefb",
                padding: "16px 18px",
              }}
            >
              <div>
                <div style={{ fontSize: "13px", color: "#c5c0b1" }}>
                  Maintenance queue
                </div>
                <div style={{ fontSize: "20px", fontWeight: 700 }}>
                  12 active requests
                </div>
              </div>
              <span
                style={{
                  background: "#ff4f00",
                  borderRadius: "999px",
                  color: "#fffefb",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "7px 11px",
                }}
              >
                Live status
              </span>
            </div>
            <div style={{ padding: "18px" }}>
              <PreviewRow
                title="Kitchen sink leak"
                meta="Unit 4B, submitted by tenant"
                status="Urgent"
                accent="#ff4f00"
              />
              <PreviewRow
                title="Air conditioner not cooling"
                meta="Awaiting landlord approval"
                status="Approval"
                accent="#a8593e"
              />
              <PreviewRow
                title="Bathroom light flickering"
                meta="Assigned to property manager"
                status="In progress"
                accent="#7d8a6a"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="container" style={{ padding: "40px 0 72px" }}>
        <SectionHeading
          eyebrow="Built for each role"
          title="One shared maintenance workflow"
          body="Each user sees the information and actions that matter to them, while the request history stays in one transparent system."
        />

        <div className="row g-3">
          {roles.map((role) => (
            <div className="col-md-4" key={role.title}>
              <article
                className="h-100"
                style={{
                  background: "#fffefb",
                  border: "1px solid #c5c0b1",
                  borderRadius: "8px",
                  padding: "22px",
                  boxShadow: "0 10px 24px rgba(32, 21, 21, 0.05)",
                }}
              >
                <div
                  className="d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    background: "#fffdf9",
                    border: `1px solid ${role.accent}`,
                    borderRadius: "8px",
                    color: role.accent,
                    height: "44px",
                    width: "44px",
                  }}
                >
                  {role.icon}
                </div>
                <h2 style={{ fontSize: "21px", fontWeight: 700, marginBottom: "10px" }}>
                  {role.title}
                </h2>
                <p style={{ color: "#36342e", lineHeight: 1.6, margin: 0 }}>
                  {role.description}
                </p>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "#eceae3", borderTop: "1px solid #c5c0b1", borderBottom: "1px solid #c5c0b1" }}>
        <div className="container" style={{ padding: "70px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "28px",
              alignItems: "start",
            }}
          >
            <div>
              <p style={{ color: "#ff4f00", fontSize: "13px", fontWeight: 750, letterSpacing: 0, textTransform: "uppercase" }}>
                The problem
              </p>
              <h2 style={{ fontSize: "34px", fontWeight: 700, marginBottom: "14px" }}>
                Maintenance gets messy when updates live everywhere.
              </h2>
              <p style={{ color: "#36342e", fontSize: "17px", lineHeight: 1.7, margin: 0 }}>
                Requests can disappear into emails, tenants may not know what is
                happening, property managers juggle scattered messages, and
                landlords often only see an issue when approval is needed.
              </p>
            </div>
            <div
              style={{
                background: "#fffefb",
                border: "1px solid #c5c0b1",
                borderLeft: "4px solid #ff4f00",
                borderRadius: "8px",
                padding: "24px",
              }}
            >
              <p style={{ color: "#7d8a6a", fontSize: "13px", fontWeight: 750, letterSpacing: 0, textTransform: "uppercase" }}>
                The solution
              </p>
              <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "14px" }}>
                A central maintenance log with role-based access.
              </h2>
              <p style={{ color: "#36342e", fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
                Property Maintains brings requests, statuses, supporting photos,
                approvals, and records into one place so everyone can see the
                right information at the right time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: "72px 0" }}>
        <SectionHeading
          eyebrow="Feature highlights"
          title="Designed around the maintenance request lifecycle"
          body="The prototype focuses on the core flow from submission through triage, approval, and status tracking."
        />

        <div className="row g-3">
          {features.map((feature, index) => (
            <div className="col-sm-6 col-lg-4" key={feature}>
              <div
                className="h-100 d-flex align-items-start gap-3"
                style={{
                  background: "#fffefb",
                  border: "1px solid #c5c0b1",
                  borderRadius: "8px",
                  padding: "18px",
                }}
              >
                <span
                  style={{
                    background: index % 2 === 0 ? "#ff4f00" : "#201515",
                    borderRadius: "999px",
                    color: "#fffefb",
                    flex: "0 0 auto",
                    fontSize: "12px",
                    fontWeight: 750,
                    height: "28px",
                    lineHeight: "28px",
                    textAlign: "center",
                    width: "28px",
                  }}
                >
                  {index + 1}
                </span>
                <p style={{ color: "#201515", fontWeight: 650, lineHeight: 1.45, margin: 0 }}>
                  {feature}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div style={{ marginBottom: "28px", maxWidth: "760px" }}>
      <p
        style={{
          color: "#ff4f00",
          fontSize: "13px",
          fontWeight: 750,
          letterSpacing: 0,
          marginBottom: "10px",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </p>
      <h2 style={{ fontSize: "34px", fontWeight: 700, marginBottom: "12px" }}>
        {title}
      </h2>
      <p style={{ color: "#36342e", fontSize: "17px", lineHeight: 1.7, margin: 0 }}>
        {body}
      </p>
    </div>
  );
}

function PreviewRow({
  title,
  meta,
  status,
  accent,
}: {
  title: string;
  meta: string;
  status: string;
  accent: string;
}) {
  return (
    <div
      className="d-flex align-items-center justify-content-between gap-3 mb-3"
      style={{
        background: "#fffefb",
        border: "1px solid #c5c0b1",
        borderLeft: `4px solid ${accent}`,
        borderRadius: "8px",
        padding: "14px",
      }}
    >
      <div>
        <div style={{ color: "#201515", fontWeight: 700 }}>{title}</div>
        <div style={{ color: "#939084", fontSize: "13px", marginTop: "2px" }}>
          {meta}
        </div>
      </div>
      <span
        style={{
          border: `1px solid ${accent}`,
          borderRadius: "999px",
          color: accent,
          fontSize: "11px",
          fontWeight: 750,
          padding: "5px 9px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </span>
    </div>
  );
}

function TenantIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function ManagerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
      <path d="M18 16v4" />
      <path d="M16 18h4" />
    </svg>
  );
}

function LandlordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M4 21h16" />
      <path d="M9 7h1" />
      <path d="M14 7h1" />
      <path d="M9 11h1" />
      <path d="M14 11h1" />
      <path d="M10 21v-5h4v5" />
    </svg>
  );
}