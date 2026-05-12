import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { RequestPriority, RequestStatus } from "@/lib/types";

type LandlordRequest = {
  request_id: number;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  submitted_at: string;
  property_address: string;
  unit_number: string | null;
};

const properties = [
  { property_id: 1, address: "Sunset Apartments", suburb: "Rockhampton", total_units: 8, occupied_units: 7, pending_requests: 2 },
  { property_id: 2, address: "City Heights", suburb: "Brisbane", total_units: 12, occupied_units: 11, pending_requests: 1 },
];

const approvalQueue: LandlordRequest[] = [
  {
    request_id: 4,
    title: "Balcony door difficult to open",
    status: "awaiting_landlord_approval",
    priority: "urgent",
    submitted_at: "2026-05-06",
    property_address: "Sunset Apartments",
    unit_number: "A-102",
  },
];

const recentRequests: LandlordRequest[] = [
  ...approvalQueue,
  {
    request_id: 5,
    title: "Air conditioner not cooling",
    status: "in_progress",
    priority: "medium",
    submitted_at: "2026-05-04",
    property_address: "City Heights",
    unit_number: "B-204",
  },
];

export default function LandlordDashboard() {
  const totalUnits = properties.reduce((sum, property) => sum + property.total_units, 0);
  const occupiedUnits = properties.reduce((sum, property) => sum + property.occupied_units, 0);
  const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  return (
    <>
      <div className="mb-4">
        <h1 style={{ fontSize: "32px", fontWeight: 500, color: "#201515", marginBottom: "4px" }}>
          Landlord Dashboard
        </h1>
        <p style={{ fontSize: "16px", color: "#939084", margin: 0 }}>
          Review property performance and approval requests.
        </p>
      </div>

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
            <span style={{ fontWeight: 700, color: "#ff4f00" }}>{approvalQueue.length} request</span>{" "}
            awaiting your approval
          </div>
          <a href="#approvals" style={{ fontSize: "13px", fontWeight: 600, color: "#ff4f00" }}>
            Review now
          </a>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard icon={<IconBuilding />} title="Properties" value={properties.length} href="/properties" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon={<IconUnits />} title="Total Units" value={totalUnits} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon={<IconAlert />} title="Pending" value={approvalQueue.length} emphasised={approvalQueue.length > 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon={<IconOccupancy />} title="Occupancy" value={`${occupancyPct}%`} />
        </div>
      </div>

      <SectionHeader title="Your Properties" rightHref="/properties" rightLabel="View all" />
      <div className="row g-3 mb-5">
        {properties.map((property) => (
          <div key={property.property_id} className="col-md-6 col-lg-4">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>

      <div id="approvals" className="mb-5">
        <SectionHeader title="Awaiting Your Approval" count={approvalQueue.length} />
        {approvalQueue.length > 0 ? (
          <div className="d-flex flex-column" style={{ gap: "8px" }}>
            {approvalQueue.map((request) => (
              <RequestSummaryRow key={request.request_id} request={request} actionLabel="Review" />
            ))}
          </div>
        ) : (
          <EmptyState icon={<IconCheck />} title="All caught up" message="No requests need your approval right now." />
        )}
      </div>

      <SectionHeader title="Recent Requests" rightHref="/maintenance" rightLabel="View all" />
      <div className="d-flex flex-column mb-4" style={{ gap: "8px" }}>
        {recentRequests.map((request) => (
          <RequestSummaryRow key={request.request_id} request={request} />
        ))}
      </div>
    </>
  );
}

function PropertyCard({ property }: { property: (typeof properties)[number] }) {
  const pct = property.total_units > 0 ? Math.round((property.occupied_units / property.total_units) * 100) : 0;

  return (
    <div className="p-3 h-100" style={{ background: "#fffefb", border: "1px solid #c5c0b1", borderRadius: "5px" }}>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#201515" }}>{property.address}</div>
          <div style={{ fontSize: "13px", color: "#939084" }}>{property.suburb}</div>
        </div>
        {property.pending_requests > 0 && (
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#ff4f00", border: "1px solid #ff4f00", borderRadius: "3px", padding: "2px 8px" }}>
            {property.pending_requests} pending
          </span>
        )}
      </div>
      <div style={{ fontSize: "13px", color: "#939084", marginBottom: "10px" }}>
        {property.total_units} units
      </div>
      <div style={{ height: "4px", background: "#eceae3", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#c5c0b1" }} />
      </div>
    </div>
  );
}

function RequestSummaryRow({ request, actionLabel }: { request: LandlordRequest; actionLabel?: string }) {
  return (
    <div className="d-flex align-items-center p-3" style={{ background: "#fffefb", border: "1px solid #c5c0b1", borderRadius: "5px", gap: "12px" }}>
      <div className="flex-grow-1 min-w-0">
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#201515" }}>{request.title}</div>
        <div style={{ fontSize: "13px", color: "#939084", marginTop: "2px" }}>
          {request.property_address}{request.unit_number ? ` - Unit ${request.unit_number}` : ""} - {fmtDate(request.submitted_at)}
        </div>
      </div>
      <div className="d-flex align-items-center flex-shrink-0" style={{ gap: "8px" }}>
        <PriorityBadge priority={request.priority} />
        <StatusBadge status={request.status} />
        {actionLabel && (
          <Link href={`/maintenance/${request.request_id}`} className="btn btn-sm btn-outline-secondary">
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, count, rightHref, rightLabel }: { title: string; count?: number; rightHref?: string; rightLabel?: string }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#201515", margin: 0 }}>
        {title}{count !== undefined ? ` (${count})` : ""}
      </h2>
      {rightHref && rightLabel && <Link href={rightHref} style={{ color: "#36342e", fontSize: "14px" }}>{rightLabel}</Link>}
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

function IconBuilding() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 22V12h6v10M3 9h18" /></svg>; }
function IconUnits() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function IconAlert() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>; }
function IconOccupancy() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>; }
function IconCheck() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>; }
