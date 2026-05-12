"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCurrentUser, type CurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";

type NavAction = "view" | "create" | "update" | "delete" | "approve";

type ProtectedNavLink = {
  label: string;
  href: string;
  screen?: string;
  action?: NavAction;
};

const navItems: ProtectedNavLink[] = [
  { label: "Dashboard", href: "/dashboard", screen: "dashboard", action: "view" },
  { label: "Maintenance", href: "/maintenance", screen: "maintenance", action: "view" },
  { label: "New Request", href: "/maintenance/new", screen: "maintenance", action: "create" },
  { label: "Properties", href: "/properties", screen: "properties", action: "view" },
  { label: "Approvals", href: "/approvals", screen: "approvals", action: "view" },
  { label: "Users", href: "/users", screen: "users", action: "view" },
  { label: "Profile", href: "/profile", screen: "profile", action: "view" },
];

const roleLabel: Record<CurrentUser["role"], string> = {
  tenant: "Tenant",
  landlord: "Landlord",
  property_manager: "Property Manager",
  null: "Not logged in",
};

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ProtectedAppNav({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentUser, setRole } = useCurrentUser();

  const visibleNavItems = navItems.filter((item) => {
    if (!item.screen || !item.action) {
      return true;
    }

    return hasPermission(currentUser.role, item.screen, item.action);
  });

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh", background: "#fffefb" }}>
      <header
        style={{
          background: "#fffefb",
          borderBottom: "1px solid #c5c0b1",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="d-flex align-items-center text-decoration-none" style={{ gap: "10px" }}>
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

          <div className="d-flex flex-wrap align-items-center gap-2">
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#36342e",
                background: "#eceae3",
                padding: "4px 10px",
                borderRadius: "4px",
              }}
            >
              {roleLabel[currentUser.role]}
            </span>

            <span className="small text-muted me-2">{currentUser.name}</span>

            {(["tenant", "landlord", "property_manager", "null"] as const).map((role) => (
              <button
                key={role}
                className={`btn btn-sm ${
                  currentUser.role === role ? "btn-dark" : "btn-outline-secondary"
                }`}
                type="button"
                onClick={() => setRole(role)}
              >
                {role === "property_manager" ? "PM" : role === "landlord" ? "LL" : role === "null" ? "None" : "Tenant"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="d-flex flex-grow-1">
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
            {visibleNavItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="d-flex align-items-center px-3 py-2 text-decoration-none"
                  style={{
                    color: active ? "#201515" : "#36342e",
                    fontWeight: active ? 600 : 500,
                    fontSize: "14px",
                    borderRadius: "6px",
                    background: active ? "#eceae3" : "transparent",
                    borderLeft: active ? "3px solid #ff4f00" : "3px solid transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-grow-1" style={{ padding: "32px", background: "#fffefb", minWidth: 0 }}>
          <div className="mx-auto" style={{ maxWidth: "1200px" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
