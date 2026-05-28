import Link from "next/link";
import type { ReactNode } from "react";
import type { UserRole } from "@/lib/types";

export interface SidebarLink {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
}

interface DashboardShellProps {
  user: { name: string; role: UserRole };
  sidebarLinks: SidebarLink[];
  children: ReactNode;
}

const ROLE_LABEL: Record<UserRole, string> = {
  tenant: "Tenant",
  property_manager: "Property Manager",
  landlord: "Landlord",
};

export function DashboardShell({ user, sidebarLinks, children }: DashboardShellProps) {
  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh", background: "#fffefb" }}>

      {/* navbar */}
      <header
        style={{
          background: "#fffefb",
          borderBottom: "1px solid #c5c0b1",
          height: "64px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="container-fluid h-100 d-flex align-items-center justify-content-between px-4">
          <Link href="/" className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ width: "28px", height: "28px", background: "#ff4f00", borderRadius: "6px", display: "inline-block" }} />
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#201515" }}>PropMaintain</span>
          </Link>

          <div className="d-flex align-items-center" style={{ gap: "16px" }}>
            <span
              className="d-none d-md-inline"
              style={{
                fontSize: "12px", fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.5px", color: "#36342e", background: "#eceae3",
                padding: "4px 10px", borderRadius: "4px",
              }}
            >
              {ROLE_LABEL[user.role]}
            </span>
            <span style={{ fontSize: "14px", color: "#201515", fontWeight: 500 }}>
              {user.name}
            </span>
            <Link
              href="/logout"
              className="btn btn-sm"
              style={{
                background: "#eceae3", color: "#36342e",
                border: "1px solid #c5c0b1", borderRadius: "6px",
                fontWeight: 600, fontSize: "14px",
              }}
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <div className="d-flex flex-grow-1">

        {/* sidebar - hidden on mobile */}
        <aside
          className="d-none d-md-flex flex-column flex-shrink-0"
          style={{
            width: "240px",
            background: "#fffdf9",
            borderRight: "1px solid #c5c0b1",
            padding: "24px 16px",
          }}
        >
          <nav className="d-flex flex-column" style={{ gap: "4px" }}>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="d-flex align-items-center px-3 py-2"
                style={{
                  color: link.active ? "#201515" : "#36342e",
                  fontWeight: link.active ? 600 : 500,
                  fontSize: "14px",
                  gap: "12px",
                  borderRadius: "6px",
                  background: link.active ? "#eceae3" : "transparent",
                  borderLeft: link.active ? "3px solid #ff4f00" : "3px solid transparent",
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* main content */}
        <main className="flex-grow-1" style={{ padding: "32px", background: "#fffefb", minWidth: 0 }}>
          <div className="mx-auto" style={{ maxWidth: "1200px" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
