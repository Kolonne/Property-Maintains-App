import { DashboardShell, type SidebarLink } from "@/components/DashboardShell";
import { RequestRow } from "@/components/ui/RequestRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusFilterBar } from "@/components/ui/StatusFilterBar";
import { getSql } from "@/lib/db";
import { getAllTenantRequests } from "@/lib/queries/tenant";

const DEMO_TENANT_ID = 5;

export const dynamic = "force-dynamic";

export default async function TenantRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status ?? "all";

  const sql = getSql();
  const userRows = (await sql`
    SELECT first_name, last_name FROM users WHERE user_id = ${DEMO_TENANT_ID}
  `) as { first_name: string; last_name: string }[];
  const user = userRows[0];
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Tenant";

  const requests = await getAllTenantRequests(DEMO_TENANT_ID, statusFilter);

  return (
    <DashboardShell user={{ name: fullName, role: "tenant" }} sidebarLinks={SIDEBAR}>
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 500, color: "#201515", marginBottom: "4px" }}>
            My Maintenance Requests
          </h1>
          <p style={{ fontSize: "16px", color: "#939084", margin: 0 }}>
            {requests.length} request{requests.length !== 1 ? "s" : ""}
            {statusFilter !== "all" && ` matching "${statusFilter.replace(/_/g, " ")}"`}
          </p>
        </div>
      </div>

      <StatusFilterBar basePath="/requests/tenant" current={statusFilter} />

      {requests.length > 0 ? (
        <div>
          {requests.map(r => (
            <RequestRow key={r.request_id} request={r} href={`/maintenance/${r.request_id}`} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={statusFilter === "all" ? "No requests yet" : "No requests match this filter"}
          message={statusFilter === "all"
            ? "Once you submit your first issue, it will appear here."
            : "Try clearing the filter or selecting a different status."}
          ctaLabel={statusFilter === "all" ? "Submit a request" : undefined}
          ctaHref={statusFilter === "all" ? "/maintenance/new" : undefined}
        />
      )}
    </DashboardShell>
  );
}

const SIDEBAR: SidebarLink[] = [
  { label: "Dashboard",   href: "/dashboard" },
  { label: "My Requests", href: "/maintenance", active: true },
  { label: "Submit New",  href: "/maintenance/new" },
  { label: "My Profile",  href: "/profile" },
];
