import { getSql } from "@/lib/db";

export interface PMRequest {
  request_id: number;
  title: string;
  status: string;
  priority: string;
  submitted_at: string;
  property_address: string;
  unit_number: string | null;
  tenant_first_name: string | null;
  tenant_last_name: string | null;
}

export interface PMStats {
  total_open: number;
  awaiting_approval: number;
  in_progress: number;
  properties_managed: number;
}

export async function getPMStats(userId: number): Promise<PMStats> {
  const sql = getSql();
  const rows = (await sql`
    SELECT
      COUNT(*) FILTER (WHERE mr.status NOT IN ('completed','closed'))::int   AS total_open,
      COUNT(*) FILTER (WHERE mr.status = 'awaiting_landlord_approval')::int  AS awaiting_approval,
      COUNT(*) FILTER (WHERE mr.status = 'in_progress')::int                 AS in_progress,
      COUNT(DISTINCT p.property_id)::int                                      AS properties_managed
    FROM properties p
    LEFT JOIN units u               ON u.property_id = p.property_id
    LEFT JOIN maintenance_requests mr ON mr.unit_id  = u.unit_id
    WHERE p.manager_id = ${userId}
  `) as PMStats[];
  return rows[0] ?? { total_open: 0, awaiting_approval: 0, in_progress: 0, properties_managed: 0 };
}

export async function getPMOpenRequests(userId: number): Promise<PMRequest[]> {
  const sql = getSql();
  return (await sql`
    SELECT
      mr.request_id,
      mr.title,
      mr.status,
      mr.priority,
      mr.submitted_at,
      p.address    AS property_address,
      u.unit_number,
      t.first_name AS tenant_first_name,
      t.last_name  AS tenant_last_name
    FROM maintenance_requests mr
    JOIN units u       ON u.unit_id      = mr.unit_id
    JOIN properties p  ON p.property_id  = u.property_id
    LEFT JOIN users t  ON t.user_id      = mr.reported_by
    WHERE p.manager_id = ${userId}
      AND mr.status NOT IN ('completed','closed')
    ORDER BY
      CASE mr.priority
        WHEN 'urgent' THEN 1
        WHEN 'high'   THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END,
      mr.submitted_at DESC
  `) as PMRequest[];
}

// full list with optional status filter for /requests/pm
export async function getAllPMRequests(userId: number, statusFilter?: string): Promise<PMRequest[]> {
  const sql = getSql();
  if (statusFilter && statusFilter !== "all") {
    return (await sql`
      SELECT
        mr.request_id, mr.title, mr.status, mr.priority, mr.submitted_at,
        p.address AS property_address, u.unit_number,
        t.first_name AS tenant_first_name, t.last_name AS tenant_last_name
      FROM maintenance_requests mr
      JOIN units u      ON u.unit_id      = mr.unit_id
      JOIN properties p ON p.property_id  = u.property_id
      LEFT JOIN users t ON t.user_id      = mr.reported_by
      WHERE p.manager_id = ${userId}
        AND mr.status    = ${statusFilter}
      ORDER BY mr.submitted_at DESC
    `) as PMRequest[];
  }
  return (await sql`
    SELECT
      mr.request_id, mr.title, mr.status, mr.priority, mr.submitted_at,
      p.address AS property_address, u.unit_number,
      t.first_name AS tenant_first_name, t.last_name AS tenant_last_name
    FROM maintenance_requests mr
    JOIN units u      ON u.unit_id      = mr.unit_id
    JOIN properties p ON p.property_id  = u.property_id
    LEFT JOIN users t ON t.user_id      = mr.reported_by
    WHERE p.manager_id = ${userId}
    ORDER BY mr.submitted_at DESC
  `) as PMRequest[];
}

export async function getPMRecentCompleted(userId: number): Promise<PMRequest[]> {
  const sql = getSql();
  return (await sql`
    SELECT
      mr.request_id,
      mr.title,
      mr.status,
      mr.priority,
      mr.submitted_at,
      p.address    AS property_address,
      u.unit_number,
      t.first_name AS tenant_first_name,
      t.last_name  AS tenant_last_name
    FROM maintenance_requests mr
    JOIN units u      ON u.unit_id      = mr.unit_id
    JOIN properties p ON p.property_id  = u.property_id
    LEFT JOIN users t ON t.user_id      = mr.reported_by
    WHERE p.manager_id = ${userId}
      AND mr.status IN ('completed','closed')
    ORDER BY mr.submitted_at DESC
    LIMIT 5
  `) as PMRequest[];
}
