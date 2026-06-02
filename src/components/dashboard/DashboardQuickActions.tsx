import Link from "next/link";
import { hasPermission } from "@/lib/permissions";
import type { CurrentUser } from "@/context/UserContext";

type DashboardQuickActionsProps = {
  role: CurrentUser["role"];
};

type QuickAction = {
  label: string;
  href: string;
  screen: string;
  action: "view" | "create" | "update" | "delete" | "approve";
  icon: string;
  roles?: CurrentUser["role"][];
};

const possibleActions: QuickAction[] = [
  {
    label: "New Maintenance Request",
    href: "/maintenance/new",
    screen: "maintenance",
    action: "create",
    icon: "bi-plus-circle",
  },
  {
    label: "Emergency Contact",
    href: "/contact",
    screen: "profile",
    action: "view",
    icon: "bi-telephone",
    roles: ["tenant"],
  },
  {
    label: "Upload Evidence",
    href: "/Maintenance",
    screen: "profile",
    action: "view",
    icon: "bi bi-upload",
    roles: ["tenant"],
  },
  {
    label: "Add Property",
    href: "/properties/new",
    screen: "properties",
    action: "view",
    icon: "bi-house",
    roles: ["property_manager"],
  },
  {
    label: "Review Approvals",
    href: "/approvals",
    screen: "approvals",
    action: "view",
    icon: "bi-check2-square",
  },
  {
    label: "Contact Property Manager",
    href: "/contact",
    screen: "profile",
    action: "view",
    icon: "bi-telephone",
    roles: ["tenant", "landlord"],
  },
  {
    label: "Upload Document",
    href: "/Quotes/new",
    screen: "maintenance",
    action: "update",
    icon: "bi bi-upload",
    roles: ["property_manager", "landlord"],
  },

];

export function DashboardQuickActions({ role }: DashboardQuickActionsProps) {
  const actions = possibleActions.filter((item) => {
    if (item.roles && !item.roles.includes(role)) {
      return false;
    }

    return hasPermission(role, item.screen, item.action);
  });

  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="pm-dashboard-card p-3 p-lg-4">
      <h2
        style={{
          color: "#1f2933",
          fontSize: "20px",
          fontWeight: 800,
          marginBottom: "16px",
        }}
      >
        Quick Actions
      </h2>
      <div className="d-flex flex-column" style={{ gap: "10px" }}>
        {actions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="d-flex align-items-center justify-content-between text-decoration-none"
            style={{
              background: "#fff7f1",
              border: "1px solid #f3dfcf",
              borderRadius: "12px",
              color: "#1f2933",
              fontSize: "14px",
              fontWeight: 750,
              padding: "13px 14px",
            }}
          >
            <span className="d-flex align-items-center" style={{ gap: "12px" }}>
              <span
                className="d-inline-flex align-items-center justify-content-center"
                style={{
                  background: "#ffffff",
                  border: "1px solid #f3c6a7",
                  borderRadius: "999px",
                  color: "#f97316",
                  height: "30px",
                  width: "30px",
                }}
              >
                <i className={`bi ${item.icon}`} aria-hidden="true" />
              </span>
              {item.label}
            </span>
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function DashboardHelpCard() {
  return (
    <section className="pm-dashboard-help-card p-3 p-lg-4">
      <div style={{ position: "relative", zIndex: 1 }}>
        <h2
          style={{
            color: "#1f2933",
            fontSize: "20px",
            fontWeight: 800,
            marginBottom: "12px",
          }}
        >
          Need Help?
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: 1.6, marginBottom: "18px" }}>
          Check the help centre or contact support.
        </p>
        <Link
          href="/contact"
          className="btn pm-dashboard-pill-button"
          style={{
            background: "#ffffff",
            border: "1px solid #f97316",
            color: "#f97316",
            padding: "9px 15px",
          }}
        >
          Visit Help Centre
        </Link>
      </div>
    </section>
  );
}

export function DashboardSideRail({ role }: DashboardQuickActionsProps) {
  return (
    <div className="d-flex flex-column" style={{ gap: "16px" }}>
      <DashboardQuickActions role={role} />
      <DashboardHelpCard />
    </div>
  );
}
