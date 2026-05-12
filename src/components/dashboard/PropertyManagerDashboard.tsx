"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrentUser } from "@/context/UserContext";
import type { PMRequest as QueryPMRequest, PMStats } from "@/lib/queries/pm";
import type { RequestPriority, RequestStatus } from "@/lib/types";

type PMRequest = Omit<QueryPMRequest, "status" | "priority"> & {
  status: RequestStatus;
  priority: RequestPriority;
};

type PropertyManagerDashboardData = {
  stats: PMStats;
  openRequests: PMRequest[];
  recentCompleted: PMRequest[];
};

export default function PropertyManagerDashboard() {
  const { currentUser } = useCurrentUser();
  const [data, setData] = useState<PropertyManagerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (currentUser.id !== null) {
          params.set("userId", String(currentUser.id));
        }

        const response = await fetch(
          `/api/dashboard/property-manager?${params}`
        );

        if (!response.ok) {
          throw new Error("Failed to load property manager dashboard data");
        }

        const result = (await response.json()) as PropertyManagerDashboardData;

        if (isMounted) {
          setData(result);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  if (error || !data) {
    return <p className="text-danger">{error ?? "No dashboard data available."}</p>;
  }

  const { stats, openRequests, recentCompleted } = data;
  const needsLandlord = openRequests.filter((request) => request.status === "awaiting_landlord_approval");
  const actionable = openRequests.filter((request) => request.status !== "awaiting_landlord_approval");

  return (
    <>
      <div className="mb-4">
        <h1 style={{ fontSize: "32px", fontWeight: 500, color: "#201515", marginBottom: "4px" }}>
          Property Manager Dashboard
        </h1>
        <p style={{ fontSize: "16px", color: "#939084", margin: 0 }}>
          Manage requests across properties.
        </p>
      </div>

      {needsLandlord.length > 0 && (
        <div className="mb-4 p-3 d-flex align-items-center justify-content-between" style={{ background: "#fffefb", border: "1px solid #ff4f00", borderLeft: "4px solid #ff4f00", borderRadius: "5px" }}>
          <div style={{ fontSize: "14px", color: "#201515", fontWeight: 500 }}>
            <span style={{ fontWeight: 700, color: "#ff4f00" }}>{needsLandlord.length} request</span> waiting on landlord approval
          </div>
          <a href="#needs-landlord" style={{ color: "#ff4f00", fontSize: "13px", fontWeight: 600 }}>View</a>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard icon={<IconBuilding />} title="Properties" value={stats.properties_managed} href="/properties" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon={<IconList />} title="Open Requests" value={stats.total_open} emphasised={stats.total_open > 0} href="/maintenance" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon={<IconProgress />} title="In Progress" value={stats.in_progress} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon={<IconAlert />} title="Awaiting LL" value={stats.awaiting_approval} emphasised={stats.awaiting_approval > 0} />
        </div>
      </div>

      <SectionHeader title="Action Queue" count={actionable.length} rightHref="/maintenance" rightLabel="View all" />
      {actionable.length > 0 ? (
        <div className="d-flex flex-column mb-5" style={{ gap: "8px" }}>
          {actionable.map((request) => <PMRequestRow key={request.request_id} request={request} showAction />)}
        </div>
      ) : (
        <div className="mb-5">
          <EmptyState icon={<IconCheck />} title="All caught up" message="No open requests need your attention right now." />
        </div>
      )}

      <div id="needs-landlord">
        <SectionHeader title="Waiting on Landlord Approval" count={needsLandlord.length} />
      </div>
      {needsLandlord.length > 0 ? (
        <div className="d-flex flex-column mb-5" style={{ gap: "8px" }}>
          {needsLandlord.map((request) => <PMRequestRow key={request.request_id} request={request} dimmed />)}
        </div>
      ) : (
        <div className="mb-5">
          <EmptyState icon={<IconCheck />} title="None waiting" message="No requests pending landlord approval." />
        </div>
      )}

      <SectionHeader title="Recently Completed" count={recentCompleted.length} />
      {recentCompleted.length > 0 ? (
        <div className="d-flex flex-column mb-4" style={{ gap: "8px" }}>
          {recentCompleted.map((request) => <PMRequestRow key={request.request_id} request={request} />)}
        </div>
      ) : (
        <div className="mb-4">
          <EmptyState icon={<IconCheck />} title="None completed yet" />
        </div>
      )}
    </>
  );
}

function PMRequestRow({ request, showAction = false, dimmed = false }: { request: PMRequest; showAction?: boolean; dimmed?: boolean }) {
  const tenantName =
    [request.tenant_first_name, request.tenant_last_name].filter(Boolean).join(" ") ||
    "Unknown";

  return (
    <div className="d-flex align-items-center p-3" style={{ background: "#fffefb", border: `1px solid ${dimmed ? "#eceae3" : "#c5c0b1"}`, borderRadius: "5px", gap: "12px", opacity: dimmed ? 0.75 : 1 }}>
      <div className="flex-grow-1 min-w-0">
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#201515" }}>{request.title}</div>
        <div style={{ fontSize: "13px", color: "#939084", marginTop: "2px" }}>
          {request.property_address}{request.unit_number ? ` - Unit ${request.unit_number}` : ""} - {tenantName} - {fmtDate(request.submitted_at)}
        </div>
      </div>
      <div className="d-flex align-items-center flex-shrink-0" style={{ gap: "8px" }}>
        <PriorityBadge priority={request.priority} />
        <StatusBadge status={request.status} />
        <Link href={`/maintenance/${request.request_id}`} className="btn btn-sm btn-outline-secondary">
          {showAction ? "Manage" : "View details"}
        </Link>
      </div>
    </div>
  );
}

function SectionHeader({ title, count, rightHref, rightLabel }: { title: string; count: number; rightHref?: string; rightLabel?: string }) {
  return (
    <div className="d-flex justify-content-between align-items-start mb-3">
      <h2 className="pm-section-heading" style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>{title} ({count})</h2>
      {rightHref && rightLabel && <Link href={rightHref} style={{ color: "#36342e", fontSize: "14px" }}>{rightLabel}</Link>}
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

function IconBuilding() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 22V12h6v10M3 9h18" /></svg>; }
function IconList() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>; }
function IconProgress() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>; }
function IconAlert() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>; }
function IconCheck() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>; }
