/**
 * Landlord Dashboard
 * Strictly Zapier design rules:
 * - Cream/sand/charcoal/orange only
 * - No pastel icon bg, no coloured progress bars, no rainbow badges
 * - Orange accent only on: approval queue, urgent items, active CTA
 */

import Link from "next/link";
import { DashboardShell, type SidebarLink } from "@/components/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSql } from "@/lib/db";
import {
  getLandlordProperties,
  getLandlordPendingCount,
  getApprovalQueue,
  getLandlordRecentRequests,
} from "@/lib/queries/landlord";

// TODO: replace with session once auth is wired
const DEMO_LANDLORD_ID = 1; // landlord@example.com — Linda Larson

export const dynamic = "force-dynamic";

export default async function LandlordDashboardPage() {
  const sql = getSql();

  // Landlord identity
  const userRows = (await sql`
    SELECT first_name, last_name FROM users WHERE user_id = ${DEMO_LANDLORD_ID}
  `) as { first_name: string; last_name: string }[];
  const user = userRows[0];
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Landlord";

  // Dashboard data
  const [properties, pendingCount, approvalQueue, recentRequests] = await Promise.all([
    getLandlordProperties(DEMO_LANDLORD_ID),
    getLandlordPendingCount(DEMO_LANDLORD_ID),
    getApprovalQueue(DEMO_LANDLORD_ID),
    getLandlordRecentRequests(DEMO_LANDLORD_ID, 5),
  ]);

  const totalUnits   = properties.reduce((s, p) => s + p.total_units, 0);
  const occupiedUnits = properties.reduce((s, p) => s + p.occupied_units, 0);
  const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  return (
    <DashboardShell user={{ name: fullName, role: "landlord" }} sidebarLinks={SIDEBAR}>

      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-4">
        <h1 style={{ fontSize: "32px", fontWeight: 500, color: "#201515", marginBottom: "4px" }}>
          Landlord Dashboard
        </h1>
        <p style={{ fontSize: "16px", color: "#939084", margin: 0 }}>
          Welcome back, {user?.first_name ?? "landlord"}
        </p>
      </div>

      {/* ── Approval queue alert (only shown if queue > 0) ── */}
      {approvalQueue.length > 0 && (
        <div
          className="mb-4 p-3 d-flex align-items-center justify-content-between"
          style={{
            background: "#fffefb",
            border: "1px solid #ff4f00",
            borderLeft: "4px solid #ff4f00",
            borderRadius: "5px",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "14px", color: "#201515", fontWeight: 500 }}>
            <span style={{ fontWeight: 700, color: "#ff4f00" }}>
              {approvalQueue.length} request{approvalQueue.length > 1 ? "s" : ""}
            </span>{" "}
            awaiting your approval
          </div>
          <a
            href="#approvals"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#ff4f00",
              textDecoration: "none",
              borderBottom: "1px solid #ff4f00",
              whiteSpace: "nowrap",
            }}
          >
            Review now →
          </a>
        </div>
      )}

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard icon={<IconBuilding />} title="Properties" value={properties.length} href="/properties" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon={<IconUnits />} title="Total Units" value={totalUnits} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon={<IconAlert />}
            title="Pending"
            value={pendingCount}
            emphasised={pendingCount > 0}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon={<IconOccupancy />}
            title="Occupancy"
            value={`${occupancyPct}%`}
            emphasised={false}
          />
        </div>
      </div>

      {/* ── Properties grid ──────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#201515", margin: 0 }}>
          Your Properties
        </h2>
        <Link
          href="/properties"
          style={{ fontSize: "14px", fontWeight: 500, color: "#36342e", textDecoration: "none", borderBottom: "1px solid #c5c0b1", paddingBottom: "1px" }}
        >
          View all →
        </Link>
      </div>

      <div className="row g-3 mb-5">
        {properties.map((p) => (
          <div key={p.property_id} className="col-md-6 col-lg-4">
            <PropertyCard property={p} />
          </div>
        ))}
        {properties.length === 0 && (
          <div className="col-12">
            <EmptyState icon={<IconBuilding />} title="No properties yet" message="Properties assigned to your account will appear here." />
          </div>
        )}
      </div>

      {/* ── Approval queue ───────────────────────────────── */}
      <div id="approvals" className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#201515", margin: 0 }}>
            Awaiting Your Approval
          </h2>
          <span
            style={{
              fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px",
              textTransform: "uppercase", color: "#939084",
            }}
          >
            {approvalQueue.length} item{approvalQueue.length !== 1 ? "s" : ""}
          </span>
        </div>

        {approvalQueue.length > 0 ? (
          <div className="d-flex flex-column" style={{ gap: "8px" }}>
            {approvalQueue.map((r) => (
              <ApprovalRow key={r.request_id} request={r} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<IconCheck />}
            title="All caught up"
            message="No requests need your approval right now."
          />
        )}
      </div>

      {/* ── Recent requests ──────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#201515", margin: 0 }}>
          Recent Requests
        </h2>
        <Link
          href="/requests/landlord"
          style={{ fontSize: "14px", fontWeight: 500, color: "#36342e", textDecoration: "none", borderBottom: "1px solid #c5c0b1", paddingBottom: "1px" }}
        >
          View all →
        </Link>
      </div>

      {recentRequests.length > 0 ? (
        <div className="d-flex flex-column mb-4" style={{ gap: "8px" }}>
          {recentRequests.map((r) => (
            <div
              key={r.request_id}
              className="d-flex align-items-center p-3"
              style={{
                background: "#fffefb",
                border: "1px solid #c5c0b1",
                borderRadius: "5px",
                gap: "12px",
              }}
            >
              <div className="flex-grow-1 min-w-0">
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#201515" }}>
                  {r.title}
                </div>
                <div style={{ fontSize: "13px", color: "#939084", marginTop: "2px" }}>
                  {r.property_address}{r.unit_number ? ` · Unit ${r.unit_number}` : ""} · {fmtDate(r.submitted_at)}
                </div>
              </div>
              <div className="d-flex align-items-center flex-shrink-0" style={{ gap: "8px" }}>
                <PriorityBadge priority={r.priority as any} />
                <StatusBadge status={r.status as any} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<IconWrench />} title="No requests yet" message="Maintenance requests across your properties will appear here." />
      )}

      {/* ── Submit new request (per Rebekah's feedback) ── */}
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
          Submit a maintenance request on behalf of a tenant
        </span>
      </div>

    </DashboardShell>
  );
}

