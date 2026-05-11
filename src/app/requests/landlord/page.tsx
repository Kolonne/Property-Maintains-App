import Link from "next/link";
import { DashboardShell, type SidebarLink } from "@/components/DashboardShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusFilterBar } from "@/components/ui/StatusFilterBar";
import { getSql } from "@/lib/db";
import { getAllLandlordRequests } from "@/lib/queries/landlord";
import type { RequestStatus, RequestPriority } from "@/lib/types";

const DEMO_LANDLORD_ID = 1;

export const dynamic = "force-dynamic";

export default async function LandlordRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status ?? "all";

  const sql = getSql();
  const userRows = (await sql`
    SELECT first_name, last_name FROM users WHERE user_id = ${DEMO_LANDLORD_ID}
  `) as { first_name: string; last_name: string }[];
  const user = userRows[0];
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Landlord";

  const requests = await getAllLandlordRequests(DEMO_LANDLORD_ID, statusFilter);

  return (
    <DashboardShell user={{ name: fullName, role: "landlord" }} sidebarLinks={SIDEBAR}>
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 500, color: "#201515", marginBottom: "4px" }}>
            Property Maintenance Requests
          </h1>
          <p style={{ fontSize: "16px", color: "#939084", margin: 0 }}>
            {requests.length} request{requests.length !== 1 ? "s" : ""}
            {statusFilter !== "all" && ` matching "${statusFilter.replace(/_/g, " ")}"`}
          </p>
        </div>
      </div>

      <StatusFilterBar basePath="/requests/landlord" current={statusFilter} />

      {requests.length > 0 ? (
        <div className="d-flex flex-column" style={{ gap: "8px" }}>
          {requests.map(r => (
            <Link key={r.request_id} href={`/requests/${r.request_id}`} style={{ textDecoration: "none" }}>
              <div
                className="d-flex align-items-center p-3"
                style={{
                  background: "#fffefb",
                  border: "1px solid #c5c0b1",
                  borderLeft: `3px solid ${r.priority === "urgent" ? "#ff4f00" : "#c5c0b1"}`,
                  borderRadius: "5px",
                  gap: "12px",
                }}
              >
                <div className="flex-grow-1 min-w-0">
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#201515" }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: "13px", color: "#939084", marginTop: "2px" }}>
                    {r.property_address}
                    {r.unit_number ? ` · Unit ${r.unit_number}` : ""}
                    {" · "}{new Date(r.submitted_at).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>
                <div className="d-flex align-items-center flex-shrink-0" style={{ gap: "8px" }}>
                  <PriorityBadge priority={r.priority as RequestPriority} />
                  <StatusBadge status={r.status as RequestStatus} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title={statusFilter === "all" ? "No requests" : "No requests match this filter"}
          message={statusFilter === "all"
            ? "Maintenance requests across your properties will appear here."
            : "Try clearing the filter or selecting a different status."}
        />
      )}
    </DashboardShell>
  );
}

const SIDEBAR: SidebarLink[] = [
  { label: "Dashboard",   href: "/dashboard/landlord" },
  { label: "Properties",  href: "/properties" },
  { label: "Approvals",   href: "/dashboard/landlord#approvals" },
  { label: "All Requests",href: "/requests/landlord", active: true },
  { label: "New Request", href: "/requests/new" },
  { label: "My Profile",  href: "/profile" },
];
