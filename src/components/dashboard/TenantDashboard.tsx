"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { RequestRow } from "@/components/ui/RequestRow";
import { useCurrentUser } from "@/context/UserContext";
import { DashboardHero } from "./DashboardHero";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { DashboardReportPhotoCard } from "./DashboardReportPhotoCard";
import { DashboardSectionCard } from "./DashboardSectionCard";
import { DashboardSideRail } from "./DashboardQuickActions";
import type {
  TenantDashboardStats,
  TenantOverview,
  TenantRequestSummary,
} from "@/lib/queries/tenant";

type TenantDashboardData = {
  overview: TenantOverview | null;
  recentRequests: TenantRequestSummary[];
  activeIssues: number;
  stats: TenantDashboardStats;
};

function formatLatestUpdate(value: string | null) {
  if (!value) {
    return "No updates";
  }

  return new Date(value).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });
}

export default function TenantDashboard() {
  const { currentUser } = useCurrentUser();
  const [data, setData] = useState<TenantDashboardData | null>(null);
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

        const response = await fetch(`/api/dashboard/tenant?${params}`);

        if (!response.ok) {
          throw new Error("Failed to load tenant dashboard data");
        }

        const result = (await response.json()) as TenantDashboardData;

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

  if (!data.overview) {
    return (
      <EmptyState
        icon={<IconWrench />}
        title="Account not found"
        message="No tenant account data is available yet. Have you run the database seed?"
      />
    );
  }

  if (!data.overview.unit_id) {
    return (
      <div className="pm-dashboard-page py-4">
        <EmptyState
          icon={<IconWrench />}
          title="No active tenancy"
          message="Your dashboard will appear once a Property Manager links your account to an active tenancy."
        />
      </div>
    );
  }

  const { overview, recentRequests, stats } = data;
  const displayName = currentUser.name !== "Tenant" ? currentUser.name : overview.first_name ?? "tenant";

  return (
    <div className="pm-dashboard-page">
      <DashboardHero
        eyebrow="Tenant dashboard"
        title={`Welcome back, ${displayName}`}
        subtitle="Track your maintenance requests, property updates, and active issues from one clear place."
      />

      <div className="row g-3 mb-4" style={{ marginTop: "-58px", position: "relative", zIndex: 2 }}>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-clipboard-plus" label="Open Requests" value={stats.open_requests} helper="Active maintenance" tone={stats.open_requests > 0 ? "orange" : "green"} />
        </div>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-clock-history" label="Latest Update" value={formatLatestUpdate(stats.latest_update_at)} helper="Most recent activity" tone="blue" />
        </div>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-chat-dots" label="Needs Your Info" value={stats.needs_your_info} helper={stats.needs_your_info > 0 ? "Reply requested" : "No action needed"} tone={stats.needs_your_info > 0 ? "yellow" : "green"} />
        </div>
        <div className="col-6 col-xl">
          <DashboardKpiCard icon="bi-check2-circle" label="Resolved" value={stats.resolved} helper="Completed or closed" tone="green" />
        </div>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-lg-8">
          <DashboardSectionCard title="Recent Maintenance Requests" rightHref="/maintenance" rightLabel="View all" className="mb-4">
            {recentRequests.length > 0 ? (
              <div>
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

function IconWrench() {
  return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z" /></svg>;
}