// ── PropertyCard ────────────────────────────────────────────────────
function PropertyCard({ property: p }: { property: import("@/lib/queries/landlord").LandlordProperty }) {
  const pct = p.total_units > 0 ? Math.round((p.occupied_units / p.total_units) * 100) : 0;
  return (
    <div
      className="p-3 h-100"
      style={{
        background: "#fffefb",
        border: "1px solid #c5c0b1",
        borderRadius: "5px",
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#201515" }}>
            {p.address}
          </div>
          {p.suburb && (
            <div style={{ fontSize: "13px", color: "#939084" }}>{p.suburb}</div>
          )}
        </div>
        {p.pending_requests > 0 && (
          <span
            style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.4px",
              textTransform: "uppercase", color: "#ff4f00",
              border: "1px solid #ff4f00", borderRadius: "3px",
              padding: "2px 8px", whiteSpace: "nowrap",
            }}
          >
            {p.pending_requests} pending
          </span>
        )}
      </div>

      {/* Units */}
      <div style={{ fontSize: "13px", color: "#939084", marginBottom: "10px" }}>
        {p.total_units} unit{p.total_units !== 1 ? "s" : ""}
      </div>

      {/* Occupancy bar — warm sand, no green */}
      <div style={{ marginBottom: "10px" }}>
        <div className="d-flex justify-content-between mb-1">
          <span style={{ fontSize: "12px", color: "#939084", fontWeight: 500 }}>Occupied</span>
          <span style={{ fontSize: "12px", color: "#36342e", fontWeight: 600 }}>
            {p.occupied_units}/{p.total_units}
          </span>
        </div>
        <div
          style={{
            height: "4px",
            background: "#eceae3",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pct === 100 ? "#7d8a6a" : "#c5c0b1",
              borderRadius: "2px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/properties/${p.property_id}`}
        className="d-block text-center py-2"
        style={{
          fontSize: "13px", fontWeight: 600, color: "#36342e",
          border: "1px solid #c5c0b1", borderRadius: "4px",
          textDecoration: "none", background: "#fffdf9",
        }}
      >
        View Details
      </Link>
    </div>
  );
}

// ── ApprovalRow ─────────────────────────────────────────────────────
function ApprovalRow({ request: r }: { request: import("@/lib/queries/landlord").LandlordRequest }) {
  return (
    <div
      className="d-flex align-items-center p-3"
      style={{
        background: "#fffefb",
        border: "1px solid #ff4f00",
        borderLeft: "3px solid #ff4f00",
        borderRadius: "5px",
        gap: "12px",
      }}
    >
      <div className="flex-grow-1 min-w-0">
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#201515" }}>
          {r.title}
        </div>
        <div style={{ fontSize: "13px", color: "#939084", marginTop: "2px" }}>
          {r.property_address}{r.unit_number ? ` · Unit ${r.unit_number}` : ""} · Submitted {fmtDate(r.submitted_at)}
        </div>
      </div>
      <div className="d-flex align-items-center flex-shrink-0" style={{ gap: "8px" }}>
        <PriorityBadge priority={r.priority as any} />
        <Link
          href={`/requests/${r.request_id}`}
          className="btn btn-sm"
          style={{
            background: "#eceae3", color: "#36342e",
            border: "1px solid #c5c0b1", borderRadius: "4px",
            fontWeight: 600, fontSize: "13px", padding: "5px 12px",
          }}
        >
          Review
        </Link>
        <Link
          href={`/requests/${r.request_id}/approve`}
          className="btn btn-sm"
          style={{
            background: "#201515", color: "#fffefb",
            border: "1px solid #201515", borderRadius: "4px",
            fontWeight: 600, fontSize: "13px", padding: "5px 12px",
          }}
        >
          Approve
        </Link>
      </div>
    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

const SIDEBAR: SidebarLink[] = [
  { label: "Dashboard",   href: "/dashboard/landlord", active: true },
  { label: "Properties",  href: "/properties" },
  { label: "Approvals",   href: "#approvals" },
  { label: "All Requests",href: "/requests/landlord" },
  { label: "New Request", href: "/requests/new" },
  { label: "My Profile",  href: "/profile" },
];

// ── icons ────────────────────────────────────────────────────────────
function IconBuilding()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10M3 9h18"/></svg>; }
function IconUnits()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function IconAlert()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>; }
function IconOccupancy() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>; }
function IconCheck()     { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>; }
function IconWrench()    { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z"/></svg>; }
