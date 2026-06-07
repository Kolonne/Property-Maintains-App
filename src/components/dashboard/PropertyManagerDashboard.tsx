"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrentUser } from "@/context/UserContext";
import { DashboardHero } from "./DashboardHero";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { DashboardReportPhotoCard } from "./DashboardReportPhotoCard";
import { DashboardSectionCard } from "./DashboardSectionCard";
import { DashboardSideRail } from "./DashboardQuickActions";
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
    <div className="pm-dashboard-page">
      <DashboardHero
        eyebrow="Property manager dashboard"
        title={`Welcome back, ${currentUser.name}`}
        subtitle="Here is what is happening across your managed properties and maintenance queue."
      />

      <div className="row g-3 mb-4" style={{ marginTop: "-58px", position: "relative", zIndex: 2 }}>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-clipboard-plus" label="New Requests" value={stats.new_requests} helper={stats.new_requests > 0 ? "Requires triage" : "All clear"} tone={stats.new_requests > 0 ? "orange" : "green"} />
        </div>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-exclamation-triangle" label="Urgent" value={stats.urgent_requests} helper="Active urgent" tone={stats.urgent_requests > 0 ? "orange" : "green"} />
        </div>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-receipt" label="Awaiting Quotes" value={stats.awaiting_quotes} helper="No quote entered" tone="yellow" />
        </div>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-check-circle" label="Awaiting Landlord" value={stats.awaiting_approval} helper="Landlord approval" tone="blue" />
        </div>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-lg-8">
          <DashboardSectionCard title="Action Queue" count={actionable.length} rightHref="/maintenance" rightLabel="View all" className="mb-4">
            {actionable.length > 0 ? (
              <div className="d-flex flex-column" style={{ gap: "10px" }}>
                {actionable.map((request) => <PMRequestRow key={request.request_id} request={request} showAction />)}
              </div>
            ) : (
              <EmptyState icon={<IconCheck />} title="All caught up" message="No open requests need your attention right now." />
            )}
          </DashboardSectionCard>

          <div id="needs-landlord">
            <DashboardSectionCard title="Waiting on Landlord Approval" count={needsLandlord.length} className="mb-4">
              {needsLandlord.length > 0 ? (
                <div className="d-flex flex-column" style={{ gap: "10px" }}>
                  {needsLandlord.map((request) => <PMRequestRow key={request.request_id} request={request} dimmed />)}
                </div>
              ) : (
                <EmptyState icon={<IconCheck />} title="None waiting" message="No requests pending landlord approval." />
              )}
            </DashboardSectionCard>
          </div>

          <DashboardSectionCard title="Recently Completed" count={recentCompleted.length} className="mb-4">
            {recentCompleted.length > 0 ? (
              <div className="d-flex flex-column" style={{ gap: "10px" }}>
                {recentCompleted.map((request) => <PMRequestRow key={request.request_id} request={request} />)}
              </div>
            ) : (
              <EmptyState icon={<IconCheck />} title="None completed yet" />
            )}
          </DashboardSectionCard>
          <DashboardReportPhotoCard />
        </div>
        <div className="col-lg-4">
          <DashboardSideRail role={currentUser.role} />
        </div>
      </div>
      <div className="pm-dashboard-corner-watermark" aria-hidden="true" />
    </div>
  );
}

function PMRequestRow({ request, showAction = false, dimmed = false }: { request: PMRequest; showAction?: boolean; dimmed?: boolean }) {
  const tenantName =
    [request.tenant_first_name, request.tenant_last_name].filter(Boolean).join(" ") ||
    "Unknown";

  return (
    <div className="pm-dashboard-request d-flex align-items-center p-3" style={{ gap: "12px", opacity: dimmed ? 0.75 : 1 }}>
      <div className="flex-grow-1 min-w-0">
        <div style={{ fontSize: "15px", fontWeight: 750, color: "#1f2933" }}>{request.title}</div>
        <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
          {request.property_address}{request.unit_number ? ` - Unit ${request.unit_number}` : ""} - {tenantName} - {fmtDate(request.submitted_at)}
        </div>
      </div>
      <div className="pm-dashboard-request-actions d-flex align-items-center flex-shrink-0" style={{ gap: "8px" }}>
        <PriorityBadge priority={request.priority} />
        <StatusBadge status={request.status} />
        <Link href={`/maintenance/${request.request_id}`} className="btn btn-sm pm-dashboard-pill-button" style={{ border: "1px solid #e8e2da", color: "#1f2933", background: "#ffffff" }}>
          {showAction ? "Manage" : "View details"}
        </Link>
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

function IconCheck() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>; }
