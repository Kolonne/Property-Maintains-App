import { getSql } from "@/lib/db";

export interface LandlordProperty {
  property_id: number;
  address: string;
  suburb: string | null;
  total_units: number;
  occupied_units: number;
  pending_requests: number;
}

export interface LandlordRequest {
  request_id: number;
  title: string;
  status: string;
  priority: string;
  submitted_at: string;
  property_address: string;
  unit_number: string | null;
}

export interface LandlordDashboardStats {
  approvals: number;
  quote_value: string;
  urgent_issues: number;
  completed_this_month: number;
}

export async function getLandlordProperties(userId: number): Promise<LandlordProperty[]> {
  const sql = getSql();
  return (await sql`
    SELECT
      p.property_id,
      p.address,
      p.suburb,
      COUNT(DISTINCT u.unit_id)::int                                       AS total_units,
      COUNT(DISTINCT u.unit_id) FILTER (WHERE u.status = 'occupied')::int AS occupied_units,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status NOT IN ('completed','closed')
      )::int                                                                AS pending_requests
    FROM properties p
    LEFT JOIN units u                ON u.property_id  = p.property_id
    LEFT JOIN maintenance_requests mr ON mr.unit_id    = u.unit_id
    WHERE p.owner_id = ${userId}
    GROUP BY p.property_id, p.address, p.suburb
    ORDER BY p.property_id
  `) as LandlordProperty[];
}

export async function getLandlordPendingCount(userId: number): Promise<number> {
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(mr.request_id)::int AS count
    FROM maintenance_requests mr
    JOIN units u      ON u.unit_id      = mr.unit_id
    JOIN properties p ON p.property_id  = u.property_id
    WHERE p.owner_id = ${userId}
      AND mr.status NOT IN ('completed','closed')
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}

export async function getLandlordDashboardStats(userId: number): Promise<LandlordDashboardStats> {
  const sql = getSql();
  const rows = (await sql`
    SELECT
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status = 'awaiting_landlord_approval'
      )::int AS approvals,
      COALESCE(
        SUM(wo.estimated_cost) FILTER (
          WHERE mr.status = 'awaiting_landlord_approval'
        ),
        0
      )::text AS quote_value,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status NOT IN ('completed', 'closed')
          AND mr.priority IN ('urgent', 'high')
      )::int AS urgent_issues,
      COUNT(DISTINCT mr.request_id) FILTER (
        WHERE mr.status = 'completed'
          AND mr.completed_at >= date_trunc('month', now())
          AND mr.completed_at < date_trunc('month', now()) + INTERVAL '1 month'
      )::int AS completed_this_month
    FROM maintenance_requests mr
    JOIN units u ON u.unit_id = mr.unit_id
    JOIN properties p ON p.property_id = u.property_id
    LEFT JOIN work_orders wo ON wo.request_id = mr.request_id
    WHERE p.owner_id = ${userId}
  `) as LandlordDashboardStats[];

  return rows[0] ?? {
    approvals: 0,
    quote_value: "0",
    urgent_issues: 0,
    completed_this_month: 0,
  };
}

export async function getApprovalQueue(userId: number): Promise<LandlordRequest[]> {
  const sql = getSql();
  return (await sql`
    SELECT
      mr.request_id,
      mr.title,
      mr.status,
      mr.priority,
      mr.submitted_at,
      p.address  AS property_address,
      u.unit_number
    FROM maintenance_requests mr
    JOIN units u      ON u.unit_id     = mr.unit_id
    JOIN properties p ON p.property_id = u.property_id
    WHERE p.owner_id = ${userId}
      AND mr.status  = 'awaiting_landlord_approval'
    ORDER BY mr.submitted_at DESC
  `) as LandlordRequest[];
}

// full list with optional status filter for /requests/landlord
export async function getAllLandlordRequests(userId: number, statusFilter?: string): Promise<LandlordRequest[]> {
  const sql = getSql();
  if (statusFilter && statusFilter !== "all") {
    return (await sql`
      SELECT
        mr.request_id, mr.title, mr.status, mr.priority, mr.submitted_at,
        p.address AS property_address, u.unit_number
      FROM maintenance_requests mr
      JOIN units u      ON u.unit_id     = mr.unit_id
      JOIN properties p ON p.property_id = u.property_id
      WHERE p.owner_id = ${userId}
        AND mr.status  = ${statusFilter}
      ORDER BY mr.submitted_at DESC
    `) as LandlordRequest[];
  }
  return (await sql`
    SELECT
      mr.request_id, mr.title, mr.status, mr.priority, mr.submitted_at,
      p.address AS property_address, u.unit_number
    FROM maintenance_requests mr
    JOIN units u      ON u.unit_id     = mr.unit_id
    JOIN properties p ON p.property_id = u.property_id
    WHERE p.owner_id = ${userId}
    ORDER BY mr.submitted_at DESC
  `) as LandlordRequest[];
}

export async function getLandlordRecentRequests(userId: number, limit = 5): Promise<LandlordRequest[]> {
  const sql = getSql();
  return (await sql`
    SELECT
      mr.request_id,
      mr.title,
      mr.status,
      mr.priority,
      mr.submitted_at,
      p.address  AS property_address,
      u.unit_number
    FROM maintenance_requests mr
    JOIN units u      ON u.unit_id     = mr.unit_id
    JOIN properties p ON p.property_id = u.property_id
    WHERE p.owner_id = ${userId}
    ORDER BY mr.submitted_at DESC
    LIMIT ${limit}
  `) as LandlordRequest[];
}
