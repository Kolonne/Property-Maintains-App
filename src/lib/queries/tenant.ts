import { getSql } from "@/lib/db";

export interface TenantOverview {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  unit_id: number | null;
  property_address: string | null;
  property_suburb: string | null;
  unit_number: string | null;
  lease_start: string | null;
  lease_end: string | null;
  manager_first_name: string | null;
  manager_last_name: string | null;
  manager_email: string | null;
}

export async function getTenantOverview(userId: number): Promise<TenantOverview | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      un.unit_id,
      p.address      AS property_address,
      p.suburb       AS property_suburb,
      un.unit_number,
      t.lease_start,
      t.lease_end,
      m.first_name   AS manager_first_name,
      m.last_name    AS manager_last_name,
      m.email        AS manager_email
    FROM users u
    LEFT JOIN tenancies t  ON t.tenant_id = u.user_id AND t.status = 'active'
    LEFT JOIN units un     ON un.unit_id = t.unit_id
    LEFT JOIN properties p ON p.property_id = un.property_id
    LEFT JOIN users m      ON m.user_id = p.manager_id
    WHERE u.user_id = ${userId}
    LIMIT 1
  `) as TenantOverview[];
  return rows[0] ?? null;
}

export interface TenantRequestSummary {
  request_id: number;
  title: string;
  status: "submitted" | "acknowledged" | "in_progress" | "awaiting_parts"
        | "awaiting_landlord_approval" | "landlord_approved" | "completed" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  submitted_at: string;
}

export async function getRecentRequests(userId: number, limit = 5): Promise<TenantRequestSummary[]> {
  const sql = getSql();
  return (await sql`
    SELECT mr.request_id, mr.title, mr.status, mr.priority, mr.submitted_at
    FROM maintenance_requests mr
    WHERE EXISTS (
      SELECT 1
      FROM tenancies t
      WHERE t.unit_id = mr.unit_id
        AND t.tenant_id = ${userId}
        AND t.status = 'active'
    )
    ORDER BY mr.submitted_at DESC
    LIMIT ${limit}
  `) as TenantRequestSummary[];
}

export async function getActiveIssueCount(userId: number): Promise<number> {
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count
    FROM maintenance_requests mr
    WHERE EXISTS (
      SELECT 1
      FROM tenancies t
      WHERE t.unit_id = mr.unit_id
        AND t.tenant_id = ${userId}
        AND t.status = 'active'
    )
      AND mr.status NOT IN ('completed', 'closed')
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}

// full list (with optional status filter) for /requests/tenant
export async function getAllTenantRequests(userId: number, statusFilter?: string): Promise<TenantRequestSummary[]> {
  const sql = getSql();
  if (statusFilter && statusFilter !== "all") {
    return (await sql`
      SELECT mr.request_id, mr.title, mr.status, mr.priority, mr.submitted_at
      FROM maintenance_requests mr
      WHERE EXISTS (
        SELECT 1
        FROM tenancies t
        WHERE t.unit_id = mr.unit_id
          AND t.tenant_id = ${userId}
          AND t.status = 'active'
      )
        AND mr.status = ${statusFilter}
      ORDER BY mr.submitted_at DESC
    `) as TenantRequestSummary[];
  }
  return (await sql`
    SELECT mr.request_id, mr.title, mr.status, mr.priority, mr.submitted_at
    FROM maintenance_requests mr
    WHERE EXISTS (
      SELECT 1
      FROM tenancies t
      WHERE t.unit_id = mr.unit_id
        AND t.tenant_id = ${userId}
        AND t.status = 'active'
    )
    ORDER BY mr.submitted_at DESC
  `) as TenantRequestSummary[];
}
