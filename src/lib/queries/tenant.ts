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
  status: "submitted" | "acknowledged" | "in_progress"
        | "awaiting_landlord_approval" | "landlord_approved" | "completed" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  submitted_at: string;
}

export interface TenantDashboardStats {
  open_requests: number;
  latest_update_at: string | null;
  needs_your_info: number;
  resolved: number;
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

export async function getTenantDashboardStats(userId: number): Promise<TenantDashboardStats> {
  const sql = getSql();
  const rows = (await sql`
    WITH visible_requests AS (
      SELECT mr.*
      FROM maintenance_requests mr
      WHERE EXISTS (
        SELECT 1
        FROM tenancies t
        WHERE t.unit_id = mr.unit_id
          AND t.tenant_id = ${userId}
          AND t.status = 'active'
      )
    ),
    request_updates AS (
      SELECT
        vr.request_id,
        GREATEST(
          vr.submitted_at,
          COALESCE(vr.acknowledged_at, vr.submitted_at),
          COALESCE(vr.in_progress_at, vr.submitted_at),
          COALESCE(vr.awaiting_landlord_approval_at, vr.submitted_at),
          COALESCE(vr.landlord_approved_at, vr.submitted_at),
          COALESCE(vr.completed_at, vr.submitted_at),
          COALESCE(vr.closed_at, vr.submitted_at),
          COALESCE(MAX(c.created_at), vr.submitted_at),
          COALESCE(MAX(wo.created_at), vr.submitted_at),
          COALESCE(MAX(wo.completed_at), vr.submitted_at)
        ) AS latest_update_at
      FROM visible_requests vr
      LEFT JOIN comments c ON c.request_id = vr.request_id AND c.is_internal = FALSE
      LEFT JOIN work_orders wo ON wo.request_id = vr.request_id
      GROUP BY
        vr.request_id,
        vr.submitted_at,
        vr.acknowledged_at,
        vr.in_progress_at,
        vr.awaiting_landlord_approval_at,
        vr.landlord_approved_at,
        vr.completed_at,
        vr.closed_at
    )
    SELECT
      COUNT(*) FILTER (
        WHERE status IN (
          'submitted',
          'acknowledged',
          'in_progress',
          'awaiting_landlord_approval',
          'landlord_approved'
        )
      )::int AS open_requests,
      MAX(ru.latest_update_at) AS latest_update_at,
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1
          FROM comments c
          JOIN users u ON u.user_id = c.user_id
          WHERE c.request_id = visible_requests.request_id
            AND c.is_internal = FALSE
            AND u.role <> 'tenant'
            AND (
              c.comment_text ILIKE '%please confirm%'
              OR c.comment_text ILIKE '%more info%'
              OR c.comment_text ILIKE '%information%'
              OR c.comment_text ILIKE '%photo%'
            )
            AND c.created_at > COALESCE(
              (
                SELECT MAX(tc.created_at)
                FROM comments tc
                WHERE tc.request_id = visible_requests.request_id
                  AND tc.user_id = ${userId}
                  AND tc.is_internal = FALSE
              ),
              '1970-01-01'::timestamptz
            )
        )
      )::int AS needs_your_info,
      COUNT(*) FILTER (WHERE status IN ('completed', 'closed'))::int AS resolved
    FROM visible_requests
    LEFT JOIN request_updates ru ON ru.request_id = visible_requests.request_id
  `) as TenantDashboardStats[];

  return rows[0] ?? {
    open_requests: 0,
    latest_update_at: null,
    needs_your_info: 0,
    resolved: 0,
  };
}
