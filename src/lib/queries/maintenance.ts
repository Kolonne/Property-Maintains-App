import { getSql } from "@/lib/db";
import type {
  MaintenanceRequest,
  RequestCategory,
  RequestPriority,
  UserRole,
} from "@/lib/types";

export type MaintenanceUnitOption = {
  unit_id: number;
  label: string;
};

export type CreateMaintenanceRequestInput = {
  unit_id: number;
  reported_by: number;
  title: string;
  description: string | null;
  category: RequestCategory | null;
  priority: RequestPriority;
};

export type MaintenanceRequestDetail = MaintenanceRequest & {
  property_address: string;
  property_suburb: string | null;
  unit_number: string | null;
  reporter_first_name: string | null;
  reporter_last_name: string | null;
  reporter_email: string;
};

type UnitOptionRow = {
  unit_id: number;
  address: string;
  suburb: string | null;
  unit_number: string | null;
};

function formatUnitLabel(row: UnitOptionRow) {
  const unitLabel = row.unit_number ? `Unit ${row.unit_number}` : "House";
  const suburb = row.suburb ? `, ${row.suburb}` : "";

  return `${row.address}${suburb} - ${unitLabel}`;
}

export async function getMaintenanceUnitOptions(
  userId: number,
  role: UserRole
): Promise<MaintenanceUnitOption[]> {
  const sql = getSql();

  if (role === "tenant") {
    const rows = (await sql`
      SELECT u.unit_id, p.address, p.suburb, u.unit_number
      FROM tenancies t
      JOIN units u ON u.unit_id = t.unit_id
      JOIN properties p ON p.property_id = u.property_id
      WHERE t.tenant_id = ${userId}
        AND t.status = 'active'
      ORDER BY p.address, u.unit_number
    `) as UnitOptionRow[];

    return rows.map((row) => ({
      unit_id: row.unit_id,
      label: formatUnitLabel(row),
    }));
  }

  if (role === "property_manager") {
    const rows = (await sql`
      SELECT u.unit_id, p.address, p.suburb, u.unit_number
      FROM units u
      JOIN properties p ON p.property_id = u.property_id
      WHERE p.manager_id = ${userId}
      ORDER BY p.address, u.unit_number
    `) as UnitOptionRow[];

    return rows.map((row) => ({
      unit_id: row.unit_id,
      label: formatUnitLabel(row),
    }));
  }

  if (role === "landlord") {
    const rows = (await sql`
      SELECT u.unit_id, p.address, p.suburb, u.unit_number
      FROM units u
      JOIN properties p ON p.property_id = u.property_id
      WHERE p.owner_id = ${userId}
      ORDER BY p.address, u.unit_number
    `) as UnitOptionRow[];

    return rows.map((row) => ({
      unit_id: row.unit_id,
      label: formatUnitLabel(row),
    }));
  }

  return [];
}

export async function createMaintenanceRequest(
  input: CreateMaintenanceRequestInput
): Promise<MaintenanceRequest> {
  const sql = getSql();

  const rows = (await sql`
    INSERT INTO maintenance_requests (
      unit_id,
      reported_by,
      title,
      description,
      category,
      priority
    )
    VALUES (
      ${input.unit_id},
      ${input.reported_by},
      ${input.title},
      ${input.description},
      ${input.category},
      ${input.priority}
    )
    RETURNING
      request_id,
      unit_id,
      reported_by,
      title,
      description,
      category,
      priority,
      status,
      submitted_at,
      acknowledged_at,
      completed_at,
      closed_at
  `) as MaintenanceRequest[];

  return rows[0];
}

export async function getMaintenanceRequestDetail(
  requestId: number,
  userId: number,
  role: UserRole
): Promise<MaintenanceRequestDetail | null> {
  const sql = getSql();

  const rows = (await sql`
    SELECT
      mr.request_id,
      mr.unit_id,
      mr.reported_by,
      mr.title,
      mr.description,
      mr.category,
      mr.priority,
      mr.status,
      mr.submitted_at,
      mr.acknowledged_at,
      mr.completed_at,
      mr.closed_at,
      p.address AS property_address,
      p.suburb AS property_suburb,
      u.unit_number,
      reporter.first_name AS reporter_first_name,
      reporter.last_name AS reporter_last_name,
      reporter.email AS reporter_email
    FROM maintenance_requests mr
    JOIN units u ON u.unit_id = mr.unit_id
    JOIN properties p ON p.property_id = u.property_id
    JOIN users reporter ON reporter.user_id = mr.reported_by
    WHERE mr.request_id = ${requestId}
      AND (
        (${role} = 'tenant' AND mr.reported_by = ${userId})
        OR (${role} = 'property_manager' AND p.manager_id = ${userId})
        OR (${role} = 'landlord' AND p.owner_id = ${userId})
      )
    LIMIT 1
  `) as MaintenanceRequestDetail[];

  return rows[0] ?? null;
}
