import Link from "next/link";

export default function Home() {
  return (
    <main style={{ background: "var(--color-bg, #fffefb)", color: "var(--color-text, #201515)", fontFamily: "'Inter', Helvetica, Arial, sans-serif" }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        style={{
          padding: "72px 0 0",
          borderBottom: "1px solid var(--color-sand, #c5c0b1)",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="row align-items-end g-0">

            {/* ── Left copy ── */}
            <div className="col-lg-6" style={{ paddingBottom: 72, paddingRight: 48 }}>

              {/* Eyebrow */}
              <div
                className="d-inline-flex align-items-center gap-2 mb-4"
                style={{
                  background: "var(--color-light-sand, #eceae3)",
                  border: "1px solid var(--color-sand, #c5c0b1)",
                  borderRadius: 4,
                  padding: "5px 12px",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--color-accent, #ff4f00)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    color: "var(--color-charcoal, #36342e)",
                  }}
                >
                  Rental Maintenance Platform
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(2.2rem, 4vw, 3rem)",
                  fontWeight: 500,
                  lineHeight: 1.1,
                  letterSpacing: "-0.5px",
                  color: "var(--color-text, #201515)",
                  marginBottom: 20,
                }}
              >
                Property maintenance,<br />
                <span style={{ color: "var(--color-accent, #ff4f00)" }}>finally organised.</span>
              </h1>

              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: "var(--color-charcoal, #36342e)",
                  marginBottom: 32,
                  maxWidth: 440,
                }}
              >
                One platform for tenants to report issues, property managers to
                coordinate repairs, and landlords to approve work — no more
                chasing emails or missed calls.
              </p>

              <div className="d-flex gap-3 flex-wrap mb-5">
                <Link
                  href="/login"
                  className="btn"
                  style={{
                    background: "var(--color-accent, #ff4f00)",
                    color: "#fffefb",
                    border: "1px solid var(--color-accent, #ff4f00)",
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "13px 28px",
                  }}
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="btn"
                  style={{
                    background: "transparent",
                    color: "var(--color-text, #201515)",
                    border: "1px solid var(--color-sand, #c5c0b1)",
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "13px 28px",
                  }}
                >
                  Login →
                </Link>
              </div>

              {/* Social proof row */}
              <div
                className="d-flex align-items-center gap-3"
                style={{
                  paddingTop: 24,
                  borderTop: "1px solid var(--color-sand, #c5c0b1)",
                }}
              >
                {/* Avatar stack */}
                <div className="d-flex" style={{ marginRight: 4 }}>
                  {["https://i.pravatar.cc/32?img=11", "https://i.pravatar.cc/32?img=21", "https://i.pravatar.cc/32?img=31", "https://i.pravatar.cc/32?img=41"].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="user"
                      width={32}
                      height={32}
                      style={{
                        borderRadius: "50%",
                        border: "2px solid var(--color-bg, #fffefb)",
                        marginLeft: i === 0 ? 0 : -10,
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text, #201515)" }}>
                    Used by tenants & managers
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-muted, #939084)" }}>
                    across residential properties
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right image ── */}
            <div className="col-lg-6 d-none d-lg-block" style={{ position: "relative" }}>
              <div
                style={{
                  borderRadius: "12px 12px 0 0",
                  overflow: "hidden",
                  border: "1px solid var(--color-sand, #c5c0b1)",
                  borderBottom: "none",
                  position: "relative",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                  alt="Modern apartment building"
                  style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }}
                />
                {/* Floating status card */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    background: "var(--color-bg, #fffefb)",
                    border: "1px solid var(--color-sand, #c5c0b1)",
                    borderRadius: 8,
                    padding: "14px 18px",
                    minWidth: 220,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-muted, #939084)", marginBottom: 8 }}>
                    Latest Request
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text, #201515)", marginBottom: 6 }}>
                    🔧 Leaking kitchen tap
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        color: "#f59e0b",
                        borderRadius: 4,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      In Progress
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-muted, #939084)" }}>Unit 4B · 2h ago</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section
        style={{
          background: "var(--color-light-sand, #eceae3)",
          borderBottom: "1px solid var(--color-sand, #c5c0b1)",
          padding: "20px 0",
        }}
      >
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="row g-3 text-center">
            {[
              { num: "3", label: "User Roles" },
              { num: "100%", label: "Web-Based" },
              { num: "Real-Time", label: "Status Updates" },
              { num: "1", label: "Central Platform" },
            ].map(({ num, label }) => (
              <div className="col-6 col-md-3" key={label}>
                <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text, #201515)" }}>{num}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted, #939084)", letterSpacing: "0.3px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section
        style={{
          padding: "80px 0",
          borderBottom: "1px solid var(--color-sand, #c5c0b1)",
        }}
      >
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="row align-items-center g-5">

            <div className="col-lg-5">
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-muted, #939084)", marginBottom: 12 }}>
                How it works
              </p>
              <h2 style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.2, color: "var(--color-text, #201515)", marginBottom: 16 }}>
                From report to resolved — in one place
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-charcoal, #36342e)", marginBottom: 32 }}>
                No more lost messages or unclear responsibilities. Every maintenance
                request has a clear owner, a status, and a history.
              </p>

              {[
                { step: "01", text: "Tenant submits a request with photos" },
                { step: "02", text: "Property manager reviews and assigns" },
                { step: "03", text: "Landlord approves if required" },
                { step: "04", text: "Work is completed and closed out" },
              ].map(({ step, text }) => (
                <div
                  key={step}
                  className="d-flex align-items-start gap-3 mb-3"
                >
                  <div
                    style={{
                      minWidth: 32,
                      height: 32,
                      background: "var(--color-light-sand, #eceae3)",
                      border: "1px solid var(--color-sand, #c5c0b1)",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--color-charcoal, #36342e)",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {step}
                  </div>
                  <p style={{ fontSize: 15, color: "var(--color-charcoal, #36342e)", marginBottom: 0, paddingTop: 5 }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="col-lg-7">
              <div
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid var(--color-sand, #c5c0b1)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80"
                  alt="Property manager at work"
                  style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section
        style={{
          background: "var(--color-off-white, #fffdf9)",
          padding: "80px 0",
          borderBottom: "1px solid var(--color-sand, #c5c0b1)",
        }}
      >
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="text-center mb-5">
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-muted, #939084)", marginBottom: 10 }}>
              Features
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 500, color: "var(--color-text, #201515)", marginBottom: 8 }}>
              Built for the whole maintenance lifecycle
            </h2>
            <p style={{ fontSize: 15, color: "var(--color-muted, #939084)", maxWidth: 500, margin: "0 auto" }}>
              Everything you need to manage maintenance requests from start to finish.
            </p>
          </div>

          <div className="row g-3">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent,#ff4f00)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                ),
                title: "Report Issues",
                desc: "Tenants submit requests with photos, priority level, and a full description in minutes.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent,#ff4f00)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                title: "Track Progress",
                desc: "Real-time status updates at every stage — submitted, acknowledged, in progress, completed.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent,#ff4f00)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
                title: "Clear Communication",
                desc: "All parties stay informed in one place — no more back-and-forth over email or text.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent,#ff4f00)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                title: "Role-Based Access",
                desc: "Tenants, property managers, and landlords each see exactly what's relevant to them.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent,#ff4f00)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                  </svg>
                ),
                title: "Organised Dashboard",
                desc: "A clear overview of all open, in-progress, and resolved requests at a glance.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent,#ff4f00)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                ),
                title: "Approval Workflow",
                desc: "Landlords can review and approve repair quotes directly through the platform.",
              },
            ].map(({ icon, title, desc }) => (
              <div className="col-md-6 col-lg-4" key={title}>
                <div
                  style={{
                    background: "var(--color-bg, #fffefb)",
                    border: "1px solid var(--color-sand, #c5c0b1)",
                    borderRadius: 5,
                    padding: "24px",
                    height: "100%",
                  }}
                >
                  <div style={{ marginBottom: 14 }}>{icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text, #201515)", marginBottom: 6 }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-charcoal, #36342e)", margin: 0 }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          USER ROLES
      ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--color-sand, #c5c0b1)" }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="text-center mb-5">
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-muted, #939084)", marginBottom: 10 }}>
              Who it's for
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 500, color: "var(--color-text, #201515)", marginBottom: 8 }}>
              Designed for everyone involved
            </h2>
          </div>

          <div className="row g-4">
            {[
              {
                img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
                num: "01",
                title: "Tenants",
                desc: "Submit maintenance requests with photos, check on progress, and get notified when work is done — all without chasing anyone.",
              },
              {
                img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80",
                num: "02",
                title: "Property Managers",
                desc: "See every request across all properties, assign tradespeople, update statuses, and keep landlords in the loop automatically.",
              },
              {
                img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
                num: "03",
                title: "Landlords",
                desc: "Stay informed without being overwhelmed. Review requests, approve quotes, and track spend across your portfolio.",
              },
            ].map(({ img, num, title, desc }) => (
              <div className="col-md-4" key={title}>
                <div
                  style={{
                    border: "1px solid var(--color-sand, #c5c0b1)",
                    borderRadius: 8,
                    overflow: "hidden",
                    height: "100%",
                    background: "var(--color-bg, #fffefb)",
                  }}
                >
                  <img
                    src={img}
                    alt={title}
                    style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                  />
                  <div style={{ padding: "24px" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-muted, #939084)", marginBottom: 6 }}>
                      {num}
                    </p>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text, #201515)", marginBottom: 8 }}>
                      {title}
                    </h3>
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--color-charcoal, #36342e)", margin: 0 }}>
                      {desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BAND
      ══════════════════════════════════════════ */}
      <section
        style={{
          background: "var(--color-text, #201515)",
          padding: "72px 0",
        }}
      >
        <div className="container text-center" style={{ maxWidth: 640 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-muted, #939084)", marginBottom: 16 }}>
            Get started today
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 500, color: "#fffefb", marginBottom: 16, lineHeight: 1.2 }}>
            Stop managing maintenance by text message
          </h2>
          <p style={{ fontSize: 16, color: "#939084", marginBottom: 36, lineHeight: 1.6 }}>
            Log in to start submitting or managing maintenance requests on your property.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link
              href="/login"
              className="btn"
              style={{
                background: "var(--color-accent, #ff4f00)",
                color: "#fffefb",
                border: "1px solid var(--color-accent, #ff4f00)",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 15,
                padding: "13px 32px",
              }}
            >
              Login to your account
            </Link>
            <Link
              href="/register"
              className="btn"
              style={{
                background: "transparent",
                color: "#fffefb",
                border: "1px solid #36342e",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 15,
                padding: "13px 32px",
              }}
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer
        style={{
          background: "var(--color-light-sand, #eceae3)",
          borderTop: "1px solid var(--color-sand, #c5c0b1)",
          padding: "24px 0",
        }}
      >
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text, #201515)" }}>
              PropertyMaintain
            </span>
            <span style={{ fontSize: 13, color: "var(--color-muted, #939084)" }}>
              © 2026 Rental Maintenance System · COIT13232 University Prototype
            </span>
          </div>
        </div>
      </footer>

    </main>
  );
}