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
