import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { RequestRow } from "@/components/ui/RequestRow";
import { StatCard } from "@/components/ui/StatCard";
import type { MaintenanceRequest } from "@/lib/types";

const recentRequests: Pick<
  MaintenanceRequest,
  "request_id" | "title" | "status" | "priority" | "submitted_at"
>[] = [
  {
    request_id: 1,
    title: "Kitchen sink leak",
    status: "submitted",
    priority: "high",
    submitted_at: "2026-05-01",
  },
  {
    request_id: 2,
    title: "Bedroom light not working",
    status: "in_progress",
    priority: "medium",
    submitted_at: "2026-05-03",
  },
];

export default function TenantDashboard() {
  const activeIssues = recentRequests.filter(
    (request) => request.status !== "completed" && request.status !== "closed"
  ).length;

  return (
    <>
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 500, color: "#201515", marginBottom: "4px" }}>
            Tenant Dashboard
          </h1>
          <p style={{ fontSize: "16px", color: "#939084", margin: 0 }}>
            Welcome back, tenant
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatCard icon={<IconPlus />} title="New Request" subtitle="Submit maintenance issue" href="/maintenance/new" />
        </div>
        <div className="col-md-4">
          <StatCard icon={<IconList />} title="View Requests" subtitle="Track your submissions" href="/maintenance" />
        </div>
        <div className="col-md-4">
          <StatCard
            icon={<IconAlert />}
            title="Active Issues"
            value={activeIssues}
            subtitle={`${activeIssues} open request${activeIssues === 1 ? "" : "s"}`}
            emphasised={activeIssues > 0}
          />
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#201515", margin: 0 }}>
          Recent Maintenance Requests
        </h2>
        <Link
          href="/maintenance"
          style={{
            color: "#36342e",
            fontWeight: 500,
            fontSize: "14px",
            textDecoration: "none",
            borderBottom: "1px solid #c5c0b1",
            paddingBottom: "1px",
          }}
        >
          View all
        </Link>
      </div>

      {recentRequests.length > 0 ? (
        <div className="mb-4">
          {recentRequests.map((request) => (
            <RequestRow
              key={request.request_id}
              request={request}
              href={`/maintenance/${request.request_id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<IconWrench />}
          title="No maintenance requests yet"
          message="Once you submit your first issue, it will appear here."
          ctaLabel="Submit your first request"
          ctaHref="/maintenance/new"
        />
      )}
    </>
  );
}

function IconPlus() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
}

function IconList() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>;
}

function IconAlert() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>;
}

function IconWrench() {
  return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z" /></svg>;
}
