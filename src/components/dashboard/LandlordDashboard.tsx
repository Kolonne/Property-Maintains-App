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
import type {
  LandlordDashboardStats,
  LandlordProperty,
  LandlordRequest as QueryLandlordRequest,
} from "@/lib/queries/landlord";
import type { RequestPriority, RequestStatus } from "@/lib/types";

type LandlordRequest = Omit<QueryLandlordRequest, "status" | "priority"> & {
  status: RequestStatus;
  priority: RequestPriority;
};

type LandlordDashboardData = {
  properties: LandlordProperty[];
  pendingCount: number;
  approvalQueue: LandlordRequest[];
  recentRequests: LandlordRequest[];
  stats: LandlordDashboardStats;
};

function formatCurrency(value: string) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function LandlordDashboard() {
  const { currentUser } = useCurrentUser();
  const [data, setData] = useState<LandlordDashboardData | null>(null);
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

        const response = await fetch(`/api/dashboard/landlord?${params}`);

        if (!response.ok) {
          throw new Error("Failed to load landlord dashboard data");
        }

        const result = (await response.json()) as LandlordDashboardData;

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

  const { properties, approvalQueue, recentRequests, stats } = data;

  return (
    <div className="pm-dashboard-page">
      <DashboardHero
        eyebrow="Landlord dashboard"
        title={`Welcome back, ${currentUser.name}`}
        subtitle="Review property updates, maintenance requests, and approvals that need your attention."
      />

      {approvalQueue.length > 0 && (
        <div
          className="pm-dashboard-approval-banner mb-4 p-3 d-flex align-items-center justify-content-between"
          style={{
            background: "#ffffff",
            border: "1px solid #f97316",
            borderLeft: "5px solid #f97316",
            borderRadius: "18px",
            boxShadow: "0 12px 28px rgba(31, 41, 51, 0.06)",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "14px", color: "#1f2933", fontWeight: 600 }}>
            <span style={{ fontWeight: 800, color: "#f97316" }}>{approvalQueue.length} request</span>{" "}
            awaiting your approval
          </div>
          <a href="#approvals" className="pm-dashboard-link">
            Review now
          </a>
        </div>
      )}

      <div className="row g-3 mb-4" style={{ marginTop: approvalQueue.length > 0 ? 0 : "-58px", position: "relative", zIndex: 2 }}>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-check2-square" label="Approvals" value={stats.approvals} helper="Awaiting approval" tone={stats.approvals > 0 ? "orange" : "green"} />
        </div>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-currency-dollar" label="Quote Value" value={formatCurrency(stats.quote_value)} helper="Awaiting approval" tone="yellow" />
        </div>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-exclamation-triangle" label="Urgent Issues" value={stats.urgent_issues} helper="High or urgent" tone={stats.urgent_issues > 0 ? "orange" : "green"} />
        </div>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-check2-circle" label="Completed" value={stats.completed_this_month} helper="This month" tone="blue" />
        </div>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-lg-8">
          <DashboardSectionCard title="Your Properties" rightHref="/properties" rightLabel="View all" className="mb-4">
            {properties.length > 0 ? (
              <div className="row g-3">
                {properties.map((property) => (
                  <div key={property.property_id} className="col-md-6">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<IconBuilding />}
                title="No properties yet"
                message="Properties assigned to your account will appear here."
              />
            )}
          </DashboardSectionCard>

          <div id="approvals" className="mb-4">
            <DashboardSectionCard title="Awaiting Your Approval" count={approvalQueue.length}>
              {approvalQueue.length > 0 ? (
                <div className="d-flex flex-column" style={{ gap: "10px" }}>
                  {approvalQueue.map((request) => (
                    <RequestSummaryRow key={request.request_id} request={request} actionLabel="Review" />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<IconCheck />} title="All caught up" message="No requests need your approval right now." />
              )}
            </DashboardSectionCard>
          </div>

          <DashboardSectionCard title="Recent Requests" rightHref="/maintenance" rightLabel="View all" className="mb-4">
            {recentRequests.length > 0 ? (
              <div className="d-flex flex-column" style={{ gap: "10px" }}>
                {recentRequests.map((request) => (
                  <RequestSummaryRow key={request.request_id} request={request} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<IconCheck />}
                title="No requests yet"
                message="Maintenance requests across your properties will appear here."
              />
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

function PropertyCard({ property }: { property: LandlordProperty }) {
  return (
    <div className="p-3 h-100 pm-dashboard-watermark" style={{ background: "#ffffff", border: "1px solid #e8e2da", borderRadius: "16px", position: "relative", overflow: "hidden" }}>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div style={{ fontSize: "16px", fontWeight: 750, color: "#1f2933" }}>{property.address}</div>
          <div style={{ fontSize: "13px", color: "#6b7280" }}>{property.suburb}</div>
        </div>
        {property.pending_requests > 0 && (
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", border: "1px solid #f97316", borderRadius: "999px", padding: "3px 9px", background: "#fff1e7" }}>
            {property.pending_requests} pending
          </span>
        )}
      </div>
      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "10px" }}>
        {property.occupied_units} of {property.total_units} units occupied
      </div>
    </div>
  );
}

function RequestSummaryRow({ request, actionLabel }: { request: LandlordRequest; actionLabel?: string }) {
  return (
    <div className="pm-dashboard-request d-flex align-items-center p-3" style={{ gap: "12px" }}>
      <div className="flex-grow-1 min-w-0">
        <div style={{ fontSize: "15px", fontWeight: 750, color: "#1f2933" }}>{request.title}</div>
        <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
          {request.property_address}{request.unit_number ? ` - Unit ${request.unit_number}` : ""} - {fmtDate(request.submitted_at)}
        </div>
      </div>
      <div className="pm-dashboard-request-actions d-flex align-items-center flex-shrink-0" style={{ gap: "8px" }}>
        <PriorityBadge priority={request.priority} />
        <StatusBadge status={request.status} />
        <Link href={`/maintenance/${request.request_id}`} className="btn btn-sm pm-dashboard-pill-button" style={{ border: "1px solid #e8e2da", color: "#1f2933", background: "#ffffff" }}>
          {actionLabel ?? "View details"}
        </Link>
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

function IconBuilding() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 22V12h6v10M3 9h18" /></svg>; }
function IconCheck() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>; }
