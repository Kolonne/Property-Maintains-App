/**
 * Property Manager Dashboard
 * Strictly Zapier: cream/sand/charcoal/orange only.
 */

import Link from "next/link";
import { DashboardShell, type SidebarLink } from "@/components/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSql } from "@/lib/db";
import { getPMStats, getPMOpenRequests, getPMRecentCompleted } from "@/lib/queries/pm";
import type { RequestStatus, RequestPriority } from "@/lib/types";

// TODO: replace with session once auth is wired
const DEMO_PM_ID = 2; // pm@example.com — Peter Manager

export const dynamic = "force-dynamic";

export default async function PMDashboardPage() {
  const sql = getSql();

  const userRows = (await sql`
    SELECT first_name, last_name FROM users WHERE user_id = ${DEMO_PM_ID}
  `) as { first_name: string; last_name: string }[];
  const user = userRows[0];
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Manager";

  const [stats, openRequests, recentCompleted] = await Promise.all([
    getPMStats(DEMO_PM_ID),
    getPMOpenRequests(DEMO_PM_ID),
    getPMRecentCompleted(DEMO_PM_ID),
  ]);

  // Split open requests: needs-landlord first, then everything else
  const needsLandlord = openRequests.filter(r => r.status === "awaiting_landlord_approval");
  const actionable    = openRequests.filter(r => r.status !== "awaiting_landlord_approval");

  return (
    <DashboardShell user={{ name: fullName, role: "property_manager" }} sidebarLinks={SIDEBAR}>

      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-4">
        <h1 style={{ fontSize: "32px", fontWeight: 500, color: "#201515", marginBottom: "4px" }}>
          Property Manager Dashboard
        </h1>
        <p style={{ fontSize: "16px", color: "#939084", margin: 0 }}>
          Welcome back, {user?.first_name ?? "manager"}
        </p>
      </div>

      {/* ── Awaiting landlord notice ─────────────────────── */}
      {needsLandlord.length > 0 && (
        <div
          className="mb-4 p-3 d-flex align-items-center justify-content-between"
          style={{
            background: "#fffefb",
            border: "1px solid #ff4f00",
            borderLeft: "4px solid #ff4f00",
            borderRadius: "5px",
          }}
        >
          <div style={{ fontSize: "14px", color: "#201515", fontWeight: 500 }}>
            <span style={{ fontWeight: 700, color: "#ff4f00" }}>
              {needsLandlord.length} request{needsLandlord.length > 1 ? "s" : ""}
            </span>{" "}
            sent to landlord for approval — waiting on response
          </div>
          <a
            href="#needs-landlord"
            style={{
              fontSize: "13px", fontWeight: 600, color: "#ff4f00",
              textDecoration: "none", borderBottom: "1px solid #ff4f00",
              whiteSpace: "nowrap",
            }}
          >
            View →
          </a>
        </div>
      )}

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard
            icon={<IconBuilding />}
            title="Properties"
            value={stats.properties_managed}
            href="/properties"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon={<IconList />}
            title="Open Requests"
            value={stats.total_open}
            emphasised={stats.total_open > 0}
            href="/requests"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon={<IconProgress />}
            title="In Progress"
            value={stats.in_progress}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon={<IconAlert />}
            title="Awaiting LL"
            value={stats.awaiting_approval}
            emphasised={stats.awaiting_approval > 0}
          />
        </div>
      </div>

      {/* ── Action queue ─────────────────────────────────── */}
      <SectionHeader
        title="Action Queue"
        count={actionable.length}
        subtitle="Open requests that need your attention"
        rightHref="/requests"
        rightLabel="View all →"
      />

      {actionable.length > 0 ? (
        <div className="d-flex flex-column mb-5" style={{ gap: "8px" }}>
          {actionable.map(r => (
            <PMRequestRow key={r.request_id} request={r} showActions />
          ))}
        </div>
      ) : (
        <div className="mb-5">
          <EmptyState
            icon={<IconCheck />}
            title="All caught up"
            message="No open requests need your attention right now."
          />
        </div>
      )}

      {/* ── Awaiting landlord ────────────────────────────── */}
      <div id="needs-landlord">
        <SectionHeader
          title="Waiting on Landlord Approval"
          count={needsLandlord.length}
          subtitle="Sent for sign-off — no action needed from you yet"
        />
      </div>

      {needsLandlord.length > 0 ? (
        <div className="d-flex flex-column mb-5" style={{ gap: "8px" }}>
          {needsLandlord.map(r => (
            <PMRequestRow key={r.request_id} request={r} showActions={false} dimmed />
          ))}
        </div>
      ) : (
        <div className="mb-5">
          <EmptyState icon={<IconCheck />} title="None waiting" message="No requests pending landlord approval." />
        </div>
      )}

      {/* ── Recently completed ───────────────────────────── */}
      <SectionHeader
        title="Recently Completed"
        count={recentCompleted.length}
        subtitle="Last 5 resolved requests"
      />

      {recentCompleted.length > 0 ? (
        <div className="d-flex flex-column mb-4" style={{ gap: "8px" }}>
          {recentCompleted.map(r => (
            <PMRequestRow key={r.request_id} request={r} showActions={false} />
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <EmptyState icon={<IconWrench />} title="None completed yet" />
        </div>
      )}

      {/* ── New request CTA ──────────────────────────────── */}
      <div className="mt-4 pt-4" style={{ borderTop: "1px solid #eceae3" }}>
        <Link
          href="/requests/new"
          className="btn"
          style={{
            background: "#ff4f00",
            color: "#fffefb",
            border: "1px solid #ff4f00",
            borderRadius: "4px",
            fontWeight: 600,
            padding: "10px 20px",
            fontSize: "15px",
          }}
        >
          + New Request
        </Link>
        <span style={{ fontSize: "13px", color: "#939084", marginLeft: "12px" }}>
          Log a new maintenance issue on behalf of a tenant
        </span>
      </div>

    </DashboardShell>
  );
}

// ── PMRequestRow ─────────────────────────────────────────────────────
function PMRequestRow({
  request: r,
  showActions = true,
  dimmed = false,
}: {
  request: import("@/lib/queries/pm").PMRequest;
  showActions?: boolean;
  dimmed?: boolean;
}) {
  const tenantName = [r.tenant_first_name, r.tenant_last_name].filter(Boolean).join(" ") || "Unknown";
  return (
    <div
      className="d-flex align-items-center p-3"
      style={{
        background: "#fffefb",
        border: `1px solid ${dimmed ? "#eceae3" : "#c5c0b1"}`,
        borderLeft: `3px solid ${dimmed ? "#eceae3" : r.priority === "urgent" ? "#ff4f00" : "#c5c0b1"}`,
        borderRadius: "5px",
        gap: "12px",
        opacity: dimmed ? 0.75 : 1,
      }}
    >
      <div className="flex-grow-1 min-w-0">
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#201515" }}>
          {r.title}
        </div>
        <div style={{ fontSize: "13px", color: "#939084", marginTop: "2px" }}>
          {r.property_address}
          {r.unit_number ? ` · Unit ${r.unit_number}` : ""}
          {" · "}{tenantName}
          {" · "}{fmtDate(r.submitted_at)}
        </div>
      </div>

      <div className="d-flex align-items-center flex-shrink-0" style={{ gap: "8px" }}>
        <PriorityBadge priority={r.priority as RequestPriority} />
        <StatusBadge status={r.status as RequestStatus} />
        {showActions && (
          <Link
            href={`/requests/${r.request_id}`}
            className="btn btn-sm"
            style={{
              background: "#eceae3",
              color: "#36342e",
              border: "1px solid #c5c0b1",
              borderRadius: "4px",
              fontWeight: 600,
              fontSize: "13px",
              padding: "5px 12px",
            }}
          >
            Manage
          </Link>
        )}
      </div>
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────
function SectionHeader({
  title, count, subtitle, rightHref, rightLabel,
}: {
  title: string; count: number; subtitle?: string;
  rightHref?: string; rightLabel?: string;
}) {
  return (
    <div className="d-flex justify-content-between align-items-start mb-3">
      <div>
        <div className="d-flex align-items-center" style={{ gap: "8px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#201515", margin: 0 }}>
            {title}
          </h2>
          <span
            style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px",
              textTransform: "uppercase", color: "#939084",
              background: "#eceae3", borderRadius: "3px",
              padding: "2px 8px",
            }}
          >
            {count}
          </span>
        </div>
        {subtitle && (
          <div style={{ fontSize: "13px", color: "#939084", marginTop: "2px" }}>
            {subtitle}
          </div>
        )}
      </div>
      {rightHref && rightLabel && (
        <Link
          href={rightHref}
          style={{
            fontSize: "14px", fontWeight: 500, color: "#36342e",
            textDecoration: "none", borderBottom: "1px solid #c5c0b1",
            paddingBottom: "1px",
          }}
        >
          {rightLabel}
        </Link>
      )}
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

const SIDEBAR: SidebarLink[] = [
  { label: "Dashboard",    href: "/dashboard/pm",  active: true },
  { label: "All Requests", href: "/requests" },
  { label: "Properties",   href: "/properties" },
  { label: "Work Orders",  href: "/work-orders" },
  { label: "New Request",  href: "/requests/new" },
  { label: "My Profile",   href: "/profile" },
];

// ── icons ─────────────────────────────────────────────────────────────
function IconBuilding()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10M3 9h18"/></svg>; }
function IconList()      { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>; }
function IconProgress()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
function IconAlert()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>; }
function IconCheck()     { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>; }
function IconWrench()    { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z"/></svg>; }
