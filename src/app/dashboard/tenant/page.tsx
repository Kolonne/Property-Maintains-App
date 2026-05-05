/**
 * Tenant Dashboard
 *
 * Hard-codes the tenant user_id for now (auth not built yet).
 * Switch to session-based ID once login is implemented.
 */

import Link from "next/link";
import { DashboardShell, type SidebarLink } from "@/components/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { RequestRow } from "@/components/ui/RequestRow";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getTenantOverview,
  getRecentRequests,
  getActiveIssueCount,
} from "@/lib/queries/tenant";

// TODO: replace with session lookup once auth is wired
const DEMO_TENANT_ID = 5; // tenant3@example.com (Sara Occupant) — most seeded data

export const dynamic = "force-dynamic"; // always fresh from the DB

export default async function TenantDashboardPage() {
  const overview = await getTenantOverview(DEMO_TENANT_ID);
  const recent = await getRecentRequests(DEMO_TENANT_ID, 5);
  const activeIssues = await getActiveIssueCount(DEMO_TENANT_ID);

  if (!overview) {
    return (
      <DashboardShell
        user={{ name: "Tenant", role: "tenant" }}
        sidebarLinks={SIDEBAR}
      >
        <EmptyState
          title="Account not found"
          message={`No tenant found with user_id = ${DEMO_TENANT_ID}. Have you run npm run db:seed?`}
        />
      </DashboardShell>
    );
  }

  const fullName = [overview.first_name, overview.last_name].filter(Boolean).join(" ") || "Tenant";
  const managerName = [overview.manager_first_name, overview.manager_last_name].filter(Boolean).join(" ");

  return (
    <DashboardShell
      user={{ name: fullName, role: "tenant" }}
      sidebarLinks={SIDEBAR}
    >
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 500, color: "#201515", marginBottom: "4px" }}>
            Tenant Dashboard
          </h1>
          <p style={{ fontSize: "16px", color: "#939084", margin: 0 }}>
            Welcome back, {overview.first_name ?? "tenant"}
          </p>
        </div>
      </div>

      {/* ── Property card ───────────────────────────────────── */}
      <div
        className="mb-4 p-4"
        style={{
          background: "#fffefb",
          border: "1px solid #c5c0b1",
          borderRadius: "8px",
        }}
      >
        <div className="row g-3 align-items-center">
          <div className="col-md-8">
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#939084",
                marginBottom: "8px",
              }}
            >
              Your Property
            </div>
            <div style={{ fontSize: "20px", fontWeight: 600, color: "#201515" }}>
              {overview.property_address ?? "No property assigned"}
              {overview.unit_number && (
                <span style={{ color: "#939084", fontWeight: 500 }}> · Unit {overview.unit_number}</span>
              )}
            </div>
            {overview.property_suburb && (
              <div style={{ fontSize: "14px", color: "#36342e", marginTop: "4px" }}>
                {overview.property_suburb}
              </div>
            )}
            {(overview.lease_start || overview.lease_end) && (
              <div style={{ fontSize: "13px", color: "#939084", marginTop: "8px" }}>
                Lease: {fmtDate(overview.lease_start)} → {fmtDate(overview.lease_end)}
              </div>
            )}
          </div>

          {managerName && (
            <div className="col-md-4 text-md-end">
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#939084",
                  marginBottom: "4px",
                }}
              >
                Property Manager
              </div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#201515" }}>
                {managerName}
              </div>
              {overview.manager_email && (
                <div style={{ fontSize: "13px", color: "#36342e", marginTop: "2px" }}>
                  {overview.manager_email}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick stats / actions ──────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatCard
            icon={<IconPlus />}
            title="New Request"
            subtitle="Submit maintenance issue"
            href="/requests/new"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            icon={<IconList />}
            title="View All Requests"
            subtitle="Track your submissions"
            href="/requests"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            icon={<IconAlert />}
            title="Active Issues"
            value={activeIssues}
            subtitle={activeIssues === 1 ? "1 open request" : `${activeIssues} open requests`}
            emphasised={activeIssues > 0}
          />
        </div>
      </div>

      {/* ── Recent maintenance requests ────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#201515", margin: 0 }}>
          Recent Maintenance Requests
        </h2>
        <Link
          href="/requests"
          style={{
            color: "#36342e",
            fontWeight: 500,
            fontSize: "14px",
            textDecoration: "none",
            borderBottom: "1px solid #c5c0b1",
            paddingBottom: "1px",
          }}
        >
          View all →
        </Link>
      </div>

      {recent.length > 0 ? (
        <div className="mb-4">
          {recent.map((r) => (
            <RequestRow
              key={r.request_id}
              request={r}
              href={`/requests/${r.request_id}`}
            />
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <EmptyState
            icon={<IconWrench />}
            title="No maintenance requests yet"
            message="Once you submit your first issue, it'll appear here."
            ctaLabel="Submit your first request"
            ctaHref="/requests/new"
          />
        </div>
      )}

      {/* ── Maintenance tips ───────────────────────────────── */}
      <div
        className="p-4"
        style={{
          background: "#fffdf9",
          border: "1px solid #c5c0b1",
          borderLeft: "3px solid #ff4f00",
          borderRadius: "5px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#939084",
            marginBottom: "6px",
          }}
        >
          Maintenance Tips
        </div>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#36342e", fontSize: "14px", lineHeight: 1.7 }}>
          <li>Include photos when submitting requests for faster processing</li>
          <li>For emergencies (gas leaks, floods), call the emergency hotline: <strong>(555) 123-4567</strong></li>
          <li>Regular filter changes help prevent HVAC issues</li>
        </ul>
      </div>
    </DashboardShell>
  );
}

// ── helpers ─────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

const SIDEBAR: SidebarLink[] = [
  { label: "Dashboard",   href: "/dashboard/tenant", active: true },
  { label: "My Requests", href: "/requests" },
  { label: "Submit New",  href: "/requests/new" },
  { label: "My Profile",  href: "/profile" },
];

// ── inline SVG icons (no extra dependency) ─────────────────
function IconPlus()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>; }
function IconList()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>; }
function IconAlert()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>; }
function IconWrench() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z"/></svg>; }
