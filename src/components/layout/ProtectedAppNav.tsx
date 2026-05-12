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
};

const navItems: ProtectedNavLink[] = [
  { label: "Dashboard", href: "/dashboard", screen: "dashboard", action: "view", exactMatch: true },
  { label: "Maintenance", href: "/maintenance", screen: "maintenance", action: "view" },
  { label: "New Request", href: "/maintenance/new", screen: "maintenance", action: "create", exactMatch: true },
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

            <span className="small text-muted me-2">
              {currentUser.name}
              {currentUser.email ? ` · ${currentUser.email}` : ""}
            </span>

            <button
              className="btn btn-sm btn-outline-secondary"
              type="button"
              onClick={() => setRole("null")}
            >
              Logout
            </button>

            <div className="position-relative">
              <button
                className="btn btn-sm btn-outline-secondary"
                type="button"
                aria-expanded={devMenuOpen}
                aria-label="Open dev user switcher"
                onClick={() => setDevMenuOpen((isOpen) => !isOpen)}
              >
                Dev
              </button>

              {devMenuOpen ? (
                <div
                  className="position-absolute end-0 mt-2 p-3 shadow-sm"
                  style={{
                    width: "320px",
                    background: "#fffefb",
                    border: "1px solid #c5c0b1",
                    borderRadius: "6px",
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      color: "#36342e",
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

                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid #eceae3" }}>
                    <button
                      className="btn btn-sm btn-outline-secondary w-100"
                      type="button"
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
              const active = isActivePath(pathname, item);

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
