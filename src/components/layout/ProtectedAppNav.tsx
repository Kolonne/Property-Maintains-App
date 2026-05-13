"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useCurrentUser, type CurrentUser } from "@/context/UserContext";
import { hasPermission } from "@/lib/permissions";
import type { DevUser, DevUserRole, DevUsersByRole } from "@/lib/queries/users";

type NavAction = "view" | "create" | "update" | "delete" | "approve";

type ProtectedNavLink = {
  label: string;
  href: string;
  screen?: string;
  action?: NavAction;
  exactMatch?: boolean;
  roles?: CurrentUser["role"][];
};

const navItems: ProtectedNavLink[] = [
  { label: "Dashboard", href: "/dashboard", screen: "dashboard", action: "view", exactMatch: true },
  { label: "Maintenance", href: "/maintenance", screen: "maintenance", action: "view" },
  { label: "New Request", href: "/maintenance/new", screen: "maintenance", action: "create", exactMatch: true },
  { label: "Shared Documents", href: "/profile", screen: "condition_reports", action: "view", roles: ["tenant"] },
  { label: "Properties", href: "/properties", screen: "properties", action: "view" },
  { label: "Quotes", href: "/quotes", screen: "quotes", action: "view" },
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

const emptyUsersByRole: DevUsersByRole = {
  tenant: [],
  landlord: [],
  property_manager: [],
};

const devUserGroups: Array<{
  label: string;
  role: DevUserRole;
  placeholder: string;
}> = [
    { label: "Tenant", role: "tenant", placeholder: "Select tenant user" },
    { label: "Landlord", role: "landlord", placeholder: "Select landlord user" },
    {
      label: "Property Manager",
      role: "property_manager",
      placeholder: "Select property manager",
    },
  ];

function isActivePath(pathname: string, item: ProtectedNavLink) {
  if (item.exactMatch) {
    return pathname === item.href;
  }

  if (item.href === "/maintenance") {
    return pathname === "/maintenance" || /^\/maintenance\/(?!new$).+/.test(pathname);
  }

  if (item.href === "/dashboard") {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function ProtectedAppNav({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentUser, setRole, setCurrentUser } = useCurrentUser();
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [devUsers, setDevUsers] = useState<DevUsersByRole>(emptyUsersByRole);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDevUsers() {
      try {
        const response = await fetch("/api/dev/users");

        if (!response.ok) {
          throw new Error("Failed to load dev users");
        }

        const result = (await response.json()) as DevUsersByRole;

        if (isMounted) {
          setDevUsers(result);
        }
      } catch {
        if (isMounted) {
          setUsersError("Unable to load users");
        }
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    }

    loadDevUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleSelectDevUser(role: DevUserRole, userId: string) {
    const selectedUser = devUsers[role].find(
      (user) => user.id === Number(userId)
    );

    if (!selectedUser) {
      return;
    }

    setCurrentUser(selectedUser);
    setDevMenuOpen(false);
  }

  function getSelectedValue(role: DevUserRole) {
    return currentUser.role === role && currentUser.id !== null
      ? String(currentUser.id)
      : "";
  }

  const visibleNavItems = navItems.filter((item) => {
    if (item.roles && !item.roles.includes(currentUser.role)) {
      return false;
    }

    if (!item.screen || !item.action) {
      return true;
    }

    return hasPermission(currentUser.role, item.screen, item.action);
  });
  const currentPageTitle =
    visibleNavItems.find((item) => isActivePath(pathname, item))?.label ?? "Dashboard";

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#faf7f3" }}>
      <aside
        className="d-none d-md-flex flex-column flex-shrink-0"
        style={{
          width: "252px",
          background: "#ffffff",
          borderRight: "1px solid #e8e2da",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="d-flex align-items-center"
          style={{
            borderBottom: "1px solid #e8e2da",
            gap: "12px",
            minHeight: "78px",
            padding: "20px 28px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Link href="/dashboard" className="d-flex align-items-center text-decoration-none" style={{ gap: "12px" }}>
            <span
              style={{
                color: "#f97316",
                display: "inline-flex",
              }}
            >
              <i className="bi bi-house-door" style={{ fontSize: "38px", lineHeight: 1 }} aria-hidden="true" />
            </span>
            <span className="d-flex flex-column">
              <span style={{ color: "#111827", fontSize: "23px", fontWeight: 850, lineHeight: 1 }}>
                Home<span style={{ color: "#f97316" }}>Clear</span>
              </span>
              <span style={{ color: "#1f2933", fontSize: "10px", fontWeight: 600, lineHeight: 1.2 }}>
                Maintenance Made Clearer
              </span>
            </span>
          </Link>
        </div>

        <nav className="d-flex flex-column" style={{ gap: "8px", padding: "20px 16px", position: "relative", zIndex: 1 }}>
          {visibleNavItems.map((item) => {
            const active = isActivePath(pathname, item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="d-flex align-items-center text-decoration-none"
                style={{
                  background: active ? "#fff1e7" : "transparent",
                  borderLeft: active ? "3px solid #f97316" : "3px solid transparent",
                  borderRadius: "0 8px 8px 0",
                  color: active ? "#f97316" : "#374151",
                  fontSize: "14px",
                  fontWeight: active ? 750 : 600,
                  gap: "13px",
                  minHeight: "50px",
                  padding: "0 13px",
                }}
              >
                <NavIcon label={item.label} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.96) 12%, rgba(255,255,255,0.55) 34%, rgba(255,255,255,0.42) 66%, rgba(255,255,255,0.98) 100%), linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.64) 45%, rgba(255,255,255,0.18) 100%), url('/images/dashbaord/sidebar-home.png')",
            backgroundPosition: "center bottom",
            backgroundSize: "cover",
            bottom: "60px",
            height: "470px",
            left: 0,
            opacity: 0.78,
            position: "absolute",
            right: 0,
            zIndex: 0,
          }}
        />

        <Link
          href="/contact"
          className="d-flex align-items-center text-decoration-none"
          style={{
            background: "#ffffff",
            borderTop: "1px solid #e8e2da",
            bottom: 0,
            color: "#374151",
            fontSize: "14px",
            fontWeight: 600,
            gap: "12px",
            left: 0,
            minHeight: "60px",
            padding: "0 28px",
            position: "absolute",
            right: 0,
            zIndex: 1,
          }}
        >
          <i className="bi bi-question-circle" aria-hidden="true" />
          Help & Support
        </Link>
      </aside>

      <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
        <header
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e8e2da",
            boxShadow: "0 6px 20px rgba(31, 41, 51, 0.04)",
            minHeight: "78px",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 py-3">
            <div className="d-flex align-items-center" style={{ gap: "28px" }}>
              <button
                className="btn btn-link p-0"
                type="button"
                aria-label="Menu"
                style={{ color: "#111827", fontSize: "21px", textDecoration: "none" }}
              >
                <i className="bi bi-list" aria-hidden="true" />
              </button>
              <h1 style={{ color: "#111827", fontSize: "16px", fontWeight: 800, margin: 0 }}>
                {currentPageTitle}
              </h1>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-3">
              <button
                className="btn btn-link position-relative p-0"
                type="button"
                aria-label="Notifications"
                style={{ color: "#111827", textDecoration: "none" }}
              >
                <i className="bi bi-bell" style={{ fontSize: "20px" }} aria-hidden="true" />
                <span
                  style={{
                    background: "#f97316",
                    border: "2px solid #ffffff",
                    borderRadius: "999px",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 800,
                    height: "18px",
                    lineHeight: "14px",
                    position: "absolute",
                    right: "-8px",
                    textAlign: "center",
                    top: "-8px",
                    width: "18px",
                  }}
                >
                  2
                </span>
              </button>

              <div
                className="d-flex align-items-center"
                style={{ gap: "12px" }}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center"
                  style={{
                    background: "#fff1e7",
                    border: "2px solid #f3c6a7",
                    borderRadius: "999px",
                    color: "#f97316",
                    height: "46px",
                    width: "46px",
                  }}
                >
                  <i className="bi bi-person" aria-hidden="true" />
                </span>
                <span className="d-flex flex-column">
                  <span style={{ color: "#111827", fontSize: "14px", fontWeight: 800, lineHeight: 1.2 }}>
                    {currentUser.name}
                  </span>
                  <span style={{ color: "#6b7280", fontSize: "12px", fontWeight: 600 }}>
                    {roleLabel[currentUser.role]}
                  </span>
                </span>
              </div>

              <div className="position-relative">
                <button
                  className="btn btn-link p-0"
                  type="button"
                  aria-expanded={devMenuOpen}
                  aria-label="Open dev user switcher"
                  onClick={() => setDevMenuOpen((isOpen) => !isOpen)}
                  style={{ color: "#111827", textDecoration: "none" }}
                >
                  <i className="bi bi-chevron-down" aria-hidden="true" />
                </button>

                {devMenuOpen ? (
                  <div
                    className="position-absolute end-0 mt-3 p-3 shadow-sm"
                    style={{
                      width: "320px",
                      background: "#ffffff",
                      border: "1px solid #e8e2da",
                      borderRadius: "18px",
                      zIndex: 200,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        letterSpacing: 0,
                        textTransform: "uppercase",
                        color: "#1f2933",
                        marginBottom: "12px",
                      }}
                    >
                      Dev user switcher
                    </div>

                    {usersError ? (
                      <p className="small text-danger mb-3">{usersError}</p>
                    ) : null}

                    {isLoadingUsers ? (
                      <p className="small text-muted mb-3">Loading users...</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {devUserGroups.map((group) => (
                          <label key={group.role} className="d-flex flex-column gap-1">
                            <span className="small fw-semibold">{group.label}</span>
                            <select
                              className="form-select form-select-sm"
                              value={getSelectedValue(group.role)}
                              onChange={(event) =>
                                handleSelectDevUser(group.role, event.target.value)
                              }
                            >
                              <option value="">{group.placeholder}</option>
                              {devUsers[group.role].map((user: DevUser) => (
                                <option key={user.id} value={user.id}>
                                  {user.name} ({user.email})
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid #e8e2da" }}>
                      <button
                        className="btn btn-sm w-100 pm-dashboard-pill-button"
                        type="button"
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e8e2da",
                          color: "#1f2933",
                        }}
                        onClick={() => {
                          setRole("null");
                          setDevMenuOpen(false);
                        }}
                      >
                        Use None / Logged out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                className="btn btn-sm pm-dashboard-pill-button"
                type="button"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e8e2da",
                  color: "#1f2933",
                }}
                onClick={() => setRole("null")}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow-1" style={{ padding: "0 12px 28px", background: "#faf7f3", minWidth: 0 }}>
          <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavIcon({ label }: { label: string }) {
  const iconClass =
    label === "Dashboard"
      ? "bi-grid-1x2"
      : label === "New Request"
        ? "bi-plus-lg"
        : label === "Maintenance"
        ? "bi-clipboard2-check"
        : label === "Properties"
          ? "bi-house-door"
          : label === "Quotes"
            ? "bi-receipt"
            : label === "Shared Documents"
              ? "bi-folder2-open"
              : label === "Approvals"
                ? "bi-check2-square"
                : label === "Users"
                  ? "bi-people"
                  : label === "Profile"
                    ? "bi-person"
                    : "bi-circle";

  return <i className={`bi ${iconClass}`} aria-hidden="true" style={{ width: "18px" }} />;
}
