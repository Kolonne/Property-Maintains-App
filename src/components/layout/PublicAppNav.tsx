import Link from "next/link";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about_us" },
  { label: "Contact", href: "/contact" },
];

export default function PublicAppNav() {
  return (
    <header
      style={{
        background: "#fffefb",
        borderBottom: "1px solid #c5c0b1",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <nav className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 py-3">
        <div className="d-flex flex-wrap align-items-center gap-4">
          <Link
            href="/"
            className="d-flex align-items-center text-decoration-none"
            style={{ gap: "10px" }}
          >
            <span
              style={{
                width: "28px",
                height: "28px",
                background: "#ff4f00",
                borderRadius: "6px",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#201515" }}>
              Property Maintains
            </span>
          </Link>

          <div className="d-flex align-items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-decoration-none"
                style={{
                  color: "#36342e",
                  fontSize: "14px",
                  fontWeight: 500,
                  borderRadius: "6px",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="d-flex align-items-center">
          <Link
            href="/login"
            className="btn btn-sm"
            style={{
              background: "#ff4f00",
              color: "#fffefb",
              border: "1px solid #ff4f00",
              borderRadius: "6px",
              fontWeight: 600,
              padding: "6px 14px",
            }}
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
